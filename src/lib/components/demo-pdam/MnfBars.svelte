<script lang="ts">
	// Minimum night flow (02:00–04:00) for the last 14 nights against the zone baseline.
	import { mnfHistory, fmtNum } from './sim';
	import type { ZoneId } from './data';

	let { zone, height = 150 }: { zone: ZoneId; height?: number } = $props();

	let W = $state(0);
	let data = $derived(mnfHistory(zone));
	let base = $derived(data[0].baseline);
	let lo = $derived(base * 0.84);
	let hi = $derived(Math.max(...data.map((d) => d.value), base * 1.12) * 1.06);
	const pad = { l: 34, r: 8, t: 16, b: 20 };
	let iw = $derived(Math.max(1, W - pad.l - pad.r));
	let ih = $derived(height - pad.t - pad.b);
	let ys = $derived((v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * ih);
	let bw = $derived(iw / data.length);
	const tone = (r: number) => (r > 0.12 ? 'var(--danger)' : r > 0.06 ? 'var(--amber)' : '#3b8cff');
</script>

<div bind:clientWidth={W} style="height:{height}px">
	{#if W > 0}
		<svg viewBox={`0 0 ${W} ${height}`} width={W} {height} role="img" aria-label="Minimum night flow 14 malam">
			<rect x={pad.l} y={ys(base * 1.03)} width={iw} height={ys(base * 0.97) - ys(base * 1.03)} fill="#3b8cff" opacity="0.08" />
			{#each [lo, base, hi] as v (v)}
				<text x={pad.l - 6} y={ys(v) + 3.5} text-anchor="end" class="lchart__ax">{fmtNum(v, 0)}</text>
			{/each}
			{#each data as d, i (i)}
				{@const r = d.value / d.baseline - 1}
				{@const x = pad.l + i * bw + bw * 0.16}
				<rect
					{x}
					y={ys(d.value)}
					width={bw * 0.68}
					height={Math.max(1, pad.t + ih - ys(d.value))}
					rx="2.5"
					fill={tone(r)}
					opacity={i === data.length - 1 ? 1 : 0.72}
				/>
				{#if i === data.length - 1 || r > 0.06}
					<text x={x + bw * 0.34} y={ys(d.value) - 4} text-anchor="middle" class="lchart__thr" fill={tone(r)}
						>{r >= 0 ? '+' : ''}{fmtNum(r * 100, 0)}%</text
					>
				{/if}
			{/each}
			<line x1={pad.l} x2={W - pad.r} y1={ys(base)} y2={ys(base)} stroke="#9fb6da" stroke-dasharray="5 4" stroke-width="1.2" />
			<text x={pad.l + 4} y={ys(base) - 4} class="lchart__band">baseline {fmtNum(base, 1)} L/s</text>
			<text x={pad.l} y={height - 5} class="lchart__ax">−13 mlm</text>
			<text x={W - pad.r} y={height - 5} text-anchor="end" class="lchart__ax">tadi malam</text>
		</svg>
	{/if}
</div>
