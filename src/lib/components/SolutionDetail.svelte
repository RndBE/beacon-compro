<script lang="ts">
	import {
		ArrowRight,
		ArrowLeft,
		ChevronRight,
		MessageCircle,
		AlertTriangle,
		Droplets,
		Cloud,
		Gauge,
		Monitor,
		Activity
	} from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import { locale } from '$lib/i18n';
	import { storageUrl } from '$lib/api';
	import type { SolutionDetailResponse } from '$lib/loaders/solution';

	let { detail }: { detail: SolutionDetailResponse | null } = $props();

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home',
					solutions: 'Solutions',
					badge: 'Solution Ecosystem',
					subs: 'Sub-Solutions',
					products: 'products',
					detail: 'View Details',
					ctaBadge: 'Next Step',
					ctaTitle: 'Start a Project with',
					ctaDesc:
						'Our engineering team will design the right telemetry architecture and calculate your project’s real requirements.',
					consult: 'Consult Beacon',
					other: 'Explore Other Solutions',
					soonTitle: 'Details Coming Soon',
					soonDesc:
						'This solution is not available yet. Our team is preparing the full details — contact us for current information.',
					back: 'Back to Solutions'
				}
			: {
					home: 'Beranda',
					solutions: 'Solusi',
					badge: 'Ekosistem Solusi',
					subs: 'Sub-Solusi',
					products: 'produk',
					detail: 'Lihat Detail',
					ctaBadge: 'Langkah Selanjutnya',
					ctaTitle: 'Mulai Proyek dengan',
					ctaDesc:
						'Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.',
					consult: 'Konsultasi Beacon',
					other: 'Jelajahi Solusi Lain',
					soonTitle: 'Detail Segera Hadir',
					soonDesc:
						'Solusi ini belum tersedia. Tim kami sedang menyiapkan detail lengkapnya — hubungi kami untuk informasi terkini.',
					back: 'Kembali ke Solusi'
				}
	);

	const sol = $derived(detail?.solution ?? null);
	const subs = $derived(detail?.sub_solutions ?? []);
	const color = $derived(sol?.color || '#C8102E');

	const iconMap: Record<string, typeof Droplets> = {
		'water-security': Droplets,
		'weather-climate-intelligence': Cloud,
		'early-warning': AlertTriangle,
		'infrastructure-security': Gauge,
		'digital-monitoring-platform': Monitor
	};
	const SolutionIcon = $derived(iconMap[sol?.slug ?? ''] ?? Activity);
	const iconUrl = $derived(storageUrl(sol?.icon));

	const consultUrl = $derived(
		`https://wa.me/628112632151?text=${encodeURIComponent(
			$locale === 'EN'
				? `Hello Beacon Marketing CS, I would like to consult about ${sol?.name ?? 'Beacon'}.`
				: `Halo CS Marketing Beacon, saya ingin konsultasi tentang ${sol?.name ?? 'Beacon'}.`
		)}`
	);
</script>

<svelte:head>
	<title>{sol ? `${sol.name} — Beacon Engineering` : 'Solusi — Beacon Engineering'}</title>
	<meta name="description" content={sol?.description ?? 'Solusi telemetri Beacon Engineering.'} />
</svelte:head>

