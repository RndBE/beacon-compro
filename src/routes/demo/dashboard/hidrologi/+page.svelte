<script lang="ts">
	import { onMount } from 'svelte';
	import { Waves, Box } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AwlrChart from '$lib/components/demo-dashboard/AwlrChart.svelte';
	import RainfallBars from '$lib/components/demo-dashboard/RainfallBars.svelte';
	import RiverSection from '$lib/components/demo-dashboard/twin/RiverSection.svelte';
	import { TB_SENSORS } from '$lib/components/demo-dashboard/data';
	import { GAUGES, gaugeStatus, levelAt, rainAt, rainStatus } from '$lib/components/demo-dashboard/twin/scenario';

	const STATIONS = ['AWLR-02', 'AWLR-01', 'AWLR-04'] as const;
	let station = $state<(typeof STATIONS)[number]>('AWLR-02');
	let wobble = $state(0);
	onMount(() => {
		const id = setInterval(() => (wobble = (Math.random() - 0.5) * 0.03), 1500);
		return () => clearInterval(id);
	});

	const nameOf = (id: string) => TB_SENSORS.find((s) => s.id === id)?.name ?? id;
	const label = (st: string) => (st === 'alarm' ? 'AWAS' : st === 'warn' ? 'SIAGA' : 'NORMAL');
	let gauge = $derived(GAUGES[station]);

	const awlrRows = STATIONS.map((id) => {
		const g = GAUGES[id];
		const in6 = levelAt(id, 6);
		return { id, name: nameOf(id), now: g.now, in6, peak: g.peak, peakAt: g.peakAt, status: gaugeStatus(id, g.now), next: gaugeStatus(id, in6) };
	});
	const arrRows = (['ARR-02', 'ARR-01'] as const).map((id) => {
		const now = rainAt(id, 0);
		const peak = Math.max(...Array.from({ length: 65 }, (_, i) => rainAt(id, i / 4)));
		return { id, name: nameOf(id), now, peak, status: rainStatus(now) };
	});
</script>

<svelte:head><title>Hidrologi · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Hidrologi" sub="Tinggi muka air & curah hujan · realtime" icon={Waves}>
		<div class="demo-seg" role="tablist" aria-label="Stasiun AWLR">
			{#each STATIONS as id (id)}
				<button role="tab" aria-selected={station === id} class:is-on={station === id} onclick={() => (station = id)}>{id}</button>
			{/each}
		</div>
		<a class="demo-btn" href="/demo/dashboard/digital-twin?focus={station}"><Box size={15} /> Twin 3D</a>
	</PageHead>

	<div class="hydro-top">
		<div style="height:380px">
			{#key station}<AwlrChart {station} />{/key}
		</div>
		<RiverSection gauge={gauge} level={gauge.now + wobble} title="Twin Penampang · {station}" sub={nameOf(station)} />
	</div>

	<div class="hydro-bottom">
		<div style="height:340px"><RainfallBars /></div>
		<div class="card hydro-table">
			<div class="card-h">
				<span class="label">RINGKASAN STASIUN · PRAKIRAAN ARGO</span>
				<span class="pill pill--water" style="font-size:11px">5 stasiun</span>
			</div>
			<table class="demo-table">
				<thead><tr><th>Stasiun</th><th>Kini</th><th>+6 jam</th><th>Puncak</th><th>Status</th></tr></thead>
				<tbody>
					{#each awlrRows as r (r.id)}
						<tr class:is-focus={r.id === station} onclick={() => (station = r.id)} style="cursor:pointer">
							<td><b style="font-family:var(--font-mono)">{r.id}</b><div class="hydro-sub">{r.name}</div></td>
							<td class="mono">{r.now.toFixed(2)} m</td>
							<td class="mono">{r.in6.toFixed(2)} m</td>
							<td class="mono">{r.peak.toFixed(2)} m<div class="hydro-sub">+{r.peakAt} jam</div></td>
							<td>
								<span class="hydro-status"><span class="status-dot {r.status}" style="width:8px;height:8px"></span>{label(r.status)}</span>
								{#if r.next !== r.status}<div class="hydro-sub" style="color:var(--danger)">→ {label(r.next)}</div>{/if}
							</td>
						</tr>
					{/each}
					{#each arrRows as r (r.id)}
						<tr>
							<td><b style="font-family:var(--font-mono)">{r.id}</b><div class="hydro-sub">{r.name}</div></td>
							<td class="mono">{r.now.toFixed(1)} mm/h</td>
							<td class="mono">{rainAt(r.id, 6).toFixed(1)} mm/h</td>
							<td class="mono">{r.peak.toFixed(1)} mm/h</td>
							<td><span class="hydro-status"><span class="status-dot {r.status}" style="width:8px;height:8px"></span>{label(r.status)}</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
