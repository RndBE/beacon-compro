// Pure animation/data-drift helpers for the live demo widgets.
// Seeds are deterministic-ish; randomness only grows after mount (dashboard is ssr=false).

/**
 * AWLR 60-point series ending at the station's live level. Most of the rise
 * lands in the last half hour, matching the "TMA naik 0.6 m dalam 30 menit" alert.
 */
export function seedAwlr(n: number, now = 3.42, rise = 0.75): number[] {
	return Array.from({ length: n }, (_, i) => {
		const t = i / (n - 1);
		const shape = 1 / (1 + Math.exp(-(t - 0.62) * 9));
		const wobble = 0.035 * Math.sin(t * 17) + 0.02 * (Math.random() - 0.5);
		return now - rise + rise * shape + wobble * (1 - t * 0.6);
	});
}

/** Next AWLR sample: small noise that keeps hugging the live level. */
export function driftAwlr(last: number, target = 3.42): number {
	return last + (target - last) * 0.12 + (Math.random() - 0.5) * 0.035;
}

/** Rainfall initial 24-bar series (mirrors RainfallBars seed). */
export function seedRainfall(n: number): number[] {
	return Array.from({ length: n }, (_, i) => Math.max(0, 8 + 14 * Math.sin(i / 3) + 12 * Math.random() - 4));
}

/** Next rainfall bar value. */
export function nextRainfall(): number {
	return Math.max(0, 15 + 8 * Math.sin(Date.now() / 7000) + (Math.random() - 0.3) * 20);
}
