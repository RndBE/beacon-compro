<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { PUBLIC_API_BASE } from '$env/static/public';
	import logoBeacon from '$lib/assets/logo_be.png';
	import {
		storageUrl,
		type ArticleSummary,
		type SearchResult,
		type SearchResponse,
		type SolutionSummary
	} from '$lib/api';
	import {
		Phone,
		Mail,
		Menu,
		X,
		Search,
		ChevronDown,
		Loader2,
		MessageCircle,
		Droplets,
		Cloud,
		AlertTriangle,
		Gauge,
		Monitor,
		ExternalLink,
		FileText,
		BookOpen,
		Newspaper,
		ArrowRight,
		Building2,
		Target,
		Award,
		Users,
		Command,
		MapPin
	} from '@lucide/svelte';

	let scrollY = $state(0);
	let mobileMenuOpen = $state(false);
	let activeMegaMenu = $state<string | null>(null);
	let scrollProgress = $state(0);
	
	let searchOpen = $state(false);
	let searchQuery = $state('');
	let currentLang = $state('ID');
	let {
		solutions = null,
		latestArticle = null
	}: {
		solutions?: SolutionSummary[] | null;
		latestArticle?: ArticleSummary | null;
	} = $props();

	// Live search state
	let searchResults = $state<SearchResult[]>([]);
	let searchLoading = $state(false);
	let searchError = $state<string | null>(null);
	let activeIndex = $state(-1);
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Icon map for result types
	const typeIconMap: Record<string, typeof Droplets> = {
		'Solusi': Droplets,
		'Sub-Solusi': Monitor,
		'Produk': Gauge,
		'Proyek': MapPin,
		'Wawasan': FileText
	};

	// Color map for result type badges
	const typeColorMap: Record<string, string> = {
		'Solusi': '#C8102E',
		'Sub-Solusi': '#0EA5E9',
		'Produk': '#10B981',
		'Proyek': '#F59E0B',
		'Wawasan': '#6366F1'
	};

	async function performSearch(query: string) {
		if (query.trim().length < 2) {
			searchResults = [];
			searchLoading = false;
			searchError = null;
			return;
		}

		searchLoading = true;
		searchError = null;
		activeIndex = -1;

		try {
			const res = await fetch(
				`${PUBLIC_API_BASE}/search?q=${encodeURIComponent(query.trim())}&limit=12`,
				{ headers: { Accept: 'application/json' } }
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data: SearchResponse = await res.json();
			searchResults = data.results;
		} catch (err) {
			console.error('[Search] Failed:', err);
			searchError = 'Gagal memuat hasil pencarian.';
			searchResults = [];
		} finally {
			searchLoading = false;
		}
	}

	function debouncedSearch(query: string) {
		clearTimeout(debounceTimer);
		if (query.trim().length < 2) {
			searchResults = [];
			searchLoading = false;
			return;
		}
		searchLoading = true;
		debounceTimer = setTimeout(() => performSearch(query), 300);
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		const count = searchResults.length;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = count > 0 ? (activeIndex + 1) % count : -1;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = count > 0 ? (activeIndex - 1 + count) % count : -1;
		} else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < count) {
			e.preventDefault();
			navigateToResult(searchResults[activeIndex]);
		}
	}

	function navigateToResult(result: SearchResult) {
		closeSearch();
		goto(result.href);
	}

	function resultAssetUrl(result: SearchResult): string | null {
		return storageUrl(result.thumbnail || result.icon);
	}

	function updateScroll() {
		scrollY = window.scrollY;
		const docHeight = document.documentElement.scrollHeight - window.innerHeight;
		scrollProgress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
	}

	function openSearch() {
		searchOpen = true;
		document.body.style.overflow = 'hidden';
	}

	function closeSearch() {
		searchOpen = false;
		searchQuery = '';
		searchResults = [];
		searchLoading = false;
		searchError = null;
		activeIndex = -1;
		clearTimeout(debounceTimer);
		document.body.style.overflow = '';
	}

	onMount(() => {
		window.addEventListener('scroll', updateScroll, { passive: true });
		
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				searchOpen ? closeSearch() : openSearch();
			}
			if (e.key === 'Escape' && searchOpen) {
				closeSearch();
			}
		};
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('scroll', updateScroll);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	let closeTimeout: ReturnType<typeof setTimeout>;

	function toggleMegaMenu(menu: string) {
		activeMegaMenu = activeMegaMenu === menu ? null : menu;
	}

	function openMegaMenu(menu: string) {
		clearTimeout(closeTimeout);
		activeMegaMenu = menu;
	}

	function closeMegaMenu() {
		closeTimeout = setTimeout(() => {
			activeMegaMenu = null;
		}, 150);
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
		document.body.style.overflow = '';
	}

	type SolutionCategory = {
		name: string;
		desc: string;
		icon: typeof Droplets;
		items: string[];
		href: string;
	};

	const fallbackSolutionCategories: SolutionCategory[] = [
		{
			name: 'Water Security',
			desc: 'Amankan air & bendungan',
			icon: Droplets,
			items: ['AWLR', 'AWGC', 'AFMR', 'ADR', 'AWQR', 'AVWR'],
			href: '/solusi/water-security'
		},
		{
			name: 'Weather & Climate Intelligence',
			desc: 'Pantau cuaca akurat',
			icon: Cloud,
			items: ['AWR', 'ARR'],
			href: '/solusi/weather-climate-intelligence'
		},
		{
			name: 'Early Warning',
			desc: 'Cegah bencana',
			icon: AlertTriangle,
			items: ['EWS'],
			href: '/solusi/early-warning'
		},
		{
			name: 'Infrastructure Security',
			desc: 'Tekanan presisi tinggi',
			icon: Gauge,
			items: ['APLR'],
			href: '/solusi/infrastructure-security'
		},
		{
			name: 'Digital Monitoring Platform',
			desc: 'Platform monitoring 1-pintu',
			icon: Monitor,
			items: ['Smart Telemetry System'],
			href: '/solusi/digital-monitoring-platform'
		}
	];

	function getSolutionIcon(slug: string): typeof Droplets {
		const iconMap: Record<string, typeof Droplets> = {
			'water-security': Droplets,
			'weather-climate-intelligence': Cloud,
			'weather-forecast': Cloud,
			'early-warning': AlertTriangle,
			'infrastructure-security': Gauge,
			'pressure-measurement': Gauge,
			'digital-monitoring-platform': Monitor,
			'stesy': Monitor
		};

		return iconMap[slug] || Monitor;
	}

	function shortText(value: string | null | undefined, max = 34): string {
		const text = value?.trim();
		if (!text) return 'Solusi telemetri Beacon';
		return text.length > max ? `${text.slice(0, max - 1)}...` : text;
	}

	const solutionCategories = $derived(
		solutions && solutions.length > 0
			? solutions.map((solution) => ({
					name: solution.name,
					desc: shortText(solution.description),
					icon: getSolutionIcon(solution.slug),
					items: (solution.sub_solutions ?? [])
						.map((item) => item.abbreviation || item.name)
						.filter(Boolean)
						.slice(0, 4),
					href: `/solusi/${solution.slug}`
				}))
			: fallbackSolutionCategories
	);

	const popularSolutions = $derived(
		solutionCategories
			.slice(0, 3)
			.map((cat) => (cat.items[0] ? `${cat.items[0]} untuk ${cat.name}` : cat.name))
	);

	const aboutLinks = [
		{ name: 'Profil Perusahaan', desc: 'Sejarah & identitas Beacon', icon: Building2, href: '/tentang-kami', color: '#C8102E' },
		{ name: 'Visi & Misi', desc: 'Arah & tujuan perusahaan', icon: Target, href: '/tentang-kami#visi-misi', color: '#0EA5E9' },
		{ name: 'Sertifikasi', desc: 'ISO, SNI & legalitas resmi', icon: Award, href: '/tentang-kami#sertifikasi', color: '#10B981' },
		{ name: 'Klien & Mitra', desc: 'BBWS, BUMN & institusi', icon: Users, href: '/tentang-kami#klien', color: '#F59E0B' }
	];

	const insightCategories = [
		{ name: 'Studi Kasus', desc: 'Implementasi nyata di lapangan', icon: FileText, href: '/wawasan?kategori=studi-kasus', color: '#C8102E' },
		{ name: 'Artikel Teknis', desc: 'Panduan & standar teknis', icon: BookOpen, href: '/wawasan?kategori=artikel-teknis', color: '#0EA5E9' },
		{ name: 'Berita Produk', desc: 'Update produk & fitur', icon: Newspaper, href: '/wawasan?kategori=berita-produk', color: '#8B5CF6' }
	];

	const fallbackLatestArticle = {
		title: 'ADR Menyelamatkan Bendungan Ciawi',
		category: 'Studi Kasus',
		href: '/wawasan/adr-bendungan-ciawi',
		color: '#C8102E'
	};

	const headerLatestArticle = $derived(
		latestArticle
			? {
					title: latestArticle.title,
					category: latestArticle.category ?? 'Wawasan',
					href: `/wawasan/${latestArticle.slug}`,
					color: latestArticle.category_color || '#C8102E'
				}
			: fallbackLatestArticle
	);

	let mobileAccordion = $state<string | null>(null);

	function toggleMobileAccordion(name: string) {
		mobileAccordion = mobileAccordion === name ? null : name;
	}
