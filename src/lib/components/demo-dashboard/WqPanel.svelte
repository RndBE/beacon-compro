<script lang="ts">
	import WqGauge from './WqGauge.svelte';
	import { WQ_GAUGES } from './data';
	let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="card" style="height:100%;overflow:hidden;display:flex;flex-direction:column;min-height:0;padding:{compact ? 14 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 8 : 14}px">
		<span class="label" style="font-size:{compact ? 10 : 11}px">KUALITAS AIR · WQ-03 RAWAJITU</span>
		<span class="pill pill--amber" style="font-size:11px">1 parameter siaga</span>
	</div>
	<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:{compact ? 4 : 6}px;flex:1;min-height:0;align-items:stretch">
		{#each WQ_GAUGES as g (g.label)}
			<WqGauge label={g.label} value={g.value} unit={g.unit} min={g.min} max={g.max} ok={g.ok} {compact} />
		{/each}
	</div>
</div>
