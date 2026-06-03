// Pure animation/data-drift helpers for the live demo widgets.
// Seeds are deterministic-ish; randomness only grows after mount (dashboard is ssr=false).

/** AWLR initial 60-point series (mirrors AWLRChart seed). */
export function seedAwlr(n: number): number[] {
	const base = 2.0;
	return Array.from({ length: n }, (_, i) => {
		const t = i / n;
		return base + 0.6 * Math.sin(t * 6) + 0.3 * Math.sin(t * 13) + 0.1 * Math.random();
	});
}

/** Next AWLR sample given the last one. */
export function driftAwlr(last: number): number {
	return Math.max(1.2, Math.min(4.2, last + (Math.random() - 0.45) * 0.12));
}

/** Rainfall initial 24-bar series (mirrors RainfallBars seed). */
export function seedRainfall(n: number): number[] {
	return Array.from({ length: n }, (_, i) => Math.max(0, 8 + 14 * Math.sin(i / 3) + 12 * Math.random() - 4));
}

/** Next rainfall bar value. */
export function nextRainfall(): number {
	return Math.max(0, 15 + 8 * Math.sin(Date.now() / 7000) + (Math.random() - 0.3) * 20);
}