{#if sol}
	<!-- Breadcrumb -->
	<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
			<nav class="flex items-center gap-1.5 text-xs flex-wrap" style="color: #9A9A9A;">
				<a href="/" class="hover:text-[#C8102E] transition-colors">{copy.home}</a>
				<ChevronRight size={11} />
				<a href="/solusi" class="hover:text-[#C8102E] transition-colors">{copy.solutions}</a>
				<ChevronRight size={11} />
				<span style="color: {color};" class="font-medium">{sol.name}</span>
			</nav>
		</div>
	</div>

	<!-- Hero -->
	<section class="relative pt-20 pb-16 lg:pt-28 lg:pb-24 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden">
		<div
			class="absolute inset-0 z-0 opacity-[0.03]"
			style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"
		></div>
		<div
			class="absolute top-[12%] right-[8%] w-[340px] h-[340px] rounded-full pointer-events-none animate-breathe"
			style="background: radial-gradient(circle, {color}12 0%, transparent 70%);"
		></div>

		<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="max-w-3xl">
				<div
					class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
					style="background: {color}10; color: {color}; border: 1px solid {color}26;"
				>
					<div class="w-9 h-9 -my-2 -ml-2 rounded-lg flex items-center justify-center" style="background: {color}14;">
						{#if iconUrl}
							<img src={iconUrl} alt="" class="w-4 h-4 object-contain" />
						{:else}
							<svelte:component this={SolutionIcon} size={16} style="color: {color};" />
						{/if}
					</div>
					{copy.badge}
				</div>

				<h1 class="font-heading text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.05] tracking-tighter text-zinc-950 mb-5">
					{sol.name}
				</h1>
				{#if sol.description}
					<p class="text-lg leading-relaxed text-zinc-600 max-w-[55ch]">{sol.description}</p>
				{/if}

				<div class="flex items-center gap-8 mt-10 pt-8 border-t border-[#E5E5E5]">
					<div>
						<p class="font-heading text-3xl font-extrabold tabular-nums" style="color: {color};">{subs.length}</p>
						<p class="text-xs font-medium mt-0.5" style="color: #7A7A7A;">{copy.subs}</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Sub-solution grid -->
	{#if subs.length > 0}
		<section class="relative py-16 lg:py-24 bg-white overflow-hidden">
			<Ornaments />
			<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each subs as sub}
						<a
							href="/solusi/{sol.slug}/{sub.slug}"
							class="group relative rounded-[24px] overflow-hidden bg-white flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
							style="border: 1px solid #E5E5E5;"
						>
							{#if storageUrl(sub.thumbnail)}
								<div class="aspect-[16/10] overflow-hidden bg-zinc-50">
									<img
										src={storageUrl(sub.thumbnail)}
										alt={sub.name}
										class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
										loading="lazy"
									/>
								</div>
							{:else}
								<div class="aspect-[16/10] grid place-items-center" style="background: {color}0d;">
									<svelte:component this={SolutionIcon} size={40} style="color: {color}; opacity: 0.35;" />
								</div>
							{/if}
							<div class="p-6 flex flex-col flex-1">
								<div class="flex items-center gap-2 mb-1.5">
									<span class="font-heading text-lg font-bold" style="color: {color};">{sub.abbreviation || sub.name}</span>
									{#if sub.products_count > 0}
										<span class="text-[10px] px-2 py-0.5 rounded-full font-medium" style="background: {color}10; color: {color};">
											{sub.products_count} {copy.products}
										</span>
									{/if}
								</div>
								<p class="text-sm leading-snug mb-5" style="color: #5C5C5C;">{sub.name}</p>
								<span class="mt-auto inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style="color: {color};">
									{copy.detail} <ArrowRight size={14} />
								</span>
							</div>
						</a>
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
						{copy.ctaTitle} {sol.name}
					</h2>
					<p class="text-lg text-zinc-400 font-medium">{copy.ctaDesc}</p>
				</div>
				<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
					<a
						href={consultUrl}
						target="_blank"
						rel="noopener"
						class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 btn-tactile"
					>
						<MessageCircle size={18} />
						{copy.consult}
					</a>
					<a
						href="/solusi"
						class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile"
						style="border: 1px solid rgba(255,255,255,0.15);"
					>
						<ArrowRight size={18} />
						{copy.other}
					</a>
				</div>
			</div>
		</div>
	</section>
{:else}
	<!-- Graceful fallback (still HTTP 200) -->
	<section class="relative min-h-[70dvh] flex items-center justify-center bg-[#FAFAFA] overflow-hidden">
		<Ornaments variant="dense" />
		<div class="relative z-10 max-w-xl mx-auto px-6 text-center">
			<div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style="background: #FBE9EC;">
				<AlertTriangle size={28} style="color: #C8102E;" />
			</div>
			<h1 class="font-heading text-3xl sm:text-4xl font-extrabold mb-4" style="color: #1A1A1A;">{copy.soonTitle}</h1>
			<p class="text-base leading-relaxed mb-8" style="color: #5C5C5C;">{copy.soonDesc}</p>
			<a
				href="/solusi"
				class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC] btn-tactile"
				style="border: 1.5px solid #E5E5E5; color: #1A1A1A;"
			>
				<ArrowLeft size={15} /> {copy.back}
			</a>
		</div>
	</section>
{/if}
