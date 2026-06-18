<script lang="ts">
	import { SIAGA_ORDER, SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
	import type { AssetKind, MapMarker } from '$lib/ews/types';

	interface Props {
		markers: MapMarker[];
		hiddenKinds: AssetKind[];
		toggleKind: (k: AssetKind) => void;
		reset: () => void;
	}
	let { markers, hiddenKinds, toggleKind, reset }: Props = $props();

	let open = $state(false);

	const KIND_ORDER: AssetKind[] = ['pos', 'longsor', 'sirine', 'shelter', 'op'];
	const KIND_LABEL: Record<AssetKind, string> = {
		pos: 'Pos Pantau',
		longsor: 'Sensor Longsor',
		sirine: 'Sirine EWS',
		shelter: 'Shelter',
		op: 'Aset Operasi',
	};

	const kindRows = $derived(
		KIND_ORDER.map((k) => ({
			key: k,
			label: KIND_LABEL[k],
			count: markers.filter((m) => m.kind === k).length,
		})).filter((r) => r.count > 0),
	);

	const filterCount = $derived(hiddenKinds.length);
</script>

<div class="pointer-events-auto absolute left-3 top-3 z-[615]">
	{#if !open}
		<button
			onclick={() => (open = true)}
			title="Buka legenda & kontrol layer"
			class="flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-medium shadow-lg transition-colors"
			style="background:rgba(10,14,22,0.85);border:1px solid rgba(74,144,196,0.25);color:var(--stesy-ink-muted,#aaa);"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#4a90c4">
				<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
				<line x1="8" y1="2" x2="8" y2="18"></line>
				<line x1="16" y1="6" x2="16" y2="22"></line>
			</svg>
			Layer
			{#if filterCount > 0}
				<span
					class="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold tabular-nums"
					style="background:rgba(74,144,196,0.2);color:#4a90c4"
					>{filterCount} filter</span
				>
			{/if}
		</button>
	{:else}
		<div
			class="w-[240px] overflow-hidden rounded-xl shadow-xl"
			style="background:rgba(10,14,22,0.92);border:1px solid rgba(74,144,196,0.25);"
		>
			<!-- header -->
			<div
				class="flex items-center gap-2 px-3 py-2"
				style="border-bottom:1px solid rgba(74,144,196,0.15);"
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a90c4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
					<line x1="8" y1="2" x2="8" y2="18"></line>
					<line x1="16" y1="6" x2="16" y2="22"></line>
				</svg>
				<span class="text-[10px] font-semibold uppercase tracking-[0.16em]" style="color:var(--stesy-ink-muted,#aaa)">Layer & Legenda</span>
				<div class="ml-auto flex items-center gap-1">
					{#if filterCount > 0}
						<button
							onclick={reset}
							title="Tampilkan semua"
							class="grid h-6 w-6 place-items-center rounded-md transition-colors"
							style="color:var(--stesy-ink-dim,#888)"
						>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="1 4 1 10 7 10"></polyline>
								<path d="M3.51 15a9 9 0 1 0 .49-4.95"></path>
							</svg>
						</button>
					{/if}
					<button
						onclick={() => (open = false)}
						title="Tutup"
						class="grid h-6 w-6 place-items-center rounded-md transition-colors"
						style="color:var(--stesy-ink-dim,#888)"
					>
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
			</div>

			<div class="max-h-[58vh] space-y-3 overflow-y-auto p-3">
				<!-- legenda status -->
				<section>
					<div class="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style="color:var(--stesy-ink-dim,#888)">
						Status
					</div>
					<div class="grid grid-cols-2 gap-x-3 gap-y-1">
						{#each SIAGA_ORDER as s}
							<div class="flex items-center gap-1.5">
								<span class="h-2.5 w-2.5 rounded-full" style="background:{SIAGA_COLOR[s]}"></span>
								<span class="text-[11px]" style="color:var(--stesy-ink-muted,#aaa)">{siagaLabel(s)}</span>
							</div>
						{/each}
					</div>
				</section>

				<!-- layer: jenis aset -->
				<section>
					<div class="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style="color:var(--stesy-ink-dim,#888)">
						Jenis Aset
					</div>
					<div class="flex flex-col gap-0.5">
						{#each kindRows as row (row.key)}
							{@const on = !hiddenKinds.includes(row.key)}
							<button
								onclick={() => toggleKind(row.key)}
								class="group flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-white/5"
							>
								<span
									class="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[4px] border transition-colors"
									style="{on ? 'border-color:#4a90c4;background:rgba(74,144,196,0.2);color:#4a90c4' : 'border-color:rgba(255,255,255,0.15);color:transparent'}"
								>
									{#if on}
										<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12"></polyline>
										</svg>
									{/if}
								</span>
								<span
									class="flex-1 text-left text-[11.5px]"
									style="{on ? 'color:var(--stesy-ink,#e0e0e0)' : 'color:var(--stesy-ink-dim,#888);text-decoration:line-through'}"
								>{row.label}</span>
								<span
									class="font-mono text-[10px] tabular-nums"
									style="{on ? 'color:var(--stesy-ink-muted,#aaa)' : 'color:var(--stesy-ink-dim,#888)'}"
								>{row.count}</span>
							</button>
						{/each}
					</div>
				</section>
			</div>
		</div>
	{/if}
</div>
