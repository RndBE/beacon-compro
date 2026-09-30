import { describe, expect, it } from 'vitest';
import raw from '../../../../../static/demo/spam/wosusokas-pipa.geojson?raw';
import { LOGGER_IDS, PAIRS, SUPPLY } from '../wosusokas';
import type { PipeNetwork } from './scene';

const net = JSON.parse(raw) as PipeNetwork;
const mains = net.features.filter((f) => f.properties.kategori === 'utama');

describe('indicative Wosusokas pipe network', () => {
	it('only names known loggers and both reservoirs', () => {
		expect(Object.keys(net.reservoir).sort()).toEqual(['RES-MJL', 'RES-PLS']);
		for (const f of net.features) {
			expect(f.geometry.coordinates.length).toBeGreaterThanOrEqual(2);
			expect(f.properties.meter.length).toBeGreaterThan(0);
			for (const m of f.properties.meter) expect(LOGGER_IDS.has(m)).toBe(true);
		}
	});

	it('reaches every logger through a main and feeds every outlet a distribution area', () => {
		const onMains = new Set(mains.flatMap((f) => f.properties.meter));
		for (const id of LOGGER_IDS) expect(onMains.has(id), id).toBe(true);
		for (const l of SUPPLY) expect(net.features.some((f) => f.properties.kategori === 'distribusi' && f.properties.meter[0] === l.id), l.id).toBe(true);
	});

	it('has the inlet → outlet main the scene flags for each series pair', () => {
		// the scene's pair alert colours the main whose only meter is the pair outlet
		for (const p of PAIRS) expect(mains.some((f) => f.properties.meter.join() === p.outlet.id), `DMA ${p.dma}`).toBe(true);
	});
});
