<script lang="ts">
	import WqGauge from './WqGauge.svelte';
	import { WQ_STATIONS } from './data';
	let { compact = false, station = 'WQ-03' }: { compact?: boolean; station?: string } = $props();

	let st = $derived(WQ_STATIONS.find((s) => s.id === station) ?? WQ_STATIONS[0]);
	let bad = $derived(st.gauges.filter((g) => Number(g.value) < g.ok[0] || Number(g.value) > g.ok[1]).length);
</script>

<div class="card" style="height:100%;overflow:hidden;display:flex;flex-direction:column;min-height:0;padding:{compact ? 14 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 8 : 14}px">
		<div style="display:flex;flex-direction:column;gap:4px;min-width:0">
			<span class="label" style="font-size:{compact ? 10 : 11}px">KUALITAS AIR · {st.id} {st.name.split('·').pop()?.trim().toUpperCase()}</span>
			{#if !compact}<span style="font-family:var(--font-mono);font-size:12px;color:var(--ink-mute)">Sampling {st.sampled}</span>{/if}
		</div>
		{#if bad}
			<span class="pill pill--danger" style="font-size:11px">{bad} parameter di luar ambang</span>
		{:else}
			<span class="pill pill--green" style="font-size:11px">Semua normal</span>
		{/if}
	</div>
	<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:{compact ? 4 : 6}px;flex:1;min-height:0;align-items:stretch">
		{#each st.gauges as g (g.label)}
			<WqGauge label={g.label} value={g.value} unit={g.unit} min={g.min} max={g.max} ok={g.ok} {compact} />
		{/each}
	</div>
</div>
