<script lang="ts">
	import { Info, Scale } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import LineChart from '$lib/components/demo-pdam/LineChart.svelte';
	import { RESERVOIRS, SUPPLY, type ReservoirId } from '$lib/components/demo-spam/wosusokas';
	import { bucketsOf, field, setMode } from '$lib/components/demo-spam/field.svelte';
	import type { Bucket } from '$lib/components/demo-spam/scenario';
	import { volumeOf } from '$lib/components/demo-spam/analisa';
	import { dayMin, fmtDay, fmtNum, lastDays, noise } from '$lib/components/demo-spam/util';

	const DAYS = 30;
	const dates = lastDays(DAYS);
	const RES = Object.keys(RESERVOIRS) as ReservoirId[];

	/* ---- 30 days of daily buckets for the supply meters ---- */
	let daily = $state<Record<string, Bucket[]>>({});
	let loadedMode = $state('');
	let err = $state('');
	let refresh = $derived(Math.floor(field.now / 10));
	$effect(() => {
		const mode = field.mode;
		void refresh;
		let stale = false;
		Promise.all(SUPPLY.map((l) => bucketsOf(l, dates[0], dates[DAYS - 1], '1d').then((b) => [l.id, b] as const)))
			.then((res) => {
				if (stale) return;
				daily = Object.fromEntries(res);
				loadedMode = mode;
				err = '';
			})
			.catch((e) => {
				if (!stale) err = e instanceof Error ? e.message : String(e);
			});
		return () => {
			stale = true;
		};
	});
	let ready = $derived(loadedMode === field.mode);

	/** m³ per day (oldest first) for one meter */
	const perDay = (id: string) => {
		const out = Array<number>(DAYS).fill(0);
		for (const b of daily[id] ?? []) {
			const i = DAYS - 1 - dayMin(b.t).d;
			if (i >= 0 && i < DAYS) out[i] = volumeOf(b);
		}
		return out;
	};
	let rows = $derived(
		SUPPLY.map((l) => {
			const v = perDay(l.id);
			const total = v.reduce((a, b) => a + b, 0);
			return { l, v, total, days: v.filter((x) => x > 1).length };
		})
	);
	let total = $derived(rows.reduce((a, r) => a + r.total, 0));
	let byRes = $derived(RES.map((r) => ({ r, v: Array.from({ length: DAYS }, (_, i) => rows.filter((x) => x.l.reservoir === r).reduce((a, x) => a + x.v[i], 0)) })));
	const ticks = [0, 7, 14, 21, 29].map((i) => ({ v: i, t: fmtDay(dates[i]) }));

	/* ---- NRW: needs billing data, so only the scenario can show it ---- */
	/** assumed non-revenue share per DMA in the scenario (0.18–0.32) */
	const nrwOf = (id: string) => 0.25 + 0.07 * noise(`nrw-${id}`, 1);
	let nrw = $derived.by(() => {
		const input = total;
		const lost = rows.reduce((a, r) => a + r.total * nrwOf(r.l.id), 0);
		return { input, billed: input - lost, lost, pct: input ? lost / input : 0 };
	});
</script>

