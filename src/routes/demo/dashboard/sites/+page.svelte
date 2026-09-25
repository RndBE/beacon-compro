<script lang="ts">
	import { page } from '$app/stores';
	import { Box, MapPin, Search, Crosshair } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import TulangBawangMap from '$lib/components/demo-dashboard/TulangBawangMap.svelte';
	import { TB_SENSORS, TB_TYPE_META, type TbSensorType } from '$lib/components/demo-dashboard/data';

	let q = $state('');
	let types = $state<TbSensorType[]>([]);
	let focusId = $state<string | null>($page.url.searchParams.get('focus'));

	const TYPE_LIST = Object.keys(TB_TYPE_META) as TbSensorType[];
	const countOf = (t: TbSensorType) => TB_SENSORS.filter((s) => s.type === t).length;
	const statusCount = (st: string) => TB_SENSORS.filter((s) => s.status === st).length;

	let rows = $derived(
		TB_SENSORS.filter((s) => {
			const needle = q.toLowerCase();
			const hit =
				s.name.toLowerCase().includes(needle) ||
				s.id.toLowerCase().includes(needle) ||
				s.type.toLowerCase().includes(needle);
			return hit && (types.length === 0 || types.includes(s.type));
		})
	);
	const labelFor = (s: string) => (s === 'alarm' ? 'AWAS' : s === 'warn' ? 'SIAGA' : 'NORMAL');
	function toggle(t: TbSensorType) {
		types = types.includes(t) ? types.filter((x) => x !== t) : [...types, t];
	}
</script>

<svelte:head><title>Jaringan Sites · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Jaringan Sites" sub="{TB_SENSORS.length} node terpantau · Tulang Bawang, Lampung" icon={MapPin}>
		<a class="demo-btn" href="/demo/dashboard/digital-twin"><Box size={15} /> Lihat di 3D</a>
	</PageHead>

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Total node</span>
			<span class="demo-stat__v">{TB_SENSORS.length}<small>titik</small></span>
			<span class="demo-stat__s">6 tipe sensor</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Normal</span>
			<span class="demo-stat__v" style="color:var(--green)">{statusCount('ok')}</span>
			<span class="demo-stat__s">beroperasi sesuai ambang</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Siaga</span>
			<span class="demo-stat__v" style="color:var(--amber)">{statusCount('warn')}</span>
			<span class="demo-stat__s">AWLR-02 · ARR-02</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Awas</span>
			<span class="demo-stat__v" style="color:var(--danger)">{statusCount('alarm')}</span>
			<span class="demo-stat__s">WQ-03 · pH 5.1</span>
		</div>
	</div>

	<div class="demo-grid-2 sites-grid">
		<div class="sites-map"><TulangBawangMap types={types.length ? types : null} {focusId} twinHref="" /></div>
		<div class="card sites-list">
			<div class="sites-list__tools">
				<label class="demo-search">
					<Search size={15} />
					<input placeholder="Cari node / kode / tipe…" aria-label="Cari node" bind:value={q} />
				</label>
				<div class="demo-chips" role="group" aria-label="Filter tipe">
					{#each TYPE_LIST as t (t)}
						<button class="demo-chip" class:is-on={types.includes(t)} style="--c:{TB_TYPE_META[t].color}" onclick={() => toggle(t)}>
							<i></i>{t}<small>{countOf(t)}</small>
						</button>
					{/each}
				</div>
			</div>
			<div class="sites-list__scroll">
				<table class="demo-table">
					<thead>
						<tr><th>Kode</th><th>Lokasi</th><th>Tipe</th><th>Nilai</th><th>Status</th><th></th></tr>
					</thead>
					<tbody>
						{#each rows as s (s.id)}
							<tr class:is-focus={focusId === s.id} onclick={() => (focusId = s.id)}>
								<td style="font-family:var(--font-mono);font-weight:700">{s.id}</td>
								<td>{s.name}</td>
								<td>
									<span class="sites-type" style="--c:{TB_TYPE_META[s.type].color}">{s.type}</span>
								</td>
								<td style="font-family:var(--font-mono);white-space:nowrap">{s.value}{s.unit ? ' ' + s.unit : ''}</td>
								<td>
									<span style="display:inline-flex;align-items:center;gap:7px;white-space:nowrap">
										<span class="status-dot {s.status}" style="width:8px;height:8px"></span>{labelFor(s.status)}
									</span>
								</td>
								<td class="sites-act">
									<button title="Tampilkan di peta" aria-label="Tampilkan {s.id} di peta" onclick={(e) => (e.stopPropagation(), (focusId = s.id))}><Crosshair size={14} /></button>
									<a title="Buka di digital twin" aria-label="Buka {s.id} di digital twin" href="/demo/dashboard/digital-twin?focus={s.id}" onclick={(e) => e.stopPropagation()}><Box size={14} /></a>
								</td>
							</tr>
						{:else}
							<tr><td colspan="6" class="sites-empty">Tidak ada node yang cocok.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
