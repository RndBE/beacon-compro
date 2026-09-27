<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import { BALANCE, ZONES, nrwColor } from './data';
	import { fmtNum, systemBalance } from './sim';

	let { link = true }: { link?: boolean } = $props();
	const rows = [...ZONES].sort((a, b) => BALANCE[b.id].nrw - BALANCE[a.id].nrw);
	const sys = systemBalance();
</script>

<div class="card pdam-nrwbars">
	<div class="card-h">
		<div style="display:flex;flex-direction:column;gap:3px">
			<span class="label">NRW PER ZONA · 30 HARI</span>
			<span class="pdam-muted">sistem {fmtNum(sys.pct * 100, 1)}% · target 25%</span>
		</div>
		{#if link}<a class="demo-btn demo-btn--sm" href="/demo/pdam/neraca-air">Neraca air <ChevronRight size={13} /></a>{/if}
	</div>
	<div class="pdam-nrwbars__rows">
		{#each rows as z (z.id)}
			{@const p = BALANCE[z.id].nrw}
			<div class="pdam-nrwbars__row">
				<span class="pdam-nrwbars__name"><i style="background:{z.color}"></i>{z.name}</span>
				<span class="pdam-nrwbars__bar">
					<i style="width:{(p / 0.45) * 100}%;background:{nrwColor(p)}"></i>
					<em style="left:{(0.25 / 0.45) * 100}%" title="Target 25%"></em>
				</span>
				<b style="color:{nrwColor(p)}">{fmtNum(p * 100, 1)}%</b>
				<span class="pdam-nrwbars__siv">{fmtNum(BALANCE[z.id].siv)} m³/hari</span>
			</div>
		{/each}
	</div>
</div>
