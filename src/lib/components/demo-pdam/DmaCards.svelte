<script lang="ts">
	// Status card per DMA meter (proposal "Beranda"): flow, totalizer, P1/P2, flowmeter health.
	import { onMount } from 'svelte';
	import { DEVICE_BY_ID, DMA_METERS, ZONE_BY_ID, type Asset } from './data';
	import { live, useLive } from './live.svelte';
	import { fmtNum, noise, readAsset, readLive, totalizer } from './sim';
	import LineChart from './LineChart.svelte';

	let { ids = null, onpick }: { ids?: string[] | null; onpick?: (id: string) => void } = $props();
	onMount(() => useLive());

	const meters = $derived(ids ? DMA_METERS.filter((a) => ids.includes(a.id)) : DMA_METERS);
	const LABEL = { ok: 'NORMAL', warn: 'SIAGA', alarm: 'AWAS' } as const;
	const pill = (s: string) => (s === 'alarm' ? 'danger' : s === 'warn' ? 'amber' : 'green');

	/** last 60 minutes at 1-minute resolution */
	function spark(a: Asset, h: number) {
		return Array.from({ length: 60 }, (_, i) => {
			const t = h - (59 - i) / 60;
			return (readAsset(a, t, true).flow ?? 0) * (1 + 0.006 * noise(a.id, Math.floor(t * 60)));
		});
	}
</script>

<div class="pdam-dma-grid">
	{#each meters as a (a.id)}
		{@const r = readLive(a, live.h, live.tick)}
		{@const d = DEVICE_BY_ID[a.id]}
		<button class="card pdam-dma pdam-dma--{r.status}" onclick={() => onpick?.(a.id)} type="button">
			<div class="pdam-dma__head">
				<span class="pdam-dma__role pdam-dma__role--{a.role}">{a.role === 'in' ? 'INLET' : 'OUTLET'}</span>
				<span class="pdam-dma__id">{a.id}</span>
				<span class="pill pill--{pill(r.status)}" style="font-size:10px;padding:3px 8px">{LABEL[r.status]}</span>
			</div>
			<span class="pdam-dma__name">DMA {ZONE_BY_ID[a.zone].name}</span>
			<div class="pdam-dma__flow">
				<b>{fmtNum(r.flow ?? 0, 1)}</b><small>L/s</small>
				<span class="pdam-dma__spark">
					<LineChart bare height={30} x0={0} x1={59} series={[{ values: spark(a, live.h), color: r.status === 'ok' ? '#3cc3f2' : '#ffb454', width: 1.6 }]} />
				</span>
			</div>
			<dl class="pdam-dma__meta">
				<div><dt>Totalizer</dt><dd>{fmtNum(totalizer(a, live.h))} m³</dd></div>
				<div><dt>P1 · P2</dt><dd>{fmtNum(r.p1 ?? 0, 2)} · {fmtNum(r.p2 ?? 0, 2)} bar</dd></div>
				<div>
					<dt>Flowmeter</dt>
					<dd class:is-warn={(d?.fmBattery ?? 100) < 30}>{d?.fault ? 'Baterai lemah' : 'Normal'} · {d?.fmBattery ?? '–'}%</dd>
				</div>
			</dl>
			{#if r.note}<span class="pdam-dma__note">{r.note}</span>{/if}
		</button>
	{/each}
</div>
