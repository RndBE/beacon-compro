<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Box } from '@lucide/svelte';

	let {
		title,
		sub,
		icon: Icon,
		children
	}: { title: string; sub: string; icon?: typeof Box; children?: Snippet } = $props();
</script>

<div class="demo-page__head">
	<div class="demo-page__head-l">
		{#if Icon}<span class="demo-page__icon"><Icon size={20} /></span>{/if}
		<div class="demo-page__titles">
			<h1 class="demo-page__title">{title}</h1>
			<span class="demo-page__sub">{sub}</span>
		</div>
	</div>
	{#if children}<div class="demo-page__actions">{@render children()}</div>{/if}
</div>
