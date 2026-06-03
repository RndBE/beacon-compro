<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import PumpGrid from '$lib/components/demo-dashboard/PumpGrid.svelte';
	import AlertFeed from '$lib/components/demo-dashboard/AlertFeed.svelte';
</script>

<svelte:head><title>Perangkat · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Perangkat" sub="Pompa, pintu air & status telemetri" />
	<div class="demo-grid-2" style="align-items:start">
		<PumpGrid />
		<AlertFeed />
	</div>
</div>
