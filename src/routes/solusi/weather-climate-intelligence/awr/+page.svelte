<script lang="ts">
	import AwrPage from '../../weather-forecast/awr/+page.svelte';

	let { data } = $props();
</script>

<AwrPage {data} />
