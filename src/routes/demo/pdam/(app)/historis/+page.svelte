<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Activity, ChevronLeft, ChevronRight, FileDown, History } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import LineChart, { yRange, type ChartSeries } from '$lib/components/demo-pdam/LineChart.svelte';
	import LoggerPicker from '$lib/components/demo-pdam/LoggerPicker.svelte';
	import { ASSETS, ASSET_BY_ID, DEVICE_BY_ID, HANDOVER, TYPE_META, ZONE_BY_ID, type AssetType } from '$lib/components/demo-pdam/data';
	import { live, useLive } from '$lib/components/demo-pdam/live.svelte';
	import { fmtClock, fmtNum, mnf } from '$lib/components/demo-pdam/sim';
	import {
		LEVEL_COLOR,
		LEVEL_LABEL,
		LIMITS,
		completenessTone,
		fmtDay,
		fmtWeekday,
		lastDays,
		levelAbove,
		levelBelow,
		minPressureLines,
		type AlertLevel
	} from '$lib/components/demo-pdam/logger-health';
	import {
		CHANNELS,
		RETENTION,
		STEP,
		buckets,
		completenessPast,
		daySamples,
		historyEvents,
		mnfPast,
		stat,
		volume,
		type Channel,
		type HistEvent,
		type Sample,
		type Stat,
		type Tone
	} from '$lib/components/demo-pdam/history';

	onMount(() => useLive());

	const DEFAULT_ID = 'GMW-IN';
	const SPANS = [1, 7, 30, 90] as const;
	type Span = (typeof SPANS)[number];
	/** chart bucket per window, minutes */
	const BUCKET: Record<Span, number> = { 1: STEP, 7: 60, 30: 180, 90: 1440 };
	const RES_LABEL: Record<Span, string> = { 1: '5 menit', 7: 'jam', 30: '3 jam', 90: 'hari' };
	const TONE: Record<Tone, string> = { danger: '#FF7A66', amber: '#FFB454', water: '#3CC3F2', green: '#46D78F' };
	const C = { flow: '#3CC3F2', p1: '#A08BFF', p2: '#4FD4E8', level: '#2FC2A8' };

	const DATES = lastDays(RETENTION);
	const dateOf = (d: number) => DATES[RETENTION - 1 - d];
	const dayName = (d: number) => `${fmtWeekday(dateOf(d))} ${fmtDay(dateOf(d))}`;
	const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
	/** sample time → day back + minute of that day */
	const dayMin = (t: number) => {
		const d = -Math.floor(t / 1440);
		return { d, m: t + 1440 * d };
	};
	const clockOf = (t: number) => fmtClock(dayMin(t).m / 60);

	/* ---- selection: the logger lives in the URL like Realtime; ?d= and ?span= open a window ---- */
	let sel = $derived(ASSET_BY_ID[($page.url.searchParams.get('id') ?? '').toUpperCase()] ?? ASSET_BY_ID[DEFAULT_ID]);
	let dev = $derived(DEVICE_BY_ID[sel.id]);
	const clampEnd = (e: number, s: Span) => Math.min(Math.max(0, Math.round(e)), RETENTION - s);
	const init = $page.url.searchParams;
	const initSpan = SPANS.find((s) => s === Number(init.get('span'))) ?? (init.has('d') ? 1 : 7);
	let span = $state<Span>(initSpan);
	/** newest day of the window, days back from today */
	let end = $state(clampEnd(Number(init.get('d')) || 0, initSpan));
	/** hovered chart bucket */
	let hover = $state<number | null>(null);
	/** absolute hour marked after jumping to an event */
	let pin = $state<number | null>(null);

	function pick(id: string) {
		if (id === sel.id) return;
		hover = null;
		pin = null;
		goto(`/demo/pdam/historis?id=${id}`, { replaceState: true, noScroll: true, keepFocus: true });
	}
	function setWindow(s: Span, e: number) {
		span = s;
		end = clampEnd(e, s);
		hover = null;
		pin = null;
	}
	function pickDate(v: string) {
		const [y, m, d] = v.split('-').map(Number);
		if (y) setWindow(span, (DATES[RETENTION - 1].getTime() - new Date(y, m - 1, d, 12).getTime()) / 86_400_000);
	}
	function jump(e: HistEvent) {
		if (e.id !== sel.id) goto(`/demo/pdam/historis?id=${e.id}`, { replaceState: true, noScroll: true, keepFocus: true });
		setWindow(1, e.d);
		pin = e.h - 24 * e.d;
	}

	/* ---- the window ---- */
	// the archive holds a sample every 5 minutes: follow the clock at that pace
	let slot = $derived(Math.floor((live.h * 60) / STEP));
	let now = $derived((slot * STEP) / 60);
	let oldest = $derived(end + span - 1);
	let days = $derived(Array.from({ length: span }, (_, i) => oldest - i));
	let perDay = $derived(days.map((d) => ({ d, xs: daySamples(sel, d, now) })));
	let samples = $derived(perDay.flatMap((p) => p.xs));
	let chans = $derived(CHANNELS[sel.type]);
	let st = $derived(Object.fromEntries(chans.map((c) => [c, stat(samples, c)])) as Record<Channel, Stat | null>);

	/* ---- chart buckets: x in hours from the window start ---- */
	let B = $derived(BUCKET[span]);
	let env = $derived(B > STEP);
	let t0 = $derived(-1440 * oldest);
	let count = $derived(Math.floor((samples[samples.length - 1].t - t0) / B) + 1);
	const bx = (i: number) => (i * B + (B - STEP) / 2) / 60;
	const idxAt = (x: number) => Math.max(0, Math.min(count - 1, Math.round((x * 60 - (B - STEP) / 2) / B)));
	let x1 = $derived(bx(Math.max(1, count - 1)));
	let agg = $derived(Object.fromEntries(chans.map((c) => [c, buckets(samples, c, t0, B, count)])) as Record<Channel, ReturnType<typeof buckets>>);

	let pinned = $derived(pin != null && pin * 60 >= t0 && pin * 60 <= samples[samples.length - 1].t ? idxAt(pin - t0 / 60) : null);
	let cur = $derived(hover ?? pinned);
	let curAt = $derived(cur == null ? null : dayMin(t0 + cur * B));
	const onhover = (x: number | null) => (hover = x == null ? null : idxAt(x));

	function bucketLabel(i: number) {
		const { d, m } = dayMin(t0 + i * B);
		if (B === 1440) return dayName(d);
		if (B === STEP) return fmtClock(m / 60);
		return `${dayName(d)} · ${fmtClock(m / 60)}–${fmtClock((m + B) / 60)}`;
	}

	let xTicks = $derived.by(() => {
		if (span === 1) {
			const out: { v: number; t: string }[] = [];
			for (let h = 0; h < 24 && h <= x1 - 1.5; h += 3) out.push({ v: h, t: fmtClock(h) });
			out.push(end === 0 ? { v: x1, t: 'kini' } : { v: 24, t: '24:00' });
			return out;
		}
		const every = span === 7 ? 1 : span === 30 ? 5 : 15;
		return days
			.filter((d) => (d - end) % every === 0)
			.map((d) => ({ v: 24 * (oldest - d) + 12, t: span === 7 ? `${fmtWeekday(dateOf(d))} ${dateOf(d).getDate()}` : fmtDay(dateOf(d)) }));
	});

	/* ---- events ---- */
	/** incidents in the selected logger's zone, and record gaps of this logger */
	const mine = (e: HistEvent) => (e.zoneWide ? ASSET_BY_ID[e.id].zone === sel.zone : e.id === sel.id);
	let events = $derived(historyEvents(now).filter((e) => e.d >= end && e.d <= oldest));
	let myEvents = $derived(events.filter(mine));
	let marks = $derived(myEvents.map((e) => ({ x: e.h + 24 * (oldest - e.d), c: TONE[e.tone], t: `${fmtClock(e.h)} · ${e.label}` })));

	/* ---- charts ---- */
	interface Chart {
		key: string;
		title: string;
		unit: string;
		series: ChartSeries[];
		legend: { label: string; color: string }[];
		lines: { v: number; c: string; t?: string }[];
		bands: { from: number; to: number; c: string; t?: string }[];
		range: { min: number; max: number };
		stats: string;
		read: (i: number) => string;
		yFmt: (v: number) => string;
	}
	const f1 = (v: number) => (Number.isFinite(v) ? fmtNum(v, 1) : '—');
	const f2 = (v: number) => (Number.isFinite(v) ? fmtNum(v, 2) : '—');
	/** min–max envelope + mean of a channel; a single filled trace when every bucket is one sample */
	function trace(c: Channel, color: string, main = true): ChartSeries[] {
		const a = agg[c];
		if (!main) return [{ values: a.avg, color, width: 1.4 }];
		return env ? [{ values: a.max, lo: a.min, color, width: 0 }, { values: a.avg, color, width: 1.8 }] : [{ values: a.avg, color, fill: true }];
	}
	const spread = (c: Channel, fmt: (v: number) => string, i: number) =>
		env ? `${fmt(agg[c].avg[i])} (${fmt(agg[c].min[i])}–${fmt(agg[c].max[i])})` : fmt(agg[c].avg[i]);
	const envLegend = (color: string) => (env ? [{ label: 'rata-rata', color }, { label: 'rentang min–maks', color: `${color}66` }] : []);
	const rangeOf = (cs: Channel[], minSpan: number, lines: { v: number }[]) =>
		yRange(
			cs.flatMap((c) => [...agg[c].min, ...agg[c].max]),
			minSpan,
			lines.map((l) => l.v)
		);

	let charts = $derived.by((): Chart[] => {
		const out: Chart[] = [];
		const { flow, p1, p2, level } = st;
		if (flow) {
			const hand = HANDOVER.find((h) => h.id === sel.id);
			const lines = hand ? [{ v: hand.contract, c: '#9fb6da', t: `kontrak ${hand.contract} L/s` }] : [];
			out.push({
				key: 'flow',
				title: 'Debit',
				unit: 'L/s',
				series: trace('flow', C.flow),
				legend: envLegend(C.flow),
				lines,
				// the minimum night flow window, when one day is on screen
				bands: span === 1 && sel.type === 'DMA' && x1 > 2 ? [{ from: 2, to: Math.min(4, x1), c: '#8b7cff', t: 'MNF' }] : [],
				range: rangeOf(['flow'], Math.max(2, flow.avg * 0.06), lines),
				stats: `rata-rata ${f1(flow.avg)} · min ${f1(flow.min)} · maks ${f1(flow.max)} L/s`,
				read: (i) => `${spread('flow', f1, i)} L/s`,
				yFmt: (v) => fmtNum(v, 0)
			});
		}
		if (sel.type === 'DMA' && p1 && p2) {
			const lines =
				sel.role === 'in' ? (p1.max > 3.9 ? [{ v: LIMITS.pMax[0], c: LEVEL_COLOR.waspada, t: 'waspada maks 4,5' }] : []) : minPressureLines(p2.min);
			out.push({
				key: 'p',
				title: 'Tekanan P1 · P2',
				unit: 'bar',
				series: [...trace('p1', C.p1, false), ...trace('p2', C.p2)],
				legend: [
					{ label: 'P1 hulu', color: C.p1 },
					{ label: env ? 'P2 hilir · min–maks' : 'P2 hilir', color: C.p2 }
				],
				lines,
				bands: [],
				range: rangeOf(['p1', 'p2'], 0.3, lines),
				stats: `P1 ${f2(p1.min)}–${f2(p1.max)} · P2 ${f2(p2.min)}–${f2(p2.max)} bar`,
				read: (i) => `P1 ${f2(agg.p1.avg[i])} · P2 ${spread('p2', f2, i)} bar`,
				yFmt: (v) => fmtNum(v, 2)
			});
		} else if (p1) {
			const lines = sel.type === 'PT' ? minPressureLines(p1.min) : [];
			out.push({
				key: 'p',
				title: 'Tekanan',
				unit: 'bar',
				series: trace('p1', C.p1),
				legend: envLegend(C.p1),
				lines,
				bands: [],
				range: rangeOf(['p1'], 0.3, lines),
				stats: `rata-rata ${f2(p1.avg)} · min ${f2(p1.min)} · maks ${f2(p1.max)} bar`,
				read: (i) => `${spread('p1', f2, i)} bar`,
				yFmt: (v) => fmtNum(v, 2)
			});
		}
		if (level) {
			const lines = level.min < 60 ? [{ v: LIMITS.level[0], c: LEVEL_COLOR.waspada, t: 'waspada 45%' }] : [];
			out.push({
				key: 'level',
				title: 'Level reservoir',
				unit: '%',
				series: trace('level', C.level),
				legend: envLegend(C.level),
				lines,
				bands: [],
				range: rangeOf(['level'], 4, lines),
				stats: `rata-rata ${f1(level.avg)} · min ${f1(level.min)} · maks ${f1(level.max)} %`,
				read: (i) => `${spread('level', f1, i)} %`,
				yFmt: (v) => fmtNum(v, 0)
			});
		}
		return out;
	});

	/* ---- period tiles ---- */
	interface Tile {
		k: string;
		v: string;
		u?: string;
		s?: string;
		tone?: 'warn' | 'alarm';
		c?: string;
	}
	const toneOf = (l: AlertLevel) => (l === 'normal' ? undefined : l === 'awas' ? 'alarm' : 'warn');
	const when = (t: number) => (span === 1 ? clockOf(t) : `${dayName(dayMin(t).d)} ${clockOf(t)}`);
	const dur = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} j ${String(min % 60).padStart(2, '0')} m` : `${min} menit`);
	/** minutes of delivered samples below a limit */
	const minutesBelow = (xs: Sample[], c: Channel, lim: number) => xs.filter((s) => !s.miss && (s[c] ?? Infinity) < lim).length * STEP;

	let tiles = $derived.by((): Tile[] => {
		const { flow, p1, p2, level } = st;
		const hours = (samples.length * STEP) / 60;
		if (flow) {
			const vol = volume(samples);
			const out: Tile[] = [
				{ k: 'Volume', v: fmtNum(vol), u: 'm³', s: span === 1 ? `≈ ${fmtNum(vol / hours)} m³/jam` : `≈ ${fmtNum((vol * 24) / hours)} m³/hari` },
				{ k: 'Debit rata-rata', v: f1(flow.avg), u: 'L/s', s: `maks ${f1(flow.max)} · ${when(flow.maxAt)}` }
			];
			if (sel.type === 'DMA' && sel.role === 'in') {
				const night = [...days].reverse().map((d) => ({ d, v: mnfPast(sel.zone, d, now) })).find((x) => x.v != null);
				const base = mnf(sel.zone, false);
				const ch = night ? night.v! / base - 1 : 0;
				out.push(
					night
						? {
								k: 'MNF zona · 02–04',
								v: f1(night.v!),
								u: 'L/s',
								s: `${ch >= 0 ? '+' : ''}${fmtNum(ch * 100, 0)}% vs baseline ${f1(base)} · ${dayName(night.d)}`,
								tone: toneOf(levelAbove(ch * 100, LIMITS.mnf))
							}
						: { k: 'MNF zona · 02–04', v: '—', s: 'jendela 02:00–04:00 belum selesai' }
				);
			} else if (sel.type === 'DMA') {
				out.push({ k: 'Debit minimum', v: f1(flow.min), u: 'L/s', s: when(flow.minAt) });
			} else {
				const hand = HANDOVER.find((h) => h.id === sel.id);
				out[1].s = hand ? `kontrak ${hand.contract} L/s · ${fmtNum((flow.avg / hand.contract) * 100, 1)}%` : out[1].s;
				out.push({ k: 'Debit maksimum', v: f1(flow.max), u: 'L/s', s: when(flow.maxAt) });
			}
			const p = p2 ?? p1;
			if (p) {
				const lv = levelBelow(p.min, LIMITS.pMin);
				const k = sel.type === 'SC' ? 'Tekanan minimum' : sel.role === 'in' ? 'Tekanan P2 min' : 'Tekanan ujung min';
				out.push({ k, v: f2(p.min), u: 'bar', s: `${when(p.minAt)} · ${LEVEL_LABEL[lv]}`, tone: toneOf(lv) });
			}
			return out;
		}
		if (p1) {
			const lv = levelBelow(p1.min, LIMITS.pMin);
			const low = minutesBelow(samples, 'p1', LIMITS.pMin[0]);
			return [
				{ k: 'Tekanan rata-rata', v: f2(p1.avg), u: 'bar', s: 'batas layanan 0,7 bar' },
				{ k: 'Minimum', v: f2(p1.min), u: 'bar', s: `${when(p1.minAt)} · ${LEVEL_LABEL[lv]}`, tone: toneOf(lv) },
				{ k: 'Maksimum', v: f2(p1.max), u: 'bar', s: when(p1.maxAt) },
				{ k: 'Di bawah 1,0 bar', v: dur(low), s: `di bawah 0,7 bar: ${dur(minutesBelow(samples, 'p1', LIMITS.pMin[1]))}`, tone: low ? 'warn' : undefined }
			];
		}
		if (level) {
			const lv = levelBelow(level.min, LIMITS.level);
			const low = minutesBelow(samples, 'level', LIMITS.level[0]);
			return [
				{ k: 'Level rata-rata', v: f1(level.avg), u: '%', s: `dalam ${fmtNum(hours, 0)} jam data` },
				{ k: 'Minimum', v: f1(level.min), u: '%', s: `${when(level.minAt)} · ${LEVEL_LABEL[lv]}`, tone: toneOf(lv) },
				{ k: 'Maksimum', v: f1(level.max), u: '%', s: when(level.maxAt) },
				{ k: 'Di bawah 45%', v: dur(low), s: 'ambang waspada level', tone: low ? 'warn' : undefined }
			];
		}
		return [];
	});

	/* ---- completeness, weighted like the Rekap page (today counts the minutes so far) ---- */
	let comp = $derived.by(() => {
		let got = 0;
		let all = 0;
		for (const d of days) {
			const mins = d === 0 ? Math.max(1, Math.floor(live.h * 60)) : 1440;
			all += mins;
			got += (mins * completenessPast(sel.id, d)) / 100;
		}
		return { pct: (100 * got) / all, got: Math.round(got), all };
	});

	/* ---- table: one row per day, or per hour when one day is on screen ---- */
	interface Row {
		key: string;
		label: string;
		sub?: string;
		d: number;
		hour?: number;
		xs: Sample[];
		st: Record<Channel, Stat | null>;
		vol: number;
		mnf: number | null;
		comp: number | null;
		ev: HistEvent[];
	}
	let rows = $derived.by((): Row[] => {
		const make = (key: string, label: string, sub: string | undefined, d: number, xs: Sample[], hour?: number): Row => ({
			key,
			label,
			sub,
			d,
			hour,
			xs,
			st: Object.fromEntries(chans.map((c) => [c, stat(xs, c)])) as Record<Channel, Stat | null>,
			vol: volume(xs),
			mnf: hour == null && sel.type === 'DMA' && sel.role === 'in' ? mnfPast(sel.zone, d, now) : null,
			comp: hour == null ? completenessPast(sel.id, d) : null,
			ev: myEvents.filter((e) => e.d === d && (hour == null || Math.floor(e.h) === hour))
		});
		if (span === 1) {
			const { d, xs } = perDay[0];
			const per = 60 / STEP;
			const out: Row[] = [];
			for (let h = 0; h * per < xs.length; h++) out.push(make(`h${h}`, fmtClock(h), `–${fmtClock(h + 1)}`, d, xs.slice(h * per, (h + 1) * per), h));
			return out.reverse();
		}
		return perDay.map((p) => make(`d${p.d}`, dayName(p.d), p.d === 0 ? `s.d. ${fmtClock(now)}` : undefined, p.d, p.xs)).reverse();
	});

	interface Col {
		k: string;
		v: (r: Row) => string;
		/** sample time printed under the value */
		at?: (r: Row) => number | undefined;
		c?: (r: Row) => string | undefined;
	}
	const warnColor = (l: AlertLevel) => (l === 'normal' ? undefined : LEVEL_COLOR[l]);
	const avgCol = (k: string, c: Channel, fmt: (v: number) => string): Col => ({ k, v: (r) => (r.st[c] ? fmt(r.st[c].avg) : '—') });
	const minCol = (k: string, c: Channel, fmt: (v: number) => string, warn?: (v: number) => AlertLevel): Col => ({
		k,
		v: (r) => (r.st[c] ? fmt(r.st[c].min) : '—'),
		at: (r) => r.st[c]?.minAt,
		c: (r) => (warn && r.st[c] ? warnColor(warn(r.st[c].min)) : undefined)
	});
	const maxCol = (k: string, c: Channel, fmt: (v: number) => string): Col => ({ k, v: (r) => (r.st[c] ? fmt(r.st[c].max) : '—'), at: (r) => r.st[c]?.maxAt });
	const COMP_COLOR = { ok: 'var(--green)', warn: 'var(--amber)', bad: 'var(--danger)' };
	const UNITS: Record<AssetType, string> = {
		DMA: 'volume m³ · debit L/s · tekanan bar',
		SC: 'volume m³ · debit L/s · tekanan bar',
		PT: 'tekanan bar',
		RES: 'level %'
	};

	let cols = $derived.by((): Col[] => {
		const pWarn = (v: number) => levelBelow(v, LIMITS.pMin);
		const out: Col[] = [];
		if (sel.type === 'DMA' || sel.type === 'SC') {
			out.push(
				{ k: 'Volume', v: (r) => fmtNum(r.vol) },
				avgCol('Debit rata²', 'flow', f1),
				minCol('Debit min', 'flow', f1),
				maxCol('Debit maks', 'flow', f1)
			);
			if (span > 1 && sel.type === 'DMA' && sel.role === 'in') {
				const base = mnf(sel.zone, false);
				out.push({
					k: 'MNF',
					v: (r) => (r.mnf == null ? '—' : f1(r.mnf)),
					c: (r) => (r.mnf == null ? undefined : warnColor(levelAbove((r.mnf / base - 1) * 100, LIMITS.mnf)))
				});
			}
			if (sel.type === 'DMA') out.push(avgCol('P1 rata²', 'p1', f2), minCol('P2 min', 'p2', f2, pWarn));
			else out.push(avgCol('Tekanan rata²', 'p1', f2));
		} else if (sel.type === 'PT') {
			out.push(
				avgCol('Tekanan rata²', 'p1', f2),
				minCol('Min', 'p1', f2, pWarn),
				maxCol('Maks', 'p1', f2),
				{ k: '< 1,0 bar', v: (r) => dur(minutesBelow(r.xs, 'p1', LIMITS.pMin[0])) }
			);
		} else {
			out.push(
				avgCol('Level rata²', 'level', f1),
				minCol('Min', 'level', f1, (v) => levelBelow(v, LIMITS.level)),
				maxCol('Maks', 'level', f1),
				{ k: '< 45%', v: (r) => dur(minutesBelow(r.xs, 'level', LIMITS.level[0])) }
			);
		}
		if (span > 1) out.push({ k: 'Lengkap', v: (r) => `${fmtNum(r.comp ?? 100, 1)}%`, c: (r) => COMP_COLOR[completenessTone(r.comp ?? 100)] });
		return out;
	});

	/* ---- labels ---- */
	let rangeLabel = $derived(
		`${span === 1 ? `${fmtWeekday(dateOf(end))} ${fmtDay(dateOf(end))}` : `${fmtDay(dateOf(oldest))} – ${fmtDay(dateOf(end))}`} ${dateOf(end).getFullYear()}` +
			(end === 0 ? ` · s.d. ${fmtClock(now)}` : '')
	);
	const typeTag = $derived(sel.type === 'DMA' ? (sel.role === 'in' ? 'INLET' : 'OUTLET') : TYPE_META[sel.type].short);

	/** The window's raw 5-minute samples as CSV (dot decimals, empty cells for missing records). */
	function exportCsv() {
		const name = (c: Channel) => (c === 'flow' ? 'debit_lps' : c === 'level' ? 'level_pct' : sel.type === 'DMA' ? `${c}_bar` : 'tekanan_bar');
		const body = samples.map((s) => {
			const { d, m } = dayMin(s.t);
			const vals = chans.map((c) => (s.miss || s[c] == null ? '' : s[c]!.toFixed(c === 'p1' || c === 'p2' ? 3 : 2)));
			return [`${iso(dateOf(d))} ${fmtClock(m / 60)}`, ...vals].join(',');
		});
		const a = document.createElement('a');
		a.href = URL.createObjectURL(new Blob([['waktu', ...chans.map(name)].join(',') + '\n' + body.join('\n')], { type: 'text/csv' }));
		a.download = `${sel.id}_${iso(dateOf(oldest))}_${iso(dateOf(end))}.csv`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
		notify(`${a.download} · ${fmtNum(body.length)} rekaman 5 menit diunduh`);
	}
</script>

<svelte:head><title>Data Historis · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Data Historis" sub="Arsip {RETENTION} hari · sampel 5 menit · {ASSETS.length} logger" icon={History}>
		<a class="demo-btn" href="/demo/pdam/realtime?id={sel.id}"><Activity size={15} /> Realtime</a>
		<button class="demo-btn demo-btn--primary" onclick={exportCsv}><FileDown size={15} /> Ekspor CSV</button>
	</PageHead>

	<div class="rt-layout">
		<LoggerPicker selected={sel.id} onpick={pick} />

		<section class="rt-main">
			<div class="card rt-head">
				<div class="rt-head__l">
					<span class="rt-head__type" style="--c:{TYPE_META[sel.type].color}">{typeTag}</span>
					<div class="rt-head__titles">
						<span class="rt-head__id">{sel.id} · {TYPE_META[sel.type].label}</span>
						<span class="rt-head__name">{sel.name}</span>
						<span class="rt-head__meta">Zona {ZONE_BY_ID[sel.zone].name} · {dev?.logger} · {dev?.sensor}</span>
					</div>
				</div>
				<div class="hist-ctrl">
					<div class="demo-seg" role="group" aria-label="Rentang waktu">
						{#each SPANS as s (s)}
							<button class:is-on={span === s} onclick={() => setWindow(s, end)}>{s} hari</button>
						{/each}
					</div>
					<div class="hist-date">
						<button class="demo-btn demo-btn--sm" aria-label="Periode sebelumnya" disabled={oldest >= RETENTION - 1} onclick={() => setWindow(span, end + span)}>
							<ChevronLeft size={14} />
						</button>
						<label>
							<span>{span === 1 ? 'Tanggal' : 's.d.'}</span>
							<input
								type="date"
								min={iso(dateOf(RETENTION - span))}
								max={iso(dateOf(0))}
								value={iso(dateOf(end))}
								onchange={(e) => pickDate(e.currentTarget.value)}
							/>
						</label>
						<button class="demo-btn demo-btn--sm" aria-label="Periode berikutnya" disabled={end === 0} onclick={() => setWindow(span, end - span)}>
							<ChevronRight size={14} />
						</button>
					</div>
				</div>
				<div class="rt-head__foot">
					<span><b>{rangeLabel}</b></span>
					<span>grafik per {RES_LABEL[span]}</span>
					<span>kelengkapan <b>{fmtNum(comp.pct, 1)}%</b> · {fmtNum(comp.got)}/{fmtNum(comp.all)} rekaman</span>
					<span>{myEvents.length} kejadian</span>
					<a class="rt-head__link" href="/demo/pdam/rekap?id={sel.id}">Rekap kelengkapan</a>
				</div>
			</div>

			<div class="rt-tiles">
				{#each tiles as t (t.k)}
					<div class="rt-tile" class:rt-tile--warn={t.tone === 'warn'} class:rt-tile--alarm={t.tone === 'alarm'}>
						<span class="rt-tile__k">{t.k}</span>
						<span class="rt-tile__v" style:color={t.c}>{t.v}{#if t.u}<small>{t.u}</small>{/if}</span>
						{#if t.s}<span class="rt-tile__s">{t.s}</span>{/if}
					</div>
				{/each}
			</div>

			{#each charts as c (sel.id + c.key)}
				<div class="card rt-trend hist-chart">
					<div class="rt-trend__h">
						<span class="label">{c.title}<small> · {c.unit}</small></span>
						{#if c.legend.length}
							<span class="rt-trend__legend">
								{#each c.legend as l (l.label)}
									<span class="pdam-legend-mini"><i style="background:{l.color}"></i>{l.label}</span>
								{/each}
							</span>
						{/if}
					</div>
					<span class="rt-trend__stats hist-read" class:is-on={cur != null}>{cur == null ? c.stats : `${bucketLabel(cur)} · ${c.read(cur)}`}</span>
					<LineChart
						series={c.series}
						x0={bx(0)}
						{x1}
						min={c.range.min}
						max={c.range.max}
						height={charts.length > 1 ? 190 : 250}
						lines={c.lines}
						bands={c.bands}
						{marks}
						cursor={cur == null ? null : bx(cur)}
						{xTicks}
						yFmt={c.yFmt}
						{onhover}
					/>
				</div>
			{/each}

			<div class="card hist-events">
				<div class="card-h">
					<div style="display:flex;flex-direction:column;gap:3px">
						<span class="label">Catatan kejadian · periode ini</span>
						<span class="pdam-muted">kebocoran, perbaikan & gangguan logger · klik untuk membuka datanya</span>
					</div>
					<span class="pill" style="font-size:11px">{myEvents.length} di zona {ZONE_BY_ID[sel.zone].name}</span>
				</div>
				{#if events.length}
					<ul class="hist-ev">
						{#each events as e (e.d + '|' + e.h + e.label)}
							<li class:is-other={!mine(e)}>
								<button onclick={() => jump(e)}>
									<i style="background:{TONE[e.tone]}"></i>
									<span class="hist-ev__t">{dayName(e.d)} · {fmtClock(e.h)}</span>
									<span class="hist-ev__l">{e.label}</span>
									<span class="hist-ev__id">{e.id}</span>
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="pdam-muted hist-ev__none">Tidak ada kejadian tercatat pada periode ini.</p>
				{/if}
			</div>

			<div class="card rt-log">
				<div class="card-h" style="margin-bottom:10px">
					<div style="display:flex;flex-direction:column;gap:3px">
						<span class="label">{span === 1 ? 'Rekap per jam' : 'Rekap harian'} · {sel.id}</span>
						<span class="pdam-muted"
							>{UNITS[sel.type]} · terbaru di atas · {span === 1 ? 'dari sampel 5 menit' : 'klik tanggal untuk membuka 24 jamnya'}</span
						>
					</div>
				</div>
				<div class="rt-log__scroll hist-scroll">
					<table class="demo-table rt-log__table hist-table">
						<thead>
							<tr>
								<th>{span === 1 ? 'Jam' : 'Tanggal'}</th>
								<th>Kejadian</th>
								{#each cols as c (c.k)}<th>{c.k}</th>{/each}
							</tr>
						</thead>
						<tbody>
							{#each rows as r (r.key)}
								<tr class:is-focus={curAt != null && (span === 1 ? r.hour === Math.floor(curAt.m / 60) : r.d === curAt.d)}>
									<td>
										{#if span > 1}
											<button class="hist-day" onclick={() => setWindow(1, r.d)}>{r.label}{#if r.sub}<small>{r.sub}</small>{/if}</button>
										{:else}
											<span class="mono">{r.label}<small class="hist-at">{r.sub}</small></span>
										{/if}
									</td>
									<td class="hist-evcell">
										{#each r.ev as e (e.h + e.label)}<i style="background:{TONE[e.tone]}" title="{fmtClock(e.h)} · {e.label}"></i>{/each}
									</td>
									{#each cols as c (c.k)}
										{@const at = c.at?.(r)}
										<td class="mono" style:color={c.c?.(r)}>{c.v(r)}{#if at != null}<small class="hist-at">{clockOf(at)}</small>{/if}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	</div>
</div>
