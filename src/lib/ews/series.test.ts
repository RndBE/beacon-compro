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
	it('lastN edge cases: empty and exact-length boundaries', () => {
		expect(lastN(H, 0)).toEqual([]);
		expect(lastN(H, 3)).toEqual(H);
	});
	it('delta over last n points', () => {
		expect(delta(H, 2)).toBeCloseTo(0.4, 5); // 2.6 - 2.2
	});
	it('delta edge case: single-element window returns 0', () => {
		expect(delta(H, 1)).toBe(0);
	});
	it('riseRatePerHour uses first/last over elapsed hours', () => {
		expect(riseRatePerHour(H)).toBeCloseTo(0.3, 5); // (2.6-2.0)/2h
	});
	it('riseRatePerHour edge cases: fewer than 2 points and equal timestamps', () => {
		expect(riseRatePerHour([H[0]])).toBe(0);
		expect(riseRatePerHour([{ t: 0, v: 2.0 }, { t: 0, v: 3.0 }])).toBe(0);
	});
	it('minMax', () => {
		expect(minMax(H)).toEqual({ min: 2.0, max: 2.6 });
	});
});
