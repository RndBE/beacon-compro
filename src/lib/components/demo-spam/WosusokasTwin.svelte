<script lang="ts">
	// 3D digital twin of the Wosusokas network: satellite ground, the indicative pipe
	// network and the 12 loggers, driven by the same readings as every other page
	// (field or scenario). A pipe streams while the meters downstream of it register flow.
	import { onMount } from 'svelte';
	import { Activity, Compass, History, Orbit, RotateCcw, Satellite, Tag, Waves, Waypoints, X } from '@lucide/svelte';
	import { IMAGERY_ATTRIBUTION, imageryTile } from '../demo-dashboard/basemap';
	import { FLOW_EPS, LOGGERS, LOGGER_BY_ID, PAIRS, RESERVOIRS, SUPPLY, decodeFault, roleTag, type ReservoirId } from './wosusokas';
	import { field, reading, statusOf } from './field.svelte';
	import { fmtClock, fmtNum } from './util';
	import type { NodeReading, PairAlert, PipeNetwork, TwinApi, TwinLayers } from './twin/scene';

	let {
		focusId = null,
		compact = false,
		onselect
	}: {
		/** logger or reservoir id to fly to */
		focusId?: string | null;
		/** smaller HUD without the layer panel (home page) */
		compact?: boolean;
		/** a point was picked in the scene, or null when its card was closed */
		onselect?: (id: string | null) => void;
	} = $props();

	const PIPES_URL = '/demo/spam/wosusokas-pipa.geojson';
	const PILL = { ok: 'green', warn: 'amber', alarm: 'danger' } as const;
	const LAYER_UI: { key: keyof TwinLayers; label: string; icon: typeof Orbit }[] = [
		{ key: 'imagery', label: 'Citra', icon: Satellite },
		{ key: 'pipes', label: 'Pipa', icon: Waypoints },
		{ key: 'flow', label: 'Aliran', icon: Waves },
		{ key: 'labels', label: 'Label', icon: Tag }
	];

	let host = $state<HTMLDivElement | null>(null);
	let compassEl = $state<HTMLElement | null>(null);
	let api = $state<TwinApi | null>(null);
	let phase = $state<'load' | 'ready' | 'error'>('load');
	let tiles = $state({ loaded: 0, total: 0 });
	let errorMsg = $state('');
	let km = $state(0);
	let selId = $state<string | null>(null);
	let autoRotate = $state(true);
	let layers = $state<TwinLayers>({ imagery: true, pipes: true, flow: true, labels: true });
	let imgStyle = $state<'natural' | 'night'>('natural');

	onMount(() => {
		let twin: TwinApi | null = null;
		let destroyed = false;
		(async () => {
			try {
				const [{ createSpamTwin, mainKm }, pipes] = await Promise.all([
					import('./twin/scene'),
					fetch(PIPES_URL).then((r) => r.json() as Promise<PipeNetwork>)
				]);
				if (destroyed || !host) return;
				km = mainKm(pipes);
				twin = createSpamTwin({
					container: host,
					pipes,
					tileUrl: imageryTile,
					tileZoom: Math.min(window.innerWidth, window.innerHeight) < 700 ? 13 : 14,
					compass: compassEl,
					onSelect: (id) => {
						selId = id;
						onselect?.(id);
					},
					onImagery: (loaded, total) => (tiles = { loaded, total })
				});
				phase = 'ready';
				api = twin;
			} catch (e) {
				console.error('[SpamTwin] init failed', e);
				errorMsg = e instanceof Error ? e.message : String(e);
				phase = 'error';
			}
		})();
		return () => {
			destroyed = true;
			twin?.dispose();
		};
	});

	/* ---- live readings for the scene ---- */
	const flowOf = (id: string) => {
		const r = reading(LOGGER_BY_ID[id]);
		return r.online ? Math.max(0, r.v.flow ?? 0) : 0;
	};
	const supplyOf = (res: ReservoirId) => SUPPLY.filter((l) => l.reservoir === res).reduce((a, l) => a + flowOf(l.id), 0);
	/** inlet flowing but the outlet silent (1), or water lost between the two meters (2) */
	const alertOf = (inlet: string, outlet: string): PairAlert => {
		const fi = flowOf(inlet);
		const fo = flowOf(outlet);
		if (fi <= FLOW_EPS) return 0;
		if (fo <= FLOW_EPS) return 1;
		return (fi - fo) / fi > 0.05 ? 2 : 0;
	};
	let live = $derived.by(() => {
		const nodes: Record<string, NodeReading> = {};
		for (const l of LOGGERS) {
			const r = reading(l);
			const s = statusOf(r);
			const q = r.online ? (r.v.flow ?? null) : null;
			nodes[l.id] = { flow: q, st: s.st, value: q != null && q > FLOW_EPS ? `${fmtNum(q, 1)} L/s` : s.label };
		}
		for (const res of Object.keys(RESERVOIRS) as ReservoirId[]) {
			const q = supplyOf(res);
			nodes[`RES-${res}`] = { flow: q, st: q > FLOW_EPS ? 'ok' : 'warn', value: `${fmtNum(q, 1)} L/s` };
		}
		const alerts: Record<string, PairAlert> = {};
		for (const p of PAIRS) alerts[p.outlet.id] = alertOf(p.inlet.id, p.outlet.id);
		return { nodes, alerts };
	});
	let flowing = $derived(LOGGERS.filter((l) => statusOf(reading(l)).st === 'ok').length);
	let alertKinds = $derived(new Set(Object.values(live.alerts)));

	$effect(() => api?.setReadings(live.nodes, live.alerts));
	$effect(() => api?.setLayers({ ...layers }));
	$effect(() => api?.setImageryStyle(imgStyle));
	$effect(() => api?.setAutoRotate(autoRotate));
	$effect(() => {
		if (!api || !focusId || focusId === selId) return;
		autoRotate = false;
		api.select(focusId, true);
	});

	/* ---- selected point card ---- */
	let selLogger = $derived(selId ? LOGGER_BY_ID[selId] : null);
	let selRes = $derived(selId?.startsWith('RES-') ? RESERVOIRS[selId.slice(4) as ReservoirId] : null);
	let pair = $derived(selLogger ? PAIRS.find((p) => p.inlet.id === selLogger!.id || p.outlet.id === selLogger!.id) : null);
	function close() {
		selId = null;
		api?.select(null);
		onselect?.(null);
	}
