<script lang="ts">
	import { onMount } from 'svelte';
	import { Gauge, Send, TrendingDown, TriangleAlert, Wrench } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AiInsight from '$lib/components/demo-dashboard/AiInsight.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import LineChart, { type ChartSeries } from '$lib/components/demo-pdam/LineChart.svelte';
	import {
		AI_MESSAGES,
		ASSETS,
		ASSET_BY_ID,
		BALANCE,
		LEAKS,
		WATER_COST,
		ZONES,
		ZONE_BY_ID,
		type Asset,
		type SiteStatus,
		type ZoneId
	} from '$lib/components/demo-pdam/data';
	import { live, useLive } from '$lib/components/demo-pdam/live.svelte';
	import { BURST, fmtClock, fmtNum, readAsset, readLive, series, zonePressure } from '$lib/components/demo-pdam/sim';
	import { LEVEL_COLOR, LEVEL_LABEL, LIMITS, levelBelow, type AlertLevel } from '$lib/components/demo-pdam/logger-health';
	import {
		DAY_MODE_MIN_END,
		END_TARGET_NIGHT,
		N1,
		NIGHT,
		PRV_PLANS,
		SERVICE_MIN,
		pressureDay,
		windowsBelow,
		type PlanStatus
	} from '$lib/components/demo-pdam/prv-plan';

	onMount(() => useLive());

	const C = { in: '#3CC3F2', end: '#A08BFF', pt: '#FFB454', min: '#FF7A66' };
	const PLAN_LABEL: Record<PlanStatus, { t: string; pill: string }> = {
		penuh: { t: 'Rekomendasi', pill: 'green' },
		malam: { t: 'Mode malam', pill: 'water' },
		tunda: { t: 'Tunda · LK-01', pill: 'amber' },
		tidak: { t: 'Tidak disarankan', pill: 'danger' }
	};
	const PLAN_DOT: Record<PlanStatus, string> = { penuh: '#46D78F', malam: '#4FD4E8', tunda: '#FFB454', tidak: '#FF7A66' };
	const PLAN_LEGEND = (Object.keys(PLAN_LABEL) as PlanStatus[]).map((k) => ({ k, t: PLAN_LABEL[k].t, c: PLAN_DOT[k] }));
	const round10 = (v: number) => Math.round(v / 10) * 10;
	const lk = LEAKS.find((l) => l.id === BURST.leak)!;

	/* ---- pressure points: critical PTs + DMA outlets (downstream P2 = far end) ---- */
	const POINTS = ASSETS.filter((a) => a.type === 'PT' || (a.type === 'DMA' && a.role === 'out'));
	const keyP = (a: Asset, h: number) => {
		const r = readAsset(a, h, true);
		return (a.type === 'PT' ? r.p1 : r.p2) ?? 0;
	};
	const PROFILE = POINTS.map((a) => {
		const day = series((h) => keyP(a, h), 289);
		const min = Math.min(...day);
		const max = Math.max(...day);
		const low = windowsBelow((h) => keyP(a, h), SERVICE_MIN);
		return {
			a,
			day,
			min,
			minAt: (day.indexOf(min) / 288) * 24,
			max,
			maxAt: (day.indexOf(max) / 288) * 24,
			low,
			lowMin: low.reduce((s, w) => s + Math.round((w.to - w.from) * 60) + 1, 0)
		};
	});
	const LOW = PROFILE.filter((p) => p.lowMin > 0).sort((x, y) => x.min - y.min);

	/* ---- network summary ---- */
	const peakInlet = [...ZONES].sort((a, b) => BALANCE[b.id].pIn[0] - BALANCE[a.id].pIn[0])[0];
	const peakInletMeter = ASSET_BY_ID[`${peakInlet.id}-IN`];
	const overMax = peakInletMeter ? windowsBelow((h) => -(readAsset(peakInletMeter, h, true).p1 ?? 0), -LIMITS.pMax[0]) : [];
	const overMaxMin = overMax.reduce((s, w) => s + Math.round((w.to - w.from) * 60) + 1, 0);
	const peakP1 = peakInletMeter ? readAsset(peakInletMeter, 3, true).p1 ?? 0 : 0;
	const READY = ZONES.filter((z) => PRV_PLANS[z.id].status === 'penuh' || PRV_PLANS[z.id].status === 'malam');
	const readySaved = READY.reduce((s, z) => s + PRV_PLANS[z.id].saved, 0);

	let critical = $derived(
		ASSETS.filter((a) => a.type === 'PT')
			.map((a) => ({ a, p: readAsset(a, live.h, true).p1 ?? 0 }))
			.sort((x, y) => x.p - y.p)[0]
	);

	/* ---- selected zone ---- */
	let zone = $state<ZoneId>('PDS');
	let showPrv = $state(true);
	let z = $derived(ZONE_BY_ID[zone]);
	let plan = $derived(PRV_PLANS[zone]);
	let bal = $derived(BALANCE[zone]);
	let curves = $derived(pressureDay(zone));
	let hasPrv = $derived(plan.night != null);
	/** the zone's critical point, drawn when it departs from the zone model (the LK-01 drop in Gemawang) */
	let ptLine = $derived.by(() => {
		const pt = ASSETS.find((a) => a.type === 'PT' && a.zone === zone);
		if (!pt) return null;
		const values = series((h) => readAsset(pt, h, true).p1 ?? 0, 97);
		const off = Math.max(...values.map((v, i) => Math.abs(v - curves.pend[i])));
		return off > 0.05 ? { pt, values } : null;
	});
	let chartSeries = $derived.by((): ChartSeries[] => {
		const s: ChartSeries[] = [];
		if (showPrv && hasPrv) {
			s.push({ values: curves.pinPrv, color: C.in, dash: '5 4', width: 1.5, opacity: 0.85 });
			s.push({ values: curves.pendPrv, color: C.end, dash: '5 4', width: 1.5, opacity: 0.85 });
		}
		s.push({ values: curves.pin, color: C.in, fill: true });
		s.push({ values: curves.pend, color: C.end });
		if (ptLine) s.push({ values: ptLine.values, color: C.pt, width: 1.6 });
		return s;
	});
	let bands = $derived.by(() => {
		const b: { from: number; to: number; c: string; t?: string }[] = [];
		if (showPrv && hasPrv) b.push({ from: 0, to: NIGHT.to, c: '#8b7cff', t: 'PRV MALAM' }, { from: NIGHT.from, to: 24, c: '#8b7cff' });
		for (const w of windowsBelow((h) => zonePressure(zone, h, 'end'), SERVICE_MIN)) b.push({ from: w.from, to: w.to, c: C.min, t: '< 0,7' });
		return b;
	});
	let pinNow = $derived(zonePressure(zone, live.h, 'in'));
	let pendNow = $derived(zonePressure(zone, live.h, 'end'));
	let lowHere = $derived(LOW.filter((p) => p.a.zone === zone));

	/* ---- live table ---- */
	const ORDER: AlertLevel[] = ['normal', 'waspada', 'siaga', 'awas'];
	const SIM_LEVEL: Record<SiteStatus, AlertLevel> = { ok: 'normal', warn: 'siaga', alarm: 'awas' };
	const worst = (a: AlertLevel, b: AlertLevel) => (ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b);
	let rows = $derived(
		PROFILE.map((p) => {
			const r = readLive(p.a, live.h, live.tick);
			const now = (p.a.type === 'PT' ? r.p1 : r.p2) ?? 0;
			const nowLevel = levelBelow(now, LIMITS.pMin);
			// the sim also flags PT-01 while LK-01 is open, so take the worse of the two
			return { ...p, r, now, nowLevel, level: worst(nowLevel, SIM_LEVEL[r.status]) };
		})
	);

	const rp = (m3: number) => fmtNum((m3 * WATER_COST) / 1e6, 1);
	const causeOf = (a: Asset) =>
		a.zone === BURST.zone && BURST.drop[a.id]
			? `dampak kebocoran ${lk.id} (−${fmtNum(BURST.drop[a.id], 2)} bar) · pulih setelah perbaikan`
			: 'ujung jaringan terjauh dari sumber · tekanan inlet zona rendah saat puncak';

	function sendSetpoint() {
		if (plan.night == null) return;
		notify(
			`Setpoint PRV ${z.name}: ${fmtNum(plan.night, 1)} bar 23:00–05:00${plan.day != null ? ` · ${fmtNum(plan.day, 1)} bar siang` : ''} dikirim · menunggu persetujuan supervisor (demo)`
		);
	}
