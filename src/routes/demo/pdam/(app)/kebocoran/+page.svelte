<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Box, Radar, Ticket, Send, Check, Clock, Droplets, Timer, ShieldCheck, MapPin } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import PdamMap from '$lib/components/demo-pdam/PdamMap.svelte';
	import MnfBars from '$lib/components/demo-pdam/MnfBars.svelte';
	import FlowDayCard from '$lib/components/demo-pdam/FlowDayCard.svelte';
	import LineChart from '$lib/components/demo-pdam/LineChart.svelte';
	import LeakLocator from '$lib/components/demo-pdam/LeakLocator.svelte';
	import {
		BALANCE,
		LEAKS,
		LEAK_HISTORY,
		LEAK_STATUS_LABEL,
		WATER_COST,
		ZONES,
		ZONE_BY_ID,
		type LeakCase,
		type SiteStatus
	} from '$lib/components/demo-pdam/data';
	import { live, useLive } from '$lib/components/demo-pdam/live.svelte';
	import {
		BURST,
		EVENTS,
		TRANSIENT,
		burstAnchor,
		burstAt,
		burstLoss,
		fmtClock,
		fmtNum,
		mnfHistory,
		noise,
		ticks24,
		transientAt,
		zonePressure
	} from '$lib/components/demo-pdam/sim';

	onMount(() => useLive(10000));

	const idParam = $page.url.searchParams.get('id');
	let selectedId = $state(LEAKS.some((l) => l.id === idParam) ? idParam! : LEAKS[0].id);
	let lk = $derived(LEAKS.find((l) => l.id === selectedId)!);

	const pillOf = (s: SiteStatus) => (s === 'alarm' ? 'danger' : s === 'warn' ? 'amber' : 'green');
	const lossDay = (l: LeakCase) => l.est * 86.4;
	const totalLossDay = LEAKS.reduce((a, l) => a + lossDay(l), 0);
	const savedMonth = LEAK_HISTORY.reduce((a, h) => a + h.saved, 0);

	let lost = $derived(burstLoss(live.h, true));

	/** pressure drops used for the localisation (night values, bar); `at` = position along the segment */
	const DROPS: Record<string, { id: string; drop: number; at?: number }[]> = {
		'LK-01': [
			{ id: 'PT-01', drop: BURST.drop['PT-01'], at: 1 },
			{ id: 'GMW-OUT', drop: BURST.drop['GMW-OUT'] },
			{ id: 'GMW-IN', drop: BURST.drop['GMW-IN'], at: 0 }
		],
		'LK-02': [
			{ id: 'PT-02', drop: 0.07, at: 1 },
			{ id: 'KRG-OUT', drop: 0.04 }
		],
		'LK-03': [{ id: 'PT-03', drop: 0.25, at: 1 }]
	};
	let drops = $derived(DROPS[lk.id].map((d) => ({ id: d.id, drop: d.drop, at: d.at ?? -1 })));

	/* ---- pressure at the nearest critical point, last 24 h ---- */
	const PT_OF: Record<string, string> = { 'LK-01': 'PT-01', 'LK-02': 'PT-02', 'LK-03': 'PT-03' };
	const wrap = (h: number) => ((h % 24) + 24) % 24;
	let pressure = $derived.by(() => {
		const now = live.h;
		const anchor = burstAnchor(now);
		const n = 97;
		const normal: number[] = [];
		const actual: number[] = [];
		for (let i = 0; i < n; i++) {
			const x = now - 24 + (24 * i) / (n - 1);
			const p = zonePressure(lk.zone, wrap(x), 'end');
			normal.push(p);
			let a = p;
			if (lk.id === 'LK-01') a -= BURST.drop['PT-01'] * (burstAt(x, anchor) / BURST.flow);
			if (lk.id === 'LK-02') a -= 0.07 * (0.9 + 0.1 * noise('lk2', i));
			// LK-03: short recurring transients
			if (lk.id === TRANSIENT.leak) a -= transientAt(x);
			actual.push(a);
		}
		return { normal, actual, now };
	});

	/* ---- MNF per zone ---- */
	const mnfRows = ZONES.map((z) => {
		const h = mnfHistory(z.id);
		const last = h[13].value;
		const base = h[13].baseline;
		const ch = last / base - 1;
		const avg = BALANCE[z.id].siv / 86.4;
		const lvl = ch > 0.18 ? 'Awas' : ch > 0.12 ? 'Siaga' : ch > 0.08 ? 'Waspada' : 'Normal';
		return { z, base, last, ch, nfr: last / avg, lvl };
	});
	const LVL_COLOR: Record<string, string> = { Awas: '#FF7A66', Siaga: '#FFB454', Waspada: '#FFD166', Normal: '#46D78F' };

	/* ---- workflow per case ---- */
	const STEPS: Record<string, { t: string; label: string }[]> = {
		'LK-02': [
			{ t: '5 malam', label: 'MNF mulai naik ±1 L/s per malam' },
			{ t: 'kemarin', label: 'AI menandai tren · status Dipantau' },
			{ t: 'malam ini', label: 'Step test 01:00–03:00 (tutup valve bertahap)' },
			{ t: 'besok', label: 'Survei akustik di segmen terpilih' }
		],
		'LK-03': [
			{ t: '2 hari', label: 'Transien tekanan berulang di PT-03' },
			{ t: 'kemarin', label: 'Belum tampak di MNF zona Bedog' },
			{ t: 'Kamis', label: 'Survei akustik dijadwalkan' }
		]
	};
	let stepsDone = $derived(lk.id === 'LK-02' ? 2 : lk.id === 'LK-03' ? 2 : EVENTS.length - 1);
