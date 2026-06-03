<script lang="ts">
	import KpiRow from '$lib/components/demo-dashboard/KpiRow.svelte';
	import TulangBawangMap from '$lib/components/demo-dashboard/TulangBawangMap.svelte';
	import AwlrChart from '$lib/components/demo-dashboard/AwlrChart.svelte';
	import RainfallBars from '$lib/components/demo-dashboard/RainfallBars.svelte';
	import PumpGrid from '$lib/components/demo-dashboard/PumpGrid.svelte';
	import WqPanel from '$lib/components/demo-dashboard/WqPanel.svelte';
	import AiInsight from '$lib/components/demo-dashboard/AiInsight.svelte';
	import TrendCards from '$lib/components/demo-dashboard/TrendCards.svelte';
	import CctvMonitor from '$lib/components/demo-dashboard/CctvMonitor.svelte';
	import EwsPanel from '$lib/components/demo-dashboard/EwsPanel.svelte';
	import TelemetryHealth from '$lib/components/demo-dashboard/TelemetryHealth.svelte';
</script>

<svelte:head>
	<title>Overview · Command Center</title>
</svelte:head>

<div style="display:flex;flex-direction:column;gap:14px">
	<KpiRow />
	<div class="cc-main" style="min-height:600px">
		<TulangBawangMap />
		<div class="cc-col">
			<div style="flex:1;min-height:300px"><AwlrChart compact /></div>
			<div style="flex:1;min-height:300px"><RainfallBars compact /></div>
		</div>
		<div class="cc-col">
			<div style="flex:1.15;min-height:300px"><PumpGrid compact /></div>
			<div style="flex:1;min-height:270px"><WqPanel compact /></div>
		</div>
	</div>
	<AiInsight />

	<div class="demo-ops">
		<TrendCards />
		<div class="ops-row">
			<CctvMonitor />
			<EwsPanel />
			<TelemetryHealth />
		</div>
	</div>
</div>
