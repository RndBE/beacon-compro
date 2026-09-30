// Where the SPAM demo's numbers come from. "Lapangan" is the live field data from
// mini-stesy through the /demo/spam/api proxy; "Skenario operasi" is the simulated
// normal day of scenario.ts. Pages read through this module and do not care which
// one is on.

import { goto } from '$app/navigation';
import { CHANNEL_OF, FLOW_EPS, SUPPLY, decodeFault, slug, type Logger } from './wosusokas';
import { scenarioAt, scenarioBuckets, scenarioRecent, type Bucket, type Row, type Values } from './scenario';
import { isoDate, midnight, minuteOf, nowHour } from './util';

export type Mode = 'lapangan' | 'skenario';
export type Interval = '5m' | '1h' | '1d';
export const INTERVAL_MIN: Record<Interval, number> = { '5m': 5, '1h': 60, '1d': 1440 };

export interface Latest {
	/** absolute minute of the reading; null when the logger never reported */
	t: number | null;
	online: boolean;
	v: Values;
}

const MODE_KEY = 'demo-spam-mode';
export const nowMinute = () => Math.floor(nowHour() * 60);

function savedMode(): Mode {
	try {
		return localStorage.getItem(MODE_KEY) === 'skenario' ? 'skenario' : 'lapangan';
	} catch {
		return 'lapangan';
	}
}

export const field = $state({
	mode: savedMode(),
	latest: {} as Record<string, Latest>,
	/** Date.now() of the last snapshot that arrived */
	fetchedAt: 0,
	error: '',
	/** clock in absolute minutes, ticks every 15 s */
	now: nowMinute()
});

export function setMode(m: Mode) {
	field.mode = m;
	try {
		localStorage.setItem(MODE_KEY, m);
	} catch {
		/* the mode just is not remembered */
	}
}

async function api<T>(path: string): Promise<T> {
	const res = await fetch(path);
	if (res.status === 401) {
		await goto('/demo/spam/login');
		throw new Error('Sesi berakhir, silakan masuk lagi.');
	}
	if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? `HTTP ${res.status}`);
	return res.json();
}

/** mini-stesy row keys (parameter slugs) → channel values */
function values(row: Record<string, unknown>): Values {
	const v: Values = {};
	for (const [k, x] of Object.entries(row)) {
		const c = CHANNEL_OF[k];
		if (c && typeof x === 'number') v[c] = x;
	}
	return v;
}

interface ApiLogger {
	id_logger: string;
	koneksi_logger: 'On' | 'Off';
	waktu: string | null;
	data: { nama_parameter: string; nilai: number | null }[];
}

async function refresh() {
	try {
		const body = await api<{ data: ApiLogger[] }>('/demo/spam/api/loggers');
		const today = midnight();
		const next: Record<string, Latest> = {};
		for (const x of body.data) {
			next[x.id_logger] = {
				t: x.waktu ? minuteOf(x.waktu, today) : null,
				online: x.koneksi_logger === 'On',
				v: values(Object.fromEntries(x.data.map((p) => [slug(p.nama_parameter), p.nilai])))
			};
		}
		field.latest = next;
		field.fetchedAt = Date.now();
		field.error = '';
	} catch (e) {
		field.error = e instanceof Error ? e.message : String(e);
	}
}

let timer: ReturnType<typeof setInterval> | undefined;
let users = 0;

/** Starts the clock and the field snapshot polling (ref-counted); returns the stop function. */
export function useField() {
	users++;
	if (!timer) {
		void refresh();
		timer = setInterval(() => {
			field.now = nowMinute();
			if (Date.now() - field.fetchedAt > 55_000) void refresh();
		}, 15_000);
	}
	return () => {
		users--;
		if (users <= 0 && timer) {
			clearInterval(timer);
			timer = undefined;
			users = 0;
		}
	};
}

