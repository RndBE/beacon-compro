<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowLeft, Clock, Calendar, Tag, MessageCircle, ArrowRight, ChevronRight, Share2 } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';

	type RelatedArticle = {
		href: string;
		category: string;
		categoryColor: string;
		title: string;
		readTime: string;
	};

	let {
		title,
		description,
		category,
		categoryColor = '#C8102E',
		date,
		readTime,
		tags = [],
		ctaTitle = 'Punya Kebutuhan Serupa?',
		ctaDesc = 'Bicara dengan tim engineer kami untuk solusi yang tepat.',
		ctaButtonLabel = 'Konsultasi',
		ctaWhatsApp = 'https://wa.me/628112850986',
		ctaSecondary = { href: '/solusi', label: 'Lihat Solusi' },
		relatedArticles = [] as RelatedArticle[],
		children
	}: {
		title: string;
		description: string;
		category: string;
		categoryColor?: string;
		date: string;
		readTime: string;
		tags?: string[];
		ctaTitle?: string;
		ctaDesc?: string;
		ctaButtonLabel?: string;
		ctaWhatsApp?: string;
		ctaSecondary?: { href: string; label: string };
		relatedArticles?: RelatedArticle[];
		children: any;
	} = $props();

	let mounted = $state(false);
	let contentVisible = $state(false);

	onMount(() => {
		mounted = true;
		setTimeout(() => contentVisible = true, 300);
	});
</script>

<!-- Article Header: Asymmetric Split (ANTI-CENTER, DESIGN_VARIANCE=8) -->
<section class="relative py-16 lg:py-24 overflow-hidden" style="background: linear-gradient(165deg, #FFFFFF 0%, #FFF5F6 40%, #FBE9EC 100%);">
	<Ornaments variant="hero" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-3xl">
			<!-- Back link -->
			<a href="/wawasan"
				class="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-all hover:text-[#C8102E] hover:gap-3 active:scale-[0.98]"
				style="color: #5C5C5C; opacity: {mounted ? 1 : 0}; transform: translateX({mounted ? 0 : -12}px); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);"
			>
				<ArrowLeft size={14} />
				Kembali ke Wawasan
			</a>

			<!-- Meta -->
			<div class="flex items-center gap-3 mb-4"
				style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;"
			>
				<span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg text-white" style="background: {categoryColor};">{category}</span>
				<span class="text-xs flex items-center gap-1" style="color: #9A9A9A;"><Calendar size={11} /> {date}</span>
				<span class="text-xs flex items-center gap-1" style="color: #9A9A9A;"><Clock size={11} /> {readTime} baca</span>
			</div>

			<!-- Title: Left-aligned -->
			<h1 class="font-heading text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-tight mb-6"
				style="letter-spacing: -0.03em; color: #1A1A1A; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 20}px); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;"
			>
				{title}
			</h1>

			<!-- Description -->
			<p class="text-lg leading-relaxed" style="color: #5C5C5C; max-width: 60ch; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 16}px); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s;">
				{description}
			</p>
		</div>
	</div>
	<div class="absolute bottom-0 left-0 right-0 pointer-events-none" style="transform: translateY(1px);"><svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none" class="w-full h-10"><path d="M0,50 L0,25 Q360,0 720,25 T1440,25 L1440,50 Z" fill="white"/></svg></div>
</section>

