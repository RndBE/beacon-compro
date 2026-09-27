<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { Activity, BatteryWarning, Cpu, Crosshair, Download, RefreshCw, Search, TriangleAlert } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import LoggerSignalBars from '$lib/components/demo-pdam/LoggerSignalBars.svelte';
	import { ASSETS, ASSET_BY_ID, DEVICES, TYPE_META, ZONE_BY_ID, type Asset, type AssetType, type DeviceHealth } from '$lib/components/demo-pdam/data';
	import { live, useLive } from '$lib/components/demo-pdam/live.svelte';
	import { fmtNum } from '$lib/components/demo-pdam/sim';
	import {
		FW_LATEST,
		VOLT_LOW,
		climateAt,
		completenessOf,
		fwOutdated,
		loggerVolt,
		signalClass
	} from '$lib/components/demo-pdam/logger-health';

	const TYPES: AssetType[] = ['DMA', 'PT', 'SC', 'RES'];
	const BATT_WARN = 30;
	const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

	interface Item {
		a: Asset;
		d: DeviceHealth;
		lowBatt: boolean;
		oldFw: boolean;
		weak: boolean;
		lowVolt: boolean;
		attention: boolean;
		week: number;
	}
	const ITEMS: Item[] = DEVICES.map((d) => {
		const a = ASSET_BY_ID[d.id];
		const lowBatt = d.fmBattery != null && d.fmBattery < BATT_WARN;
		const oldFw = fwOutdated(d.firmware);
		const weak = signalClass(d.signal).tone === 'weak';
		const lowVolt = d.volt < VOLT_LOW;
		return { a, d, lowBatt, oldFw, weak, lowVolt, attention: !!d.fault || lowBatt || oldFw || weak || lowVolt, week: mean(completenessOf(d.id)) };
	});

	/* ---- summary ---- */
	const battLow = ITEMS.filter((x) => x.lowBatt);
	const fwOld = ITEMS.filter((x) => x.oldFw);
	const sigAvg = mean(DEVICES.map((d) => d.signal));
	const weakSig = ITEMS.filter((x) => x.weak);
	const needAction = ITEMS.filter((x) => x.attention);
	const groupCount = <K extends string>(keys: K[]) =>
		[...new Set(keys)].map((k) => ({ k, n: keys.filter((x) => x === k).length }));
	const MODELS = groupCount(DEVICES.map((d) => d.logger))
		.sort((x, y) => x.k.localeCompare(y.k, 'en', { numeric: true }))
		.map((m) => ({
			...m,
			use: groupCount(ITEMS.filter((x) => x.d.logger === m.k).map((x) => TYPE_META[x.a.type].short))
				.map((u) => `${u.k} ×${u.n}`)
				.join(' · ')
		}));
	// one representative RSSI per class, so labels and tones come from signalClass()
	const SIG_CLASSES = [-60, -75, -85, -95].map((dbm) => {
		const s = signalClass(dbm);
		return { label: s.label, tone: s.tone, n: DEVICES.filter((d) => signalClass(d.signal).label === s.label).length };
	});
	const FIRMWARES = groupCount(DEVICES.map((d) => d.firmware)).sort((x, y) => y.k.localeCompare(x.k, 'en', { numeric: true }));

	/* ---- filters ---- */
	let q = $state('');
	let types = $state<AssetType[]>([]);
	let onlyAction = $state(false);
	const countOf = (t: AssetType) => ITEMS.filter((x) => x.a.type === t).length;
	function toggle(t: AssetType) {
		types = types.includes(t) ? types.filter((x) => x !== t) : [...types, t];
	}
	let items = $derived(
		ITEMS.filter((x) => {
			const needle = q.trim().toLowerCase();
			const hay = `${x.a.id} ${x.a.name} ${x.d.logger} ${x.d.sensor} ${ZONE_BY_ID[x.a.zone].name} ${x.d.firmware}`.toLowerCase();
			return (!needle || hay.includes(needle)) && (types.length === 0 || types.includes(x.a.type)) && (!onlyAction || x.attention);
		})
	);

	/* ---- demo actions ---- */
	let done = $state<Record<string, boolean>>({});
	const key = (id: string, act: string) => `${id}:${act}`;
	function battery(x: Item) {
		done[key(x.d.id, 'batt')] = true;
		notify(`Penggantian baterai flowmeter ${x.d.id} dijadwalkan · tim instrumentasi (demo)`);
	}
	function ota(x: Item) {
		done[key(x.d.id, 'ota')] = true;
		notify(`Update OTA ${x.d.firmware} → ${FW_LATEST} dikirim ke ${x.d.id} · dipasang saat sinkron berikutnya (demo)`);
	}
	function otaAll() {
		const todo = fwOld.filter((x) => !done[key(x.d.id, 'ota')]);
		for (const x of todo) done[key(x.d.id, 'ota')] = true;
		notify(`Update OTA ${FW_LATEST} dijadwalkan untuk ${todo.map((x) => x.d.id).join(', ')} (demo)`);
	}
	function calibrate(x: Item) {
		done[key(x.d.id, 'cal')] = true;
		notify(`Kalibrasi sensor ${x.d.id} (${x.d.sensor}) dijadwalkan (demo)`);
	}
	let otaLeft = $derived(fwOld.filter((x) => !done[key(x.d.id, 'ota')]).length);

	/* ---- ?id= focuses a card (links from Realtime) ---- */
	const focusId = ($page.url.searchParams.get('id') ?? '').toUpperCase();
	onMount(() => {
		const stop = useLive();
		if (ASSET_BY_ID[focusId])
			tick().then(() => document.getElementById(`dev-${focusId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
		return stop;
	});

	const typeTag = (a: Asset) => (a.type === 'DMA' ? (a.role === 'in' ? 'IN' : 'OUT') : TYPE_META[a.type].short);
</script>

<svelte:head><title>Manajemen Perangkat · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Manajemen Perangkat" sub="{DEVICES.length} logger BL-series · sensor · baterai · sinyal · firmware" icon={Cpu}>
		<button class="demo-btn" onclick={() => notify(`inventaris-perangkat.csv · ${DEVICES.length} logger siap diunduh (demo)`)}>
			<Download size={15} /> Ekspor inventaris
		</button>
		<button class="demo-btn demo-btn--primary" onclick={otaAll} disabled={!otaLeft}>
			<RefreshCw size={15} /> Update firmware OTA{otaLeft ? ` (${otaLeft})` : ''}
		</button>
	</PageHead>

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Logger online</span>
			<span class="demo-stat__v" style="color:var(--green)">{DEVICES.length}<small>/ {DEVICES.length}</small></span>
			<span class="demo-stat__s">rekam 1 menit · {needAction.length} perlu tindakan</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Baterai flowmeter lemah</span>
			<span class="demo-stat__v" style="color:var(--amber)">{battLow.length}</span>
			<span class="demo-stat__s">{battLow.map((x) => `${x.d.id} ${x.d.fmBattery}%`).join(' · ')} · batas {BATT_WARN}%</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Update firmware tersedia</span>
			<span class="demo-stat__v">{fwOld.length}</span>
			<span class="demo-stat__s">versi terbaru {FW_LATEST} · {fwOld.map((x) => x.d.id).join(' · ')}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Sinyal rata-rata</span>
			<span class="demo-stat__v">{fmtNum(sigAvg)}<small>dBm</small></span>
			<span class="demo-stat__s">{signalClass(sigAvg).label} · {weakSig.length} titik lemah ({weakSig.map((x) => x.d.id).join(', ')})</span>
		</div>
	</div>

	<div class="demo-grid-3 dev2-summary">
		<div class="card dev2-sum">
			<span class="label">Model logger</span>
			{#each MODELS as m (m.k)}
				<div class="dev2-sum__row">
					<b>{m.k}</b>
					<i class="twin-bar"><i style="width:{(m.n / DEVICES.length) * 100}%"></i></i>
					<span>{m.n}</span>
					<small>{m.use}</small>
				</div>
			{/each}
		</div>
		<div class="card dev2-sum">
			<span class="label">Kualitas sinyal</span>
			{#each SIG_CLASSES as s (s.label)}
				<div class="dev2-sum__row dev2-sum__row--{s.tone}">
					<b>{s.label}</b>
					<i class="twin-bar"><i style="width:{(s.n / DEVICES.length) * 100}%"></i></i>
					<span>{s.n}</span>
				</div>
			{/each}
			<small class="dev2-sum__foot">≥ −70 sangat baik · ≥ −80 baik · ≥ −90 cukup · selebihnya lemah (dBm)</small>
		</div>
		<div class="card dev2-sum">
			<span class="label">Firmware</span>
			{#each FIRMWARES as f (f.k)}
				<div class="dev2-sum__row" class:dev2-sum__row--fair={fwOutdated(f.k)}>
					<b>v{f.k}</b>
					<i class="twin-bar"><i style="width:{(f.n / DEVICES.length) * 100}%"></i></i>
					<span>{f.n}</span>
					<small>{fwOutdated(f.k) ? 'update tersedia' : 'terbaru'}</small>
				</div>
			{/each}
			<small class="dev2-sum__foot">OTA lewat jaringan seluler · logger tetap merekam selama update</small>
		</div>
	</div>

	<div class="card dev2-tools">
		<label class="demo-search dev2-search">
			<Search size={15} />
			<input placeholder="Cari kode / lokasi / model / sensor…" aria-label="Cari perangkat" bind:value={q} />
		</label>
		<div class="demo-chips" role="group" aria-label="Filter tipe">
			{#each TYPES as t (t)}
				<button class="demo-chip" class:is-on={types.includes(t)} style="--c:{TYPE_META[t].color}" onclick={() => toggle(t)}>
					<i></i>{TYPE_META[t].label}<small>{countOf(t)}</small>
				</button>
			{/each}
			<button class="demo-chip" class:is-on={onlyAction} style="--c:#FFB454" onclick={() => (onlyAction = !onlyAction)}>
				<i></i>Perlu tindakan<small>{needAction.length}</small>
			</button>
		</div>
	</div>

	<div class="dev2-grid">
		{#each items as x (x.d.id)}
			{@const c = climateAt(x.d.id, live.h)}
			{@const v = loggerVolt(x.d.id, live.h)}
			<article class="card dev2-card" class:dev2-card--warn={x.attention} class:is-focus={x.d.id === focusId} id="dev-{x.d.id}">
				<header class="dev2-card__head">
					<span class="dev2-card__tag" style="--c:{TYPE_META[x.a.type].color}">{typeTag(x.a)}</span>
					<div class="dev2-card__titles">
						<span class="dev2-card__id">{x.d.id} · {x.d.logger}</span>
						<span class="dev2-card__name">{x.a.name}</span>
					</div>
					<span class="pill pill--{x.attention ? 'amber' : 'green'}" style="font-size:10px;padding:3px 8px">{x.attention ? 'PERLU TINDAKAN' : 'ONLINE'}</span>
				</header>
				<div class="dev2-card__sensor">{x.d.sensor} · Zona {ZONE_BY_ID[x.a.zone].name}</div>

				<dl class="dev2-card__grid">
					<div class="dev2-m dev2-m--wide">
						<dt>Baterai flowmeter</dt>
						{#if x.d.fmBattery != null}
							<dd class="dev2-batt" class:is-low={x.lowBatt}>
								<i class="twin-bar" class:twin-bar--amber={x.lowBatt}><i style="width:{x.d.fmBattery}%"></i></i>
								<b>{x.d.fmBattery}%</b>
							</dd>
						{:else}
							<dd class="dev2-m__na">tanpa baterai flowmeter</dd>
						{/if}
					</div>
					<div class="dev2-m">
						<dt>Tegangan logger</dt>
						<dd class:is-warn={x.lowVolt}>
							{fmtNum(v, 2)} V<small>{x.lowVolt ? `istirahat ${fmtNum(x.d.volt, 1)} V · rendah` : c.charge > 0.05 ? 'mengisi surya' : 'istirahat'}</small>
						</dd>
					</div>
					<div class="dev2-m">
						<dt>Sinyal</dt>
						<dd><LoggerSignalBars dbm={x.d.signal} label={false} /><small class="dev2-sig dev2-sig--{signalClass(x.d.signal).tone}">{signalClass(x.d.signal).label}</small></dd>
					</div>
					<div class="dev2-m">
						<dt>Firmware</dt>
						<dd>
							v{x.d.firmware}
							{#if x.oldFw}
								<small class="dev2-fw dev2-fw--old">{done[key(x.d.id, 'ota')] ? 'OTA dijadwalkan' : 'update tersedia'}</small>
							{:else}
								<small class="dev2-fw">terbaru</small>
							{/if}
						</dd>
					</div>
					<div class="dev2-m">
						<dt>Panel</dt>
						<dd>{fmtNum(c.temp, 1)}°C<small>{fmtNum(c.hum, 0)}% RH</small></dd>
					</div>
					<div class="dev2-m">
						<dt>Dipasang</dt>
						<dd>{x.d.installed}<small>data 7 hari {fmtNum(x.week, 1)}%</small></dd>
					</div>
				</dl>

				{#if x.d.fault}
					<div class="dev2-note dev2-note--warn"><BatteryWarning size={13} /> {x.d.fault} · ganti sebelum &lt; 10%</div>
				{/if}
				{#if x.d.lastFault}
					<div class="dev2-note"><TriangleAlert size={13} /> Riwayat fault: {x.d.lastFault}</div>
				{/if}
				{#if x.weak}
					<div class="dev2-note"><TriangleAlert size={13} /> Sinyal lemah · pertimbangkan antena eksternal</div>
				{/if}

				<footer class="dev2-card__actions">
					{#if x.lowBatt}
						<button class="demo-btn demo-btn--sm dev2-cta" disabled={done[key(x.d.id, 'batt')]} onclick={() => battery(x)}>
							<BatteryWarning size={13} />
							{done[key(x.d.id, 'batt')] ? 'Penggantian dijadwalkan' : 'Jadwalkan penggantian baterai'}
						</button>
					{/if}
					{#if x.oldFw}
						<button class="demo-btn demo-btn--sm dev2-cta" disabled={done[key(x.d.id, 'ota')]} onclick={() => ota(x)}>
							<RefreshCw size={13} />
							{done[key(x.d.id, 'ota')] ? 'OTA dijadwalkan' : 'Update firmware OTA'}
						</button>
					{/if}
					<button class="demo-btn demo-btn--sm" disabled={done[key(x.d.id, 'cal')]} onclick={() => calibrate(x)}>
						<Crosshair size={13} />
						{done[key(x.d.id, 'cal')] ? 'Kalibrasi dijadwalkan' : 'Kalibrasi sensor'}
					</button>
					<a class="demo-btn demo-btn--sm dev2-card__rt" href="/demo/pdam/realtime?id={x.d.id}" title="Buka realtime {x.d.id}"><Activity size={13} /> Realtime</a>
				</footer>
			</article>
		{:else}
			<div class="card sites-empty dev2-empty">Tidak ada perangkat yang cocok.</div>
		{/each}
	</div>
</div>
