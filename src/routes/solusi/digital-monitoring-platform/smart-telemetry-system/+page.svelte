<script lang="ts">
	import SmartTelemetryPage from '../../stesy/smart-telemetry-system/+page.svelte';

	let { data } = $props();
</script>

<SmartTelemetryPage {data} />
