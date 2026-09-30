<script lang="ts">
	// The 12 Wosusokas loggers on their real coordinates, coloured by what they report now.
	// The pipe network itself is not in any dataset, so only the inlet–outlet pairs of one
	// DMA station are drawn; reservoir names label the middle of their loggers.
	import { onMount } from 'svelte';
	import { DARK_ATTRIBUTION, DARK_BASE_URL, DARK_LABELS_URL } from '../demo-dashboard/basemap';
	import { LOGGERS, PAIRS, RESERVOIRS, decodeFault, roleTag, type Logger, type ReservoirId } from './wosusokas';
	import { field, reading, statusOf, type Status } from './field.svelte';
	import { fmtClock, fmtNum } from './util';

	let {
		focusId = null,
		title = 'LOGGER LAPANGAN · SPAM WOSUSOKAS',
		wheel = false,
		legend = true,
		onselect
	}: {
		/** logger id to fly to and open */
		focusId?: string | null;
		title?: string;
		/** allow scroll-wheel zoom */
		wheel?: boolean;
		legend?: boolean;
		onselect?: (id: string) => void;
	} = $props();

	const COLOR: Record<Status, string> = { ok: '#46D78F', warn: '#FFB454', alarm: '#FF7A66' };
	const ROLE_COLOR = { in: '#A08BFF', out: '#3CC3F2' } as const;

	let mapEl = $state<HTMLDivElement | null>(null);
	let ready = $state(false);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let map: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let L: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const markers = new Map<string, any>();
	const shown: Record<string, Status> = {};

	function icon(l: Logger, st: Status) {
		return L.divIcon({
			className: 'tb-div-icon',
			html: `<span class="tb-marker tb-marker--${st} pdam-marker" style="--c:${ROLE_COLOR[l.role]};--s:${COLOR[st]}"><span class="tb-marker__pulse"></span><span class="tb-marker__core">${roleTag(l)}</span></span>`,
			iconSize: [40, 40],
			iconAnchor: [20, 20]
		});
	}

	function popup(l: Logger) {
		const r = reading(l);
		const s = statusOf(r);
		const p = r.v.p1 == null ? '—' : r.v.p2 == null ? `${fmtNum(r.v.p1, 2)} bar` : `${fmtNum(r.v.p1, 2)} · ${fmtNum(r.v.p2, 2)} bar`;
		const rows = [
			`<span>Debit</span><b>${r.v.flow != null ? `${fmtNum(r.v.flow, 1)} L/s` : '—'}</b>`,
			`<span>${l.pressures === 2 ? 'P1 · P2' : 'Tekanan'}</span><b>${p}</b>`,
			`<span>Totalizer</span><b>${r.v.tot != null ? `${fmtNum(r.v.tot)} m³` : '—'}</b>`
		];
		const faults = r.v.fault ? decodeFault(r.v.fault) : [];
		const src = field.mode === 'skenario' ? 'SIMULASI' : r.t != null ? `data ${fmtClock(r.t / 60)}` : 'belum ada data';
		return (
			`<div class="tb-pop pdam-pop"><div class="tb-pop__head"><b>${l.id} · ${roleTag(l)}</b><span style="color:${COLOR[s.st]}">● ${s.label}</span></div>` +
			`<div class="tb-pop__name">${l.name}</div>` +
			`<div class="pdam-pop__rows">${rows.map((x) => `<div>${x}</div>`).join('')}</div>` +
			(faults.length ? `<div class="pdam-pop__note">${faults.join(' · ')}</div>` : '') +
			`<div class="pdam-pop__foot">${RESERVOIRS[l.reservoir].name} · ${src}</div></div>`
		);
	}

	onMount(() => {
		let destroyed = false;
		(async () => {
			// @ts-ignore — leaflet ships without bundled types in this repo
			L = (await import('leaflet')).default ?? (await import('leaflet'));
			await import('leaflet/dist/leaflet.css');
			if (destroyed || !mapEl) return;

			map = L.map(mapEl, { zoomControl: false, attributionControl: false, scrollWheelZoom: wheel, zoomSnap: 0.25 });
			L.tileLayer(DARK_BASE_URL, { maxZoom: 18, className: 'tb-tiles' }).addTo(map);
			L.tileLayer(DARK_LABELS_URL, { maxZoom: 18, className: 'tb-tiles-labels', pane: 'shadowPane' }).addTo(map);
			L.control.zoom({ position: 'bottomright' }).addTo(map);
			L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution(`${DARK_ATTRIBUTION} · © OpenStreetMap · Logger: mini-stesy`).addTo(map);

			for (const { dma, inlet, outlet } of PAIRS)
				L.polyline(
					[
						[inlet.lat, inlet.lng],
						[outlet.lat, outlet.lng]
					],
					{ color: ROLE_COLOR.in, weight: 2, opacity: 0.8, dashArray: '4 5' }
				)
					.bindTooltip(`DMA ${dma} · inlet ↔ outlet (meter seri)`, { className: 'pdam-tip', sticky: true, opacity: 1 })
					.addTo(map);

			for (const r of Object.keys(RESERVOIRS) as ReservoirId[]) {
				const ls = LOGGERS.filter((l) => l.reservoir === r);
				const lat = Math.max(...ls.map((l) => l.lat)) + 0.004;
				const lng = ls.reduce((a, l) => a + l.lng, 0) / ls.length;
				L.marker([lat, lng], {
					interactive: false,
					keyboard: false,
					icon: L.divIcon({
						className: 'pdam-zlabel-icon',
						html: `<span class="pdam-zlabel" style="--c:${RESERVOIRS[r].color}"><b>${RESERVOIRS[r].name}</b><small>${ls.length} logger · ${RESERVOIRS[r].area}</small></span>`,
						iconSize: [0, 0]
					})
				}).addTo(map);
			}

			for (const l of LOGGERS) {
				const st = statusOf(reading(l)).st;
				shown[l.id] = st;
				const m = L.marker([l.lat, l.lng], { icon: icon(l, st), riseOnHover: true, zIndexOffset: l.role === 'out' ? 200 : 100 }).bindPopup(
					() => popup(l),
					{ className: 'tb-popup' }
				);
				m.on('click', () => onselect?.(l.id));
				m.addTo(map);
				markers.set(l.id, m);
			}

			map.fitBounds(L.latLngBounds(LOGGERS.map((l) => [l.lat, l.lng])).pad(0.12));
			await new Promise((r) => setTimeout(r, 80));
			if (destroyed || !map) return;
			map.invalidateSize();
			ready = true;
		})();

		return () => {
			destroyed = true;
			map?.remove();
			map = null;
			markers.clear();
		};
	});

	// recolour when a snapshot arrives or the mode flips
	$effect(() => {
		const states = LOGGERS.map((l) => [l, statusOf(reading(l)).st] as const);
		if (!ready) return;
		for (const [l, st] of states)
			if (st !== shown[l.id]) {
				shown[l.id] = st;
				markers.get(l.id)?.setIcon(icon(l, st));
			}
	});

	$effect(() => {
		const id = focusId;
		if (!ready || !id || !map) return;
		const m = markers.get(id);
		if (!m) return;
		map.flyTo(m.getLatLng(), 16, { duration: 0.8 });
		setTimeout(() => m.openPopup(), 820);
	});

	let counts = $derived(
		LOGGERS.reduce((acc, l) => ((acc[statusOf(reading(l)).st] += 1), acc), { ok: 0, warn: 0, alarm: 0 } as Record<Status, number>)
	);
</script>

<div class="cc-map pdam-map">
	<div class="cc-map__head">
		<span class="cc-map__title"><span class="cc-live-dot"></span>{title}</span>
		<span class="cc-map__head-r">
			<span class="cc-map__sub">{LOGGERS.length} logger · 2 reservoir · {PAIRS.length} stasiun inlet–outlet</span>
		</span>
	</div>
	<div class="cc-map__viz">
		<div class="tb-leaflet" bind:this={mapEl}></div>
	</div>
	{#if legend}
		<div class="cc-map__legend pdam-map__legend">
			<span><i style="background:{ROLE_COLOR.out}"></i>Outlet</span>
			<span><i style="background:{ROLE_COLOR.in}"></i>Inlet</span>
			<span><i style="background:#46D78F"></i>Mengalir · {counts.ok}</span>
			<span><i style="background:#FFB454"></i>Tidak mengalir / fault · {counts.warn}</span>
			{#if counts.alarm}<span><i style="background:#FF7A66"></i>Offline · {counts.alarm}</span>{/if}
		</div>
	{/if}
</div>
