<script lang="ts">
	import { page } from '$app/stores';
	import { Activity, Box, History } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { SCHEMES, type Pin, type SchemeId } from '$lib/components/demo-spam/skema';
	import { LOGGER_BY_ID, RESERVOIRS, SUPPLY, decodeFault, roleTag, type Logger } from '$lib/components/demo-spam/wosusokas';
	import { field, reading, statusOf } from '$lib/components/demo-spam/field.svelte';
	import { ago, fmtClock, fmtNum } from '$lib/components/demo-spam/util';

	const COLOR = { ok: '#46D78F', warn: '#FFB454', alarm: '#FF7A66' } as const;
	const PILL = { ok: 'green', warn: 'amber', alarm: 'danger' } as const;

	let sid = $state<SchemeId>($page.url.searchParams.get('s') === 'mojolaban' ? 'mojolaban' : 'plesungan');
	let scheme = $derived(SCHEMES[sid]);
	let selId = $state<string | null>(null);
	let pins = $derived(scheme.pins.filter((p) => p.id).map((p) => ({ p, l: LOGGER_BY_ID[p.id!] })));
	let sel = $derived(pins.find((x) => x.l.id === selId) ?? pins[0]);

	let supply = $derived(SUPPLY.filter((l) => l.reservoir === scheme.reservoir).reduce((a, l) => a + Math.max(0, reading(l).v.flow ?? 0), 0));
	let flowing = $derived(pins.filter((x) => statusOf(reading(x.l)).st === 'ok').length);

	/** keep labels inside the artwork: left of pins near the right edge, above pins near the bottom */
	const place = (p: Pin) =>
		(p.at ?? [...(p.x > 72 ? (['l'] as const) : []), ...(p.y > 80 ? (['up'] as const) : [])]).map((k) => `spam-pin--${k}`).join(' ');
	const pressure = (l: Logger) => {
		const v = reading(l).v;
		return v.p1 == null ? '—' : v.p2 == null ? fmtNum(v.p1, 2) : `${fmtNum(v.p1, 2)} · ${fmtNum(v.p2, 2)}`;
	};
	function pickScheme(s: SchemeId) {
		sid = s;
		selId = null;
	}
</script>

