<script lang="ts">
	// Small forecast line for the twin panels: 0…HORIZON hours with a cursor.
	import { HORIZON } from './scenario';

	let {
		values,
		hour,
		min,
		max,
		lines = [],
		color = 'var(--brand-2)',
		height = 86,
		bars = false,
		bare = false,
		inset = 4
	}: {
		/** one sample per 0.25 h from 0 to HORIZON */
		values: number[];
		hour: number;
		min: number;
		max: number;
		lines?: { v: number; c: string; t: string }[];
		color?: string;
		height?: number;
		bars?: boolean;
		/** no text: axis and threshold labels are drawn by the parent */
		bare?: boolean;
		/** horizontal padding, so the cursor can line up with a range thumb */
		inset?: number;
	} = $props();

	let W = $state(0);
	let H = $derived(height);
	let pad = $derived({ l: inset, r: inset, t: bare ? 4 : 8, b: bare ? 4 : 16 });
	let xs = $derived((h: number) => pad.l + (h / HORIZON) * (W - pad.l - pad.r));
	let ys = $derived((v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b));
	let path = $derived(values.map((v, i) => `${i ? 'L' : 'M'}${xs(i / 4).toFixed(1)} ${ys(v).toFixed(1)}`).join(' '));
	let area = $derived(`${path} L${xs(HORIZON)} ${H - pad.b} L${xs(0)} ${H - pad.b} Z`);
	let cur = $derived(values[Math.min(values.length - 1, Math.round(hour * 4))]);
	let barW = $derived(Math.max(3, (W - pad.l - pad.r) / (HORIZON + 1) - 4));
	const uid = `fc${Math.random().toString(36).slice(2, 8)}`;
</script>

<div bind:clientWidth={W} style="width:100%;height:{H}px">
	{#if W > 0}
		<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style="display:block;overflow:visible">
			<defs>
				<linearGradient id={uid} x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color={color} stop-opacity="0.35" />
					<stop offset="100%" stop-color={color} stop-opacity="0" />
				</linearGradient>
			</defs>
			{#if bars}
				{#each values.filter((_, i) => i % 4 === 0) as v, i (i)}
					<rect x={xs(i) - barW / 2} y={ys(v)} width={barW} height={Math.max(0, H - pad.b - ys(v))} rx="2" fill={color} opacity={i <= hour ? 0.95 : 0.4} />
				{/each}
			{:else}
				<path d={area} fill={`url(#${uid})`} />
				<path d={path} fill="none" stroke={color} stroke-width="2" stroke-linejoin="round" />
			{/if}
			{#each lines as l (l.t)}
				<line x1={pad.l} x2={W - pad.r} y1={ys(l.v)} y2={ys(l.v)} stroke={l.c} stroke-dasharray="4 4" stroke-width="1" />
				{#if !bare}
					<text x={W - pad.r} y={ys(l.v) - 3} text-anchor="end" font-size="9" font-family="var(--font-mono)" font-weight="700" fill={l.c}>{l.t}</text>
				{/if}
			{/each}
			<line x1={xs(hour)} x2={xs(hour)} y1={pad.t - 4} y2={H - pad.b} stroke="#eaf1fb" stroke-width="1" opacity="0.7" />
			<circle cx={xs(hour)} cy={ys(cur)} r="3.5" fill="#07112a" stroke="#eaf1fb" stroke-width="1.5" />
			{#each bare ? [] : [0, 4, 8, 12, 16] as h (h)}
				<text x={xs(h)} y={H - 3} text-anchor={h === 0 ? 'start' : h === HORIZON ? 'end' : 'middle'} font-size="9" font-family="var(--font-mono)" fill="var(--ink-mute)">{h === 0 ? 'kini' : `+${h}j`}</text>
			{/each}
		</svg>
	{/if}
</div>
