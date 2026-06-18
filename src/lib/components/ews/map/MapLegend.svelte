<script lang="ts">
	import { statusCounts } from '$lib/ews/stores';
	import { SIAGA_ORDER, SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
</script>

<div
	class="pointer-events-auto absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/80 px-3 py-2 backdrop-blur"
>
	<div class="mb-1.5 text-[9px] font-semibold uppercase tracking-widest" style="color:var(--stesy-ink-dim,#888)">
		Status Pos
	</div>
	<div class="flex flex-col gap-1">
		{#each SIAGA_ORDER as s}
			<div class="flex items-center gap-2">
				<span
					class="h-2 w-2 rounded-full"
					style="background:{SIAGA_COLOR[s]}"
				></span>
				<span class="text-[10.5px]" style="color:var(--stesy-ink-muted,#aaa)">{siagaLabel(s)}</span>
				<span class="ml-auto font-mono text-[10.5px] tabular-nums" style="color:var(--stesy-ink-strong,#e8e8e8)">
					{$statusCounts[s]}
				</span>
			</div>
		{/each}
	</div>
</div>
