<script lang="ts">
	import { page } from '$app/stores';
	import {
		Box,
		Check,
		Clock,
		Compass,
		Droplets,
		Eye,
		Layers,
		MapPin,
		Orbit,
		Pause,
		Play,
		RotateCcw,
		Satellite,
		Tag,
		Waypoints,
		Waves,
		Radar,
		Activity
	} from '@lucide/svelte';
	import PdamTwinViewport from '$lib/components/demo-pdam/twin/PdamTwinViewport.svelte';
	import LineChart from '$lib/components/demo-pdam/LineChart.svelte';
	import type { PipeMode, TwinApi, TwinLayers } from '$lib/components/demo-pdam/twin/scene';
	import {
		ASSETS,
		ASSET_BY_ID,
		BALANCE,
		DEVICE_BY_ID,
		LEAKS,
		LEAK_STATUS_LABEL,
		PIPES_ATTRIBUTION,
		TYPE_META,
		WATER_COST,
		ZONE_BY_ID,
		type SiteStatus
	} from '$lib/components/demo-pdam/data';
	import {
		BURST,
		EVENTS,
		burstFlow,
		burstLoss,
		burstOn,
		eventStage,
		fmtClock,
		fmtNum,
		nowHour,
		readAsset,
		series,
		zoneFlow,
		zonePressure
	} from '$lib/components/demo-pdam/sim';
	import { IMAGERY_ATTRIBUTION } from '$lib/components/demo-dashboard/basemap';

	const snap = (h: number) => Math.min(24, Math.max(0, Math.round(h * 4) / 4));
	const focusParam = $page.url.searchParams.get('focus');
	const isKnown = (id: string | null) => !!id && (!!ASSET_BY_ID[id] || LEAKS.some((l) => l.id === id));

	let api = $state<TwinApi | null>(null);
	let hour = $state(snap(nowHour() >= 2.5 ? nowHour() : 3));
	let playing = $state(false);
	let autoRotate = $state(!isKnown(focusParam));
	let selectedId = $state(isKnown(focusParam) ? focusParam! : 'LK-01');
	let compassEl = $state<HTMLElement | null>(null);
	let layers = $state<TwinLayers>({ imagery: true, zones: true, pipes: true, flow: true, leaks: true, labels: true });
	let pipeMode = $state<PipeMode>('kategori');
	let zoneMode = $state<'zona' | 'nrw'>('zona');
	let imgStyle = $state<'natural' | 'night'>('natural');

	const LAYER_UI: { key: keyof TwinLayers; label: string; icon: typeof Box }[] = [
		{ key: 'imagery', label: 'Citra', icon: Satellite },
		{ key: 'zones', label: 'Zona', icon: Layers },
		{ key: 'pipes', label: 'Pipa', icon: Waypoints },
		{ key: 'flow', label: 'Aliran', icon: Waves },
		{ key: 'leaks', label: 'Kebocoran', icon: Radar },
		{ key: 'labels', label: 'Label', icon: Tag }
	];
	const PIPE_MODES: { key: PipeMode; label: string }[] = [
		{ key: 'kategori', label: 'Kategori' },
		{ key: 'tekanan', label: 'Tekanan' },
		{ key: 'zona', label: 'Zona' }
	];
	const STATUS_LABEL: Record<SiteStatus, string> = { ok: 'NORMAL', warn: 'SIAGA', alarm: 'AWAS' };
	const pill = (s: SiteStatus) => (s === 'alarm' ? 'danger' : s === 'warn' ? 'amber' : 'green');

	// push state into the scene
	$effect(() => {
		api?.setHour(hour);
	});
	$effect(() => {
		api?.setLayers({ ...layers });
	});
	$effect(() => {
		api?.setPipeMode(pipeMode);
	});
	$effect(() => {
		api?.setZoneMode(zoneMode);
	});
	$effect(() => {
		api?.setImageryStyle(imgStyle);
	});
	$effect(() => {
		api?.setAutoRotate(autoRotate);
	});

	function onReady(a: TwinApi) {
		api = a;
		if (isKnown(focusParam)) setTimeout(() => a.select(selectedId, true), 400);
		else a.select(selectedId, false);
	}

	// playback: 15 minutes every 0.16 s
	$effect(() => {
		if (!playing) return;
		const id = setInterval(() => {
			if (hour >= 24) {
				playing = false;
				return;
			}
			hour = snap(hour + 0.25);
		}, 160);
		return () => clearInterval(id);
	});
	function togglePlay() {
		if (!playing && hour >= 24) hour = 0;
		playing = !playing;
	}

	/* ---- timeline strip: Gemawang own input vs AI expectation ---- */
	const gmwActual = series((h) => zoneFlow('GMW', h, false).net, 97);
	const gmwExpected = series((h) => zoneFlow('GMW', h, false).expected, 97);
	let stage = $derived(eventStage(hour));

	/* ---- selection ---- */
	let selLeak = $derived(LEAKS.find((l) => l.id === selectedId) ?? null);
	let selAsset = $derived(ASSET_BY_ID[selectedId] ?? null);
	let reading = $derived(selAsset ? readAsset(selAsset, hour, false) : null);
	let selChart = $derived.by(() => {
		const a = selAsset;
		if (!a) return null;
		if (a.type === 'PT')
			return { values: series((h) => readAsset(a, h, false).p1 ?? 0, 97), unit: 'bar', color: '#a08bff', lines: [{ v: 0.7, c: 'var(--danger)', t: 'MIN 0,7' }], fmt: (v: number) => fmtNum(v, 1) };
		if (a.type === 'RES')
			return { values: series((h) => readAsset(a, h, false).level ?? 0, 97), unit: '%', color: '#2fc2a8', lines: [{ v: 35, c: 'var(--amber)', t: 'SIAGA 35%' }], fmt: (v: number) => fmtNum(v, 0) };
		return { values: series((h) => readAsset(a, h, false).flow ?? 0, 97), unit: 'L/s', color: '#3cc3f2', lines: [], fmt: (v: number) => fmtNum(v, 0) };
	});

	/* ---- leak simulation ---- */
	const lk1 = LEAKS[0];
	let on = $derived(burstOn(hour, false));
	let leakFlow = $derived(burstFlow(hour, false));
	let lost = $derived(burstLoss(hour, false));
	let pt01 = $derived(readAsset(ASSET_BY_ID['PT-01'], hour, false).p1 ?? 0);
	let pt01Base = $derived(zonePressure('GMW', hour, 'end'));

	/* ---- zone of the selection ---- */
	let zoneId = $derived(selLeak?.zone ?? selAsset?.zone ?? 'GMW');
	let zf = $derived(zoneFlow(zoneId, hour, false));
	let zone = $derived(ZONE_BY_ID[zoneId]);
