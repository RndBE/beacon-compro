<script lang="ts">
	import '$lib/components/demo-pdam/pdam.css';
	import '$lib/components/demo-pdam/pages.css';
	import '$lib/components/demo-spam/spam.css';
	import { onMount } from 'svelte';
	import { CircleCheck } from '@lucide/svelte';
	import Sidebar from '$lib/components/demo-dashboard/Sidebar.svelte';
	import TopBar from '$lib/components/demo-dashboard/TopBar.svelte';
	import { shell } from '$lib/components/demo-dashboard/ui.svelte';
	import ModeBar from '$lib/components/demo-spam/ModeBar.svelte';
	import { NAV_GROUPS, SPAM } from '$lib/components/demo-spam/data';
	import { LOGGERS } from '$lib/components/demo-spam/wosusokas';
	import { field, reading, supplyFlow, useField } from '$lib/components/demo-spam/field.svelte';
	import { fmtNum } from '$lib/components/demo-spam/util';
	let { children } = $props();

	onMount(() => useField());

	let online = $derived(LOGGERS.filter((l) => reading(l).online).length);
	let faulty = $derived(LOGGERS.filter((l) => (reading(l).v.fault ?? 0) > 0).length);
	let items = $derived([
		{ k: 'Logger online', v: `${online} / ${LOGGERS.length}`, hide: 'md' as const },
		{ k: 'Debit ke DMA', v: `${fmtNum(supplyFlow(), 1)} L/s` },
		{ k: 'Fault flowmeter', v: String(faulty), tone: faulty ? ('danger' as const) : ('ok' as const) },
		{ k: 'Mode data', v: field.mode === 'lapangan' ? 'Lapangan' : 'Skenario', hide: 'opt' as const }
	]);
</script>

<div class="demo-app pdam-app">
	<Sidebar
		groups={NAV_GROUPS}
		eyebrow="BEACON · SPAM"
		title="Smart Water"
		region={{ k: 'Studi kasus', v: SPAM.name, s: `${online}/${LOGGERS.length} logger online` }}
		logout="/demo/spam/logout"
	/>
	<div class="demo-app__main">
		<TopBar brand="STESY · SMART WATER" {items} />
		<div class="demo-app__content">
			<ModeBar />
			{@render children()}
		</div>
	</div>
</div>

{#if shell.toast}
	{#key shell.toastId}
		<div class="demo-toast" role="status"><CircleCheck size={16} color="#46d78f" /> {shell.toast}</div>
	{/key}
{/if}
