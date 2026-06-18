<script lang="ts">
	import '$lib/components/ews/theme.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { isAuthed } from '$lib/ews/auth';
	import { startSimulation } from '$lib/ews/stores';
	import { theme } from '$lib/ews/theme';
	import TopBar from '$lib/components/ews/layout/TopBar.svelte';
	import TabNav from '$lib/components/ews/layout/TabNav.svelte';

	let { children } = $props();
	let isWall = $derived($page.url.pathname.startsWith('/demo/ews/wall'));
	let isLogin = $derived($page.url.pathname.startsWith('/demo/ews/login'));

	onMount(() => {
		if (!get(isAuthed) && !get(page).url.pathname.includes('/login')) goto('/demo/ews/login');
		const stop = startSimulation();
		return stop;
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="stesy {$theme === 'light' && !isWall ? 'theme-light' : ''} min-h-screen">
	{#if !isWall && !isLogin}
		<TopBar />
		<TabNav />
	{/if}
	{@render children()}
</div>
