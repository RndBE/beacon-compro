<script lang="ts">
	import { Gauge, History, Info } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import LineChart, { yRange, type ChartSeries } from '$lib/components/demo-pdam/LineChart.svelte';
	import { LOGGERS, RESERVOIRS, roleTag } from '$lib/components/demo-spam/wosusokas';
	import { bucketsOf, field, setMode } from '$lib/components/demo-spam/field.svelte';
	import type { Bucket } from '$lib/components/demo-spam/scenario';
	import { hourProfile } from '$lib/components/demo-spam/analisa';
	import { fmtNum, lastDays } from '$lib/components/demo-spam/util';

	const DAYS = 7;
	const dates = lastDays(DAYS);
	/** FAVAD leakage exponent for mixed pipe materials */
	const N1 = 1.15;
	const SERVICE_MIN = 1.0;
	const f2 = (v: number) => (Number.isFinite(v) ? fmtNum(v, 2) : '—');
	const mean = (xs: number[]) => {
		const f = xs.filter(Number.isFinite);
		return f.length ? f.reduce((a, b) => a + b, 0) / f.length : NaN;
	};

	let hourly = $state<Record<string, Bucket[]>>({});
	let loadedMode = $state('');
	let err = $state('');
	let refresh = $derived(Math.floor(field.now / 10));
	$effect(() => {
		const mode = field.mode;
		void refresh;
		let stale = false;
		Promise.all(LOGGERS.map((l) => bucketsOf(l, dates[0], dates[DAYS - 1], '1h').then((b) => [l.id, b] as const)))
			.then((res) => {
				if (stale) return;
				hourly = Object.fromEntries(res);
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

	/* ---- per point: profile by clock hour over 7 days ---- */
	let rows = $derived(
		LOGGERS.map((l) => {
			const b = hourly[l.id] ?? [];
			const p1 = hourProfile(b, 'p1');
			const p2 = l.pressures === 2 ? hourProfile(b, 'p2') : null;
			const down = p2 ?? p1;
			const night = mean(down.slice(0, 5));
			const max = Math.max(...b.map((x) => x.v.p1?.max ?? -Infinity));
			const min = Math.min(...down.filter(Number.isFinite));
			const flow = mean(hourProfile(b, 'flow'));
			return {
				l,
				p1,
				p2,
				night,
				min,
				max,
				dp: p2 ? mean(p1.map((v, i) => v - p2[i])) : NaN,
				flow,
				dry: !(Math.max(...down.filter(Number.isFinite), 0) > 0.2),
				saturated: max >= 9.9
			};
		})
	);
	let selId = $state('10370');
	let sel = $derived(rows.find((r) => r.l.id === selId) ?? rows[0]);
	let chart = $derived.by(() => {
		const series: ChartSeries[] = sel.p2
			? [
					{ values: sel.p1, color: '#A08BFF', width: 1.6, dash: '5 4' },
					{ values: sel.p2, color: '#4FD4E8', fill: true }
				]
			: [{ values: sel.p1, color: '#A08BFF', fill: true }];
		const lines = [{ v: SERVICE_MIN, c: '#FFD166', t: 'layanan min 1,0' }, ...(sel.max > 8 ? [{ v: 10, c: '#FF7A66', t: 'batas sensor 10 bar' }] : [])];
		return { series, lines, ...yRange([...sel.p1, ...(sel.p2 ?? [])], 1, lines.map((l) => l.v)) };
	});
	const hourTicks = [0, 6, 12, 18, 23].map((h) => ({ v: h, t: `${String(h).padStart(2, '0')}:00` }));

	/* ---- night setpoint proposals (scenario only: needs flowing, pressurised stations) ---- */
	let plans = $derived(
		rows
			.filter((r) => r.p2 && r.night > 3.5 && r.flow > 1)
			.map((r) => {
				const target = Math.max(2.5, r.night - 0.8);
				// leakage taken as a quarter of the night flow, reduced over the 23:00–05:00 window
				const leak = 0.25 * mean(hourProfile(hourly[r.l.id] ?? [], 'flow').slice(0, 5));
				const saved = leak * (1 - (target / r.night) ** N1) * 6 * 3.6;
				return { r, target, saved };
			})
	);
</script>

<svelte:head><title>Manajemen Tekanan · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Manajemen Tekanan" sub="Profil tekanan 24 jam · P1 hulu & P2 hilir di stasiun Plesungan · rata-rata 7 hari" icon={Gauge} />

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Titik bertekanan</span>
			<span class="demo-stat__v">{ready ? rows.filter((r) => !r.dry).length : '—'}<small>/ {LOGGERS.length}</small></span>
			<span class="demo-stat__s">rata-rata jam &gt; 0,2 bar dalam 7 hari</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Penurunan P1 → P2 terbesar</span>
			<span class="demo-stat__v">{f2(Math.max(...rows.map((r) => (Number.isFinite(r.dp) ? r.dp : -Infinity))))}<small>bar</small></span>
			<span class="demo-stat__s">stasiun 50 kanal · rata-rata 7 hari</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Sensor mentok 10 bar</span>
			<span class="demo-stat__v" style:color={rows.some((r) => r.saturated) ? 'var(--danger)' : undefined}>{rows.filter((r) => r.saturated).length}<small>titik</small></span>
			<span class="demo-stat__s">{rows.filter((r) => r.saturated).map((r) => r.l.id).join(' · ') || 'tidak ada'}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Potensi hemat setpoint malam</span>
			<span class="demo-stat__v" style="color:var(--green)">{field.mode === 'skenario' ? `±${fmtNum(plans.reduce((a, p) => a + p.saved, 0))}` : '—'}<small>m³/hari</small></span>
			<span class="demo-stat__s">{field.mode === 'skenario' ? `${plans.length} stasiun · simulasi FAVAD N1 ${fmtNum(N1, 2)}` : 'dihitung di mode Skenario'}</span>
		</div>
	</div>

	{#if err}<div class="card spam-note"><span>Data gagal dimuat: {err}</span></div>{/if}

	<div class="demo-grid-2" style="align-items:start">
		<div class="card pdam-flowday">
			<div class="card-h" style="margin-bottom:6px">
				<div style="display:flex;flex-direction:column;gap:3px">
					<span class="label">Profil tekanan · {sel.l.name}</span>
					<span class="pdam-flowday__v"><b>{f2(sel.night)}</b> bar malam <em>{sel.p2 ? `ΔP P1→P2 ${f2(sel.dp)} bar` : 'satu titik tekanan'}</em></span>
				</div>
				<span class="pdam-legend-mini">
					{#if sel.p2}<i class="is-dash"></i>P1 hulu <i style="background:#4FD4E8"></i>P2 hilir{:else}<i style="background:#A08BFF"></i>tekanan{/if}
				</span>
			</div>
			<LineChart height={210} x0={0} x1={23} min={chart.min} max={chart.max} series={chart.series} lines={chart.lines} xTicks={hourTicks} yFmt={(v) => fmtNum(v, 1)} />
			<div class="rekap-detail__actions">
				<a class="demo-btn demo-btn--sm" href="/demo/spam/historis?id={sel.l.id}&span=7"><History size={13} /> Historis {sel.l.id}</a>
			</div>
		</div>

		<div class="card">
			<div class="card-h"><span class="label">Tekanan semua titik · 7 hari</span><span class="pdam-muted">klik baris untuk profil</span></div>
			<div class="leak-scroll">
				<table class="demo-table leak-table">
					<thead><tr><th>Titik</th><th>Malam</th><th>Terendah</th><th>Tertinggi P1</th><th>ΔP</th><th>Catatan</th></tr></thead>
					<tbody>
						{#each rows as r (r.l.id)}
							<tr class:is-focus={r.l.id === selId} onclick={() => (selId = r.l.id)} style="cursor:pointer">
								<td><span class="leak-zone"><i style="background:{RESERVOIRS[r.l.reservoir].color}"></i>{r.l.id} · {roleTag(r.l)}</span><div class="hydro-sub">{r.l.name}</div></td>
								<td class="mono">{f2(r.night)}</td>
								<td class="mono" style:color={Number.isFinite(r.min) && r.min < SERVICE_MIN && !r.dry ? 'var(--amber)' : undefined}>{Number.isFinite(r.min) ? f2(r.min) : '—'}</td>
								<td class="mono">{Number.isFinite(r.max) ? f2(r.max) : '—'}</td>
								<td class="mono">{f2(r.dp)}</td>
								<td>
									{#if r.saturated}<span class="leak-lvl" style="--c:#FF7A66">Sensor mentok</span>
									{:else if r.dry}<span class="pdam-muted">tidak bertekanan</span>
									{:else}<span class="leak-lvl" style="--c:#46D78F">Normal</span>{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	{#if field.mode === 'skenario'}
		<div class="card">
			<div class="card-h"><span class="label">Usulan setpoint malam · 23:00–05:00</span><span class="spam-badge spam-badge--sim">SIMULASI</span></div>
			<div class="leak-scroll">
				<table class="demo-table leak-table">
					<thead><tr><th>Stasiun</th><th>P2 malam kini</th><th>Setpoint usulan</th><th>Potensi hemat</th></tr></thead>
					<tbody>
						{#each plans as p (p.r.l.id)}
							<tr>
								<td>{p.r.l.name}<div class="hydro-sub">{p.r.l.id}</div></td>
								<td class="mono">{f2(p.r.night)} bar</td>
								<td class="mono">{f2(p.target)} bar</td>
								<td class="mono" style="color:var(--green)">±{fmtNum(p.saved)} m³/hari</td>
							</tr>
						{:else}
							<tr><td colspan="4" class="sites-empty">Tidak ada stasiun dengan P2 malam di atas 3,5 bar.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="pdam-muted" style="margin:10px 0 0">
				Setpoint malam diturunkan 0,8 bar (min. 2,5 bar) di stasiun yang P2 malamnya di atas 3,5 bar. Kebocoran dianggap 25% debit malam dan turun mengikuti
				FAVAD (P baru / P lama)^{fmtNum(N1, 2)} selama 6 jam.
			</p>
		</div>
	{:else}
		<div class="card spam-note">
			<Info size={16} />
			<span>
				Usulan setpoint butuh stasiun yang mengalir dan bertekanan. Di lapangan sebagian besar DMA belum dialiri, jadi usulan dihitung di
				<button class="demo-btn demo-btn--sm" onclick={() => setMode('skenario')}>mode Skenario</button> sebagai simulasi.
			</span>
		</div>
	{/if}
</div>