</script>

<!-- Scroll Progress Bar -->
<div class="scroll-progress" style="width: {scrollProgress}%"></div>

<!-- Top Utility Bar — SKILL: Cockpit Mode & Liquid Glass -->
<div class="relative z-50 transition-all duration-300 border-b border-white/5" style="background: {scrollY > 50 ? 'rgba(26,26,26,0.85)' : 'linear-gradient(90deg, #1A1A1A 0%, #2D0A10 100%)'}; backdrop-filter: {scrollY > 50 ? 'blur(12px)' : 'none'};">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-9">
		<span class="hidden sm:inline font-mono font-bold tracking-[0.15em] text-[10px] text-zinc-400 uppercase">
			Sistem Telemetri Buatan Indonesia · Sejak 2013
		</span>
		<div class="flex items-center gap-5 text-[11px] font-medium text-zinc-300 ml-auto sm:ml-0">
			<a href="tel:02744986899" class="flex items-center gap-1.5 hover:text-white transition-colors">
				<Phone size={12} class="text-[#C8102E]" />
				<span class="hidden md:inline tabular-nums">(0274) 4986899</span>
			</a>
			<a href="https://wa.me/628112632151" class="flex items-center gap-1.5 hover:text-white transition-colors">
				<MessageCircle size={12} class="text-[#C8102E]" />
				<span class="tabular-nums">CS Marketing +62 811 2632 151</span>
			</a>
			<a href="mailto:info@bejogja.com" class="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
				<Mail size={12} class="text-[#C8102E]" />
				<span>info@bejogja.com</span>
			</a>
		</div>
	</div>
