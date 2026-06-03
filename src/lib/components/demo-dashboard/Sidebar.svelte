<script lang="ts">
	import { page } from '$app/stores';
	import { NAV } from './data';
	import BrandMark from './BrandMark.svelte';
	import {
		LayoutDashboard,
		MapPin,
		Waves,
		Cpu,
		FlaskConical,
		Bell,
		Sparkles,
		FileText,
		Settings,
		LogOut
	} from '@lucide/svelte';

	const icons: Record<string, typeof LayoutDashboard> = {
		LayoutDashboard,
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
</script>

<aside class="demo-side">
	<div class="demo-side__brand">
		<BrandMark />
	</div>
	<nav class="demo-side__nav">
		{#each NAV as item (item.href)}
			{@const Icon = icons[item.icon]}
			<a
				href={item.href}
				class="demo-side__item"
				class:demo-side__item--active={path === item.href}
			>
				<Icon size={18} />
				<span>{item.label}</span>
				{#if item.badge}<span class="demo-side__badge">{item.badge}</span>{/if}
			</a>
		{/each}
	</nav>
	<form class="demo-side__logout" method="POST" action="/demo/logout">
		<button type="submit"><LogOut size={18} /> Keluar</button>
	</form>
</aside>
