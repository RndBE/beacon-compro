import { readable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { buildData } from './data/seed';
import { worstOf } from './status';
import type { DemoData, MapMarker, AlertItem, Siaga } from './types';

const TICK_MS = 4000;
const HOUR = 3_600_000;
// Fixed demo epoch so SSR and first client render agree; advances client-side.
const EPOCH = 1_750_000_000_000;

export const clock: Readable<number> = readable(EPOCH, (set) => {
	if (!browser) return; // SSR: stay at EPOCH
	let i = 0;
	const id = setInterval(() => {
		i += 1;
		set(EPOCH + i * HOUR); // advance one "hour" of sim per tick
	}, TICK_MS);
	return () => clearInterval(id);
});

export const data: Readable<DemoData> = derived(clock, ($c) => buildData($c));

export const markers: Readable<MapMarker[]> = derived(data, ($d) => {
	const out: MapMarker[] = [];
	for (const p of $d.pos) out.push({ id: p.id, kind: 'pos', nama: p.nama, lat: p.lat, lng: p.lng, status: p.status });
	for (const l of $d.longsor) out.push({ id: l.id, kind: 'longsor', nama: l.nama, lat: l.lat, lng: l.lng, status: l.status });
	for (const s of $d.sirens) out.push({ id: s.id, kind: 'sirine', nama: s.nama, lat: s.lat, lng: s.lng, status: s.status });
	for (const sh of $d.shelters) out.push({ id: sh.id, kind: 'shelter', nama: sh.nama, lat: sh.lat, lng: sh.lng, status: 'normal' });
	for (const o of $d.op) out.push({ id: o.id, kind: 'op', nama: o.nama, lat: o.lat, lng: o.lng, status: o.operasional ? 'normal' : 'waspada' });
	return out;
});

export const activeAlerts: Readable<AlertItem[]> = derived(data, ($d) =>
	[...$d.alerts].sort((a, b) => b.t - a.t)
);

export const overallStatus: Readable<Siaga> = derived(markers, ($m) => worstOf($m.map((x) => x.status)));

export const statusCounts: Readable<Record<Siaga, number>> = derived(markers, ($m) => {
	const c: Record<Siaga, number> = { normal: 0, waspada: 0, siaga: 0, awas: 0 };
	for (const m of $m) c[m.status] += 1;
	return c;
});

export function startSimulation(): () => void {
	// clock is a lazy readable: subscribing starts the interval, unsub stops it.
	const unsub = clock.subscribe(() => {});
	return unsub;
}
