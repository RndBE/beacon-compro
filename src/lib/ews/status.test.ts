import { describe, it, expect } from 'vitest';
import { siagaRank, worst, worstOf, siagaLabel, SIAGA_COLOR } from './status';

describe('siaga status', () => {
	it('ranks normal < waspada < siaga < awas', () => {
		expect(siagaRank('normal')).toBeLessThan(siagaRank('waspada'));
		expect(siagaRank('waspada')).toBeLessThan(siagaRank('siaga'));
		expect(siagaRank('siaga')).toBeLessThan(siagaRank('awas'));
	});
	it('worst returns the higher-rank status', () => {
		expect(worst('normal', 'siaga')).toBe('siaga');
		expect(worst('awas', 'waspada')).toBe('awas');
	});
	it('worstOf returns the max over a list, normal for empty', () => {
		expect(worstOf(['normal', 'waspada', 'awas', 'siaga'])).toBe('awas');
		expect(worstOf([])).toBe('normal');
	});
	it('labels are Indonesian', () => {
		expect(siagaLabel('awas')).toBe('Awas');
		expect(siagaLabel('normal')).toBe('Normal');
	});
	it('maps every level to a hex color', () => {
		expect(SIAGA_COLOR.awas).toBe('#B5322C');
		expect(SIAGA_COLOR.siaga).toBe('#E08A3C');
		expect(SIAGA_COLOR.waspada).toBe('#C77A1B');
		expect(SIAGA_COLOR.normal).toBe('#1F8A5C');
	});
});
