import { describe, it, expect } from 'vitest';
import { num, fmtUnit, timeHM } from './format';

describe('format', () => {
	it('formats numbers id-ID with given digits', () => {
		expect(num(1234.5, 1)).toBe('1.234,5');
		expect(num(2, 0)).toBe('2');
	});
	it('appends unit', () => {
		expect(fmtUnit(2.6, 'm', 1)).toBe('2,6 m');
	});
	it('formats time as HH.MM (id-ID 24h)', () => {
		// 2026-06-18T02:05:00Z -> use a fixed local-independent check on shape
		expect(timeHM(Date.UTC(2026, 5, 18, 2, 5))).toMatch(/\d{2}[.:]\d{2}/);
	});
});
