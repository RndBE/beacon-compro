<script lang="ts">
	import { Scale, FileDown, Sparkles, ChevronRight } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import PdamMap from '$lib/components/demo-pdam/PdamMap.svelte';
	import LineChart from '$lib/components/demo-pdam/LineChart.svelte';
	import HandoverCard from '$lib/components/demo-pdam/HandoverCard.svelte';
	import {
		BALANCE,
		HANDOVER,
		UARL,
		WATER_COST,
		WATER_TARIFF,
		ZONES,
		nrwColor,
		type ZoneId
	} from '$lib/components/demo-pdam/data';
	import { fmtNum, mnfHistory, systemBalance, zoneBalance } from '$lib/components/demo-pdam/sim';

	let period = $state<30 | 7 | 1>(30);
	const sys = systemBalance();
	let k = $derived(period);
	const pct = (v: number) => `${fmtNum((v / sys.siv) * 100, 1)}%`;
	const ili = sys.real / UARL;
	// money: apparent losses at the tariff (lost revenue), real losses at the production cost
	const lossRp = (sys.apparent * WATER_TARIFF + sys.real * WATER_COST + sys.unbilled * WATER_TARIFF) * 30;

	/* IWA balance blocks, widths proportional to volume */
	const auth = sys.billed + sys.unbilled;
	const losses = sys.apparent + sys.real;

	/* zones table */
	const rows = ZONES.map((z) => {
		const b = zoneBalance(z.id);
		const h = mnfHistory(z.id);
		return {
			z,
			...b,
			perSr: (b.real * 1000) / z.sr,
			mnfCh: h[13].value / h[13].baseline - 1,
			score: b.pct * 100 + (b.real * 1000) / z.sr / 40 + Math.max(0, (h[13].value / h[13].baseline - 1) * 100)
		};
	}).sort((a, b) => b.score - a.score);

	/* 12-month NRW trend (system), pilot loggers from Jan 2026 */
	const MONTHS = ['Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'];
	const TREND = [33.9, 33.4, 33.6, 32.8, 32.9, 32.4, 32.1, 31.6, 31.9, 31.2, 32.1, +(sys.pct * 100).toFixed(1)];

	const REKOM: { zone: ZoneId; title: string; body: string; save: string; href: string }[] = [
		{ zone: 'GMW', title: 'Tutup kebocoran LK-01 Gemawang', body: 'JDU Ø8" ACP · 18,6 L/s · tim sudah di lokasi, verifikasi korelator akustik.', save: '±1.607 m³/hari', href: '/demo/pdam/kebocoran?id=LK-01' },
		{ zone: 'PDS', title: 'Manajemen tekanan malam Padasan', body: 'PRV inlet 3,4 bar malam (23:00–05:00) dan 3,5 bar siang · FAVAD N1 = 1,15.', save: '±310 m³/hari', href: '/demo/pdam/tekanan' },
		{ zone: 'KRG', title: 'Step test Karanggayam', body: 'MNF naik 5 malam berturut-turut · persempit segmen sebelum survei akustik.', save: '±449 m³/hari', href: '/demo/pdam/kebocoran?id=LK-02' }
	];
	const zoneName = (id: ZoneId) => ZONES.find((z) => z.id === id)!.name;
</script>

