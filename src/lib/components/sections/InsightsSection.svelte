<script lang="ts">
	import { ArrowRight, Clock, TrendingUp } from "@lucide/svelte";
	import { onMount } from "svelte";
	import Ornaments from "$lib/components/Ornaments.svelte";
	import { locale } from "$lib/i18n";
	import { articleCategory, articleExcerpt, articleTitle } from "$lib/homepage-copy";
	import type { ArticleSummary } from "$lib/api";

	let { articles = [] }: { articles: ArticleSummary[] } = $props();

	let visible = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) visible = true;
			},
			{ threshold: 0.2 },
		);
		const el = document.getElementById("wawasan-terbaru");
		if (el) observer.observe(el);
		return () => observer.disconnect();
	});

	let featured = $derived(articles[0] ?? null);
	let sideArticles = $derived(articles.slice(1));
</script>

<!-- SKILL: Replace 3-equal-card grid with featured + side list (asymmetric 7/5 layout) -->
<section
	id="wawasan-terbaru"
	class="relative py-20 lg:py-28 section-offwhite overflow-hidden"
>
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Heading — left-aligned with CTA right -->
		<div
			class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16"
		>
			<div class="space-y-4">
				<div
					class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
					style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);"
				>
					<span
						class="w-1.5 h-1.5 rounded-full"
						style="background: #C8102E;"
					></span>
					{$locale === 'EN' ? 'Insights' : 'Wawasan'}
				</div>
				<h2
					class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter text-zinc-950"
				>
					{$locale === 'EN' ? 'Insights' : 'Wawasan'} <span
						class="text-transparent bg-clip-text"
						style="background-image: linear-gradient(135deg, #FF5F56 0%, #C8102E 50%, #8A0B1F 100%)"
						>{$locale === 'EN' ? 'Latest' : 'Terbaru'}</span
					>
				</h2>
			</div>
			<a
				href="/wawasan"
				class="hidden sm:inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3"
				style="color: #C8102E;"
			>
				{$locale === 'EN' ? 'Read More Insights' : 'Baca Wawasan Lainnya'}
				<ArrowRight size={14} />
			</a>
		</div>

		<!-- Asymmetric layout: Featured article (large) + side list -->
		{#if featured}
		<div class="grid lg:grid-cols-12 gap-6">
			<!-- Featured article — 7 cols -->
			<a
				href={`/wawasan/${featured.slug}`}
				class="lg:col-span-7 group rounded-[20px] overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				style="
					border: 1px solid #E5E5E5;
					opacity: {visible ? 1 : 0};
					transform: translateY({visible ? 0 : 20}px);
					transition: opacity 0.6s ease-out, transform 0.6s ease-out, box-shadow 0.3s;
				"
			>
				<!-- Large thumbnail area -->
				<div class="relative h-64 sm:h-72 overflow-hidden">
					{#if featured.thumbnail}
						<img src={featured.thumbnail} alt={articleTitle(featured, $locale)} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
						<div class="absolute inset-0" style="background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%);"></div>
					{:else}
						<div class="absolute inset-0 flex items-center justify-center" style="background: linear-gradient(135deg, #FBE9EC 0%, #FFF5F6 50%, #FAFAFA 100%);">
							<div class="w-24 h-24 rounded-[24px] flex items-center justify-center" style="background: rgba(200,16,46,0.08); backdrop-filter: blur(8px);">
								<TrendingUp size={40} style="color: #C8102E; opacity: 0.6;" />
							</div>
						</div>
					{/if}
					<!-- Category badge -->
					<div class="absolute top-4 left-4">
						<span class="text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white" style="background: {featured.category_color};">
							{articleCategory(featured, $locale)}
						</span>
					</div>
					<!-- Hover arrow -->
					<div class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
						<ArrowRight size={16} style="color: #C8102E;" />
					</div>
				</div>

				<div class="p-7">
					<h3 class="font-heading text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#C8102E] transition-colors leading-snug">
						{articleTitle(featured, $locale)}
					</h3>
					<p class="text-sm text-[#5C5C5C] leading-relaxed mb-5 max-w-[55ch]">
						{articleExcerpt(featured, $locale)}
					</p>
					<div class="flex items-center gap-4">
						<span class="text-xs text-[#5C5C5C]">{featured.published_at}</span>
						<span class="text-[#E5E5E5]">·</span>
						<span class="flex items-center gap-1 text-xs text-[#5C5C5C]">
							<Clock size={11} />
							{featured.read_time}
						</span>
					</div>
				</div>
			</a>

			<!-- Side articles — 5 cols, stacked -->
			<div class="lg:col-span-5 flex flex-col gap-4">
				{#each sideArticles as article, i}
					<a
						href={`/wawasan/${article.slug}`}
						class="group flex-1 flex flex-col justify-between rounded-[20px] overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
						style="
							border: 1px solid #E5E5E5;
							opacity: {visible ? 1 : 0};
							transform: translateY({visible ? 0 : 20}px);
							transition: opacity 0.6s ease-out {(i + 1) * 0.1}s, transform 0.6s ease-out {(i + 1) * 0.1}s, box-shadow 0.3s;
						"
					>
						<!-- Compact thumbnail -->
						<div class="relative h-32 overflow-hidden">
							{#if article.thumbnail}
								<img src={article.thumbnail} alt={articleTitle(article, $locale)} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
								<div class="absolute inset-0" style="background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);"></div>
							{:else}
								<div class="absolute inset-0 flex items-center justify-center" style="background: linear-gradient(135deg, {article.category_color}08, {article.category_color}15);">
									<div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: {article.category_color}12;">
										<span class="text-lg font-heading font-bold" style="color: {article.category_color};">{articleCategory(article, $locale)?.charAt(0)}</span>
									</div>
								</div>
							{/if}
							<div class="absolute top-3 left-3">
								<span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md text-white" style="background: {article.category_color};">
									{articleCategory(article, $locale)}
								</span>
							</div>
						</div>

						<div class="p-5 flex-1 flex flex-col justify-between">
							<h3 class="font-heading text-base font-bold text-[#1A1A1A] mb-3 group-hover:text-[#C8102E] transition-colors leading-snug">
								{articleTitle(article, $locale)}
							</h3>
							<div class="flex items-center justify-between">
								<span class="text-xs text-[#5C5C5C]">{article.published_at}</span>
								<span class="flex items-center gap-1 text-xs text-[#5C5C5C]">
									<Clock size={11} />
									{article.read_time}
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
		{/if}

		<!-- Mobile CTA -->
		<div class="sm:hidden mt-8 text-center">
			<a
				href="/wawasan"
				class="inline-flex items-center gap-2 text-sm font-semibold"
				style="color: #C8102E;"
			>
				{$locale === 'EN' ? 'Read More Insights' : 'Baca Wawasan Lainnya'}
				<ArrowRight size={14} />
			</a>
		</div>
	</div>
</section>
