<script lang="ts">
	import { page } from '$app/stores';
	import { Activity, Cpu, History, Search, TriangleAlert } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { LOGGERS, RESERVOIRS, decodeFault, roleTag, type ReservoirId } from '$lib/components/demo-spam/wosusokas';
	import { field, reading, statusOf } from '$lib/components/demo-spam/field.svelte';
	import { ago, fmtClock, fmtNum } from '$lib/components/demo-spam/util';

	const PILL = { ok: 'green', warn: 'amber', alarm: 'danger' } as const;
	const RES = Object.keys(RESERVOIRS) as ReservoirId[];
	/** flowmeter battery at or below this needs a replacement plan */
	const FM_LOW = 30;
	/** logger supply below this at rest is worth a look */
	const VOLT_LOW = 11.5;

	let q = $state('');
	let res = $state<ReservoirId | null>(null);
	let onlyAction = $state(false);
	let focusId = $state($page.url.searchParams.get('id'));

	let items = $derived(
		LOGGERS.map((l) => {
			const r = reading(l);
			const faults = r.v.fault ? decodeFault(r.v.fault) : [];
			const lowFm = (r.v.fm ?? 100) <= FM_LOW;
			const lowVolt = (r.v.volt ?? 99) < VOLT_LOW;
			return { l, r, s: statusOf(r), faults, lowFm, lowVolt, attention: !r.online || faults.length > 0 || lowFm || lowVolt };
		})
	);
	let shown = $derived(
		items.filter((x) => {
			const needle = q.trim().toLowerCase();
			const hit = !needle || x.l.id.includes(needle) || x.l.name.toLowerCase().includes(needle);
			return hit && (!res || x.l.reservoir === res) && (!onlyAction || x.attention);
		})
	);
	const range = (vals: number[], d: number, u: string) => (vals.length ? `${fmtNum(Math.min(...vals), d)}–${fmtNum(Math.max(...vals), d)} ${u}` : '—');
	const valsOf = (k: 'fm' | 'volt' | 'temp') => items.map((x) => x.r.v[k]).filter((v): v is number => v != null);
	let faultTypes = $derived.by(() => {
		const n = new Map<string, number>();
		for (const x of items) for (const f of x.faults) n.set(f, (n.get(f) ?? 0) + 1);
		return [...n.entries()].sort((a, b) => b[1] - a[1]);
	});
</script>

