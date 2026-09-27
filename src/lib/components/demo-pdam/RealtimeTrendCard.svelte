<script lang="ts">
	// One realtime parameter card: the last 60 one-minute records as a small line chart
	// with its 60-minute statistics. Used by the Realtime Monitoring page.
	import LineChart, { type ChartSeries } from './LineChart.svelte';

	let {
		title,
		unit = '',
		series,
		legend = [],
		stats = '',
		xTicks = [],
		height = 104,
		lines = [],
		min,
		max,
		yFmt
	}: {
		title: string;
		unit?: string;
		series: ChartSeries[];
		legend?: { label: string; color: string }[];
		/** one-line 60-minute summary, e.g. "min 3,02 · maks 3,11" */
		stats?: string;
		xTicks?: { v: number; t: string }[];
		height?: number;
		lines?: { v: number; c: string; t?: string }[];
		min?: number;
		max?: number;
		yFmt?: (v: number) => string;
	} = $props();
</script>

<div class="card rt-trend">
	<div class="rt-trend__h">
		<span class="label">{title}{#if unit}<small> · {unit}</small>{/if}</span>
		{#if legend.length}
			<span class="rt-trend__legend">
				{#each legend as l (l.label)}
					<span class="pdam-legend-mini"><i style="background:{l.color}"></i>{l.label}</span>
				{/each}
			</span>
		{/if}
	</div>
	{#if stats}<span class="rt-trend__stats">{stats}</span>{/if}
	<LineChart {series} x0={0} x1={59} {height} {lines} {min} {max} {xTicks} {yFmt} yTicks={height >= 140 ? 4 : 2} />
</div>
