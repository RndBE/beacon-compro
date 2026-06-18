import { describe, it, expect } from 'vitest';
import { lastN, delta, riseRatePerHour, minMax } from './series';
import type { HistPoint } from './types';

const H: HistPoint[] = [
	{ t: 0, v: 2.0 },
	{ t: 3_600_000, v: 2.2 },
	{ t: 7_200_000, v: 2.6 }
];

describe('series', () => {
	it('lastN slices the tail', () => {
		expect(lastN(H, 2)).toEqual([H[1], H[2]]);
		expect(lastN(H, 10)).toEqual(H);
	});
	it('delta over last n points', () => {
		expect(delta(H, 2)).toBeCloseTo(0.4, 5); // 2.6 - 2.2
	});
	it('riseRatePerHour uses first/last over elapsed hours', () => {
		expect(riseRatePerHour(H)).toBeCloseTo(0.3, 5); // (2.6-2.0)/2h
	});
	it('minMax', () => {
		expect(minMax(H)).toEqual({ min: 2.0, max: 2.6 });
	});
});
