<script lang="ts">
	// The 12 Wosusokas loggers grouped by reservoir, with each one's state and flow now.
	import { LOGGERS, RESERVOIRS, roleTag, type ReservoirId } from './wosusokas';
	import { field, reading, statusOf } from './field.svelte';
	import { fmtNum } from './util';

	let { selected, onpick }: { selected: string; onpick: (id: string) => void } = $props();

	const GROUPS = (Object.keys(RESERVOIRS) as ReservoirId[]).map((r) => ({ r, items: LOGGERS.filter((l) => l.reservoir === r) }));
</script>

<aside class="card rt-picker" aria-label="Pilih logger">
	<span class="label rt-picker__h">Pilih logger · {LOGGERS.length}</span>
	{#each GROUPS as g (g.r)}
		<div class="rt-group">
			<span class="rt-group__h" style="--c:{RESERVOIRS[g.r].color}"><i></i>{RESERVOIRS[g.r].name}<small>{g.items.length}</small></span>
			<div class="rt-group__items">
				{#each g.items as l (l.id)}
					{@const r = reading(l)}
					{@const s = statusOf(r)}
					<button class="rt-item" class:is-on={l.id === selected} onclick={() => onpick(l.id)} aria-pressed={l.id === selected}>
						<span class="status-dot {s.st}"></span>
						<span class="rt-item__id">{l.id} · {roleTag(l)}</span>
						<span class="rt-item__v">{r.v.flow != null ? `${fmtNum(r.v.flow, 1)} L/s` : '—'}</span>
						<span class="rt-item__name">{l.name}{field.mode === 'lapangan' && s.st !== 'ok' ? ` · ${s.label.toLowerCase()}` : ''}</span>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</aside>