</div>

<!-- Main Header — SKILL: Liquid Glass & Pill Nav -->
<header
	class="sticky top-0 z-40 w-full transition-all duration-300"
	style="
		background: {scrollY > 50 ? 'rgba(255,255,255,0.85)' : '#FFFFFF'};
		backdrop-filter: {scrollY > 50 ? 'blur(24px) saturate(200%)' : 'none'};
		border-bottom: 1px solid {scrollY > 50 ? 'rgba(229,229,229,0.8)' : '#E5E5E5'};
		box-shadow: {scrollY > 50 ? '0 20px 40px -20px rgba(0,0,0,0.05)' : 'none'};
	"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between transition-all duration-300" style="height: {scrollY > 50 ? '64px' : '80px'};">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 shrink-0 group">
				<img src={logoBeacon} alt="Beacon Engineering" class="transition-all duration-300 group-hover:opacity-80" style="height: {scrollY > 50 ? '28px' : '36px'}; width: auto;" />
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden lg:flex items-center gap-0.5">
				<a href="/" class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all {$page.url.pathname === '/' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}">
					Beranda
				</a>

				<!-- Solusi Mega Menu -->
				<div class="relative" role="navigation" onmouseleave={closeMegaMenu} onmouseenter={() => openMegaMenu('solusi')}>
					<button
						class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {$page.url.pathname.startsWith('/solusi') || activeMegaMenu === 'solusi' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}"
						onclick={() => toggleMegaMenu('solusi')}
					>
						Solusi
						<ChevronDown size={14} class="transition-transform duration-300 {activeMegaMenu === 'solusi' ? 'rotate-180 text-zinc-900' : 'text-zinc-400'}" />
					</button>

					{#if activeMegaMenu === 'solusi'}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-[760px] p-8 rounded-[2rem] origin-top animate-in fade-in slide-in-from-top-4 duration-300"
							style="background: rgba(255,255,255,0.98); backdrop-filter: blur(24px); border: 1px solid rgba(229,229,229,0.8); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8);"
							
							role="menu"
						>
							<p class="text-xs font-semibold text-[#5C5C5C] uppercase tracking-widest mb-4">Cari Solusi Berdasarkan Kebutuhan Anda</p>
							<div class="grid grid-cols-3 gap-4 mb-6">
								{#each solutionCategories as cat}
									<a href={cat.href} onclick={closeMegaMenu} class="group p-3 rounded-xl hover:bg-[#FBE9EC] transition-colors" role="menuitem">
										<div class="flex items-center gap-2 mb-1">
											<svelte:component this={cat.icon} size={16} class="text-[#C8102E]" />
											<span class="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors">{cat.name}</span>
										</div>
										<p class="text-xs text-[#5C5C5C] mb-2">{cat.desc}</p>
										<div class="flex flex-wrap gap-1">
											{#each cat.items.slice(0, 3) as item}
												<span class="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#5C5C5C] border border-[#E5E5E5]">{item}</span>
											{/each}
										</div>
									</a>
								{/each}
							</div>

							<div class="border-t border-[#E5E5E5] pt-4 flex justify-between items-start">
								<div>
									<p class="text-xs font-semibold text-[#C8102E] uppercase tracking-wider mb-2">Paling Dicari</p>
									{#each popularSolutions as sol}
										<p class="text-xs text-[#5C5C5C] mb-1">• {sol}</p>
									{/each}
								</div>
								<div class="text-right">
									<p class="text-xs text-[#5C5C5C] mb-2">Butuh konsultasi?</p>
									<a
										href="https://wa.me/628112632151"
										class="inline-flex items-center gap-1 text-xs font-semibold text-[#C8102E] hover:underline"
									>
										<MessageCircle size={12} />
										CS Marketing
									</a>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<a href="/proyek" class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all {$page.url.pathname.startsWith('/proyek') ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}">
					Proyek
				</a>

				<!-- Tentang Kami -->
				<div class="relative" role="navigation" onmouseleave={closeMegaMenu} onmouseenter={() => openMegaMenu('tentang')}>
					<button
						class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {$page.url.pathname.startsWith('/tentang') || activeMegaMenu === 'tentang' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}"
						onclick={() => toggleMegaMenu('tentang')}
					>
						Tentang Kami
						<ChevronDown size={14} class="transition-transform duration-300 {activeMegaMenu === 'tentang' ? 'rotate-180 text-zinc-900' : 'text-zinc-400'}" />
					</button>

					{#if activeMegaMenu === 'tentang'}
						<div
							class="absolute top-[calc(100%+0.5rem)] right-0 w-[360px] p-6 rounded-[2rem] origin-top-right animate-in fade-in slide-in-from-top-4 duration-300"
							style="background: rgba(255,255,255,0.98); backdrop-filter: blur(24px); border: 1px solid rgba(229,229,229,0.8); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8);"
							
							role="menu"
						>
							<p class="text-xs font-semibold text-[#5C5C5C] uppercase tracking-widest mb-3">Perusahaan</p>
							<div class="space-y-1 mb-4">
								{#each aboutLinks as link}
									<a href={link.href} onclick={closeMegaMenu} class="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FBE9EC] transition-colors" role="menuitem">
										<div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background: {link.color}10;">
											<svelte:component this={link.icon} size={16} style="color: {link.color};" />
										</div>
										<div>
											<span class="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors">{link.name}</span>
											<span class="block text-[11px] text-[#9A9A9A]">{link.desc}</span>
										</div>
									</a>
								{/each}
							</div>

							<div class="border-t border-[#E5E5E5] pt-3">
								<a href="/tentang-kami" onclick={closeMegaMenu} class="inline-flex items-center gap-1 text-xs font-semibold text-[#C8102E] hover:underline">
									Selengkapnya Tentang Beacon <ArrowRight size={11} />
								</a>
							</div>
						</div>
					{/if}
				</div>

				<!-- Wawasan -->
				<div class="relative" role="navigation" onmouseleave={closeMegaMenu} onmouseenter={() => openMegaMenu('wawasan')}>
					<button
						class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {$page.url.pathname.startsWith('/wawasan') || activeMegaMenu === 'wawasan' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}"
						onclick={() => toggleMegaMenu('wawasan')}
					>
						Wawasan
						<ChevronDown size={14} class="transition-transform duration-300 {activeMegaMenu === 'wawasan' ? 'rotate-180 text-zinc-900' : 'text-zinc-400'}" />
					</button>

					{#if activeMegaMenu === 'wawasan'}
						<div
							class="absolute top-[calc(100%+0.5rem)] right-0 w-[360px] p-6 rounded-[2rem] origin-top-right animate-in fade-in slide-in-from-top-4 duration-300"
							style="background: rgba(255,255,255,0.98); backdrop-filter: blur(24px); border: 1px solid rgba(229,229,229,0.8); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8);"
							
							role="menu"
						>
							<p class="text-xs font-semibold text-[#5C5C5C] uppercase tracking-widest mb-3">Kategori</p>
							<div class="space-y-1 mb-4">
								{#each insightCategories as cat}
									<a href={cat.href} onclick={closeMegaMenu} class="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FBE9EC] transition-colors" role="menuitem">
										<div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background: {cat.color}10;">
											<svelte:component this={cat.icon} size={16} style="color: {cat.color};" />
										</div>
										<div>
											<span class="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors">{cat.name}</span>
											<span class="block text-[11px] text-[#9A9A9A]">{cat.desc}</span>
										</div>
									</a>
								{/each}
							</div>

							<div class="border-t border-[#E5E5E5] pt-3">
								<p class="text-[10px] font-semibold text-[#C8102E] uppercase tracking-wider mb-2">Terbaru</p>
								<a href={headerLatestArticle.href} onclick={closeMegaMenu} class="group block p-2.5 rounded-lg hover:bg-[#FBE9EC] transition-colors">
									<span class="text-[10px] uppercase tracking-wider" style="color: {headerLatestArticle.color};">{headerLatestArticle.category}</span>
									<span class="block text-sm font-medium text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors mt-0.5">{headerLatestArticle.title}</span>
								</a>
								<a href="/wawasan" onclick={closeMegaMenu} class="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#C8102E] hover:underline">
									Lihat Semua Wawasan <ArrowRight size={11} />
								</a>
							</div>
						</div>
					{/if}
				</div>

				<a href="/kontak" class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all {$page.url.pathname.startsWith('/kontak') ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}">
					Kontak
				</a>
			</nav>

			<!-- Right Actions -->
			<div class="flex items-center gap-3">
				<!-- Language Switcher -->
				<div class="hidden lg:flex items-center p-[3px] rounded-xl bg-zinc-50 border border-zinc-200/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] relative">
					<!-- Active Indicator -->
					<div class="absolute inset-y-[3px] left-[3px] w-[26px] rounded-[8px] bg-white shadow-sm border border-zinc-200/50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" style="transform: translateX({currentLang === 'EN' ? '26px' : '0'});"></div>
					
					<button onclick={() => currentLang = 'ID'} class="relative z-10 w-[26px] h-[22px] flex items-center justify-center text-[10px] font-bold font-mono transition-colors {currentLang === 'ID' ? 'text-[#C8102E]' : 'text-zinc-400 hover:text-zinc-600'}">ID</button>
					<button onclick={() => currentLang = 'EN'} class="relative z-10 w-[26px] h-[22px] flex items-center justify-center text-[10px] font-bold font-mono transition-colors {currentLang === 'EN' ? 'text-[#C8102E]' : 'text-zinc-400 hover:text-zinc-600'}">EN</button>
				</div>

				<button 
					class="hidden lg:flex items-center gap-2 px-3 py-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80" 
					aria-label="Search"
					onclick={openSearch}
				>
					<Search size={16} />
					<span class="text-xs font-medium mr-2">Cari...</span>
					<kbd class="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white border border-zinc-200 text-zinc-400">
						<Command size={10} /> K
					</kbd>
				</button>

				<a
					href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20tertarik%20dengan%20solusi%20telemetri%20Anda."
					class="hidden lg:inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 btn-tactile"
					style="
						background: linear-gradient(135deg, #C8102E 0%, #A50D25 100%);
						border: 1px solid #910B20;
						box-shadow: 0 8px 20px -8px rgba(200,16,46,0.5), inset 0 1px 1px rgba(255,255,255,0.3);
						letter-spacing: -0.01em;
					"
					target="_blank"
					rel="noopener"
				>
					Konsultasi Gratis
				</a>

				<!-- Mobile Menu Button -->
				<button
					class="lg:hidden p-2 text-[#1A1A1A] hover:text-[#C8102E] transition-colors"
					onclick={toggleMobileMenu}
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<X size={24} />
					{:else}
						<Menu size={24} />
					{/if}
				</button>
			</div>
		</div>
	</div>
</header>

<!-- Command Palette Search Overlay -->
{#if searchOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 transition-all duration-300" style="background: rgba(255,255,255,0.4); backdrop-filter: blur(16px);" onclick={closeSearch}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="w-full max-w-2xl bg-white rounded-[2rem] overflow-hidden flex flex-col relative transition-transform duration-300 scale-100" 
			style="box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Liquid Glass Inner Border -->
			<div class="absolute inset-0 border border-white/50 pointer-events-none rounded-[2rem] z-20"></div>

			<!-- Search Input Area -->
			<div class="relative flex items-center px-6 py-5 border-b border-zinc-100">
				{#if searchLoading}
					<Loader2 size={22} class="text-[#C8102E] shrink-0 animate-spin" />
				{:else}
					<Search size={22} class="text-zinc-400 shrink-0" />
				{/if}
				<!-- svelte-ignore a11y_autofocus -->
				<input 
					type="text" 
					class="flex-1 bg-transparent border-none outline-none px-4 text-lg font-heading font-medium text-zinc-900 placeholder:text-zinc-400 focus:ring-0"
					placeholder="Cari solusi, proyek, atau wawasan..."
					bind:value={searchQuery}
					oninput={() => debouncedSearch(searchQuery)}
					onkeydown={handleSearchKeydown}
					autofocus
				/>
				<button class="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100 shrink-0" onclick={closeSearch}>
					<X size={20} />
				</button>
			</div>

			<!-- Search Results Area -->
			<div class="p-4 overflow-y-auto max-h-[50vh] bg-zinc-50/50">
				{#if searchError}
					<!-- Error State -->
					<div class="px-2 py-8 text-center">
						<div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
							<AlertTriangle size={20} class="text-red-400" />
						</div>
						<p class="text-sm font-medium text-zinc-900">{searchError}</p>
						<button 
							class="mt-3 text-xs font-semibold text-[#C8102E] hover:underline"
							onclick={() => performSearch(searchQuery)}
						>
							Coba lagi
						</button>
					</div>
				{:else if searchQuery.trim().length >= 2 && searchLoading && searchResults.length === 0}
					<!-- Loading Skeleton -->
					<div class="space-y-2">
						{#each Array(3) as _, i}
							<div class="flex items-center gap-4 p-3 rounded-xl animate-pulse">
								<div class="w-10 h-10 rounded-[10px] bg-zinc-200 shrink-0"></div>
								<div class="flex-1 space-y-2">
									<div class="h-3.5 bg-zinc-200 rounded-full" style="width: {70 - i * 15}%;"></div>
									<div class="h-2.5 bg-zinc-100 rounded-full w-1/3"></div>
								</div>
							</div>
						{/each}
					</div>
				{:else if searchQuery.trim().length >= 2 && !searchLoading && searchResults.length === 0}
					<!-- Empty State -->
					<div class="px-2 py-8 text-center">
						<div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
							<Search size={20} class="text-zinc-400" />
						</div>
						<p class="text-sm font-medium text-zinc-900">Tidak ditemukan hasil untuk "{searchQuery}"</p>
						<p class="text-xs text-zinc-500 mt-1">Coba kata kunci lain seperti "AWLR", "bendungan", atau "EWS".</p>
					</div>
				{:else if searchResults.length > 0}
					<!-- Grouped Results -->
					{@const grouped = searchResults.reduce<Record<string, typeof searchResults>>((acc, r) => {
						(acc[r.type] = acc[r.type] || []).push(r);
						return acc;
					}, {})}
					{#each Object.entries(grouped) as [type, items]}
						<div class="mb-3">
							<div class="px-2 mb-2 mt-1 flex items-center gap-2">
								<span 
									class="w-1.5 h-1.5 rounded-full" 
									style="background: {typeColorMap[type] || '#71717A'};"
								></span>
								<span class="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-zinc-400">{type}</span>
							</div>
							<div class="space-y-0.5">
								{#each items as result, idx}
									{@const globalIdx = searchResults.indexOf(result)}
									{@const assetUrl = resultAssetUrl(result)}
									<button 
										class="w-full flex items-center gap-4 p-3 rounded-xl border border-transparent transition-all text-left group {activeIndex === globalIdx ? 'bg-white shadow-sm border-zinc-200/60' : 'hover:bg-white hover:shadow-sm hover:border-zinc-200/60'}"
										onclick={() => navigateToResult(result)}
										onmouseenter={() => activeIndex = globalIdx}
									>
										<div 
											class="w-10 h-10 rounded-[10px] bg-white border border-zinc-100 flex items-center justify-center shrink-0 transition-transform {activeIndex === globalIdx ? 'scale-105' : 'group-hover:scale-105'}" 
											style="color: {typeColorMap[result.type] || '#C8102E'};"
										>
											{#if assetUrl}
												<img src={assetUrl} alt="" class="w-full h-full object-cover rounded-[10px]" />
											{:else}
												<svelte:component this={typeIconMap[result.type] || Search} size={18} />
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-sm font-bold text-zinc-900 truncate transition-colors {activeIndex === globalIdx ? 'text-[#C8102E]' : 'group-hover:text-[#C8102E]'}">{result.title}</p>
											{#if result.description}
												<p class="text-[11px] font-medium text-zinc-500 mt-0.5 truncate">{result.description}</p>
											{/if}
										</div>
										<ArrowRight size={14} class="text-zinc-300 transition-all shrink-0 {activeIndex === globalIdx ? 'text-[#C8102E] translate-x-1' : 'group-hover:text-[#C8102E] group-hover:translate-x-1'}" />
									</button>
								{/each}
							</div>
						</div>
					{/each}
				{:else}
					<!-- Default: Quick Links -->
					<div class="px-2 mb-3 mt-1">
						<span class="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-zinc-400">Akses Cepat</span>
					</div>
					<div class="space-y-0.5">
						{#each [
							{ type: 'Solusi', title: 'Water Security', href: '/solusi/water-security', icon: Droplets },
							{ type: 'Solusi', title: 'Early Warning System', href: '/solusi/early-warning', icon: AlertTriangle },
							{ type: 'Proyek', title: 'Lihat Semua Proyek', href: '/proyek', icon: MapPin },
							{ type: 'Wawasan', title: 'Artikel Terbaru', href: '/wawasan', icon: FileText }
						] as link}
							<a href={link.href} onclick={closeSearch} class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200/60 transition-all text-left group">
								<div class="w-10 h-10 rounded-[10px] bg-white border border-zinc-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style="color: {typeColorMap[link.type] || '#C8102E'};">
									<svelte:component this={link.icon} size={18} />
								</div>
								<div class="flex-1">
									<p class="text-sm font-bold text-zinc-900 group-hover:text-[#C8102E] transition-colors">{link.title}</p>
									<p class="text-[11px] font-medium text-zinc-500 mt-0.5">{link.type}</p>
								</div>
								<ArrowRight size={14} class="text-zinc-300 group-hover:text-[#C8102E] group-hover:translate-x-1 transition-all" />
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->

			<div class="px-6 py-3 bg-zinc-100/50 border-t border-zinc-100 flex items-center justify-between text-[11px] font-medium text-zinc-500">
				<div class="flex items-center gap-4">
					<span class="flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-sm">↑↓</kbd> Navigasi</span>
					<span class="flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-sm">Enter</kbd> Pilih</span>
				</div>
				<span class="flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-sm">Esc</kbd> Tutup</span>
			</div>
		</div>
	</div>
{/if}

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
	<div class="fixed inset-0 z-30 bg-white overflow-y-auto lg:hidden" style="top: 0;">
		<div class="pt-[120px] pb-8 px-6">
			<nav class="space-y-1">
				<a href="/" onclick={closeMobileMenu} class="block px-4 py-3 text-base font-semibold text-[#1A1A1A] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-xl transition-colors">
					Beranda
				</a>

				<!-- Mobile: Solusi Accordion -->
				<div>
					<button
						class="w-full flex justify-between items-center px-4 py-3 text-base font-semibold text-[#1A1A1A] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-xl transition-colors"
						onclick={() => toggleMobileAccordion('solusi')}
					>
						Solusi
						<ChevronDown size={16} class="transition-transform duration-200 {mobileAccordion === 'solusi' ? 'rotate-180' : ''}" />
					</button>
					{#if mobileAccordion === 'solusi'}
						<div class="pl-4 space-y-1 mt-1">
							{#each solutionCategories as cat}
								<a href={cat.href} onclick={closeMobileMenu} class="block px-4 py-2 text-sm text-[#5C5C5C] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-lg transition-colors">
									{cat.name}
								</a>
							{/each}
						</div>
					{/if}
				</div>

				<a href="/proyek" onclick={closeMobileMenu} class="block px-4 py-3 text-base font-semibold text-[#1A1A1A] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-xl transition-colors">
					Proyek
				</a>

				<!-- Mobile: Tentang Kami Accordion -->
				<div>
					<button
						class="w-full flex justify-between items-center px-4 py-3 text-base font-semibold text-[#1A1A1A] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-xl transition-colors"
						onclick={() => toggleMobileAccordion('tentang')}
					>
						Tentang Kami
						<ChevronDown size={16} class="transition-transform duration-200 {mobileAccordion === 'tentang' ? 'rotate-180' : ''}" />
					</button>
					{#if mobileAccordion === 'tentang'}
						<div class="pl-4 space-y-1 mt-1">
							{#each aboutLinks as link}
								<a href={link.href} onclick={closeMobileMenu} class="block px-4 py-2 text-sm text-[#5C5C5C] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-lg transition-colors">
									{link.name}
								</a>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Mobile: Wawasan Accordion -->
				<div>
					<button
						class="w-full flex justify-between items-center px-4 py-3 text-base font-semibold text-[#1A1A1A] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-xl transition-colors"
						onclick={() => toggleMobileAccordion('wawasan')}
					>
						Wawasan
						<ChevronDown size={16} class="transition-transform duration-200 {mobileAccordion === 'wawasan' ? 'rotate-180' : ''}" />
					</button>
					{#if mobileAccordion === 'wawasan'}
						<div class="pl-4 space-y-1 mt-1">
							{#each insightCategories as cat}
								<a href={cat.href} onclick={closeMobileMenu} class="block px-4 py-2 text-sm text-[#5C5C5C] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-lg transition-colors">
									{cat.name}
								</a>
							{/each}
							<a href={headerLatestArticle.href} onclick={closeMobileMenu} class="block px-4 py-2 rounded-lg hover:bg-[#FBE9EC] transition-colors">
								<span class="block text-[10px] uppercase tracking-wider" style="color: {headerLatestArticle.color};">{headerLatestArticle.category}</span>
								<span class="block text-sm font-semibold text-[#1A1A1A]">{headerLatestArticle.title}</span>
							</a>
							<a href="/wawasan" onclick={closeMobileMenu} class="block px-4 py-2 text-sm font-semibold hover:bg-[#FBE9EC] rounded-lg transition-colors" style="color: #C8102E;">
								Semua Wawasan →
							</a>
						</div>
					{/if}
				</div>

				<a href="/kontak" onclick={closeMobileMenu} class="block px-4 py-3 text-base font-semibold text-[#1A1A1A] hover:text-[#C8102E] hover:bg-[#FBE9EC] rounded-xl transition-colors">
					Kontak
				</a>
			</nav>

			<!-- Mobile Utility Links -->
			<div class="mt-8 pt-6 border-t border-[#E5E5E5] space-y-3">
				<a href="tel:02744986899" class="flex items-center gap-3 text-sm text-[#5C5C5C]">
					<Phone size={16} class="text-[#C8102E]" />
					(0274) 4986899
				</a>
				<a href="https://wa.me/628112632151" class="flex items-center gap-3 text-sm text-[#5C5C5C]">
					<MessageCircle size={16} class="text-[#C8102E]" />
					CS Marketing +62 811 2632 151
				</a>
				<a href="mailto:info@bejogja.com" class="flex items-center gap-3 text-sm text-[#5C5C5C]">
					<Mail size={16} class="text-[#C8102E]" />
					info@bejogja.com
				</a>
			</div>

			<!-- Mobile CTA -->
			<div class="mt-6">
				<a
					href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20tertarik%20dengan%20solusi%20telemetri%20Anda."
					class="block w-full text-center py-3.5 rounded-xl text-white font-semibold text-sm transition-all"
					style="background: #C8102E; box-shadow: 0 4px 12px rgba(200,16,46,0.2);"
					target="_blank"
					rel="noopener"
				>
					Konsultasi Gratis dengan Engineer Kami
				</a>
			</div>
		</div>
	</div>
{/if}

<style>
	.glass-top-bar {
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
</style>
