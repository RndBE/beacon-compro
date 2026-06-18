import type { HistPoint } from './types';

export function lastN(h: HistPoint[], n: number): HistPoint[] {
	return n >= h.length ? h.slice() : h.slice(h.length - n);
}

export function delta(h: HistPoint[], n: number): number {
	const w = lastN(h, n);
	if (w.length < 2) return 0;
	return w[w.length - 1].v - w[0].v;
}

export function riseRatePerHour(h: HistPoint[]): number {
	if (h.length < 2) return 0;
	const a = h[0];
	const b = h[h.length - 1];
	const hours = (b.t - a.t) / 3_600_000;
	return hours === 0 ? 0 : (b.v - a.v) / hours;
}

export function minMax(h: HistPoint[]): { min: number; max: number } {
	if (h.length === 0) return { min: 0, max: 0 };
	let min = h[0].v;
	let max = h[0].v;
	for (const p of h) {
		if (p.v < min) min = p.v;
		if (p.v > max) max = p.v;
	}
	return { min, max };
}
