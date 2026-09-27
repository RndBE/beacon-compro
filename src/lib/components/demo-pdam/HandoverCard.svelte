<script lang="ts">
	// Bulk water handover from PDAB Tirtatama: live flow against contract, month totals vs the supplier's reading.
	import { onMount } from 'svelte';
	import { Handshake } from '@lucide/svelte';
	import { ASSET_BY_ID, HANDOVER } from './data';
	import { live, useLive } from './live.svelte';
	import { fmtNum, readLive } from './sim';

	onMount(() => useLive());
</script>

<div class="card pdam-handover">
	<div class="card-h">
		<div style="display:flex;flex-direction:column;gap:3px">
			<span class="label"><Handshake size={12} style="vertical-align:-2px" /> SERAH TERIMA AIR CURAH</span>
			<span class="pdam-muted">PDAB Tirtatama → Tirtamarta · totalizer otomatis</span>
		</div>
	</div>
	{#each HANDOVER as h (h.id)}
		{@const a = ASSET_BY_ID[h.id]}
		{@const r = readLive(a, live.h, live.tick)}
		{@const diff = (h.supplierRead - h.month) / h.month}
		<div class="pdam-handover__row">
			<div class="pdam-handover__top">
				<b>{h.id}</b><span>{a.name.replace('Serah terima curah · ', '')}</span>
				<em>{fmtNum(r.flow ?? 0, 1)} / {h.contract} L/s</em>
			</div>
			<i class="twin-bar"><i style="width:{Math.min(100, ((r.flow ?? 0) / h.contract) * 100)}%"></i></i>
			<div class="pdam-handover__foot">
				<span>Bulan ini <b>{fmtNum(h.month)} m³</b></span>
				<span>Selisih meter pemasok <b class:is-warn={Math.abs(diff) > 0.003}>{diff >= 0 ? '+' : ''}{fmtNum(diff * 100, 2)}%</b></span>
			</div>
		</div>
	{/each}
</div>
