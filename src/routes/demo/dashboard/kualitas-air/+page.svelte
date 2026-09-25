<script lang="ts">
	import { FlaskConical, Sparkles } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import WqPanel from '$lib/components/demo-dashboard/WqPanel.svelte';
	import { WQ_STATIONS } from '$lib/components/demo-dashboard/data';

	let station = $state('WQ-03');
	let st = $derived(WQ_STATIONS.find((s) => s.id === station)!);
	const inRange = (v: number, ok: [number, number]) => v >= ok[0] && v <= ok[1];

	// 24 hourly pH samples, oldest first. WQ-03 slides from ~6.9 to 5.1 over the last six hours.
	const PH: Record<string, number[]> = {
		'WQ-03': Array.from({ length: 25 }, (_, i) => (i < 18 ? 6.9 + 0.08 * Math.sin(i * 1.3) : 6.9 - (1.8 * (i - 18)) / 6)),
		'WQ-01': Array.from({ length: 25 }, (_, i) => 7.2 + 0.12 * Math.sin(i * 0.7) + 0.05 * Math.cos(i * 2.1))
	};
	let series = $derived(PH[station]);

	let W = $state(0);
	const H = 190;
	const pad = { l: 30, r: 10, t: 12, b: 22 };
	const min = 4;
	const max = 9.5;
	let xs = $derived((i: number) => pad.l + (i / 24) * (W - pad.l - pad.r));
	const ys = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
	let path = $derived(series.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(' '));
	let last = $derived(series[series.length - 1]);
</script>

<svelte:head><title>Kualitas Air · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Kualitas Air" sub="Parameter mutu air · {WQ_STATIONS.length} stasiun · sampling tiap 15 menit" icon={FlaskConical}>
		<div class="demo-seg" role="tablist" aria-label="Stasiun kualitas air">
			{#each WQ_STATIONS as s (s.id)}
				<button role="tab" aria-selected={station === s.id} class:is-on={station === s.id} onclick={() => (station = s.id)}>
					{s.id} · {s.name.split('·').pop()?.trim()}
				</button>
			{/each}
		</div>
	</PageHead>

	<div style="height:400px">
		{#key station}<WqPanel {station} />{/key}
	</div>

	<div class="demo-grid-2" style="align-items:start">
		<div class="card">
			<div class="card-h">
				<span class="label">PARAMETER VS AMBANG · {st.id}</span>
				<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)">sampling {st.sampled}</span>
			</div>
			<table class="demo-table">
				<thead><tr><th>Parameter</th><th>Nilai</th><th>Ambang</th><th>Posisi</th><th>Status</th></tr></thead>
				<tbody>
					{#each st.gauges as g (g.label)}
						{@const v = Number(g.value)}
						{@const ok = inRange(v, g.ok)}
						<tr>
							<td><b>{g.label}</b></td>
							<td class="mono" style="color:{ok ? 'var(--ink)' : 'var(--danger)'}">{g.value} {g.unit}</td>
							<td class="mono">{g.ok[0]}–{g.ok[1]} {g.unit}</td>
							<td style="min-width:110px">
								<span class="wq-range">
									<i class="wq-range__ok" style="left:{((g.ok[0] - g.min) / (g.max - g.min)) * 100}%;width:{((g.ok[1] - g.ok[0]) / (g.max - g.min)) * 100}%"></i>
									<i class="wq-range__v" class:bad={!ok} style="left:{Math.min(100, Math.max(0, ((v - g.min) / (g.max - g.min)) * 100))}%"></i>
								</span>
							</td>
							<td>
								<span class="hydro-status"><span class="status-dot {ok ? 'ok' : 'alarm'}" style="width:8px;height:8px"></span>{ok ? 'Sesuai' : 'Di luar ambang'}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="card">
			<div class="card-h">
				<span class="label">RIWAYAT pH · 24 JAM</span>
				<span class="pill pill--{inRange(last, [6, 9]) ? 'green' : 'danger'}" style="font-size:11px">pH {last.toFixed(1)}</span>
			</div>
			<div bind:clientWidth={W} style="height:{H}px">
				{#if W}
					<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style="display:block">
						<rect x={pad.l} y={ys(9)} width={W - pad.l - pad.r} height={ys(6) - ys(9)} fill="rgba(70,215,143,0.08)" />
						{#each [5, 6, 7, 8, 9] as v (v)}
							<line x1={pad.l} x2={W - pad.r} y1={ys(v)} y2={ys(v)} stroke="var(--line-soft)" stroke-dasharray="2 4" />
							<text x={pad.l - 6} y={ys(v) + 4} text-anchor="end" font-size="10" font-family="var(--font-mono)" fill="var(--ink-mute)">{v}</text>
						{/each}
						<text x={W - pad.r - 4} y={ys(9) + 12} text-anchor="end" font-size="9" font-family="var(--font-mono)" fill="var(--green)">BAKU MUTU 6–9</text>
						<path d={path} fill="none" stroke={inRange(last, [6, 9]) ? '#46d78f' : '#ff7a66'} stroke-width="2.2" stroke-linejoin="round" />
						<circle cx={xs(24)} cy={ys(last)} r="4.5" fill="#07112a" stroke={inRange(last, [6, 9]) ? '#46d78f' : '#ff7a66'} stroke-width="2" />
						{#each [0, 6, 12, 18, 24] as h (h)}
							<text x={xs(h)} y={H - 5} text-anchor={h === 0 ? 'start' : h === 24 ? 'end' : 'middle'} font-size="10" font-family="var(--font-mono)" fill="var(--ink-mute)">{h === 24 ? 'kini' : `-${24 - h}j`}</text>
						{/each}
					</svg>
				{/if}
			</div>
			{#if station === 'WQ-03'}
				<div class="wq-ai">
					<Sparkles size={15} />
					<span>ARGO: pH turun 1.8 dalam 6 jam, polanya cocok dengan buangan asam dari hulu industri. Sampling ulang otomatis dijadwalkan 15 menit lagi. <b>Lapor BPBD & DLH</b></span>
				</div>
			{/if}
		</div>
	</div>
</div>
