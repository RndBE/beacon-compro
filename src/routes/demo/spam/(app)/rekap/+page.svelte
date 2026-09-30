<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Activity, Database, History } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { LOGGERS, LOGGER_BY_ID, RESERVOIRS, roleTag } from '$lib/components/demo-spam/wosusokas';
	import { bucketsOf, field } from '$lib/components/demo-spam/field.svelte';
	import { completenessTone, dayMin, fmtClock, fmtDay, fmtNum, fmtWeekday, lastDays } from '$lib/components/demo-spam/util';

	const DAYS = 7;
	const TODAY = DAYS - 1;
	const days = lastDays(DAYS);
	const mean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);

	/** records per logger per day (oldest first), from the daily buckets */
	let counts = $state<Record<string, number[]>>({});
	let loadedMode = $state('');
	let err = $state('');
	// today's count keeps growing: refresh every 10 minutes
	let refresh = $derived(Math.floor(field.now / 10));
	$effect(() => {
		const mode = field.mode;
		void refresh;
		let stale = false;
		Promise.all(LOGGERS.map((l) => bucketsOf(l, days[0], days[TODAY], '1d').then((bs) => [l.id, bs] as const)))
			.then((res) => {
				if (stale) return;
				const next: Record<string, number[]> = {};
				for (const [id, bs] of res) {
					const row = Array(DAYS).fill(0);
					for (const b of bs) {
						const i = TODAY - dayMin(b.t).d;
						if (i >= 0 && i < DAYS) row[i] = b.n;
					}
					next[id] = row;
				}
				counts = next;
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

	/** one record per minute: today only counts the minutes so far */
	const minutesOn = (i: number) => (i === TODAY ? Math.max(1, field.now) : 1440);
	const pct = (id: string, i: number) => Math.min(100, (100 * (counts[id]?.[i] ?? 0)) / minutesOn(i));

	let rows = $derived(
		LOGGERS.map((l) => {
			const vals = days.map((_, i) => pct(l.id, i));
			return { l, vals, avg: mean(vals), min: Math.min(...vals) };
		})
	);
	let dayAvg = $derived(days.map((_, i) => mean(rows.map((r) => r.vals[i]))));
	let received = $derived(Object.values(counts).reduce((a, row) => a + row.reduce((x, y) => x + y, 0), 0));
	let scheduled = $derived(LOGGERS.length * days.reduce((a, _, i) => a + minutesOn(i), 0));
	let below = $derived(rows.filter((r) => r.min < 99));

	const urlId = $page.url.searchParams.get('id') ?? '';
	let selId = $state(LOGGER_BY_ID[urlId] ? urlId : LOGGERS[0].id);
	let sel = $derived(rows.find((r) => r.l.id === selId) ?? rows[0]);
	const pctText = (v: number) => fmtNum(v, v >= 100 ? 0 : 1);
</script>

<svelte:head><title>Rekap Data · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Rekap Data" sub="Kelengkapan data harian · 7 hari terakhir · 1 rekaman per menit per logger" icon={Database} />

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Kelengkapan rata-rata</span>
			<span class="demo-stat__v" style="color:var(--green)">{ready ? fmtNum(mean(rows.map((r) => r.avg)), 2) : '—'}<small>%</small></span>
			<span class="demo-stat__s">{LOGGERS.length} logger · 7 hari</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Rekaman diterima</span>
			<span class="demo-stat__v">{fmtNum(received)}<small>rekaman</small></span>
			<span class="demo-stat__s">dari {fmtNum(scheduled)} terjadwal · hari ini s.d. {fmtClock(field.now / 60)}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Logger &lt; 99% · min. 1 hari</span>
			<span class="demo-stat__v" style="color:var(--amber)">{ready ? below.length : '—'}<small>/ {LOGGERS.length}</small></span>
			<span class="demo-stat__s">{below.map((r) => r.l.id).join(' · ') || 'semua lengkap'}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Sumber</span>
			<span class="demo-stat__v">{field.mode === 'lapangan' ? 'Lapangan' : 'Simulasi'}</span>
			<span class="demo-stat__s">{field.mode === 'lapangan' ? 'jumlah rekaman per hari di mini-stesy' : 'skenario operasi · tanpa celah data'}</span>
		</div>
	</div>

	{#if err}<div class="card spam-note"><span>Rekap gagal dimuat: {err}</span></div>{/if}

	<div class="rekap-layout">
		<div class="card rekap-card">
			<div class="rekap-scroll">
				<table class="rekap-table">
					<thead>
						<tr>
							<th class="rekap-table__name">Logger</th>
							{#each days as d, i (i)}
								<th class:is-today={i === TODAY}><span>{i === TODAY ? 'Hari ini' : fmtWeekday(d)}</span><b>{fmtDay(d)}</b></th>
							{/each}
							<th class="rekap-table__avg"><span>Rata-rata</span><b>7 hari</b></th>
						</tr>
					</thead>
					<tbody>
						{#each rows as row (row.l.id)}
							<tr class:is-sel={row.l.id === selId}>
								<th class="rekap-table__name" scope="row">
									<button class="rekap-logger" onclick={() => (selId = row.l.id)}>
										<span class="rekap-logger__tag" style="--c:{RESERVOIRS[row.l.reservoir].color}">{roleTag(row.l)}</span>
										<span class="rekap-logger__txt"><b>{row.l.id}</b><small>{row.l.name}</small></span>
									</button>
								</th>
								{#each row.vals as v, i (i)}
									<td>
										<button
											class="rekap-cell rekap-cell--{completenessTone(v)}"
											class:is-full={v >= 100}
											title="{row.l.id} · {fmtDay(days[i])}: {fmtNum(counts[row.l.id]?.[i] ?? 0)} dari {fmtNum(minutesOn(i))} rekaman"
											onclick={() => (selId = row.l.id)}>{ready ? pctText(v) : '…'}</button
										>
									</td>
								{/each}
								<td class="rekap-table__avg rekap-avg rekap-avg--{completenessTone(row.avg)}">{ready ? `${fmtNum(row.avg, 2)}%` : '…'}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<th class="rekap-table__name" scope="row">Rata-rata harian<small>{LOGGERS.length} logger</small></th>
							{#each dayAvg as v, i (i)}<td><span class="rekap-cell rekap-cell--{completenessTone(v)} is-foot">{ready ? fmtNum(v, 2) : '…'}</span></td>{/each}
							<td class="rekap-table__avg rekap-avg rekap-avg--{completenessTone(mean(dayAvg))}">{ready ? `${fmtNum(mean(dayAvg), 2)}%` : '…'}</td>
						</tr>
					</tfoot>
				</table>
			</div>
			<div class="rekap-legend">
				<span><i class="rekap-cell--ok"></i>≥ 99,5% lengkap</span>
				<span><i class="rekap-cell--warn"></i>97–99,5% periksa</span>
				<span><i class="rekap-cell--bad"></i>&lt; 97% tidak lengkap</span>
				<span class="rekap-legend__r">1.440 rekaman/hari · hari ini dihitung s.d. {fmtClock(field.now / 60)}</span>
			</div>
		</div>

		<div class="rekap-side">
			<div class="card rekap-detail">
				<div class="card-h" style="margin-bottom:10px">
					<span class="label">Detail · {sel.l.id}</span>
					<span class="pill pill--{completenessTone(sel.avg) === 'ok' ? 'green' : completenessTone(sel.avg) === 'warn' ? 'amber' : 'danger'}" style="font-size:11px">{fmtNum(sel.avg, 2)}% · 7 hari</span>
				</div>
				<div class="rekap-detail__name">{sel.l.name}</div>
				<div class="rekap-detail__meta"><span>{RESERVOIRS[sel.l.reservoir].name} · DMA {sel.l.dma}</span></div>
				<ul class="rekap-days">
					{#each sel.vals as v, i (i)}
						<li>
							<button title="Buka data historis hari itu" onclick={() => goto(`/demo/spam/historis?id=${sel.l.id}&d=${TODAY - i}`)}>
								<span class="rekap-days__d">{i === TODAY ? 'Hari ini' : `${fmtWeekday(days[i])} ${fmtDay(days[i])}`}</span>
								<span class="rekap-days__bar"><i class="rekap-cell--{completenessTone(v)}" style="width:{Math.max(4, (v - 50) * 2)}%"></i></span>
								<span class="rekap-days__n">{fmtNum(counts[sel.l.id]?.[i] ?? 0)}/{fmtNum(minutesOn(i))}</span>
								<b class="rekap-days__v rekap-avg--{completenessTone(v)}">{pctText(v)}%</b>
							</button>
						</li>
					{/each}
				</ul>
				<div class="rekap-detail__note rekap-detail__note--ok">
					<span>{sel.min < 99 ? `Terendah ${pctText(sel.min)}% · rekaman hilang biasanya karena sinyal seluler atau daya logger` : 'Lengkap 7 hari'}</span>
				</div>
				<div class="rekap-detail__actions">
					<a class="demo-btn demo-btn--sm" href="/demo/spam/realtime?id={sel.l.id}"><Activity size={13} /> Realtime</a>
					<a class="demo-btn demo-btn--sm" href="/demo/spam/historis?id={sel.l.id}&span=7"><History size={13} /> Data historis</a>
				</div>
			</div>
		</div>
	</div>
</div>
