<script lang="ts">
	import { onMount } from 'svelte';
	import { seedRainfall, nextRainfall } from './tick';

	let { compact = false }: { compact?: boolean } = $props();

	const N = 24;
	let data = $state<number[]>(seedRainfall(N));

	let W = $state(0);
	let H = $state(0);

	onMount(() => {
		const id = setInterval(() => {
			data = [...data.slice(1), nextRainfall()];
		}, 2000);
		return () => clearInterval(id);
	});

	let pad = $derived(compact ? { l: 34, r: 12, t: 10, b: 18 } : { l: 36, r: 12, t: 18, b: 26 });
	let innerW = $derived(Math.max(0, W - pad.l - pad.r));
	let innerH = $derived(Math.max(0, H - pad.t - pad.b));
	let ready = $derived(W > 0 && H > 0);
	const max = 50;
	let bw = $derived(Math.max(0, innerW / N - 4));
	let sum = $derived(data.reduce((a, b) => a + b, 0).toFixed(1));
	const colorFor = (v: number) => (v > 30 ? 'var(--danger)' : v > 18 ? 'var(--amber)' : 'var(--water)');
</script>

<div class="card" style="height:100%;display:flex;flex-direction:column;min-height:0;overflow:hidden;padding:{compact ? 12 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 5 : 18}px">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label" style="font-size:{compact ? 10 : 11}px">ARR-02 · Curah Hujan · Gedung Aji</span>
			<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 14}px;color:var(--ink-mute)">Hourly · 24h</span>
		</div>
		<span class="pill pill--water" style="font-size:11px"><span style="font-family:var(--font-mono)">Σ 24h · {sum} mm</span></span>
	</div>
	<div bind:clientWidth={W} bind:clientHeight={H} style="flex:1 1 auto;min-height:0;position:relative">
		{#if ready}
			<svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style="display:block;position:absolute;inset:0">
				{#each [10, 20, 30, 40] as v (v)}
					{@const y = pad.t + (1 - v / max) * innerH}
					<line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--line-soft)" stroke-dasharray="2 4" />
					<text x={pad.l - 8} y={y + 4} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">{v}</text>
				{/each}
				{#each data as v, i (i)}
					{@const h = (v / max) * innerH}
					{@const x = pad.l + i * (innerW / N) + 2}
					{@const y = pad.t + innerH - h}
					<rect {x} {y} width={bw} height={h} rx="2" fill={colorFor(v)} opacity={0.85 + (i / N) * 0.15} />
				{/each}
				<text x={pad.l} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)">00:00</text>
				<text x={pad.l + innerW / 2} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="middle">12:00</text>
				<text x={W - pad.r} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">now</text>
				<text x={pad.l - 18} y={pad.t - 4} font-family="var(--font-mono)" font-size="10" fill="var(--ink-mute)">mm/h</text>
			</svg>
		{/if}
	</div>
</div>
