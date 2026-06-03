<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import WqPanel from '$lib/components/demo-dashboard/WqPanel.svelte';
</script>

<svelte:head><title>Kualitas Air · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Kualitas Air" sub="Parameter mutu air · WQ-03 Rawajitu" />
	<div style="height:420px"><WqPanel /></div>
</div>
