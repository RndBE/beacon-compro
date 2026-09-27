import { describe, expect, it } from 'vitest';
import { ASSET_BY_ID, BALANCE, LEAKS, ZONES } from './data';
import {
	BURST,
	EVENTS,
	burstFlow,
	burstLoss,
	demand,
	eventStage,
	fmtClock,
	mnf,
	mnfHistory,
	readAsset,
	series,
	systemBalance,
	zoneFlow
} from './sim';

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const day = (fn: (h: number) => number) => mean(series(fn, 289).slice(0, 288));

describe('PDAM hydraulic day', () => {
	it('keeps the demand pattern at a daily mean of 1 with a night minimum around 03:00', () => {
		expect(day(demand)).toBeCloseTo(1, 2);
		const night = series(demand, 97, 0, 24);
		const minAt = night.indexOf(Math.min(...night)) / 4;
		expect(minAt).toBeGreaterThanOrEqual(2);
		expect(minAt).toBeLessThanOrEqual(4);
	});

	it('reproduces every zone’s daily input volume without the burst', () => {
		for (const z of ZONES) {
			const avg = day((h) => zoneFlow(z.id, h).expected);
			expect(avg).toBeCloseTo(BALANCE[z.id].siv / 86.4, 0);
		}
	});

	it('matches the leak card: 18.6 L/s at night and an MNF jump of about 18%', () => {
		const leak = LEAKS.find((l) => l.id === BURST.leak)!;
		expect(burstFlow(3)).toBeCloseTo(leak.est, 0);
		const jump = mnf('GMW', true) / mnf('GMW', false) - 1;
		expect(jump).toBeGreaterThan(0.16);
		expect(jump).toBeLessThan(0.22);
		const hist = mnfHistory('GMW');
		expect(hist[13].value / hist[13].baseline - 1).toBeCloseTo(jump, 1);
	});

	it('lets Karanggayam creep up over the last five nights by about the LK-02 estimate', () => {
		const h = mnfHistory('KRG');
		for (let i = 9; i < 13; i++) expect(h[i + 1].value).toBeGreaterThan(h[i].value);
		const lk2 = LEAKS.find((l) => l.id === 'LK-02')!;
		expect(h[13].value - h[13].baseline).toBeCloseTo(lk2.est, 0);
		// crosses the Waspada MNF threshold (+8%) but not Siaga (+12%)
		const ch = h[13].value / h[13].baseline - 1;
		expect(ch).toBeGreaterThan(0.08);
		expect(ch).toBeLessThan(0.12);
	});

	it('drops PT-01 by about 0.34 bar at night once the main has burst', () => {
		const pt = ASSET_BY_ID['PT-01'];
		// same hour, before the burst in the replay vs. live (burst active)
		const drop = readAsset(pt, 1.5).p1! - readAsset(pt, 1.5, true).p1!;
		expect(drop).toBeCloseTo(BURST.drop['PT-01'], 1);
		expect(readAsset(pt, 1.5, true).status).toBe('warn');
	});

	it('orders the incident timeline and accumulates the lost volume', () => {
		expect(fmtClock(BURST.start)).toBe('01:40');
		expect(eventStage(1)).toBe(-1);
		expect(eventStage(5)).toBe(2);
		for (let i = 1; i < EVENTS.length; i++) expect(EVENTS[i].h).toBeGreaterThan(EVENTS[i - 1].h);
		expect(burstLoss(BURST.start)).toBe(0);
		expect(burstLoss(BURST.start + 1)).toBeGreaterThan(55);
		expect(burstLoss(BURST.start + 1)).toBeLessThan(70);
	});

	it('puts system NRW around 30% for the month', () => {
		const b = systemBalance();
		expect(b.pct).toBeGreaterThan(0.29);
		expect(b.pct).toBeLessThan(0.315);
		expect(b.billed + b.nrw).toBeCloseTo(b.siv, 6);
	});
});
