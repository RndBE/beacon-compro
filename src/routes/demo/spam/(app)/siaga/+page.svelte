<script lang="ts">
	import { Activity, Siren } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { LOGGERS, RESERVOIRS, roleTag } from '$lib/components/demo-spam/wosusokas';
	import { field, reading } from '$lib/components/demo-spam/field.svelte';
	import { LEVELS, LEVEL_COLOR, LEVEL_LABEL, RULES, evaluate, levelOf, type Level, type RuleId } from '$lib/components/demo-spam/siaga';

	const KEY = 'demo-spam-rules-off';
	const SEV: Record<Level, 'ok' | 'warn' | 'alarm'> = { normal: 'ok', waspada: 'warn', siaga: 'warn', awas: 'alarm' };

	function saved(): RuleId[] {
		try {
			return JSON.parse(localStorage.getItem(KEY) ?? '[]');
		} catch {
			return [];
		}
	}
	let off = $state<RuleId[]>(saved());
	let on = $derived(new Set(RULES.map((r) => r.id).filter((id) => !off.includes(id))));
	function toggle(id: RuleId, enabled: boolean) {
		off = enabled ? off.filter((x) => x !== id) : [...off, id];
		try {
			localStorage.setItem(KEY, JSON.stringify(off));
		} catch {
			/* not remembered */
		}
	}

	let rows = $derived(
		LOGGERS.map((l) => {
			const hits = evaluate(l, reading, field.now, on);
			return { l, hits, level: levelOf(hits) };
		})
	);
	let alerts = $derived(
		rows
			.flatMap((r) => r.hits.map((h) => ({ ...h, l: r.l })))
			.sort((a, b) => LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level) || a.l.id.localeCompare(b.l.id))
	);
	const ruleOf = (id: RuleId) => RULES.find((r) => r.id === id)!;
	const hitsOf = (id: RuleId) => alerts.filter((a) => a.rule === id);
</script>

<svelte:head><title>Tingkat Siaga · STESY Smart Water SPAM</title></svelte:head>

<div class="demo-page">
	<PageHead title="Tingkat Siaga" sub="Ambang usulan untuk flowmeter DMA · dievaluasi pada nilai terkini tiap logger" icon={Siren} />

	<div class="sites-stats">
		{#each LEVELS as lv (lv)}
			{@const n = rows.filter((r) => r.level === lv).length}
			<div class="card demo-stat">
				<span class="demo-stat__k">{LEVEL_LABEL[lv]}</span>
				<span class="demo-stat__v" style:color={n && lv !== 'normal' ? LEVEL_COLOR[lv] : undefined}>{n}<small>titik</small></span>
				<span class="demo-stat__s">{rows.filter((r) => r.level === lv).map((r) => r.l.id).join(' · ') || '—'}</span>
			</div>
		{/each}
	</div>

	<section class="card siaga-rules">
		<div class="card-h">
			<div style="display:flex;flex-direction:column;gap:3px">
				<span class="label">Ambang tingkat siaga · {on.size}/{RULES.length} aktif</span>
				<span class="pdam-muted">mini-stesy baru punya ambang untuk AWLR & ARR · ini usulan untuk AFMR Wosusokas</span>
			</div>
			<span class="siaga-levels">
				{#each LEVELS.slice(1) as l (l)}<span class="siaga-lv siaga-lv--{l}">{LEVEL_LABEL[l]}</span>{/each}
			</span>
		</div>
		<div class="siaga-scroll">
			<table class="demo-table siaga-table">
				<thead>
					<tr><th>Parameter</th><th>Cakupan</th><th>Waspada</th><th>Siaga</th><th>Awas</th><th>Kondisi kini</th><th>Aktif</th></tr>
				</thead>
				<tbody>
					{#each RULES as r (r.id)}
						{@const hits = hitsOf(r.id)}
						{@const lv = hits.reduce<Level>((a, h) => (LEVELS.indexOf(h.level) > LEVELS.indexOf(a) ? h.level : a), 'normal')}
						<tr class:is-off={!on.has(r.id)}>
							<td><span class="siaga-param"><b>{r.param}</b><small>{r.unit} · {r.note}</small></span></td>
							<td class="siaga-scope">{r.scope}</td>
							{#each ['waspada', 'siaga', 'awas'] as const as l, i (l)}
								<td><span class="siaga-lv siaga-lv--{l} siaga-lv--val">{r.levels[i]}</span></td>
							{/each}
							<td>
								{#if on.has(r.id)}
									<span class="siaga-now" style="--c:{LEVEL_COLOR[lv]}"><i></i><b>{LEVEL_LABEL[lv]}</b><small>{hits.length ? `${hits.length} titik` : 'tidak terpicu'}</small></span>
								{:else}
									<span class="siaga-now siaga-now--off">nonaktif</span>
								{/if}
							</td>
							<td>
								<label class="set-toggle set-toggle--bare">
									<input type="checkbox" checked={on.has(r.id)} onchange={(e) => toggle(r.id, e.currentTarget.checked)} aria-label="Aktifkan aturan {r.param}" />
									<span class="set-switch" aria-hidden="true"></span>
								</label>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<div class="demo-grid-2" style="align-items:start">
		<div class="card">
			<div class="card-h">
				<span class="label">Notifikasi aktif · {alerts.length}</span>
				{#if field.mode === 'skenario'}<span class="spam-badge spam-badge--sim">SIMULASI</span>{:else}<span class="spam-badge">LAPANGAN</span>{/if}
			</div>
			<ul class="notif-list">
				{#each alerts as a (a.l.id + a.rule)}
					<li class="notif-item notif-item--{SEV[a.level]}">
						<span class="status-dot {SEV[a.level]}" style="width:9px;height:9px;margin-top:6px"></span>
						<div class="notif-item__body">
							<div class="notif-item__top">
								<b>{a.l.id}</b>
								<span class="notif-item__sev" style="color:{LEVEL_COLOR[a.level]}">{LEVEL_LABEL[a.level]}</span>
								<span class="notif-item__t">{RESERVOIRS[a.l.reservoir].short}</span>
							</div>
							<div class="notif-item__msg">{ruleOf(a.rule).param}: {a.value} · {a.l.name}</div>
						</div>
					</li>
				{:else}
					<li class="notif-empty">Tidak ada aturan yang terpicu.</li>
				{/each}
			</ul>
		</div>
		<div class="card">
			<div class="card-h"><span class="label">Status per titik</span><span class="pdam-muted">tingkat terburuk dari aturan aktif</span></div>
			<div class="jar-bars">
				{#each rows as r (r.l.id)}
					<div class="jar-bar">
						<span>{r.l.id} · {roleTag(r.l)} <small class="pdam-muted">{r.l.name}</small></span>
						<span class="siaga-now" style="--c:{LEVEL_COLOR[r.level]}"><i></i><b>{LEVEL_LABEL[r.level]}</b></span>
						<a class="demo-btn demo-btn--sm" href="/demo/spam/realtime?id={r.l.id}" aria-label="Realtime {r.l.id}"><Activity size={13} /></a>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
