<script lang="ts">
	import { onMount } from 'svelte';
	import { Box } from '@lucide/svelte';
	import {
		ASSETS,
		BALANCE,
		LEAKS,
		PIPES_ATTRIBUTION,
		PIPES_URL,
		TYPE_META,
		ZONES,
		ZONES_URL,
		ZONE_BY_ID,
		ZONE_BY_NAME,
		LEAK_STATUS_LABEL,
		nrwColor,
		type Asset,
		type AssetType,
		type SiteStatus
	} from './data';
	import { DARK_ATTRIBUTION, DARK_BASE_URL, DARK_LABELS_URL } from '../demo-dashboard/basemap';
	import { fmtNum, nowHour, readAsset } from './sim';

	let {
		focusId = null,
		types = null,
		colorBy = 'zona',
		twinHref = '/demo/pdam/digital-twin',
		title = 'JARINGAN PIPA UTAMA · LIVE',
		wheel = false,
		legend = true,
		onselect
	}: {
		/** asset or leak id to fly to and open */
		focusId?: string | null;
		/** only show these asset types (null = all) */
		types?: AssetType[] | null;
		/** zone fill: identity colour or NRW choropleth */
		colorBy?: 'zona' | 'nrw';
		/** link for the "3D" shortcut; empty string hides it */
		twinHref?: string;
		title?: string;
		/** allow scroll-wheel zoom */
		wheel?: boolean;
		legend?: boolean;
		onselect?: (id: string) => void;
	} = $props();

	const STATUS_COLOR: Record<SiteStatus, string> = { ok: '#46D78F', warn: '#FFB454', alarm: '#FF7A66' };
	const STATUS_LABEL: Record<SiteStatus, string> = { ok: 'Normal', warn: 'Siaga', alarm: 'Awas' };
	const CAT_LABEL: Record<string, string> = { transmisi: 'Transmisi', distribusi_utama: 'Distribusi utama' };
	const CITY_BOUNDS = [
		[-7.836, 110.334],
		[-7.712, 110.446]
	];

	let mapEl = $state<HTMLDivElement | null>(null);
	let ready = $state(false);
	let pipeKm = $state(0);
	let statuses = $state<Record<string, SiteStatus>>({});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let map: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let L: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let zoneLayer: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const markers = new Map<string, any>();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const zoneLabels = new Map<string, any>();

	const shortOf = (a: Asset) => (a.type === 'DMA' ? (a.role === 'in' ? 'IN' : 'OUT') : TYPE_META[a.type].short);

	function assetIcon(a: Asset, st: SiteStatus) {
		const meta = TYPE_META[a.type];
		return L.divIcon({
			className: 'tb-div-icon',
			html: `<span class="tb-marker tb-marker--${st} pdam-marker pdam-marker--${a.type.toLowerCase()}" style="--c:${meta.color};--s:${STATUS_COLOR[st]}"><span class="tb-marker__pulse"></span><span class="tb-marker__core">${shortOf(a)}</span></span>`,
			iconSize: [40, 40],
			iconAnchor: [20, 20]
		});
	}

	function assetPopup(a: Asset) {
		const r = readAsset(a, nowHour(), true);
		const rows: string[] = [];
		if (r.flow != null) rows.push(`<span>Debit</span><b>${fmtNum(r.flow, 1)} L/s</b>`);
		if (r.p1 != null && r.p2 != null) rows.push(`<span>P1 · P2</span><b>${fmtNum(r.p1, 2)} · ${fmtNum(r.p2, 2)} bar</b>`);
		else if (r.p1 != null) rows.push(`<span>Tekanan</span><b>${fmtNum(r.p1, 2)} bar</b>`);
		if (r.level != null) rows.push(`<span>Level</span><b>${fmtNum(r.level, 0)}%</b>`);
		return (
			`<div class="tb-pop pdam-pop"><div class="tb-pop__head"><b>${a.id}</b><span style="color:${STATUS_COLOR[r.status]}">● ${STATUS_LABEL[r.status]}</span></div>` +
			`<div class="tb-pop__name">${a.name}</div>` +
			`<div class="pdam-pop__rows">${rows.map((x) => `<div>${x}</div>`).join('')}</div>` +
			(r.note ? `<div class="pdam-pop__note">${r.note}</div>` : '') +
			`<div class="pdam-pop__foot">${TYPE_META[a.type].label} · Zona ${ZONE_BY_ID[a.zone].name}</div></div>`
		);
	}

	function zoneStyle(name: string) {
		const z = ZONE_BY_NAME[name];
		if (!z) return { stroke: false, fill: false };
		const c = colorBy === 'nrw' ? nrwColor(BALANCE[z.id].nrw) : z.color;
		return {
			color: c,
			weight: 1.2,
			opacity: 0.6,
			fillColor: c,
			fillOpacity: colorBy === 'nrw' ? 0.2 : 0.1
		};
	}

	function zoneLabelIcon(zid: keyof typeof BALANCE) {
		const z = ZONE_BY_ID[zid];
		const p = BALANCE[zid].nrw;
		const c = colorBy === 'nrw' ? nrwColor(p) : z.color;
		return L.divIcon({
			className: 'pdam-zlabel-icon',
			html: `<span class="pdam-zlabel" style="--c:${c}"><b>${z.name}</b><small>NRW ${fmtNum(p * 100, 1)}%</small></span>`,
			iconSize: [0, 0]
		});
	}

	onMount(() => {
		let destroyed = false;
		let refresh: ReturnType<typeof setInterval> | undefined;

		(async () => {
			// @ts-ignore — leaflet ships without bundled types in this repo
			L = (await import('leaflet')).default ?? (await import('leaflet'));
			await import('leaflet/dist/leaflet.css');
			if (destroyed || !mapEl) return;

			map = L.map(mapEl, {
				zoomControl: false,
				attributionControl: false,
				scrollWheelZoom: wheel,
				zoomSnap: 0.25
			}).setView([-7.785, 110.38], 13);

			L.tileLayer(DARK_BASE_URL, { maxZoom: 18, className: 'tb-tiles' }).addTo(map);
			L.tileLayer(DARK_LABELS_URL, { maxZoom: 18, className: 'tb-tiles-labels', pane: 'shadowPane' }).addTo(map);
			L.control.zoom({ position: 'bottomright' }).addTo(map);
			L.control
				.attribution({ position: 'bottomleft', prefix: false })
				.addAttribution(`${DARK_ATTRIBUTION} · © OpenStreetMap · ${PIPES_ATTRIBUTION}`)
				.addTo(map);

			const h = nowHour();
			for (const a of ASSETS) {
				const st = readAsset(a, h, true).status;
				statuses[a.id] = st;
				const m = L.marker([a.lat, a.lng], { icon: assetIcon(a, st), riseOnHover: true, zIndexOffset: 200 }).bindPopup(
					() => assetPopup(a),
					{ className: 'tb-popup' }
				);
				m.on('click', () => onselect?.(a.id));
				markers.set(a.id, m);
			}
			applyTypes();

			try {
				const [zRes, pRes] = await Promise.all([fetch(ZONES_URL), fetch(PIPES_URL)]);
				if (destroyed || !map) return;
				const zones = await zRes.json();
				const pipes = await pRes.json();
				if (destroyed || !map) return;

				zoneLayer = L.geoJSON(zones, {
					filter: (f: { properties: { zona: string } }) => f.properties.zona !== '_layanan',
					style: (f: { properties: { zona: string } }) => zoneStyle(f.properties.zona),
					interactive: false
				}).addTo(map);
				const service = L.geoJSON(zones, {
					filter: (f: { properties: { zona: string } }) => f.properties.zona === '_layanan',
					style: { color: '#7fe3ff', weight: 1.4, opacity: 0.55, fill: false, dashArray: '4 6' },
					interactive: false
				}).addTo(map);
				for (const z of ZONES) {
					const m = L.marker([z.label[1], z.label[0]], { icon: zoneLabelIcon(z.id), interactive: false, keyboard: false });
					m.addTo(map);
					zoneLabels.set(z.id, m);
				}

				let km = 0;
				const weightOf = (p: { kategori: string; diameter: number | null }) =>
					p.kategori === 'transmisi' ? 3.4 : (p.diameter ?? 0) >= 10 ? 2.6 : 1.9;
				L.geoJSON(pipes, {
					style: (f: { properties: { kategori: string; diameter: number | null } }) => ({
						color: f.properties.kategori === 'transmisi' ? '#6fe0ff' : '#3b8cff',
						weight: weightOf(f.properties),
						opacity: f.properties.kategori === 'transmisi' ? 0.95 : 0.85,
						lineCap: 'round',
						lineJoin: 'round'
					}),
					onEachFeature: (
						f: { properties: { id: string; kategori: string; diameter: number | null; material: string | null; zona: string | null; panjang_m: number; tahun: number | null } },
						layer: { bindTooltip: (s: string, o: object) => void }
					) => {
						const p = f.properties;
						km += p.panjang_m / 1000;
						layer.bindTooltip(
							`<b>${CAT_LABEL[p.kategori] ?? p.kategori}</b> · Ø${p.diameter ?? '–'}" ${p.material ?? ''}<br>${fmtNum(p.panjang_m)} m · Zona ${p.zona ?? '–'}${p.tahun ? ` · ${p.tahun}` : ''}`,
							{ className: 'pdam-tip', sticky: true, direction: 'top', opacity: 1 }
						);
					}
				}).addTo(map);
				// flowing dashes on top, oriented source → network by the preprocessing
				L.geoJSON(pipes, {
					style: (f: { properties: { kategori: string; diameter: number | null } }) => ({
						className: f.properties.kategori === 'transmisi' ? 'pdam-flow pdam-flow--t' : 'pdam-flow',
						color: '#e8fbff',
						weight: Math.max(1.2, weightOf(f.properties) - 1),
						opacity: 0.75,
						dashArray: '1 13',
						lineCap: 'round'
					}),
					interactive: false
				}).addTo(map);
				pipeKm = km;

				for (const lk of LEAKS) {
					const seg = pipes.features.find((f: { properties: { id: string } }) => f.properties.id === lk.pipeId);
					if (seg)
						L.geoJSON(seg, {
							style: { color: STATUS_COLOR[lk.severity], weight: 6, opacity: 0.55, className: 'pdam-leakpipe', lineCap: 'round' },
							interactive: false
						}).addTo(map);
					L.circle([lk.at.lat, lk.at.lng], {
						radius: lk.radius,
						color: STATUS_COLOR[lk.severity],
						weight: 1.2,
						dashArray: '3 5',
						fillColor: STATUS_COLOR[lk.severity],
						fillOpacity: 0.08,
						interactive: false
					}).addTo(map);
					const m = L.marker([lk.at.lat, lk.at.lng], {
						icon: L.divIcon({
							className: 'tb-div-icon',
							html: `<span class="pdam-leak pdam-leak--${lk.severity}"><i></i><i></i><b>${lk.id}</b></span>`,
							iconSize: [30, 30],
							iconAnchor: [15, 15]
						}),
						zIndexOffset: 400
					}).bindPopup(
						`<div class="tb-pop pdam-pop"><div class="tb-pop__head"><b>${lk.id} · Kebocoran</b><span style="color:${STATUS_COLOR[lk.severity]}">● ${lk.confidence}%</span></div>` +
							`<div class="tb-pop__name">JDU Ø${lk.diameter}" ${lk.material} · Zona ${ZONE_BY_ID[lk.zone].name}</div>` +
							`<div class="pdam-pop__rows"><div><span>Estimasi</span><b>${fmtNum(lk.est, 1)} L/s</b></div><div><span>Radius lokasi</span><b>±${lk.radius} m</b></div><div><span>Sejak</span><b>${lk.since}</b></div></div>` +
							`<div class="pdam-pop__note">${LEAK_STATUS_LABEL[lk.status]}</div></div>`,
						{ className: 'tb-popup' }
					);
					m.on('click', () => onselect?.(lk.id));
					m.addTo(map);
					markers.set(lk.id, m);
				}

				// frame the city; the Padasan transmission runs on north towards its spring
				void service;
				map.fitBounds(CITY_BOUNDS, { padding: [8, 8] });
				const syncZoom = () => mapEl?.classList.toggle('is-far', map.getZoom() < 13.4);
				map.on('zoomend', syncZoom);
				syncZoom();
			} catch (e) {
				console.warn('[PdamMap] overlay load failed:', e);
			}

			// size first, then let the focus/filter effects run (a resize would cut a running flyTo short)
			await new Promise((r) => setTimeout(r, 80));
			if (destroyed || !map) return;
			map.invalidateSize();
			ready = true;

			// statuses follow the time of day (peak-hour pressure dips)
			refresh = setInterval(() => {
				const hh = nowHour();
				for (const a of ASSETS) {
					const st = readAsset(a, hh, true).status;
					if (st !== statuses[a.id]) {
						statuses[a.id] = st;
						markers.get(a.id)?.setIcon(assetIcon(a, st));
					}
				}
			}, 30_000);
		})();

		return () => {
			destroyed = true;
			clearInterval(refresh);
			if (map) {
				map.remove();
				map = null;
			}
			markers.clear();
			zoneLabels.clear();
		};
	});

	function applyTypes() {
		if (!map) return;
		for (const a of ASSETS) {
			const m = markers.get(a.id);
			if (!m) continue;
			const show = !types || types.includes(a.type);
			if (show && !map.hasLayer(m)) m.addTo(map);
			else if (!show && map.hasLayer(m)) m.remove();
		}
	}

	$effect(() => {
		void types;
		if (ready) applyTypes();
	});

	$effect(() => {
		const mode = colorBy;
		if (!ready || !zoneLayer) return;
		void mode;
		zoneLayer.setStyle((f: { properties: { zona: string } }) => zoneStyle(f.properties.zona));
		for (const z of ZONES) zoneLabels.get(z.id)?.setIcon(zoneLabelIcon(z.id));
	});

	$effect(() => {
		const id = focusId;
		if (!ready || !id || !map) return;
		const m = markers.get(id);
		if (!m) return;
		if (!map.hasLayer(m)) m.addTo(map);
		map.flyTo(m.getLatLng(), 15, { duration: 0.8 });
		setTimeout(() => m.openPopup(), 820);
	});

	let counts = $derived(
		Object.values(statuses).reduce((acc, s) => ((acc[s] = (acc[s] || 0) + 1), acc), {} as Record<string, number>)
	);
