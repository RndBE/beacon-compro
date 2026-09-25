<script lang="ts">
	import { onMount } from 'svelte';
	import { seedAwlr, driftAwlr } from './tick';
	import { TB_SENSORS } from './data';
	import { GAUGES } from './twin/scenario';

	let { compact = false, station = 'AWLR-02' }: { compact?: boolean; station?: string } = $props();

	const RISE: Record<string, number> = { 'AWLR-02': 0.75, 'AWLR-01': 0.16, 'AWLR-04': 0.1 };

	// station config is fixed for the component's lifetime (parents key it by station)
	// svelte-ignore state_referenced_locally
	const id = station;
	const g = GAUGES[id] ?? GAUGES['AWLR-02'];
	const sensor = TB_SENSORS.find((s) => s.id === id);
	const name = sensor?.name ?? id;

	const N = 60;
	let data = $state<number[]>(seedAwlr(N, g.now, RISE[id] ?? 0.2));

	let W = $state(0);
	let H = $state(0);

	onMount(() => {
		const t = setInterval(() => {
			data = [...data.slice(1), driftAwlr(data[data.length - 1], g.now)];
		}, 1500);
		return () => clearInterval(t);
	});

	let pad = $derived(compact ? { l: 34, r: 14, t: 12, b: 18 } : { l: 36, r: 16, t: 18, b: 24 });
	let innerW = $derived(Math.max(0, W - pad.l - pad.r));
	let innerH = $derived(Math.max(0, H - pad.t - pad.b));
	let ready = $derived(W > 0 && H > 0);
	const max = g.bank + 0.2;
	const min = Math.max(0, Math.floor((g.now - (RISE[id] ?? 0.2) - 1.2) * 2) / 2);
	const step = max - min > 2.5 ? 1 : 0.5;
	const grid = Array.from({ length: 12 }, (_, i) => Math.ceil(min / step) * step + i * step).filter((v) => v > min && v < max);
	let xs = $derived((i: number) => pad.l + (i / (N - 1)) * innerW);
	let ys = $derived((v: number) => pad.t + (1 - (v - min) / (max - min)) * innerH);

	let path = $derived(data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(v)}`).join(' '));
	let area = $derived(`${path} L ${xs(N - 1)} ${pad.t + innerH} L ${xs(0)} ${pad.t + innerH} Z`);
	let current = $derived(data[data.length - 1]);
	let status = $derived(current >= g.awas ? 'alarm' : current >= g.siaga ? 'warn' : 'ok');
	let statusLabel = $derived(status === 'alarm' ? 'AWAS' : status === 'warn' ? 'SIAGA' : 'NORMAL');
	let pillClass = $derived(status === 'alarm' ? 'danger' : status === 'warn' ? 'amber' : 'green');
	let lineColor = $derived(status === 'alarm' ? 'var(--danger)' : status === 'warn' ? 'var(--amber)' : 'var(--brand-2)');
	let delta = $derived(current - data[Math.max(0, N - 31)]);
	const gid = `awlrFill${id}`;
</script>

<div class="card" style="height:100%;display:flex;flex-direction:column;min-height:0;overflow:hidden;padding:{compact ? 12 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 5 : 18}px">
		<div style="display:flex;flex-direction:column;gap:4px;min-width:0">
			<span class="label" style="font-size:{compact ? 10 : 11}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
				>{id} · {name}</span
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
			style="font-family:var(--font-mono);font-size:{compact ? 11 : 13}px;font-weight:700;color:{delta > 0.05 ? 'var(--amber)' : 'var(--ink-mute)'}"
			>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)} m/30m</span
		>
		{#if !compact}
			<span style="margin-left:auto;font-family:var(--font-mono);font-size:13px;color:var(--ink-mute)"
				>siaga {g.siaga.toFixed(1)} · awas {g.awas.toFixed(1)} m</span
			>
		{/if}
	</div>
	<div bind:clientWidth={W} bind:clientHeight={H} style="flex:1 1 auto;min-height:0;position:relative">
		{#if ready}
			<svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style="display:block;position:absolute;inset:0">
				<defs>
					<linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color={lineColor} stop-opacity="0.4" />
						<stop offset="100%" stop-color={lineColor} stop-opacity="0" />
					</linearGradient>
				</defs>
				{#each grid as v (v)}
					<line x1={pad.l} x2={W - pad.r} y1={ys(v)} y2={ys(v)} stroke="var(--line-soft)" stroke-dasharray="2 4" />
					<text x={pad.l - 8} y={ys(v) + 4} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">{v.toFixed(1)}</text>
				{/each}
				<rect x={pad.l} y={ys(max)} width={innerW} height={Math.max(0, ys(g.awas) - ys(max))} fill="var(--danger)" opacity="0.06" />
				<rect x={pad.l} y={ys(g.awas)} width={innerW} height={Math.max(0, ys(g.siaga) - ys(g.awas))} fill="var(--amber)" opacity="0.05" />
				<line x1={pad.l} x2={W - pad.r} y1={ys(g.siaga)} y2={ys(g.siaga)} stroke="var(--amber)" stroke-dasharray="6 4" stroke-width="1.5" />
				<text x={W - pad.r - 4} y={ys(g.siaga) - 6} font-size="10" font-family="var(--font-mono)" fill="var(--amber)" text-anchor="end" font-weight="600">SIAGA {g.siaga.toFixed(1)}</text>
				<line x1={pad.l} x2={W - pad.r} y1={ys(g.awas)} y2={ys(g.awas)} stroke="var(--danger)" stroke-dasharray="6 4" stroke-width="1.5" />
				<text x={W - pad.r - 4} y={ys(g.awas) - 6} font-size="10" font-family="var(--font-mono)" fill="var(--danger)" text-anchor="end" font-weight="600">AWAS {g.awas.toFixed(1)}</text>
				<path d={area} fill={`url(#${gid})`} />
				<path d={path} fill="none" stroke={lineColor} stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" />
				<circle cx={xs(N - 1)} cy={ys(current)} r="5" fill="#0B1B3A" stroke={lineColor} stroke-width="2.5" />
				<circle cx={xs(N - 1)} cy={ys(current)} r="11" fill="none" stroke={lineColor} stroke-opacity="0.35">
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
