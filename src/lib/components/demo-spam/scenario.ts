// "Skenario operasi": a simulated normal day on the 12 real Wosusokas loggers, for the
// DMAs that do not flow yet in the field. The daily shape is DMA 1 Mojolaban's real
// hourly mean (Sep 2026), each logger keeps its own level from SCENARIO, and a small
// deterministic wobble keeps traces alive. Pure functions of the absolute minute t
// (minutes from today's 00:00, negative on earlier days), so every page agrees.

import { DMA1_FLOW, DMA1_PRESSURE, SCENARIO, type Channel, type Logger } from './wosusokas';
import { noise } from './util';

export type Values = Partial<Record<Channel, number>>;
/** One logger record: absolute minute + values */
export interface Row {
	t: number;
	v: Values;
}
export interface Stat {
	avg: number;
	min: number;
	max: number;
}
/** Summary of one time bucket; n counts the 1-minute records inside it. */
export interface Bucket {
	t: number;
	n: number;
	v: Partial<Record<Channel, Stat>>;
	/** OR of the fault bits seen in the bucket */
	fault?: number;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const FLOW_MEAN = mean(DMA1_FLOW);
const P_MEAN = mean(DMA1_PRESSURE);
const wrap = (h: number) => ((h % 24) + 24) % 24;

/** hourly profile at fractional clock hour h, interpolated between the hour means */
function profile(arr: number[], h: number) {
	const i = Math.floor(h) % 24;
	return arr[i] + (arr[(i + 1) % 24] - arr[i]) * (h - Math.floor(h));
}

/** smooth sensor wobble in about [-1, 1]: three slow sines with per-key phases */
function wobble(key: string, t: number) {
	let v = 0;
	[7, 13, 23].forEach((period, k) => {
		v += (1 / 3) * Math.sin((2 * Math.PI * t) / (period * (1 + 0.12 * noise(`${key}-per`, k))) + Math.PI * noise(`${key}-ph`, k));
	});
	return v;
}

/** 0 at night, 1 at solar noon: drives the logger panel's heat and charging. */
const sun = (h: number) => Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));

/**
 * Two leaks written into the scenario so the leak page has something to find:
 * a break on the 590 m pipe between DMA 15's inlet and outlet meters two nights ago
 * (the outlet reads less than the inlet), and a small leak in DMA 3 that has grown by
 * about 0,4 L/s a night for five nights (its minimum night flow creeps up).
 */
export const SCENARIO_LEAKS = {
	station: { dma: 15, outlet: '10371', flow: 3.1, start: -2 * 1440 + 100, ramp: 9 },
	creep: { dma: 3, logger: '10374', perNight: 0.4, nights: 5 }
};

/** extra flow lost at a logger at minute t by the scenario leaks (L/s, negative = the meter reads less) */
function leakAt(l: Logger, t: number) {
	const { station, creep } = SCENARIO_LEAKS;
	if (l.id === station.outlet && t >= station.start) return -station.flow * Math.min(1, (t - station.start) / station.ramp);
	if (l.id === creep.logger) {
		// grows once a night (at 01:00), in whole steps
		const nightsAgo = Math.floor((-t + 60 + 1440) / 1440) - 1;
		return creep.perNight * Math.max(0, creep.nights - Math.max(0, nightsAgo));
	}
	return 0;
}

export function scenarioAt(l: Logger, t: number): Values {
	const s = SCENARIO[l.id];
	const h = wrap(t / 60);
	const day = Math.floor(t / 1440);
	// day-to-day demand swing of a few percent, shared by the loggers of one DMA
	const k = 1 + 0.04 * noise(`day-${l.reservoir}-${l.dma}`, day);
	const flow = s.flow * (profile(DMA1_FLOW, h) / FLOW_MEAN) * k * (1 + 0.012 * wobble(`${l.id}-f`, t) + 0.004 * noise(l.id, t)) + leakAt(l, t);
	// DMA 1 only swings ±3.5% in pressure; the far points swing a bit more
	const pf = 1 + (profile(DMA1_PRESSURE, h) / P_MEAN - 1) * 2;
	const sh = sun(h);
	const v: Values = {
		flow,
		// totalizer grows with the logger's mean flow (L/s × 0,06 = m³ per minute)
		tot: 20_000 + 30_000 * (noise(`tot-${l.id}`, 1) + 1) + s.flow * 0.06 * (t + 90 * 1440),
		fault: 0,
		fm: Math.round(97 + 2 * noise(`fm-${l.id}`, 1)),
		p1: s.p1 * pf + 0.012 * wobble(`${l.id}-p`, t),
		hum: 72 - 48 * sh + 1.5 * wobble(`${l.id}-rh`, t),
		volt: 12.1 + 1.6 * sh + 0.02 * wobble(`${l.id}-v`, t),
		temp: 28 + 24 * sh + 0.4 * wobble(`${l.id}-tc`, t)
	};
	if (l.pressures === 2) v.p2 = (s.p2 ?? s.p1) * pf + 0.012 * wobble(`${l.id}-p2`, t);
	return v;
}

/** 1-minute records ending at `last` (inclusive), oldest first. */
export function scenarioRecent(l: Logger, last: number, n = 60): Row[] {
	return Array.from({ length: n }, (_, i) => {
		const t = last - n + 1 + i;
		return { t, v: scenarioAt(l, t) };
	});
}

/**
 * Buckets of `minutes` from t0 up to (not past) `until`, like mini-stesy's
 * /agregat. Long buckets are sampled every 5 minutes; n still counts 1-minute records.
 */
export function scenarioBuckets(l: Logger, t0: number, t1: number, minutes: number, until: number): Bucket[] {
	const step = minutes >= 60 ? 5 : 1;
	const out: Bucket[] = [];
	for (let b = t0; b < t1 && b <= until; b += minutes) {
		const acc: Partial<Record<Channel, { sum: number; min: number; max: number; n: number }>> = {};
		let n = 0;
		for (let t = b; t < b + minutes && t <= until; t += step) {
			n += step;
			for (const [c, x] of Object.entries(scenarioAt(l, t)) as [Channel, number][]) {
				if (c === 'fault') continue;
				const a = (acc[c] ??= { sum: 0, min: Infinity, max: -Infinity, n: 0 });
				a.sum += x;
				a.n++;
				a.min = Math.min(a.min, x);
				a.max = Math.max(a.max, x);
			}
		}
		const v: Bucket['v'] = {};
		for (const [c, a] of Object.entries(acc) as [Channel, { sum: number; min: number; max: number; n: number }][])
			v[c] = { avg: a.sum / a.n, min: a.min, max: a.max };
		out.push({ t: b, n: Math.min(n, minutes), v, fault: 0 });
	}
	return out;
}
