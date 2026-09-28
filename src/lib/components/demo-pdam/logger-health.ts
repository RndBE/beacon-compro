// Logger-side telemetry shared by the Realtime, Rekap, Historis and Perangkat pages:
// sensor jitter, smoothed panel climate, supply voltage with solar charging, signal
// classes, firmware status, alert levels and daily data completeness.
// Everything is derived from data.ts / sim.ts so the pages agree with each other.

import { COMPLETENESS, DEVICE_BY_ID } from './data';
import { fmtNum, noise, panelClimate, type Reading } from './sim';

/** Latest logger firmware published for OTA. */
export const FW_LATEST = '3.4.2';
/** One record per minute. */
export const RECORDS_PER_DAY = 1440;

/**
 * Smooth, deterministic sensor wobble in about [-1, 1]: three slow sines (periods ≈ 7, 13
 * and 23 min, stretched per key) with per-key phases. A function of the absolute minute,
 * so a 60-minute trace scrolls one sample per minute instead of redrawing.
 */
export function wobble(key: string, minute: number) {
	const PERIODS = [7, 13, 23];
	const WEIGHTS = [0.3, 0.35, 0.35];
	let v = 0;
	for (let k = 0; k < 3; k++) {
		const period = PERIODS[k] * (1 + 0.12 * noise(`${key}-per`, k));
		const phase = Math.PI * noise(`${key}-ph`, k);
		v += WEIGHTS[k] * Math.sin((2 * Math.PI * minute) / period + phase);
	}
	return v;
}

/**
 * A model reading as the logger records it at absolute minute m (from today's 00:00, negative
 * on earlier days): slow demand swings (wf) move flow up and pressure down, wp is the
 * supply-side swing, plus a small per-minute jitter of about a third of the wobble.
 */
export function jitter(id: string, r: Pick<Reading, 'flow' | 'p1' | 'p2' | 'level'>, m: number) {
	const wf = wobble(`${id}-f`, m);
	const wp = wobble(`${id}-p`, m);
	return {
		flow: r.flow != null ? r.flow * (1 + 0.006 * wf + 0.002 * noise(id, m)) : undefined,
		p1: r.p1 != null ? r.p1 + 0.008 * wp - 0.004 * wf + 0.0027 * noise(`${id}-p1`, m) : undefined,
		p2: r.p2 != null ? r.p2 + 0.008 * wp - 0.006 * wf + 0.0027 * noise(`${id}-p2`, m) : undefined,
		level: r.level != null ? r.level + 0.12 * wobble(`${id}-lv`, m) + 0.04 * noise(`${id}-lv`, m) : undefined
	};
}

/** panelClimate() steps every 15 min; interpolate between the steps so 1-minute traces stay smooth. */
export function climateAt(id: string, h: number) {
	const q = Math.floor(h * 4);
	const f = h * 4 - q;
	const a = panelClimate(id, q / 4);
	const b = panelClimate(id, (q + 1) / 4);
	return {
		temp: a.temp + (b.temp - a.temp) * f,
		hum: a.hum + (b.hum - a.hum) * f,
		charge: a.charge + (b.charge - a.charge) * f
	};
}

/** Logger supply voltage: the resting value from DEVICES plus the solar-charging bump by day. */
export function loggerVolt(id: string, h: number, minute = Math.floor(h * 60)) {
	const rest = DEVICE_BY_ID[id]?.volt ?? 12.6;
	return rest + 0.45 * climateAt(id, h).charge + 0.012 * wobble(`volt-${id}`, minute) + 0.005 * noise(`volt-${id}`, minute);
}

/** Resting voltage below this is flagged on the device page. */
export const VOLT_LOW = 12.3;

export type SignalTone = 'ok' | 'fair' | 'weak';
/** 4-bar cellular signal class from RSSI (dBm). */
export function signalClass(dbm: number): { bars: number; label: string; tone: SignalTone } {
	if (dbm >= -70) return { bars: 4, label: 'Sangat baik', tone: 'ok' };
	if (dbm >= -80) return { bars: 3, label: 'Baik', tone: 'ok' };
	if (dbm >= -90) return { bars: 2, label: 'Cukup', tone: 'fair' };
	return { bars: 1, label: 'Lemah', tone: 'weak' };
}

