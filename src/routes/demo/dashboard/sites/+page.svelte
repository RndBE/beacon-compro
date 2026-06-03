<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import NationalMap from '$lib/components/demo-dashboard/NationalMap.svelte';
	import { CC_SITES } from '$lib/components/demo-dashboard/data';

	let q = $state('');
	let rows = $derived(
		CC_SITES.filter(
			(s) =>
				s.name.toLowerCase().includes(q.toLowerCase()) ||
				s.id.toLowerCase().includes(q.toLowerCase())
		)
	);
	const labelFor = (s: string) => (s === 'alarm' ? 'AWAS' : s === 'warn' ? 'SIAGA' : 'NORMAL');
</script>

<svelte:head><title>Jaringan Sites · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Jaringan Sites" sub="{CC_SITES.length} stasiun terpantau · 34 provinsi" />
	<div class="demo-grid-2">
		<div style="height:480px"><NationalMap /></div>
		<div class="card" style="overflow:auto">
			<input
				placeholder="Cari site / kode…"
				bind:value={q}
				style="width:100%;margin-bottom:12px;padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-family:var(--font-mono);font-size:13px"
			/>
			<table class="demo-table">
				<thead>
					<tr><th>Kode</th><th>Lokasi</th><th>Status</th></tr>
				</thead>
				<tbody>
					{#each rows as s (s.id)}
						<tr>
							<td style="font-family:var(--font-mono);font-weight:700">{s.id}</td>
							<td>{s.name}</td>
							<td>
								<span style="display:inline-flex;align-items:center;gap:7px">
									<span class="status-dot {s.s}" style="width:8px;height:8px"></span>{labelFor(s.s)}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