</script>

<div class="cc-map pdam-map">
	<div class="cc-map__head">
		<span class="cc-map__title"><span class="cc-live-dot"></span>{title}</span>
		<span class="cc-map__head-r">
			<span class="cc-map__sub">{pipeKm ? `${fmtNum(pipeKm, 0)} km pipa utama · ` : ''}{ZONES.length} zona · {ASSETS.length} logger</span>
			{#if twinHref}
				<a class="cc-map__twin" href={twinHref} title="Buka Digital Twin 3D"><Box size={13} /> 3D Twin</a>
			{/if}
		</span>
	</div>
	<div class="cc-map__viz">
		<div class="tb-leaflet" bind:this={mapEl}></div>
	</div>
	{#if legend}
		<div class="cc-map__legend pdam-map__legend">
			<span class="pdam-lg-pipe pdam-lg-pipe--t"><i></i>Transmisi</span>
			<span class="pdam-lg-pipe"><i></i>Distribusi utama</span>
			<span class="pdam-lg-leak"><i></i>Kebocoran · {LEAKS.length}</span>
			<span><i style="background:#46D78F"></i>Normal · {counts.ok || 0}</span>
			<span><i style="background:#FFB454"></i>Siaga · {counts.warn || 0}</span>
			{#if counts.alarm}<span><i style="background:#FF7A66"></i>Awas · {counts.alarm}</span>{/if}
		</div>
	{/if}
</div>