</script>

<section class="twin-stage spam-twin" class:is-compact={compact}>
	<div class="twin-view" bind:this={host}>
		{#if phase === 'load'}
			<div class="twin-view__loading">
				<span class="twin-spinner"></span>
				<span>Menyusun model 3D jaringan Wosusokas…</span>
			</div>
		{:else if phase === 'error'}
			<div class="twin-view__loading">
				<span>Model 3D gagal dimuat.</span>
				<small>{errorMsg}</small>
			</div>
		{/if}
		{#if phase === 'ready' && tiles.total && tiles.loaded < tiles.total}
			<div class="twin-view__tiles">Citra satelit {Math.round((tiles.loaded / tiles.total) * 100)}%</div>
		{/if}

		<div class="twin-hud twin-hud--tl">
			<span class="twin-hud__eyebrow"><span class="cc-live-dot"></span> DIGITAL TWIN · SPAM WOSUSOKAS</span>
			<h2 class="twin-hud__title">Jaringan Mojolaban & Plesungan</h2>
			<span class="twin-hud__sub">{LOGGERS.length} logger · {fmtNum(km, 1)} km pipa utama · {flowing} titik mengalir</span>
		</div>

		<div class="twin-hud twin-hud--tr">
			<div class="twin-tools">
				<button class="twin-tool" class:is-on={autoRotate} aria-pressed={autoRotate} onclick={() => (autoRotate = !autoRotate)} title="Rotasi otomatis">
					<Orbit size={15} />
				</button>
				<button class="twin-tool" onclick={() => api?.resetView()} title="Reset kamera"><RotateCcw size={15} /></button>
				<span class="twin-compass" title="Arah utara"><span bind:this={compassEl} class="twin-compass__needle"><b>U</b><Compass size={16} /></span></span>
			</div>
			{#if !compact}
				<div class="twin-chips" role="group" aria-label="Layer peta">
					<span class="twin-chips__k">Layer</span>
					{#each LAYER_UI as l (l.key)}
						{@const Icon = l.icon}
						<button class="twin-chip" class:is-on={layers[l.key]} aria-pressed={layers[l.key]} onclick={() => (layers = { ...layers, [l.key]: !layers[l.key] })}>
							<Icon size={13} /><span>{l.label}</span>
						</button>
					{/each}
					<div class="twin-style" role="group" aria-label="Gaya citra">
						<button class:is-on={imgStyle === 'natural'} aria-pressed={imgStyle === 'natural'} onclick={() => (imgStyle = 'natural')}>Natural</button>
						<button class:is-on={imgStyle === 'night'} aria-pressed={imgStyle === 'night'} onclick={() => (imgStyle = 'night')}>Malam</button>
					</div>
				</div>
			{/if}
		</div>

		{#if selLogger || selRes}
			{@const r = selLogger ? reading(selLogger) : null}
			{@const s = r ? statusOf(r) : null}
			<div class="spam-twin-pick">
				<div class="spam-twin-pick__h">
					{#if selLogger && s}
						<b>{selLogger.id} · {roleTag(selLogger)}</b>
						<span class="pill pill--{PILL[s.st]}" style="font-size:10px;padding:3px 8px">{s.label}</span>
					{:else if selRes}
						<b style="color:{selRes.color}">RESERVOIR</b>
					{/if}
					<button class="spam-twin-pick__x" onclick={close} aria-label="Tutup"><X size={14} /></button>
				</div>
				{#if selLogger && r}
					<div class="spam-twin-pick__name">{selLogger.name}</div>
					<div class="pdam-twin-kv">
						<span>Debit <b>{r.v.flow != null ? `${fmtNum(r.v.flow, 1)} L/s` : '—'}</b></span>
						{#if r.v.p1 != null}<span>{r.v.p2 != null ? 'P1' : 'Tekanan'} <b>{fmtNum(r.v.p1, 2)} bar</b></span>{/if}
						{#if r.v.p2 != null}<span>P2 <b>{fmtNum(r.v.p2, 2)} bar</b></span>{/if}
						{#if r.v.tot != null}<span>Totalizer <b>{fmtNum(r.v.tot)} m³</b></span>{/if}
					</div>
					{#if r.v.fault}<div class="spam-twin-pick__note">{decodeFault(r.v.fault).join(' · ')}</div>{/if}
					{#if pair}
						{@const a = live.alerts[pair.outlet.id]}
						{#if a}
							<div class="spam-twin-pick__note" style="color:{a === 2 ? 'var(--danger)' : 'var(--amber)'}">
								{a === 2
									? `Selisih inlet–outlet DMA ${pair.dma}: ${fmtNum(((flowOf(pair.inlet.id) - flowOf(pair.outlet.id)) / flowOf(pair.inlet.id)) * 100, 1)}%`
									: `Inlet DMA ${pair.dma} mengalir, outlet membaca 0: cek meter`}
							</div>
						{/if}
					{/if}
					<div class="spam-twin-pick__foot">
						<span>{field.mode === 'skenario' ? 'SIMULASI' : r.t != null ? `data ${fmtClock(r.t / 60)}` : 'belum ada data'}</span>
						<a href="/demo/spam/realtime?id={selLogger.id}"><Activity size={12} /> Realtime</a>
						<a href="/demo/spam/historis?id={selLogger.id}"><History size={12} /> Historis</a>
					</div>
				{:else if selRes}
					<div class="spam-twin-pick__name">{selRes.name} · {selRes.area}</div>
					<div class="pdam-twin-kv">
						<span>Suplai ke DMA <b>{fmtNum(supplyOf(selRes.id), 1)} L/s</b></span>
						<span>Logger <b>{LOGGERS.filter((l) => l.reservoir === selRes!.id).length}</b></span>
					</div>
					<div class="spam-twin-pick__note">Posisi reservoir diperkirakan dari skema pipa mini-stesy.</div>
				{/if}
			</div>
		{/if}

		<div class="twin-bottom">
			<div class="twin-bottom__meta">
				<div class="twin-legend">
					<span class="pdam-tl-pipe pdam-tl-pipe--t"><i></i>Pipa utama</span>
					<span class="pdam-tl-pipe"><i></i>Distribusi</span>
					<span class="spam-tl-idle"><i></i>Tidak mengalir</span>
					<span><i style="background:#A08BFF"></i>Inlet</span>
					<span><i style="background:#3CC3F2"></i>Outlet</span>
					{#if alertKinds.has(1)}<span><i style="background:#FFB454"></i>Outlet seri 0</span>{/if}
					{#if alertKinds.has(2)}<span><i style="background:#FF7A66"></i>Selisih meter seri</span>{/if}
				</div>
				<div class="twin-attrib">{IMAGERY_ATTRIBUTION} · Jalan © OpenStreetMap · jalur pipa indikatif dari skema mini-stesy</div>
			</div>
		</div>
	</div>
</section>
