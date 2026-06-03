<script lang="ts">
	import { onMount } from 'svelte';
	import { seedAwlr, driftAwlr } from './tick';

	let { compact = false, threshold = 3.0 }: { compact?: boolean; threshold?: number } = $props();

	const N = 60;
	let data = $state<number[]>(seedAwlr(N));

	let W = $state(0);
	let H = $state(0);

	onMount(() => {
		const id = setInterval(() => {
			data = [...data.slice(1), driftAwlr(data[data.length - 1])];
		}, 1500);
		return () => clearInterval(id);
	});

	let pad = $derived(
		compact ? { l: 34, r: 14, t: 12, b: 18 } : { l: 36, r: 16, t: 18, b: 24 }
	);
	let innerW = $derived(Math.max(0, W - pad.l - pad.r));
	let innerH = $derived(Math.max(0, H - pad.t - pad.b));
	let ready = $derived(W > 0 && H > 0);
	const min = 0.5;
	const max = 4.5;
	let xs = $derived((i: number) => pad.l + (i / (N - 1)) * innerW);
	let ys = $derived((v: number) => pad.t + (1 - (v - min) / (max - min)) * innerH);

	let path = $derived(data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(v)}`).join(' '));
	let area = $derived(`${path} L ${xs(N - 1)} ${pad.t + innerH} L ${xs(0)} ${pad.t + innerH} Z`);
	let current = $derived(data[data.length - 1]);
	let status = $derived(current > 3.5 ? 'alarm' : current > 2.8 ? 'warn' : 'ok');
	let statusLabel = $derived(status === 'alarm' ? 'AWAS' : status === 'warn' ? 'SIAGA' : 'NORMAL');
	let pillClass = $derived(status === 'alarm' ? 'danger' : status === 'warn' ? 'amber' : 'green');
</script>

<div class="card" style="height:100%;display:flex;flex-direction:column;min-height:0;overflow:hidden;padding:{compact ? 12 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 5 : 18}px">
		<div style="display:flex;flex-direction:column;gap:4px;min-width:0">
			<span class="label" style="font-size:{compact ? 10 : 11}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
				>AWLR-02 · Way Tulang Bawang · Banjar Margo</span
			>
			<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 14}px;color:var(--ink-mute)"
				>Tinggi Muka Air · 60 min</span
			>
		</div>
		<span class="pill pill--{pillClass}" style="font-size:11px">
			<span class="status-dot {status}" style="width:7px;height:7px"></span>{statusLabel}
		</span>
	</div>
	<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:{compact ? 0 : 8}px">
		<span
			style="font-family:var(--font-mono);font-size:{compact ? 30 : 44}px;font-weight:600;color:var(--ink);letter-spacing:-0.02em;line-height:1"
			>{current.toFixed(2)}</span
		>
		<span style="font-size:{compact ? 13 : 18}px;color:var(--ink-soft)">meter</span>
		<span
			style="margin-left:auto;font-family:var(--font-mono);font-size:{compact ? 11 : 13}px;color:var(--ink-mute)"
			>ambang siaga: {threshold.toFixed(1)} m</span
		>
	</div>
	<div bind:clientWidth={W} bind:clientHeight={H} style="flex:1 1 auto;min-height:0;position:relative">
		{#if ready}
			<svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style="display:block;position:absolute;inset:0">
				<defs>
					<linearGradient id="awlrFill" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="var(--brand-2)" stop-opacity="0.45" />
						<stop offset="100%" stop-color="var(--brand-2)" stop-opacity="0" />
					</linearGradient>
				</defs>
				{#each [1, 2, 3, 4] as v (v)}
					<line x1={pad.l} x2={W - pad.r} y1={ys(v)} y2={ys(v)} stroke="var(--line-soft)" stroke-dasharray="2 4" />
					<text x={pad.l - 8} y={ys(v) + 4} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">{v}.0</text>
				{/each}
				<line x1={pad.l} x2={W - pad.r} y1={ys(threshold)} y2={ys(threshold)} stroke="var(--amber)" stroke-dasharray="6 4" stroke-width="1.5" />
				<text x={W - pad.r - 4} y={ys(threshold) - 6} font-size="10" font-family="var(--font-mono)" fill="var(--amber)" text-anchor="end" font-weight="600">SIAGA 3.0</text>
				<line x1={pad.l} x2={W - pad.r} y1={ys(3.8)} y2={ys(3.8)} stroke="var(--danger)" stroke-dasharray="6 4" stroke-width="1.5" />
				<text x={W - pad.r - 4} y={ys(3.8) - 6} font-size="10" font-family="var(--font-mono)" fill="var(--danger)" text-anchor="end" font-weight="600">AWAS 3.8</text>
				<path d={area} fill="url(#awlrFill)" />
				<path d={path} fill="none" stroke="var(--brand-2)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" />
				<circle cx={xs(N - 1)} cy={ys(current)} r="5" fill="#0B1B3A" stroke="var(--brand-2)" stroke-width="2.5" />
				<circle cx={xs(N - 1)} cy={ys(current)} r="11" fill="none" stroke="var(--brand-2)" stroke-opacity="0.35">
					<animate attributeName="r" values="6;18;6" dur="2s" repeatCount="indefinite" />
					<animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
				</circle>
				<text x={pad.l} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)">-60m</text>
				<text x={W / 2} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="middle">-30m</text>
				<text x={W - pad.r} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">live</text>
			</svg>
		{/if}
	</div>
</div>
