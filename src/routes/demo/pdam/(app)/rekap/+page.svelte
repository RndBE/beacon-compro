<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Activity, Database, FileDown, Flag, RefreshCw, Search, Upload } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import LoggerSignalBars from '$lib/components/demo-pdam/LoggerSignalBars.svelte';
	import { ASSETS, ASSET_BY_ID, DEVICE_BY_ID, TYPE_META, ZONE_BY_ID, type Asset, type AssetType } from '$lib/components/demo-pdam/data';
	import { live, useLive } from '$lib/components/demo-pdam/live.svelte';
	import { fmtClock, fmtNum } from '$lib/components/demo-pdam/sim';
	import {
		RECORDS_PER_DAY,
		completenessOf,
		completenessTone,
		fmtDay,
		fmtWeekday,
		lastDays
	} from '$lib/components/demo-pdam/logger-health';

	onMount(() => useLive());

	const TYPES: AssetType[] = ['DMA', 'PT', 'SC', 'RES'];
	const TODAY = 6;
	const days = lastDays(7);
	const TONE_LABEL = { ok: 'Lengkap', warn: 'Periksa', bad: 'Tidak lengkap' } as const;
	const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
	const pct = (v: number) => fmtNum(v, v >= 100 ? 0 : 1);

	// today is still running: only the minutes so far are scheduled
	let elapsed = $derived(Math.max(1, Math.floor(live.h * 60)));
	const expectedOn = (i: number, el: number) => (i === TODAY ? el : RECORDS_PER_DAY);

	/** Likely cause of missing records, from the device health data. */
	function cause(id: string) {
		const d = DEVICE_BY_ID[id];
		if (!d) return 'gangguan komunikasi singkat';
		if (d.lastFault?.startsWith('Sinyal putus')) return 'sinyal seluler putus · data dibuffer di logger';
		if (d.fault) return d.fault.toLowerCase();
		if (d.signal < -85) return `sinyal lemah ${fmtNum(d.signal)} dBm`;
		return 'gangguan komunikasi singkat';
	}

	const ROWS = ASSETS.map((a) => {
		const vals = completenessOf(a.id);
		return { a, vals, avg: mean(vals), min: Math.min(...vals) };
	});

	/* ---- network-wide stats ---- */
	const allCells = ROWS.flatMap((r) => r.vals);
	const avgAll = mean(allCells);
	const dayAvgAll = days.map((_, i) => mean(ROWS.map((r) => r.vals[i])));
	const worstDay = dayAvgAll.indexOf(Math.min(...dayAvgAll));
	const below99 = ROWS.filter((r) => r.min < 99);
	let scheduled = $derived(days.reduce((s, _, i) => s + expectedOn(i, elapsed) * ROWS.length, 0));
	let received = $derived(ROWS.reduce((s, r) => s + r.vals.reduce((t, v, i) => t + (expectedOn(i, elapsed) * v) / 100, 0), 0));

	/** Flagged logger-days (below 99.5%), worst first. */
	const FLAGS = ROWS.flatMap((r) => r.vals.map((v, i) => ({ r, v, i })))
		.filter((x) => x.v < 99.5)
		.sort((x, y) => x.v - y.v);

	/* ---- filters ---- */
	let q = $state('');
	let types = $state<AssetType[]>([]);
	let onlyGaps = $state(false);
	const countOf = (t: AssetType) => ASSETS.filter((a) => a.type === t).length;
	function toggle(t: AssetType) {
		types = types.includes(t) ? types.filter((x) => x !== t) : [...types, t];
	}

	let rows = $derived(
		ROWS.filter((r) => {
			const needle = q.trim().toLowerCase();
			const hit =
				!needle ||
				r.a.id.toLowerCase().includes(needle) ||
				r.a.name.toLowerCase().includes(needle) ||
				ZONE_BY_ID[r.a.zone].name.toLowerCase().includes(needle);
			return hit && (types.length === 0 || types.includes(r.a.type)) && (!onlyGaps || r.min < 100);
		})
	);
	let dayAvg = $derived(days.map((_, i) => (rows.length ? mean(rows.map((r) => r.vals[i])) : 0)));

	/* ---- selection (?id= preselects a logger) ---- */
	const urlId = ($page.url.searchParams.get('id') ?? '').toUpperCase();
	let selId = $state(ASSET_BY_ID[urlId] ? urlId : FLAGS[0].r.a.id);
	let selDay = $state<number | null>(null);
	let sel = $derived(ROWS.find((r) => r.a.id === selId) ?? ROWS[0]);
	let selDev = $derived(DEVICE_BY_ID[sel.a.id]);

	function pick(a: Asset, i: number | null = null) {
		selId = a.id;
		selDay = i;
	}

	const typeTag = (a: Asset) => (a.type === 'DMA' ? (a.role === 'in' ? 'IN' : 'OUT') : TYPE_META[a.type].short);
	const cellTitle = (a: Asset, v: number, i: number, el: number) => {
		const exp = expectedOn(i, el);
		return `${a.id} · ${fmtWeekday(days[i])} ${fmtDay(days[i])}: ${fmtNum(v, 1)}% · ${fmtNum(Math.round((exp * v) / 100))} dari ${fmtNum(exp)} data`;
	};

	function exportCsv() {
		notify(`rekap-kelengkapan_${fmtDay(days[0])}–${fmtDay(days[TODAY])}.csv · ${rows.length} logger × 7 hari siap diunduh (demo)`);
	}
