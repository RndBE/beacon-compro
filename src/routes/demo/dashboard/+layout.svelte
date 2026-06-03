<script lang="ts">
	import Sidebar from '$lib/components/demo-dashboard/Sidebar.svelte';
	import TopBar from '$lib/components/demo-dashboard/TopBar.svelte';
	let { children } = $props();
</script>

<div class="demo-app">
	<Sidebar />
	<div class="demo-app__main">
		<TopBar />
		<div class="demo-app__content">
			{@render children()}
		</div>
	</div>
</div>
