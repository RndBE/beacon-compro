<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		Box,
		CloudRain,
		Compass,
		Eye,
		Layers,
		Pause,
		Play,
		RotateCcw,
		Satellite,
		Tag,
		Waves,
		Waypoints,
		Orbit,
		MapPin,
		Clock,
		Sun,
		CloudDrizzle,
		CloudLightning
	} from '@lucide/svelte';
	import TwinViewport from '$lib/components/demo-dashboard/twin/TwinViewport.svelte';
	import RiverSection from '$lib/components/demo-dashboard/twin/RiverSection.svelte';
	import ForecastChart from '$lib/components/demo-dashboard/twin/ForecastChart.svelte';
	import type { SensorState, TwinApi, TwinLayers, FloodArea } from '$lib/components/demo-dashboard/twin/scene';
	import {
		EWS_STEPS,
		FLOOD_ZONES,
		GAUGES,
		HORIZON,
		POP_DENSITY,
		awasEta,
		ewsLevel,
		gaugeStatus,
		levelAt,
		rainAt,
		rainStatus,
		zoneFlood
	} from '$lib/components/demo-dashboard/twin/scenario';
	import { TB_SENSORS, TB_TYPE_META, CCTV_FEEDS, type SiteStatus } from '$lib/components/demo-dashboard/data';
	import { IMAGERY_ATTRIBUTION, RIVERS_ATTRIBUTION } from '$lib/components/demo-dashboard/basemap';

	let api = $state<TwinApi | null>(null);
	let hour = $state(0);
	let playing = $state(false);
	let autoRotate = $state(true);
	const focusParam = $page.url.searchParams.get('focus');
	let selectedId = $state(TB_SENSORS.some((s) => s.id === focusParam) ? focusParam! : 'AWLR-02');
	let compassEl = $state<HTMLElement | null>(null);
	let layers = $state<TwinLayers>({ imagery: true, rivers: true, flood: true, rain: true, links: true, labels: true });
	let imgStyle = $state<'natural' | 'night'>('natural');
	let jitter = $state(0);

	const LAYER_UI: { key: keyof TwinLayers; label: string; icon: typeof Box }[] = [
		{ key: 'imagery', label: 'Citra', icon: Satellite },
		{ key: 'rivers', label: 'Sungai', icon: Waves },
		{ key: 'flood', label: 'Genangan', icon: Layers },
		{ key: 'rain', label: 'Hujan', icon: CloudRain },
		{ key: 'links', label: 'Link data', icon: Waypoints },
		{ key: 'labels', label: 'Label', icon: Tag }
	];

	const STATUS_LABEL: Record<SiteStatus, string> = { ok: 'NORMAL', warn: 'SIAGA', alarm: 'AWAS' };
	/** weather shown over a rain gauge, keyed by its status */
	const WEATHER_UI: Record<SiteStatus, { label: string; icon: typeof Box }> = {
		ok: { label: 'Cerah', icon: Sun },
		warn: { label: 'Gerimis', icon: CloudDrizzle },
		alarm: { label: 'Hujan deras', icon: CloudLightning }
	};
	const pill = (s: SiteStatus) => (s === 'alarm' ? 'danger' : s === 'warn' ? 'amber' : 'green');
	const fmtH = (h: number) => (h === 0 ? 'Kini' : `+${h.toFixed(h % 1 ? 1 : 0)} jam`);

	// small live wobble while looking at "now", so the twin never looks frozen
	onMount(() => {
		const id = setInterval(() => (jitter = (Math.random() - 0.5) * 0.02), 2000);
		return () => clearInterval(id);
	});

	/** Values every sensor shows at the current forecast hour. */
	let states = $derived.by(() => {
		const out: Record<string, SensorState> = {};
		const j = hour === 0 ? jitter : 0;
		for (const s of TB_SENSORS) {
			if (s.type === 'AWLR' && GAUGES[s.id]) {
				const lv = levelAt(s.id, hour) + j;
				out[s.id] = { value: `${lv.toFixed(2)} m`, status: gaugeStatus(s.id, lv), level: lv };
			} else if (s.type === 'ARR') {
				const r = Math.max(0, rainAt(s.id as 'ARR-01' | 'ARR-02', hour) + j * 20);
				out[s.id] = { value: `${r.toFixed(1)} mm/h`, status: rainStatus(r) };
			} else out[s.id] = { value: `${s.value}${s.unit ? ' ' + s.unit : ''}`, status: s.status };
		}
		return out;
	});

	let flood = $derived(zoneFlood(hour));
	let area = $state<FloodArea>({ total: 0, perZone: [0, 0, 0, 0] });
	let peakArea = $state(1);
	let ews = $derived(ewsLevel(hour));
	const eta = awasEta();

	const series = (fn: (h: number) => number) => Array.from({ length: HORIZON * 4 + 1 }, (_, i) => fn(i / 4));
	const gaugeSeries = Object.fromEntries(Object.keys(GAUGES).map((id) => [id, series((h) => levelAt(id, h))]));
	const rainSeries = {
		'ARR-01': series((h) => rainAt('ARR-01', h)),
		'ARR-02': series((h) => rainAt('ARR-02', h))
	};

	// push state into the scene
	$effect(() => {
		if (!api) return;
		api.setZoneFlood(flood);
		area = api.floodArea(flood);
	});
	$effect(() => {
		if (!api) return;
		for (const [id, st] of Object.entries(states)) api.setSensor(id, st);
		api.setWeather('ARR-01', states['ARR-01'].status);
		api.setWeather('ARR-02', states['ARR-02'].status);
	});
	$effect(() => {
		api?.setLayers({ ...layers });
	});
	$effect(() => {
		api?.setAutoRotate(autoRotate);
	});
	$effect(() => {
		api?.setImageryStyle(imgStyle);
	});

	function onReady(a: TwinApi) {
		api = a;
		peakArea = Math.max(1, a.floodArea(zoneFlood(GAUGES['AWLR-02'].peakAt)).total);
		// arriving from another page with ?focus= flies straight to that asset
		if (focusParam && focusParam === selectedId) {
			autoRotate = false;
			setTimeout(() => a.select(selectedId, true), 400);
		} else a.select(selectedId, false);
	}

	// playback: one forecast hour every 0.7 s
	$effect(() => {
		if (!playing) return;
		const id = setInterval(() => {
			if (hour >= HORIZON) {
				playing = false;
				return;
			}
			hour = Math.min(HORIZON, Math.round((hour + 0.25) * 4) / 4);
		}, 175);
		return () => clearInterval(id);
	});

	function togglePlay() {
		if (!playing && hour >= HORIZON) hour = 0;
		playing = !playing;
	}

	let selected = $derived(TB_SENSORS.find((s) => s.id === selectedId)!);
	let selState = $derived(states[selectedId]);
	let clockAt = $derived.by(() => {
		const d = new Date(Date.now() + hour * 3600_000);
		return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	});
	let people = $derived(Math.round((area.total * POP_DENSITY) / 10) * 10);
	let zonesHit = $derived(
		FLOOD_ZONES.map((z, i) => ({ ...z, km2: area.perZone[i] })).sort((a, b) => b.km2 - a.km2)
	);
	let maxZone = $derived(Math.max(1, ...zonesHit.map((z) => z.km2)));
	const nf = new Intl.NumberFormat('id-ID');
