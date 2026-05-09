<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ArrowRight, Clock, BookOpen, FileText, Newspaper, Search, ChevronRight, ArrowUpRight } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';

	let { data } = $props();

	let activeTab = $state('semua');
	let searchQuery = $state('');
	let mounted = $state(false);
	let visibleCards = $state<Set<number>>(new Set());
	const tabs = ['semua', 'Studi Kasus', 'Artikel Teknis', 'Berita Produk'];

	const kategoriMap: Record<string, string> = {
		'studi-kasus': 'Studi Kasus',
		'artikel-teknis': 'Artikel Teknis',
		'berita-produk': 'Berita Produk'
	};

	onMount(() => {
		mounted = true;
		const url = new URL(window.location.href);
		const kategori = url.searchParams.get('kategori');
		if (kategori && kategoriMap[kategori]) {
			activeTab = kategoriMap[kategori];
		}

		setupObserver();
		return () => { if (cardObserver) cardObserver.disconnect(); };
	});

	let cardObserver: IntersectionObserver | null = null;

	type ArticleListItem = {
		title: string;
		excerpt: string;
		category: string;
		categoryColor: string;
		readTime: string;
		date: string;
		href: string;
		thumbnail: string | null;
		featured: boolean;
		products: string[];
	};

	type ArticleStatsResponse = {
		total?: number;
		categories?: Record<string, number | string>;
	};

	function setupObserver() {
		if (cardObserver) cardObserver.disconnect();
		visibleCards = new Set();
		cardObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const idx = Number(entry.target.getAttribute('data-idx'));
						setTimeout(() => {
							visibleCards = new Set([...visibleCards, idx]);
						}, idx * 80);
						cardObserver?.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
		);
		// Observe after a tick to let DOM update
		setTimeout(() => {
			document.querySelectorAll('[data-idx]').forEach((el) => cardObserver?.observe(el));
		}, 50);
	}

	$effect(() => {
		const url = $page.url;
		const kategori = url.searchParams.get('kategori');
		if (kategori && kategoriMap[kategori]) {
			activeTab = kategoriMap[kategori];
		} else if (!kategori) {
			activeTab = 'semua';
		}
	});

	// Re-observe when filter changes
	$effect(() => {
		// Access reactivity deps
		filtered();
		if (mounted) setupObserver();
	});

	// Gunakan data artikel dari API
	let articles: ArticleListItem[] = $derived(
		data.articlesResponse?.data 
			? data.articlesResponse.data.map((a: any): ArticleListItem => ({
					title: a.title,
					excerpt: a.excerpt || '',
					category: a.category || 'Berita Produk',
					categoryColor: a.category_color || '#1B7F3A',
					readTime: a.read_time || '5 min',
					date: a.published_at || '',
					href: `/wawasan/${a.slug}`,
					thumbnail: a.thumbnail || null,
					featured: a.is_featured || false,
					products: a.tags || []
			  }))
			: []
	);

	const categoryColors: Record<string, string> = {
		'Studi Kasus': '#C8102E',
		'Artikel Teknis': '#0EA5E9',
		'Berita Produk': '#1B7F3A'
	};

	const statLabels = ['Studi Kasus', 'Artikel Teknis', 'Berita Produk'] as const;

	let articleStats = $derived(
		statLabels.map((label) => {
			const stats = data.articlesResponse?.stats as ArticleStatsResponse | undefined;
			const apiValue = stats?.categories?.[label];
			const fallbackValue = articles.filter((article) => article.category === label).length;
			const value = Number(apiValue ?? fallbackValue);

			return {
				value: Number.isFinite(value) ? value : fallbackValue,
				label,
				color: categoryColors[label]
			};
		})
	);

	const categoryIcons: Record<string, string> = {
		'Studi Kasus': 'SK',
		'Artikel Teknis': 'AT',
		'Berita Produk': 'BP'
	};

	let filtered = $derived(() => {
		let result = activeTab === 'semua' ? articles : articles.filter((a) => a.category === activeTab);
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
		}
		return result;
	});

	let featuredArticles = $derived(articles.filter((a) => a.featured));
	let heroArticles = $derived(
		[
			...featuredArticles,
			...articles.filter((article) => !featuredArticles.some((featured) => featured.href === article.href))
		].slice(0, 2)
	);
