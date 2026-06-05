<script lang="ts">
	import SolutionDetail from '$lib/components/SolutionDetail.svelte';

	let { data } = $props();
</script>

<SolutionDetail detail={data.solutionDetail} />
