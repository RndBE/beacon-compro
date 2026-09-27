<script lang="ts">
	// Last 24 hours of an input flow against what the AI expected, with the MNF window.
	import { onMount } from 'svelte';
	import LineChart from './LineChart.svelte';
	import { live, useLive } from './live.svelte';
	import { BURST, CREEP, burstAnchor, fmtNum, last24, mnfWindows, systemExpected, ticks24, zoneFlow } from './sim';
	import type { ZoneId } from './data';

	let {
		zone = null,
		title = 'DEBIT MASUK SISTEM · 24 JAM',
		height = 170
	}: { zone?: ZoneId | null; title?: string; height?: number } = $props();

	onMount(() => useLive(15000));

	const base = (h: number) => (zone ? zoneFlow(zone, h).expected : systemExpected(h));
	// the burst is anchored at tonight's 01:40; the small LK-02 leak is always on
	const withCreep = (h: number) => base(h) + (zone ? zoneFlow(zone, h).creep : zoneFlow(CREEP.zone, h).creep);
	let now = $derived(live.h);
	let actual = $derived(last24(now, withCreep, !zone || zone === BURST.zone));
	let expected = $derived(last24(now, base, false));
	let cur = $derived(actual[actual.length - 1]);
	let resid = $derived(cur - expected[expected.length - 1]);
</script>

<div class="card pdam-flowday">
	<div class="card-h" style="margin-bottom:6px">
		<div style="display:flex;flex-direction:column;gap:3px;min-width:0">
			<span class="label">{title}</span>
			<span class="pdam-flowday__v"
				><b>{fmtNum(cur, 1)}</b> L/s <em class:is-up={resid > 1}>{resid >= 0 ? '+' : ''}{fmtNum(resid, 1)} vs prediksi</em></span
			>
		</div>
		<span class="pdam-legend-mini"><i style="background:#3cc3f2"></i>aktual <i class="is-dash"></i>prediksi AI</span>
	</div>
	<LineChart
		{height}
		x0={now - 24}
		x1={now}
		series={[
			{ values: expected, color: '#9fb6da', dash: '4 4', width: 1.4 },
			{ values: actual, color: '#3cc3f2', fill: true }
		]}
		bands={mnfWindows(now).map((w) => ({ ...w, c: '#8b7cff', t: 'MNF' }))}
		marks={[{ x: burstAnchor(now), c: '#ff7a66', t: 'pecah' }]}
		xTicks={ticks24(now)}
		yFmt={(v) => fmtNum(v, 0)}
	/>
</div>
