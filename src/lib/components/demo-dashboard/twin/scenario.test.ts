import { describe, expect, it } from 'vitest';
import sensors from '../tulang-bawang-sensors.json';
import { EWS_ACTIVE } from '../data';
import { GAUGES, HORIZON, awasEta, ewsLevel, gaugeStatus, levelAt, rainAt, zoneFlood } from './scenario';
import { makeProjector, tileLat, tileLon, tileX, tileY } from './geo';

describe('flood forecast model', () => {
	it('starts every gauge at the live value from the sensor list', () => {
		for (const g of Object.values(GAUGES)) {
			const s = sensors.find((x) => x.id === g.id)!;
			expect(levelAt(g.id, 0)).toBeCloseTo(Number(s.value), 6);
			expect(gaugeStatus(g.id, g.now)).toBe(s.status);
		}
		const arr02 = sensors.find((x) => x.id === 'ARR-02')!;
		expect(rainAt('ARR-02', 0)).toBeCloseTo(Number(arr02.value), 6);
	});

	it('peaks where the model says and crosses AWAS on the way', () => {
		const g = GAUGES['AWLR-02'];
		expect(levelAt(g.id, g.peakAt)).toBeCloseTo(g.peak, 6);
		expect(gaugeStatus(g.id, g.peak)).toBe('alarm');
		const eta = awasEta();
		expect(eta).not.toBeNull();
		expect(eta!).toBeGreaterThan(0);
		expect(eta!).toBeLessThan(g.peakAt);
	});

	it('matches the Overview EWS panel now and escalates to Awas at the peak', () => {
		expect(ewsLevel(0)).toBe(EWS_ACTIVE);
		expect(ewsLevel(GAUGES['AWLR-02'].peakAt)).toBe(3);
	});

	it('keeps rain continuous at the 7 h hinge and flood factors within 0–1', () => {
		expect(rainAt('ARR-02', 7 - 1e-6)).toBeCloseTo(rainAt('ARR-02', 7 + 1e-6), 3);
		for (let h = 0; h <= HORIZON; h += 0.5) {
			for (const f of zoneFlood(h)) {
				expect(f).toBeGreaterThanOrEqual(0);
				expect(f).toBeLessThanOrEqual(1);
			}
		}
		expect(zoneFlood(GAUGES['AWLR-02'].peakAt)[0]).toBeGreaterThan(zoneFlood(0)[0]);
	});
});

describe('geo helpers', () => {
	it('round-trips tile coordinates', () => {
		expect(tileLon(tileX(105.535, 12), 12)).toBeCloseTo(105.535, 9);
		expect(tileLat(tileY(-4.398, 12), 12)).toBeCloseTo(-4.398, 9);
	});

	it('projects the origin to 0,0 with north as -z', () => {
		const p = makeProjector(105.535, -4.398);
		expect(p(105.535, -4.398).x).toBeCloseTo(0, 9);
		expect(p(105.535, -4.3).z).toBeLessThan(0);
		expect(p(105.6, -4.398).x).toBeGreaterThan(0);
	});
});
