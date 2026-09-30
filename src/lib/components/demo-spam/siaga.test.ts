import { describe, expect, it } from 'vitest';
import { LOGGER_BY_ID, type Logger } from './wosusokas';
import { RULES, evaluate, levelOf, type RuleId } from './siaga';
import type { Latest } from './field.svelte';

const ALL = new Set<RuleId>(RULES.map((r) => r.id));
const at = (readings: Record<string, Latest['v']>, t = 600) => (l: Logger): Latest => ({ t, online: true, v: readings[l.id] ?? {} });

describe('Wosusokas alert rules', () => {
	it('flags an empty pipe and a saturated pressure sensor, like the field data shows', () => {
		const dma1 = LOGGER_BY_ID['10373'];
		const hits = evaluate(dma1, at({ '10373': { flow: 14, p1: 10, fault: 1024, fm: 98, volt: 13.6 } }), 605, ALL);
		expect(hits.map((h) => [h.rule, h.level])).toEqual([
			['p-max', 'awas'],
			['empty', 'waspada']
		]);
		expect(levelOf(hits)).toBe('awas');
	});

	it('checks downstream pressure only while the point is supplied', () => {
		const out = LOGGER_BY_ID['10370'];
		expect(evaluate(out, at({ '10370': { flow: 0, p1: 0, p2: 0 } }), 600, ALL)).toEqual([]);
		const hits = evaluate(out, at({ '10370': { flow: 5, p1: 6, p2: 0.8 } }), 600, ALL);
		expect(hits).toEqual([{ rule: 'p-min', level: 'siaga', value: '0,80 bar' }]);
	});

	it('compares a series inlet and outlet of one station', () => {
		const out = LOGGER_BY_ID['10371'];
		const read = at({ '10379': { flow: 34 }, '10371': { flow: 30 } });
		expect(evaluate(out, read, 600, ALL)).toEqual([{ rule: 'pair', level: 'siaga', value: '11,8% (34,0 → 30,0 L/s)' }]);
		expect(evaluate(out, read, 600, new Set<RuleId>(['p-min']))).toEqual([]);
	});

	it('raises stale data by how long the logger has been quiet', () => {
		const l = LOGGER_BY_ID['10374'];
		expect(evaluate(l, at({ '10374': {} }, 500), 545, ALL)).toEqual([{ rule: 'stale', level: 'siaga', value: '45 menit' }]);
	});
});
