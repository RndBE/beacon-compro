// Analyses behind the leak, water-balance and pressure pages, computed from the same
// bucket history as Data Historis (mini-stesy /agregat or the scenario). Pure functions.

import { FLOW_EPS, type Channel } from './wosusokas';
import type { Bucket } from './scenario';
import { dayMin } from './util';

const median = (xs: number[]) => {
	const s = [...xs].sort((a, b) => a - b);
	return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
};

/**
 * Minimum night flow of the last `nights` nights (oldest first) from hourly buckets:
 * the lowest hourly mean between 02:00 and 04:00. NaN where that window has no data.
 */
export function nightMins(hourly: Bucket[], nights: number): number[] {
	const out = Array<number>(nights).fill(NaN);
	for (const b of hourly) {
		const { d, m } = dayMin(b.t);
		const f = b.v.flow?.avg;
		if (f == null || m < 120 || m >= 240 || d >= nights) continue;
		const i = nights - 1 - d;
		out[i] = Number.isNaN(out[i]) ? f : Math.min(out[i], f);
	}
	return out;
}

export interface MnfTrend {
	mins: number[];
	/** median of the older nights, before the last five */
	baseline: number;
	last: number;
	/** last / baseline − 1 */
	change: number;
	/** the logger flowed at night at all */
	flowing: boolean;
}

export function mnfTrend(hourly: Bucket[], nights = 14): MnfTrend {
	const mins = nightMins(hourly, nights);
	const older = mins.slice(0, Math.max(1, nights - 5)).filter(Number.isFinite);
	const baseline = median(older);
	const last = [...mins].reverse().find(Number.isFinite) ?? NaN;
	const flowing = baseline > FLOW_EPS || last > FLOW_EPS;
	return { mins, baseline, last, change: flowing && baseline > FLOW_EPS ? last / baseline - 1 : NaN, flowing };
}

export interface PairPoint {
	t: number;
	inlet: number;
	outlet: number;
	/** (inlet − outlet) / inlet, NaN while the inlet is not flowing */
	diff: number;
}

/** Hour by hour comparison of a series inlet and outlet. */
export function pairSeries(inlet: Bucket[], outlet: Bucket[]): PairPoint[] {
	const out = new Map(outlet.map((b) => [b.t, b.v.flow?.avg]));
	return inlet
		.filter((b) => b.v.flow && out.get(b.t) != null)
		.map((b) => {
			const i = b.v.flow!.avg;
			const o = out.get(b.t)!;
			return { t: b.t, inlet: i, outlet: o, diff: i > FLOW_EPS ? (i - o) / i : NaN };
		});
}

/** Water through a meter per bucket (m³): its own totalizer where it moved forward, else the flow integral. */
export function volumeOf(b: Bucket) {
	const tot = b.v.tot;
	if (tot && tot.max - tot.min >= 0 && b.n > 1) return tot.max - tot.min;
	return b.v.flow ? Math.max(0, b.v.flow.avg) * b.n * 0.06 : 0;
}

/** Mean of a channel per clock hour over hourly buckets (24 values, NaN where empty). */
export function hourProfile(hourly: Bucket[], c: Channel): number[] {
	const sum = Array(24).fill(0);
	const n = Array(24).fill(0);
	for (const b of hourly) {
		const v = b.v[c]?.avg;
		if (v == null) continue;
		const h = Math.floor(dayMin(b.t).m / 60);
		sum[h] += v;
		n[h]++;
	}
	return sum.map((s, h) => (n[h] ? s / n[h] : NaN));
}