/** True when `fw` is older than FW_LATEST (dotted numeric versions). */
export function fwOutdated(fw: string) {
	const a = fw.split('.').map(Number);
	const b = FW_LATEST.split('.').map(Number);
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const d = (a[i] ?? 0) - (b[i] ?? 0);
		if (d !== 0) return d < 0;
	}
	return false;
}

/* ---- alert levels (Tingkat Siaga) ---- */
export type AlertLevel = 'normal' | 'waspada' | 'siaga' | 'awas';
export const LEVEL_COLOR: Record<AlertLevel, string> = {
	normal: '#46D78F',
	waspada: '#FFD166',
	siaga: '#FFB454',
	awas: '#FF7A66'
};
export const LEVEL_LABEL: Record<AlertLevel, string> = {
	normal: 'Normal',
	waspada: 'Waspada',
	siaga: 'Siaga',
	awas: 'Awas'
};
/** Level for a "lower is worse" rule, e.g. minimum pressure [1.0, 0.7, 0.5]. */
export function levelBelow(v: number, [w, s, a]: [number, number, number]): AlertLevel {
	return v < a ? 'awas' : v < s ? 'siaga' : v < w ? 'waspada' : 'normal';
}
/** Level for a "higher is worse" rule, e.g. maximum pressure [4.5, 5.0, 6.0]. */
export function levelAbove(v: number, [w, s, a]: [number, number, number]): AlertLevel {
	return v > a ? 'awas' : v > s ? 'siaga' : v > w ? 'waspada' : 'normal';
}
/** Numeric limits of the THRESHOLDS table rows used by the live pages. */
export const LIMITS = {
	pMin: [1.0, 0.7, 0.5] as [number, number, number],
	pMax: [4.5, 5.0, 6.0] as [number, number, number],
	mnf: [8, 12, 18] as [number, number, number],
	level: [45, 35, 20] as [number, number, number],
	fmBattery: [30, 20, 10] as [number, number, number]
};

/** Minimum-pressure alert levels close enough to data bottoming out at `lo` to be worth drawing. */
export const minPressureLines = (lo: number) =>
	[
		{ v: LIMITS.pMin[0], c: LEVEL_COLOR.waspada, t: 'waspada 1,0' },
		{ v: LIMITS.pMin[1], c: LEVEL_COLOR.siaga, t: 'siaga 0,7' },
		{ v: LIMITS.pMin[2], c: LEVEL_COLOR.awas, t: 'awas 0,5' }
	].filter((l) => l.v >= lo - 0.45);

/* ---- daily data completeness ---- */
/** Daily completeness (%) for the last 7 days, oldest first (ids not listed are 100%). */
export const completenessOf = (id: string): number[] => COMPLETENESS[id] ?? Array(7).fill(100);
export type CompletenessTone = 'ok' | 'warn' | 'bad';
export const completenessTone = (v: number): CompletenessTone => (v >= 99.5 ? 'ok' : v >= 97 ? 'warn' : 'bad');

/** Likely cause of missing records, from the device health data. */
export function gapCause(id: string) {
	const d = DEVICE_BY_ID[id];
	if (!d) return 'gangguan komunikasi singkat';
	if (d.lastFault?.startsWith('Sinyal putus')) return 'sinyal seluler putus · data dibuffer di logger';
	if (d.fault) return d.fault.toLowerCase();
	if (d.signal < -85) return `sinyal lemah ${fmtNum(d.signal)} dBm`;
	return 'gangguan komunikasi singkat';
}

/** The last n calendar days ending today (oldest first). */
export function lastDays(n = 7, end = new Date()): Date[] {
	return Array.from({ length: n }, (_, i) => {
		const d = new Date(end);
		d.setHours(12, 0, 0, 0);
		d.setDate(d.getDate() - (n - 1 - i));
		return d;
	});
}
export const fmtDay = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
export const fmtWeekday = (d: Date) => d.toLocaleDateString('id-ID', { weekday: 'short' });
