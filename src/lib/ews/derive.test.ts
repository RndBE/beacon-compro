import { describe, it, expect } from 'vitest';
import { deriveTmaStatus, deriveLandslideStatus, etaToNextSiagaHours } from './derive';
import type { Thresholds, HistPoint } from './types';

const T: Thresholds = { waspada: 2.5, siaga: 3.0, awas: 4.0 };

describe('deriveTmaStatus', () => {
	it('classifies by threshold (>= boundary escalates)', () => {
		expect(deriveTmaStatus(2.0, T)).toBe('normal');
		expect(deriveTmaStatus(2.5, T)).toBe('waspada');
		expect(deriveTmaStatus(3.0, T)).toBe('siaga');
		expect(deriveTmaStatus(4.0, T)).toBe('awas');
		expect(deriveTmaStatus(4.1, T)).toBe('awas');
	});
});

describe('deriveLandslideStatus', () => {
	it('escalates when movement or rain crosses threshold', () => {
		expect(deriveLandslideStatus(1, 10, 10, 100)).toBe('normal');
		expect(deriveLandslideStatus(11, 10, 10, 100)).toBe('awas');
		expect(deriveLandslideStatus(1, 10, 80, 100)).toBe('waspada'); // 80% rain
		expect(deriveLandslideStatus(9, 10, 10, 100)).toBe('siaga'); // movement ratio 0.9
	});
});

describe('etaToNextSiagaHours', () => {
	it('estimates hours to next threshold from rise rate', () => {
		// value 2.6 (waspada), next = siaga 3.0, rising 0.2 m/h over history
		const hist: HistPoint[] = [
			{ t: 0, v: 2.2 },
			{ t: 7_200_000, v: 2.6 }
		];
		const eta = etaToNextSiagaHours(2.6, T, hist);
		expect(eta).toBeCloseTo(2.0, 1); // (3.0-2.6)/0.2 = 2h
	});
	it('returns null when not rising', () => {
		const flat: HistPoint[] = [
			{ t: 0, v: 2.6 },
			{ t: 3_600_000, v: 2.6 }
		];
		expect(etaToNextSiagaHours(2.6, T, flat)).toBeNull();
	});
	it('returns null at awas (no next level)', () => {
		const hist: HistPoint[] = [
			{ t: 0, v: 4.0 },
			{ t: 3_600_000, v: 4.5 }
		];
		expect(etaToNextSiagaHours(4.5, T, hist)).toBeNull();
	});
});
