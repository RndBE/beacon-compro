// Formatting and time helpers for the SPAM demo. Times are "absolute minutes": minutes
// from today's local 00:00, negative on earlier days, so field rows and scenario
// samples share one axis.

export const fmtNum = (v: number, d = 0) =>
	v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

const wrap = (h: number) => ((h % 24) + 24) % 24;

export const fmtClock = (h: number) => {
	const m = Math.round(wrap(h) * 60) % 1440;
	return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Current clock hour (local time), fractional. */
export const nowHour = (d = new Date()) => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;

/** Today's local midnight. */
export function midnight(d = new Date()) {
	const m = new Date(d);
	m.setHours(0, 0, 0, 0);
	return m;
}

/** 'Y-m-d H:i:s' (logger local time) → absolute minute. */
export function minuteOf(waktu: string, today = midnight()) {
	const [date, time = '00:00:00'] = waktu.split(' ');
	const [y, mo, d] = date.split('-').map(Number);
	const [h, mi] = time.split(':').map(Number);
	return Math.round((new Date(y, mo - 1, d, h, mi).getTime() - today.getTime()) / 60_000);
}

/** absolute minute → day back + minute of that day */
export function dayMin(t: number) {
	const d = -Math.floor(t / 1440);
	return { d, m: t + 1440 * d };
}

/** The last n calendar days ending today (oldest first, at noon). */
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
export const isoDate = (x: Date) =>
	`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

/** "5 menit lalu" style age of a reading, from minutes. */
export function ago(min: number) {
	if (min < 1) return 'baru saja';
	if (min < 60) return `${Math.round(min)} menit lalu`;
	if (min < 1440) return `${Math.floor(min / 60)} jam lalu`;
	return `${Math.floor(min / 1440)} hari lalu`;
}

export type CompletenessTone = 'ok' | 'warn' | 'bad';
export const completenessTone = (v: number): CompletenessTone => (v >= 99.5 ? 'ok' : v >= 97 ? 'warn' : 'bad');

/** Deterministic noise in [-1, 1] for a key and an integer. */
export function noise(key: string, i: number): number {
	let x = 2166136261;
	for (let k = 0; k < key.length; k++) x = Math.imul(x ^ key.charCodeAt(k), 16777619);
	x = Math.imul(x ^ (i * 374761393), 668265263);
	x = (x ^ (x >>> 13)) * 1274126177;
	return (((x ^ (x >>> 16)) >>> 0) / 4294967295) * 2 - 1;
}
