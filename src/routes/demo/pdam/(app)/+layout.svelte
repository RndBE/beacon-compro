<script lang="ts">
	import '$lib/components/demo-pdam/pdam.css';
	import '$lib/components/demo-pdam/pages.css';
	import { CircleCheck } from '@lucide/svelte';
	import Sidebar from '$lib/components/demo-dashboard/Sidebar.svelte';
	import TopBar from '$lib/components/demo-dashboard/TopBar.svelte';
	import { shell } from '$lib/components/demo-dashboard/ui.svelte';
	import { ASSETS, COMPLETENESS_AVG, LEAKS, NAV_GROUPS, PDAM } from '$lib/components/demo-pdam/data';
	import { fmtNum, nowHour, systemBalance, systemFlow } from '$lib/components/demo-pdam/sim';
	let { children } = $props();

	const active = LEAKS.filter((l) => l.status === 'verifikasi').length;
	const nrw = systemBalance().pct * 100;
	const items = [
		{ k: 'Logger online', v: `${ASSETS.length} / ${ASSETS.length}`, hide: 'md' as const },
		{ k: 'Debit masuk', v: `${fmtNum(systemFlow(nowHour(), true))} L/s` },
		{ k: 'Kebocoran aktif', v: String(active), tone: 'danger' as const },
		{ k: 'NRW 30 hari', v: `${fmtNum(nrw, 1)}%`, hide: 'opt' as const },
		{ k: 'Kelengkapan data', v: `${fmtNum(COMPLETENESS_AVG, 1)}%`, tone: 'ok' as const, hide: 'opt' as const }
	];
</script>

<div class="demo-app pdam-app">
	<Sidebar
		groups={NAV_GROUPS}
		eyebrow="BEACON · {PDAM.short.toUpperCase()}"
		title="Smart Water"
		region={{ k: 'Pilot Smart Water', v: `Perumda ${PDAM.short} Yogyakarta`, s: `${ASSETS.length}/${ASSETS.length} logger online` }}
		logout="/demo/pdam/logout"
	/>
	<div class="demo-app__main">
		<TopBar brand="STESY · SMART WATER" {items} />
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