</script>

<svelte:head><title>Rekap Data · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Rekap Data" sub="Kelengkapan data harian · 7 hari terakhir · {fmtNum(RECORDS_PER_DAY)} data/hari/titik" icon={Database}>
		<button class="demo-btn" onclick={() => notify('Unggah CSV (demo): data manual divalidasi per slot 1 menit sebelum digabung ke rekap')}>
			<Upload size={15} /> Unggah CSV
		</button>
		<button class="demo-btn demo-btn--primary" onclick={exportCsv}><FileDown size={15} /> Ekspor CSV</button>
	</PageHead>

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Kelengkapan rata-rata</span>
			<span class="demo-stat__v" style="color:var(--green)">{fmtNum(avgAll, 2)}<small>%</small></span>
			<span class="demo-stat__s">{ASSETS.length} logger · terendah {fmtNum(dayAvgAll[worstDay], 2)}% ({fmtDay(days[worstDay])})</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Data diterima</span>
			<span class="demo-stat__v">{fmtNum(Math.round(received))}<small>rekaman</small></span>
			<span class="demo-stat__s">dari {fmtNum(scheduled)} terjadwal · hari ini s.d. {fmtClock(live.h)}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Logger &lt; 99% · min. 1 hari</span>
			<span class="demo-stat__v" style="color:var(--amber)">{below99.length}<small>/ {ASSETS.length}</small></span>
			<span class="demo-stat__s">{below99.map((r) => r.a.id).join(' · ')}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Interval rekam</span>
			<span class="demo-stat__v">1<small>menit</small></span>
			<span class="demo-stat__s">{fmtNum(RECORDS_PER_DAY)} data/hari/titik · 8 parameter</span>
		</div>
	</div>

	<div class="rekap-layout">
		<div class="card rekap-card">
			<div class="rekap-tools">
				<label class="demo-search rekap-search">
					<Search size={15} />
					<input placeholder="Cari logger / zona…" aria-label="Cari logger" bind:value={q} />
				</label>
				<div class="demo-chips" role="group" aria-label="Filter tipe">
					{#each TYPES as t (t)}
						<button class="demo-chip" class:is-on={types.includes(t)} style="--c:{TYPE_META[t].color}" onclick={() => toggle(t)}>
							<i></i>{TYPE_META[t].label}<small>{countOf(t)}</small>
						</button>
					{/each}
					<button class="demo-chip" class:is-on={onlyGaps} style="--c:#FFB454" onclick={() => (onlyGaps = !onlyGaps)}>
						<i></i>Ada data hilang<small>{ROWS.filter((r) => r.min < 100).length}</small>
					</button>
				</div>
			</div>

			<div class="rekap-scroll">
				<table class="rekap-table">
					<thead>
						<tr>
							<th class="rekap-table__name">Logger</th>
							{#each days as d, i (i)}
								<th class:is-today={i === TODAY}>
									<span>{i === TODAY ? 'Hari ini' : fmtWeekday(d)}</span>
									<b>{fmtDay(d)}</b>
								</th>
							{/each}
							<th class="rekap-table__avg"><span>Rata-rata</span><b>7 hari</b></th>
						</tr>
					</thead>
					<tbody>
						{#each rows as row (row.a.id)}
							<tr class:is-sel={row.a.id === selId}>
								<th class="rekap-table__name" scope="row">
									<button class="rekap-logger" onclick={() => pick(row.a)}>
										<span class="rekap-logger__tag" style="--c:{TYPE_META[row.a.type].color}">{typeTag(row.a)}</span>
										<span class="rekap-logger__txt"><b>{row.a.id}</b><small>{row.a.name}</small></span>
									</button>
								</th>
								{#each row.vals as v, i (i)}
									<td>
										<button
											class="rekap-cell rekap-cell--{completenessTone(v)}"
											class:is-full={v >= 100}
											class:is-sel={row.a.id === selId && selDay === i}
											title={cellTitle(row.a, v, i, elapsed)}
											onclick={() => pick(row.a, i)}>{pct(v)}</button
										>
									</td>
								{/each}
								<td class="rekap-table__avg rekap-avg rekap-avg--{completenessTone(row.avg)}">{fmtNum(row.avg, 2)}%</td>
							</tr>
						{:else}
							<tr><td colspan="9" class="sites-empty">Tidak ada logger yang cocok.</td></tr>
						{/each}
					</tbody>
					{#if rows.length}
						<tfoot>
							<tr>
								<th class="rekap-table__name" scope="row">Rata-rata harian<small>{rows.length} logger</small></th>
								{#each dayAvg as v, i (i)}
									<td><span class="rekap-cell rekap-cell--{completenessTone(v)} is-foot">{fmtNum(v, 2)}</span></td>
								{/each}
								<td class="rekap-table__avg rekap-avg rekap-avg--{completenessTone(mean(dayAvg))}">{fmtNum(mean(dayAvg), 2)}%</td>
							</tr>
						</tfoot>
					{/if}
				</table>
			</div>

			<div class="rekap-legend">
				<span><i class="rekap-cell--ok"></i>≥ 99,5% lengkap</span>
				<span><i class="rekap-cell--warn"></i>97–99,5% periksa</span>
				<span><i class="rekap-cell--bad"></i>&lt; 97% tidak lengkap</span>
				<span class="rekap-legend__r">klik sel untuk detail · {fmtNum(RECORDS_PER_DAY)} slot/hari · hari ini dihitung s.d. {fmtClock(live.h)}</span>
			</div>
		</div>

		<div class="rekap-side">
			<div class="card rekap-detail">
				<div class="card-h" style="margin-bottom:10px">
					<span class="label">Detail · {sel.a.id}</span>
					<span class="pill pill--{completenessTone(sel.avg) === 'ok' ? 'green' : completenessTone(sel.avg) === 'warn' ? 'amber' : 'danger'}" style="font-size:11px">
						{fmtNum(sel.avg, 2)}% · 7 hari
					</span>
				</div>
				<div class="rekap-detail__name">{sel.a.name}</div>
				<div class="rekap-detail__meta">
					<span>Zona {ZONE_BY_ID[sel.a.zone].name} · {selDev?.logger}</span>
					{#if selDev}<LoggerSignalBars dbm={selDev.signal} />{/if}
				</div>
				<ul class="rekap-days">
					{#each sel.vals as v, i (i)}
						{@const exp = expectedOn(i, elapsed)}
						<li class:is-sel={selDay === i}>
							<button onclick={() => (selDay = selDay === i ? null : i)}>
								<span class="rekap-days__d">{i === TODAY ? 'Hari ini' : `${fmtWeekday(days[i])} ${fmtDay(days[i])}`}</span>
								<span class="rekap-days__bar"><i class="rekap-cell--{completenessTone(v)}" style="width:{Math.max(4, (v - 90) * 10)}%"></i></span>
								<span class="rekap-days__n">{fmtNum(Math.round((exp * v) / 100))}/{fmtNum(exp)}</span>
								<b class="rekap-days__v rekap-avg--{completenessTone(v)}">{pct(v)}%</b>
							</button>
						</li>
					{/each}
				</ul>
				{#if selDay != null && sel.vals[selDay] < 100}
					{@const exp = expectedOn(selDay, elapsed)}
					<div class="rekap-detail__note">
						<Flag size={13} />
						<span
							><b>{fmtNum(Math.round((exp * (100 - sel.vals[selDay])) / 100))} slot kosong</b> pada {fmtDay(days[selDay])} · {cause(sel.a.id)}</span
						>
					</div>
				{:else if sel.min < 100}
					<div class="rekap-detail__note">
						<Flag size={13} />
						<span>Terendah <b>{pct(sel.min)}%</b> pada {fmtDay(days[sel.vals.indexOf(sel.min)])} · {cause(sel.a.id)}</span>
					</div>
				{:else}
					<div class="rekap-detail__note rekap-detail__note--ok"><span>Lengkap 7 hari · tidak ada slot kosong</span></div>
				{/if}
				<div class="rekap-detail__actions">
					<button
						class="demo-btn demo-btn--sm"
						disabled={sel.min >= 100}
						onclick={() => notify(`Permintaan tarik ulang buffer dikirim ke ${sel.a.id} (demo)`)}><RefreshCw size={13} /> Tarik ulang buffer</button
					>
					<a class="demo-btn demo-btn--sm" href="/demo/pdam/realtime?id={sel.a.id}"><Activity size={13} /> Realtime</a>
				</div>
			</div>

			<div class="card rekap-flags">
				<div class="card-h" style="margin-bottom:10px">
					<span class="label">Penandaan otomatis</span>
					<span class="pdam-muted">{FLAGS.length} hari-logger ditandai</span>
				</div>
				<p class="rekap-flags__lead">
					Setiap logger mengirim 1 rekaman per menit, jadi ada {fmtNum(RECORDS_PER_DAY)} slot per hari. Slot kosong dihitung sebagai data
					hilang; hari di bawah 99,5% ditandai kuning, di bawah 97% merah, lalu masuk laporan harian.
				</p>
				<ul class="rekap-flags__list">
					{#each FLAGS.slice(0, 5) as f (f.r.a.id + f.i)}
						<li>
							<button onclick={() => pick(f.r.a, f.i)}>
								<span class="rekap-cell rekap-cell--{completenessTone(f.v)} is-foot">{pct(f.v)}</span>
								<span class="rekap-flags__body">
									<b>{f.r.a.id} · {f.i === TODAY ? 'hari ini' : `${fmtWeekday(days[f.i])} ${fmtDay(days[f.i])}`}</b>
									<small
										>{fmtNum(Math.round((expectedOn(f.i, elapsed) * (100 - f.v)) / 100))} slot kosong · {cause(f.r.a.id)}</small
									>
								</span>
							</button>
						</li>
					{/each}
				</ul>
				<p class="rekap-flags__foot">
					Saat sinyal putus logger tetap merekam ke buffer lokal. Slot kosong dilengkapi lewat tarik ulang buffer dan data susulan ditandai
					<b>buffer</b>. Nilai di luar rentang sensor ditandai dan tidak dipakai untuk neraca air.
				</p>
			</div>
		</div>
	</div>
</div>
