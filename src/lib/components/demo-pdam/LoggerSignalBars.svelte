<script lang="ts">
	// 4-bar cellular signal indicator (≥-70 sangat baik, ≥-80 baik, ≥-90 cukup, else lemah).
	import { signalClass } from './logger-health';
	import { fmtNum } from './sim';

	let { dbm, label = true }: { dbm: number; label?: boolean } = $props();
	let s = $derived(signalClass(dbm));
</script>

<span class="lsig lsig--{s.tone}" title="Sinyal {fmtNum(dbm)} dBm · {s.label}">
	<span class="lsig__bars" aria-hidden="true">
		{#each [1, 2, 3, 4] as b (b)}
			<i class:is-on={b <= s.bars} style="height:{3 + b * 2.5}px"></i>
		{/each}
	</span>
	<span class="lsig__v">{fmtNum(dbm)} dBm</span>
	{#if label}<span class="lsig__l">{s.label}</span>{/if}
</span>
