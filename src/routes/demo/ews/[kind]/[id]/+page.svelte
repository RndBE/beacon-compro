<script lang="ts">
	import { page } from '$app/stores';
	import { data } from '$lib/ews/stores';
	import { goto } from '$app/navigation';
	import type { AssetKind } from '$lib/ews/types';
	import AssetDetailPage from '$lib/components/ews/views/AssetDetailPage.svelte';

	const kind = $derived($page.params.kind as AssetKind);
	const id = $derived($page.params.id);

	const asset = $derived.by(() => {
		const d = $data;
		const k = kind;
		const aid = id;
		if (k === 'pos') return d.pos.find((x) => x.id === aid) ?? null;
		if (k === 'longsor') return d.longsor.find((x) => x.id === aid) ?? null;
		if (k === 'sirine') return d.sirens.find((x) => x.id === aid) ?? null;
		if (k === 'shelter') return d.shelters.find((x) => x.id === aid) ?? null;
		if (k === 'op') return d.op.find((x) => x.id === aid) ?? null;
		return null;
	});
</script>

{#if asset}
	<AssetDetailPage {asset} {kind} />
{:else}
	<div class="flex flex-col items-center justify-center gap-4 py-24 text-center">
		<div class="text-[14px] font-semibold text-ink-muted">Aset tidak ditemukan</div>
		<p class="text-[11px] text-ink-dim">
			Jenis <code class="rounded bg-panel px-1">{kind}</code> ID
			<code class="rounded bg-panel px-1">{id}</code> tidak ada dalam data.
		</p>
		<button
			onclick={() => goto('/demo/ews/ringkasan')}
			class="rounded-lg border border-line bg-panel px-4 py-2 text-[12px] text-ink-muted hover:text-ink-strong"
		>
			Kembali ke Ringkasan
		</button>
	</div>
{/if}
