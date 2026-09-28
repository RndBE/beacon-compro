<script lang="ts">
	// Logger list grouped by type with each logger's live status and value (Realtime, Historis).
	import { ASSETS, TYPE_META, type AssetType } from './data';
	import { live } from './live.svelte';
	import { readLive } from './sim';

	let { selected, onpick }: { selected: string; onpick: (id: string) => void } = $props();

	const TYPES: AssetType[] = ['DMA', 'PT', 'SC', 'RES'];
	const GROUPS = TYPES.map((t) => ({ type: t, items: ASSETS.filter((a) => a.type === t) }));
</script>

<aside class="card rt-picker" aria-label="Pilih logger">
	<span class="label rt-picker__h">Pilih logger · {ASSETS.length}</span>
	{#each GROUPS as g (g.type)}
		<div class="rt-group">
			<span class="rt-group__h" style="--c:{TYPE_META[g.type].color}"><i></i>{TYPE_META[g.type].label}<small>{g.items.length}</small></span>
			<div class="rt-group__items">
				{#each g.items as a (a.id)}
					{@const lr = readLive(a, live.h, live.tick)}
					<button class="rt-item" class:is-on={a.id === selected} onclick={() => onpick(a.id)} aria-pressed={a.id === selected}>
						<span class="status-dot {lr.status}"></span>
						<span class="rt-item__id">{a.id}</span>
						<span class="rt-item__v">{lr.value}</span>
						<span class="rt-item__name">{a.name}</span>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</aside>
