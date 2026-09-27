// Hydraulic day model for the PDAM demo. Pure functions of the clock hour
// (0…24, fractional) so the dashboard, the charts and the 3D twin agree.
// Story: the JDU Ø8" main in Gemawang bursts at 01:40, the AI flags the night-flow
// residual at 02:05, the 02:00–04:00 minimum night flow confirms it, and the
// distribution crew is verifying the spot with an acoustic correlator.
//
// `live` readings (dashboard pages) always include the burst — it happened
// "tonight". The twin's 24 h timeline replays the day, so there it starts at 01:40.

import { BALANCE, ZONES, type Asset, type SiteStatus, type ZoneId } from './data';

const TAU = Math.PI * 2;
/** Signed distance between two clock hours on the 24 h ring. */
const dh = (a: number, b: number) => ((((a - b) % 24) + 36) % 24) - 12;
const g24 = (h: number, mu: number, s: number) => Math.exp(-((dh(h, mu) / s) ** 2));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const wrap = (h: number) => ((h % 24) + 24) % 24;

/* ---------------- demand pattern ---------------- */
function rawDemand(h: number) {
	return 0.4 + 1.0 * g24(h, 6.2, 1.6) + 0.45 * g24(h, 11.8, 2.6) + 0.7 * g24(h, 17.9, 2.0) - 0.12 * g24(h, 3.1, 1.3);
}
const GRID = Array.from({ length: 289 }, (_, i) => (i / 288) * 24);
const RAW = GRID.map(rawDemand);
const RAW_MEAN = RAW.slice(0, 288).reduce((a, b) => a + b, 0) / 288;
const D_MIN = Math.min(...RAW) / RAW_MEAN;
const D_MAX = Math.max(...RAW) / RAW_MEAN;

/** Diurnal demand multiplier (daily mean = 1): night minimum ≈ 03:00, peaks ≈ 06:15 and 18:00. */
export const demand = (h: number) => rawDemand(h) / RAW_MEAN;
/** 0 at the night minimum, 1 at the morning peak. */
export const load = (h: number) => clamp01((demand(h) - D_MIN) / (D_MAX - D_MIN));

/** Relative network pressure (1 at night) and the leakage factor it drives (FAVAD N1 = 1.15, mean 1). */
const pRel = (h: number) => 1 - 0.32 * load(h);
const PF_MEAN = GRID.slice(0, 288).reduce((a, h) => a + pRel(h) ** 1.15, 0) / 288;
const leakFactor = (h: number) => pRel(h) ** 1.15 / PF_MEAN;

/* ---------------- the burst ---------------- */
export const BURST = {
	zone: 'GMW' as ZoneId,
	leak: 'LK-01',
	start: 1 + 40 / 60,
	/** leak flow at night pressure, L/s */
	flow: 18.6,
	/** hours to full flow */
	ramp: 0.15,
	/** pressure drop at full flow, bar */
	drop: { 'PT-01': 0.34, 'GMW-OUT': 0.19, 'GMW-IN': 0.06 } as Record<string, number>
};

/** 0…1 how far the burst has developed at hour h. */
export function burstOn(h: number, live = false): number {
	if (live) return 1;
	return clamp01((h - BURST.start) / BURST.ramp);
}
/** Leak flow (L/s); an orifice, so it follows √pressure. */
export function burstFlow(h: number, live = false): number {
	return BURST.flow * burstOn(h, live) * Math.sqrt(pRel(h));
}

/** Water lost to the burst between its start and hour h (m³). Live: since 01:40 tonight. */
export function burstLoss(h: number, live = false): number {
	const end = live ? BURST.start + wrap(h - BURST.start) : h;
	if (end <= BURST.start) return 0;
	let m3 = 0;
	const step = 1 / 60;
	for (let t = BURST.start; t < end; t += step) m3 += burstFlow(t, false) * Math.min(step, end - t) * 3.6;
	return m3;
}

/** Absolute hour (≤ now) at which tonight's burst started: the latest 01:40. */
export const burstAnchor = (now: number) => now - wrap(now - BURST.start);