<svelte:head><title>Neraca Air & NRW · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Neraca Air & NRW" sub="Standar IWA · 7 zona DMA · meter induk + air curah + rekening pelanggan" icon={Scale}>
		<div class="demo-seg" role="group" aria-label="Periode">
			<button class:is-on={period === 30} onclick={() => (period = 30)}>30 hari</button>
			<button class:is-on={period === 7} onclick={() => (period = 7)}>7 hari</button>
			<button class:is-on={period === 1} onclick={() => (period = 1)}>Kemarin</button>
		</div>
		<button class="demo-btn" onclick={() => notify('Laporan neraca air bulanan diekspor ke PDF (demo)')}><FileDown size={15} /> Ekspor laporan</button>
	</PageHead>

	<div class="sites-stats leak-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Input sistem</span>
			<span class="demo-stat__v">{fmtNum((sys.siv * k) / 1000, 1)}<small>rb m³</small></span>
			<span class="demo-stat__s">{fmtNum(sys.siv / 86.4, 0)} L/s rata-rata</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Air berekening</span>
			<span class="demo-stat__v" style="color:var(--green)">{fmtNum((sys.billed * k) / 1000, 1)}<small>rb m³</small></span>
			<span class="demo-stat__s">{pct(sys.billed)} dari input</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">NRW</span>
			<span class="demo-stat__v" style="color:var(--amber)">{fmtNum(sys.pct * 100, 1)}<small>%</small></span>
			<span class="demo-stat__s">{fmtNum((sys.nrw * k) / 1000, 1)} rb m³ · target 25%</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Kehilangan fisik</span>
			<span class="demo-stat__v">{fmtNum((sys.real * k) / 1000, 1)}<small>rb m³</small></span>
			<span class="demo-stat__s">ILI {fmtNum(ili, 1)} · {fmtNum((sys.real / sys.nrw) * 100, 0)}% dari NRW</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Nilai NRW · 30 hari</span>
			<span class="demo-stat__v" style="color:var(--danger)">{fmtNum(lossRp / 1e9, 2)}<small>M Rp</small></span>
			<span class="demo-stat__s">tarif Rp {fmtNum(WATER_TARIFF)} · produksi Rp {fmtNum(WATER_COST)}/m³</span>
		</div>
	</div>

	<div class="card nrw-iwa">
		<div class="card-h">
			<span class="label">NERACA AIR IWA · {period === 1 ? 'KEMARIN' : `${period} HARI`}</span>
			<span class="pdam-muted">volume dalam ribu m³ · proporsional</span>
		</div>
		<div class="nrw-iwa__grid">
			<div class="nrw-iwa__col">
				<div class="nrw-blk nrw-blk--siv" style="flex:1">
					<span>Input sistem</span><b>{fmtNum((sys.siv * k) / 1000, 1)}</b><em>100%</em>
				</div>
			</div>
			<div class="nrw-iwa__col">
				<div class="nrw-blk nrw-blk--auth" style="flex:{auth}">
					<span>Konsumsi resmi</span><b>{fmtNum((auth * k) / 1000, 1)}</b><em>{pct(auth)}</em>
				</div>
				<div class="nrw-blk nrw-blk--loss" style="flex:{losses}">
					<span>Kehilangan air</span><b>{fmtNum((losses * k) / 1000, 1)}</b><em>{pct(losses)}</em>
				</div>
			</div>
			<div class="nrw-iwa__col">
				<div class="nrw-blk nrw-blk--billed" style="flex:{sys.billed}">
					<span>Berekening (meter pelanggan)</span><b>{fmtNum((sys.billed * k) / 1000, 1)}</b><em>{pct(sys.billed)}</em>
				</div>
				<div class="nrw-blk nrw-blk--unbilled nrw-blk--sm" style="flex:{Math.max(sys.unbilled, sys.siv * 0.03)}">
					<span>Resmi tak berekening · hidran, flushing</span><b>{fmtNum((sys.unbilled * k) / 1000, 1)}</b><em>{pct(sys.unbilled)}</em>
				</div>
				<div class="nrw-blk nrw-blk--apparent nrw-blk--sm" style="flex:{Math.max(sys.apparent, sys.siv * 0.03)}">
					<span>Komersial · akurasi meter, ilegal</span><b>{fmtNum((sys.apparent * k) / 1000, 1)}</b><em>{pct(sys.apparent)}</em>
				</div>
				<div class="nrw-blk nrw-blk--real" style="flex:{sys.real}">
					<span>Fisik · bocor pipa & SR, luapan</span><b>{fmtNum((sys.real * k) / 1000, 1)}</b><em>{pct(sys.real)}</em>
				</div>
			</div>
			<div class="nrw-iwa__col">
				<div class="nrw-blk nrw-blk--rev" style="flex:{sys.billed}">
					<span>Air berekening (revenue)</span><b>{fmtNum((sys.billed * k) / 1000, 1)}</b><em>{pct(sys.billed)}</em>
				</div>
				<div class="nrw-blk nrw-blk--nrw" style="flex:{sys.nrw}">
					<span>Air tak berekening (NRW)</span><b>{fmtNum((sys.nrw * k) / 1000, 1)}</b><em>{pct(sys.nrw)}</em>
				</div>
			</div>
		</div>
	</div>

	<div class="nrw-grid">
		<div class="nrw-map"><PdamMap colorBy="nrw" title="NRW PER ZONA · CHOROPLETH" twinHref="/demo/pdam/digital-twin" wheel /></div>
		<div class="card nrw-zones">
			<div class="card-h">
				<span class="label">PRIORITAS ZONA</span>
				<span class="nrw-scale">
					<i style="background:{nrwColor(0.2)}"></i>&lt;25
					<i style="background:{nrwColor(0.27)}"></i>25–30
					<i style="background:{nrwColor(0.32)}"></i>30–35
					<i style="background:{nrwColor(0.4)}"></i>&gt;35%
				</span>
			</div>
			<div class="leak-scroll">
				<table class="demo-table leak-table">
					<thead><tr><th>#</th><th>Zona</th><th>Input m³/hari</th><th>NRW</th><th>Fisik L/SR</th><th>MNF</th></tr></thead>
					<tbody>
						{#each rows as r, i (r.z.id)}
							<tr>
								<td class="mono">{i + 1}</td>
								<td><span class="leak-zone"><i style="background:{r.z.color}"></i>{r.z.name}</span></td>
								<td class="mono">{fmtNum(r.siv)}</td>
								<td class="mono" style="color:{nrwColor(r.pct)};font-weight:700">{fmtNum(r.pct * 100, 1)}%</td>
								<td class="mono">{fmtNum(r.perSr)}</td>
								<td class="mono" style="color:{r.mnfCh > 0.08 ? 'var(--danger)' : 'var(--ink-2)'}">{r.mnfCh >= 0 ? '+' : ''}{fmtNum(r.mnfCh * 100, 0)}%</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="pdam-muted" style="margin:10px 0 0;line-height:1.5">
				Input dari flowmeter inlet − outlet DMA; air berekening dari rekening pelanggan per zona (bulan berjalan, prorata harian). Fisik/SR = kehilangan fisik per sambungan per hari.
			</p>
		</div>
	</div>

	<div class="nrw-grid nrw-grid--b">
		<div class="card pdam-flowday">
			<div class="card-h" style="margin-bottom:6px">
				<div style="display:flex;flex-direction:column;gap:3px">
					<span class="label">TREN NRW SISTEM · 12 BULAN</span>
					<span class="pdam-flowday__v"><b>{fmtNum(sys.pct * 100, 1)}%</b> <em class="is-up" style="color:var(--green)">▼ {fmtNum(TREND[0] - TREND[11], 1)} poin sejak Okt 2025</em></span>
				</div>
				<span class="pdam-legend-mini"><i style="background:#ffb454"></i>NRW <i class="is-dash"></i>target 25%</span>
			</div>
			<LineChart
				height={180}
				x0={0}
				x1={11}
				min={22}
				max={36}
				series={[{ values: TREND, color: '#ffb454', fill: true }]}
				lines={[{ v: 25, c: 'var(--green)', t: 'TARGET 25%' }]}
				bands={[{ from: 3, to: 11, c: '#3cc3f2', t: 'LOGGER STESY TERPASANG' }]}
				xTicks={MONTHS.map((m, i) => ({ v: i, t: m })).filter((_, i) => i % 2 === 1 || i === 11)}
				yFmt={(v) => `${v.toFixed(0)}%`}
			/>
		</div>
		<HandoverCard />
		<div class="card nrw-rekom">
			<div class="card-h"><span class="label"><Sparkles size={12} style="vertical-align:-2px" /> REKOMENDASI AI</span></div>
			{#each REKOM as r (r.title)}
				<a class="nrw-rekom__item" href={r.href}>
					<span class="nrw-rekom__z" style="--c:{ZONES.find((z) => z.id === r.zone)!.color}">{zoneName(r.zone)}</span>
					<b>{r.title}</b>
					<span>{r.body}</span>
					<em>Potensi hemat {r.save} <ChevronRight size={12} /></em>
				</a>
			{/each}
		</div>
	</div>

	<div class="card">
		<div class="card-h">
			<span class="label">REKONSILIASI AIR CURAH · BULAN INI</span>
			<span class="pdam-muted">dasar serah terima bersama PDAB Tirtatama</span>
		</div>
		<div class="leak-scroll">
			<table class="demo-table leak-table">
				<thead><tr><th>Titik</th><th>Kontrak</th><th>Rata-rata</th><th>Meter Tirtamarta</th><th>Meter pemasok</th><th>Selisih</th><th>Status</th></tr></thead>
				<tbody>
					{#each HANDOVER as h (h.id)}
						{@const diff = (h.supplierRead - h.month) / h.month}
						<tr>
							<td class="mono" style="font-weight:700">{h.id}</td>
							<td class="mono">{h.contract} L/s</td>
							<td class="mono">{fmtNum(h.avg, 1)} L/s</td>
							<td class="mono">{fmtNum(h.month)} m³</td>
							<td class="mono">{fmtNum(h.supplierRead)} m³</td>
							<td class="mono" style="color:{Math.abs(diff) > 0.003 ? 'var(--amber)' : 'var(--ink-2)'}">{diff >= 0 ? '+' : ''}{fmtNum(diff * 100, 2)}%</td>
							<td><span class="leak-lvl" style="--c:{Math.abs(diff) > 0.003 ? '#FFB454' : '#46D78F'}">{Math.abs(diff) > 0.003 ? 'Kalibrasi silang' : 'Sesuai'}</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
