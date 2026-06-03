<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import TulangBawangMap from '$lib/components/demo-dashboard/TulangBawangMap.svelte';
	import { TB_SENSORS, TB_TYPE_META } from '$lib/components/demo-dashboard/data';

	let q = $state('');
	let rows = $derived(
		TB_SENSORS.filter(
			(s) =>
				s.name.toLowerCase().includes(q.toLowerCase()) ||
				s.id.toLowerCase().includes(q.toLowerCase()) ||
				s.type.toLowerCase().includes(q.toLowerCase())
		)
	);
	const labelFor = (s: string) => (s === 'alarm' ? 'AWAS' : s === 'warn' ? 'SIAGA' : 'NORMAL');
</script>

<svelte:head><title>Jaringan Sites · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Jaringan Sites" sub="{TB_SENSORS.length} node terpantau · Tulang Bawang, Lampung" />
	<div class="demo-grid-2">
		<div style="height:480px"><TulangBawangMap /></div>
		<div class="card" style="overflow:auto">
			<input
				placeholder="Cari node / kode / tipe…"
				aria-label="Cari node"
				bind:value={q}
				style="width:100%;margin-bottom:12px;padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-family:var(--font-mono);font-size:13px"
			/>
			<table class="demo-table">
				<thead>
					<tr><th>Kode</th><th>Lokasi</th><th>Tipe</th><th>Nilai</th><th>Status</th></tr>
				</thead>
				<tbody>
					{#each rows as s (s.id)}
						<tr>
							<td style="font-family:var(--font-mono);font-weight:700">{s.id}</td>
							<td>{s.name}</td>
							<td>
								<span
									style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:{TB_TYPE_META[
										s.type
									].color}">{s.type}</span
								>
							</td>
							<td style="font-family:var(--font-mono);white-space:nowrap">{s.value}{s.unit ? ' ' + s.unit : ''}</td>
							<td>
								<span style="display:inline-flex;align-items:center;gap:7px">
									<span class="status-dot {s.status}" style="width:8px;height:8px"></span>{labelFor(s.status)}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