/** Burst flow at absolute hour x (may be negative = yesterday) for a burst that started at `anchor`. */
export function burstAt(x: number, anchor: number): number {
	if (x < anchor) return 0;
	return BURST.flow * clamp01((x - anchor) / BURST.ramp) * Math.sqrt(pRel(wrap(x)));
}

export const EVENTS = [
	{ h: BURST.start, label: 'Pecah pipa JDU Ø8" Gemawang', tone: 'danger' },
	{ h: 2 + 5 / 60, label: 'AI: anomali debit malam > 3σ', tone: 'amber' },
	{ h: 4, label: 'MNF terkonfirmasi +18% · AWAS', tone: 'danger' },
	{ h: 6.5, label: 'Tim distribusi diberangkatkan', tone: 'water' },
	{ h: 8 + 10 / 60, label: 'Verifikasi korelator akustik', tone: 'water' }
] as const;

/** Index of the latest event at or before hour h (-1 before the burst). */
export function eventStage(h: number): number {
	let k = -1;
	EVENTS.forEach((e, i) => {
		if (h >= e.h) k = i;
	});
	return k;
}

/* ---------------- zone flows ---------------- */
/** LK-02: a small leak in Karanggayam that has been growing for five nights (L/s at night pressure). */
export const CREEP = { zone: 'KRG' as ZoneId, leak: 'LK-02', flow: 5.2 };

export interface ZoneFlow {
	/** the zone's own input (consumption + losses), L/s */
	net: number;
	/** inlet meter: own input + water handed on through the outlet */
	inlet: number;
	outlet: number;
	legit: number;
	leak: number;
	burst: number;
	/** small growing leak (LK-02) */
	creep: number;
	/** what the AI expects from the last 14 days (no new leaks) */
	expected: number;
}

export function zoneFlow(z: ZoneId, h: number, live = false): ZoneFlow {
	const b = BALANCE[z];
	const avg = b.siv / 86.4;
	const leakAvg = avg * b.nrw * b.realShare;
	const legit = (avg - leakAvg) * demand(h);
	const leak = leakAvg * leakFactor(h);
	const burst = z === BURST.zone ? burstFlow(h, live) : 0;
	const creep = z === CREEP.zone ? CREEP.flow * Math.sqrt(pRel(h)) : 0;
	const outlet = b.outAvg * demand(h);
	const expected = legit + leak;
	const net = expected + burst + creep;
	return { net, inlet: net + outlet, outlet, legit, leak, burst, creep, expected };
}

/** System input volume rate (sum of every zone's own input), L/s. */
export function systemFlow(h: number, live = false): number {
	return ZONES.reduce((a, z) => a + zoneFlow(z.id, h, live).net, 0);
}

/** System input the AI expects at clock hour h (no burst). */
export function systemExpected(h: number): number {
	return ZONES.reduce((a, z) => a + zoneFlow(z.id, wrap(h), false).expected, 0);
}

/**
 * Samples for a "last 24 hours" chart ending at `now`: x runs from now-24 to now,
 * with the burst anchored at the latest 01:40. `base(h)` gets the clock hour.
 */
export function last24(now: number, base: (h: number) => number, withBurst: boolean, n = 97): number[] {
	const anchor = burstAnchor(now);
	return Array.from({ length: n }, (_, i) => {
		const x = now - 24 + (24 * i) / (n - 1);
		return base(wrap(x)) + (withBurst ? burstAt(x, anchor) : 0);
	});
}

/** MNF windows (02:00–04:00) that fall inside [now-24, now], as absolute hours. */
export function mnfWindows(now: number): { from: number; to: number }[] {
	const d0 = now - wrap(now);
	return [d0 - 22, d0 + 2]
		.map((from) => ({ from: Math.max(from, now - 24), to: Math.min(from + 2, now) }))
		.filter((w) => w.to > w.from);
}

/** Clock-labelled ticks every 6 h for a [now-24, now] axis. */
export function ticks24(now: number): { v: number; t: string }[] {
	const out: { v: number; t: string }[] = [];
	const first = Math.ceil((now - 24) / 6) * 6;
	for (let v = first; v < now - 1; v += 6) out.push({ v, t: fmtClock(v) });
	out.push({ v: now, t: 'kini' });
	return out;
}

