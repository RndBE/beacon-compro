<script lang="ts">
	import KpiRow from '$lib/components/demo-dashboard/KpiRow.svelte';
	import TulangBawangMap from '$lib/components/demo-dashboard/TulangBawangMap.svelte';
	import AwlrChart from '$lib/components/demo-dashboard/AwlrChart.svelte';
	import RainfallBars from '$lib/components/demo-dashboard/RainfallBars.svelte';
	import PumpGrid from '$lib/components/demo-dashboard/PumpGrid.svelte';
	import WqPanel from '$lib/components/demo-dashboard/WqPanel.svelte';
	import AiInsight from '$lib/components/demo-dashboard/AiInsight.svelte';
</script>

<svelte:head>
	<title>Overview · Command Center</title>
</svelte:head>

<div style="display:flex;flex-direction:column;gap:14px;min-height:calc(100vh - 120px)">
	<KpiRow />
	<div class="cc-main" style="flex:1">
		<TulangBawangMap />
		<div class="cc-col">
			<div style="flex:1;min-height:260px"><AwlrChart compact /></div>
			<div style="flex:1;min-height:260px"><RainfallBars compact /></div>
		</div>
		<div class="cc-col">
			<div style="flex:1.15;min-height:260px"><PumpGrid compact /></div>
			<div style="flex:1;min-height:240px"><WqPanel compact /></div>
		</div>
	</div>
	<AiInsight />
</div>
