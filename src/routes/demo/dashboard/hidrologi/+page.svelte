<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AwlrChart from '$lib/components/demo-dashboard/AwlrChart.svelte';
	import RainfallBars from '$lib/components/demo-dashboard/RainfallBars.svelte';
</script>

<svelte:head><title>Hidrologi · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Hidrologi" sub="Tinggi muka air & curah hujan · realtime" />
	<div style="height:360px"><AwlrChart /></div>
	<div style="height:360px"><RainfallBars /></div>
</div>
