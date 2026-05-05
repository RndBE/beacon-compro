<script lang="ts">
	import InfrastructureSecurityPage from '../pressure-measurement/+page.svelte';

	let { data } = $props();
</script>

<InfrastructureSecurityPage {data} />