/** Pressure (bar) at the zone inlet or at its far end. */
export function zonePressure(z: ZoneId, h: number, where: 'in' | 'end'): number {
	const [night, peak] = where === 'in' ? BALANCE[z].pIn : BALANCE[z].pEnd;
	return night - (night - peak) * load(h);
}

/** Minimum night flow (02:00–04:00) of a zone's own input; `withLeaks` includes tonight's burst and LK-02. */
export function mnf(z: ZoneId, withLeaks = true): number {
	let m = Infinity;
	for (let h = 2; h <= 4; h += 1 / 12) {
		const f = zoneFlow(z, h, false);
		m = Math.min(m, withLeaks ? f.net : f.expected);
	}
	return m;
}

/* ---------------- deterministic noise ---------------- */
export function noise(key: string, i: number): number {
	let x = 2166136261;
	for (let k = 0; k < key.length; k++) x = Math.imul(x ^ key.charCodeAt(k), 16777619);
	x = Math.imul(x ^ (i * 374761393), 668265263);
	x = (x ^ (x >>> 13)) * 1274126177;
	return (((x ^ (x >>> 16)) >>> 0) / 4294967295) * 2 - 1;
}

/** 14 nights of MNF (oldest first). Gemawang jumps last night; Karanggayam creeps up by ~1 L/s a night for 5 nights. */
export function mnfHistory(z: ZoneId): { value: number; baseline: number }[] {
	const base = mnf(z, false);
	return Array.from({ length: 14 }, (_, i) => {
		const ago = 13 - i;
		let v = base * (1 + 0.022 * noise(`mnf-${z}`, i));
		// last night is exact, so every page quotes the same jump
		if (z === BURST.zone && ago === 0) v = mnf(z, true);
		if (z === CREEP.zone && ago < 5) v = base * (1 + 0.004 * noise(`mnf-${z}`, i)) + (CREEP.flow / 5) * (5 - ago);
		return { value: v, baseline: base };
	});
}

/* ---------------- asset readings ---------------- */
export interface Reading {
	flow?: number;
	/** upstream / downstream pressure, bar */
	p1?: number;
	p2?: number;
	/** reservoir level, % */
	level?: number;
	status: SiteStatus;
	/** headline value with unit, for labels */
	value: string;
	note?: string;
}

const pressureStatus = (p: number): SiteStatus => (p < 0.5 ? 'alarm' : p < 0.7 ? 'warn' : 'ok');
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

export function readAsset(a: Asset, h: number, live = false): Reading {
	const on = a.zone === BURST.zone ? burstOn(h, live) : 0;
	const drop = (BURST.drop[a.id] ?? 0) * on * Math.sqrt(pRel(h));
	if (a.type === 'DMA') {
		const f = zoneFlow(a.zone, h, live);
		if (a.role === 'in') {
			const p2 = zonePressure(a.zone, h, 'in') - drop;
			const flow = f.inlet;
			const anomaly = a.zone === BURST.zone && on > 0.5;
			const lowBatt = a.id === 'BNR-IN';
			return {
				flow,
				p1: p2 + 0.42,
				p2,
				status: anomaly || lowBatt ? 'warn' : 'ok',
				value: `${fmt(flow)} L/s`,
				note: anomaly ? `residual +${fmt(f.burst)} L/s` : lowBatt ? 'baterai 18%' : undefined
			};
		}
		const pin = zonePressure(a.zone, h, 'in');
		const pend = zonePressure(a.zone, h, 'end') - drop;
		const flow = f.outlet;
		const p1 = (pin + pend) / 2 - drop * 0.4;
		return { flow, p1, p2: pend, status: pressureStatus(pend), value: `${fmt(flow)} L/s` };
	}
	if (a.type === 'PT') {
		const p = zonePressure(a.zone, h, 'end') - (a.id === 'PT-01' ? drop : 0) - (a.id === 'PT-04' ? 0.02 : 0);
		const st = pressureStatus(p);
		return { p1: p, status: a.id === 'PT-01' && on > 0.5 && st === 'ok' ? 'warn' : st, value: `${fmt(p, 2)} bar` };
	}
	if (a.type === 'SC') {
		const avg = a.id === 'SC-01' ? 117.6 : 63.9;
		const flow = avg * (1 + 0.025 * Math.sin(((h - 7) / 24) * TAU));
		return { flow, p1: a.id === 'SC-01' ? 3.6 : 3.2, status: 'ok', value: `${fmt(flow)} L/s` };
	}
	// reservoirs fill at night and draw down through the day
	const [lo, hi] = a.id === 'RES-BDG' ? [58, 86] : a.id === 'RES-GMW' ? [46, 78] : [71, 92];
	let level = lo + (hi - lo) * (0.5 + 0.5 * Math.cos(((h - 5) / 24) * TAU));
	if (a.id === 'RES-GMW') level -= 5 * on * clamp01(wrap(h - BURST.start) / 4);
	return { level, status: level < 20 ? 'alarm' : level < 35 ? 'warn' : 'ok', value: `${Math.round(level)}%` };
}