</script>

<svelte:head><title>Digital Twin · STESY Smart Water</title></svelte:head>

<div class="twin-page pdam-twin">
	<section class="twin-stage">
		<PdamTwinViewport onready={onReady} onselect={(id) => (selectedId = id)} compass={compassEl}>
			<div class="twin-hud twin-hud--tl">
				<span class="twin-hud__eyebrow"><span class="cc-live-dot"></span> DIGITAL TWIN · JARINGAN DISTRIBUSI TIRTAMARTA</span>
				<h1 class="twin-hud__title">Model 3D Jaringan Pipa Utama</h1>
				<span class="twin-hud__sub">446 segmen transmisi & distribusi utama · 7 zona · {ASSETS.length} logger · citra satelit</span>
			</div>

			<div class="twin-hud twin-hud--tr">
				<div class="twin-tools">
					<button class="twin-tool" class:is-on={autoRotate} aria-pressed={autoRotate} onclick={() => (autoRotate = !autoRotate)} title="Rotasi otomatis">
						<Orbit size={15} />
					</button>
					<button class="twin-tool" onclick={() => api?.resetView()} title="Reset kamera"><RotateCcw size={15} /></button>
					<span class="twin-compass" title="Arah utara"><span bind:this={compassEl} class="twin-compass__needle"><b>U</b><Compass size={16} /></span></span>
				</div>
				<div class="twin-chips" role="group" aria-label="Layer peta">
					<span class="twin-chips__k">Layer</span>
					{#each LAYER_UI as l (l.key)}
						{@const Icon = l.icon}
						<button class="twin-chip" class:is-on={layers[l.key]} aria-pressed={layers[l.key]} onclick={() => (layers = { ...layers, [l.key]: !layers[l.key] })}>
							<Icon size={13} /><span>{l.label}</span>
						</button>
					{/each}
					<div class="twin-style" role="group" aria-label="Warna pipa">
						{#each PIPE_MODES as m (m.key)}
							<button class:is-on={pipeMode === m.key} aria-pressed={pipeMode === m.key} onclick={() => (pipeMode = m.key)}>{m.label}</button>
						{/each}
					</div>
					<div class="twin-style" role="group" aria-label="Warna zona">
						<button class:is-on={zoneMode === 'zona'} aria-pressed={zoneMode === 'zona'} onclick={() => (zoneMode = 'zona')}>Zona</button>
						<button class:is-on={zoneMode === 'nrw'} aria-pressed={zoneMode === 'nrw'} onclick={() => (zoneMode = 'nrw')}>NRW</button>
					</div>
					<div class="twin-style" role="group" aria-label="Gaya citra">
						<button class:is-on={imgStyle === 'natural'} aria-pressed={imgStyle === 'natural'} onclick={() => (imgStyle = 'natural')}>Natural</button>
						<button class:is-on={imgStyle === 'night'} aria-pressed={imgStyle === 'night'} onclick={() => (imgStyle = 'night')}>Malam</button>
					</div>
				</div>
			</div>

			<div class="twin-bottom">
				<div class="twin-bottom__meta">
					<div class="twin-legend">
						{#if pipeMode === 'kategori'}
							<span class="pdam-tl-pipe pdam-tl-pipe--t"><i></i>Transmisi</span>
							<span class="pdam-tl-pipe"><i></i>Distribusi utama</span>
						{:else if pipeMode === 'tekanan'}
							<span class="pdam-tl-grad"><i></i>&lt;0,7 · 1,2 · 2 · 3 · &gt;4,5 bar</span>
						{:else}
							<span>Warna pipa = zona</span>
						{/if}
						{#each Object.entries(TYPE_META) as [t, m] (t)}
							<span><i style="background:{m.color}"></i>{m.short}</span>
						{/each}
						<span><i style="background:#FF7A66"></i>Bocor</span>
					</div>
					<div class="twin-attrib">{IMAGERY_ATTRIBUTION} · {PIPES_ATTRIBUTION}</div>
				</div>

				<div class="twin-timeline">
					<button class="twin-play" onclick={togglePlay} aria-label={playing ? 'Jeda replay' : 'Putar replay'}>
						{#if playing}<Pause size={16} />{:else}<Play size={16} />{/if}
					</button>
					<div class="twin-timeline__body">
						<div class="twin-timeline__head">
							<div class="twin-timeline__titles">
								<span class="twin-timeline__k"><Clock size={11} /> REPLAY 24 JAM · DEBIT NETTO DMA GEMAWANG</span>
								<span class="twin-timeline__v">
									{fmtClock(hour)} WIB
									<span class="twin-timeline__key"><i></i>pecah {fmtClock(BURST.start)}</span>
								</span>
							</div>
							<div class="twin-timeline__status">
								<span class="pill pill--{stage < 0 ? 'green' : stage >= 2 ? 'danger' : 'amber'}" style="font-size:11px">
									{stage < 0 ? 'NORMAL' : EVENTS[stage].label.toUpperCase()}
								</span>
								<button class="twin-now" onclick={() => ((hour = snap(nowHour())), (playing = false))}>Live</button>
							</div>
						</div>
						<div class="twin-timeline__track">
							<div class="twin-timeline__spark">
								<LineChart
									bare
									inset={7}
									height={34}
									x0={0}
									x1={24}
									series={[
										{ values: gmwExpected, color: '#9fb6da', dash: '3 3', width: 1.2 },
										{ values: gmwActual, color: '#3cc3f2', fill: true, width: 1.6 }
									]}
									bands={[{ from: 2, to: 4, c: '#8b7cff' }]}
									marks={EVENTS.map((e) => ({ x: e.h, c: e.tone === 'danger' ? '#ff7a66' : e.tone === 'amber' ? '#ffb454' : '#3cc3f2' }))}
									cursor={hour}
								/>
							</div>
							<input
								type="range"
								min="0"
								max="24"
								step="0.25"
								autocomplete="off"
								bind:value={hour}
								aria-label="Jam replay"
								oninput={() => (playing = false)}
							/>
						</div>
						<div class="twin-timeline__ticks" aria-hidden="true">
							{#each [0, 6, 12, 18, 24] as h (h)}
								<span style="left:calc(7px + (100% - 14px) * {h / 24})">{String(h % 24).padStart(2, '0')}:00</span>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</PdamTwinViewport>
	</section>

	<aside class="twin-side">
		<div class="card twin-asset">
			{#if selLeak}
				<div class="card-h" style="margin-bottom:10px">
					<span class="twin-asset__type" style="--c:#ff7a66">KEBOCORAN</span>
					<span class="pill pill--{pill(selLeak.severity)}" style="font-size:11px">
						<span class="status-dot {selLeak.severity}" style="width:7px;height:7px"></span>{selLeak.confidence}% yakin
					</span>
				</div>
				<div class="twin-asset__id">{selLeak.id}</div>
				<div class="twin-asset__name">JDU Ø{selLeak.diameter}" {selLeak.material} · Zona {ZONE_BY_ID[selLeak.zone].name} · {fmtNum(selLeak.pipeLen)} m</div>
				<div class="twin-asset__value">
					{#if selLeak.id === lk1.id}
						<b>{on > 0 ? fmtNum(leakFlow, 1) : '0'}</b><small>L/s</small>
						<span class="twin-asset__when">{on > 0 ? `replay ${fmtClock(hour)}` : 'belum terjadi'}</span>
					{:else}
						<b>{fmtNum(selLeak.est, 1)}</b><small>L/s estimasi</small>
						<span class="twin-asset__when">{LEAK_STATUS_LABEL[selLeak.status]}</span>
					{/if}
				</div>
				<ul class="pdam-spot__signals" style="margin-top:4px">
					{#each selLeak.signals as s (s)}<li>{s}</li>{/each}
				</ul>
				<div class="twin-asset__note">{selLeak.action} · radius lokasi ±{selLeak.radius} m</div>
				<div class="twin-asset__meta">
					<span><MapPin size={12} /> {selLeak.at.lat.toFixed(4)}, {selLeak.at.lng.toFixed(4)}</span>
					<a href="/demo/pdam/kebocoran?id={selLeak.id}"><Radar size={12} /> Analisis</a>
				</div>
			{:else if selAsset && reading}
				<div class="card-h" style="margin-bottom:10px">
					<span class="twin-asset__type" style="--c:{TYPE_META[selAsset.type].color}">{TYPE_META[selAsset.type].label}</span>
					<span class="pill pill--{pill(reading.status)}" style="font-size:11px">
						<span class="status-dot {reading.status}" style="width:7px;height:7px"></span>{STATUS_LABEL[reading.status]}
					</span>
				</div>
				<div class="twin-asset__id">{selAsset.id}</div>
				<div class="twin-asset__name">{selAsset.name} · Zona {ZONE_BY_ID[selAsset.zone].name}</div>
				<div class="twin-asset__value">
					<b>{reading.value.split(' ')[0]}</b><small>{reading.value.split(' ').slice(1).join(' ')}</small>
					<span class="twin-asset__when">replay {fmtClock(hour)}</span>
				</div>
				{#if reading.p1 != null && selAsset.type !== 'PT'}
					<div class="pdam-twin-kv">
						<span>P1 <b>{fmtNum(reading.p1, 2)} bar</b></span>
						{#if reading.p2 != null}<span>P2 <b>{fmtNum(reading.p2, 2)} bar</b></span>{/if}
						{#if DEVICE_BY_ID[selAsset.id]?.fmBattery != null}<span>Baterai FM <b>{DEVICE_BY_ID[selAsset.id].fmBattery}%</b></span>{/if}
					</div>
				{/if}
				{#if selChart}
					<LineChart
						height={96}
						x0={0}
						x1={24}
						series={[{ values: selChart.values, color: selChart.color, fill: true }]}
						lines={selChart.lines}
						cursor={hour}
						yTicks={2}
						yFmt={selChart.fmt}
					/>
				{/if}
				{#if reading.note}<div class="twin-asset__note">{reading.note}</div>{/if}
				<div class="twin-asset__meta">
					<span><MapPin size={12} /> {selAsset.lat.toFixed(4)}, {selAsset.lng.toFixed(4)}</span>
					<a href="/demo/pdam/realtime?id={selAsset.id}"><Activity size={12} /> Realtime</a>
					<a href="/demo/pdam/jaringan?focus={selAsset.id}"><Eye size={12} /> Peta</a>
				</div>
			{/if}
			<div class="twin-asset__jump" role="group" aria-label="Pilih aset">
				{#each LEAKS as l (l.id)}
					<button class:is-on={l.id === selectedId} style="--c:#ff7a66" onclick={() => api?.select(l.id, true)} title="Kebocoran {l.id}">
						<span class="status-dot {l.severity}" style="width:6px;height:6px"></span>{l.id}
					</button>
				{/each}
				{#each ASSETS as a (a.id)}
					<button class:is-on={a.id === selectedId} style="--c:{TYPE_META[a.type].color}" onclick={() => api?.select(a.id, true)} title={a.name}>
						<span class="status-dot {readAsset(a, hour, false).status}" style="width:6px;height:6px"></span>{a.id}
					</button>
				{/each}
			</div>
		</div>

		<div class="card twin-impact pdam-twin-leak">
			<div class="card-h">
				<span class="label">SIMULASI KEBOCORAN · {lk1.id}</span>
				<span class="twin-impact__eta">{fmtClock(hour)}</span>
			</div>
			<div class="twin-impact__kpis">
				<div>
					<span>Debit bocor</span>
					<b>{fmtNum(leakFlow, 1)}<small>L/s</small></b>
					<i class="twin-bar"><i style="width:{(leakFlow / BURST.flow) * 100}%"></i></i>
				</div>
				<div>
					<span>Air hilang</span>
					<b>{fmtNum(lost)}<small>m³</small></b>
					<i class="twin-bar twin-bar--amber"><i style="width:{Math.min(100, (lost / 1400) * 100)}%"></i></i>
				</div>
			</div>
			<div class="pdam-twin-kv" style="margin:10px 0 12px">
				<span>Tekanan PT-01 <b style="color:{pt01 < pt01Base - 0.1 ? 'var(--amber)' : 'var(--ink)'}">{fmtNum(pt01, 2)} bar</b></span>
				<span>Normal <b>{fmtNum(pt01Base, 2)} bar</b></span>
				<span>Biaya <b>Rp {fmtNum((lost * WATER_COST) / 1e6, 2)} jt</b></span>
			</div>
			<ol class="pdam-steps">
				{#each EVENTS as e, i (e.label)}
					<li class:is-now={i === stage} class:is-todo={i > stage}>
						<span class="pdam-steps__dot">{#if i < stage}<Check size={10} strokeWidth={3} />{/if}</span>
						<span class="pdam-steps__t">{fmtClock(e.h)}</span>
						<span class="pdam-steps__l">{e.label}</span>
					</li>
				{/each}
			</ol>
		</div>

		<div class="card twin-impact">
			<div class="card-h">
				<span class="label"><Droplets size={12} style="vertical-align:-2px" /> ZONA {zone.name.toUpperCase()} · {fmtClock(hour)}</span>
				<span class="twin-impact__eta">NRW {fmtNum(BALANCE[zoneId].nrw * 100, 1)}%</span>
			</div>
			<div class="twin-zones">
				<div class="twin-zone">
					<span>Debit netto</span>
					<i class="twin-bar"><i style="width:{Math.min(100, (zf.net / (zf.expected * 1.4)) * 100)}%"></i></i>
					<b>{fmtNum(zf.net, 1)} L/s</b>
				</div>
				<div class="twin-zone">
					<span>Prediksi AI</span>
					<i class="twin-bar"><i style="width:{Math.min(100, (zf.expected / (zf.expected * 1.4)) * 100)}%"></i></i>
					<b>{fmtNum(zf.expected, 1)} L/s</b>
				</div>
				<div class="twin-zone">
					<span>Tekanan inlet</span>
					<i class="twin-bar"><i style="width:{(zonePressure(zoneId, hour, 'in') / 5) * 100}%"></i></i>
					<b>{fmtNum(zonePressure(zoneId, hour, 'in'), 2)} bar</b>
				</div>
				<div class="twin-zone">
					<span>Tekanan ujung</span>
					<i class="twin-bar twin-bar--amber"><i style="width:{(zonePressure(zoneId, hour, 'end') / 5) * 100}%"></i></i>
					<b>{fmtNum(zonePressure(zoneId, hour, 'end'), 2)} bar</b>
				</div>
			</div>
			<div class="pdam-twin-kv" style="margin-top:10px">
				<span>Pelanggan <b>{fmtNum(zone.sr)} SR</b></span>
				<span>Luas <b>{fmtNum(zone.areaKm2, 1)} km²</b></span>
			</div>
		</div>
	</aside>
</div>