</script>

<svelte:head><title>Manajemen Tekanan · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Manajemen Tekanan" sub="Tekanan inlet vs ujung jaringan · PRV · batas layanan 0,7 bar" icon={Gauge}>
		<button class="demo-btn" onclick={() => notify('Laporan tekanan 24 jam 7 zona dikirim ke 12 penerima (demo)')}><Send size={15} /> Kirim laporan</button>
	</PageHead>

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Tekanan kritis terendah</span>
			<span class="demo-stat__v" style:color={critical.p < SERVICE_MIN ? 'var(--amber)' : undefined}>{fmtNum(critical.p, 2)}<small>bar</small></span>
			<span class="demo-stat__s">{critical.a.id} · {critical.a.name} · kini</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Titik &lt; 0,7 bar · hari ini</span>
			<span class="demo-stat__v" style="color:var(--amber)">{LOW.length}<small>/ {POINTS.length} titik</small></span>
			<span class="demo-stat__s">{LOW.map((p) => `${p.a.id} ${p.lowMin} mnt`).join(' · ')} · jam puncak</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Tekanan malam tertinggi</span>
			<span class="demo-stat__v">{fmtNum(BALANCE[peakInlet.id].pIn[0], 1)}<small>bar</small></span>
			<span class="demo-stat__s">inlet {peakInlet.name} · P1 {fmtNum(peakP1, 2)} bar{overMaxMin ? ` > ${fmtNum(LIMITS.pMax[0], 1)} selama ${fmtNum(overMaxMin / 60, 1)} j` : ''}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Potensi hemat PRV</span>
			<span class="demo-stat__v" style="color:var(--green)">±{fmtNum(round10(readySaved))}<small>m³/hari</small></span>
			<span class="demo-stat__s">≈ Rp {fmtNum((readySaved * WATER_COST * 30) / 1e6, 0)} jt/bulan · {READY.length} zona siap</span>
		</div>
	</div>

	<div class="prs-zones" role="group" aria-label="Pilih zona">
		<span class="label">Zona</span>
		<div class="demo-seg">
			{#each ZONES as zz (zz.id)}
				<button class:is-on={zone === zz.id} onclick={() => (zone = zz.id)}>
					<i class="prs-zones__dot" style="background:{PLAN_DOT[PRV_PLANS[zz.id].status]}"></i>{zz.name}
				</button>
			{/each}
		</div>
		<span class="prs-zones__legend">
			{#each PLAN_LEGEND as l (l.k)}
				<span><i style="background:{l.c}"></i>{l.t}</span>
			{/each}
		</span>
	</div>

	<div class="prs-main">
		<div class="card prs-chart">
			<div class="card-h" style="margin-bottom:8px">
				<div style="display:flex;flex-direction:column;gap:3px;min-width:0">
					<span class="label">Tekanan 24 jam · zona {z.name}</span>
					<span class="prs-chart__v">
						Inlet <b style="color:{C.in}">{fmtNum(pinNow, 2)}</b> · ujung <b style="color:{C.end}">{fmtNum(pendNow, 2)}</b> bar
						<em>pukul {fmtClock(live.h)}</em>
					</span>
				</div>
				{#if hasPrv}
					<button class="demo-chip" class:is-on={showPrv} style="--c:#8b7cff" onclick={() => (showPrv = !showPrv)} aria-pressed={showPrv}>
						<i></i>Skenario PRV
					</button>
				{/if}
			</div>
			<LineChart
				height={240}
				series={chartSeries}
				min={0}
				max={Math.ceil((bal.pIn[0] + 0.5) * 2) / 2}
				lines={[{ v: SERVICE_MIN, c: C.min, t: 'batas layanan 0,7 bar' }]}
				{bands}
				cursor={live.h}
				yFmt={(v) => fmtNum(v, 1)}
			/>
			<div class="prs-chart__legend">
				<span class="pdam-legend-mini"><i style="background:{C.in}"></i>inlet DMA</span>
				<span class="pdam-legend-mini"><i style="background:{C.end}"></i>ujung zona</span>
				{#if ptLine}<span class="pdam-legend-mini"><i style="background:{C.pt}"></i>{ptLine.pt.id} aktual ({lk.id})</span>{/if}
				{#if showPrv && hasPrv}<span class="pdam-legend-mini"><i class="is-dash"></i>dengan PRV</span>{/if}
				<span class="pdam-legend-mini"><i style="background:{C.min}"></i>batas layanan</span>
			</div>
		</div>

		<div class="card prs-plan prs-plan--{plan.status}">
			<div class="card-h" style="margin-bottom:10px">
				<span class="label">Rekomendasi PRV · {z.name}</span>
				<span class="pill pill--{PLAN_LABEL[plan.status].pill}" style="font-size:11px">{PLAN_LABEL[plan.status].t}</span>
			</div>

			{#if plan.night != null}
				<div class="prs-plan__save">
					<TrendingDown size={18} />
					<div>
						<b>±{fmtNum(round10(plan.saved))}<small>m³/hari</small></b>
						<span>{plan.status === 'tunda' ? 'potensi setelah perbaikan · ' : ''}≈ Rp {rp(plan.saved)} jt/hari · Rp {fmtNum((plan.saved * WATER_COST * 30) / 1e6, 0)} jt/bulan</span>
					</div>
				</div>

				<div class="prs-sched" role="img" aria-label="Jadwal setpoint PRV">
					<span class="prs-sched__seg prs-sched__seg--night" style="width:{(NIGHT.to / 24) * 100}%">{fmtNum(plan.night, 1)} bar</span>
					<span class="prs-sched__seg" class:prs-sched__seg--day={plan.day != null} style="width:{((NIGHT.from - NIGHT.to) / 24) * 100}%"
						>{plan.day != null ? `siang ${fmtNum(plan.day, 1)} bar` : 'siang: katup terbuka penuh'}</span
					>
					<span
						class="prs-sched__seg prs-sched__seg--night"
						style="width:{((24 - NIGHT.from) / 24) * 100}%"
						title="23:00–24:00 · {fmtNum(plan.night, 1)} bar"
					></span>
				</div>
				<div class="prs-sched__axis" aria-hidden="true">
					{#each [0, NIGHT.to, 12, NIGHT.from] as t (t)}
						<span style="left:{(t / 24) * 100}%">{String(t).padStart(2, '0')}:00</span>
					{/each}
				</div>

				<dl class="prs-plan__rows">
					<div><dt>Tekanan inlet malam</dt><dd>{fmtNum(bal.pIn[0], 1)} → <b>{fmtNum(plan.night, 1)} bar</b> <small>23:00–05:00</small></dd></div>
					<div><dt>Tekanan ujung malam</dt><dd>{fmtNum(bal.pEnd[0], 1)} → <b>{fmtNum(plan.endNightAfter, 1)} bar</b></dd></div>
					<div>
						<dt>Ujung terendah (puncak)</dt>
						<dd class:is-warn={plan.endMinAfter < DAY_MODE_MIN_END}>{fmtNum(plan.endMinAfter, 2)} bar <small>batas layanan 0,7</small></dd>
					</div>
					<div>
						<dt>Kebocoran fisik 03:00</dt>
						<dd>
							{fmtNum(plan.leakNight, 1)} → <b>{fmtNum(plan.leakNightAfter, 1)} L/s</b>
							<small>−{fmtNum((1 - plan.leakNightAfter / plan.leakNight) * 100, 1)}%</small>
						</dd>
					</div>
					<div>
						<dt>Hemat malam · siang</dt>
						<dd>{fmtNum(plan.savedNight)} · {fmtNum(plan.savedDay)} m³</dd>
					</div>
				</dl>

				{#if plan.status === 'tunda'}
					<p class="prs-plan__note prs-plan__note--warn">
						<TriangleAlert size={13} />
						<span>{lk.id} masih aktif di zona ini; PT-01 sudah turun {fmtNum(BURST.drop['PT-01'], 2)} bar. Terapkan PRV setelah perbaikan dan verifikasi.</span>
					</p>
				{:else if plan.day == null}
					<p class="prs-plan__note">
						Mode siang tidak disarankan: ujung zona hanya {fmtNum(bal.pEnd[1], 2)} bar saat puncak (&lt; {fmtNum(DAY_MODE_MIN_END, 1)} bar).{plan.saved < 50
							? ' Potensi kecil, prioritas rendah.'
							: ''}
					</p>
				{:else if overMaxMin && peakInlet.id === zone}
					<p class="prs-plan__note">
						P1 inlet {z.name} mencapai {fmtNum(peakP1, 2)} bar di malam hari, di atas ambang Waspada {fmtNum(LIMITS.pMax[0], 1)} bar selama ±{fmtNum(overMaxMin / 60, 1)} jam.
					</p>
				{/if}

				<div class="prs-plan__actions">
					<button class="demo-btn demo-btn--sm demo-btn--primary" disabled={plan.status === 'tunda'} onclick={sendSetpoint}>
						<Send size={13} /> Kirim setpoint ke PRV
					</button>
				</div>
			{:else}
				<div class="prs-plan__save prs-plan__save--bad">
					<TriangleAlert size={18} />
					<div>
						<b>{fmtNum(bal.pEnd[1], 2)}<small>bar di ujung saat puncak</small></b>
						<span>di bawah batas layanan {fmtNum(SERVICE_MIN, 1)} bar · malam hanya {fmtNum(bal.pEnd[0], 1)} bar</span>
					</div>
				</div>
				<p class="prs-plan__note">
					Menurunkan tekanan di {z.name} akan memperluas area bertekanan rendah. Yang dibutuhkan justru tambahan
					<b>+{fmtNum(DAY_MODE_MIN_END - bal.pEnd[1], 2)} bar</b> di inlet saat jam puncak ({fmtNum(bal.pIn[1], 1)} → {fmtNum(
						bal.pIn[1] + DAY_MODE_MIN_END - bal.pEnd[1],
						1
					)} bar) agar ujung jaringan ≥ {fmtNum(DAY_MODE_MIN_END, 1)} bar.
				</p>
				<div class="prs-plan__actions">
					<button class="demo-btn demo-btn--sm" onclick={() => notify(`Tiket evaluasi booster & valve zona ${z.name} dibuat (demo)`)}>
						<Wrench size={13} /> Evaluasi booster / valve
					</button>
				</div>
			{/if}

			<p class="prs-plan__method">
				FAVAD N1 = {fmtNum(N1, 2)}: L₁ = L₀ × (AZP₁/AZP₀)^{fmtNum(N1, 2)}, AZP ≈ rata-rata tekanan inlet &amp; ujung zona, dihitung per menit dari profil 24 jam. Target
				ujung malam {fmtNum(END_TARGET_NIGHT, 1)} bar.
			</p>
		</div>
	</div>

	{#if LOW.length}
		<div class="card prs-low">
			<div class="card-h" style="margin-bottom:10px">
				<div style="display:flex;flex-direction:column;gap:3px">
					<span class="label"><TriangleAlert size={12} style="vertical-align:-2px" /> Tekanan rendah di ujung jaringan</span>
					<span class="pdam-muted">titik yang turun di bawah {fmtNum(SERVICE_MIN, 1)} bar dalam 24 jam terakhir</span>
				</div>
				{#if lowHere.length === 0}<span class="pdam-muted">tidak ada di zona {z.name}</span>{/if}
			</div>
			<div class="prs-low__grid">
				{#each LOW as p (p.a.id)}
					<button class="prs-low__item" class:is-here={p.a.zone === zone} onclick={() => (zone = p.a.zone)}>
						<span class="prs-low__top">
							<b>{p.a.id}</b>
							<span>{p.a.name}</span>
							<em>{p.lowMin} menit/hari</em>
						</span>
						<span class="prs-low__v">
							min <b>{fmtNum(p.min, 2)} bar</b> pukul {fmtClock(p.minAt)} · &lt; 0,7 bar {p.low.map((w) => `${fmtClock(w.from)}–${fmtClock(w.to)}`).join(', ')}
						</span>
						<span class="prs-low__spark">
							<LineChart
								bare
								height={34}
								series={[{ values: p.day, color: C.pt, width: 1.4 }]}
								lines={[{ v: SERVICE_MIN, c: C.min }]}
								bands={p.low.map((w) => ({ from: w.from, to: w.to, c: C.min }))}
								cursor={live.h}
							/>
						</span>
						<span class="prs-low__cause">{causeOf(p.a)}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="card prs-table">
		<div class="card-h" style="margin-bottom:10px">
			<div style="display:flex;flex-direction:column;gap:3px">
				<span class="label">Titik tekanan · {POINTS.length} titik</span>
				<span class="pdam-muted">PT titik kritis &amp; outlet DMA (P2 hilir) · min/maks 24 jam per 5 menit · klik baris untuk memilih zona</span>
			</div>
		</div>
		<div class="prs-table__scroll">
			<table class="demo-table">
				<thead>
					<tr>
						<th>Titik</th>
						<th>Zona</th>
						<th>Kini</th>
						<th>Min 24 j</th>
						<th>Maks 24 j</th>
						<th>Profil 24 jam</th>
						<th>&lt; 0,7 bar</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.a.id)}
						<tr class:is-focus={row.a.zone === zone}>
							<td>
								<button class="prs-pt" onclick={() => (zone = row.a.zone)}>
									<b>{row.a.id}</b><small>{row.a.name}</small>
								</button>
							</td>
							<td>{ZONE_BY_ID[row.a.zone].name}</td>
							<td class="mono">
								<b style:color={row.nowLevel !== 'normal' ? LEVEL_COLOR[row.nowLevel] : undefined}>{fmtNum(row.now, 2)}</b> bar
								{#if row.a.type === 'DMA'}<div class="hydro-sub">P1 {fmtNum(row.r.p1 ?? 0, 2)} bar</div>{/if}
							</td>
							<td class="mono" class:prs-low-v={row.min < SERVICE_MIN}>{fmtNum(row.min, 2)}<div class="hydro-sub">{fmtClock(row.minAt)}</div></td>
							<td class="mono">{fmtNum(row.max, 2)}<div class="hydro-sub">{fmtClock(row.maxAt)}</div></td>
							<td>
								<span class="prs-spark">
									<LineChart
										bare
										height={30}
										series={[{ values: row.day, color: row.min < SERVICE_MIN ? C.pt : C.end, width: 1.4 }]}
										min={0}
										max={Math.max(2, row.max + 0.2)}
										lines={[{ v: SERVICE_MIN, c: C.min }]}
										cursor={live.h}
									/>
								</span>
							</td>
							<td class="mono">{row.lowMin ? `${row.lowMin} mnt` : '—'}</td>
							<td>
								<span class="hydro-status">
									<span class="status-dot {row.level === 'normal' ? 'ok' : row.level === 'awas' ? 'alarm' : 'warn'}" style="width:8px;height:8px"></span>
									<span style:color={row.level === 'waspada' ? LEVEL_COLOR.waspada : undefined}>{LEVEL_LABEL[row.level].toUpperCase()}</span>
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<AiInsight messages={[AI_MESSAGES[2]]} badge="STESY ASSISTANT · AI" conf={92} />
</div>
