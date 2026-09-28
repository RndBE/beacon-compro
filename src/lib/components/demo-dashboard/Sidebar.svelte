<script lang="ts">
	import { page } from '$app/stores';
	import { NAV_GROUPS, type NavGroup } from './data';
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
		Network,
		Activity,
		Radar,
		Scale,
		Gauge,
		Database,
		Siren,
		History,
		LogOut,
		X
	} from '@lucide/svelte';

	let {
		groups = NAV_GROUPS,
		eyebrow,
		title,
		region = { k: 'Pilot Smart Regency', v: 'Pemkab Tulang Bawang', s: '42/44 node online' },
		logout = '/demo/logout'
	}: {
		groups?: NavGroup[];
		/** BrandMark eyebrow/title; BrandMark's own defaults when omitted */
		eyebrow?: string;
		title?: string;
		region?: { k: string; v: string; s: string };
		/** POST target of the sign-out form */
		logout?: string;
	} = $props();

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
		Settings,
		Network,
		Activity,
		Radar,
		Scale,
		Gauge,
		Database,
		Siren,
		History
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
		<BrandMark {eyebrow} {title} />
		<button class="demo-side__close" aria-label="Tutup menu" onclick={() => (shell.navOpen = false)}><X size={18} /></button>
	</div>
	<nav class="demo-side__nav">
		{#each groups as group (group.label)}
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
		<span class="demo-side__region-k">{region.k}</span>
		<span class="demo-side__region-v">{region.v}</span>
		<span class="demo-side__region-s"><span class="cc-live-dot"></span>{region.s}</span>
	</div>

	<form class="demo-side__logout" method="POST" action={logout}>
		<button type="submit"><LogOut size={18} /> Keluar</button>
	</form>
</aside>