<svelte:head><title>Skema Pipa · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Skema Pipa" sub="Isometrik Reservoir Plesungan & Mojolaban · pin di posisi logger · nilai live per titik" icon={Box}>
		<div class="demo-seg" role="group" aria-label="Skema">
			{#each Object.values(SCHEMES) as s (s.id)}
				<button class:is-on={sid === s.id} onclick={() => pickScheme(s.id)}>{RESERVOIRS[s.reservoir].short}</button>
			{/each}
		</div>
	</PageHead>

	<div class="spam-skema-layout">
		<div class="card spam-skema-card">
			<div class="spam-skema__head">
				<span class="label"><span class="spam-res" style="--c:{RESERVOIRS[scheme.reservoir].color}"><i></i>{RESERVOIRS[scheme.reservoir].name}</span></span>
				<span class="pdam-muted">{pins.length} logger · {flowing} mengalir · {fmtNum(supply, 1)} L/s ke DMA · area {scheme.areas.join(', ')}</span>
				{#if field.mode === 'skenario'}<span class="spam-badge spam-badge--sim">SIMULASI</span>{:else}<span class="spam-badge">LAPANGAN</span>{/if}
			</div>
			<div class="spam-skema">
				{#each scheme.layers as src (src)}<img {src} alt="" />{/each}
				{#each scheme.pins as p (p.label)}
					{#if p.id}
						{@const l = LOGGER_BY_ID[p.id]}
						{@const r = reading(l)}
						{@const s = statusOf(r)}
						<button
							class="spam-pin {place(p)}"
							class:is-on={sel?.l.id === p.id}
							style="left:{p.x}%;top:{p.y}%;--s:{COLOR[s.st]};--c:{l.role === 'in' ? '#A08BFF' : '#3CC3F2'}"
							onclick={() => (selId = p.id!)}
							aria-label="{p.label}: {s.label}"
						>
							<i></i>
							<span class="spam-pin__lbl">
								<b>{p.label}</b>
								<small>{r.v.flow != null ? fmtNum(r.v.flow, 1) : '—'} L/s · {pressure(l)} bar</small>
							</span>
						</button>
					{:else}
						<span class="spam-pin spam-pin--res {place(p)}" style="left:{p.x}%;top:{p.y}%">
							<i></i>
							<span class="spam-pin__lbl"><b>{p.label}</b><small>{fmtNum(supply, 1)} L/s ke DMA</small></span>
						</span>
					{/if}
				{/each}
			</div>
			<div class="cc-map__legend pdam-map__legend">
				<span><i style="background:#3CC3F2"></i>Outlet</span>
				<span><i style="background:#A08BFF"></i>Inlet</span>
				<span><i style="background:#46D78F"></i>Mengalir</span>
				<span><i style="background:#FFB454"></i>Tidak mengalir / fault</span>
				<span><i style="background:#FF7A66"></i>Offline</span>
				<span class="pdam-muted">artwork & posisi pin: mini-stesy</span>
			</div>
		</div>

		<aside class="spam-skema-side">
			<div class="card rt-picker spam-skema-list" aria-label="Titik di skema">
				<span class="label rt-picker__h">Titik di skema · {pins.length}</span>
				<div class="rt-group__items">
					{#each pins as x (x.l.id)}
						{@const r = reading(x.l)}
						<button class="rt-item" class:is-on={sel?.l.id === x.l.id} onclick={() => (selId = x.l.id)}>
							<span class="status-dot {statusOf(r).st}"></span>
							<span class="rt-item__id">{x.l.id} · {roleTag(x.l)}</span>
							<span class="rt-item__v">{r.v.flow != null ? `${fmtNum(r.v.flow, 1)} L/s` : '—'}</span>
							<span class="rt-item__name">{x.p.label}</span>
						</button>
					{/each}
				</div>
			</div>

			{#if sel}
				{@const r = reading(sel.l)}
				{@const s = statusOf(r)}
				{@const faults = r.v.fault ? decodeFault(r.v.fault) : []}
				<div class="card spam-skema-detail">
					<div class="card-h" style="margin-bottom:8px">
						<span class="label">{sel.l.id} · {roleTag(sel.l)}</span>
						<span class="pill pill--{PILL[s.st]}" style="font-size:10px;padding:3px 8px">{s.label.toUpperCase()}</span>
					</div>
					<div class="rekap-detail__name">{sel.l.name}</div>
					<dl class="pdam-dma__meta">
						<div><dt>Debit</dt><dd>{r.v.flow != null ? `${fmtNum(r.v.flow, 2)} L/s` : '—'}</dd></div>
						<div><dt>{sel.l.pressures === 2 ? 'P1 hulu · P2 hilir' : 'Tekanan'}</dt><dd>{pressure(sel.l)} bar</dd></div>
						<div><dt>Totalizer</dt><dd>{r.v.tot != null ? `${fmtNum(r.v.tot)} m³` : '—'}</dd></div>
						<div><dt>Flowmeter</dt><dd class:is-warn={faults.length > 0}>{faults.length ? faults.join(', ') : 'Normal'} · {r.v.fm != null ? `${fmtNum(r.v.fm)}%` : '–'}</dd></div>
						<div><dt>Data</dt><dd>{field.mode === 'skenario' ? 'simulasi' : r.t != null ? `${fmtClock(r.t / 60)} · ${ago(field.now - r.t)}` : 'belum ada'}</dd></div>
					</dl>
					<div class="rekap-detail__actions">
						<a class="demo-btn demo-btn--sm" href="/demo/spam/realtime?id={sel.l.id}"><Activity size={13} /> Realtime</a>
						<a class="demo-btn demo-btn--sm" href="/demo/spam/historis?id={sel.l.id}"><History size={13} /> Historis</a>
					</div>
				</div>
			{/if}
		</aside>
	</div>
</div>
