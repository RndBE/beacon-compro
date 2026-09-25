// ARGO flood forecast used by the digital twin. Pure functions of the forecast
// hour (0 = now … HORIZON), so the 3D scene, the cross-section and the impact
// panel all read the same numbers. Dummy model, tuned to the Overview story:
// AWLR-02 is SIAGA now and the EWS panel expects the flood peak in 12–16 hours.

import type { SiteStatus } from '../data';

export const HORIZON = 16;

const gauss = (h: number, mu: number, sigma: number) => Math.exp(-(((h - mu) / sigma) ** 2));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface GaugeModel {
	id: string;
	now: number;
	peak: number;
	peakAt: number;
	spread: number;
	siaga: number;
	awas: number;
	/** top of the embankment, for the cross-section */
	bank: number;
}

/** Water-level stations (metres). `now` matches tulang-bawang-sensors.json. */
export const GAUGES: Record<string, GaugeModel> = {
	'AWLR-02': { id: 'AWLR-02', now: 3.42, peak: 4.12, peakAt: 12.5, spread: 5, siaga: 3.0, awas: 3.8, bank: 4.5 },
	'AWLR-01': { id: 'AWLR-01', now: 2.14, peak: 3.19, peakAt: 14, spread: 5.5, siaga: 3.0, awas: 3.8, bank: 4.5 },
	'AWLR-04': { id: 'AWLR-04', now: 0.92, peak: 1.62, peakAt: 15, spread: 6, siaga: 1.4, awas: 1.8, bank: 2.2 }
};

export function levelAt(id: string, h: number): number {
	const g = GAUGES[id];
	if (!g) return 0;
	const base = gauss(0, g.peakAt, g.spread);
	return g.now + ((g.peak - g.now) * (gauss(h, g.peakAt, g.spread) - base)) / (1 - base);
}

export function gaugeStatus(id: string, level: number): SiteStatus {
	const g = GAUGES[id];
	if (!g) return 'ok';
	return level >= g.awas ? 'alarm' : level >= g.siaga ? 'warn' : 'ok';
}

/** Rain intensity (mm/h) at the two rain gauges. ARR-02 starts at its live 32.1. */
export function rainAt(id: 'ARR-01' | 'ARR-02', h: number): number {
	if (id === 'ARR-01') return 12.4 + 18 * gauss(h, 6, 3.5) - 18 * gauss(0, 6, 3.5);
	return h < 7 ? 32.1 + (56 - 32.1) * Math.sin((Math.PI / 2) * (h / 7)) : 9 + (56 - 9) * gauss(h, 7, 4);
}

export function rainStatus(mmh: number): SiteStatus {
	return mmh >= 50 ? 'alarm' : mmh >= 20 ? 'warn' : 'ok';
}

/** Flood-prone reaches. Weight fades with distance from the centre (km). */
export interface FloodZone {
	id: string;
	name: string;
	lon: number;
	lat: number;
	radius: number;
}

export const FLOOD_ZONES: FloodZone[] = [
	{ id: 'banjar-margo', name: 'Banjar Margo', lon: 105.382, lat: -4.279, radius: 13 },
	{ id: 'gedung-aji', name: 'Gedung Aji', lon: 105.47, lat: -4.4, radius: 12 },
	{ id: 'rawa-pitu', name: 'Rawa Pitu', lon: 105.74, lat: -4.36, radius: 12 },
	{ id: 'menggala', name: 'Menggala', lon: 105.264, lat: -4.444, radius: 9 }
];

/** Inundation factor 0–1 per zone at hour h, driven by the nearest gauge. */
export function zoneFlood(h: number): number[] {
	const l02 = levelAt('AWLR-02', h);
	const l01 = levelAt('AWLR-01', h);
	const l04 = levelAt('AWLR-04', h);
	const r02 = rainAt('ARR-02', h);
	return [
		clamp01((l02 - 3.3) / (GAUGES['AWLR-02'].peak - 3.3)) ** 1.4,
		clamp01(0.55 * clamp01((l02 - 3.5) / 0.6) + 0.45 * clamp01((r02 - 30) / 26)),
		clamp01((l04 - 1.1) / (GAUGES['AWLR-04'].peak - 1.1)) ** 1.1,
		clamp01((l01 - 2.7) / (GAUGES['AWLR-01'].peak - 2.7)) * 0.8
	];
}

export const EWS_STEPS = ['Normal', 'Waspada', 'Siaga', 'Awas'] as const;

/** EWS level index from the lead gauge (AWLR-02). */
export function ewsLevel(h: number): number {
	const l = levelAt('AWLR-02', h);
	return l >= 3.8 ? 3 : l >= 3.0 ? 2 : l >= 2.5 ? 1 : 0;
}

/** First forecast hour at which AWLR-02 reaches AWAS, or null. */
export function awasEta(): number | null {
	for (let h = 0; h <= HORIZON; h += 0.25) if (levelAt('AWLR-02', h) >= GAUGES['AWLR-02'].awas) return h;
	return null;
}

/** Rough population density of Tulang Bawang (jiwa/km²) for the impact estimate. */
export const POP_DENSITY = 124;