<svelte:head><title>Perangkat · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Perangkat" sub="Logger & flowmeter lapangan · baterai, suhu panel, fault flowmeter, konektivitas" icon={Cpu} />

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Logger online</span>
			<span class="demo-stat__v" style="color:var(--green)">{items.filter((x) => x.r.online).length}<small>/ {LOGGERS.length}</small></span>
			<span class="demo-stat__s">offline setelah 60 menit tanpa data</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Baterai flowmeter</span>
			<span class="demo-stat__v">{range(valsOf('fm'), 0, '%')}</span>
			<span class="demo-stat__s">{items.filter((x) => x.lowFm).length} di bawah {FM_LOW}%</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Baterai logger</span>
			<span class="demo-stat__v">{range(valsOf('volt'), 2, 'V')}</span>
			<span class="demo-stat__s">suhu panel {range(valsOf('temp'), 1, '°C')}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Fault flowmeter</span>
			<span class="demo-stat__v" style:color={faultTypes.length ? 'var(--amber)' : 'var(--green)'}>{items.filter((x) => x.faults.length).length}<small>logger</small></span>
			<span class="demo-stat__s">{faultTypes.length ? faultTypes.map(([f, n]) => `${f.replace(' warning', '')} ${n}`).join(' · ') : 'tidak ada'}</span>
		</div>
	</div>

	<div class="card dev2-tools">
		<label class="demo-search dev2-search">
			<Search size={15} />
			<input placeholder="Cari kode / lokasi…" aria-label="Cari perangkat" bind:value={q} />
		</label>
		<div class="demo-chips" role="group" aria-label="Filter reservoir">
			{#each RES as r (r)}
				<button class="demo-chip" class:is-on={res === r} style="--c:{RESERVOIRS[r].color}" onclick={() => (res = res === r ? null : r)}>
					<i></i>{RESERVOIRS[r].name}<small>{LOGGERS.filter((l) => l.reservoir === r).length}</small>
				</button>
			{/each}
			<button class="demo-chip" class:is-on={onlyAction} style="--c:#FFB454" onclick={() => (onlyAction = !onlyAction)}>
				<i></i>Perlu perhatian<small>{items.filter((x) => x.attention).length}</small>
			</button>
		</div>
	</div>

	<div class="dev2-grid">
		{#each shown as x (x.l.id)}
			<article class="card dev2-card" class:dev2-card--warn={x.attention} class:is-focus={x.l.id === focusId}>
				<header class="dev2-card__head">
					<span class="dev2-card__tag" style="--c:{RESERVOIRS[x.l.reservoir].color}">{roleTag(x.l)}</span>
					<div class="dev2-card__titles">
						<span class="dev2-card__id">{x.l.id} · {x.l.pressures === 2 ? 'logger 50 kanal' : 'logger 16 kanal'}</span>
						<span class="dev2-card__name">{x.l.name}</span>
					</div>
					<span class="pill pill--{PILL[x.s.st]}" style="font-size:10px;padding:3px 8px">{x.r.online ? 'ONLINE' : 'OFFLINE'}</span>
				</header>
				<div class="dev2-card__sensor">Flowmeter elektromagnetik · {x.l.pressures === 2 ? 'P1 hulu + P2 hilir' : '1 sensor tekanan'} · {RESERVOIRS[x.l.reservoir].name}</div>

				<dl class="dev2-card__grid">
					<div class="dev2-m dev2-m--wide">
						<dt>Baterai flowmeter</dt>
						<dd class="dev2-batt" class:is-low={x.lowFm}>
							<i class="twin-bar" class:twin-bar--amber={x.lowFm}><i style="width:{x.r.v.fm ?? 0}%"></i></i>
							<b>{x.r.v.fm != null ? `${fmtNum(x.r.v.fm)}%` : '—'}</b>
						</dd>
					</div>
					<div class="dev2-m">
						<dt>Baterai logger</dt>
						<dd class:is-warn={x.lowVolt}>{x.r.v.volt != null ? `${fmtNum(x.r.v.volt, 2)} V` : '—'}<small>{x.lowVolt ? 'rendah' : 'normal'}</small></dd>
					</div>
					<div class="dev2-m">
						<dt>Panel</dt>
						<dd>{x.r.v.temp != null ? `${fmtNum(x.r.v.temp, 1)}°C` : '—'}<small>{x.r.v.hum != null ? `${fmtNum(x.r.v.hum, 0)}% RH` : ''}</small></dd>
					</div>
					<div class="dev2-m">
						<dt>Data terakhir</dt>
						<dd>{x.r.t != null ? fmtClock(x.r.t / 60) : '—'}<small>{field.mode === 'skenario' ? 'simulasi' : x.r.t != null ? ago(field.now - x.r.t) : 'belum ada'}</small></dd>
					</div>
					<div class="dev2-m">
						<dt>Status aliran</dt>
						<dd>{x.s.label}<small>{x.r.v.flow != null ? `${fmtNum(x.r.v.flow, 1)} L/s` : ''}</small></dd>
					</div>
				</dl>

				{#each x.faults as f (f)}
					<div class="dev2-note dev2-note--warn"><TriangleAlert size={13} /> {f}{f.startsWith('Empty pipe') ? ' · pipa tidak terisi penuh / belum dialiri' : ''}</div>
				{/each}

				<footer class="dev2-card__actions">
					<a class="demo-btn demo-btn--sm" href="/demo/spam/realtime?id={x.l.id}"><Activity size={13} /> Realtime</a>
					<a class="demo-btn demo-btn--sm" href="/demo/spam/historis?id={x.l.id}"><History size={13} /> Historis</a>
				</footer>
			</article>
		{:else}
			<div class="card sites-empty dev2-empty">Tidak ada perangkat yang cocok.</div>
		{/each}
	</div>
</div>