<!-- Article Body + Sticky Sidebar -->
<article class="py-12 lg:py-16 bg-white"
	style="opacity: {contentVisible ? 1 : 0}; transform: translateY({contentVisible ? 0 : 24}px); transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-[1fr_280px] gap-12 lg:gap-16">
			<!-- Main Content -->
			<div class="min-w-0 max-w-3xl">
				<div class="prose-beacon space-y-8">
					{@render children()}

					<!-- Tags (mobile only — desktop shows in sidebar) -->
					{#if tags.length > 0}
						<div class="flex flex-wrap items-center gap-2 pt-6 lg:hidden" style="border-top: 1px solid #E5E5E5;">
							<Tag size={12} style="color: #9A9A9A;" />
							{#each tags as tag}
								<span class="text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors hover:bg-[#FBE9EC] hover:text-[#C8102E]" style="background: #FAFAFA; border: 1px solid #E5E5E5; color: #5C5C5C;">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Sticky Sidebar (desktop only) -->
			<aside class="hidden lg:block">
				<div class="sticky top-28 space-y-6">
					<!-- Article Info -->
					<div class="p-5 rounded-2xl" style="background: #FAFAFA; border: 1px solid #E5E5E5;">
						<div class="flex items-center gap-2 mb-4">
							<span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md text-white" style="background: {categoryColor};">{category}</span>
						</div>
						<div class="space-y-3">
							<div class="flex items-center gap-2 text-xs" style="color: #5C5C5C;">
								<Clock size={12} style="color: #9A9A9A;" />
								<span>{readTime} baca</span>
							</div>
							<div class="flex items-center gap-2 text-xs" style="color: #5C5C5C;">
								<Calendar size={12} style="color: #9A9A9A;" />
								<span>{date}</span>
							</div>
						</div>
						{#if tags.length > 0}
							<div class="mt-4 pt-4" style="border-top: 1px solid #E5E5E5;">
								<span class="text-[10px] font-semibold uppercase tracking-widest" style="color: #9A9A9A;">Tags</span>
								<div class="flex flex-wrap gap-1.5 mt-2">
									{#each tags as tag}
										<span class="text-[10px] px-2 py-0.5 rounded-full font-medium" style="background: #FBE9EC; color: #C8102E;">{tag}</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Sidebar CTA -->
					<div class="p-5 rounded-2xl" style="background: rgba(200,16,46,0.03); border: 1px solid rgba(200,16,46,0.08);">
						<span class="text-xs font-bold" style="color: #1A1A1A;">Butuh solusi serupa?</span>
						<p class="text-[11px] mt-1 leading-relaxed" style="color: #5C5C5C;">Bicara langsung dengan tim engineer Beacon.</p>
						<a href={ctaWhatsApp} target="_blank" rel="noopener"
							class="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg text-[11px] font-semibold text-white active:scale-[0.98] transition-transform"
							style="background: #C8102E;">
							<MessageCircle size={12} />
							{ctaButtonLabel}
						</a>
					</div>

					<!-- Related (compact) -->
					{#if relatedArticles.length > 0}
						<div>
							<span class="text-[10px] font-semibold uppercase tracking-widest" style="color: #9A9A9A;">Baca juga</span>
							<div class="mt-2 space-y-2">
								{#each relatedArticles as related}
									<a href={related.href} class="group block p-3 rounded-xl transition-colors hover:bg-[#FAFAFA]" style="border: 1px solid #E5E5E5;">
										<span class="text-[9px] font-semibold uppercase tracking-wider" style="color: {related.categoryColor};">{related.category}</span>
										<span class="block text-xs font-medium mt-0.5 leading-snug group-hover:text-[#C8102E] transition-colors" style="color: #1A1A1A;">{related.title}</span>
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</aside>
		</div>
	</div>
</article>

<!-- CTA: Asymmetric dark split (ANTI-CENTER) -->
<section class="relative py-16 overflow-hidden" style="background: linear-gradient(135deg, #1A1A1A 0%, #2A1015 100%);">
	<Ornaments />
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
			<div>
				<h3 class="font-heading text-xl sm:text-2xl font-bold mb-3 leading-tight" style="color: #FAFAFA;">{ctaTitle}</h3>
				<p class="text-sm leading-relaxed" style="color: #9A9A9A; max-width: 45ch;">{ctaDesc}</p>
			</div>
			<div class="flex flex-col sm:flex-row gap-3">
				<a href={ctaWhatsApp} target="_blank" rel="noopener"
					class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-transform"
					style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 16px rgba(200,16,46,0.35);">
					<MessageCircle size={15} /> {ctaButtonLabel}
				</a>
				<a href={ctaSecondary.href}
					class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
					style="border: 1px solid rgba(255,255,255,0.15); color: #FAFAFA;">
					{ctaSecondary.label} <ArrowRight size={14} />
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Related Articles -->
{#if relatedArticles.length > 0}
<section class="py-12 lg:py-16 bg-white">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center gap-2 mb-6">
			<div class="w-1 h-5 rounded-full" style="background: #C8102E;"></div>
			<span class="font-heading text-lg font-bold" style="color: #1A1A1A;">Baca Juga</span>
		</div>
		<div class="grid md:grid-cols-2 gap-4">
			{#each relatedArticles as related}
				<a href={related.href} class="group p-5 rounded-[16px] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]" style="border: 1px solid #E5E5E5; background: white;">
					<div class="flex items-start gap-4">
						<div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: {related.categoryColor}08; border: 1px solid {related.categoryColor}15;">
							<span class="text-[10px] font-bold" style="color: {related.categoryColor};">{related.category.substring(0,2).toUpperCase()}</span>
						</div>
						<div class="flex-1 min-w-0">
							<span class="text-[10px] font-semibold uppercase tracking-wider" style="color: {related.categoryColor};">{related.category}</span>
							<h4 class="font-heading text-sm font-bold mt-1 leading-snug group-hover:text-[#C8102E] transition-colors" style="color: #1A1A1A;">{related.title}</h4>
							<span class="flex items-center gap-1 text-[11px] mt-2" style="color: #9A9A9A;"><Clock size={10} /> {related.readTime}</span>
						</div>
						<ChevronRight size={14} class="shrink-0 mt-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style="color: #C8102E;" />
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
{/if}
