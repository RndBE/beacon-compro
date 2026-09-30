<script lang="ts">
	import { Activity, History, Radar } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import LineChart from '$lib/components/demo-pdam/LineChart.svelte';
	import { FLOW_EPS, LOGGERS, PAIRS, RESERVOIRS, roleTag } from '$lib/components/demo-spam/wosusokas';
	import { bucketsOf, field } from '$lib/components/demo-spam/field.svelte';
	import type { Bucket } from '$lib/components/demo-spam/scenario';
	import { mnfTrend, pairSeries, type MnfTrend } from '$lib/components/demo-spam/analisa';
	import { LEVEL_COLOR, LEVEL_LABEL, type Level } from '$lib/components/demo-spam/siaga';
	import { fmtDay, fmtNum, fmtWeekday, lastDays } from '$lib/components/demo-spam/util';

	const NIGHTS = 14;
	const DAYS = lastDays(NIGHTS);
	const pctLevel = (p: number, [w, s, a]: [number, number, number]): Level =>
		!Number.isFinite(p) ? 'normal' : p > a ? 'awas' : p > s ? 'siaga' : p > w ? 'waspada' : 'normal';
	const f1 = (v: number) => (Number.isFinite(v) ? fmtNum(v, 1) : '—');
	const pct = (v: number) => (Number.isFinite(v) ? `${v >= 0 ? '+' : ''}${fmtNum(v * 100, 1)}%` : '—');

	/* ---- 14 days of hourly buckets for every logger ---- */
	let hourly = $state<Record<string, Bucket[]>>({});
	let loadedMode = $state('');
	let err = $state('');
	let refresh = $derived(Math.floor(field.now / 10));
	$effect(() => {
		const mode = field.mode;
		void refresh;
		let stale = false;
		Promise.all(LOGGERS.map((l) => bucketsOf(l, DAYS[0], DAYS[NIGHTS - 1], '1h').then((b) => [l.id, b] as const)))
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

	/* ---- series meters: the last 7 days, hour by hour ---- */
	let pairs = $derived(
		PAIRS.map((p) => {
			const pts = pairSeries(hourly[p.inlet.id] ?? [], hourly[p.outlet.id] ?? []).filter((x) => x.t >= -6 * 1440);
			const last = pts.filter((x) => x.t >= field.now - 24 * 60 && Number.isFinite(x.diff));
			const diff = last.length ? last.reduce((a, x) => a + x.diff, 0) / last.length : NaN;
			const lost = last.length ? last.reduce((a, x) => a + (x.inlet - x.outlet), 0) / last.length : NaN;
			// an outlet that stays at zero while its inlet flows is not measuring (empty pipe, closed
			// valve, meter fault); an outlet above its inlet is a meter error. Only a lower, still
			// moving outlet points at water lost between the meters.
			const silent = last.length > 0 && last.filter((x) => x.outlet <= FLOW_EPS).length / last.length > 0.8;
			const kind = !Number.isFinite(diff) ? 'idle' : silent ? 'silent' : diff < 0 ? 'meter' : 'leak';
			return { ...p, pts, diff, lost, kind, level: pctLevel(Math.abs(diff) * 100, [5, 10, 20]) };
		})
	);

	/* ---- minimum night flow ---- */
	let trends = $derived(
		LOGGERS.map((l) => {
			const t: MnfTrend = mnfTrend(hourly[l.id] ?? [], NIGHTS);
			return { l, t, level: pctLevel(t.change * 100, [8, 12, 18]) };
		})
	);
	let selId = $state<string | null>(null);
	// the scenario's growing leak sits in DMA 3; in the field show a point that actually flows at night
	let sel = $derived(
		trends.find((x) => x.l.id === selId) ??
			(field.mode === 'skenario' ? trends.find((x) => x.l.id === '10374') : trends.find((x) => x.t.flowing)) ??
			trends[0]
	);

	const PAIR_TEXT = {
		leak: (p: (typeof pairs)[number]) => ({ tag: 'kandidat kebocoran', sub: `±${f1(p.lost)} L/s hilang di antara inlet ${p.inlet.id} dan outlet ${p.outlet.id} (rata-rata 24 jam)` }),
		silent: (p: (typeof pairs)[number]) => ({ tag: 'anomali meter', sub: `inlet ${p.inlet.id} mengalir ±${f1(p.lost)} L/s, outlet ${p.outlet.id} tetap 0 · cek pipa kosong, katup, atau flowmeter outlet` }),
		meter: (p: (typeof pairs)[number]) => ({ tag: 'anomali meter', sub: `outlet ${p.outlet.id} membaca lebih besar dari inlet ${p.inlet.id} · kalibrasi silang kedua flowmeter` })
	};
	let candidates = $derived([
		...pairs
			.filter((p) => p.level !== 'normal' && p.kind !== 'idle')
			.map((p) => {
				const t = PAIR_TEXT[p.kind as 'leak' | 'silent' | 'meter'](p);
				return { key: `pair-${p.dma}`, level: p.level, tag: t.tag, title: `Stasiun DMA ${p.dma} · selisih meter seri ${pct(p.diff)}`, sub: t.sub };
			}),
		...trends.filter((x) => x.level !== 'normal').map((x) => ({ key: `mnf-${x.l.id}`, level: x.level, tag: 'kandidat kebocoran', title: `${x.l.name} · MNF ${pct(x.t.change)}`, sub: `tadi malam ${f1(x.t.last)} L/s · baseline ${f1(x.t.baseline)} L/s` }))
	]);

	const flowTicks = [0, 2, 4, 6].map((d) => ({ v: 24 * (6 - d) + 12, t: `${fmtWeekday(DAYS[NIGHTS - 1 - d])} ${DAYS[NIGHTS - 1 - d].getDate()}` }));
	/** hourly points on a 7-day grid from the window start (NaN where missing) */
	function grid(pts: { t: number; v: number }[]) {
		const out = Array<number>(7 * 24).fill(NaN);
		for (const p of pts) {
			const i = Math.round((p.t + 6 * 1440) / 60);
			if (i >= 0 && i < out.length) out[i] = p.v;
		}
		return out;
	}

	/* ---- MNF bars ---- */
	let W = $state(0);
	const H = 150;
	const pad = { l: 34, r: 8, t: 16, b: 20 };
	let bars = $derived.by(() => {
		const vals = sel.t.mins;
		const finite = vals.filter(Number.isFinite);
		const hi = Math.max(1, ...finite, sel.t.baseline || 0) * 1.12;
		const iw = Math.max(1, W - pad.l - pad.r);
		const ih = H - pad.t - pad.b;
		const ys = (v: number) => pad.t + (1 - v / hi) * ih;
		const bw = iw / vals.length;
		return { vals, hi, ys, bw, ih };
	});
</script>

<svelte:head><title>Deteksi Kebocoran · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Deteksi Kebocoran" sub="Minimum night flow 14 malam · selisih meter seri stasiun DMA 9, 12, 15" icon={Radar} />

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Temuan</span>
			<span class="demo-stat__v" style:color={candidates.length ? 'var(--amber)' : 'var(--green)'}>{ready ? candidates.length : '—'}<small>titik</small></span>
			<span class="demo-stat__s">{ready ? `${candidates.filter((c) => c.tag === 'kandidat kebocoran').length} kandidat kebocoran · ${candidates.filter((c) => c.tag === 'anomali meter').length} anomali meter` : 'memuat…'}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Selisih meter seri terbesar</span>
			<span class="demo-stat__v">{pct(Math.max(...pairs.map((p) => (Number.isFinite(p.diff) ? p.diff : -Infinity))))}</span>
			<span class="demo-stat__s">rata-rata 24 jam saat inlet mengalir</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">MNF naik terbesar</span>
			<span class="demo-stat__v">{pct(Math.max(...trends.map((x) => (Number.isFinite(x.t.change) ? x.t.change : -Infinity))))}</span>
			<span class="demo-stat__s">tadi malam vs baseline 9 malam sebelumnya</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Titik mengalir malam</span>
			<span class="demo-stat__v">{trends.filter((x) => x.t.last > FLOW_EPS).length}<small>/ {LOGGERS.length}</small></span>
			<span class="demo-stat__s">{field.mode === 'skenario' ? 'skenario · 2 kebocoran disisipkan' : 'MNF hanya bermakna di titik yang dialiri'}</span>
		</div>
	</div>

	{#if err}<div class="card spam-note"><span>Data gagal dimuat: {err}</span></div>{/if}

	{#if candidates.length}
		<div class="demo-grid-2" style="align-items:start">
			{#each candidates as c (c.key)}
				<div class="card leak-head leak-head--{c.level === 'awas' ? 'alarm' : 'warn'}">
					<div class="leak-head__l">
						<span class="label" style="color:{LEVEL_COLOR[c.level]}">{LEVEL_LABEL[c.level]} · {c.tag}</span>
						<h2>{c.title}</h2>
						<span class="pdam-muted">{c.sub}</span>
					</div>
					{#if field.mode === 'skenario'}<span class="spam-badge spam-badge--sim">SIMULASI</span>{/if}
				</div>
			{/each}
		</div>
	{/if}

	<section class="pdam-sec">
		<div class="pdam-sec__h">
			<span class="label">Selisih meter seri · 7 hari</span>
			<span class="pdam-muted">inlet dan outlet satu stasiun membaca air yang sama · selisih = kebocoran di antara meter atau galat meter</span>
		</div>
		<div class="demo-grid-3">
			{#each pairs as p (p.dma)}
				<div class="card pdam-flowday">
					<div class="card-h" style="margin-bottom:6px">
						<div style="display:flex;flex-direction:column;gap:3px;min-width:0">
							<span class="label">Stasiun DMA {p.dma} · {p.inlet.id} → {p.outlet.id}</span>
							<span class="pdam-flowday__v"
								><b>{pct(p.diff)}</b>
								<em class:is-up={p.level !== 'normal'}
									>{p.kind === 'idle' ? 'inlet tidak mengalir' : p.kind === 'silent' ? 'outlet tidak membaca' : p.kind === 'meter' ? 'outlet > inlet · galat meter' : `${f1(p.lost)} L/s selisih · 24 jam`}</em
								></span
							>
						</div>
						<span class="siaga-now" style="--c:{LEVEL_COLOR[p.level]}"><i></i><b>{LEVEL_LABEL[p.level]}</b></span>
					</div>
					<LineChart
						height={130}
						x0={0}
						x1={7 * 24 - 1}
						series={[
							{ values: grid(p.pts.map((x) => ({ t: x.t, v: x.inlet }))), color: '#A08BFF', width: 1.6 },
							{ values: grid(p.pts.map((x) => ({ t: x.t, v: x.outlet }))), color: '#3CC3F2', width: 1.6 }
						]}
						xTicks={flowTicks}
						yFmt={(v) => fmtNum(v, 0)}
					/>
					<span class="pdam-legend-mini"><i style="background:#A08BFF"></i>inlet <i style="background:#3CC3F2"></i>outlet · L/s per jam</span>
				</div>
			{/each}
		</div>
	</section>

	<div class="demo-grid-2" style="align-items:start">
		<div class="card">
			<div class="card-h">
				<span class="label">MNF semua titik · 02:00–04:00</span>
				<span class="pdam-muted">waspada 8% · siaga 12% · awas 18%</span>
			</div>
			<div class="leak-scroll">
				<table class="demo-table leak-table">
					<thead><tr><th>Titik</th><th>Baseline</th><th>Tadi malam</th><th>Perubahan</th><th>Status</th></tr></thead>
					<tbody>
						{#each trends as x (x.l.id)}
							<tr class:is-focus={x.l.id === selId} onclick={() => (selId = x.l.id)} style="cursor:pointer">
								<td><span class="leak-zone"><i style="background:{RESERVOIRS[x.l.reservoir].color}"></i>{x.l.id} · {roleTag(x.l)}</span><div class="hydro-sub">{x.l.name}</div></td>
								<td class="mono">{x.t.flowing ? `${f1(x.t.baseline)} L/s` : '—'}</td>
								<td class="mono">{x.t.flowing ? `${f1(x.t.last)} L/s` : '—'}</td>
								<td class="mono" style:color={x.level !== 'normal' ? LEVEL_COLOR[x.level] : undefined}>{pct(x.t.change)}</td>
								<td>{#if x.t.flowing}<span class="leak-lvl" style="--c:{LEVEL_COLOR[x.level]}">{LEVEL_LABEL[x.level]}</span>{:else}<span class="pdam-muted">tidak dialiri</span>{/if}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="card pdam-mnfcard">
			<div class="card-h">
				<div style="display:flex;flex-direction:column;gap:3px">
					<span class="label">MNF · {sel.l.name}</span>
					<span class="pdam-muted">02:00–04:00 · {NIGHTS} malam terakhir · rata-rata per jam terendah</span>
				</div>
				<a class="demo-btn demo-btn--sm" href="/demo/spam/historis?id={sel.l.id}&span=7"><History size={13} /> Historis</a>
			</div>
			<div bind:clientWidth={W} style="height:{H}px">
				{#if W > 0}
					<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Minimum night flow {NIGHTS} malam">
						{#each bars.vals as v, i (i)}
							{#if Number.isFinite(v)}
								{@const r = sel.t.baseline > FLOW_EPS ? v / sel.t.baseline - 1 : 0}
								{@const x = pad.l + i * bars.bw + bars.bw * 0.16}
								<rect {x} y={bars.ys(v)} width={bars.bw * 0.68} height={Math.max(1, pad.t + bars.ih - bars.ys(v))} rx="2.5" fill={r > 0.12 ? 'var(--danger)' : r > 0.06 ? 'var(--amber)' : '#3b8cff'} opacity={i === bars.vals.length - 1 ? 1 : 0.72}>
									<title>{fmtDay(DAYS[i])} · {f1(v)} L/s</title>
								</rect>
							{/if}
						{/each}
						{#if sel.t.baseline > FLOW_EPS}
							<line x1={pad.l} x2={W - pad.r} y1={bars.ys(sel.t.baseline)} y2={bars.ys(sel.t.baseline)} stroke="#9fb6da" stroke-dasharray="5 4" stroke-width="1.2" />
							<text x={pad.l + 4} y={bars.ys(sel.t.baseline) - 4} class="lchart__band">baseline {f1(sel.t.baseline)} L/s</text>
						{/if}
						{#each [0, bars.hi / 2, bars.hi] as v (v)}<text x={pad.l - 6} y={bars.ys(v) + 3.5} text-anchor="end" class="lchart__ax">{fmtNum(v, 0)}</text>{/each}
						<text x={pad.l} y={H - 5} class="lchart__ax">−13 mlm</text>
						<text x={W - pad.r} y={H - 5} text-anchor="end" class="lchart__ax">tadi malam</text>
					</svg>
				{/if}
			</div>
			<div class="rekap-detail__actions">
				<a class="demo-btn demo-btn--sm" href="/demo/spam/realtime?id={sel.l.id}"><Activity size={13} /> Realtime {sel.l.id}</a>
			</div>
		</div>
	</div>

	<div class="card leak-method">
		<span class="label">CARA KERJA DETEKSI</span>
		<ol>
			<li><b>MNF</b> — debit malam 02:00–04:00 tiap titik dibanding median 9 malam sebelumnya; kebocoran menambah debit malam saat pemakaian paling rendah.</li>
			<li><b>Meter seri</b> — inlet dan outlet satu stasiun membaca air yang sama; selisih yang menetap berarti air hilang di pipa antara kedua meter, atau salah satu meter perlu kalibrasi.</li>
			<li><b>Verifikasi</b> — konfirmasi lapangan dengan korelator akustik sebelum penggalian.</li>
		</ol>
		{#if field.mode === 'skenario'}
			<p class="pdam-muted">Skenario menyisipkan dua kebocoran simulasi: pipa 590 m di stasiun DMA 15 (sejak 2 malam) dan kebocoran kecil yang membesar di DMA 3 (5 malam).</p>
		{/if}
	</div>
</div>
