<script lang="ts">
	import {
		ArrowRight,
		ArrowLeft,
		Check,
		MessageCircle,
		Download,
		ChevronRight,
		Box,
		Play,
		Droplets,
		Cloud,
		AlertTriangle,
		Gauge,
		Monitor,
		Activity
	} from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import { locale } from '$lib/i18n';
	import { storageUrl } from '$lib/api';
	import { openChat } from '$lib/stores/chat';
	import { mapTrackRecords, type SubSolutionDetailResponse } from '$lib/loaders/sub-solution';

	let { detail }: { detail: SubSolutionDetailResponse | null } = $props();

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home',
					solutions: 'Solutions',
					featured: 'Beacon Solution',
					about: 'About',
					application: 'Applications',
					features: 'Key Features',
					variants: 'Variants & Specs',
					gallery: 'Gallery',
					track: 'Track Record',
					trackTitle: 'Already Deployed At',
					consult: 'Consult',
					datasheet: 'Download Brochure',
					view3d: 'View 3D Model',
					ctaBadge: 'Next Step',
					ctaTitle: 'Start a Project with',
					ctaDesc:
						'Our engineering team will design the right telemetry architecture and calculate your project’s real requirements.',
					otherProducts: 'Explore Other Products',
					soonTitle: 'Details Coming Soon',
					soonDesc:
						'This sub-solution is not available yet. Our team is preparing the full details — contact us for current information.',
					backToSolutions: 'Back to Solutions',
					specs: 'item',
					online: 'Online'
				}
			: {
					home: 'Beranda',
					solutions: 'Solusi',
					featured: 'Solusi Beacon',
					about: 'Tentang',
					application: 'Penerapan',
					features: 'Fitur Unggulan',
					variants: 'Varian & Spesifikasi',
					gallery: 'Galeri',
					track: 'Track Record',
					trackTitle: 'Sudah Terpasang Di',
					consult: 'Konsultasi',
					datasheet: 'Download Brosur',
					view3d: 'Lihat Model 3D',
					ctaBadge: 'Langkah Selanjutnya',
					ctaTitle: 'Mulai Proyek dengan',
					ctaDesc:
						'Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.',
					otherProducts: 'Jelajahi Produk Lain',
					soonTitle: 'Detail Segera Hadir',
					soonDesc:
						'Sub-solusi ini belum tersedia. Tim kami sedang menyiapkan detail lengkapnya — hubungi kami untuk informasi terkini.',
					backToSolutions: 'Kembali ke Solusi',
					specs: 'item',
					online: 'Online'
				}
	);

	const ss = $derived(detail?.sub_solution ?? null);
	const color = $derived(ss?.solution?.color || '#C8102E');
	const solutionName = $derived(ss?.solution?.name ?? copy.solutions);
	const solutionHref = $derived(ss?.solution?.slug ? `/solusi/${ss.solution.slug}` : '/solusi');
	const label = $derived(ss?.abbreviation || ss?.name || '');

	const iconMap: Record<string, typeof Droplets> = {
		'water-security': Droplets,
		'weather-climate-intelligence': Cloud,
		'weather-forecast': Cloud,
		'early-warning': AlertTriangle,
		'infrastructure-security': Gauge,
		'pressure-measurement': Gauge,
		'digital-monitoring-platform': Monitor,
		stesy: Monitor
	};
	const SolutionIcon = $derived(iconMap[ss?.solution?.slug ?? ''] ?? Activity);
	const iconUrl = $derived(storageUrl(ss?.icon));

	const features = $derived(detail?.features ?? []);
	const gallery = $derived(detail?.gallery ?? []);
	const products = $derived(detail?.products ?? []);
	const projects = $derived(mapTrackRecords(detail?.track_records, []));

	const hasApplication = $derived(!!cleanHtml(ss?.application_content));
	const hasSupport = $derived(!!cleanHtml(ss?.support_content));

	function cleanHtml(value: string | null | undefined): string | null {
		const v = value?.trim();
		if (!v || v === '<p></p>' || v === '<p><br></p>') return null;
		return v;
	}

</script>

<svelte:head>
	<title>{ss ? `${label} — ${ss.name} — Beacon Engineering` : 'Beacon Engineering'}</title>
	<meta
		name="description"
		content={ss
			? `${ss.name} (${ss.abbreviation}) — ${solutionName} Beacon Engineering.`
			: 'Beacon Engineering telemetry solutions.'}
	/>
</svelte:head>

