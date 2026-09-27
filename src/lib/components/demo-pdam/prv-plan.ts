// Pressure-management (PRV) plan per zone for the Manajemen Tekanan page.
// Leakage follows FAVAD with N1 = 1.15 on the average zone pressure (AZP ≈ mean of the
// inlet and far-end pressure), integrated minute by minute over the simulated day.
// Rules: at night (23:00–05:00) the PRV lowers the inlet until the far end sits at
// 1,3 bar; a day setpoint (+0,1 bar) is only offered when the far end still has
// ≥ 1,0 bar at the morning peak. For Padasan this gives 3,4 / 3,5 bar and ≈ 310 m³/day,
// the figure quoted by the AI ribbon in data.ts.

import { BALANCE, ZONES, type ZoneId } from './data';
import { BURST, series, zoneFlow, zonePressure } from './sim';

export const N1 = 1.15;
/** far-end pressure the night setpoint aims for (bar): 0,3 bar above the Waspada threshold */
export const END_TARGET_NIGHT = 1.3;
/** the day setpoint sits this much above the night one, for daytime demand swings */
export const DAY_MARGIN = 0.1;
/** a day mode is only offered if the far end keeps ≥ this at the morning peak */
export const DAY_MODE_MIN_END = 1.0;
/** service minimum at the far end (bar) */
export const SERVICE_MIN = 0.7;
export const NIGHT = { from: 23, to: 5 };
export const isNight = (h: number) => h >= NIGHT.from || h < NIGHT.to;

export type PlanStatus = 'penuh' | 'malam' | 'tunda' | 'tidak';

export interface PrvPlan {
	zone: ZoneId;
	status: PlanStatus;
	/** night setpoint (bar); null = no PRV */
	night: number | null;
	/** day setpoint (bar); null = PRV fully open during the day */
	day: number | null;
	/** inlet pressure cut at night (bar) */
	cut: number;
	/** far-end pressure at night after the PRV (bar) */
	endNightAfter: number;
	/** lowest far-end pressure over the day with the PRV (bar) */
	endMinAfter: number;
	/** physical leakage at 03:00 before / after (L/s) */
	leakNight: number;
	leakNightAfter: number;
	/** m³/day saved in the night window, the rest of the day, and in total */
	savedNight: number;
	savedDay: number;
	saved: number;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

function setpointFn(night: number | null, day: number | null) {
	return (h: number) => (isNight(h) ? night : day) ?? Infinity;
}

/** Inlet pressure cut by the PRV at hour h (bar). */
function cutAt(z: ZoneId, h: number, sp: (h: number) => number) {
	return Math.max(0, zonePressure(z, h, 'in') - sp(h));
}

/** Leakage multiplier after cutting dP bar off the whole zone (FAVAD on AZP). */
function leakRatio(z: ZoneId, h: number, dP: number) {
	const azp = (zonePressure(z, h, 'in') + zonePressure(z, h, 'end')) / 2;
	return ((azp - dP) / azp) ** N1;
}

export function prvPlan(z: ZoneId): PrvPlan {
	const b = BALANCE[z];
	const cut = round1(Math.max(0, b.pEnd[0] - END_TARGET_NIGHT));
	const night = cut > 0 ? round1(b.pIn[0] - cut) : null;
	const day = night != null && b.pEnd[1] >= DAY_MODE_MIN_END ? round1(night + DAY_MARGIN) : null;
	const sp = setpointFn(night, day);

	let savedNight = 0;
	let savedDay = 0;
	let endMinAfter = Infinity;
	for (let m = 0; m < 1440; m++) {
		const h = m / 60;
		const dP = cutAt(z, h, sp);
		// leak (L/s) × 60 s / 1000 → m³ in this minute
		const s = zoneFlow(z, h).leak * (1 - leakRatio(z, h, dP)) * 0.06;
		if (isNight(h)) savedNight += s;
		else savedDay += s;
		endMinAfter = Math.min(endMinAfter, zonePressure(z, h, 'end') - dP);
	}
	const leakNight = zoneFlow(z, 3).leak;
	const status: PlanStatus = night == null ? 'tidak' : z === BURST.zone ? 'tunda' : day != null ? 'penuh' : 'malam';
	return {
		zone: z,
		status,
		night,
		day,
		cut,
		endNightAfter: b.pEnd[0] - cut,
		endMinAfter,
		leakNight,
		leakNightAfter: leakNight * leakRatio(z, 3, cutAt(z, 3, sp)),
		savedNight,
		savedDay,
		saved: savedNight + savedDay
	};
}

export const PRV_PLANS = Object.fromEntries(ZONES.map((z) => [z.id, prvPlan(z.id)])) as Record<ZoneId, PrvPlan>;

/** 24 h pressure curves of a zone (n samples over 0–24), with and without its PRV plan. */
export function pressureDay(z: ZoneId, n = 97) {
	const p = PRV_PLANS[z];
	const sp = setpointFn(p.night, p.day);
	return {
		pin: series((h) => zonePressure(z, h, 'in'), n),
		pend: series((h) => zonePressure(z, h, 'end'), n),
		pinPrv: series((h) => zonePressure(z, h, 'in') - cutAt(z, h, sp), n),
		pendPrv: series((h) => zonePressure(z, h, 'end') - cutAt(z, h, sp), n)
	};
}

/** Contiguous clock windows (hours) where fn(h) < limit, scanned per minute. */
export function windowsBelow(fn: (h: number) => number, limit: number) {
	const out: { from: number; to: number; min: number; minAt: number }[] = [];
	let cur: { from: number; to: number; min: number; minAt: number } | null = null;
	for (let m = 0; m <= 1440; m++) {
		const h = m / 60;
		const v = m < 1440 ? fn(h) : Infinity;
		if (v < limit) {
			if (!cur) cur = { from: h, to: h, min: v, minAt: h };
			cur.to = h;
			if (v < cur.min) {
				cur.min = v;
				cur.minAt = h;
			}
		} else if (cur) {
			out.push(cur);
			cur = null;
		}
	}
	return out;
}
