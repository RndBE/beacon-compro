// Data Historis: a 90-day archive of every logger, one sample per 5 minutes, derived from
// sim.ts so it agrees with the live pages. Day d counts back from today (0) and replays the story:
//  - LK-01 bursts at the latest 01:40 (the "tonight" of the live pages),
//  - LK-02 grows over the last five nights, LK-03 leaves pressure transients at PT-03,
//  - the leaks closed in the last 30 days (LEAK_HISTORY) show as bumps in their zone,
//  - day-to-day demand uses the noise of mnfHistory(), so the archive's night minimum is the
//    MNF the Beranda and Kebocoran pages quote,
//  - missing records follow the Rekap completeness (last 7 days) and logged faults.

import { ASSETS, LEAK_HISTORY, type Asset, type AssetType, type ZoneId } from './data';
import { BURST, CREEP, EVENTS, TRANSIENT, fmtNum, noise, pRel, readAsset, transientAt, zoneFlow } from './sim';
import { completenessOf, gapCause, jitter } from './logger-health';

export const RETENTION = 90;
/** minutes between archived samples */
export const STEP = 5;
export const SLOTS = 1440 / STEP;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Days back to the night of the latest burst: 1 before 01:40, when "tonight" was still yesterday. */
export const burstDay = (now: number) => (now >= BURST.start ? 0 : 1);

/** Day-to-day demand factor of a zone n nights before the burst night, as in mnfHistory(). */
function dayFactor(z: ZoneId, n: number) {
	if (z === BURST.zone && n === 0) return 1;
	return 1 + (z === CREEP.zone && n >= 0 && n < 5 ? 0.004 : 0.022) * noise(`mnf-${z}`, 13 - n);
}
/** Share of LK-02's full flow n nights back: it grew by a fifth a night. */
const creepShare = (n: number) => clamp01((5 - n) / 5);
/** LK-03 was first flagged two days ago (13:30), its transients start there. */
const TRANSIENT_FROM = -48 + 13.5;

/* ---- closed leaks, on the absolute clock (hours from today's 00:00) ---- */
/** '3 j 10 m' → 3,17 h · '2 hari' → 48 h */
function hoursOf(s: string) {
	const n = (re: RegExp) => Number(re.exec(s)?.[1] ?? 0);
	return n(/(\d+) hari/) * 24 + n(/(\d+) j\b/) + n(/(\d+) m\b/) / 60;
}
export const PAST_LEAKS = LEAK_HISTORY.map((c) => {
	const endX = -24 * c.ago + c.end;
	const foundX = endX - hoursOf(c.fixed);
	return { ...c, startX: foundX - hoursOf(c.found), foundX, endX };
});

/** Flow of the closed leaks running in zone z at absolute hour x, clock hour h (L/s): they burst like LK-01. */
function pastLeakFlow(z: ZoneId, x: number, h: number) {
	let q = 0;
	for (const c of PAST_LEAKS)
		if (c.zone === z && x >= c.startX && x < c.endX) q += c.est * clamp01((x - c.startX) / BURST.ramp) * Math.sqrt(pRel(h));
	return q;
}
/** Pressure drop per L/s of leak at the zone's loggers, scaled from LK-01's footprint. */
const DROP_PER_LS = {
	PT: BURST.drop['PT-01'] / BURST.flow,
	out: BURST.drop['GMW-OUT'] / BURST.flow,
	in: BURST.drop['GMW-IN'] / BURST.flow
};

/** A zone's own input, the flow handed on through its outlet and the closed-leak share, day d at clock hour h (L/s). */
export function zoneFlowPast(z: ZoneId, d: number, h: number, dA: number) {
	const n = d - dA;
	// the same clock hour n days from the burst night: every sim term is 24 h periodic except the
	// burst onset, so the burst is off before that night and on after it
	const f = zoneFlow(z, h - 24 * n);
	const k = dayFactor(z, n);
	const leak = pastLeakFlow(z, h - 24 * d, h);
	return { net: (f.net - f.creep * (1 - creepShare(n))) * k + leak, out: f.outlet * k, leak };
}

/** Minimum night flow (02:00–04:00) of zone z on day d; null while that window is still open. */
export function mnfPast(z: ZoneId, d: number, now: number) {
	if (d === 0 && now < 4) return null;
	const dA = burstDay(now);
	let m = Infinity;
	for (let h = 2; h <= 4; h += 1 / 12) m = Math.min(m, zoneFlowPast(z, d, h, dA).net);
	return m;
}

