<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadDiyBoundary } from '$lib/ews/data/geojson';
	import { SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
	import type { MapMarker, AssetKind } from '$lib/ews/types';

	interface Props {
		markers: MapMarker[];
		center?: [number, number];
		zoom?: number;
		onMarkerClick?: (m: MapMarker) => void;
		/** filter: jenis aset yang disembunyikan */
		hiddenKinds?: AssetKind[];
	}
	let {
		markers,
		center = [-7.8, 110.37],
		zoom = 11,
		onMarkerClick,
		hiddenKinds = [],
	}: Props = $props();

	let el: HTMLDivElement;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let map: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let markerLayer: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let L: any = null;

	/** registry: id → { marker, status } for diffing */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const reg = new Map<string, { marker: any; status: string }>();

	function iconFor(m: MapMarker) {
		const color = SIAGA_COLOR[m.status];
		const pulse = m.status !== 'normal' ? 'ews-marker--pulse' : '';
		return L.divIcon({
			className: '',
			iconSize: [24, 24],
			iconAnchor: [12, 12],
			html: `<div class="ews-marker ${pulse}" style="--mc:${color};width:24px;height:24px;position:relative;">
				<span class="ews-marker__ring"></span>
				<span class="ews-marker__core"></span>
			</div>`,
		});
	}

	function tooltipFor(m: MapMarker): string {
		const color = SIAGA_COLOR[m.status];
		return `<div style="font-weight:600;color:var(--stesy-ink-strong,#e8e8e8)">${m.nama}</div>
		<div style="margin-top:2px;font-size:10px;">
			<span style="color:${color};font-weight:600">${siagaLabel(m.status)}</span>
		</div>`;
	}

	function syncMarkers(ms: MapMarker[]) {
		if (!map || !markerLayer || !L) return;

		const visible = ms.filter((m) => !hiddenKinds.includes(m.kind));
		const visibleIds = new Set(visible.map((m) => m.id));

		// remove markers that disappeared or are now filtered
		for (const [id, entry] of reg) {
			if (!visibleIds.has(id)) {
				markerLayer.removeLayer(entry.marker);
				reg.delete(id);
			}
		}

		// add / update
		for (const m of visible) {
			const existing = reg.get(m.id);
			if (!existing) {
				const marker = L.marker([m.lat, m.lng], { icon: iconFor(m) })
					.bindTooltip(tooltipFor(m), {
						direction: 'top',
						offset: [0, -10],
						className: 'ews-tip',
						opacity: 1,
					})
					.on('click', () => onMarkerClick?.(m));
				marker.addTo(markerLayer);
				reg.set(m.id, { marker, status: m.status });
			} else {
				if (existing.status !== m.status) {
					existing.marker.setIcon(iconFor(m));
					existing.status = m.status;
				}
				existing.marker.setTooltipContent(tooltipFor(m));
				// re-bind click in case reference changed
				existing.marker.off('click').on('click', () => onMarkerClick?.(m));
			}
		}
	}

	onMount(() => {
		if (!browser) return;
		let destroyed = false;

		(async () => {
			// @ts-ignore — leaflet ships without bundled types in this repo
			L = (await import('leaflet')).default ?? (await import('leaflet'));
			await import('leaflet/dist/leaflet.css');
			if (destroyed || !el) return;

			map = L.map(el, {
				center,
				zoom,
				zoomControl: true,
				attributionControl: true,
				scrollWheelZoom: true,
			});

			L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 19,
			}).addTo(map);

			markerLayer = L.layerGroup().addTo(map);

			// load DIY boundary
			try {
				const geo = await loadDiyBoundary();
				if (!destroyed && map) {
					L.geoJSON(geo, {
						style: {
							color: '#4A90C4',
							weight: 2,
							opacity: 0.7,
							fillColor: '#2A5E8A',
							fillOpacity: 0.08,
						},
					}).addTo(map);
				}
			} catch (e) {
				console.warn('[BasinMap] boundary load failed:', e);
			}

			// initial marker render
			syncMarkers(markers);

			setTimeout(() => map?.invalidateSize(), 80);

			// resize observer
			let roTimer: ReturnType<typeof setTimeout> | undefined;
			const ro = new ResizeObserver(() => {
				clearTimeout(roTimer);
				roTimer = setTimeout(() => map?.invalidateSize(), 80);
			});
			ro.observe(el);

			return () => {
				ro.disconnect();
				clearTimeout(roTimer);
			};
		})();

		return () => {
			destroyed = true;
			if (map) {
				map.remove();
				map = null;
			}
			reg.clear();
			markerLayer = null;
		};
	});

	// live updates: re-sync markers when prop changes
	$effect(() => {
		// read reactive deps
		const ms = markers;
		const hk = (hiddenKinds ?? []).join('|');
		void hk;
		if (map && markerLayer && L) syncMarkers(ms);
	});

	// fly to new center/zoom when props change (enables auto-tour in WallView)
	$effect(() => {
		const lat = center[0];
		const lng = center[1];
		const z = zoom;
		if (map && L) {
			map.flyTo([lat, lng], z, { duration: 1.2 });
		}
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={el} class="h-full w-full ews-basin-map"></div>
</div>

<style>
	/* Marker styles injected into the page (Leaflet divIcon renders outside component scope) */
	:global(.ews-marker) {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.ews-marker__ring) {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 2px solid var(--mc, #1f8a5c);
		opacity: 0.5;
	}
	:global(.ews-marker__core) {
		position: absolute;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--mc, #1f8a5c);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	:global(.ews-marker--pulse .ews-marker__ring) {
		animation: ews-pulse 1.8s ease-out infinite;
	}
	@keyframes ews-pulse {
		0% { transform: scale(0.8); opacity: 0.7; }
		100% { transform: scale(2); opacity: 0; }
	}
	:global(.ews-tip) {
		background: rgba(15, 20, 30, 0.92) !important;
		border: 1px solid rgba(74, 144, 196, 0.3) !important;
		border-radius: 6px !important;
		padding: 6px 10px !important;
		font-size: 11px !important;
		color: #ccc !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
	}
	:global(.ews-tip::before) {
		display: none !important;
	}
</style>