/** What a logger shows right now in the current mode. */
export function reading(l: Logger): Latest {
	if (field.mode === 'skenario') return { t: field.now, online: true, v: scenarioAt(l, field.now) };
	return field.latest[l.id] ?? { t: null, online: false, v: {} };
}

export type Status = 'ok' | 'warn' | 'alarm';

/** Marker/pill state of a reading: offline, a flowmeter fault, no flow, or flowing. */
export function statusOf(r: Latest): { st: Status; label: string } {
	if (!r.online) return { st: 'alarm', label: r.t == null ? 'Belum ada data' : 'Offline' };
	const faults = r.v.fault ? decodeFault(r.v.fault) : [];
	if (faults.includes('Empty pipe warning')) return { st: 'warn', label: 'Pipa kosong' };
	if (faults.length) return { st: 'warn', label: `Fault · ${faults.length} aktif` };
	if ((r.v.flow ?? 0) <= FLOW_EPS) return { st: 'warn', label: 'Tidak mengalir' };
	return { st: 'ok', label: 'Mengalir' };
}

/** Water going into the DMAs now: the outlet loggers (inlets repeat it upstream), L/s. */
export const supplyFlow = () => SUPPLY.reduce((a, l) => a + Math.max(0, reading(l).v.flow ?? 0), 0);

/** Latest raw records, oldest first: the last 300 from the field, or 60 scenario minutes. */
export async function recentRows(l: Logger): Promise<Row[]> {
	if (field.mode === 'skenario') return scenarioRecent(l, field.now, 60);
	const body = await api<{ data: ({ waktu: string } & Record<string, unknown>)[] }>(`/demo/spam/api/recent?id=${l.id}`);
	const today = midnight();
	return body.data.map((r) => ({ t: minuteOf(r.waktu, today), v: values(r) })).reverse();
}

interface ApiBucket {
	waktu: string;
	jumlah_data: number;
	[k: string]: unknown;
}

const bucketCache = new Map<string, { at: number; body: Promise<Bucket[]> }>();

/** History of one logger over whole days [from, to] in buckets, oldest first. */
export function bucketsOf(l: Logger, from: Date, to: Date, interval: Interval): Promise<Bucket[]> {
	const minutes = INTERVAL_MIN[interval];
	const today = midnight();
	if (field.mode === 'skenario') {
		const t0 = Math.round((midnight(from).getTime() - today.getTime()) / 60_000);
		const t1 = Math.round((midnight(to).getTime() - today.getTime()) / 60_000) + 1440;
		return Promise.resolve(scenarioBuckets(l, t0, t1, minutes, field.now));
	}

	const key = `${l.id}|${isoDate(from)}|${isoDate(to)}|${interval}`;
	const hit = bucketCache.get(key);
	// a window that includes today keeps growing: refetch it after a minute
	const fresh = hit && (isoDate(to) < isoDate(new Date()) || Date.now() - hit.at < 60_000);
	if (hit && fresh) return hit.body;

	const body = api<{ data: ApiBucket[] }>(
		`/demo/spam/api/agregat?id=${l.id}&awal=${isoDate(from)}&akhir=${isoDate(to)}&interval=${interval}`
	).then((res) =>
		res.data.map((r) => {
			const b: Bucket = { t: minuteOf(r.waktu, today), n: r.jumlah_data, v: {} };
			for (const [k, x] of Object.entries(r)) {
				const c = CHANNEL_OF[k];
				if (!c || !x || typeof x !== 'object') continue;
				const o = x as { rata?: number | null; min?: number | null; maks?: number | null; bit_or?: number | null };
				if (c === 'fault') b.fault = o.bit_or ?? undefined;
				else if (o.rata != null && o.min != null && o.maks != null) b.v[c] = { avg: o.rata, min: o.min, max: o.maks };
			}
			return b;
		})
	);
	bucketCache.set(key, { at: Date.now(), body });
	body.catch(() => bucketCache.delete(key));
	return body;
}
