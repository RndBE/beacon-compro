<script lang="ts">
	// State card per logger: flow, pressure, totalizer, flowmeter health and data age.
	import { LOGGERS, decodeFault, roleTag, type ReservoirId } from './wosusokas';
	import { field, reading, statusOf } from './field.svelte';
	import { ago, fmtClock, fmtNum } from './util';

	let { reservoir, onpick }: { reservoir: ReservoirId; onpick?: (id: string) => void } = $props();

	const PILL = { ok: 'green', warn: 'amber', alarm: 'danger' } as const;
	const pressure = (p1?: number, p2?: number) =>
		p1 == null ? '—' : p2 == null ? `${fmtNum(p1, 2)} bar` : `${fmtNum(p1, 2)} · ${fmtNum(p2, 2)} bar`;
</script>

<div class="pdam-dma-grid">
	{#each LOGGERS.filter((l) => l.reservoir === reservoir) as l (l.id)}
		{@const r = reading(l)}
		{@const s = statusOf(r)}
		{@const faults = r.v.fault ? decodeFault(r.v.fault) : []}
		<button class="card pdam-dma pdam-dma--{s.st}" onclick={() => onpick?.(l.id)} type="button">
			<div class="pdam-dma__head">
				<span class="pdam-dma__role pdam-dma__role--{l.role}">{roleTag(l)}</span>
				<span class="pdam-dma__id">{l.id}</span>
				<span class="pill pill--{PILL[s.st]}" style="font-size:10px;padding:3px 8px">{s.label.toUpperCase()}</span>
			</div>
			<span class="pdam-dma__name">{l.name}</span>
			<div class="pdam-dma__flow">
				<b>{r.v.flow != null ? fmtNum(r.v.flow, 1) : '—'}</b><small>L/s</small>
			</div>
			<dl class="pdam-dma__meta">
				<div><dt>Totalizer</dt><dd>{r.v.tot != null ? `${fmtNum(r.v.tot)} m³` : '—'}</dd></div>
				<div><dt>{l.pressures === 2 ? 'P1 · P2' : 'Tekanan'}</dt><dd>{pressure(r.v.p1, r.v.p2)}</dd></div>
				<div>
					<dt>Flowmeter</dt>
					<dd class:is-warn={faults.length > 0}>{faults.length ? faults[0].replace(' warning', '') : 'Normal'} · {r.v.fm != null ? `${fmtNum(r.v.fm)}%` : '–'}</dd>
				</div>
			</dl>
			<span class="pdam-dma__note">
				{#if field.mode === 'skenario'}
					<span class="spam-badge spam-badge--sim">SIMULASI</span> skenario operasi normal
				{:else if r.t != null}
					data {fmtClock(r.t / 60)} · {ago(field.now - r.t)}
				{:else}
					belum ada data
				{/if}
			</span>
		</button>
	{/each}
</div>
