<script lang="ts">
	import { Check, Download, Package } from '@lucide/svelte';
	import { locale } from '$lib/i18n';

	let {
		variants,
		productName = 'Produk'
	}: {
		variants: any[];
		productName?: string;
	} = $props();

	let activeVariant = $state(0);
	let activeSpecComponent = $state(0);
	const copy = $derived(
		$locale === 'EN'
			? {
					product: 'Product',
					variantSystem: 'Variant System',
					fieldReady: 'Field Ready',
					variantTitle: 'variants for every station profile',
					variantDescription:
						'Choose a configuration based on measurement needs, data interval, access conditions, and field characteristics.',
					selectSensor: 'Select Logger / Sensor',
					component: 'Component',
					summary: 'Product Summary',
					summaryDescription: 'Displaying product specification summary.',
					suitableFor: 'Suitable For',
					defaultUse: 'Various field requirements',
					downloadBrochure: 'Download Brochure',
					productBay: 'Product Bay',
					imageAlt: 'Variant',
					imageComingSoon: 'Image Coming Soon',
					technicalSpecs: 'Technical Specifications',
					category: 'category',
					specsUnavailable: 'Specifications are not available in the CMS yet.',
					specHighlights: 'Spec Highlights'
				}
			: {
					product: 'Produk',
					variantSystem: 'Variant System',
					fieldReady: 'Field Ready',
					variantTitle: 'untuk tiap karakter pos',
					variantDescription:
						'Pilih konfigurasi berdasarkan kebutuhan pengukuran, interval data, kondisi akses, dan karakter lapangan.',
					selectSensor: 'Pilih Logger / Sensor',
					component: 'Komponen',
					summary: 'Ringkasan Produk',
					summaryDescription: 'Menampilkan ringkasan spesifikasi produk.',
					suitableFor: 'Cocok Untuk',
					defaultUse: 'Berbagai kebutuhan lapangan',
					downloadBrochure: 'Download Brosur',
					productBay: 'Product Bay',
					imageAlt: 'Varian',
					imageComingSoon: 'Gambar Menyusul',
					technicalSpecs: 'Spesifikasi Teknis',
					category: 'kategori',
					specsUnavailable: 'Spesifikasi belum tersedia di CMS.',
					specHighlights: 'Highlight Spek'
				}
	);

	const countComponentSpecs = (component: any) =>
		(component.specs ?? []).reduce(
			(total: number, group: any) => total + (group.items?.length ?? 0),
			0
		);

	const activeProduct = $derived(variants[activeVariant] ?? variants[0]);
	const activeSpecs = $derived(activeProduct?.specs ?? []);
	const activeComponents = $derived(activeProduct?.components ?? []);
	const showcaseComponents = $derived(activeComponents.slice(0, 2));
	const selectedSpecComponent = $derived(
		activeComponents[activeSpecComponent] ?? activeComponents[0] ?? null
	);
	const fallbackSpecGroups = $derived(
		activeSpecs.length > 0
			? [
					{
						category: copy.summary,
						items: activeSpecs.map((spec: any) => ({
							name: spec.label,
							value: spec.value
						}))
					}
				]
			: []
	);
	const displaySpecGroups = $derived(
		selectedSpecComponent?.specs?.length > 0
			? selectedSpecComponent.specs
			: fallbackSpecGroups
	);
	const displaySpecs = $derived(
		displaySpecGroups.flatMap((group: any) =>
			(group.items ?? []).map((item: any) => ({
				label: item.name,
				value: item.value,
				meta: group.category
			}))
		)
	);
	const heroStats = $derived(displaySpecs.slice(0, 4));

	$effect(() => {
		activeVariant;
		activeSpecComponent = 0;
	});
</script>

