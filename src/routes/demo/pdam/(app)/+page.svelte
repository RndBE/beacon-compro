<script lang="ts">
	import { goto } from '$app/navigation';
	import AiInsight from '$lib/components/demo-dashboard/AiInsight.svelte';
	import PdamKpis from '$lib/components/demo-pdam/PdamKpis.svelte';
	import PdamMap from '$lib/components/demo-pdam/PdamMap.svelte';
	import LeakSpotlight from '$lib/components/demo-pdam/LeakSpotlight.svelte';
	import FlowDayCard from '$lib/components/demo-pdam/FlowDayCard.svelte';
	import DmaCards from '$lib/components/demo-pdam/DmaCards.svelte';
	import MnfBars from '$lib/components/demo-pdam/MnfBars.svelte';
	import ZoneNrwBars from '$lib/components/demo-pdam/ZoneNrwBars.svelte';
	import HandoverCard from '$lib/components/demo-pdam/HandoverCard.svelte';
	import PdamAlerts from '$lib/components/demo-pdam/PdamAlerts.svelte';
	import { AI_MESSAGES, DMA_METERS } from '$lib/components/demo-pdam/data';
	import { fmtNum, mnf } from '$lib/components/demo-pdam/sim';

	const jump = mnf('GMW', true) / mnf('GMW', false) - 1;
</script>

<svelte:head>
	<title>Beranda · STESY Smart Water</title>
</svelte:head>

<div class="pdam-home">
	<PdamKpis />

	<div class="pdam-main">
		<div class="pdam-main__map"><PdamMap /></div>
		<div class="cc-col">
			<LeakSpotlight compact />
			<FlowDayCard zone="GMW" title="DEBIT NETTO DMA GEMAWANG · 24 JAM" height={150} />
		</div>
	</div>

	<section class="pdam-sec">
		<div class="pdam-sec__h">
			<span class="label">STATUS TITIK DMA · {DMA_METERS.length} FLOWMETER</span>
			<span class="pdam-muted">debit · totalizer · tekanan · status flowmeter — klik kartu untuk realtime</span>
		</div>
		<DmaCards onpick={(id) => goto(`/demo/pdam/realtime?id=${id}`)} />
	</section>

	<div class="pdam-cards4">
		<div class="card pdam-mnfcard">
			<div class="card-h">
				<div style="display:flex;flex-direction:column;gap:3px">
					<span class="label">MINIMUM NIGHT FLOW · GEMAWANG</span>
					<span class="pdam-muted">02:00–04:00 · 14 malam terakhir</span>
				</div>
				<span class="pill pill--danger" style="font-size:11px">+{fmtNum(jump * 100, 0)}% tadi malam</span>
			</div>
			<MnfBars zone="GMW" height={150} />
		</div>
		<ZoneNrwBars />
		<HandoverCard />
		<PdamAlerts />
	</div>

	<FlowDayCard />

	<AiInsight messages={AI_MESSAGES} badge="STESY ASSISTANT · AI" conf={92} />
</div>
