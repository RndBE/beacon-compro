<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Activity, History, List } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { yRange, type ChartSeries } from '$lib/components/demo-pdam/LineChart.svelte';
	import RealtimeTrendCard from '$lib/components/demo-spam/RealtimeTrendCard.svelte';
	import LoggerPicker from '$lib/components/demo-spam/LoggerPicker.svelte';
	import { LOGGER_BY_ID, RESERVOIRS, decodeFault, roleTag, type Channel } from '$lib/components/demo-spam/wosusokas';
	import { field, reading, recentRows, statusOf } from '$lib/components/demo-spam/field.svelte';
	import type { Row } from '$lib/components/demo-spam/scenario';
	import { ago, fmtClock, fmtNum } from '$lib/components/demo-spam/util';

	const DEFAULT_ID = '10373';
	const C = { flow: '#3CC3F2', p1: '#A08BFF', p2: '#4FD4E8', tot: '#2FC2A8', volt: '#FFD166', temp: '#FF9F6B', hum: '#7FD1FF' };
	const PILL = { ok: 'green', warn: 'amber', alarm: 'danger' } as const;

	// the URL is the source of truth, like the PDAM demo (?id=10373)
	let sel = $derived(LOGGER_BY_ID[$page.url.searchParams.get('id') ?? ''] ?? LOGGER_BY_ID[DEFAULT_ID]);
	let showAll = $state(false);

	function pick(id: string) {
		if (id === sel.id) return;
		showAll = false;
		goto(`/demo/spam/realtime?id=${id}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	/* ---- the last 60 records ---- */
	let rows = $state<Row[]>([]);
	let loadedKey = $state('');
	let err = $state('');
	let key = $derived(`${sel.id}|${field.mode}`);
	$effect(() => {
		const l = sel;
		const k = key;
		void field.now; // new records land every minute
		let stale = false;
		recentRows(l)
			.then((r) => {
				if (stale) return;
				rows = r.slice(-60);
				loadedKey = k;
				err = '';
			})
			.catch((e) => {
				if (!stale) err = e instanceof Error ? e.message : String(e);
			});
		return () => {
			stale = true;
		};
	});
	let ready = $derived(loadedKey === key && rows.length > 1);

	/* ---- current values ---- */
	let r = $derived(reading(sel));
	let st = $derived(statusOf(r));
	let faults = $derived(r.v.fault ? decodeFault(r.v.fault) : []);
	const n = (v: number | undefined, d: number) => (v == null ? '—' : fmtNum(v, d));
	let vol = $derived(ready && rows[0].v.tot != null && rows.at(-1)!.v.tot != null ? rows.at(-1)!.v.tot! - rows[0].v.tot! : null);

	interface Tile {
		k: string;
		v: string;
		u?: string;
		s?: string;
		tone?: 'warn' | 'alarm';
	}
	let tiles = $derived.by((): Tile[] => [
		{ k: 'Flowrate', v: n(r.v.flow, 1), u: 'L/s', s: r.v.flow != null ? `${fmtNum(r.v.flow * 3.6, 1)} m³/jam` : undefined, tone: st.st === 'ok' ? undefined : 'warn' },
		{ k: 'Totalizer', v: n(r.v.tot, 0), u: 'm³', s: vol != null ? `+${fmtNum(vol, 1)} m³ · ${rows.length} rekaman` : undefined },
		sel.pressures === 2
			? { k: 'Tekanan P1 · P2', v: `${n(r.v.p1, 2)} · ${n(r.v.p2, 2)}`, u: 'bar', s: r.v.p1 != null && r.v.p2 != null ? `hulu → hilir · ΔP ${fmtNum(r.v.p1 - r.v.p2, 2)} bar` : undefined }
			: { k: 'Tekanan', v: n(r.v.p1, 2), u: 'bar', s: sel.role === 'in' ? 'hulu stasiun' : 'titik suplai DMA' },
		{ k: 'Status flowmeter', v: faults.length ? `${faults.length} fault` : 'Normal', s: faults.length ? faults.join(' · ') : 'tidak ada bit fault aktif', tone: faults.length ? 'warn' : undefined },
		{ k: 'Baterai flowmeter', v: n(r.v.fm, 0), u: '%' },
		{ k: 'Baterai logger', v: n(r.v.volt, 2), u: 'V' },
		{ k: 'Suhu logger', v: n(r.v.temp, 1), u: '°C', s: 'dalam box panel' },
		{ k: 'Kelembapan logger', v: n(r.v.hum, 0), u: '%RH' }
	]);

	/* ---- charts ---- */
	const col = (c: Channel) => rows.map((x) => x.v[c] ?? NaN);
	const ticksOf = (idx: number[]) => idx.filter((i) => i < rows.length).map((i) => ({ v: i, t: fmtClock(rows[i].t / 60) }));
	let ticksWide = $derived(ready ? ticksOf([0, 15, 30, 45, rows.length - 1]) : []);
	let ticksSmall = $derived(ready ? ticksOf([0, 30, rows.length - 1]) : []);
	const stats = (v: number[], d: number) => {
		const f = v.filter(Number.isFinite);
		return f.length ? `min ${fmtNum(Math.min(...f), d)} · maks ${fmtNum(Math.max(...f), d)} · rata-rata ${fmtNum(f.reduce((a, b) => a + b, 0) / f.length, d)}` : 'tidak ada data';
	};
	let charts = $derived.by(() => {
		if (!ready) return { primary: [], health: [] };
		const one = (key: string, title: string, unit: string, c: Channel, color: string, d: number, span: number) => {
			const values = col(c);
			return { key, title, unit, series: [{ values, color, fill: true }] as ChartSeries[], legend: [], stats: stats(values, d), yFmt: (v: number) => fmtNum(v, d), ...yRange(values, span) };
		};
		const flow = one('flow', 'Flowrate', 'L/s', 'flow', C.flow, 1, 2);
		const p1 = col('p1');
		const p2 = col('p2');
		const pressure =
			sel.pressures === 2
				? {
						key: 'p',
						title: 'Tekanan P1 · P2',
						unit: 'bar',
						series: [
							{ values: p1, color: C.p1 },
							{ values: p2, color: C.p2, fill: true }
						] as ChartSeries[],
						legend: [
							{ label: 'P1 hulu', color: C.p1 },
							{ label: 'P2 hilir', color: C.p2 }
						],
						stats: `P1 ${stats(p1, 2)}`,
						yFmt: (v: number) => fmtNum(v, 2),
						...yRange([...p1, ...p2], 0.3)
					}
				: one('p', 'Tekanan', 'bar', 'p1', C.p1, 2, 0.3);
		return {
			primary: [flow, pressure],
			health: [one('volt', 'Baterai logger', 'V', 'volt', C.volt, 2, 0.3), one('temp', 'Suhu logger', '°C', 'temp', C.temp, 1, 2), one('hum', 'Kelembapan logger', '%RH', 'hum', C.hum, 0, 5)]
		};
	});

	/* ---- fault strip + log ---- */
	let strip = $derived(rows.map((x) => ({ f: x.v.fault ?? 0, t: x.t })));
	let logRows = $derived(rows.slice(showAll ? 0 : -10).reverse());
	type Col = { k: string; f: (x: Row) => string };
	let cols = $derived.by((): Col[] => [
		{ k: 'Debit L/s', f: (x) => n(x.v.flow, 2) },
		{ k: 'Totalizer m³', f: (x) => n(x.v.tot, 1) },
		...(sel.pressures === 2
			? [
					{ k: 'P1 bar', f: (x: Row) => n(x.v.p1, 2) },
					{ k: 'P2 bar', f: (x: Row) => n(x.v.p2, 2) }
				]
			: [{ k: 'Tekanan bar', f: (x: Row) => n(x.v.p1, 2) }]),
		{ k: 'Bat. FM %', f: (x) => n(x.v.fm, 0) },
		{ k: 'Fault', f: (x) => (x.v.fault ? String(x.v.fault) : '0') },
		{ k: 'Logger V', f: (x) => n(x.v.volt, 2) },
		{ k: 'Suhu °C', f: (x) => n(x.v.temp, 1) },
		{ k: 'RH %', f: (x) => n(x.v.hum, 0) }
	]);
	let lastT = $derived(rows.at(-1)?.t);
</script>

<svelte:head><title>Realtime · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Realtime Monitoring" sub="Rekaman per menit · 12 logger SPAM Regional Wosusokas" icon={Activity}>
		<a class="demo-btn" href="/demo/spam/historis?id={sel.id}"><History size={15} /> Data historis</a>
	</PageHead>

	<div class="rt-layout">
		<LoggerPicker selected={sel.id} onpick={pick} />

		<section class="rt-main">
			<div class="card rt-head">
				<div class="rt-head__l">
					<span class="rt-head__type" style="--c:{sel.role === 'in' ? '#A08BFF' : '#3CC3F2'}">{sel.role === 'in' ? 'INLET' : 'OUTLET'}</span>
					<div class="rt-head__titles">
						<span class="rt-head__id">{sel.id} · Flowmeter DMA {sel.dma}</span>
						<span class="rt-head__name">{sel.name}</span>
						<span class="rt-head__meta">{RESERVOIRS[sel.reservoir].name} · {sel.pressures === 2 ? 'logger 50 kanal · P1 & P2' : 'logger 16 kanal · 1 tekanan'} · {fmtNum(sel.lat, 5)}, {fmtNum(sel.lng, 5)}</span>
					</div>
				</div>
				<div class="rt-head__r">
					<span class="pill pill--{PILL[st.st]}" style="font-size:11px">{st.label.toUpperCase()}</span>
					{#if field.mode === 'skenario'}<span class="spam-badge spam-badge--sim">SIMULASI</span>{:else}<span class="spam-badge">LAPANGAN</span>{/if}
				</div>
				<div class="rt-head__foot">
					{#if field.mode === 'lapangan'}
						<span class="rt-live"><span class="cc-live-dot"></span>LIVE</span>
					{/if}
					<span>rekaman terakhir <b>{lastT != null ? fmtClock(lastT / 60) : '—'}</b>{lastT != null && field.mode === 'lapangan' ? ` · ${ago(field.now - lastT)}` : ''}</span>
					<span>{rows.length} rekaman ditampilkan · interval 1 menit</span>
					<span>{roleTag(sel)} · {sel.name}</span>
				</div>
			</div>

			{#if err}
				<div class="card spam-note"><span>Data lapangan gagal dimuat: {err}</span></div>
			{/if}

			<div class="rt-tiles">
				{#each tiles as t (t.k)}
					<div class="rt-tile" class:rt-tile--warn={t.tone === 'warn'} class:rt-tile--alarm={t.tone === 'alarm'}>
						<span class="rt-tile__k">{t.k}</span>
						<span class="rt-tile__v">{t.v}{#if t.u}<small>{t.u}</small>{/if}</span>
						{#if t.s}<span class="rt-tile__s">{t.s}</span>{/if}
					</div>
				{/each}
			</div>

			{#if ready}
				<div class="rt-primary">
					{#each charts.primary as c (sel.id + c.key)}
						<RealtimeTrendCard title={c.title} unit={c.unit} series={c.series} legend={c.legend} stats={c.stats} min={c.min} max={c.max} yFmt={c.yFmt} xTicks={ticksWide} height={170} x1={rows.length - 1} />
					{/each}
				</div>

				<div class="rt-secondary">
					<div class="card rt-trend rt-strip">
						<div class="rt-trend__h">
							<span class="label">Status fault flowmeter</span>
							<span class="rt-trend__legend">
								<span class="pdam-legend-mini"><i style="background:#46D78F"></i>Normal</span>
								<span class="pdam-legend-mini"><i style="background:#FFB454"></i>Fault</span>
							</span>
						</div>
						<span class="rt-trend__stats">{strip.filter((x) => x.f).length} dari {strip.length} rekaman ada bit fault</span>
						<div class="rt-strip__cells" style="grid-template-columns:repeat({strip.length}, minmax(0, 1fr))" role="img" aria-label="Status fault per menit">
							{#each strip as cell, i (i)}
								<i style="background:{cell.f ? '#FFB454' : '#46D78F'}" title="{fmtClock(cell.t / 60)} · {cell.f ? decodeFault(cell.f).join(', ') : 'normal'}"></i>
							{/each}
						</div>
						<div class="rt-strip__axis"><span>{fmtClock(rows[0].t / 60)}</span><span>{fmtClock(rows.at(-1)!.t / 60)}</span></div>
						<span class="rt-strip__note">{faults.length ? `Aktif: ${faults.join(' · ')}` : 'Tidak ada fault aktif pada rekaman terakhir'}</span>
					</div>
					{#each charts.health as c (sel.id + c.key)}
						<RealtimeTrendCard title={c.title} unit={c.unit} series={c.series} stats={c.stats} min={c.min} max={c.max} yFmt={c.yFmt} xTicks={ticksSmall} x1={rows.length - 1} />
					{/each}
				</div>

				<div class="card rt-log">
					<div class="card-h" style="margin-bottom:10px">
						<div style="display:flex;flex-direction:column;gap:3px">
							<span class="label">Log rekaman · {sel.id}</span>
							<span class="pdam-muted">rekaman terbaru di atas · 1 baris per rekaman</span>
						</div>
						<button class="demo-btn demo-btn--sm" onclick={() => (showAll = !showAll)}><List size={13} /> {showAll ? 'Tampilkan 10' : `Tampilkan ${rows.length}`}</button>
					</div>
					<div class="rt-log__scroll">
						<table class="demo-table rt-log__table">
							<thead><tr><th>Waktu</th>{#each cols as c (c.k)}<th>{c.k}</th>{/each}</tr></thead>
							<tbody>
								{#each logRows as x, i (x.t)}
									<tr class:is-new={i === 0}>
										<td class="mono">{fmtClock(x.t / 60)}</td>
										{#each cols as c (c.k)}<td class="mono" class:rt-log__warn={c.k === 'Fault' && x.v.fault}>{c.f(x)}</td>{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{:else if !err}
				<div class="card spam-note"><span>Memuat rekaman {sel.id}…</span></div>
			{/if}
		</section>
	</div>
</div>
