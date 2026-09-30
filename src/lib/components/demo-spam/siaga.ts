// Tingkat Siaga for the Wosusokas flowmeters. mini-stesy has thresholds only for AWLR
// and ARR, so these are Beacon's proposed rules, evaluated on whatever a logger reports
// now (field data or the scenario). Pure, so the page and the tests agree.

import { FLOW_EPS, PAIRS, decodeFault, type Logger } from './wosusokas';
import type { Latest } from './field.svelte';

export type Level = 'normal' | 'waspada' | 'siaga' | 'awas';
export const LEVELS: Level[] = ['normal', 'waspada', 'siaga', 'awas'];
export const LEVEL_COLOR: Record<Level, string> = { normal: '#46D78F', waspada: '#FFD166', siaga: '#FFB454', awas: '#FF7A66' };
export const LEVEL_LABEL: Record<Level, string> = { normal: 'Normal', waspada: 'Waspada', siaga: 'Siaga', awas: 'Awas' };
export const worst = (a: Level, b: Level) => (LEVELS.indexOf(a) >= LEVELS.indexOf(b) ? a : b);

export type RuleId = 'p-min' | 'p-max' | 'empty' | 'fault' | 'fm' | 'volt' | 'stale' | 'pair';

export interface Rule {
	id: RuleId;
	param: string;
	unit: string;
	scope: string;
	/** waspada / siaga / awas, as shown in the table */
	levels: [string, string, string];
	note: string;
}

export const RULES: Rule[] = [
	{ id: 'p-min', param: 'Tekanan hilir minimum', unit: 'bar', scope: 'titik yang sedang dialiri', levels: ['< 1,5', '< 1,0', '< 0,5'], note: 'P2 di stasiun 50 kanal, tekanan tunggal di titik lain' },
	{ id: 'p-max', param: 'Tekanan hulu maksimum', unit: 'bar', scope: 'semua titik', levels: ['> 9,0', '> 9,5', '≥ 9,9'], note: 'sensor 10 bar: ≥ 9,9 berarti mentok batas ukur' },
	{ id: 'empty', param: 'Pipa kosong', unit: 'bit 11', scope: 'semua flowmeter', levels: ['aktif', '–', '–'], note: 'empty pipe warning dari flowmeter' },
	{ id: 'fault', param: 'Fault flowmeter lain', unit: 'bit', scope: 'semua flowmeter', levels: ['–', 'aktif', '–'], note: 'bit selain 11: coil, insulation, overload, dll.' },
	{ id: 'fm', param: 'Baterai flowmeter', unit: '%', scope: 'semua flowmeter', levels: ['< 30', '< 20', '< 10'], note: 'jadwalkan penggantian' },
	{ id: 'volt', param: 'Baterai logger', unit: 'V', scope: 'semua logger', levels: ['< 11,6', '< 11,3', '< 11,0'], note: 'aki logger dengan panel surya' },
	{ id: 'stale', param: 'Data tidak masuk', unit: 'menit', scope: 'semua logger', levels: ['> 10', '> 30', '> 60'], note: 'mini-stesy menyebut offline setelah 60 menit' },
	{ id: 'pair', param: 'Selisih meter seri', unit: '%', scope: 'stasiun DMA 9, 12, 15', levels: ['> 5', '> 10', '> 20'], note: 'inlet vs outlet satu stasiun saat mengalir' }
];

export interface Hit {
	rule: RuleId;
	level: Level;
	/** what triggered it, e.g. "0,42 bar" */
	value: string;
}

const below = (v: number, [w, s, a]: [number, number, number]): Level => (v < a ? 'awas' : v < s ? 'siaga' : v < w ? 'waspada' : 'normal');
const above = (v: number, [w, s, a]: [number, number, number]): Level => (v >= a ? 'awas' : v > s ? 'siaga' : v > w ? 'waspada' : 'normal');
const num = (v: number, d: number) => v.toFixed(d).replace('.', ',');

/**
 * Rule hits for one logger. `read` gives any logger's reading (for the series-meter
 * rule, which compares a station's inlet and outlet); `now` is the absolute minute.
 */
export function evaluate(l: Logger, read: (l: Logger) => Latest, now: number, on: Set<RuleId>): Hit[] {
	const r = read(l);
	const v = r.v;
	const hits: Hit[] = [];
	const add = (rule: RuleId, level: Level, value: string) => on.has(rule) && level !== 'normal' && hits.push({ rule, level, value });

	const flowing = (v.flow ?? 0) > FLOW_EPS;
	const pDown = v.p2 ?? v.p1;
	if (flowing && pDown != null) add('p-min', below(pDown, [1.5, 1.0, 0.5]), `${num(pDown, 2)} bar`);
	if (v.p1 != null) add('p-max', above(v.p1, [9.0, 9.5, 9.9]), `${num(v.p1, 2)} bar`);

	const faults = v.fault ? decodeFault(v.fault) : [];
	if (faults.includes('Empty pipe warning')) add('empty', 'waspada', 'bit 11');
	const other = faults.filter((f) => f !== 'Empty pipe warning');
	if (other.length) add('fault', 'siaga', other.map((f) => f.replace(' warning', '')).join(', '));

	if (v.fm != null) add('fm', below(v.fm, [30, 20, 10]), `${num(v.fm, 0)}%`);
	if (v.volt != null) add('volt', below(v.volt, [11.6, 11.3, 11.0]), `${num(v.volt, 2)} V`);
	if (r.t != null) add('stale', above(now - r.t, [10, 30, 60]), `${Math.round(now - r.t)} menit`);

	const pair = PAIRS.find((p) => p.outlet.id === l.id);
	if (pair) {
		const fi = read(pair.inlet).v.flow ?? 0;
		const fo = v.flow ?? 0;
		if (fi > FLOW_EPS) {
			const d = (100 * Math.abs(fi - fo)) / fi;
			add('pair', above(d, [5, 10, 20]), `${num(d, 1)}% (${num(fi, 1)} → ${num(fo, 1)} L/s)`);
		}
	}
	return hits;
}

export const levelOf = (hits: Hit[]) => hits.reduce<Level>((a, h) => worst(a, h.level), 'normal');
