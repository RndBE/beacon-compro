<script lang="ts">
	// Linear schematic of the suspected pipe segment: estimated leak position ± radius,
	// and the loggers whose pressure drop was used for the localisation.
	import type { LeakCase } from './data';
	import { fmtNum } from './sim';

	let { leak, drops }: { leak: LeakCase; drops: { id: string; drop: number; at: number }[] } = $props();

	/** position of the estimate along the pipe from the upstream end (0–1), from the preprocessing */
	const POS: Record<string, number> = { 'LK-01': 0.45, 'LK-02': 0.5, 'LK-03': 0.55 };
	let t = $derived(POS[leak.id] ?? 0.5);
	let r = $derived(Math.min(0.5, leak.radius / leak.pipeLen));
	let from = $derived(Math.max(0, t - r));
	let to = $derived(Math.min(1, t + r));
	const maxDrop = $derived(Math.max(0.05, ...drops.map((d) => d.drop)));
</script>

<div class="pdam-locator">
	<div class="pdam-locator__pipe">
		<span class="pdam-locator__end">hulu · 0 m</span>
		<div class="pdam-locator__bar">
			<i class="pdam-locator__band" style="left:{from * 100}%;width:{(to - from) * 100}%"></i>
			<i class="pdam-locator__pin pdam-locator__pin--{leak.severity}" style="left:{t * 100}%">
				<b>{leak.id} · {fmtNum(t * leak.pipeLen)} m</b>
			</i>
			{#each drops.filter((d) => d.at >= 0) as d (d.id)}
				<i class="pdam-locator__logger" style="left:{Math.min(100, d.at * 100)}%" title={d.id}><em>{d.id}</em></i>
			{/each}
		</div>
		<span class="pdam-locator__end">{fmtNum(leak.pipeLen)} m · hilir</span>
	</div>
	<div class="pdam-locator__drops">
		{#each drops as d (d.id)}
			<div class="pdam-locator__drop">
				<span>{d.id}</span>
				<i class="twin-bar twin-bar--amber"><i style="width:{(d.drop / maxDrop) * 100}%"></i></i>
				<b>−{fmtNum(d.drop, 2)} bar</b>
			</div>
		{/each}
	</div>
	<p class="pdam-locator__note">
		Segmen JDU Ø{leak.diameter}" {leak.material} ({leak.pipeId}) · estimasi ±{leak.radius} m ·
		{leak.radius <= 200 ? 'cukup untuk verifikasi korelator akustik' : 'perlu step test / survei akustik untuk mempersempit'}
	</p>
</div>
