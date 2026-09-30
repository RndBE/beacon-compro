<script lang="ts">
	import { page } from '$app/stores';
	import { Activity, Crosshair, History, Info, Network } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import WosusokasTwin from '$lib/components/demo-spam/WosusokasTwin.svelte';
	import { LOGGERS, PAIRS, RESERVOIRS, roleTag, type Logger } from '$lib/components/demo-spam/wosusokas';
	import { reading, statusOf } from '$lib/components/demo-spam/field.svelte';
	import { fmtNum } from '$lib/components/demo-spam/util';

	let focusId = $state<string | null>($page.url.searchParams.get('focus'));
	const PILL = { ok: 'green', warn: 'amber', alarm: 'danger' } as const;

	/** metres between two loggers (haversine) */
	function metres(a: Logger, b: Logger) {
		const R = 6_371_000;
		const rad = (x: number) => (x * Math.PI) / 180;
		const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
		return 2 * R * Math.asin(Math.sqrt(h));
	}
	const pressure = (l: Logger) => {
		const v = reading(l).v;
		return v.p1 == null ? '—' : v.p2 == null ? `${fmtNum(v.p1, 2)}` : `${fmtNum(v.p1, 2)} · ${fmtNum(v.p2, 2)}`;
	};
</script>

<svelte:head><title>Peta Jaringan · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Peta Jaringan" sub="{LOGGERS.length} logger lapangan · koordinat dari mini-stesy · Reservoir Mojolaban & Plesungan" icon={Network} />

	<div class="demo-grid-2 sites-grid jar-grid">
		<div class="sites-map jar-map"><WosusokasTwin {focusId} onselect={(id) => (focusId = id)} /></div>
		<div class="card sites-list">
			<div class="sites-list__scroll">
				<table class="demo-table">
					<thead><tr><th>Kode</th><th>Lokasi</th><th>Debit</th><th>Tekanan bar</th><th>Status</th><th></th></tr></thead>
					<tbody>
						{#each LOGGERS as l (l.id)}
							{@const r = reading(l)}
							{@const s = statusOf(r)}
							<tr class:is-focus={focusId === l.id} onclick={() => (focusId = l.id)}>
								<td style="font-family:var(--font-mono);font-weight:700;white-space:nowrap">
									<span class="sites-type" style="--c:{l.role === 'in' ? '#A08BFF' : '#3CC3F2'}">{roleTag(l)}</span>
									{l.id}
								</td>
								<td>{l.name}<div class="hydro-sub">{RESERVOIRS[l.reservoir].name}</div></td>
								<td class="mono">{r.v.flow != null ? `${fmtNum(r.v.flow, 1)} L/s` : '—'}</td>
								<td class="mono">{pressure(l)}</td>
								<td><span class="pill pill--{PILL[s.st]}" style="font-size:10px;padding:3px 8px">{s.label}</span></td>
								<td class="sites-act">
									<button title="Tampilkan di peta" aria-label="Tampilkan {l.id} di peta" onclick={(e) => (e.stopPropagation(), (focusId = l.id))}><Crosshair size={14} /></button>
									<a title="Realtime" aria-label="Realtime {l.id}" href="/demo/spam/realtime?id={l.id}" onclick={(e) => e.stopPropagation()}><Activity size={14} /></a>
									<a title="Data historis" aria-label="Data historis {l.id}" href="/demo/spam/historis?id={l.id}" onclick={(e) => e.stopPropagation()}><History size={14} /></a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<div class="demo-grid-3 jar-comp">
		{#each PAIRS as p (p.dma)}
			{@const fi = reading(p.inlet).v.flow}
			{@const fo = reading(p.outlet).v.flow}
			<div class="card">
				<div class="card-h"><span class="label">Stasiun DMA {p.dma} · inlet → outlet</span></div>
				<div class="jar-bars">
					<div class="jar-bar"><span>Jarak meter</span><b>{fmtNum(metres(p.inlet, p.outlet))} m</b></div>
					<div class="jar-bar"><span>Debit inlet · {p.inlet.id}</span><b>{fi != null ? `${fmtNum(fi, 1)} L/s` : '—'}</b></div>
					<div class="jar-bar"><span>Debit outlet · {p.outlet.id}</span><b>{fo != null ? `${fmtNum(fo, 1)} L/s` : '—'}</b></div>
					<div class="jar-bar"><span>Tekanan hulu · hilir</span><b>{pressure(p.inlet)} → {reading(p.outlet).v.p2 != null ? fmtNum(reading(p.outlet).v.p2!, 2) : '—'} bar</b></div>
				</div>
				<p class="pdam-muted jar-note">Meter seri di satu stasiun: debit keduanya seharusnya sama, selisih menandakan masalah meter atau stasiun.</p>
			</div>
		{/each}
	</div>

	<div class="card jar-source">
		<Info size={16} />
		<p>
			Posisi logger adalah koordinat pemasangan di database mini-stesy. Jalur pipa di model 3D bersifat indikatif: topologinya dari skema pipa mini-stesy
			(reservoir → stasiun DMA → meter seri inlet–outlet), jalurnya mengikuti jalan OpenStreetMap, dan jaringan distribusi digambar di jalan terdekat tiap
			outlet. Posisi reservoir diperkirakan dari skema. Pipa menyala dan mengalir saat meter di hilirnya mencatat debit.
		</p>
	</div>
</div>
