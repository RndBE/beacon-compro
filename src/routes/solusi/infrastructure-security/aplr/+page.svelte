<script lang="ts">
	import AplrPage from '../../pressure-measurement/aplr/+page.svelte';

	let { data } = $props();
</script>

<AplrPage {data} />
