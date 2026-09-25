<script lang="ts">
	import { CircleCheck } from '@lucide/svelte';
	import Sidebar from '$lib/components/demo-dashboard/Sidebar.svelte';
	import TopBar from '$lib/components/demo-dashboard/TopBar.svelte';
	import { shell } from '$lib/components/demo-dashboard/ui.svelte';
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

{#if shell.toast}
	{#key shell.toastId}
		<div class="demo-toast" role="status"><CircleCheck size={16} color="#46d78f" /> {shell.toast}</div>
	{/key}
{/if}
