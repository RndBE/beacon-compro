<script lang="ts">
	import ArrPage from '../../weather-forecast/arr/+page.svelte';

	let { data } = $props();
</script>

<ArrPage {data} />
