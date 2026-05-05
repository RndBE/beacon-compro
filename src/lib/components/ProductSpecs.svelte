<script lang="ts">
	import { Download, X, ZoomIn } from '@lucide/svelte';

	let {
		variants,
		activeVariant = 0,
		accentColor = '#C8102E'
	}: {
		variants: any[];
		activeVariant: number;
		accentColor?: string;
	} = $props();

	let activeComponent = $state(0);
	let previewImage = $state<string | null>(null);

	// Reset active component when variant changes
	$effect(() => {
		activeVariant;
		activeComponent = 0;
		previewImage = null;
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') previewImage = null;
	}}
/>

{#if variants[activeVariant]?.components?.length > 0}
	<!-- Component Tabs -->
	<div class="flex gap-2 flex-wrap">
		{#each variants[activeVariant].components as comp, ci}
			<button
				onclick={() => activeComponent = ci}
				class="group flex items-center gap-2.5 px-5 py-3 rounded-2xl text-left transition-all duration-300 cursor-pointer {activeComponent === ci ? 'bg-zinc-900 text-white shadow-lg -translate-y-0.5' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}"
			>
				<span class="w-2 h-2 rounded-full shrink-0" style={activeComponent === ci ? `background: ${accentColor}` : 'background: #D4D4D8'}></span>
				<span class="text-sm font-bold">{comp.name}</span>
				<span class="text-[10px] uppercase tracking-wider font-semibold {activeComponent === ci ? 'text-zinc-400' : 'text-zinc-400'}">{comp.type}</span>
			</button>
		{/each}
	</div>

	<!-- Component Images — only render when at least one valid image URL exists -->
	{#if [variants[activeVariant].components[activeComponent]?.image_1, variants[activeVariant].components[activeComponent]?.image_2].some(img => img && String(img).trim() !== '')}
		<div class="flex gap-3 mt-4 component-images-row">
			{#each [variants[activeVariant].components[activeComponent]?.image_1, variants[activeVariant].components[activeComponent]?.image_2].filter(img => img && String(img).trim() !== '') as img}
				<button
					type="button"
					onclick={() => previewImage = img}
					class="group/image relative flex-1 h-36 rounded-2xl overflow-hidden bg-transparent border border-zinc-200 flex items-center justify-center p-4 component-image-card cursor-zoom-in transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-950/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
					style="--tw-ring-color: {accentColor};"
					aria-label="Lihat gambar penuh"
				>
					<img
						src={img}
						alt=""
						class="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover/image:scale-105"
						onerror={(e) => {
							const card = (e.currentTarget as HTMLElement).closest('.component-image-card');
							if (card) (card as HTMLElement).style.display = 'none';
							// Hide entire row if all cards are now hidden
							const row = (e.currentTarget as HTMLElement).closest('.component-images-row');
							if (row) {
								const visibleCards = row.querySelectorAll('.component-image-card:not([style*="display: none"])');
								if (visibleCards.length === 0) (row as HTMLElement).style.display = 'none';
							}
						}}
					/>
					<span class="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/80 text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover/image:opacity-100">
						<ZoomIn size={15} />
					</span>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Specs by Category -->
	{#key activeComponent}
		<div class="space-y-4 mt-4 animate-in fade-in duration-300">
			{#each variants[activeVariant].components[activeComponent]?.specs ?? [] as specGroup}
				<div class="rounded-2xl overflow-hidden border border-zinc-200 bg-white">
					<div class="px-5 py-3 bg-zinc-50 border-b border-zinc-200">
						<span class="text-xs font-bold uppercase tracking-widest text-zinc-500">{specGroup.category}</span>
					</div>
					{#each specGroup.items as item, idx}
						<div class="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 transition-colors hover:bg-zinc-50/80 {idx !== specGroup.items.length - 1 ? 'border-b border-zinc-100' : ''}">
							<span class="text-sm font-medium text-zinc-500 mb-1 sm:mb-0">{item.name}</span>
							<span class="text-sm font-semibold font-mono text-zinc-950 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 max-w-[55%] text-right">{item.value}</span>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{/key}
{:else if variants[activeVariant]?.specs?.length > 0}
	<!-- Fallback: simple highlight specs -->
	<div class="rounded-[2rem] overflow-hidden border border-[#E5E5E5] bg-white shadow-sm">
		{#each variants[activeVariant].specs as spec, idx}
			<div class="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 transition-colors hover:bg-[#FAFAFA] {idx !== variants[activeVariant].specs.length - 1 ? 'border-b border-[#E5E5E5]' : ''}">
				<span class="text-sm font-medium text-zinc-500 mb-1 sm:mb-0">{spec.label}</span>
				<span class="text-sm font-semibold font-mono text-zinc-950 bg-zinc-50 px-3 py-1.5 rounded-xl border border-[#E5E5E5]">{spec.value}</span>
			</div>
		{/each}
	</div>
{/if}

{#if variants[activeVariant]?.brochure_pdf}
	<div class="pt-4">
		<a href={variants[activeVariant].brochure_pdf} target="_blank" rel="noopener" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 btn-tactile" style="background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); color: {accentColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
			<Download size={16} />
			Download Brosur {variants[activeVariant].name}
		</a>
	</div>
{/if}

{#if previewImage}
	<div
		class="fixed inset-x-0 bottom-0 top-[68px] z-[1000] flex items-center justify-center bg-zinc-950/85 px-4 py-6 backdrop-blur-md sm:top-[68px] lg:top-[68px]"
		role="dialog"
		aria-modal="true"
		onclick={() => previewImage = null}
	>
		<button
			type="button"
			class="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
			aria-label="Tutup preview gambar"
			onclick={(event) => {
				event.stopPropagation();
				previewImage = null;
			}}
		>
			<X size={20} />
		</button>

		<div class="max-h-[calc(100vh-120px)] max-w-6xl rounded-[2rem] bg-white p-4 shadow-2xl" onclick={(event) => event.stopPropagation()}>
			<img src={previewImage} alt="" class="max-h-[calc(100vh-160px)] max-w-full object-contain mix-blend-multiply" />
		</div>
	</div>
{/if}