<svelte:head><title>Neraca Air · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Neraca Air" sub="Volume masuk DMA dari totalizer flowmeter · {SUPPLY.length} meter suplai · 30 hari" icon={Scale} />

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Volume masuk DMA · 30 hari</span>
			<span class="demo-stat__v">{ready ? fmtNum(total / 1000, 1) : '—'}<small>rb m³</small></span>
			<span class="demo-stat__s">≈ {fmtNum(total / DAYS)} m³/hari · {fmtNum(total / DAYS / 86.4, 1)} L/s rata-rata</span>
		</div>
		{#each byRes as x (x.r)}
			{@const sum = x.v.reduce((a, b) => a + b, 0)}
			<div class="card demo-stat">
				<span class="demo-stat__k"><span class="spam-res" style="--c:{RESERVOIRS[x.r].color}"><i></i>{RESERVOIRS[x.r].name}</span></span>
				<span class="demo-stat__v">{fmtNum(sum / 1000, 1)}<small>rb m³</small></span>
				<span class="demo-stat__s">{total ? fmtNum((100 * sum) / total, 0) : 0}% dari total · {SUPPLY.filter((l) => l.reservoir === x.r).length} meter</span>
			</div>
		{/each}
		<div class="card demo-stat">
			<span class="demo-stat__k">NRW</span>
			<span class="demo-stat__v" style:color={field.mode === 'skenario' ? 'var(--amber)' : undefined}>{field.mode === 'skenario' ? fmtNum(nrw.pct * 100, 1) : '—'}<small>%</small></span>
			<span class="demo-stat__s">{field.mode === 'skenario' ? 'simulasi · asumsi rekening pelanggan' : 'butuh data rekening pelanggan'}</span>
		</div>
	</div>

	{#if err}<div class="card spam-note"><span>Data gagal dimuat: {err}</span></div>{/if}

	<div class="demo-grid-2" style="align-items:start">
		<div class="card pdam-flowday">
			<div class="card-h" style="margin-bottom:6px">
				<div style="display:flex;flex-direction:column;gap:3px">
					<span class="label">Volume harian per reservoir · 30 hari</span>
					<span class="pdam-flowday__v"><b>{fmtNum(total / DAYS)}</b> m³/hari rata-rata</span>
				</div>
				<span class="pdam-legend-mini">
					{#each RES as r (r)}<i style="background:{RESERVOIRS[r].color}"></i>{RESERVOIRS[r].short}{/each}
				</span>
			</div>
			<LineChart
				height={200}
				x0={0}
				x1={DAYS - 1}
				min={0}
				series={byRes.map((x) => ({ values: x.v, color: RESERVOIRS[x.r].color, fill: true }))}
				xTicks={ticks}
				yFmt={(v) => fmtNum(v, 0)}
			/>
		</div>

		<div class="card">
			<div class="card-h"><span class="label">Volume per DMA · 30 hari</span><span class="pdam-muted">meter outlet = suplai ke DMA</span></div>
			<div class="leak-scroll">
				<table class="demo-table leak-table">
					<thead><tr><th>DMA</th><th>Volume</th><th>Rata-rata/hari</th><th>Hari mengalir</th><th>Porsi</th></tr></thead>
					<tbody>
						{#each [...rows].sort((a, b) => b.total - a.total) as r (r.l.id)}
							<tr>
								<td><span class="leak-zone"><i style="background:{RESERVOIRS[r.l.reservoir].color}"></i>{r.l.name}</span><div class="hydro-sub">{r.l.id}</div></td>
								<td class="mono">{fmtNum(r.total)} m³</td>
								<td class="mono">{fmtNum(r.total / DAYS)} m³</td>
								<td class="mono">{r.days} / {DAYS}</td>
								<td class="mono">{total ? `${fmtNum((100 * r.total) / total, 1)}%` : '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	{#if field.mode === 'skenario'}
		<div class="card nrw-iwa">
			<div class="card-h">
				<span class="label">Neraca air IWA · 30 hari</span>
				<span class="spam-badge spam-badge--sim">SIMULASI</span>
			</div>
			<div class="nrw-iwa__grid">
				<div class="nrw-iwa__col">
					<div class="nrw-blk nrw-blk--siv" style="flex:1"><span>Volume masuk DMA</span><b>{fmtNum(nrw.input / 1000, 1)}</b><em>100%</em></div>
				</div>
				<div class="nrw-iwa__col">
					<div class="nrw-blk nrw-blk--billed" style="flex:{nrw.billed}"><span>Berekening (asumsi)</span><b>{fmtNum(nrw.billed / 1000, 1)}</b><em>{fmtNum((1 - nrw.pct) * 100, 1)}%</em></div>
					<div class="nrw-blk nrw-blk--nrw" style="flex:{nrw.lost}"><span>Air tak berekening</span><b>{fmtNum(nrw.lost / 1000, 1)}</b><em>{fmtNum(nrw.pct * 100, 1)}%</em></div>
				</div>
			</div>
			<p class="pdam-muted" style="margin:10px 0 0">Volume masuk dari skenario; air berekening memakai asumsi NRW 18–32% per DMA. Angka nyata butuh data rekening pelanggan per DMA.</p>
		</div>
	{:else}
		<div class="card spam-note">
			<Info size={16} />
			<span>
				Volume di atas asli dari totalizer flowmeter. <b>NRW butuh data rekening pelanggan per DMA</b>, yang belum terhubung ke sistem, jadi neraca IWA
				hanya tampil di <button class="demo-btn demo-btn--sm" onclick={() => setMode('skenario')}>mode Skenario</button> sebagai simulasi.
			</span>
		</div>
	{/if}
</div>
