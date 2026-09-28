import { describe, expect, it } from 'vitest';
import { ASSET_BY_ID } from './data';
import { jitter } from './logger-health';
import { mnfHistory, readAsset } from './sim';
import { PAST_LEAKS, completenessPast, daySamples, historyEvents, mnfPast, zoneFlowPast } from './history';

const NOON = 12;

describe('PDAM archive', () => {
	it('keeps the night minimum of the last 14 nights equal to the MNF history', () => {
		for (const z of ['GMW', 'BDG', 'PDS'] as const) {
			const h = mnfHistory(z);
			for (let d = 0; d < 14; d++) expect(mnfPast(z, d, NOON)).toBeCloseTo(h[13 - d].value, 6);
		}
		const krg = mnfHistory('KRG');
		for (let d = 0; d < 14; d++) expect(Math.abs(mnfPast('KRG', d, NOON)! - krg[13 - d].value)).toBeLessThan(0.1);
		expect(mnfPast('GMW', 0, 3)).toBeNull();
	});

	it('records today exactly what the realtime page shows for the burst zone', () => {
		const a = ASSET_BY_ID['PT-01'];
		const today = daySamples(a, 0, 14);
		expect(today).toHaveLength(14 * 12 + 1);
		const s = today[13 * 12]; // 13:00
		expect(s.p1).toBe(jitter(a.id, readAsset(a, 13, true), 13 * 60).p1);
	});

	it('loses the records the Rekap page counts as missing', () => {
		const lost = daySamples(ASSET_BY_ID['SC-02'], 4, NOON).filter((s) => s.miss).length * 5;
		expect(Math.abs(lost - 89)).toBeLessThanOrEqual(5);
		expect(completenessPast('SC-02', 4)).toBe(93.8);
		expect(completenessPast('SC-02', 40)).toBe(100);
	});

	it('replays a closed leak in its zone and logs it', () => {
		const lk = PAST_LEAKS.find((c) => c.id === 'LK-98')!;
		expect(zoneFlowPast('BDG', 4, 15, 0).leak).toBeGreaterThan(0.8 * lk.est);
		expect(zoneFlowPast('BDG', 4, 21, 0).leak).toBe(0);
		const ev = historyEvents(NOON);
		expect(ev.find((e) => e.label.startsWith('LK-98 terdeteksi'))).toMatchObject({ d: 4, id: 'BDG-IN' });
		for (let i = 1; i < ev.length; i++) expect(ev[i].h - 24 * ev[i].d).toBeLessThanOrEqual(ev[i - 1].h - 24 * ev[i - 1].d);
	});
});