/** Model reading of a logger on day d at clock hour h, before sensor jitter. */
function readPast(a: Asset, d: number, h: number, dA: number) {
	const x = h - 24 * d;
	let { flow, p1, p2, level } = readAsset(a, h - 24 * (d - dA), false);
	// today stays on the live model; earlier days get a small supply-pressure swing
	const dp = d === 0 ? 0 : 0.03 * noise(`p-${a.zone}`, d);
	if (a.type === 'DMA') {
		const z = zoneFlowPast(a.zone, d, h, dA);
		const inlet = a.role === 'in';
		const drop = z.leak * (inlet ? DROP_PER_LS.in : DROP_PER_LS.out);
		flow = inlet ? z.net + z.out : z.out;
		p1 = p1! - drop * (inlet ? 1 : 0.9) + dp;
		p2 = p2! - drop + dp;
	} else if (a.type === 'PT') {
		const lk3 = a.id === TRANSIENT.id && x >= TRANSIENT_FROM ? transientAt(h) : 0;
		p1 = p1! - pastLeakFlow(a.zone, x, h) * DROP_PER_LS.PT - lk3 + dp;
	} else if (a.type === 'SC') {
		flow = flow! * (d === 0 ? 1 : 1 + 0.012 * noise(`sc-${a.id}`, d));
		p1 = p1! + dp;
	} else {
		level = level! + (d === 0 ? 0 : 2 * noise(`lv-${a.id}`, d));
	}
	return { flow, p1, p2, level };
}

/* ---- missing records ---- */
/** Faults that cost records outside the Rekap week (DEVICES.lastFault). */
const FAULTS = [{ id: 'BDG-OUT', d: 17, from: 10 * 60 + 12, min: 14, label: 'Empty pipe di flowmeter · pulih 14 menit' }];

/** Records lost on day d, as one block of minutes [from, to). Today's few missing minutes are spread thin (see Rekap). */
function gapOf(id: string, d: number): { from: number; to: number; min: number } | null {
	const f = FAULTS.find((x) => x.id === id && x.d === d);
	if (f) return { from: f.from, to: f.from + f.min, min: f.min };
	if (d < 1 || d > 6) return null;
	const min = Math.round((1440 * (100 - completenessOf(id)[6 - d])) / 100);
	if (!min) return null;
	const from = Math.round(((noise(`gap-${id}`, d) + 1) / 2) * (1440 - min));
	return { from, to: from + min, min };
}

/** Share of records delivered on day d (%), the Rekap figure for the last 7 days. */
export function completenessPast(id: string, d: number) {
	if (d <= 6) return completenessOf(id)[6 - d];
	const g = gapOf(id, d);
	return g ? 100 * (1 - g.min / 1440) : 100;
}

/* ---- samples ---- */
export type Channel = 'flow' | 'p1' | 'p2' | 'level';
export const CHANNELS: Record<AssetType, Channel[]> = { DMA: ['flow', 'p1', 'p2'], SC: ['flow', 'p1'], PT: ['p1'], RES: ['level'] };

export interface Sample {
	/** minutes from today's 00:00, negative on earlier days */
	t: number;
	flow?: number;
	p1?: number;
	p2?: number;
	level?: number;
	/** the logger did not deliver this record; the value stays for the flowmeter's own totalizer */
	miss: boolean;
}

// past days never change (until the burst night moves at 01:40 or the date rolls over)
const cache = new Map<string, Sample[]>();

/** Archived samples of day d, oldest first; today only up to `now` (clock hour). */
export function daySamples(a: Asset, d: number, now: number): Sample[] {
	const dA = burstDay(now);
	const key = `${a.id}|${d}|${dA}|${new Date().toDateString()}`;
	const hit = d > 0 && cache.get(key);
	if (hit) return hit;
	const gap = gapOf(a.id, d);
	const out: Sample[] = [];
	const n = d === 0 ? Math.floor((now * 60) / STEP) + 1 : SLOTS;
	for (let i = 0; i < n; i++) {
		const m = i * STEP;
		const t = m - 1440 * d;
		out.push({ t, ...jitter(a.id, readPast(a, d, m / 60, dA), t), miss: gap != null && m >= gap.from && m < gap.to });
	}
	if (d > 0) cache.set(key, out);
	return out;
}

export interface Stat {
	avg: number;
	min: number;
	max: number;
	/** sample time (t) of the minimum / maximum */
	minAt: number;
	maxAt: number;
	n: number;
}

