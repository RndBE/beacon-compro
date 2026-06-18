<script lang="ts">
	import type { Siaga } from '$lib/ews/types';
	import { SIAGA_COLOR } from '$lib/ews/status';

	interface Props {
		status?: Siaga;
		size?: number;
	}
	let { status = 'normal', size = 20 }: Props = $props();

	const color = $derived(SIAGA_COLOR[status]);
</script>

<!-- Station / monitoring post icon: a simple antenna/tower SVG -->
<svg
	width={size}
	height={size}
	viewBox="0 0 20 20"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<!-- base platform -->
	<rect x="4" y="15" width="12" height="2" rx="1" fill={color} opacity="0.8" />
	<!-- tower mast -->
	<rect x="9.25" y="5" width="1.5" height="10" rx="0.75" fill={color} />
	<!-- antenna top -->
	<circle cx="10" cy="4" r="1.5" fill={color} />
	<!-- left arm -->
	<line x1="10" y1="8" x2="5" y2="13" stroke={color} stroke-width="1.2" stroke-linecap="round" />
	<!-- right arm -->
	<line x1="10" y1="8" x2="15" y2="13" stroke={color} stroke-width="1.2" stroke-linecap="round" />
	<!-- signal arc (outer) — only visible when not normal -->
	{#if status !== 'normal'}
		<path
			d="M6.5 2.5 A5 5 0 0 1 13.5 2.5"
			stroke={color}
			stroke-width="1.2"
			stroke-linecap="round"
			fill="none"
			opacity="0.6"
		/>
	{/if}
</svg>
