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

export function splinePath(
	pts: ReadonlyArray<readonly [number, number]>,
	tension = 0.5,
): string {
	const n = pts.length;
	if (n === 0) return '';
	if (n === 1) return `M${pts[0][0]} ${pts[0][1]}`;
	if (n === 2) return `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`;
	const k = tension / 6;
	let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
	for (let i = 0; i < n - 1; i++) {
		const p0 = pts[i === 0 ? 0 : i - 1];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2 < n ? i + 2 : n - 1];
		const c1x = p1[0] + (p2[0] - p0[0]) * k;
		const c1y = p1[1] + (p2[1] - p0[1]) * k;
		const c2x = p2[0] - (p3[0] - p1[0]) * k;
		const c2y = p2[1] - (p3[1] - p1[1]) * k;
		d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
	}
	return d;
}