<section class="relative overflow-hidden bg-[#080B10] py-20 lg:py-28">
	<div
		class="absolute inset-0 opacity-[0.07]"
		style="background-image: radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px); background-size: 28px 28px;"
	></div>
	<div class="absolute inset-x-0 top-0 h-px bg-white/10"></div>
	<div class="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div
			class="variant-dossier overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#10141B] p-5 shadow-[0_34px_90px_-46px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8 lg:p-12"
		>
			<div class="relative z-10 flex flex-col gap-8">
				<div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
					<div
						class="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500"
					>
						<span>Beacon Engineering</span>
						<span class="h-1 w-1 rounded-full bg-zinc-700"></span>
						<span>{productName} {copy.variantSystem}</span>
					</div>
					<div
						class="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
					>
						<span class="relative flex h-3 w-3">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-35"
							></span>
							<span class="relative inline-flex h-3 w-3 rounded-full bg-emerald-400"></span>
						</span>
						{copy.fieldReady}
					</div>
				</div>

				<div
					class="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end"
				>
					<div>
						<h2
							class="font-heading text-4xl font-extrabold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl"
						>
							{productName} {copy.variantTitle}
						</h2>
						<p class="mt-5 max-w-[52ch] text-base font-medium leading-relaxed text-zinc-400">
							{copy.variantDescription}
						</p>
					</div>

					<div class="grid gap-3 sm:grid-cols-2">
						{#each variants as v, i}
							<button
								type="button"
								onclick={() => (activeVariant = i)}
								class="group relative overflow-hidden rounded-[1.35rem] border px-5 py-4 text-left transition-all duration-300 active:scale-[0.98] {activeVariant ===
								i
									? 'border-[#C8102E]/70 bg-[#C8102E] text-white shadow-[0_22px_42px_-26px_rgba(200,16,46,0.8)]'
									: 'border-white/10 bg-white/[0.035] text-zinc-500 hover:border-white/20 hover:bg-white/[0.065] hover:text-white'}"
							>
								<div class="mb-4 flex items-center justify-between">
									<span class="font-mono text-[11px] font-bold uppercase tracking-[0.24em]"
										>{String(i + 1).padStart(2, '0')}</span
									>
									<span
										class="h-2 w-2 rounded-full {activeVariant === i
											? 'bg-white'
											: 'bg-zinc-700 group-hover:bg-[#C8102E]'}"
									></span>
								</div>
								<span class="block font-heading text-2xl font-extrabold tracking-tight">{v.name}</span>
								<span class="mt-1 block text-xs font-bold uppercase tracking-[0.18em] opacity-70"
									>{v.subtitle || `${productName} Variant`}</span
								>
							</button>
						{/each}
					</div>
				</div>

				{#key activeVariant}
					<div class="variant-showcase grid gap-5">
						<div class="grid gap-5 lg:grid-cols-[minmax(280px,0.42fr)_minmax(0,1fr)]">
							<aside
								class="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[#080B10]/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] lg:p-8"
							>
								<div>
									<div
										class="mb-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500"
									>
										<span>Beacon Engineering</span>
										<span class="h-1 w-1 rounded-full bg-zinc-700"></span>
										<span>{productName}</span>
									</div>
									<h3
										class="font-heading text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl"
									>
										{productName}
									</h3>
									<p class="mt-4 text-base font-medium leading-relaxed text-zinc-400">
										{activeProduct?.name}
									</p>
								</div>

								<div
									class="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
								>
									<div class="mb-4 flex items-center justify-between gap-4">
										<span
											class="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500"
											>{copy.selectSensor}</span
										>
										<span class="font-mono text-[11px] font-bold text-zinc-600"
											>{displaySpecs.length} item</span
										>
									</div>
									{#if activeComponents.length > 0}
										<div class="grid gap-2">
											{#each activeComponents as component, ci}
												<button
													type="button"
													onclick={() => (activeSpecComponent = ci)}
													class="group rounded-2xl border px-4 py-3 text-left transition-all duration-300 active:scale-[0.98] {activeSpecComponent ===
													ci
														? 'border-[#C8102E]/70 bg-[#C8102E] text-white'
														: 'border-white/10 bg-[#080B10]/45 text-zinc-500 hover:border-white/20 hover:bg-white/[0.055] hover:text-white'}"
												>
													<span class="flex items-start justify-between gap-4">
														<span>
															<span class="block font-heading text-base font-extrabold tracking-tight"
																>{component.name}</span
															>
															<span
																class="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] opacity-70"
																>{component.type || copy.component}</span
															>
														</span>
														<span class="font-mono text-[11px] font-bold opacity-70"
															>{countComponentSpecs(component)}</span
														>
													</span>
												</button>
											{/each}
										</div>
									{:else}
										<div
											class="rounded-2xl border border-white/10 bg-[#080B10]/45 px-4 py-3 text-sm font-semibold text-zinc-500"
										>
											{copy.summaryDescription}
										</div>
									{/if}
								</div>

								<div class="rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-5 py-4">
									<div class="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500">
										{copy.suitableFor}
									</div>
									<div class="text-sm font-extrabold text-white">
										{activeProduct?.use || copy.defaultUse}
									</div>
								</div>

								{#if activeProduct?.brochure_pdf}
									<a
										href={activeProduct.brochure_pdf}
										target="_blank"
										rel="noopener"
										class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3.5 text-sm font-extrabold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
									>
										<Download size={16} />
										{copy.downloadBrochure}
									</a>
								{/if}
							</aside>

							<div
								class="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#151922] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6 lg:p-8"
							>
								<div
									class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_4%,rgba(200,16,46,0.20),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_42%)]"
								></div>
								<div
									class="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.06),transparent)] variant-sheen"
								></div>

								<div class="relative z-10 flex min-h-[500px] flex-col gap-5">
									<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
										<div>
											<div
												class="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500"
											>
												{copy.productBay}
											</div>
											<div
												class="mt-2 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
											>
												{activeProduct?.name}
											</div>
											<p class="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-zinc-400">
												{activeProduct?.desc}
											</p>
										</div>
									</div>

									<div class="grid flex-1 gap-4 md:grid-cols-2">
										{#if showcaseComponents.length > 0}
											{#each showcaseComponents as comp, ci}
												<div
													class="flex min-h-[320px] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-[#080B10]/55 p-5 transition-transform duration-500 hover:-translate-y-1"
												>
													<div
														class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500"
													>
														<span
															class="grid h-9 w-9 place-items-center rounded-full border border-[#C8102E] text-sm text-white"
															>{ci + 1}</span
														>
														<span>{comp.type || copy.component} · {comp.name}</span>
													</div>
													{#if comp.image_1 || comp.image_2}
														<img
															src={comp.image_1 || comp.image_2}
															alt={comp.name}
															class="mx-auto max-h-[280px] w-full object-contain drop-shadow-[0_30px_28px_rgba(0,0,0,0.42)] transition-transform duration-700 hover:scale-[1.04]"
														/>
													{:else}
														<div class="grid flex-1 place-items-center text-zinc-600">
															<Package size={46} />
														</div>
													{/if}
												</div>
											{/each}
										{:else if activeProduct?.image}
											<div
												class="md:col-span-2 grid min-h-[400px] place-items-center rounded-[1.5rem] border border-white/10 bg-[#080B10]/55 p-8"
											>
												<img
													src={activeProduct.image}
													alt="{copy.imageAlt} {activeProduct.name}"
													class="max-h-[390px] w-full object-contain drop-shadow-[0_38px_34px_rgba(0,0,0,0.48)] transition-transform duration-700 hover:scale-[1.035]"
												/>
											</div>
										{:else}
											<div
												class="md:col-span-2 grid min-h-[400px] place-items-center rounded-[1.5rem] border border-white/10 bg-[#080B10]/55 p-8 text-center"
											>
												<div>
													<Package size={48} class="mx-auto mb-3 text-zinc-700" />
													<span class="text-xs font-bold uppercase tracking-[0.28em] text-zinc-600"
														>{copy.imageComingSoon}</span
													>
												</div>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>

						<div
							class="rounded-[2rem] border border-white/10 bg-[#080B10]/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] sm:p-6 lg:p-8"
						>
							<div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
								<div>
									<div
										class="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500"
									>
										{copy.technicalSpecs}
									</div>
									<h4
										class="mt-1 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
									>
										{selectedSpecComponent?.name ?? activeProduct?.name}
									</h4>
								</div>
								<div class="flex flex-wrap gap-3">
									<span
										class="w-fit rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500"
									>
										{displaySpecs.length} item
									</span>
									<span
										class="w-fit rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500"
									>
										{displaySpecGroups.length} {copy.category}
									</span>
								</div>
							</div>

							{#if displaySpecGroups.length > 0}
								<div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
									{#each displaySpecGroups as group}
										<div class="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-5">
											<div
												class="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4D6D]"
											>
												{group.category}
											</div>
											<div class="divide-y divide-white/10">
												{#each group.items ?? [] as item}
													<div
														class="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-4"
													>
														<span
															class="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500"
															>{item.name}</span
														>
														<span
															class="font-mono text-sm font-bold leading-snug text-zinc-100 sm:text-right"
															>{item.value}</span
														>
													</div>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div
									class="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm font-semibold text-zinc-500"
								>
									{copy.specsUnavailable}
								</div>
							{/if}
						</div>

						<div>
							<div class="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-zinc-500">
								{copy.specHighlights}
							</div>
							<div class="grid gap-3 lg:grid-cols-[1.25fr_0.8fr_1fr_0.95fr]">
								{#each heroStats as spec}
									<div
										class="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
									>
										<div
											class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#080B10]/70 text-[#FF4D6D]"
										>
											<Check size={18} />
										</div>
										<div class="font-heading text-lg font-extrabold text-white">
											{spec.value}
										</div>
										<div class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
											{spec.label}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/key}
			</div>
		</div>
	</div>
</section>

<style>
	.variant-showcase {
		animation: variantRise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.variant-sheen {
		animation: variantSheen 6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
		transform: translateX(-140%);
	}

	@keyframes variantRise {
		from {
			opacity: 0;
			transform: translateY(22px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes variantSheen {
		0%,
		38% {
			transform: translateX(-140%);
		}
		72%,
		100% {
			transform: translateX(140%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.variant-showcase,
		.variant-sheen {
			animation: none;
			transform: none;
		}
	}
</style>
