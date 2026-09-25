<script lang="ts">
	import { onMount } from 'svelte';
	import { Box } from '@lucide/svelte';
	import { TB_SENSORS, TB_TYPE_META, TB_GEOJSON_URL, type SiteStatus, type TbSensorType } from './data';
	import { DARK_ATTRIBUTION, DARK_BASE_URL, DARK_LABELS_URL, RIVERS_GEOJSON_URL } from './basemap';

	let {
		focusId = null,
		types = null,
		twinHref = '/demo/dashboard/digital-twin'
	}: {
		/** sensor to fly to and open */
		focusId?: string | null;
		/** only show these sensor types (null = all) */
		types?: TbSensorType[] | null;
		/** link for the "3D" shortcut; empty string hides it */
		twinHref?: string;
	} = $props();

	let mapEl = $state<HTMLDivElement | null>(null);

	const STATUS_COLOR: Record<SiteStatus, string> = {
		ok: '#46D78F',
		warn: '#FFB454',
		alarm: '#FF7A66'
	};
	const STATUS_LABEL: Record<SiteStatus, string> = { ok: 'Normal', warn: 'Siaga', alarm: 'Awas' };

	const counts = TB_SENSORS.reduce(
		(acc, s) => ((acc[s.status] = (acc[s.status] || 0) + 1), acc),
		{} as Record<string, number>
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let map: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const markers = new Map<string, any>();
	let ready = $state(false);

	onMount(() => {
		let destroyed = false;

		(async () => {
			// @ts-ignore — leaflet ships without bundled types in this repo
			const L = (await import('leaflet')).default ?? (await import('leaflet'));
			await import('leaflet/dist/leaflet.css');
			if (destroyed || !mapEl) return;

			map = L.map(mapEl, {
				zoomControl: false,
				attributionControl: false,
				scrollWheelZoom: false
			}).setView([-4.4, 105.5], 9);

			L.tileLayer(DARK_BASE_URL, { maxZoom: 16, className: 'tb-tiles' }).addTo(map);
			L.tileLayer(DARK_LABELS_URL, { maxZoom: 16, className: 'tb-tiles-labels', pane: 'shadowPane' }).addTo(map);
			L.control.zoom({ position: 'bottomright' }).addTo(map);
			L.control
				.attribution({ position: 'bottomleft', prefix: false })
				.addAttribution(`${DARK_ATTRIBUTION} · © OpenStreetMap contributors`)
				.addTo(map);

			for (const s of TB_SENSORS) {
				const meta = TB_TYPE_META[s.type];
				const icon = L.divIcon({
					className: 'tb-div-icon',
					html: `<span class="tb-marker tb-marker--${s.status}" style="--c:${meta.color};--s:${STATUS_COLOR[s.status]}"><span class="tb-marker__pulse"></span><span class="tb-marker__core">${meta.short}</span></span>`,
					iconSize: [40, 40],
					iconAnchor: [20, 20]
				});
				const m = L.marker([s.lat, s.lng], { icon, riseOnHover: true }).bindPopup(
					`<div class="tb-pop"><div class="tb-pop__head"><b>${s.id}</b><span style="color:${STATUS_COLOR[s.status]}">● ${STATUS_LABEL[s.status]}</span></div>` +
						`<div class="tb-pop__name">${s.name}</div>` +
						`<div class="tb-pop__val">${s.value}<small>${s.unit ? ' ' + s.unit : ''}</small></div></div>`,
					{ className: 'tb-popup' }
				);
				markers.set(s.id, m);
			}
			applyTypes();

			try {
				const [bRes, rRes] = await Promise.all([fetch(TB_GEOJSON_URL), fetch(RIVERS_GEOJSON_URL)]);
				if (rRes.ok && !destroyed && map) {
					const rivers = await rRes.json();
					L.geoJSON(rivers, {
						filter: (f: { properties: { rank: number } }) => f.properties.rank <= 2,
						style: (f: { properties: { rank: number } }) => ({
							color: f.properties.rank === 1 ? '#4fd4e8' : '#2f8fd8',
							weight: f.properties.rank === 1 ? 2.6 : 1.2,
							opacity: f.properties.rank === 1 ? 0.85 : 0.55,
							interactive: false
						})
					}).addTo(map);
				}
				if (bRes.ok && !destroyed && map) {
					const geo = await bRes.json();
					const layer = L.geoJSON(geo, {
						style: { color: '#3CC3F2', weight: 2, opacity: 0.9, fillColor: '#2876E8', fillOpacity: 0.07 },
						interactive: false
					}).addTo(map);
					map.fitBounds(layer.getBounds(), { padding: [26, 26] });
				}
			} catch (e) {
				console.warn('[TulangBawangMap] overlay load failed:', e);
			}

			setTimeout(() => map && map.invalidateSize(), 80);
			ready = true;
		})();

		return () => {
			destroyed = true;
			if (map) {
				map.remove();
				map = null;
			}
			markers.clear();
		};
	});

	function applyTypes() {
		if (!map) return;
		for (const s of TB_SENSORS) {
			const m = markers.get(s.id);
			if (!m) continue;
			const show = !types || types.includes(s.type);
			if (show && !map.hasLayer(m)) m.addTo(map);
			else if (!show && map.hasLayer(m)) m.remove();
		}
	}

	$effect(() => {
		void types;
		if (ready) applyTypes();
	});

	$effect(() => {
		const id = focusId;
		if (!ready || !id || !map) return;
		const s = TB_SENSORS.find((x) => x.id === id);
		const m = markers.get(id);
		if (!s || !m) return;
		if (!map.hasLayer(m)) m.addTo(map);
		map.flyTo([s.lat, s.lng], 11, { duration: 0.8 });
		setTimeout(() => m.openPopup(), 820);
	});
</script>

<div class="cc-map">
	<div class="cc-map__head">
		<span class="cc-map__title"><span class="cc-live-dot"></span>JARINGAN TULANG BAWANG · LIVE</span>
		<span class="cc-map__head-r">
			<span class="cc-map__sub">{TB_SENSORS.length} node · 15 kecamatan</span>
			{#if twinHref}
				<a class="cc-map__twin" href={twinHref} title="Buka Digital Twin 3D"><Box size={13} /> 3D Twin</a>
			{/if}
		</span>
	</div>
	<div class="cc-map__viz">
		<div class="tb-leaflet" bind:this={mapEl}></div>
	</div>
	<div class="cc-map__legend">
		<span><i style="background:#46D78F"></i>Normal · {counts.ok || 0}</span>
		<span><i style="background:#FFB454"></i>Siaga · {counts.warn || 0}</span>
		<span><i style="background:#FF7A66"></i>Awas · {counts.alarm || 0}</span>
		<span class="cc-map__legend-river"><i></i>Sungai</span>
	</div>
</div>