</script>

<svelte:head><title>Deteksi Kebocoran · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Deteksi Kebocoran" sub="Minimum Night Flow · residual debit AI · korelasi tekanan · {LEAKS.length} kandidat" icon={Radar}>
		<a class="demo-btn" href="/demo/pdam/digital-twin?focus={lk.id}"><Box size={15} /> Lihat di Twin 3D</a>
		<button class="demo-btn demo-btn--primary" onclick={() => notify(`Tiket perbaikan ${lk.id} dikirim ke tim distribusi (demo)`)}><Ticket size={15} /> Buat tiket</button>
	</PageHead>

	<div class="sites-stats leak-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Kandidat aktif</span>
			<span class="demo-stat__v">{LEAKS.length}<small>titik</small></span>
			<span class="demo-stat__s"><b style="color:var(--danger)">1 awas</b> · 2 dipantau</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Estimasi kehilangan</span>
			<span class="demo-stat__v">{fmtNum(totalLossDay)}<small>m³/hari</small></span>
			<span class="demo-stat__s">≈ Rp {fmtNum((totalLossDay * WATER_COST) / 1e6, 1)} jt/hari biaya produksi</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">LK-01 sejak 01:40</span>
			<span class="demo-stat__v" style="color:var(--danger)">{fmtNum(lost)}<small>m³</small></span>
			<span class="demo-stat__s">Rp {fmtNum((lost * WATER_COST) / 1e6, 1)} jt · terus bertambah</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Waktu deteksi</span>
			<span class="demo-stat__v">25<small>menit</small></span>
			<span class="demo-stat__s">pecah 01:40 → alarm AI 02:05</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Diselamatkan · 30 hari</span>
			<span class="demo-stat__v" style="color:var(--green)">{fmtNum(savedMonth)}<small>m³</small></span>
			<span class="demo-stat__s">{LEAK_HISTORY.length} kebocoran ditutup</span>
		</div>
	</div>

	<div class="leak-layout">
		<div class="leak-list" role="listbox" aria-label="Kandidat kebocoran">
			{#each LEAKS as l (l.id)}
				<button class="card leak-item leak-item--{l.severity}" class:is-on={l.id === selectedId} role="option" aria-selected={l.id === selectedId} onclick={() => (selectedId = l.id)}>
					<span class="leak-item__top">
						<b>{l.id}</b>
						<span class="pill pill--{pillOf(l.severity)}" style="font-size:10px;padding:3px 8px">{LEAK_STATUS_LABEL[l.status]}</span>
					</span>
					<span class="leak-item__title">JDU Ø{l.diameter}" {l.material} · {ZONE_BY_ID[l.zone].name}</span>
					<span class="leak-item__row">
						<span>Keyakinan</span>
						<i class="twin-bar" class:twin-bar--amber={l.severity !== 'alarm'}><i style="width:{l.confidence}%"></i></i>
						<b>{l.confidence}%</b>
					</span>
					<span class="leak-item__meta">
						<span><Droplets size={12} /> {fmtNum(l.est, 1)} L/s</span>
						<span><Clock size={12} /> {l.since}</span>
						<span><MapPin size={12} /> ±{l.radius} m</span>
					</span>
				</button>
			{/each}
			<div class="card leak-method">
				<span class="label">CARA KERJA DETEKSI</span>
				<ol>
					<li><b>MNF</b> — debit malam 02:00–04:00 dibanding baseline 14 malam per DMA.</li>
					<li><b>Residual AI</b> — debit aktual vs prediksi pola harian, alarm di atas 3σ.</li>
					<li><b>Korelasi tekanan</b> — penurunan di beberapa logger mempersempit segmen pipa.</li>
					<li><b>Verifikasi</b> — korelator akustik / ground mic oleh tim distribusi.</li>
				</ol>
			</div>
		</div>

		<div class="leak-detail">
			<div class="card leak-head leak-head--{lk.severity}">
				<div class="leak-head__l">
					<span class="label">{lk.id} · ZONA {ZONE_BY_ID[lk.zone].name.toUpperCase()}</span>
					<h2>Kebocoran JDU Ø{lk.diameter}" {lk.material} · {fmtNum(lk.pipeLen)} m</h2>
					<span class="pdam-muted">{lk.pipeId} · {lk.at.lat.toFixed(5)}, {lk.at.lng.toFixed(5)} · {lk.action}</span>
				</div>
				<div class="leak-head__kpis">
					<div><span>Estimasi</span><b>{fmtNum(lk.est, 1)}<small>L/s</small></b></div>
					<div><span>Per hari</span><b>{fmtNum(lossDay(lk))}<small>m³</small></b></div>
					<div><span>Keyakinan</span><b>{lk.confidence}<small>%</small></b></div>
				</div>
				<div class="leak-head__actions">
					<button class="demo-btn demo-btn--sm" onclick={() => notify(`Lokasi ${lk.id} dikirim ke WhatsApp tim lapangan (demo)`)}><Send size={13} /> Kirim ke tim</button>
					<button class="demo-btn demo-btn--sm" onclick={() => notify(`Rencana isolasi ${lk.id}: tutup 3 valve · ±480 SR terdampak ±3 jam (demo)`)}><ShieldCheck size={13} /> Rencana isolasi</button>
				</div>
			</div>

			<div class="leak-grid2">
				<div class="leak-map"><PdamMap focusId={lk.id} title="LOKASI KANDIDAT · {lk.id}" twinHref="/demo/pdam/digital-twin?focus={lk.id}" legend={false} wheel /></div>
				<div class="card leak-loc">
					<div class="card-h"><span class="label">LOKALISASI · KORELASI TEKANAN</span><span class="pill pill--water" style="font-size:11px">±{lk.radius} m</span></div>
					<LeakLocator leak={lk} {drops} />
					<span class="label" style="display:block;margin:14px 0 8px">SINYAL</span>
					<ul class="pdam-spot__signals">
						{#each lk.signals as s (s)}<li>{s}</li>{/each}
					</ul>
					<span class="label" style="display:block;margin:12px 0 8px">TINDAK LANJUT</span>
					<ol class="pdam-steps">
						{#if lk.id === 'LK-01'}
							{#each EVENTS as e, i (e.label)}
								<li class:is-now={i === EVENTS.length - 1}>
									<span class="pdam-steps__dot">{#if i < EVENTS.length - 1}<Check size={10} strokeWidth={3} />{/if}</span>
									<span class="pdam-steps__t">{fmtClock(e.h)}</span>
									<span class="pdam-steps__l">{e.label}</span>
								</li>
							{/each}
						{:else}
							{#each STEPS[lk.id] as s, i (s.label)}
								<li class:is-now={i === stepsDone} class:is-todo={i > stepsDone}>
									<span class="pdam-steps__dot">{#if i < stepsDone}<Check size={10} strokeWidth={3} />{/if}</span>
									<span class="pdam-steps__t">{s.t}</span>
									<span class="pdam-steps__l">{s.label}</span>
								</li>
							{/each}
						{/if}
					</ol>
				</div>
			</div>

			<div class="leak-grid3">
				<div class="card pdam-mnfcard">
					<div class="card-h">
						<div style="display:flex;flex-direction:column;gap:3px">
							<span class="label">MNF · {ZONE_BY_ID[lk.zone].name.toUpperCase()}</span>
							<span class="pdam-muted">02:00–04:00 · 14 malam</span>
						</div>
						{#if mnfRows.find((r) => r.z.id === lk.zone)}
							{@const r = mnfRows.find((x) => x.z.id === lk.zone)!}
							<span class="pill" style="font-size:11px;color:{LVL_COLOR[r.lvl]}">{r.ch >= 0 ? '+' : ''}{fmtNum(r.ch * 100, 0)}%</span>
						{/if}
					</div>
					{#key lk.zone}<MnfBars zone={lk.zone} height={150} />{/key}
				</div>
				{#key lk.zone}
					<FlowDayCard zone={lk.zone} title="RESIDUAL DEBIT · {ZONE_BY_ID[lk.zone].name.toUpperCase()}" height={150} />
				{/key}
				<div class="card pdam-flowday">
					<div class="card-h" style="margin-bottom:6px">
						<div style="display:flex;flex-direction:column;gap:3px">
							<span class="label">TEKANAN {PT_OF[lk.id]} · 24 JAM</span>
							<span class="pdam-flowday__v"
								><b>{fmtNum(pressure.actual[pressure.actual.length - 1], 2)}</b> bar
								<em class:is-up={pressure.actual[pressure.actual.length - 1] < pressure.normal[pressure.normal.length - 1] - 0.05}
									>{fmtNum(pressure.actual[pressure.actual.length - 1] - pressure.normal[pressure.normal.length - 1], 2)} vs normal</em
								></span
							>
						</div>
						<span class="pdam-legend-mini"><i style="background:#a08bff"></i>aktual <i class="is-dash"></i>normal</span>
					</div>
					<LineChart
						height={150}
						x0={pressure.now - 24}
						x1={pressure.now}
						series={[
							{ values: pressure.normal, color: '#9fb6da', dash: '4 4', width: 1.4 },
							{ values: pressure.actual, color: '#a08bff', fill: true }
						]}
						lines={[{ v: 0.7, c: 'var(--danger)', t: 'MIN 0,7' }]}
						xTicks={ticks24(pressure.now)}
						yFmt={(v) => fmtNum(v, 1)}
					/>
				</div>
			</div>
		</div>
	</div>

	<div class="demo-grid-2" style="align-items:start">
		<div class="card">
			<div class="card-h">
				<span class="label">MNF SEMUA DMA · TADI MALAM</span>
				<span class="pdam-muted">ambang: waspada 8% · siaga 12% · awas 18%</span>
			</div>
			<div class="leak-scroll">
				<table class="demo-table leak-table">
					<thead><tr><th>Zona</th><th>Baseline</th><th>Tadi malam</th><th>Perubahan</th><th>NFR</th><th>Status</th></tr></thead>
					<tbody>
						{#each mnfRows as r (r.z.id)}
							<tr class:is-focus={r.z.id === lk.zone}>
								<td><span class="leak-zone"><i style="background:{r.z.color}"></i>{r.z.name}</span></td>
								<td class="mono">{fmtNum(r.base, 1)} L/s</td>
								<td class="mono">{fmtNum(r.last, 1)} L/s</td>
								<td class="mono" style="color:{r.ch > 0.08 ? LVL_COLOR[r.lvl] : 'var(--ink-2)'}">{r.ch >= 0 ? '+' : ''}{fmtNum(r.ch * 100, 1)}%</td>
								<td class="mono">{fmtNum(r.nfr * 100, 0)}%</td>
								<td><span class="leak-lvl" style="--c:{LVL_COLOR[r.lvl]}">{r.lvl}</span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<div class="card">
			<div class="card-h">
				<span class="label"><Timer size={12} style="vertical-align:-2px" /> RIWAYAT · 30 HARI</span>
				<span class="pdam-muted">{fmtNum(savedMonth)} m³ diselamatkan</span>
			</div>
			<div class="leak-scroll">
				<table class="demo-table leak-table">
					<thead><tr><th>ID</th><th>Zona</th><th>Pipa</th><th>Estimasi</th><th>Ditemukan</th><th>Perbaikan</th><th>Hemat</th></tr></thead>
					<tbody>
						{#each LEAK_HISTORY as h (h.id)}
							<tr>
								<td class="mono" style="font-weight:700">
									<a class="leak-hist" href="/demo/pdam/historis?id={h.zone}-IN&span=7&d={Math.max(0, h.ago - 3)}" title="Lihat data historis {h.id}">{h.id}</a>
								</td>
								<td>{ZONE_BY_ID[h.zone].name}</td>
								<td>{h.pipe}</td>
								<td class="mono">{fmtNum(h.est, 1)} L/s</td>
								<td class="mono">{h.found}</td>
								<td class="mono">{h.fixed}</td>
								<td class="mono" style="color:var(--green)">{fmtNum(h.saved)} m³</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
