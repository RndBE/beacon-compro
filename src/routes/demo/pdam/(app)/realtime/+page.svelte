<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Activity, Cpu, Database, FileDown, History, List } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import RealtimeTrendCard from '$lib/components/demo-pdam/RealtimeTrendCard.svelte';
	import LoggerSignalBars from '$lib/components/demo-pdam/LoggerSignalBars.svelte';
	import LoggerPicker from '$lib/components/demo-pdam/LoggerPicker.svelte';
	import { yRange, type ChartSeries } from '$lib/components/demo-pdam/LineChart.svelte';
	import {
		ASSETS,
		ASSET_BY_ID,
		DEVICE_BY_ID,
		HANDOVER,
		TYPE_META,
		ZONE_BY_ID,
		type Asset,
		type AssetType
	} from '$lib/components/demo-pdam/data';
	import { live, useLive } from '$lib/components/demo-pdam/live.svelte';
	import { fmtClock, fmtNum, noise, readAsset, readLive, totalizer } from '$lib/components/demo-pdam/sim';
	import {
		LEVEL_COLOR,
		LEVEL_LABEL,
		LIMITS,
		climateAt,
		completenessOf,
		jitter,
		levelAbove,
		levelBelow,
		loggerVolt,
		minPressureLines,
		wobble,
		type AlertLevel
	} from '$lib/components/demo-pdam/logger-health';

	onMount(() => useLive());

	const DEFAULT_ID = 'GMW-IN';
	const STATUS_LABEL = { ok: 'NORMAL', warn: 'SIAGA', alarm: 'AWAS' } as const;
	const pillOf = (s: string) => (s === 'alarm' ? 'danger' : s === 'warn' ? 'amber' : 'green');
	/** parameters recorded per logger type (the DMA logger records 8) */
	const PARAMS: Record<AssetType, number> = { DMA: 8, SC: 8, PT: 4, RES: 4 };
	const C = {
		flow: '#3CC3F2',
		p1: '#A08BFF',
		p2: '#4FD4E8',
		tot: '#2FC2A8',
		fm: '#46D78F',
		volt: '#FFD166',
		temp: '#FF9F6B',
		hum: '#7FD1FF',
		level: '#2FC2A8'
	};

	// the URL is the source of truth, so Beranda links (?id=GMW-IN) and the back button just work
	let sel = $derived(ASSET_BY_ID[($page.url.searchParams.get('id') ?? '').toUpperCase()] ?? ASSET_BY_ID[DEFAULT_ID]);
	let dev = $derived(DEVICE_BY_ID[sel.id]);
	let hasFm = $derived(sel.type === 'DMA' || sel.type === 'SC');
	let showAll = $state(false);

	function pick(id: string) {
		if (id === sel.id) return;
		showAll = false;
		goto(`/demo/pdam/realtime?id=${id}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	/* ---- the last 60 one-minute records ---- */
	interface Rec {
		/** clock hour of the record (slightly negative just after midnight) */
		t: number;
		flow?: number;
		tot?: number;
		p1?: number;
		p2?: number;
		level?: number;
		fm?: number;
		fault: 'ok' | 'warn';
		volt: number;
		temp: number;
		hum: number;
	}

	function records(a: Asset, lastMinute: number): Rec[] {
		const d = DEVICE_BY_ID[a.id];
		const out: Rec[] = [];
		for (let i = 0; i < 60; i++) {
			const m = lastMinute - 59 + i;
			const t = m / 60;
			const c = climateAt(a.id, t);
			out.push({
				t,
				...jitter(a.id, readAsset(a, t, true), m),
				fm: d?.fmBattery,
				fault: d?.fault ? 'warn' : 'ok',
				volt: loggerVolt(a.id, t, m),
				temp: c.temp + 0.04 * wobble(`${a.id}-tc`, m) + 0.017 * noise(`${a.id}-tc`, m),
				hum: c.hum + 0.15 * wobble(`${a.id}-rh`, m) + 0.07 * noise(`${a.id}-rh`, m)
			});
		}
		// totalizer: anchored on the meter reading at the last record, integrated back minute by minute
		if (out[0].flow != null) {
			let tot = totalizer(a, out[59].t);
			for (let i = 59; i >= 0; i--) {
				out[i].tot = tot;
				tot -= (out[i].flow ?? 0) * 0.06;
			}
		}
		return out;
	}

	// records land on the minute: recompute only when the minute (or the logger) changes
	let lastMinute = $derived(Math.floor(live.h * 60));
	let recs = $derived(records(sel, lastMinute));
	let logRows = $derived(recs.slice(showAll ? 0 : -10).reverse());
	let secAgo = $derived(Math.floor((live.h * 3600) % 60));

	/* ---- current values ("kartu") ---- */
	let r = $derived(readLive(sel, live.h, live.tick));
	let tot = $derived(hasFm ? totalizer(sel, live.h) : 0);
	let clim = $derived(climateAt(sel.id, live.h));
	let volt = $derived(loggerVolt(sel.id, live.h));
	let hand = $derived(HANDOVER.find((h) => h.id === sel.id));

	interface Tile {
		k: string;
		v: string;
		u?: string;
		s?: string;
		tone?: 'warn' | 'alarm';
		c?: string;
	}

	const levelTone = (l: AlertLevel) => (l === 'normal' ? undefined : l === 'awas' ? 'alarm' : 'warn');
	const P_MIN_TEXT: Record<AlertLevel, string> = { normal: '', waspada: '< 1,0 bar', siaga: '< 0,7 bar', awas: '< 0,5 bar' };
	const P_MAX_TEXT: Record<AlertLevel, string> = { normal: '', waspada: '> 4,5 bar', siaga: '> 5,0 bar', awas: '> 6,0 bar' };

	let tiles = $derived.by((): Tile[] => {
		const out: Tile[] = [];
		const vol60 = recs.reduce((a, x) => a + (x.flow ?? 0) * 0.06, 0);
		const residual = r.note?.startsWith('residual') ? r.note : undefined;
		const fault: Tile = {
			k: 'Status fault',
			v: dev?.fault ? 'Peringatan' : 'Normal',
			s: dev?.fault ?? (dev?.lastFault ? `terakhir: ${dev.lastFault}` : 'tidak ada catatan fault'),
			tone: dev?.fault ? 'warn' : undefined,
			c: dev?.fault ? '#FFB454' : '#46D78F'
		};
		const fm: Tile = {
			k: 'Baterai flowmeter',
			v: fmtNum(dev?.fmBattery ?? 0),
			u: '%',
			s: `${LEVEL_LABEL[levelBelow(dev?.fmBattery ?? 100, LIMITS.fmBattery)]} · waspada < 30%`,
			tone: levelTone(levelBelow(dev?.fmBattery ?? 100, LIMITS.fmBattery))
		};
		const health: Tile[] = [
			{ k: 'Tegangan logger', v: fmtNum(volt, 2), u: 'V', s: clim.charge > 0.05 ? 'mengisi · panel surya' : 'baterai · istirahat' },
			{ k: 'Suhu panel', v: fmtNum(clim.temp, 1), u: '°C', s: 'dalam box panel' },
			{ k: 'Kelembapan panel', v: fmtNum(clim.hum, 0), u: '%RH', s: clim.hum > 85 ? 'tinggi · cek seal box' : 'normal' }
		];
		if (sel.type === 'DMA') {
			const inlet = sel.role === 'in';
			const lv = inlet ? levelAbove(r.p1 ?? 0, LIMITS.pMax) : levelBelow(r.p2 ?? 9, LIMITS.pMin);
			out.push(
				{ k: 'Flowrate', v: fmtNum(r.flow ?? 0, 1), u: 'L/s', s: residual ?? `${fmtNum((r.flow ?? 0) * 3.6)} m³/jam`, tone: residual ? 'warn' : undefined },
				{ k: 'Totalizer', v: fmtNum(tot), u: 'm³', s: `+${fmtNum(vol60)} m³ · 60 menit` },
				{
					k: 'Tekanan P1 · P2',
					v: `${fmtNum(r.p1 ?? 0, 2)} · ${fmtNum(r.p2 ?? 0, 2)}`,
					u: 'bar',
					s:
						lv === 'normal'
							? `ΔP ${fmtNum((r.p1 ?? 0) - (r.p2 ?? 0), 2)} bar`
							: `${LEVEL_LABEL[lv]} · ${inlet ? `P1 ${P_MAX_TEXT[lv]}` : `P2 ${P_MIN_TEXT[lv]}`}`,
					tone: levelTone(lv)
				},
				fm,
				fault,
				...health
			);
		} else if (sel.type === 'SC') {
			out.push(
				{ k: 'Flowrate', v: fmtNum(r.flow ?? 0, 1), u: 'L/s', s: hand ? `kontrak ${hand.contract} L/s` : undefined },
				{ k: 'Totalizer', v: fmtNum(tot), u: 'm³', s: `+${fmtNum(vol60)} m³ · 60 menit` },
				{ k: 'Tekanan', v: fmtNum(r.p1 ?? 0, 2), u: 'bar', s: 'titik serah terima' },
				fm,
				fault,
				...health
			);
		} else if (sel.type === 'PT') {
			const lv = levelBelow(r.p1 ?? 9, LIMITS.pMin);
			out.push(
				{ k: 'Tekanan', v: fmtNum(r.p1 ?? 0, 2), u: 'bar', s: 'batas layanan 0,7 bar', tone: levelTone(lv) },
				{ k: 'Tingkat siaga', v: LEVEL_LABEL[lv], s: lv === 'normal' ? 'di atas 1,0 bar' : `tekanan ${P_MIN_TEXT[lv]}`, c: LEVEL_COLOR[lv], tone: levelTone(lv) },
				...health,
				{ k: 'Sinyal', v: fmtNum(dev?.signal ?? 0), u: 'dBm', s: dev?.logger }
			);
		} else {
			const lv = levelBelow(r.level ?? 100, LIMITS.level);
			const trend = (recs[59].level ?? 0) - (recs[0].level ?? 0);
			out.push(
				{ k: 'Level', v: fmtNum(r.level ?? 0, 0), u: '%', s: `${LEVEL_LABEL[lv]} · waspada < 45%`, tone: levelTone(lv) },
				{ k: 'Tren 60 menit', v: `${trend >= 0 ? '▲' : '▼'} ${fmtNum(Math.abs(trend), 1)}`, u: '%', s: trend >= 0 ? 'mengisi' : 'terpakai' },
				...health,
				{ k: 'Sinyal', v: fmtNum(dev?.signal ?? 0), u: 'dBm', s: dev?.logger }
			);
		}
		return out;
	});

	/* ---- trend charts ---- */
	interface Trend {
		key: string;
		title: string;
		unit: string;
		series: ChartSeries[];
		legend?: { label: string; color: string }[];
		stats: string;
		lines?: { v: number; c: string; t?: string }[];
		min: number;
		max: number;
		yFmt: (v: number) => string;
	}

	const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
	const summary = (v: number[], d: number) =>
		`min ${fmtNum(Math.min(...v), d)} · maks ${fmtNum(Math.max(...v), d)} · rata-rata ${fmtNum(mean(v), d)}`;

	function trend(key: string, title: string, unit: string, values: number[], color: string, d: number, minSpan: number, opts: Partial<Trend> = {}): Trend {
		const lines = opts.lines ?? [];
		return {
			key,
			title,
			unit,
			series: [{ values, color, fill: true }],
			stats: summary(values, d),
			yFmt: (v) => fmtNum(v, d),
			...yRange(values, minSpan, lines.map((l) => l.v)),
			...opts,
			lines
		};
	}

	let charts = $derived.by(() => {
		const R = recs;
		const col = (f: (x: Rec) => number | undefined) => R.map((x) => f(x) ?? 0);
		const primary: Trend[] = [];
		const fmTrends: Trend[] = [];
		const health: Trend[] = [
			trend('volt', 'Tegangan logger', 'V', col((x) => x.volt), C.volt, 2, 0.3),
			trend('temp', 'Suhu panel', '°C', col((x) => x.temp), C.temp, 1, 2),
			trend('hum', 'Kelembapan panel', '%RH', col((x) => x.hum), C.hum, 1, 5)
		];
		if (hasFm) {
			const flow = col((x) => x.flow);
			const contract = hand ? [{ v: hand.contract, c: '#9fb6da', t: `kontrak ${hand.contract} L/s` }] : [];
			primary.push(trend('flow', 'Flowrate', 'L/s', flow, C.flow, 1, Math.max(2, mean(flow) * 0.06), { lines: contract }));
			if (sel.type === 'DMA') {
				const p1 = col((x) => x.p1);
				const p2 = col((x) => x.p2);
				const lines =
					sel.role === 'in'
						? Math.max(...p1) > 3.9
							? [{ v: 4.5, c: LEVEL_COLOR.waspada, t: 'waspada maks 4,5' }]
							: []
						: minPressureLines(Math.min(...p2));
				primary.push({
					key: 'p',
					title: 'Tekanan P1 · P2',
					unit: 'bar',
					series: [
						{ values: p1, color: C.p1 },
						{ values: p2, color: C.p2, fill: true }
					],
					legend: [
						{ label: 'P1 hulu', color: C.p1 },
						{ label: 'P2 hilir', color: C.p2 }
					],
					stats: `P1 ${fmtNum(Math.min(...p1), 2)}–${fmtNum(Math.max(...p1), 2)} · P2 ${fmtNum(Math.min(...p2), 2)}–${fmtNum(Math.max(...p2), 2)} bar`,
					lines,
					yFmt: (v) => fmtNum(v, 2),
					...yRange([...p1, ...p2], 0.3, lines.map((l) => l.v))
				});
			} else {
				primary.push(trend('p', 'Tekanan', 'bar', col((x) => x.p1), C.p1, 2, 0.3));
			}
			// volume through the meter since the first record of the window
			const vol: number[] = [];
			let acc = 0;
			for (const x of R) vol.push((acc += (x.flow ?? 0) * 0.06));
			fmTrends.push(
				{ ...trend('tot', 'Totalizer · volume 60 menit', 'm³', vol, C.tot, 0, 10), min: 0, stats: `+${fmtNum(vol[59])} m³ sejak ${fmtClock(R[0].t)}` },
				{
					...trend('fm', 'Baterai flowmeter', '%', col((x) => x.fm), (dev?.fmBattery ?? 100) < 30 ? '#FFB454' : C.fm, 0, 10, {
						lines: [
							{ v: 30, c: LEVEL_COLOR.waspada, t: 'waspada 30' },
							{ v: 20, c: LEVEL_COLOR.siaga, t: 'siaga 20' }
						]
					}),
					min: 0,
					max: 100,
					stats: `${fmtNum(dev?.fmBattery ?? 0)}% · stabil 60 menit`
				}
			);
		} else if (sel.type === 'PT') {
			const p = col((x) => x.p1);
			primary.push(trend('p', 'Tekanan', 'bar', p, C.p1, 2, 0.3, { lines: minPressureLines(Math.min(...p)) }));
		} else {
			const lv = col((x) => x.level);
			const lines = Math.min(...lv) < 60 ? [{ v: 45, c: LEVEL_COLOR.waspada, t: 'waspada 45%' }] : [];
			primary.push(trend('level', 'Level reservoir', '%', lv, C.level, 1, 4, { lines }));
		}
		return { primary, fmTrends, health };
	});

	/* ---- status strips (60 cells) ---- */
	let strip = $derived.by(() => {
		if (hasFm) {
			const cells = recs.map((x) => ({
				c: x.fault === 'ok' ? '#46D78F' : '#FFB454',
				t: `${fmtClock(x.t)} · ${x.fault === 'ok' ? 'normal' : (dev?.fault ?? 'peringatan')}`
			}));
			const ok = recs.filter((x) => x.fault === 'ok').length;
			return {
				title: 'Status fault flowmeter',
				cells,
				summary: ok === 60 ? '60/60 menit normal' : `${60 - ok} menit peringatan · ${dev?.fault}`,
				note: dev?.fault ? `Aktif: ${dev.fault}` : dev?.lastFault ? `Fault terakhir: ${dev.lastFault}` : 'Tidak ada catatan fault',
				legend: [
					{ label: 'Normal', color: '#46D78F' },
					{ label: 'Peringatan', color: '#FFB454' },
					{ label: 'Fault', color: '#FF7A66' }
				]
			};
		}
		const pt = sel.type === 'PT';
		const levels = recs.map((x) => (pt ? levelBelow(x.p1 ?? 9, LIMITS.pMin) : levelBelow(x.level ?? 100, LIMITS.level)));
		const cells = recs.map((x, i) => ({
			c: LEVEL_COLOR[levels[i]],
			t: `${fmtClock(x.t)} · ${pt ? `${fmtNum(x.p1 ?? 0, 2)} bar` : `${fmtNum(x.level ?? 0, 1)}%`} · ${LEVEL_LABEL[levels[i]]}`
		}));
		const counts = (['normal', 'waspada', 'siaga', 'awas'] as AlertLevel[])
			.map((l) => ({ l, n: levels.filter((x) => x === l).length }))
			.filter((x) => x.n > 0);
		return {
			title: 'Tingkat siaga · 60 menit',
			cells,
			summary: counts.map((x) => `${x.n} menit ${LEVEL_LABEL[x.l].toLowerCase()}`).join(' · '),
			note: pt ? 'Ambang: waspada < 1,0 · siaga < 0,7 · awas < 0,5 bar' : 'Ambang: waspada < 45 · siaga < 35 · awas < 20 %',
			legend: (['normal', 'waspada', 'siaga', 'awas'] as AlertLevel[]).map((l) => ({ label: LEVEL_LABEL[l], color: LEVEL_COLOR[l] }))
		};
	});

	/* ---- 60-minute log ---- */
	type Col = { k: string; f: (x: Rec) => string };
	const n1 = (v?: number) => fmtNum(v ?? 0, 1);
	const n2 = (v?: number) => fmtNum(v ?? 0, 2);
	const HEALTH_COLS: Col[] = [
		{ k: 'Logger V', f: (x) => n2(x.volt) },
		{ k: 'Suhu °C', f: (x) => n1(x.temp) },
		{ k: 'RH %', f: (x) => fmtNum(x.hum, 0) }
	];
	const FAULT_COL: Col = { k: 'Fault', f: (x) => (x.fault === 'ok' ? 'normal' : 'peringatan') };
	const COLS: Record<AssetType, Col[]> = {
		DMA: [
			{ k: 'Debit L/s', f: (x) => n1(x.flow) },
			{ k: 'Totalizer m³', f: (x) => fmtNum(x.tot ?? 0) },
			{ k: 'P1 bar', f: (x) => n2(x.p1) },
			{ k: 'P2 bar', f: (x) => n2(x.p2) },
			{ k: 'Bat. FM %', f: (x) => fmtNum(x.fm ?? 0) },
			FAULT_COL,
			...HEALTH_COLS
		],
		SC: [
			{ k: 'Debit L/s', f: (x) => n1(x.flow) },
			{ k: 'Totalizer m³', f: (x) => fmtNum(x.tot ?? 0) },
			{ k: 'Tekanan bar', f: (x) => n2(x.p1) },
			{ k: 'Bat. FM %', f: (x) => fmtNum(x.fm ?? 0) },
			FAULT_COL,
			...HEALTH_COLS
		],
		PT: [{ k: 'Tekanan bar', f: (x) => n2(x.p1) }, ...HEALTH_COLS],
		RES: [{ k: 'Level %', f: (x) => n1(x.level) }, ...HEALTH_COLS]
	};

	const ticks = (idx: number[]) => idx.map((i) => ({ v: i, t: fmtClock(recs[i].t) }));
	let ticksWide = $derived(ticks([0, 15, 30, 45, 59]));
	let ticksSmall = $derived(ticks([0, 30, 59]));
	let today = $derived(completenessOf(sel.id)[6]);

	function exportCsv() {
		notify(`${sel.id}_60-menit.csv · 60 rekaman × ${PARAMS[sel.type]} parameter siap diunduh (demo)`);
	}
</script>

<svelte:head><title>Realtime Monitoring · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Realtime Monitoring" sub="Interval rekam 1 menit · 8 parameter · {ASSETS.length} logger" icon={Activity}>
		<a class="demo-btn" href="/demo/pdam/rekap?id={sel.id}"><Database size={15} /> Rekap data</a>
		<a class="demo-btn" href="/demo/pdam/historis?id={sel.id}"><History size={15} /> Data historis</a>
		<button class="demo-btn demo-btn--primary" onclick={exportCsv}><FileDown size={15} /> Ekspor 60 menit</button>
	</PageHead>

	<div class="rt-layout">
		<LoggerPicker selected={sel.id} onpick={pick} />

		<section class="rt-main">
			<div class="card rt-head">
				<div class="rt-head__l">
					<span class="rt-head__type" style="--c:{TYPE_META[sel.type].color}">{sel.type === 'DMA' ? (sel.role === 'in' ? 'INLET' : 'OUTLET') : TYPE_META[sel.type].short}</span>
					<div class="rt-head__titles">
						<span class="rt-head__id">{sel.id} · {TYPE_META[sel.type].label}</span>
						<span class="rt-head__name">{sel.name}</span>
						<span class="rt-head__meta">Zona {ZONE_BY_ID[sel.zone].name} · {dev?.logger} · {dev?.sensor} · fw {dev?.firmware}</span>
					</div>
				</div>
				<div class="rt-head__r">
					<span class="pill pill--{pillOf(r.status)}" style="font-size:11px">{STATUS_LABEL[r.status]}</span>
					<LoggerSignalBars dbm={dev?.signal ?? -80} />
				</div>
				<div class="rt-head__foot">
					<span class="rt-live"><span class="cc-live-dot"></span>LIVE</span>
					<span>rekaman terakhir <b>{fmtClock(recs[59].t)}</b> · {secAgo} dtk lalu</span>
					<span>berikutnya ±{60 - secAgo} dtk</span>
					<span>interval rekam 1 menit · {PARAMS[sel.type]} parameter</span>
					<span>kelengkapan hari ini <b>{fmtNum(today, 1)}%</b></span>
					<a class="rt-head__link" href="/demo/pdam/perangkat?id={sel.id}"><Cpu size={12} /> Detail perangkat</a>
				</div>
			</div>

			<div class="rt-tiles" class:rt-tiles--6={tiles.length === 6}>
				{#each tiles as t (t.k)}
					<div class="rt-tile" class:rt-tile--warn={t.tone === 'warn'} class:rt-tile--alarm={t.tone === 'alarm'}>
						<span class="rt-tile__k">{t.k}</span>
						<span class="rt-tile__v" style:color={t.c}>{t.v}{#if t.u}<small>{t.u}</small>{/if}</span>
						{#if t.s}<span class="rt-tile__s">{t.s}</span>{/if}
					</div>
				{/each}
			</div>

			<div class="rt-primary" class:rt-primary--strip={!hasFm}>
				{#each charts.primary as c (sel.id + c.key)}
					<RealtimeTrendCard
						title={c.title}
						unit={c.unit}
						series={c.series}
						legend={c.legend}
						stats={c.stats}
						lines={c.lines}
						min={c.min}
						max={c.max}
						yFmt={c.yFmt}
						xTicks={ticksWide}
						height={170}
					/>
				{/each}
				{#if !hasFm}
					{@render stripCard(true)}
				{/if}
			</div>

			<div class="rt-secondary">
				{#each charts.fmTrends as c (sel.id + c.key)}
					<RealtimeTrendCard title={c.title} unit={c.unit} series={c.series} stats={c.stats} lines={c.lines} min={c.min} max={c.max} yFmt={c.yFmt} xTicks={ticksSmall} />
				{/each}
				{#if hasFm}
					{@render stripCard(false)}
				{/if}
				{#each charts.health as c (sel.id + c.key)}
					<RealtimeTrendCard title={c.title} unit={c.unit} series={c.series} stats={c.stats} lines={c.lines} min={c.min} max={c.max} yFmt={c.yFmt} xTicks={ticksSmall} />
				{/each}
			</div>

			<div class="card rt-log">
				<div class="card-h" style="margin-bottom:10px">
					<div style="display:flex;flex-direction:column;gap:3px">
						<span class="label">Log 60 menit · {sel.id}</span>
						<span class="pdam-muted">rekaman terbaru di atas · 1 baris per menit</span>
					</div>
					<button class="demo-btn demo-btn--sm" onclick={() => (showAll = !showAll)}>
						<List size={13} />
						{showAll ? 'Tampilkan 10' : 'Tampilkan 60'}
					</button>
				</div>
				<div class="rt-log__scroll">
					<table class="demo-table rt-log__table">
						<thead>
							<tr>
								<th>Waktu</th>
								{#each COLS[sel.type] as c (c.k)}<th>{c.k}</th>{/each}
							</tr>
						</thead>
						<tbody>
							{#each logRows as x, i (x.t)}
								<tr class:is-new={i === 0}>
									<td class="mono">{fmtClock(x.t)}</td>
									{#each COLS[sel.type] as c (c.k)}
										<td class="mono" class:rt-log__warn={c.k === 'Fault' && x.fault !== 'ok'}>{c.f(x)}</td>
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

{#snippet stripCard(tall: boolean)}
	<div class="card rt-trend rt-strip" class:rt-strip--tall={tall}>
		<div class="rt-trend__h">
			<span class="label">{strip.title}</span>
			<span class="rt-trend__legend">
				{#each strip.legend as l (l.label)}
					<span class="pdam-legend-mini"><i style="background:{l.color}"></i>{l.label}</span>
				{/each}
			</span>
		</div>
		<span class="rt-trend__stats">{strip.summary}</span>
		<div class="rt-strip__cells" role="img" aria-label="{strip.title}: {strip.summary}">
			{#each strip.cells as cell, i (i)}
				<i style="background:{cell.c}" title={cell.t}></i>
			{/each}
		</div>
		<div class="rt-strip__axis"><span>{fmtClock(recs[0].t)}</span><span>{fmtClock(recs[30].t)}</span><span>{fmtClock(recs[59].t)}</span></div>
		<span class="rt-strip__note">{strip.note}</span>
		{#if tall}<a class="demo-btn demo-btn--sm rt-strip__cta" href="/demo/pdam/siaga">Atur ambang siaga</a>{/if}
	</div>
{/snippet}
