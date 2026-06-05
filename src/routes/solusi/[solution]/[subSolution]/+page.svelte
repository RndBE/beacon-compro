<script lang="ts">
	import SubSolutionDetail from '$lib/components/SubSolutionDetail.svelte';

	let { data } = $props();
</script>

<SubSolutionDetail detail={data.subSolutionDetail} />
