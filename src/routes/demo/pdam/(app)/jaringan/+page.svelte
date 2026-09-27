<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Box, Network, Search, Crosshair, Activity, Info } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import PdamMap from '$lib/components/demo-pdam/PdamMap.svelte';
	import { ASSETS, PIPES_URL, TYPE_META, ZONES, ZONE_BY_ID, ZONE_BY_NAME, type AssetType } from '$lib/components/demo-pdam/data';
	import { live, useLive } from '$lib/components/demo-pdam/live.svelte';
	import { fmtNum, readLive } from '$lib/components/demo-pdam/sim';

	onMount(() => useLive());

	let q = $state('');
	let types = $state<AssetType[]>([]);
	let focusId = $state<string | null>($page.url.searchParams.get('focus'));

	const TYPE_LIST = Object.keys(TYPE_META) as AssetType[];
	const countOf = (t: AssetType) => ASSETS.filter((a) => a.type === t).length;
	const LABEL = { ok: 'NORMAL', warn: 'SIAGA', alarm: 'AWAS' } as const;

	let rows = $derived(
		ASSETS.filter((a) => {
			const needle = q.toLowerCase();
			const hit =
				a.name.toLowerCase().includes(needle) ||
				a.id.toLowerCase().includes(needle) ||
				ZONE_BY_ID[a.zone].name.toLowerCase().includes(needle);
			return hit && (types.length === 0 || types.includes(a.type));
		})
	);
	function toggle(t: AssetType) {
		types = types.includes(t) ? types.filter((x) => x !== t) : [...types, t];
	}

	/* ---- composition of the main network, straight from the GeoJSON ---- */
	type Seg = { kategori: string; diameter: number | null; material: string | null; zona: string | null; panjang_m: number };
	let segs = $state<Seg[]>([]);
	onMount(async () => {
		try {
			const g = await fetch(PIPES_URL).then((r) => r.json());
			segs = g.features.map((f: { properties: Seg }) => f.properties);
		} catch {
			/* optional */
		}
	});
	const km = (xs: Seg[]) => xs.reduce((a, s) => a + s.panjang_m, 0) / 1000;
	let kmT = $derived(km(segs.filter((s) => s.kategori === 'transmisi')));
	let kmU = $derived(km(segs.filter((s) => s.kategori === 'distribusi_utama')));
	let byDia = $derived.by(() => {
		const bins = [
			{ k: '≤ 6"', f: (d: number) => d <= 6 },
			{ k: '8"', f: (d: number) => d > 6 && d <= 8 },
			{ k: '9–10"', f: (d: number) => d > 8 && d <= 10 },
			{ k: '11–12"', f: (d: number) => d > 10 && d <= 12 },
			{ k: '14–18"', f: (d: number) => d > 12 && d <= 18 },
			{ k: '20–24"', f: (d: number) => d > 18 }
		];
		return bins.map((b) => ({ k: b.k, v: km(segs.filter((s) => s.diameter != null && b.f(s.diameter))) }));
	});
	const MAT_LABEL: Record<string, string> = { ACP: 'ACP (asbes semen)', PVC: 'PVC', CI: 'CI (besi tuang)', HDPE: 'HDPE', GI: 'GI', GS: 'GS', DCI: 'DCI' };
	let byMat = $derived.by(() => {
		const m = new Map<string, number>();
		for (const s of segs) m.set(s.material ?? '—', (m.get(s.material ?? '—') ?? 0) + s.panjang_m / 1000);
		return [...m.entries()]
			.filter(([, v]) => v >= 0.05)
			.sort((a, b) => b[1] - a[1])
			.map(([k, v]) => ({ k: k === '—' ? 'Tidak tercatat' : (MAT_LABEL[k] ?? k), v }));
	});
	let byZone = $derived(
		ZONES.map((z) => ({ z, v: km(segs.filter((s) => s.zona === z.name)) })).sort((a, b) => b.v - a.v)
	);
	let maxDia = $derived(Math.max(1, ...byDia.map((d) => d.v)));
	let maxMat = $derived(Math.max(1, ...byMat.map((d) => d.v)));
	let maxZone = $derived(Math.max(1, ...byZone.map((d) => d.v)));
	const ASB = 'Pipa ACP berumur perlu dipantau lebih ketat (rawan pecah pada tekanan tinggi).';
</script>

