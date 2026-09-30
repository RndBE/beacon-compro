import { describe, expect, it } from 'vitest';
import { LOGGER_BY_ID, PAIRS } from './wosusokas';
import { SCENARIO_LEAKS, scenarioBuckets } from './scenario';
import { hourProfile, mnfTrend, pairSeries, volumeOf } from './analisa';

const hourly = (id: string, days = 14) => scenarioBuckets(LOGGER_BY_ID[id], -(days - 1) * 1440, 1440, 60, 12 * 60);

describe('Wosusokas analyses on the scenario', () => {
	it('finds the growing DMA 3 leak in the minimum night flow', () => {
		const t = mnfTrend(hourly('10374'));
		expect(t.mins).toHaveLength(14);
		expect(t.change).toBeGreaterThan(0.15);
		// a DMA without a leak stays within the day-to-day swing
		expect(Math.abs(mnfTrend(hourly('10375')).change)).toBeLessThan(0.1);
	});

	it('shows the DMA 15 pipe loss between its series meters', () => {
		const { station } = SCENARIO_LEAKS;
		const pair = PAIRS.find((p) => p.dma === station.dma)!;
		const pts = pairSeries(hourly(pair.inlet.id, 7), hourly(pair.outlet.id, 7));
		const before = pts.filter((p) => p.t < station.start);
		const after = pts.filter((p) => p.t > station.start + 60);
		expect(Math.max(...before.map((p) => p.diff))).toBeLessThan(0.05);
		expect(Math.min(...after.map((p) => p.diff))).toBeGreaterThan(0.06);
	});

	it('turns buckets into daily volume and an hourly pressure profile', () => {
		const days = scenarioBuckets(LOGGER_BY_ID['10373'], -10 * 1440, -9 * 1440, 1440, 0);
		// 11,7 L/s for a day ≈ 1 011 m³
		expect(volumeOf(days[0])).toBeGreaterThan(900);
		expect(volumeOf(days[0])).toBeLessThan(1150);
		const p = hourProfile(hourly('10370', 7), 'p2');
		expect(p).toHaveLength(24);
		expect(p.every(Number.isFinite)).toBe(true);
	});
});