/** Mean / min / max of one channel over the delivered samples (null when none). */
export function stat(xs: Sample[], c: Channel): Stat | null {
	let sum = 0;
	let n = 0;
	let min = Infinity;
	let max = -Infinity;
	let minAt = 0;
	let maxAt = 0;
	for (const s of xs) {
		const v = s[c];
		if (s.miss || v == null) continue;
		sum += v;
		n++;
		if (v < min) [min, minAt] = [v, s.t];
		if (v > max) [max, maxAt] = [v, s.t];
	}
	return n ? { avg: sum / n, min, max, minAt, maxAt, n } : null;
}

/** Volume through a flowmeter (m³); it keeps totalising while the logger misses records. */
export const volume = (xs: Sample[]) => xs.reduce((a, s) => a + (s.flow ?? 0), 0) * STEP * 0.06;

/** `count` buckets of B minutes from t0: mean / min / max of the delivered samples, NaN when empty. */
export function buckets(xs: Sample[], c: Channel, t0: number, B: number, count: number) {
	const sum = new Array<number>(count).fill(0);
	const n = new Array<number>(count).fill(0);
	const lo = new Array<number>(count).fill(Infinity);
	const hi = new Array<number>(count).fill(-Infinity);
	for (const s of xs) {
		const v = s[c];
		if (s.miss || v == null) continue;
		const i = Math.floor((s.t - t0) / B);
		sum[i] += v;
		n[i]++;
		lo[i] = Math.min(lo[i], v);
		hi[i] = Math.max(hi[i], v);
	}
	const or = (v: number, i: number) => (n[i] ? v : NaN);
	return { avg: sum.map((v, i) => or(v / n[i], i)), min: lo.map(or), max: hi.map(or) };
}

/* ---- events the archive explains ---- */
export type Tone = 'danger' | 'amber' | 'water' | 'green';

export interface HistEvent {
	d: number;
	/** clock hour */
	h: number;
	/** the logger whose data shows it best */
	id: string;
	/** incidents mark every logger of the zone; record gaps only their own logger */
	zoneWide: boolean;
	tone: Tone;
	label: string;
}

/** absolute hour → day back + clock hour */
const dayHour = (x: number) => {
	const d = -Math.floor(x / 24);
	return { d, h: x + 24 * d };
};

/** Every event in the archive up to `now`, newest first. */
export function historyEvents(now: number): HistEvent[] {
	const dA = burstDay(now);
	const out: HistEvent[] = [
		...EVENTS.map((e) => ({ d: dA, h: e.h, id: 'GMW-IN', zoneWide: true, tone: e.tone, label: `${e.label} · ${BURST.leak}` })),
		{ d: 4, h: 2.5, id: 'KRG-IN', zoneWide: true, tone: 'amber', label: `MNF Karanggayam mulai naik ±1 L/s per malam · ${CREEP.leak}` },
		{ d: 1, h: 9.25, id: 'KRG-IN', zoneWide: true, tone: 'amber', label: `AI menandai tren MNF naik · ${CREEP.leak} dipantau` },
		{ d: 2, h: 13.7, id: TRANSIENT.id, zoneWide: true, tone: 'amber', label: `Transien tekanan −0,25 bar pertama · ${TRANSIENT.leak}` },
		...PAST_LEAKS.flatMap((c): HistEvent[] => [
			{ ...dayHour(c.foundX), id: `${c.zone}-IN`, zoneWide: true, tone: 'danger', label: `${c.id} terdeteksi · ${c.pipe} · ${fmtNum(c.est, 1)} L/s` },
			{ ...dayHour(c.endX), id: `${c.zone}-IN`, zoneWide: true, tone: 'green', label: `${c.id} selesai diperbaiki · hemat ${fmtNum(c.saved)} m³` }
		]),
		...FAULTS.map((f) => ({ d: f.d, h: f.from / 60, id: f.id, zoneWide: false, tone: 'amber' as const, label: f.label }))
	];
	for (const a of ASSETS)
		for (let d = 1; d <= 6; d++) {
			const g = gapOf(a.id, d);
			if (g && g.min >= 15)
				out.push({ d, h: g.from / 60, id: a.id, zoneWide: false, tone: 'amber', label: `Data tidak masuk ${g.min} menit · ${gapCause(a.id)}` });
		}
	const x = (e: HistEvent) => e.h - 24 * e.d;
	return out.filter((e) => x(e) <= now).sort((a, b) => x(b) - x(a));
}