<svelte:head><title>Peta Jaringan · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Peta Jaringan" sub="Pipa transmisi & distribusi utama Tirtamarta · {segs.length || 446} segmen · {ASSETS.length} logger" icon={Network}>
		<a class="demo-btn" href="/demo/pdam/digital-twin"><Box size={15} /> Lihat di 3D</a>
	</PageHead>

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Pipa transmisi</span>
			<span class="demo-stat__v">{fmtNum(kmT, 1)}<small>km</small></span>
			<span class="demo-stat__s">sumber → reservoir / DMA</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Distribusi utama</span>
			<span class="demo-stat__v">{fmtNum(kmU, 1)}<small>km</small></span>
			<span class="demo-stat__s">JDU Ø6"–24" · tulang punggung zona</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Logger terpasang</span>
			<span class="demo-stat__v">{ASSETS.length}<small>titik</small></span>
			<span class="demo-stat__s">{countOf('DMA')} flowmeter DMA · {countOf('PT')} PT · {countOf('SC')} SC · {countOf('RES')} reservoir</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Zona pelayanan</span>
			<span class="demo-stat__v">{ZONES.length}<small>zona</small></span>
			<span class="demo-stat__s">{fmtNum(ZONES.reduce((a, z) => a + z.areaKm2, 0), 0)} km² · {fmtNum(ZONES.reduce((a, z) => a + z.sr, 0))} SR</span>
		</div>
	</div>

	<div class="demo-grid-2 sites-grid jar-grid">
		<div class="sites-map jar-map"><PdamMap types={types.length ? types : null} {focusId} twinHref="" wheel onselect={(id) => (focusId = id)} /></div>
		<div class="card sites-list">
			<div class="sites-list__tools">
				<label class="demo-search">
					<Search size={15} />
					<input placeholder="Cari logger / kode / zona…" aria-label="Cari logger" bind:value={q} />
				</label>
				<div class="demo-chips" role="group" aria-label="Filter tipe">
					{#each TYPE_LIST as t (t)}
						<button class="demo-chip" class:is-on={types.includes(t)} style="--c:{TYPE_META[t].color}" onclick={() => toggle(t)}>
							<i></i>{TYPE_META[t].label}<small>{countOf(t)}</small>
						</button>
					{/each}
				</div>
			</div>
			<div class="sites-list__scroll">
				<table class="demo-table">
					<thead>
						<tr><th>Kode</th><th>Lokasi</th><th>Nilai</th><th>Status</th><th></th></tr>
					</thead>
					<tbody>
						{#each rows as a (a.id)}
							{@const r = readLive(a, live.h, live.tick)}
							<tr class:is-focus={focusId === a.id} onclick={() => (focusId = a.id)}>
								<td style="font-family:var(--font-mono);font-weight:700;white-space:nowrap">
									<span class="sites-type" style="--c:{TYPE_META[a.type].color}">{a.type === 'DMA' ? (a.role === 'in' ? 'IN' : 'OUT') : TYPE_META[a.type].short}</span>
									{a.id}
								</td>
								<td>{a.name}</td>
								<td style="font-family:var(--font-mono);white-space:nowrap">{r.value}</td>
								<td>
									<span style="display:inline-flex;align-items:center;gap:7px;white-space:nowrap">
										<span class="status-dot {r.status}" style="width:8px;height:8px"></span>{LABEL[r.status]}
									</span>
								</td>
								<td class="sites-act">
									<button title="Tampilkan di peta" aria-label="Tampilkan {a.id} di peta" onclick={(e) => (e.stopPropagation(), (focusId = a.id))}><Crosshair size={14} /></button>
									<a title="Realtime" aria-label="Realtime {a.id}" href="/demo/pdam/realtime?id={a.id}" onclick={(e) => e.stopPropagation()}><Activity size={14} /></a>
									<a title="Buka di digital twin" aria-label="Buka {a.id} di digital twin" href="/demo/pdam/digital-twin?focus={a.id}" onclick={(e) => e.stopPropagation()}><Box size={14} /></a>
								</td>
							</tr>
						{:else}
							<tr><td colspan="5" class="sites-empty">Tidak ada logger yang cocok.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<div class="demo-grid-3 jar-comp">
		<div class="card">
			<div class="card-h"><span class="label">DIAMETER · KM PIPA UTAMA</span></div>
			<div class="jar-bars">
				{#each byDia as d (d.k)}
					<div class="jar-bar"><span>{d.k}</span><i class="twin-bar"><i style="width:{(d.v / maxDia) * 100}%"></i></i><b>{fmtNum(d.v, 1)} km</b></div>
				{/each}
			</div>
		</div>
		<div class="card">
			<div class="card-h"><span class="label">MATERIAL</span></div>
			<div class="jar-bars">
				{#each byMat as d (d.k)}
					<div class="jar-bar"><span>{d.k}</span><i class="twin-bar" class:twin-bar--amber={d.k.startsWith('ACP')}><i style="width:{(d.v / maxMat) * 100}%"></i></i><b>{fmtNum(d.v, 1)} km</b></div>
				{/each}
			</div>
			<p class="pdam-muted jar-note">{ASB}</p>
		</div>
		<div class="card">
			<div class="card-h"><span class="label">PER ZONA</span></div>
			<div class="jar-bars">
				{#each byZone as d (d.z.id)}
					<div class="jar-bar"><span><i style="background:{d.z.color}"></i>{d.z.name}</span><i class="twin-bar"><i style="width:{(d.v / maxZone) * 100}%;background:{ZONE_BY_NAME[d.z.name].color}"></i></i><b>{fmtNum(d.v, 1)} km</b></div>
				{/each}
			</div>
		</div>
	</div>

	<div class="card jar-source">
		<Info size={16} />
		<p>
			Geometri pipa: dataset jaringan perpipaan 2025 milik Perumda PDAM Tirtamarta di Geoportal Kota Yogyakarta. Yang ditampilkan hanya
			<b>pipa transmisi & distribusi utama</b> ({segs.length || 446} dari 9.148 segmen); pipa pembagi, pelayanan dan SR disembunyikan agar peta tetap terbaca.
			Batas zona diturunkan dari sebaran pipa per atribut zona (bukan batas resmi). Posisi logger dan seluruh nilai pengukuran adalah data demo.
		</p>
	</div>
</div>
