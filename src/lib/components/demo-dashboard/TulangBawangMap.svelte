<script lang="ts">
	import { onMount } from 'svelte';
	import { TB_SENSORS, TB_TYPE_META, TB_GEOJSON_URL, type SiteStatus } from './data';

	let mapEl = $state<HTMLDivElement | null>(null);

	const STATUS_COLOR: Record<SiteStatus, string> = {
		ok: '#46D78F',
		warn: '#FFB454',
		alarm: '#FF7A66'
	};

	const counts = TB_SENSORS.reduce(
		(acc, s) => ((acc[s.status] = (acc[s.status] || 0) + 1), acc),
		{} as Record<string, number>
	);

	onMount(() => {
		let destroyed = false;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let map: any = null;

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

			L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
				maxZoom: 19,
				subdomains: 'abcd'
			}).addTo(map);
			L.control.zoom({ position: 'bottomright' }).addTo(map);

			for (const s of TB_SENSORS) {
				const meta = TB_TYPE_META[s.type];
				const icon = L.divIcon({
					className: 'tb-div-icon',
					html: `<span class="tb-marker tb-marker--${s.status}" style="--c:${meta.color};--s:${STATUS_COLOR[s.status]}"><span class="tb-marker__pulse"></span><span class="tb-marker__core">${meta.short}</span></span>`,
					iconSize: [40, 40],
					iconAnchor: [20, 20]
				});
				L.marker([s.lat, s.lng], { icon })
					.addTo(map)
					.bindPopup(
						`<b>${s.id}</b> · ${s.name}<br><span style="color:${STATUS_COLOR[s.status]}">●</span> ${s.value}${s.unit ? ' ' + s.unit : ''}`,
						{ className: 'tb-popup' }
					);
			}

			try {
				const res = await fetch(TB_GEOJSON_URL);
				if (res.ok && !destroyed && map) {
					const geo = await res.json();
					const layer = L.geoJSON(geo, {
						style: { color: '#3CC3F2', weight: 2, opacity: 0.9, fillColor: '#2876E8', fillOpacity: 0.06 }
					}).addTo(map);
					map.fitBounds(layer.getBounds(), { padding: [26, 26] });
				}
			} catch (e) {
				console.warn('[TulangBawangMap] boundary load failed:', e);
			}

			setTimeout(() => map && map.invalidateSize(), 80);
		})();

		return () => {
			destroyed = true;
			if (map) {
				map.remove();
				map = null;
			}
		};
	});
</script>

<div class="cc-map">
	<div class="cc-map__head">
		<span class="cc-map__title">JARINGAN TULANG BAWANG · LIVE</span>
		<span class="cc-map__sub">{TB_SENSORS.length} node · 15 kecamatan</span>
	</div>
	<div class="cc-map__viz">
		<div class="tb-leaflet" bind:this={mapEl}></div>
	</div>
	<div class="cc-map__legend">
		<span><i style="background:#46D78F"></i>Normal · {counts.ok || 0}</span>
		<span><i style="background:#FFB454"></i>Siaga · {counts.warn || 0}</span>
		<span><i style="background:#FF7A66"></i>Awas · {counts.alarm || 0}</span>
	</div>
</div>
