import { describe, it, expect } from 'vitest';
import { buildData } from './seed';

describe('buildData', () => {
	const d = buildData(1_750_000_000_000);
	it('produces Yogyakarta stations with 48-pt histories', () => {
		expect(d.pos.length).toBeGreaterThanOrEqual(6);
		expect(d.pos[0].history).toHaveLength(48);
		expect(d.pos.some((p) => /Code|Gajah Wong|Winongo|Opak|Boyong/.test(p.sungai))).toBe(true);
	});
	it('includes landslide, sirens, shelters, quakes', () => {
		expect(d.longsor.length).toBeGreaterThan(0);
		expect(d.sirens.length).toBeGreaterThan(0);
		expect(d.shelters.length).toBeGreaterThan(0);
		expect(d.quakes.length).toBeGreaterThan(0);
	});
	it('is deterministic for a given clock', () => {
		const a = buildData(1_750_000_000_000);
		const b = buildData(1_750_000_000_000);
		expect(a.pos[0].value).toBe(b.pos[0].value);
	});
	it('generates alerts for non-normal assets only', () => {
		for (const al of d.alerts) {
			expect(al.to).not.toBe('normal');
		}
	});
});
