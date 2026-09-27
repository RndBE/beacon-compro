<script lang="ts" module>
	export interface TopBarItem {
		k: string;
		v: string;
		tone?: 'danger' | 'ok';
		/** 'md' hides below 1100px, 'opt' below 1280px */
		hide?: 'md' | 'opt';
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Menu } from '@lucide/svelte';
	import { shell } from './ui.svelte';

	let {
		brand = 'SYSTEM ONLINE · NATIONAL',
		items = [
			{ k: 'Sensor aktif', v: '42 / 44', hide: 'md' },
			{ k: 'Last sync', v: '2s ago', hide: 'opt' },
			{ k: 'Alarm aktif', v: '1', tone: 'danger' },
			{ k: 'Notifikasi 24h', v: '186', hide: 'opt' },
			{ k: 'Uptime 30d', v: '99.6%', tone: 'ok', hide: 'opt' }
		]
	}: { brand?: string; items?: TopBarItem[] } = $props();

	let now = $state(new Date());
	onMount(() => {
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});

	const pad = (n: number) => String(n).padStart(2, '0');
	let hh = $derived(pad(now.getHours()));
	let mm = $derived(pad(now.getMinutes()));
	let ss = $derived(pad(now.getSeconds()));
	let date = $derived(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
</script>

<div class="cc-topbar">
	<button class="cc-topbar__menu" aria-label="Buka menu" onclick={() => (shell.navOpen = true)}><Menu size={18} /></button>
	<span class="cc-topbar__brand"><span class="cmdctr-pulse"></span> {brand}</span>
	<span class="cc-topbar__div"></span>
	{#each items as it (it.k)}
		<div
			class="cc-topbar__kv"
			class:cc-topbar__kv--md={it.hide === 'md'}
			class:cc-topbar__kv--opt={it.hide === 'opt'}
			class:cc-topbar__kv--danger={it.tone === 'danger'}
			class:cc-topbar__kv--ok={it.tone === 'ok'}
		>
			<span class="cc-topbar__kv-k">{it.k}</span><span class="cc-topbar__kv-v">{it.v}</span>
		</div>
	{/each}
	<span class="cc-topbar__clock">
		<b>{hh}:{mm}<span style="opacity:.5">:{ss}</span> WIB</b><span class="cc-topbar__date">{date}</span>
	</span>
</div>
