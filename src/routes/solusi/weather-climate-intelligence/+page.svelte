<script lang="ts">
	import WeatherClimatePage from '../weather-forecast/+page.svelte';

	let { data } = $props();
</script>

<WeatherClimatePage {data} />