{#if ss}
	<!-- Breadcrumb -->
	<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
			<nav class="flex items-center gap-1.5 text-xs flex-wrap" style="color: #9A9A9A;">
				<a href="/" class="hover:text-[#C8102E] transition-colors">{copy.home}</a>
				<ChevronRight size={11} />
				<a href="/solusi" class="hover:text-[#C8102E] transition-colors">{copy.solutions}</a>
				<ChevronRight size={11} />
				<a href={solutionHref} class="hover:text-[#C8102E] transition-colors">{solutionName}</a>
				<ChevronRight size={11} />
				<span style="color: {color};" class="font-medium">{label}</span>
			</nav>
		</div>
	</div>

	<!-- Hero -->
	<section class="relative pt-20 pb-16 lg:pt-28 lg:pb-24 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden">
		<div
			class="absolute inset-0 z-0 opacity-[0.03]"
			style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"
		></div>
		<!-- themed ambient glow -->
		<div
			class="absolute top-[10%] right-[6%] w-[360px] h-[360px] rounded-full pointer-events-none animate-breathe"
			style="background: radial-gradient(circle, {color}12 0%, transparent 70%);"
		></div>

		<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
			<div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
				<div class="space-y-7">
					<div
						class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
						style="background: {color}10; color: {color}; border: 1px solid {color}26;"
					>
						<span class="w-1.5 h-1.5 rounded-full" style="background: {color};"></span>
						{solutionName}
						<span class="mx-1" style="color: {color}; opacity: 0.5;">/</span>
						{copy.featured}
					</div>

					<h1
						class="font-heading text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.05] tracking-tighter text-zinc-950"
					>
						{ss.name}
					</h1>

					<div class="flex items-baseline gap-2 flex-wrap">
						<span class="font-heading text-2xl font-bold" style="color: {color};">{ss.abbreviation}</span>
						<span class="text-base text-zinc-500 font-medium">— {ss.name}</span>
					</div>

					<div class="flex flex-wrap gap-4 pt-2">
						<button
							type="button"
							onclick={openChat}
							class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all btn-tactile"
							style="background: linear-gradient(135deg, {color}, {color}cc); box-shadow: 0 4px 14px {color}40;"
						>
							<MessageCircle size={15} />
							{copy.consult} {ss.abbreviation}
						</button>
						{#if ss.link_3d}
							<a
								href={ss.link_3d}
								target="_blank"
								rel="noopener"
								class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC] btn-tactile"
								style="border: 1.5px solid #E5E5E5; color: #1A1A1A;"
							>
								<Box size={15} />
								{copy.view3d}
							</a>
						{/if}
					</div>
				</div>

				<!-- Themed device visual -->
				<div class="relative flex justify-center">
					<div
						class="relative w-64 h-80 rounded-3xl overflow-hidden animate-on-load"
						style="background: linear-gradient(180deg, {color} 0%, {color}aa 100%); box-shadow: 0 20px 60px {color}33;"
					>
						<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
							{#if iconUrl}
								<img src={iconUrl} alt={ss.name} class="w-12 h-12 mb-4 object-contain brightness-0 invert opacity-90" />
							{:else}
								<svelte:component this={SolutionIcon} size={48} class="mb-4 opacity-80" />
							{/if}
							<span class="font-heading text-3xl font-extrabold">{ss.abbreviation}</span>
							<span class="text-[10px] mt-1 opacity-70 uppercase tracking-widest">Beacon Engineering</span>
							<div class="mt-6 w-full space-y-2">
								<div class="h-1 rounded-full bg-white/20">
									<div class="h-full rounded-full bg-white/80" style="width: 72%;"></div>
								</div>
								<div class="flex justify-between text-xs opacity-80">
									<span>Status</span>
									<span class="flex items-center gap-1">
										<span class="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse-dot"></span>{copy.online}
									</span>
								</div>
							</div>
						</div>
					</div>
					<div
						class="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold"
						style="border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.06); color: {color};"
					>
						{ss.abbreviation}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- About / main content -->
	{#if cleanHtml(ss.main_content) || hasApplication || hasSupport}
		<section class="relative py-16 lg:py-24 bg-white overflow-hidden">
			<Ornaments />
			<div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{#if cleanHtml(ss.main_content)}
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: {color};">
						{copy.about} {ss.abbreviation}
					</span>
					<div class="ss-prose mt-4">
						{@html ss.main_content}
					</div>
				{/if}

				{#if hasSupport}
					<div class="ss-prose mt-6">
						{@html ss.support_content}
					</div>
				{/if}

				{#if hasApplication}
					<div
						class="mt-10 rounded-[24px] p-7 lg:p-9 relative overflow-hidden"
						style="background: linear-gradient(180deg, #FAFAFA 0%, {color}08 100%); border: 1px solid {color}1f;"
					>
						<div class="flex items-center gap-2 mb-4">
							<div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: {color}14;">
								<Check size={16} style="color: {color};" />
							</div>
							<h2 class="font-heading text-lg font-bold" style="color: #1A1A1A;">{copy.application}</h2>
						</div>
						<div class="ss-prose">
							{@html ss.application_content}
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Features (shown only when backend provides them) -->
	{#if features.length > 0}
		<section
			class="relative py-16 lg:py-24 overflow-hidden"
			style="background: linear-gradient(180deg, #FAFAFA 0%, {color}0a 100%);"
		>
			<Ornaments variant="dense" />
			<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="text-center mb-12">
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: {color};">{copy.features}</span>
					<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">
						{$locale === 'EN' ? 'Why' : 'Mengapa'} {ss.abbreviation}
					</h2>
				</div>
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each features as feat}
						<div
							class="group p-6 rounded-2xl bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
							style="border: 1px solid #E5E5E5;"
						>
							<div
								class="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
								style="background: {color}14;"
							>
								{#if storageUrl(feat.icon)}
									<img src={storageUrl(feat.icon)} alt="" class="w-5 h-5 object-contain" />
								{:else}
									<Check size={18} style="color: {color};" />
								{/if}
							</div>
							<h3 class="font-heading text-base font-bold mb-2" style="color: #1A1A1A;">{feat.title}</h3>
							<p class="text-sm leading-relaxed" style="color: #5C5C5C;">{feat.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Products / variants (shown only when backend provides them) -->
	{#if products.length > 0}
		<section class="relative py-16 lg:py-24 bg-white overflow-hidden">
			<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="max-w-2xl mb-12">
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: {color};">{copy.variants}</span>
					<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">
						{ss.abbreviation} — {products.length} {$locale === 'EN' ? 'Variants' : 'Varian'}
					</h2>
				</div>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each products as product}
						<div
							class="group rounded-[24px] overflow-hidden bg-white flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
							style="border: 1px solid #E5E5E5;"
						>
							{#if storageUrl(product.main_image ?? product.thumbnail)}
								<div class="aspect-[4/3] overflow-hidden bg-zinc-50">
									<img
										src={storageUrl(product.main_image ?? product.thumbnail)}
										alt={product.name}
										class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
										loading="lazy"
									/>
								</div>
							{:else}
								<div class="aspect-[4/3] grid place-items-center" style="background: {color}0d;">
									<svelte:component this={SolutionIcon} size={40} style="color: {color}; opacity: 0.4;" />
								</div>
							{/if}
							<div class="p-6 flex flex-col flex-1">
								<h3 class="font-heading text-lg font-bold" style="color: #1A1A1A;">{product.name}</h3>
								{#if product.description}
									<p class="text-sm leading-relaxed mt-2" style="color: #5C5C5C;">{product.description}</p>
								{/if}
								{#if Array.isArray(product.highlight_points) && product.highlight_points.length > 0}
									<ul class="mt-4 space-y-1.5">
										{#each product.highlight_points.slice(0, 4) as point}
											<li class="flex items-start gap-2 text-xs" style="color: #3A3A3A;">
												<Check size={13} style="color: {color};" class="shrink-0 mt-0.5" />
												<span>{point}</span>
											</li>
										{/each}
									</ul>
								{/if}
								{#if product.brochure_pdf}
									<a
										href={storageUrl(product.brochure_pdf)}
										target="_blank"
										rel="noopener"
										class="mt-5 inline-flex items-center gap-2 text-sm font-semibold btn-tactile"
										style="color: {color};"
									>
										<Download size={14} /> {copy.datasheet}
									</a>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Gallery (shown only when backend provides it) -->
	{#if gallery.length > 0}
		<section class="relative py-16 lg:py-20 bg-[#FAFAFA] overflow-hidden border-t border-[#E5E5E5]">
			<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="text-center mb-10">
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: {color};">{copy.gallery}</span>
				</div>
				<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
					{#each gallery as item}
						<figure class="rounded-2xl overflow-hidden bg-white" style="border: 1px solid #E5E5E5;">
							<img src={storageUrl(item.image)} alt={item.caption ?? ss.name} class="w-full h-56 object-cover" loading="lazy" />
							{#if item.caption}
								<figcaption class="px-4 py-3 text-xs" style="color: #5C5C5C;">{item.caption}</figcaption>
							{/if}
						</figure>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Track record (shown only when backend provides it) -->
	{#if projects.length > 0}
		<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
			<Ornaments />
			<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="text-center mb-10">
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: {color};">{copy.track}</span>
					<h2 class="font-heading text-3xl font-bold mt-3" style="color: #1A1A1A;">{copy.trackTitle}</h2>
				</div>
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each projects as proj}
						<div class="p-5 rounded-2xl bg-[#FAFAFA] transition-all hover:-translate-y-0.5" style="border: 1px solid #E5E5E5;">
							<div class="flex items-center gap-2 mb-2">
								<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white tabular-nums" style="background: {color};">
									{proj.year}
								</span>
								<div class="w-1.5 h-1.5 rounded-full bg-[#1B7F3A] animate-pulse-dot"></div>
							</div>
							<h3 class="font-heading text-sm font-bold" style="color: #1A1A1A;">{proj.name}</h3>
							<p class="text-xs mt-1" style="color: #5C5C5C;">{proj.client}</p>
							{#if proj.location}
								<p class="text-[11px] mt-1" style="color: #8A8A8A;">{proj.location}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- CTA -->
	<section class="relative py-20 bg-white">
		<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
			<div
				class="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 sm:p-16 lg:p-20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 group"
				style="box-shadow: 0 40px 80px -20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.05);"
			>
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
					style="background: linear-gradient(135deg, {color}33, transparent 60%);"
				></div>
				<div class="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0" style="background: {color}1a;"></div>

				<div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
					<span
						class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
						style="background: {color}26; color: {color}; border: 1px solid {color}4d;"
					>
						<span class="w-1.5 h-1.5 rounded-full" style="background: {color}; box-shadow: 0 0 10px {color};"></span>
						{copy.ctaBadge}
					</span>
					<h2 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tighter mb-4">
						{copy.ctaTitle} {ss.abbreviation}
					</h2>
					<p class="text-lg text-zinc-400 font-medium">{copy.ctaDesc}</p>
				</div>

				<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
					<button
						type="button"
						onclick={openChat}
						class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 btn-tactile"
					>
						<MessageCircle size={18} />
						{copy.consult} {ss.abbreviation}
					</button>
					<a
						href={solutionHref}
						class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile"
						style="border: 1px solid rgba(255,255,255,0.15);"
					>
						<ArrowRight size={18} />
						{copy.otherProducts}
					</a>
				</div>
			</div>
		</div>
	</section>
{:else}
	<!-- Graceful fallback when backend has no data (still HTTP 200, never a 404) -->
	<section class="relative min-h-[70dvh] flex items-center justify-center bg-[#FAFAFA] overflow-hidden">
		<Ornaments variant="dense" />
		<div class="relative z-10 max-w-xl mx-auto px-6 text-center">
			<div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style="background: #FBE9EC;">
				<AlertTriangle size={28} style="color: #C8102E;" />
			</div>
			<h1 class="font-heading text-3xl sm:text-4xl font-extrabold mb-4" style="color: #1A1A1A;">{copy.soonTitle}</h1>
			<p class="text-base leading-relaxed mb-8" style="color: #5C5C5C;">{copy.soonDesc}</p>
			<div class="flex flex-col sm:flex-row gap-3 justify-center">
				<button
					type="button"
					onclick={openChat}
					class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white btn-tactile"
					style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 14px rgba(200,16,46,0.35);"
				>
					<MessageCircle size={15} /> {copy.consult}
				</button>
				<a
					href="/solusi"
					class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC] btn-tactile"
					style="border: 1.5px solid #E5E5E5; color: #1A1A1A;"
				>
					<ArrowLeft size={15} /> {copy.backToSolutions}
				</a>
			</div>
		</div>
	</section>
{/if}

<style>
	.animate-on-load {
		animation: scaleIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	/* Prose styling for backend-rendered HTML (main_content / application_content) */
	.ss-prose :global(p) {
		color: #4a4a4a;
		font-size: 1.0625rem;
		line-height: 1.75;
		margin-bottom: 1rem;
	}
	.ss-prose :global(p:last-child) {
		margin-bottom: 0;
	}
	.ss-prose :global(strong) {
		color: #1a1a1a;
		font-weight: 700;
	}
	.ss-prose :global(a) {
		color: #c8102e;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.ss-prose :global(ul),
	.ss-prose :global(ol) {
		margin: 1rem 0;
		padding-left: 1.25rem;
		color: #4a4a4a;
		line-height: 1.7;
	}
	.ss-prose :global(ul) {
		list-style: disc;
	}
	.ss-prose :global(ol) {
		list-style: decimal;
	}
	.ss-prose :global(li) {
		margin-bottom: 0.4rem;
	}
	.ss-prose :global(h2),
	.ss-prose :global(h3),
	.ss-prose :global(h4) {
		font-family: var(--font-heading);
		color: #1a1a1a;
		font-weight: 700;
		margin: 1.5rem 0 0.75rem;
		line-height: 1.25;
	}
	.ss-prose :global(h2) {
		font-size: 1.5rem;
	}
	.ss-prose :global(h3) {
		font-size: 1.25rem;
	}
	.ss-prose :global(img) {
		border-radius: 1rem;
		margin: 1.25rem 0;
		max-width: 100%;
		height: auto;
	}

	@media (prefers-reduced-motion: reduce) {
		.animate-on-load {
			animation: none;
		}
	}
</style>