</script>

<svelte:head>
	<title>Wawasan — Studi Kasus, Artikel Teknis & Berita — Beacon Engineering</title>
	<meta name="description" content="Studi kasus, artikel teknis, dan berita produk dari Beacon Engineering. Wawasan mendalam tentang telemetri dan monitoring infrastruktur Indonesia." />
</svelte:head>

<!-- Hero: Asymmetric Split Layout (SKILL Rule 3: ANTI-CENTER BIAS) -->
<section class="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FAFAFA] border-b border-[#E5E5E5]">
	<!-- Subtle Grid Pattern -->
	<div class="absolute inset-0 z-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
		<div class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
			<!-- Left: Text Content (7 cols) -->
			<div class="lg:col-span-7" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 24}px); transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);">
				<div class="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 relative overflow-hidden" style="background: rgba(200,16,46,0.06); border: 1px solid rgba(200,16,46,0.12);">
					<BookOpen size={14} style="color: #C8102E;" />
					<span class="text-xs font-mono font-bold uppercase tracking-[0.2em]" style="color: #C8102E;">Wawasan & Riset</span>
				</div>

				<h1 class="font-heading text-5xl sm:text-6xl lg:text-[72px] font-extrabold leading-[1.05] tracking-tighter text-zinc-950 mb-8">
					Dari <span style="color: #C8102E;">Lapangan</span>,<br />
					Untuk Lapangan
				</h1>

				<p class="text-xl leading-relaxed mb-14 font-medium text-zinc-600 max-w-[45ch]">
					Studi kasus implementasi nyata, panduan teknis mendalam, dan berita terbaru dari tim engineer Beacon.
				</p>

				<!-- Stats Row — Bento Data Pills -->
				<div class="flex flex-wrap gap-4 sm:gap-6">
					{#each articleStats as stat, i}
						<div 
							class="flex items-center gap-4 bg-white/60 border border-white px-5 py-3.5 rounded-2xl shadow-sm backdrop-blur-md hover:-translate-y-1 transition-transform"
							style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 16}px); transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) {0.3 + i * 0.1}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) {0.3 + i * 0.1}s;"
						>
							<span class="font-heading text-3xl font-extrabold tabular-nums leading-none tracking-tighter" style="color: {stat.color};">{stat.value}</span>
							<span class="block text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 max-w-[50px] leading-tight">{stat.label}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: Featured Preview Stack (5 cols) -->
			<div class="hidden lg:block lg:col-span-5 relative" style="opacity: {mounted ? 1 : 0}; transform: translateX({mounted ? 0 : 40}px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;">
				<div class="relative w-full h-[400px]">
					<!-- Glow effect -->
					<div class="absolute inset-0 bg-gradient-to-tr from-[#C8102E]/20 to-transparent blur-[60px] rounded-full pointer-events-none"></div>
					
					{#each heroArticles as article, i}
						<a href={article.href}
							class="absolute group block p-6 sm:p-8 rounded-[2rem] w-full sm:w-[420px] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer"
							style="
								background: rgba(255,255,255,0.85); backdrop-filter: blur(24px); 
								border: 1px solid rgba(255,255,255,1); 
								box-shadow: 0 20px 40px -15px rgba(200,16,46,0.15), inset 0 2px 4px rgba(255,255,255,0.8);
								top: {i * 140}px;
								right: {i * 20}px;
								z-index: {10 - i};
							"
						>
							<div class="flex flex-col gap-4">
								<div class="flex items-center justify-between mb-2">
									<div class="flex items-center gap-2">
										<span class="text-[10px] font-mono font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md text-white" style="background: {article.categoryColor || categoryColors[article.category] || '#1B7F3A'};">{article.category}</span>
										<span class="text-[11px] font-medium text-zinc-400">{article.readTime}</span>
									</div>
									<div class="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-[#FBE9EC] group-hover:border-[#C8102E]/20 transition-colors">
										<ArrowUpRight size={14} class="text-zinc-400 group-hover:text-[#C8102E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
									</div>
								</div>
								
								<h3 class="font-heading text-xl font-bold leading-snug group-hover:text-[#C8102E] transition-colors tracking-tight text-zinc-950">{article.title}</h3>
								
								<!-- Micro products pill -->
								<div class="flex flex-wrap gap-1.5 mt-2">
									{#each article.products as prod}
										<span class="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style="background: {article.categoryColor || categoryColors[article.category] || '#1B7F3A'}10; color: {article.categoryColor || categoryColors[article.category] || '#1B7F3A'}; border: 1px solid {article.categoryColor || categoryColors[article.category] || '#1B7F3A'}20;">{prod}</span>
									{/each}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>

</section>

<!-- Filter + Grid Section -->
<section class="relative py-16 lg:py-24 overflow-hidden bg-white">
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

		<!-- Section Header -->
		<div class="flex items-end justify-between mb-10">
			<div>
				<div class="flex items-center gap-2 mb-3">
					<div class="w-1 h-5 rounded-full" style="background: #C8102E;"></div>
					<span class="font-heading text-lg font-bold" style="color: #1A1A1A;">Semua Artikel</span>
				</div>
				<p class="text-sm" style="color: #7A7A7A;">Temukan wawasan teknis dari proyek-proyek nyata di seluruh Indonesia.</p>
			</div>
		</div>

		<!-- Search + Filter Bar -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 p-4 rounded-2xl" style="background: #FAFAFA; border: 1px solid #F0F0F0;">
			<div class="flex flex-wrap gap-2">
				{#each tabs as tab}
					<button
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 btn-tactile"
						style="background: {activeTab === tab ? '#C8102E' : 'transparent'}; color: {activeTab === tab ? 'white' : '#5C5C5C'}; {activeTab === tab ? 'box-shadow: 0 4px 12px rgba(200,16,46,0.2);' : ''}"
						onclick={() => activeTab = tab}
					>
						{tab === 'semua' ? 'Semua' : tab}
					</button>
				{/each}
			</div>

			<div class="relative w-full sm:w-72">
				<Search size={14} class="absolute left-3.5 top-1/2 -translate-y-1/2" style="color: #BFBFBF;" />
				<input
					type="text"
					placeholder="Cari artikel..."
					bind:value={searchQuery}
					class="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
					style="background: white; border: 1px solid #E5E5E5; color: #1A1A1A;"
				/>
			</div>
		</div>

		<!-- Articles: Zig-Zag Layout (SKILL Rule: NO 3-Column Card Layouts) -->
		<div class="space-y-6">
			{#each filtered() as article, i}
				<a
					href={article.href}
					data-idx={i}
					class="group block rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 btn-tactile"
					style="border: 1px solid #E5E5E5; opacity: {visibleCards.has(i) ? 1 : 0}; transform: translateY({visibleCards.has(i) ? 0 : 20}px); transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);"
				>
					<div class="grid md:grid-cols-[280px_1fr]" style="{i % 2 !== 0 ? 'direction: rtl;' : ''}">
						<!-- Thumbnail -->
						<div class="relative h-48 md:h-full min-h-[200px] overflow-hidden" style="direction: ltr; background: linear-gradient(135deg, {article.categoryColor || categoryColors[article.category] || '#1B7F3A'}08, {article.categoryColor || categoryColors[article.category] || '#1B7F3A'}15);">
							{#if article.thumbnail}
								<img
									src={article.thumbnail}
									alt={article.title}
									class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
									loading="lazy"
									decoding="async"
								/>
							{:else}
								<div class="absolute inset-0 flex items-center justify-center">
									<!-- Abstract pattern based on category -->
									<div class="relative">
										<div class="w-20 h-20 rounded-3xl flex items-center justify-center" style="background: {article.categoryColor || categoryColors[article.category] || '#1B7F3A'}12; border: 1px solid {article.categoryColor || categoryColors[article.category] || '#1B7F3A'}20;">
											<span class="text-2xl font-heading font-extrabold" style="color: {article.categoryColor || categoryColors[article.category] || '#1B7F3A'};">{categoryIcons[article.category] || 'AR'}</span>
										</div>
										<!-- Orbiting dot -->
										<div class="absolute -top-2 -right-2 w-4 h-4 rounded-full animate-breathe" style="background: {article.categoryColor || categoryColors[article.category] || '#1B7F3A'}; opacity: 0.3;"></div>
									</div>
								</div>
							{/if}
							<!-- Category badge -->
							<div class="absolute top-4 left-4">
								<span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg text-white" style="background: {article.categoryColor || categoryColors[article.category] || '#1B7F3A'};">{article.category}</span>
							</div>
						</div>

						<!-- Content -->
						<div class="p-6 md:p-8 flex flex-col justify-center" style="direction: ltr;">
							<div class="flex items-center gap-3 mb-3">
								<span class="text-xs" style="color: #9A9A9A;">{article.date}</span>
								<span class="w-1 h-1 rounded-full" style="background: #D9D9D9;"></span>
								<span class="flex items-center gap-1 text-xs" style="color: #9A9A9A;"><Clock size={11} />{article.readTime}</span>
							</div>

							<h3 class="font-heading text-lg md:text-xl font-bold mb-3 group-hover:text-[#C8102E] transition-colors leading-snug" style="color: #1A1A1A;">{article.title}</h3>
							<p class="text-sm leading-relaxed mb-5" style="color: #5C5C5C; max-width: 55ch;">{article.excerpt}</p>

							<div class="flex items-center justify-between">
								<div class="flex gap-1.5">
									{#each (article.products || []).slice(0, 3) as prod}
										<span class="text-[10px] px-2 py-0.5 rounded-full font-medium" style="background: #FAFAFA; border: 1px solid #E5E5E5; color: {article.categoryColor || categoryColors[article.category] || '#1B7F3A'};">{prod}</span>
									{/each}
								</div>
								<span class="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all" style="color: #C8102E;">
									Baca <ChevronRight size={12} class="group-hover:translate-x-1 transition-transform" />
								</span>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- Empty State (SKILL Rule 5) -->
		{#if filtered().length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style="background: #FBE9EC;">
					<Search size={24} style="color: #C8102E; opacity: 0.5;" />
				</div>
				<span class="font-heading text-lg font-bold mb-2" style="color: #1A1A1A;">Tidak ada artikel ditemukan</span>
				<p class="text-sm mb-6" style="color: #9A9A9A; max-width: 40ch;">Coba ubah filter kategori atau gunakan kata kunci yang berbeda</p>
				<button
					class="px-5 py-2.5 rounded-xl text-sm font-medium btn-tactile"
					style="background: #FBE9EC; color: #C8102E; border: 1px solid rgba(200,16,46,0.1);"
					onclick={() => { activeTab = 'semua'; searchQuery = ''; }}
				>
					Reset Filter
				</button>
			</div>
		{/if}
	</div>
</section>

<!-- Newsletter CTA: Left-aligned split (ANTI-CENTER) -->
<section class="relative py-20 overflow-hidden" style="background: linear-gradient(135deg, #1A1A1A 0%, #2A1015 100%);">
	<Ornaments />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-6" style="background: rgba(200,16,46,0.15); color: #E8384F; border: 1px solid rgba(200,16,46,0.2);">
					<Newspaper size={10} />
					Newsletter
				</div>
				<h2 class="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight" style="color: #FAFAFA; letter-spacing: -0.02em;">
					Wawasan Terbaru,<br />Langsung ke Inbox
				</h2>
				<p class="text-sm leading-relaxed" style="color: #9A9A9A; max-width: 45ch;">
					Panduan teknis, studi kasus proyek, dan update produk — dikirim dua kali sebulan. Tanpa spam.
				</p>
			</div>

			<div class="p-6 rounded-2xl" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);">
				<div class="space-y-3">
					<input
						type="email"
						placeholder="Email Anda"
						class="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
						style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #FAFAFA;"
					/>
					<button class="w-full px-6 py-3.5 rounded-xl text-sm font-semibold text-white btn-tactile" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 16px rgba(200,16,46,0.35);">
						Berlangganan Gratis
					</button>
				</div>
				<p class="text-[11px] mt-3" style="color: rgba(255,255,255,0.3);">Bisa unsubscribe kapan saja. Data Anda aman.</p>
			</div>
		</div>
	</div>
</section>
