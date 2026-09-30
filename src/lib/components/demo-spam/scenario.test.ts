import { describe, expect, it } from 'vitest';
import { LOGGER_BY_ID, LOGGERS, PAIRS, SCENARIO } from './wosusokas';
import { SCENARIO_LEAKS, scenarioAt, scenarioBuckets, scenarioRecent } from './scenario';

const dayMean = (id: string, day = 0) => {
	const l = LOGGER_BY_ID[id];
	let s = 0;
	for (let m = 0; m < 1440; m += 5) s += scenarioAt(l, day * 1440 + m).flow!;
	return s / 288;
};

describe('Wosusokas operating scenario', () => {
	it('keeps every logger near its scenario level over a day before the leaks', () => {
		for (const l of LOGGERS) {
			expect(Math.abs(dayMean(l.id, -10) / SCENARIO[l.id].flow - 1)).toBeLessThan(0.06);
		}
	});

	it('follows DMA 1 real daily shape: night minimum, morning and evening peaks', () => {
		const dma1 = LOGGER_BY_ID['10373'];
		const at = (h: number) => scenarioAt(dma1, h * 60).flow!;
		expect(at(2)).toBeLessThan(at(6));
		expect(at(2)).toBeLessThan(at(17));
		expect(at(6) / at(2)).toBeGreaterThan(1.4);
	});

	it('reads a series inlet and outlet within a few percent, until the DMA 15 leak opens', () => {
		const before = -4 * 1440;
		for (const { inlet, outlet } of PAIRS)
			for (let h = 0; h < 24; h++) {
				const spread = scenarioAt(outlet, before + h * 60).flow! / scenarioAt(inlet, before + h * 60).flow! - 1;
				expect(Math.abs(spread)).toBeLessThan(0.05);
			}
		const { station } = SCENARIO_LEAKS;
		const dma15 = PAIRS.find((p) => p.dma === station.dma)!;
		const lost = (t: number) => scenarioAt(dma15.inlet, t).flow! - scenarioAt(dma15.outlet, t).flow!;
		expect(lost(station.start - 60)).toBeLessThan(1.5);
		expect(lost(station.start + 120)).toBeGreaterThan(station.flow);
	});

	it('lets the DMA 3 night flow creep up over the last five nights', () => {
		const dma3 = LOGGER_BY_ID['10374'];
		const night = (d: number) => scenarioAt(dma3, -d * 1440 + 3 * 60).flow!;
		expect(night(0) - night(6)).toBeGreaterThan(1.6);
		for (let d = 5; d > 0; d--) expect(night(d - 1)).toBeGreaterThan(night(d) - 0.2);
	});

	it('gives two pressures only to the 50-column loggers', () => {
		expect(scenarioAt(LOGGER_BY_ID['10368'], 600).p2).toBeTypeOf('number');
		expect(scenarioAt(LOGGER_BY_ID['10377'], 600).p2).toBeUndefined();
	});

	it('summarises buckets like the /agregat endpoint', () => {
		const l = LOGGER_BY_ID['10373'];
		const hours = scenarioBuckets(l, -1440, 0, 60, 0);
		expect(hours).toHaveLength(24);
		expect(hours.every((b) => b.n === 60)).toBe(true);
		const b = hours[6];
		expect(b.v.flow!.min).toBeLessThanOrEqual(b.v.flow!.avg);
		expect(b.v.flow!.max).toBeGreaterThanOrEqual(b.v.flow!.avg);
		// stops at `until`, so today's buckets never run into the future
		expect(scenarioBuckets(l, 0, 1440, 60, 125)).toHaveLength(3);
		expect(scenarioRecent(l, 600, 60).map((r) => r.t)).toEqual(Array.from({ length: 60 }, (_, i) => 541 + i));
	});
});