/** Same reading with a small per-tick jitter (±0.8% flow, ±0.01 bar), for live widgets. */
export function readLive(a: Asset, h: number, tick: number): Reading {
	const r = readAsset(a, h, true);
	const j = noise(a.id, tick);
	const out = { ...r };
	if (out.flow != null) out.flow *= 1 + 0.008 * j;
	if (out.p1 != null) out.p1 += 0.01 * j;
	if (out.p2 != null) out.p2 += 0.01 * noise(a.id + 'p2', tick);
	if (out.flow != null && a.type !== 'PT') out.value = `${fmt(out.flow)} L/s`;
	else if (out.p1 != null && a.type === 'PT') out.value = `${fmt(out.p1, 2)} bar`;
	return out;
}

/** Totalizer reading (m³): an installation-to-date base plus today's integrated flow. */
export function totalizer(a: Asset, h: number): number {
	const base = 600_000 + Math.round((noise(`tot-${a.id}`, 7) + 1) * 900_000);
	let m3 = 0;
	const step = 1 / 12;
	for (let t = 0; t < h; t += step) m3 += (readAsset(a, t, true).flow ?? 0) * Math.min(step, h - t) * 3.6;
	return base + m3;
}

/** Logger health that drifts with the time of day (panel heat, solar charging). */
export function panelClimate(id: string, h: number) {
	const sun = Math.max(0, Math.sin(((h - 7) / 14) * Math.PI)) * (h > 7 && h < 21 ? 1 : 0);
	return {
		temp: 26.5 + 8.5 * sun + 0.6 * noise(`t-${id}`, Math.floor(h * 4)),
		hum: 83 - 21 * sun + 1.5 * noise(`h-${id}`, Math.floor(h * 4)),
		charge: sun
	};
}

/** Current clock hour (local time), fractional. */
export function nowHour(d = new Date()): number {
	return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
}

/** n samples of fn over [from, to]. */
export function series(fn: (h: number) => number, n = 97, from = 0, to = 24): number[] {
	return Array.from({ length: n }, (_, i) => fn(from + ((to - from) * i) / (n - 1)));
}

export const fmtNum = (v: number, d = 0) =>
	v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmtClock = (h: number) => {
	const m = Math.round(wrap(h) * 60) % 1440;
	return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/* ---------------- water balance ---------------- */
export function zoneBalance(z: ZoneId) {
	const b = BALANCE[z];
	const nrw = b.siv * b.nrw;
	const real = nrw * b.realShare;
	const apparent = (nrw - real) * 0.88;
	const unbilled = nrw - real - apparent;
	return { siv: b.siv, billed: b.siv - nrw, nrw, real, apparent, unbilled, pct: b.nrw };
}

export function systemBalance() {
	const t = { siv: 0, billed: 0, nrw: 0, real: 0, apparent: 0, unbilled: 0, pct: 0 };
	for (const z of ZONES) {
		const b = zoneBalance(z.id);
		t.siv += b.siv;
		t.billed += b.billed;
		t.nrw += b.nrw;
		t.real += b.real;
		t.apparent += b.apparent;
		t.unbilled += b.unbilled;
	}
	t.pct = t.nrw / t.siv;
	return t;
}