</script>

<svelte:head><title>Digital Twin · Command Center</title></svelte:head>

<div class="twin-page">
	<section class="twin-stage">
		<TwinViewport onready={onReady} onselect={(id) => (selectedId = id)} compass={compassEl}>
			<div class="twin-hud twin-hud--tl">
				<span class="twin-hud__eyebrow"><span class="cc-live-dot"></span> DIGITAL TWIN · DAS WAY TULANG BAWANG</span>
				<h1 class="twin-hud__title">Model 3D Wilayah & Aliran Sungai</h1>
				<span class="twin-hud__sub">{TB_SENSORS.length} node sinkron · citra satelit · sungai OSM · prakiraan ARGO {HORIZON} jam</span>
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
						<button
							class="twin-chip"
							class:is-on={layers[l.key]}
							aria-pressed={layers[l.key]}
							onclick={() => (layers = { ...layers, [l.key]: !layers[l.key] })}
						>
							<Icon size={13} /><span>{l.label}</span>
						</button>
					{/each}
					<div class="twin-style" role="group" aria-label="Gaya citra">
						<button class:is-on={imgStyle === 'natural'} aria-pressed={imgStyle === 'natural'} onclick={() => (imgStyle = 'natural')}>Natural</button>
						<button class:is-on={imgStyle === 'night'} aria-pressed={imgStyle === 'night'} onclick={() => (imgStyle = 'night')}>Malam</button>
					</div>
				</div>
			</div>

			<div class="twin-bottom">
				<div class="twin-bottom__meta">
					<div class="twin-legend">
						{#each Object.entries(TB_TYPE_META) as [t, m] (t)}
							<span><i style="background:{m.color}"></i>{t === 'CMD' ? 'CC' : t}</span>
						{/each}
					</div>
					<div class="twin-attrib">{IMAGERY_ATTRIBUTION} · {RIVERS_ATTRIBUTION}</div>
				</div>

				<div class="twin-timeline">
					<button class="twin-play" onclick={togglePlay} aria-label={playing ? 'Jeda simulasi' : 'Putar simulasi'}>
						{#if playing}<Pause size={16} />{:else}<Play size={16} />{/if}
					</button>
					<div class="twin-timeline__body">
						<div class="twin-timeline__head">
							<div class="twin-timeline__titles">
								<span class="twin-timeline__k"><Clock size={11} /> SIMULASI BANJIR ARGO · TMA AWLR-02</span>
								<span class="twin-timeline__v">
									{fmtH(hour)} · {clockAt} WIB
									<span class="twin-timeline__key"><i></i>AWAS 3,8 m</span>
								</span>
							</div>
							<div class="twin-timeline__status">
								{#each ['ARR-02', 'ARR-01'] as id (id)}
									{@const w = WEATHER_UI[states[id].status]}
									<span class="twin-wx twin-wx--{states[id].status}" title="Cuaca di {id}">
										<w.icon size={13} />{id.replace('ARR-', 'ARR ')} · {w.label}
									</span>
								{/each}
								<span class="pill ews-live pill--{ews >= 3 ? 'danger' : ews >= 2 ? 'amber' : 'green'}" style="font-size:11px">
									EWS · {EWS_STEPS[ews].toUpperCase()}
								</span>
								<button class="twin-now" onclick={() => ((hour = 0), (playing = false))} disabled={hour === 0}>Kini</button>
							</div>
						</div>
						<div class="twin-timeline__track">
							<div class="twin-timeline__spark">
								<ForecastChart
									values={gaugeSeries['AWLR-02']}
									{hour}
									min={2.8}
									max={4.4}
									height={34}
									color="#3cc3f2"
									bare
									inset={7}
									lines={[{ v: 3.8, c: 'var(--danger)', t: 'AWAS' }]}
								/>
							</div>
							<input
								type="range"
								min="0"
								max={HORIZON}
								step="0.25"
								autocomplete="off"
								bind:value={hour}
								aria-label="Jam prakiraan"
								oninput={() => (playing = false)}
							/>
						</div>
						<div class="twin-timeline__ticks" aria-hidden="true">
							{#each [0, 4, 8, 12, 16] as h (h)}
								<span style="left:calc(7px + (100% - 14px) * {h / HORIZON})">{h === 0 ? 'kini' : `+${h}j`}</span>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</TwinViewport>
	</section>

	<aside class="twin-side">
		<div class="card twin-asset">
			<div class="card-h" style="margin-bottom:10px">
				<span class="twin-asset__type" style="--c:{TB_TYPE_META[selected.type].color}">{selected.type}</span>
				<span class="pill pill--{pill(selState.status)}" style="font-size:11px">
					<span class="status-dot {selState.status}" style="width:7px;height:7px"></span>{STATUS_LABEL[selState.status]}
				</span>
			</div>
			<div class="twin-asset__id">{selected.id}</div>
			<div class="twin-asset__name">{selected.name}</div>
			<div class="twin-asset__value">
				<b>{selState.value.split(' ')[0]}</b><small>{selState.value.split(' ').slice(1).join(' ')}</small>
				<span class="twin-asset__when">{hour === 0 ? 'live' : `prakiraan ${fmtH(hour)}`}</span>
			</div>

			{#if selected.type === 'AWLR' && GAUGES[selected.id]}
				{@const g = GAUGES[selected.id]}
				<ForecastChart
					values={gaugeSeries[selected.id]}
					{hour}
					min={Math.max(0, g.now - 1)}
					max={g.bank + 0.3}
					color="#3cc3f2"
					lines={[
						{ v: g.awas, c: 'var(--danger)', t: `AWAS ${g.awas}` },
						{ v: g.siaga, c: 'var(--amber)', t: `SIAGA ${g.siaga}` }
					]}
				/>
			{:else if selected.type === 'ARR'}
				{@const w = WEATHER_UI[selState.status]}
				<div class="twin-wx twin-wx--{selState.status} twin-wx--block">
					<w.icon size={15} /> Cuaca {w.label.toLowerCase()} · {selState.status === 'alarm' ? '≥ 50' : selState.status === 'warn' ? '20–50' : '< 20'} mm/h
				</div>
				<ForecastChart values={rainSeries[selected.id as 'ARR-01' | 'ARR-02']} {hour} min={0} max={60} bars color="#1fa5c7" />
			{:else if selected.type === 'CCTV'}
				<img class="twin-asset__cam" src={CCTV_FEEDS[0].img} alt={CCTV_FEEDS[0].name} loading="lazy" />
			{:else}
				<div class="twin-asset__note">
					{#if selected.type === 'WQ'}Ambang baku pH 6–9 · sampling otomatis tiap 15 menit.
					{:else if selected.type === 'SCADA'}Utility industri terhubung via Modbus-TCP · 12 tag dipantau.
					{:else}Hub komando · 4 gateway LoRa/4G · 44 RTU tersinkron.{/if}
				</div>
			{/if}

			<div class="twin-asset__meta">
				<span><MapPin size={12} /> {selected.lat.toFixed(3)}, {selected.lng.toFixed(3)}</span>
				<a href="/demo/dashboard/sites?focus={selected.id}"><Eye size={12} /> Lihat di peta</a>
			</div>
			<div class="twin-asset__jump" role="group" aria-label="Pilih aset">
				{#each TB_SENSORS as s (s.id)}
					<button
						class:is-on={s.id === selectedId}
						style="--c:{TB_TYPE_META[s.type].color}"
						onclick={() => api?.select(s.id, true)}
						title={s.name}
					>
						<span class="status-dot {states[s.id]?.status ?? s.status}" style="width:6px;height:6px"></span>{s.id}
					</button>
				{/each}
			</div>
		</div>

		<RiverSection
			gauge={GAUGES['AWLR-02']}
			level={states['AWLR-02'].level ?? 0}
			title="Twin Penampang · AWLR-02"
			sub="Way Tulang Bawang · Banjar Margo · {fmtH(hour)}"
		/>

		<div class="card twin-impact">
			<div class="card-h">
				<span class="label">DAMPAK SIMULASI · {fmtH(hour).toUpperCase()}</span>
				<span class="twin-impact__eta">AWAS {eta == null ? '—' : `+${eta.toFixed(1)} j`}</span>
			</div>
			<div class="twin-impact__kpis">
				<div>
					<span>Luas genangan</span>
					<b>{area.total.toFixed(1)}<small>km²</small></b>
					<i class="twin-bar"><i style="width:{Math.min(100, (area.total / peakArea) * 100)}%"></i></i>
				</div>
				<div>
					<span>Warga terdampak</span>
					<b>≈{nf.format(people)}<small>jiwa</small></b>
					<i class="twin-bar twin-bar--amber"><i style="width:{Math.min(100, (area.total / peakArea) * 100)}%"></i></i>
				</div>
			</div>
			<div class="twin-zones">
				{#each zonesHit as z (z.id)}
					<div class="twin-zone" class:is-dim={z.km2 < 0.5}>
						<span>{z.name}</span>
						<i class="twin-bar"><i style="width:{(z.km2 / maxZone) * 100}%"></i></i>
						<b>{z.km2.toFixed(1)} km²</b>
					</div>
				{/each}
			</div>
			<div class="ews-scale" style="margin:12px 0 0">
				{#each EWS_STEPS as lvl, i (lvl)}
					<div class="ews-step" class:ews-step--reached={i <= ews} class:ews-step--active={i === ews} data-lvl={i}>
						<span class="ews-step__bar"></span>
						<span class="ews-step__label">{lvl}</span>
					</div>
				{/each}
			</div>
		</div>
	</aside>
</div>
