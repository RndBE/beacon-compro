import type { Siaga, Thresholds, HistPoint } from './types';
import { riseRatePerHour } from './series';

export function deriveTmaStatus(value: number, t: Thresholds): Siaga {
	if (value >= t.awas) return 'awas';
	if (value >= t.siaga) return 'siaga';
	if (value >= t.waspada) return 'waspada';
	return 'normal';
}

export function deriveLandslideStatus(
	movementMm: number,
	movementThreshold: number,
	rainAccumMm: number,
	rainThreshold: number
): Siaga {
	const m = movementMm / movementThreshold;
	const r = rainAccumMm / rainThreshold;
	const ratio = Math.max(m, r);
	if (ratio >= 1) return 'awas';
	if (ratio >= 0.85) return 'siaga';
	if (ratio >= 0.7) return 'waspada';
	return 'normal';
}

export function etaToNextSiagaHours(
	value: number,
	t: Thresholds,
	history: HistPoint[]
): number | null {
	const next = value < t.waspada ? t.waspada : value < t.siaga ? t.siaga : value < t.awas ? t.awas : null;
	if (next === null) return null;
	const rate = riseRatePerHour(history);
	if (rate <= 0) return null;
	return (next - value) / rate;
}
