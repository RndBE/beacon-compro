<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Activity, ChevronLeft, ChevronRight, FileDown, History } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import LineChart, { yRange, type ChartSeries } from '$lib/components/demo-pdam/LineChart.svelte';
	import LoggerPicker from '$lib/components/demo-spam/LoggerPicker.svelte';
	import { FLOW_EPS, LOGGER_BY_ID, RESERVOIRS, decodeFault, roleTag, type Channel } from '$lib/components/demo-spam/wosusokas';
	import { INTERVAL_MIN, bucketsOf, field, type Interval } from '$lib/components/demo-spam/field.svelte';
	import type { Bucket } from '$lib/components/demo-spam/scenario';
	import { completenessTone, dayMin, fmtClock, fmtDay, fmtNum, fmtWeekday, isoDate, lastDays } from '$lib/components/demo-spam/util';

	const DEFAULT_ID = '10373';
	const RETENTION = 90;
	const SPANS = [1, 7, 30, 90] as const;
	type Span = (typeof SPANS)[number];
	const INTERVAL: Record<Span, Interval> = { 1: '5m', 7: '1h', 30: '1h', 90: '1d' };
	const RES_LABEL: Record<Span, string> = { 1: '5 menit', 7: 'jam', 30: 'jam', 90: 'hari' };
	const C = { flow: '#3CC3F2', p1: '#A08BFF', p2: '#4FD4E8' };
	const COMP_COLOR = { ok: 'var(--green)', warn: 'var(--amber)', bad: 'var(--danger)' };

	const DATES = lastDays(RETENTION);
	const dateOf = (d: number) => DATES[RETENTION - 1 - d];
	const dayName = (d: number) => `${fmtWeekday(dateOf(d))} ${fmtDay(dateOf(d))}`;
	const clockOf = (t: number) => fmtClock(dayMin(t).m / 60);
	const f1 = (v: number) => (Number.isFinite(v) ? fmtNum(v, 1) : '—');
	const f2 = (v: number) => (Number.isFinite(v) ? fmtNum(v, 2) : '—');
	const dur = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} j ${String(Math.round(min % 60)).padStart(2, '0')} m` : `${Math.round(min)} menit`);

	/* ---- selection: the logger lives in the URL; ?d= and ?span= open a window ---- */
	let sel = $derived(LOGGER_BY_ID[$page.url.searchParams.get('id') ?? ''] ?? LOGGER_BY_ID[DEFAULT_ID]);
	const clampEnd = (e: number, s: Span) => Math.min(Math.max(0, Math.round(e)), RETENTION - s);
	const init = $page.url.searchParams;
	const initSpan = SPANS.find((s) => s === Number(init.get('span'))) ?? (init.has('d') ? 1 : 7);
	let span = $state<Span>(initSpan);
	/** newest day of the window, days back from today */
	let end = $state(clampEnd(Number(init.get('d')) || 0, initSpan));
	let hover = $state<number | null>(null);

	function pick(id: string) {
		if (id === sel.id) return;
		hover = null;
		goto(`/demo/spam/historis?id=${id}`, { replaceState: true, noScroll: true, keepFocus: true });
	}
	function setWindow(s: Span, e: number) {
		span = s;
		end = clampEnd(e, s);
		hover = null;
	}
	function pickDate(v: string) {
		const [y, m, d] = v.split('-').map(Number);
		if (y) setWindow(span, (DATES[RETENTION - 1].getTime() - new Date(y, m - 1, d, 12).getTime()) / 86_400_000);
	}

	/* ---- the window: x in hours from its first midnight ---- */
	let oldest = $derived(end + span - 1);
	let interval = $derived(INTERVAL[span]);
	let B = $derived(INTERVAL_MIN[interval]);
	let t0 = $derived(-1440 * oldest);
	/** exclusive end: the newest day's midnight, or now when that day is today */
	let tEnd = $derived(Math.min(-1440 * end + 1440, field.now + 1));
	let count = $derived(Math.max(2, Math.ceil((tEnd - t0) / B)));
	const bx = (i: number) => (i * B + B / 2) / 60;
	const idxAt = (x: number) => Math.max(0, Math.min(count - 1, Math.round((x * 60 - B / 2) / B)));

	/* ---- data ---- */
	let buckets = $state<Bucket[]>([]);
	let loadedKey = $state('');
	let err = $state('');
	let key = $derived(`${sel.id}|${field.mode}|${oldest}|${end}|${interval}`);
	// a window that includes today picks up new buckets every 5 minutes
	let refresh = $derived(end === 0 ? Math.floor(field.now / 5) : 0);
	$effect(() => {
		const k = key;
		void refresh;
		let stale = false;
		bucketsOf(sel, dateOf(oldest), dateOf(end), interval)
			.then((b) => {
				if (stale) return;
				buckets = b;
				loadedKey = k;
				err = '';
			})
			.catch((e) => {
				if (stale) return;
				buckets = [];
				loadedKey = k;
				err = e instanceof Error ? e.message : String(e);
			});
		return () => {
			stale = true;
		};
	});
	let ready = $derived(loadedKey === key);

	/** the window's buckets on a regular grid, null where the logger sent nothing */
	let grid = $derived.by(() => {
		const at = new Array<Bucket | null>(count).fill(null);
		for (const b of buckets) {
			const i = Math.round((b.t - t0) / B);
			if (i >= 0 && i < count) at[i] = b;
		}
		return at;
	});
	const line = (c: Channel, f: 'avg' | 'min' | 'max') => grid.map((b) => b?.v[c]?.[f] ?? NaN);
	let env = $derived(interval !== '5m');
	/** the pressure a station hands on: P2 downstream where there is one */
	let pk = $derived<Channel>(sel.pressures === 2 ? 'p2' : 'p1');

	/* ---- period summary ---- */
	function summary(bs: Bucket[], minutes: number) {
		let n = 0;
		let sum = 0;
		let max = -Infinity;
		let maxAt = 0;
		let psum = 0;
		let pn = 0;
		let pmin = Infinity;
		let flowing = 0;
		let fault = 0;
		for (const b of bs) {
			n += b.n;
			fault |= b.fault ?? 0;
			const f = b.v.flow;
			if (f) {
				sum += f.avg * b.n;
				if (f.max > max) [max, maxAt] = [f.max, b.t];
				if (f.avg > FLOW_EPS) flowing += b.n;
			}
			const p = b.v[pk];
			if (p) {
				psum += p.avg * b.n;
				pn += b.n;
				pmin = Math.min(pmin, p.min);
			}
		}
		// volume: the meter's own totalizer where it moved forward, else the flow integral
		const tots = bs.filter((b) => b.v.tot);
		const delta = tots.length > 1 ? tots.at(-1)!.v.tot!.max - tots[0].v.tot!.min : NaN;
		const integral = bs.reduce((a, b) => a + (b.v.flow ? b.v.flow.avg * b.n * 0.06 : 0), 0);
		return {
			n,
			avg: n ? sum / n : NaN,
			max,
			maxAt,
			pavg: pn ? psum / pn : NaN,
			pmin,
			flowing,
			fault,
			vol: Number.isFinite(delta) && delta >= 0 ? delta : integral,
			fromTot: Number.isFinite(delta) && delta >= 0,
			comp: Math.min(100, (100 * n) / Math.max(1, minutes))
		};
	}
	let total = $derived(summary(buckets, tEnd - t0));

	/* ---- charts ---- */
	const bucketLabel = (i: number) => {
		const { d, m } = dayMin(t0 + i * B);
		if (B === 1440) return dayName(d);
		if (B === 5) return fmtClock(m / 60);
		return `${dayName(d)} · ${fmtClock(m / 60)}–${fmtClock((m + B) / 60)}`;
	};
	let cur = $derived(hover);
	const onhover = (x: number | null) => (hover = x == null ? null : idxAt(x));
	const spread = (c: Channel, fmt: (v: number) => string, i: number) => {
		const b = grid[i]?.v[c];
		if (!b) return 'tidak ada data';
		return env ? `${fmt(b.avg)} (${fmt(b.min)}–${fmt(b.max)})` : fmt(b.avg);
	};
	let x1 = $derived(bx(count - 1));
	let xTicks = $derived.by(() => {
		if (span === 1) {
			const out: { v: number; t: string }[] = [];
			for (let h = 0; h < 24 && h <= x1 - 1.5; h += 3) out.push({ v: h, t: fmtClock(h) });
			out.push(end === 0 ? { v: x1, t: 'kini' } : { v: 24, t: '24:00' });
			return out;
		}
		const every = span === 7 ? 1 : span === 30 ? 5 : 15;
		return Array.from({ length: span }, (_, i) => oldest - i)
			.filter((d) => (d - end) % every === 0)
			.map((d) => ({ v: 24 * (oldest - d) + 12, t: span === 7 ? `${fmtWeekday(dateOf(d))} ${dateOf(d).getDate()}` : fmtDay(dateOf(d)) }));
	});
	function trace(c: Channel, color: string, main = true): ChartSeries[] {
		if (!main) return [{ values: line(c, 'avg'), color, width: 1.4 }];
		return env
			? [
					{ values: line(c, 'max'), lo: line(c, 'min'), color, width: 0 },
					{ values: line(c, 'avg'), color, width: 1.8 }
				]
			: [{ values: line(c, 'avg'), color, fill: true }];
	}
	let charts = $derived.by(() => {
		const flow = { key: 'flow', title: 'Debit', unit: 'L/s', series: trace('flow', C.flow), read: (i: number) => `${spread('flow', f1, i)} L/s`, fmt: (v: number) => fmtNum(v, 0), range: yRange([...line('flow', 'min'), ...line('flow', 'max')], 2) };
		const pr =
			sel.pressures === 2
				? { key: 'p', title: 'Tekanan P1 · P2', unit: 'bar', series: [...trace('p1', C.p1, false), ...trace('p2', C.p2)], read: (i: number) => `P1 ${f2(grid[i]?.v.p1?.avg ?? NaN)} · P2 ${spread('p2', f2, i)} bar`, fmt: (v: number) => fmtNum(v, 1), range: yRange([...line('p1', 'avg'), ...line('p2', 'min'), ...line('p2', 'max')], 0.5) }
				: { key: 'p', title: 'Tekanan', unit: 'bar', series: trace('p1', C.p1), read: (i: number) => `${spread('p1', f2, i)} bar`, fmt: (v: number) => fmtNum(v, 1), range: yRange([...line('p1', 'min'), ...line('p1', 'max')], 0.5) };
		return [flow, pr];
	});

	/* ---- table: one row per day, or per hour when one day is on screen ---- */
	let rows = $derived.by(() => {
		const size = span === 1 ? 60 : 1440;
		const groups = new Map<number, Bucket[]>();
		for (const b of buckets) {
			const g = Math.floor(b.t / size) * size;
			if (!groups.has(g)) groups.set(g, []);
			groups.get(g)!.push(b);
		}
		const starts = [];
		for (let g = t0; g < tEnd; g += size) starts.push(g);
		return starts.reverse().map((g) => ({
			g,
			d: dayMin(g).d,
			label: span === 1 ? fmtClock(dayMin(g).m / 60) : dayName(dayMin(g).d),
			s: summary(groups.get(g) ?? [], Math.min(size, tEnd - g))
		}));
	});

	/* ---- labels ---- */
	let rangeLabel = $derived(
		`${span === 1 ? dayName(end) : `${fmtDay(dateOf(oldest))} – ${fmtDay(dateOf(end))}`} ${dateOf(end).getFullYear()}` + (end === 0 ? ` · s.d. ${fmtClock(field.now / 60)}` : '')
	);

	function exportCsv() {
		const chans: Channel[] = ['flow', 'p1', ...(sel.pressures === 2 ? (['p2'] as Channel[]) : []), 'tot'];
		const head = ['waktu', 'jumlah_rekaman', ...chans.flatMap((c) => [`${c}_rata`, `${c}_min`, `${c}_maks`]), 'fault_or'];
		const body = buckets.map((b) => {
			const { d, m } = dayMin(b.t);
			const vals = chans.flatMap((c) => {
				const v = b.v[c];
				return v ? [v.avg, v.min, v.max].map((x) => x.toFixed(3)) : ['', '', ''];
			});
			return [`${isoDate(dateOf(d))} ${fmtClock(m / 60)}`, b.n, ...vals, b.fault ?? ''].join(',');
		});
		const a = document.createElement('a');
		a.href = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv' }));
		a.download = `${sel.id}_${isoDate(dateOf(oldest))}_${isoDate(dateOf(end))}_${interval}${field.mode === 'skenario' ? '_simulasi' : ''}.csv`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
		notify(`${a.download} · ${fmtNum(body.length)} bucket diunduh`);
	}
</script>

<svelte:head><title>Data Historis · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Data Historis" sub="Ringkasan per bucket dari mini-stesy · 12 logger · riwayat sejak logger terpasang" icon={History}>
		<a class="demo-btn" href="/demo/spam/realtime?id={sel.id}"><Activity size={15} /> Realtime</a>
		<button class="demo-btn demo-btn--primary" onclick={exportCsv} disabled={!buckets.length}><FileDown size={15} /> Ekspor CSV</button>
	</PageHead>

	<div class="rt-layout">
		<LoggerPicker selected={sel.id} onpick={pick} />

		<section class="rt-main">
			<div class="card rt-head">
				<div class="rt-head__l">
					<span class="rt-head__type" style="--c:{sel.role === 'in' ? '#A08BFF' : '#3CC3F2'}">{roleTag(sel)}</span>
					<div class="rt-head__titles">
						<span class="rt-head__id">{sel.id} · Flowmeter DMA {sel.dma}</span>
						<span class="rt-head__name">{sel.name}</span>
						<span class="rt-head__meta">{RESERVOIRS[sel.reservoir].name} · {sel.pressures === 2 ? 'P1 hulu & P2 hilir' : '1 titik tekanan'}</span>
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
							<input type="date" min={isoDate(dateOf(RETENTION - span))} max={isoDate(dateOf(0))} value={isoDate(dateOf(end))} onchange={(e) => pickDate(e.currentTarget.value)} />
						</label>
						<button class="demo-btn demo-btn--sm" aria-label="Periode berikutnya" disabled={end === 0} onclick={() => setWindow(span, end - span)}>
							<ChevronRight size={14} />
						</button>
					</div>
				</div>
				<div class="rt-head__foot">
					<span><b>{rangeLabel}</b></span>
					<span>grafik per {RES_LABEL[span]}</span>
					<span>kelengkapan <b>{fmtNum(total.comp, 1)}%</b> · {fmtNum(total.n)} rekaman</span>
					{#if field.mode === 'skenario'}<span class="spam-badge spam-badge--sim">SIMULASI</span>{:else}<span class="spam-badge">LAPANGAN</span>{/if}
				</div>
			</div>

			{#if err}
				<div class="card spam-note"><span>Data historis gagal dimuat: {err}</span></div>
			{:else if ready && !buckets.length}
				<div class="card spam-note"><span>Tidak ada rekaman {sel.id} pada periode ini. Riwayat logger ini dimulai sejak terpasang di lapangan.</span></div>
			{/if}

			<div class="rt-tiles rt-tiles--6">
				<div class="rt-tile"><span class="rt-tile__k">Volume</span><span class="rt-tile__v">{fmtNum(total.vol)}<small>m³</small></span><span class="rt-tile__s">{total.fromTot ? 'dari totalizer meter' : 'integral debit'}</span></div>
				<div class="rt-tile"><span class="rt-tile__k">Debit rata-rata</span><span class="rt-tile__v">{f1(total.avg)}<small>L/s</small></span><span class="rt-tile__s">{Number.isFinite(total.max) ? `maks ${f1(total.max)} · ${span === 1 ? clockOf(total.maxAt) : `${dayName(dayMin(total.maxAt).d)} ${clockOf(total.maxAt)}`}` : '—'}</span></div>
				<div class="rt-tile" class:rt-tile--warn={total.n > 0 && total.flowing < total.n * 0.5}>
					<span class="rt-tile__k">Waktu mengalir</span><span class="rt-tile__v">{dur(total.flowing)}</span><span class="rt-tile__s">{total.n ? `${fmtNum((100 * total.flowing) / total.n, 0)}% rekaman · debit > ${fmtNum(FLOW_EPS, 1)} L/s` : '—'}</span>
				</div>
				<div class="rt-tile"><span class="rt-tile__k">Tekanan {sel.pressures === 2 ? 'hilir (P2)' : ''}</span><span class="rt-tile__v">{f2(total.pavg)}<small>bar</small></span><span class="rt-tile__s">minimum {f2(total.pmin)} bar</span></div>
				<div class="rt-tile" class:rt-tile--warn={total.comp < 97}>
					<span class="rt-tile__k">Kelengkapan data</span><span class="rt-tile__v" style:color={COMP_COLOR[completenessTone(total.comp)]}>{fmtNum(total.comp, 1)}<small>%</small></span><span class="rt-tile__s">{fmtNum(total.n)} rekaman · {fmtNum(tEnd - t0)} menit</span>
				</div>
				<div class="rt-tile" class:rt-tile--warn={total.fault > 0}>
					<span class="rt-tile__k">Fault periode</span><span class="rt-tile__v">{total.fault ? `${decodeFault(total.fault).length} jenis` : 'Tidak ada'}</span><span class="rt-tile__s">{total.fault ? decodeFault(total.fault).map((x) => x.replace(' warning', '')).join(' · ') : 'flowmeter normal'}</span>
				</div>
			</div>

			{#each charts as c (sel.id + c.key)}
				<div class="card rt-trend hist-chart">
					<div class="rt-trend__h">
						<span class="label">{c.title}<small> · {c.unit}</small></span>
						{#if c.key === 'p' && sel.pressures === 2}
							<span class="rt-trend__legend">
								<span class="pdam-legend-mini"><i style="background:{C.p1}"></i>P1 hulu</span>
								<span class="pdam-legend-mini"><i style="background:{C.p2}"></i>P2 hilir{env ? ' · min–maks' : ''}</span>
							</span>
						{:else if env}
							<span class="rt-trend__legend"><span class="pdam-legend-mini"><i style="background:{c.key === 'flow' ? C.flow : C.p1}"></i>rata-rata · rentang min–maks</span></span>
						{/if}
					</div>
					<span class="rt-trend__stats hist-read" class:is-on={cur != null}>{cur == null ? (ready ? `${buckets.length} bucket berisi data dari ${count}` : 'memuat…') : `${bucketLabel(cur)} · ${c.read(cur)}`}</span>
					<LineChart
						series={c.series}
						x0={bx(0)}
						{x1}
						min={c.range.min}
						max={c.range.max}
						height={200}
						cursor={cur == null ? null : bx(cur)}
						{xTicks}
						yFmt={c.fmt}
						{onhover}
					/>
				</div>
			{/each}

			<div class="card rt-log">
				<div class="card-h" style="margin-bottom:10px">
					<div style="display:flex;flex-direction:column;gap:3px">
						<span class="label">{span === 1 ? 'Rekap per jam' : 'Rekap harian'} · {sel.id}</span>
						<span class="pdam-muted">volume m³ · debit L/s · tekanan bar · terbaru di atas{span > 1 ? ' · klik tanggal untuk membuka 24 jamnya' : ''}</span>
					</div>
				</div>
				<div class="rt-log__scroll hist-scroll">
					<table class="demo-table rt-log__table hist-table">
						<thead>
							<tr><th>{span === 1 ? 'Jam' : 'Tanggal'}</th><th>Lengkap</th><th>Volume</th><th>Debit rata²</th><th>Debit maks</th><th>Mengalir</th><th>Tekanan rata²</th><th>Tekanan min</th><th>Fault</th></tr>
						</thead>
						<tbody>
							{#each rows as x (x.g)}
								<tr class:spam-dim={!x.s.n}>
									<td>
										{#if span > 1}
											<button class="hist-day" onclick={() => setWindow(1, x.d)}>{x.label}</button>
										{:else}
											<span class="mono">{x.label}</span>
										{/if}
									</td>
									<td class="mono" style:color={x.s.n ? COMP_COLOR[completenessTone(x.s.comp)] : undefined}>{fmtNum(x.s.comp, 1)}%</td>
									<td class="mono">{x.s.n ? fmtNum(x.s.vol, 1) : '—'}</td>
									<td class="mono">{f1(x.s.avg)}</td>
									<td class="mono">{Number.isFinite(x.s.max) ? f1(x.s.max) : '—'}{#if Number.isFinite(x.s.max)}<small class="hist-at">{clockOf(x.s.maxAt)}</small>{/if}</td>
									<td class="mono">{x.s.n ? `${fmtNum((100 * x.s.flowing) / x.s.n, 0)}%` : '—'}</td>
									<td class="mono">{f2(x.s.pavg)}</td>
									<td class="mono">{Number.isFinite(x.s.pmin) ? f2(x.s.pmin) : '—'}</td>
									<td class="mono" class:rt-log__warn={x.s.fault > 0}>{x.s.fault ? decodeFault(x.s.fault).map((f) => f.replace(' warning', '')).join(', ') : '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	</div>
</div>
