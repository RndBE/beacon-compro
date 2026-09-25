<script lang="ts">
	import { page } from '$app/stores';
	import { NAV_GROUPS } from './data';
	import BrandMark from './BrandMark.svelte';
	import { shell } from './ui.svelte';
	import {
		LayoutDashboard,
		Box,
		MapPin,
		Waves,
		Cpu,
		FlaskConical,
		Bell,
		Sparkles,
		FileText,
		Settings,
		LogOut,
		X
	} from '@lucide/svelte';

	const icons: Record<string, typeof LayoutDashboard> = {
		LayoutDashboard,
		Box,
		MapPin,
		Waves,
		Cpu,
		FlaskConical,
		Bell,
		Sparkles,
		FileText,
		Settings
	};

	let path = $derived($page.url.pathname);

	// close the drawer after navigating on mobile
	$effect(() => {
		void path;
		shell.navOpen = false;
	});
</script>

{#if shell.navOpen}
	<button class="demo-side__scrim" aria-label="Tutup menu" onclick={() => (shell.navOpen = false)}></button>
{/if}

<aside class="demo-side" class:is-open={shell.navOpen}>
	<div class="demo-side__brand">
		<BrandMark />
		<button class="demo-side__close" aria-label="Tutup menu" onclick={() => (shell.navOpen = false)}><X size={18} /></button>
	</div>
	<nav class="demo-side__nav">
		{#each NAV_GROUPS as group (group.label)}
			<span class="demo-side__group">{group.label}</span>
			{#each group.items as item (item.href)}
				{@const Icon = icons[item.icon]}
				<a
					href={item.href}
					class="demo-side__item"
					class:demo-side__item--active={path === item.href}
					aria-current={path === item.href ? 'page' : undefined}
				>
					<Icon size={18} />
					<span>{item.label}</span>
					{#if item.badge}<span class="demo-side__badge">{item.badge}</span>{/if}
					{#if item.tag}<span class="demo-side__tag">{item.tag}</span>{/if}
				</a>
			{/each}
		{/each}
	</nav>

	<div class="demo-side__region">
		<span class="demo-side__region-k">Pilot Smart Regency</span>
		<span class="demo-side__region-v">Pemkab Tulang Bawang</span>
		<span class="demo-side__region-s"><span class="cc-live-dot"></span>42/44 node online</span>
	</div>

	<form class="demo-side__logout" method="POST" action="/demo/logout">
		<button type="submit"><LogOut size={18} /> Keluar</button>
	</form>
</aside>
