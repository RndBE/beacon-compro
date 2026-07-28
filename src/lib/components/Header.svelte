<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { PUBLIC_API_BASE } from '$env/static/public';
	import logoBeacon from '$lib/assets/logo_be.png';
	import { locale, translations as tr } from '$lib/i18n';
	import { openChat } from '$lib/stores/chat';
	import {
		storageUrl,
		type ArticleSummary,
		type SearchResult,
		type SearchResponse,
		type SolutionSummary
	} from '$lib/api';
	import { articleCategory, articleTitle, solutionHook } from '$lib/homepage-copy';
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
	let isCondensed = $state(false);
	let mobileMenuOpen = $state(false);
	let activeMegaMenu = $state<string | null>(null);
	let scrollProgress = $state(0);
	let mobileToggle: HTMLButtonElement;
	let chromeElement: HTMLElement;
	let bodyOverflow = '';
	let bodyLocked = false;
	let lastMegaTrigger: HTMLButtonElement | null = null;
	let solutionsTrigger: HTMLButtonElement;
	let aboutTrigger: HTMLButtonElement;
	let insightsTrigger: HTMLButtonElement;
	
	let searchOpen = $state(false);
	let searchQuery = $state('');
	let currentLang = $derived($locale);
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
			searchError = tr['nav.search.error'][$locale];
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
		if (!isCondensed && scrollY > 64) isCondensed = true;
		if (isCondensed && scrollY < 24) isCondensed = false;

		const docHeight = document.documentElement.scrollHeight - window.innerHeight;
		scrollProgress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
	}

	function syncBodyLock() {
		const shouldLock = searchOpen || mobileMenuOpen;
		if (shouldLock && !bodyLocked) {
			bodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			bodyLocked = true;
		} else if (!shouldLock && bodyLocked) {
			document.body.style.overflow = bodyOverflow;
			bodyLocked = false;
		}
	}

	function resetSearch() {
		searchQuery = '';
		searchResults = [];
		searchLoading = false;
		searchError = null;
		activeIndex = -1;
		clearTimeout(debounceTimer);
	}

	function openSearch() {
		mobileMenuOpen = false;
		activeMegaMenu = null;
		searchOpen = true;
		syncBodyLock();
	}

	function closeSearch() {
		searchOpen = false;
		resetSearch();
		syncBodyLock();
	}

	let closeTimeout: ReturnType<typeof setTimeout>;

	function dismissMegaMenu(restoreFocus = false) {
		clearTimeout(closeTimeout);
		activeMegaMenu = null;
		if (restoreFocus) lastMegaTrigger?.focus();
	}

	function toggleMegaMenu(menu: string, trigger: HTMLButtonElement) {
		lastMegaTrigger = trigger;
		if (activeMegaMenu === menu) dismissMegaMenu();
		else openMegaMenu(menu, trigger);
	}

	function openMegaMenu(menu: string, trigger?: HTMLButtonElement) {
		clearTimeout(closeTimeout);
		if (trigger) lastMegaTrigger = trigger;
		activeMegaMenu = menu;
	}

	function scheduleMegaMenuClose() {
		clearTimeout(closeTimeout);
		closeTimeout = setTimeout(() => {
			activeMegaMenu = null;
		}, 180);
	}

	async function openMegaMenuFromKeyboard(menu: string, trigger: HTMLButtonElement) {
		openMegaMenu(menu, trigger);
		await tick();
		chromeElement
			?.querySelector<HTMLElement>(`#mega-menu-${menu} a, #mega-menu-${menu} button`)
			?.focus();
	}

	function handleMegaKeydown(e: KeyboardEvent, menu: string, trigger: HTMLButtonElement) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			openMegaMenuFromKeyboard(menu, trigger);
		}
	}

	function handleMegaFocusOut(e: FocusEvent) {
		const currentTarget = e.currentTarget as HTMLElement;
		const nextTarget = e.relatedTarget as Node | null;
		if (!nextTarget || !currentTarget.contains(nextTarget)) scheduleMegaMenuClose();
	}

	function toggleMobileMenu() {
		if (mobileMenuOpen) {
			closeMobileMenu();
			return;
		}

		searchOpen = false;
		resetSearch();
		activeMegaMenu = null;
		mobileMenuOpen = true;
		syncBodyLock();
	}

	async function closeMobileMenu() {
		if (!mobileMenuOpen) return;
		mobileMenuOpen = false;
		syncBodyLock();
		await tick();
		mobileToggle?.focus();
	}

	onMount(() => {
		updateScroll();
		window.addEventListener('scroll', updateScroll, { passive: true });

		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				searchOpen ? closeSearch() : openSearch();
				return;
			}
			if (e.key !== 'Escape') return;
			if (searchOpen) closeSearch();
			else if (mobileMenuOpen) closeMobileMenu();
			else if (activeMegaMenu) dismissMegaMenu(true);
		};
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('scroll', updateScroll);
			window.removeEventListener('keydown', handleKeyDown);
			clearTimeout(debounceTimer);
			clearTimeout(closeTimeout);
			if (bodyLocked) document.body.style.overflow = bodyOverflow;
		};
	});

	type SolutionCategory = {
		name: string;
		desc: string;
		icon: typeof Droplets;
		items: string[];
		href: string;
	};

	const fallbackSolutionCategories = $derived([
		{
			name: 'Water Security',
			desc: $locale === 'EN' ? 'Secure water & dams' : 'Amankan air & bendungan',
			icon: Droplets,
			items: ['AWLR', 'AWGC', 'AFMR', 'ADR', 'AWQR', 'AVWR'],
			href: '/solusi/water-security'
		},
		{
			name: 'Weather & Climate Intelligence',
			desc: $locale === 'EN' ? 'Accurate weather monitoring' : 'Pantau cuaca akurat',
			icon: Cloud,
			items: ['AWR', 'ARR'],
			href: '/solusi/weather-climate-intelligence'
		},
		{
			name: 'Early Warning',
			desc: $locale === 'EN' ? 'Reduce disaster risk' : 'Cegah bencana',
			icon: AlertTriangle,
			items: ['EWS'],
			href: '/solusi/early-warning'
		},
		{
			name: 'Infrastructure Security',
			desc: $locale === 'EN' ? 'Protect critical assets' : 'Proteksi aset kritis',
			icon: Gauge,
			items: ['APLR'],
			href: '/solusi/infrastructure-security'
		},
		{
			name: 'Digital Monitoring Platform',
			desc: $locale === 'EN' ? 'One monitoring platform' : 'Platform monitoring 1-pintu',
			icon: Monitor,
			items: ['Smart Telemetry System'],
			href: '/solusi/digital-monitoring-platform'
		}
	] satisfies SolutionCategory[]);

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
		if (!text) return $locale === 'EN' ? 'Beacon telemetry solution' : 'Solusi telemetri Beacon';
		return text.length > max ? `${text.slice(0, max - 1)}...` : text;
	}

	const solutionCategories = $derived(
		solutions && solutions.length > 0
			? solutions.map((solution) => ({
					name: solution.name,
					desc: shortText(solutionHook(solution.slug, solution.description, $locale)),
					icon: getSolutionIcon(solution.slug),
					items: (solution.sub_solutions ?? [])
						.map((item) => item.abbreviation || item.name)
						.filter(Boolean),
					href: `/solusi/${solution.slug}`
				}))
			: fallbackSolutionCategories
	);

	const popularSolutions = $derived(
		solutionCategories
			.slice(0, 3)
			.map((cat) =>
				cat.items[0]
					? $locale === 'EN'
						? `${cat.items[0]} for ${cat.name}`
						: `${cat.items[0]} untuk ${cat.name}`
					: cat.name
			)
	);

	const aboutLinks = $derived([
		{ name: tr['about.profile'][$locale], desc: tr['about.profile.desc'][$locale], icon: Building2, href: '/tentang-kami', color: '#C8102E' },
		{ name: tr['about.vision'][$locale], desc: tr['about.vision.desc'][$locale], icon: Target, href: '/tentang-kami#visi-misi', color: '#0EA5E9' },
		{ name: tr['about.cert'][$locale], desc: tr['about.cert.desc'][$locale], icon: Award, href: '/tentang-kami#sertifikasi', color: '#10B981' },
		{ name: tr['about.clients'][$locale], desc: tr['about.clients.desc'][$locale], icon: Users, href: '/tentang-kami#klien', color: '#F59E0B' }
	]);

	const insightCategories = $derived([
		{ name: tr['cat.case'][$locale], desc: tr['cat.case.desc'][$locale], icon: FileText, href: '/wawasan?kategori=studi-kasus', color: '#C8102E' },
		{ name: tr['cat.tech'][$locale], desc: tr['cat.tech.desc'][$locale], icon: BookOpen, href: '/wawasan?kategori=artikel-teknis', color: '#0EA5E9' },
		{ name: tr['cat.news'][$locale], desc: tr['cat.news.desc'][$locale], icon: Newspaper, href: '/wawasan?kategori=berita-produk', color: '#8B5CF6' }
	]);

	const fallbackLatestArticle = $derived({
		title: $locale === 'EN' ? 'ADR Keeps Ciawi Dam Safer' : 'ADR Menyelamatkan Bendungan Ciawi',
		category: $locale === 'EN' ? 'Case Study' : 'Studi Kasus',
		href: '/wawasan/adr-bendungan-ciawi',
		color: '#C8102E'
	});

	const headerLatestArticle = $derived(
		latestArticle
			? {
					title: articleTitle(latestArticle, $locale),
					category: articleCategory(latestArticle, $locale) || tr['nav.insights'][$locale],
					href: `/wawasan/${latestArticle.slug}`,
					color: latestArticle.category_color || '#C8102E'
				}
			: fallbackLatestArticle
	);

	function resultTypeLabel(type: string): string {
		const labelMap: Record<string, string> = {
			'Solusi': tr['nav.solutions'][$locale],
			'Sub-Solusi': $locale === 'EN' ? 'Sub-Solutions' : 'Sub-Solusi',
			'Produk': $locale === 'EN' ? 'Products' : 'Produk',
			'Proyek': tr['nav.projects'][$locale],
			'Wawasan': tr['nav.insights'][$locale]
		};

		return labelMap[type] ?? type;
	}

	const quickLinks = $derived([
		{ type: 'Solusi', title: 'Water Security', href: '/solusi/water-security', icon: Droplets },
		{ type: 'Solusi', title: 'Early Warning System', href: '/solusi/early-warning', icon: AlertTriangle },
		{ type: 'Proyek', title: tr['projects.cta'][$locale], href: '/proyek', icon: MapPin },
		{ type: 'Wawasan', title: $locale === 'EN' ? 'Latest Articles' : 'Artikel Terbaru', href: '/wawasan', icon: FileText }
	]);

	function isRouteActive(path: string, exact = false) {
		return exact ? $page.url.pathname === path : $page.url.pathname.startsWith(path);
	}

	function handleHeaderChat() {
		dismissMegaMenu();
		if (mobileMenuOpen) closeMobileMenu();
		openChat();
	}
</script>

<div class="scroll-progress" style="width: {scrollProgress}%"></div>
<div class="header-reserve" aria-hidden="true"></div>

{#if activeMegaMenu}
	<button
		type="button"
		class="mega-backdrop hidden lg:block"
		onclick={() => dismissMegaMenu()}
		aria-label={$locale === 'EN' ? 'Close navigation submenu' : 'Tutup submenu navigasi'}
	></button>
{/if}

<div
	class="site-chrome {isCondensed ? 'is-condensed' : ''} {mobileMenuOpen ? 'is-mobile-open' : ''}"
	bind:this={chromeElement}
>
	<div class="utility-bar">
		<div class="chrome-container utility-inner">
			<span class="hidden sm:inline font-mono font-bold tracking-[0.15em] text-[10px] text-zinc-400 uppercase">
				{tr['topbar.tagline'][$locale]}
			</span>
			<div class="flex items-center gap-5 text-[11px] font-medium text-zinc-300 ml-auto sm:ml-0">
				<a href="tel:02744986899" class="flex items-center gap-1.5 hover:text-white transition-colors">
					<Phone size={12} class="text-[#C8102E]" />
					<span class="hidden md:inline tabular-nums">(0274) 4986899</span>
				</a>
				<a href="mailto:info@bejogja.com" class="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
					<Mail size={12} class="text-[#C8102E]" />
					<span>info@bejogja.com</span>
				</a>
			</div>
		</div>
	</div>

	<header class="masthead">
		<div class="chrome-container masthead-grid">
			<a href="/" class="brand-link group" aria-label="Beacon Engineering">
				<img src={logoBeacon} alt="Beacon Engineering" class="brand-logo group-hover:opacity-80" />
			</a>

			<nav class="desktop-nav hidden lg:flex" aria-label={$locale === 'EN' ? 'Primary navigation' : 'Navigasi utama'}>
				<a href="/" class:active={isRouteActive('/', true)} class="nav-link" aria-current={isRouteActive('/', true) ? 'page' : undefined}>
					{tr['nav.home'][$locale]}
				</a>

				<div
					class="nav-group"
					onmouseenter={() => openMegaMenu('solusi', solutionsTrigger)}
					onmouseleave={scheduleMegaMenuClose}
					onfocusout={handleMegaFocusOut}
				>
					<button
						type="button"
						class:active={isRouteActive('/solusi') || activeMegaMenu === 'solusi'}
						class="nav-link nav-trigger"
						bind:this={solutionsTrigger}
						onclick={(event) => toggleMegaMenu('solusi', event.currentTarget)}
							onkeydown={(event) => handleMegaKeydown(event, 'solusi', event.currentTarget)}
						aria-expanded={activeMegaMenu === 'solusi'}
						aria-controls="mega-menu-solusi"
					>
						{tr['nav.solutions'][$locale]}
						<ChevronDown size={13} class={activeMegaMenu === 'solusi' ? 'rotate-180' : ''} />
					</button>

					{#if activeMegaMenu === 'solusi'}
						<div id="mega-menu-solusi" class="mega-panel solutions-panel">
							<p class="mega-eyebrow">{tr['mega.solutions.title'][$locale]}</p>
							<div class="grid grid-cols-3 gap-3 mb-5">
								{#each solutionCategories as cat}
									<a href={cat.href} onclick={() => dismissMegaMenu()} class="mega-card group">
										<div class="flex items-center gap-2 mb-1">
											<svelte:component this={cat.icon} size={16} class="text-[#C8102E]" />
											<span class="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors">{cat.name}</span>
										</div>
										<p class="text-xs text-[#5C5C5C] mb-2">{cat.desc}</p>
										<div class="flex flex-wrap gap-1">
											{#each cat.items as item}
												<span class="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#5C5C5C] border border-[#E5E5E5]">{item}</span>
											{/each}
										</div>
									</a>
								{/each}
							</div>
							<div class="border-t border-[#E5E5E5] pt-4 flex justify-between items-start gap-6">
								<div>
									<p class="text-xs font-semibold text-[#C8102E] uppercase tracking-wider mb-2">{tr['mega.solutions.popular'][$locale]}</p>
									{#each popularSolutions as sol}<p class="text-xs text-[#5C5C5C] mb-1">• {sol}</p>{/each}
								</div>
								<div class="text-right">
									<p class="text-xs text-[#5C5C5C] mb-2">{tr['mega.solutions.consult'][$locale]}</p>
									<button type="button" onclick={handleHeaderChat} class="inline-flex items-center gap-1 text-xs font-semibold text-[#C8102E] hover:underline">
										<MessageCircle size={12} /> {tr['nav.cta'][$locale]}
									</button>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<a href="/proyek" class:active={isRouteActive('/proyek')} class="nav-link" aria-current={isRouteActive('/proyek') ? 'page' : undefined}>
					{tr['nav.projects'][$locale]}
				</a>

				<div
					class="nav-group"
					onmouseenter={() => openMegaMenu('tentang', aboutTrigger)}
					onmouseleave={scheduleMegaMenuClose}
					onfocusout={handleMegaFocusOut}
				>
					<button
						type="button"
						class:active={isRouteActive('/tentang-kami') || activeMegaMenu === 'tentang'}
						class="nav-link nav-trigger"
						bind:this={aboutTrigger}
						onclick={(event) => toggleMegaMenu('tentang', event.currentTarget)}
							onkeydown={(event) => handleMegaKeydown(event, 'tentang', event.currentTarget)}
						aria-expanded={activeMegaMenu === 'tentang'}
						aria-controls="mega-menu-tentang"
					>
						{tr['nav.about'][$locale]}
						<ChevronDown size={13} class={activeMegaMenu === 'tentang' ? 'rotate-180' : ''} />
					</button>

					{#if activeMegaMenu === 'tentang'}
						<div id="mega-menu-tentang" class="mega-panel compact-panel">
							<p class="mega-eyebrow">{tr['mega.about.title'][$locale]}</p>
							<div class="space-y-1 mb-4">
								{#each aboutLinks as link}
									<a href={link.href} onclick={() => dismissMegaMenu()} class="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FBE9EC] transition-colors">
										<div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background: {link.color}10;"><svelte:component this={link.icon} size={16} style="color: {link.color};" /></div>
										<div><span class="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors">{link.name}</span><span class="block text-[11px] text-[#9A9A9A]">{link.desc}</span></div>
									</a>
								{/each}
							</div>
							<div class="border-t border-[#E5E5E5] pt-3"><a href="/tentang-kami" onclick={() => dismissMegaMenu()} class="inline-flex items-center gap-1 text-xs font-semibold text-[#C8102E] hover:underline">{tr['mega.about.more'][$locale]} <ArrowRight size={11} /></a></div>
						</div>
					{/if}
				</div>

				<div
					class="nav-group"
					onmouseenter={() => openMegaMenu('wawasan', insightsTrigger)}
					onmouseleave={scheduleMegaMenuClose}
					onfocusout={handleMegaFocusOut}
				>
					<button
						type="button"
						class:active={isRouteActive('/wawasan') || activeMegaMenu === 'wawasan'}
						class="nav-link nav-trigger"
						bind:this={insightsTrigger}
						onclick={(event) => toggleMegaMenu('wawasan', event.currentTarget)}
							onkeydown={(event) => handleMegaKeydown(event, 'wawasan', event.currentTarget)}
						aria-expanded={activeMegaMenu === 'wawasan'}
						aria-controls="mega-menu-wawasan"
					>
						{tr['nav.insights'][$locale]}
						<ChevronDown size={13} class={activeMegaMenu === 'wawasan' ? 'rotate-180' : ''} />
					</button>

					{#if activeMegaMenu === 'wawasan'}
						<div id="mega-menu-wawasan" class="mega-panel compact-panel">
							<p class="mega-eyebrow">{tr['mega.insights.title'][$locale]}</p>
							<div class="space-y-1 mb-4">
								{#each insightCategories as cat}
									<a href={cat.href} onclick={() => dismissMegaMenu()} class="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FBE9EC] transition-colors">
										<div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background: {cat.color}10;"><svelte:component this={cat.icon} size={16} style="color: {cat.color};" /></div>
										<div><span class="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors">{cat.name}</span><span class="block text-[11px] text-[#9A9A9A]">{cat.desc}</span></div>
									</a>
								{/each}
							</div>
							<div class="border-t border-[#E5E5E5] pt-3">
								<p class="text-[10px] font-semibold text-[#C8102E] uppercase tracking-wider mb-2">{tr['mega.insights.latest'][$locale]}</p>
								<a href={headerLatestArticle.href} onclick={() => dismissMegaMenu()} class="group block p-2.5 rounded-lg hover:bg-[#FBE9EC] transition-colors"><span class="text-[10px] uppercase tracking-wider" style="color: {headerLatestArticle.color};">{headerLatestArticle.category}</span><span class="block text-sm font-medium text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors mt-0.5">{headerLatestArticle.title}</span></a>
								<a href="/wawasan" onclick={() => dismissMegaMenu()} class="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#C8102E] hover:underline">{tr['mega.insights.all'][$locale]} <ArrowRight size={11} /></a>
							</div>
						</div>
					{/if}
				</div>

				<a href="/kontak" class:active={isRouteActive('/kontak')} class="nav-link" aria-current={isRouteActive('/kontak') ? 'page' : undefined}>
					{tr['nav.contact'][$locale]}
				</a>
			</nav>

			<div class="header-actions">
				<div class="language-switcher hidden lg:flex" role="group" aria-label={$locale === 'EN' ? 'Choose language' : 'Pilih bahasa'}>
					<div class="language-indicator" style="transform: translateX({currentLang === 'EN' ? '26px' : '0'});"></div>
					<button type="button" onclick={() => $locale = 'ID'} class:active={$locale === 'ID'} aria-pressed={$locale === 'ID'} aria-label={$locale === 'EN' ? 'Use Indonesian language' : 'Gunakan bahasa Indonesia'}>ID</button>
					<button type="button" onclick={() => $locale = 'EN'} class:active={$locale === 'EN'} aria-pressed={$locale === 'EN'} aria-label="Use English language">EN</button>
				</div>

				<button type="button" class="search-trigger hidden lg:flex" aria-label={$locale === 'EN' ? 'Open search' : 'Buka pencarian'} onclick={openSearch}>
					<Search size={16} />
					<span class="search-label">{tr['nav.search'][$locale]}</span>
					<kbd class="search-shortcut"><Command size={10} /> K</kbd>
				</button>

				<button type="button" onclick={handleHeaderChat} class="desktop-chat hidden lg:inline-flex">
					<MessageCircle size={15} />
					<span>{tr['nav.cta'][$locale]}</span>
				</button>

				<button
					type="button"
					class="mobile-toggle lg:hidden"
					onclick={toggleMobileMenu}
					bind:this={mobileToggle}
					aria-label={mobileMenuOpen ? ($locale === 'EN' ? 'Close navigation menu' : 'Tutup menu navigasi') : ($locale === 'EN' ? 'Open navigation menu' : 'Buka menu navigasi')}
					aria-expanded={mobileMenuOpen}
					aria-controls="mobile-navigation"
				>
					{#if mobileMenuOpen}<X size={19} />{:else}<Menu size={19} />{/if}
				</button>
			</div>
		</div>
	</header>
</div>

<!-- Command Palette Search Overlay -->
{#if searchOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-[1200] flex items-start justify-center pt-[10vh] px-4 transition-all duration-300" style="background: rgba(255,255,255,0.4); backdrop-filter: blur(16px);" onclick={closeSearch}>
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
					placeholder={tr['nav.search.placeholder'][$locale]}
					aria-label={$locale === 'EN' ? 'Search keyword' : 'Kata kunci pencarian'}
					bind:value={searchQuery}
					oninput={() => debouncedSearch(searchQuery)}
					onkeydown={handleSearchKeydown}
					autofocus
				/>
				<button type="button" class="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100 shrink-0" onclick={closeSearch} aria-label={$locale === 'EN' ? 'Close search' : 'Tutup pencarian'}>
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
							type="button"
							class="mt-3 text-xs font-semibold text-[#C8102E] hover:underline"
							onclick={() => performSearch(searchQuery)}
						>
							{tr['nav.search.retry'][$locale]}
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
						<p class="text-sm font-medium text-zinc-900">{tr['nav.search.empty'][$locale]} "{searchQuery}"</p>
						<p class="text-xs text-zinc-500 mt-1">{tr['nav.search.empty.hint'][$locale]}</p>
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
								<span class="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-zinc-400">{resultTypeLabel(type)}</span>
							</div>
							<div class="space-y-0.5">
								{#each items as result, idx}
									{@const globalIdx = searchResults.indexOf(result)}
									{@const assetUrl = resultAssetUrl(result)}
									<button 
										type="button"
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
						<span class="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-zinc-400">{tr['nav.search.quick'][$locale]}</span>
					</div>
					<div class="space-y-0.5">
						{#each quickLinks as link}
							<a href={link.href} onclick={closeSearch} class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200/60 transition-all text-left group">
								<div class="w-10 h-10 rounded-[10px] bg-white border border-zinc-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style="color: {typeColorMap[link.type] || '#C8102E'};">
									<svelte:component this={link.icon} size={18} />
								</div>
								<div class="flex-1">
									<p class="text-sm font-bold text-zinc-900 group-hover:text-[#C8102E] transition-colors">{link.title}</p>
									<p class="text-[11px] font-medium text-zinc-500 mt-0.5">{resultTypeLabel(link.type)}</p>
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
					<span class="flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-sm">↑↓</kbd> {tr['nav.search.nav'][$locale]}</span>
					<span class="flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-sm">Enter</kbd> {tr['nav.search.select'][$locale]}</span>
				</div>
				<span class="flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-sm">Esc</kbd> {tr['nav.search.close'][$locale]}</span>
			</div>
		</div>
	</div>
{/if}

{#if mobileMenuOpen}
	<button
		type="button"
		class="mobile-backdrop lg:hidden"
		onclick={closeMobileMenu}
		aria-label={$locale === 'EN' ? 'Close navigation menu' : 'Tutup menu navigasi'}
	></button>
	<section id="mobile-navigation" class="mobile-panel lg:hidden" aria-label={$locale === 'EN' ? 'Mobile navigation' : 'Navigasi seluler'}>
		<nav class="mobile-nav-list" aria-label={$locale === 'EN' ? 'Primary navigation' : 'Navigasi utama'}>
			<a href="/" onclick={closeMobileMenu} class:active={isRouteActive('/', true)}>{tr['nav.home'][$locale]}</a>
			<div class="mobile-nav-group">
				<p>{tr['nav.solutions'][$locale]}</p>
				<div class="mobile-nested-list">
					{#each solutionCategories as cat}<a href={cat.href} onclick={closeMobileMenu}>{cat.name}</a>{/each}
				</div>
			</div>
			<a href="/proyek" onclick={closeMobileMenu} class:active={isRouteActive('/proyek')}>{tr['nav.projects'][$locale]}</a>
			<div class="mobile-nav-group">
				<p>{tr['nav.about'][$locale]}</p>
				<div class="mobile-nested-list mobile-grid-list">
					{#each aboutLinks as link}<a href={link.href} onclick={closeMobileMenu}>{link.name}</a>{/each}
				</div>
			</div>
			<div class="mobile-nav-group">
				<p>{tr['nav.insights'][$locale]}</p>
				<div class="mobile-nested-list mobile-grid-list">
					{#each insightCategories as cat}<a href={cat.href} onclick={closeMobileMenu}>{cat.name}</a>{/each}
				</div>
				<a href={headerLatestArticle.href} onclick={closeMobileMenu} class="mobile-latest">
					<span style="color: {headerLatestArticle.color};">{headerLatestArticle.category}</span>
					<strong>{headerLatestArticle.title}</strong>
				</a>
			</div>
			<a href="/kontak" onclick={closeMobileMenu} class:active={isRouteActive('/kontak')}>{tr['nav.contact'][$locale]}</a>
		</nav>
		<div class="mobile-utilities">
			<div class="mobile-action-row">
				<div class="mobile-language" role="group" aria-label={$locale === 'EN' ? 'Choose language' : 'Pilih bahasa'}>
					<button type="button" onclick={() => $locale = 'ID'} class:active={$locale === 'ID'} aria-pressed={$locale === 'ID'}>ID</button>
					<span aria-hidden="true">/</span>
					<button type="button" onclick={() => $locale = 'EN'} class:active={$locale === 'EN'} aria-pressed={$locale === 'EN'}>EN</button>
				</div>
				<button type="button" class="mobile-search" onclick={openSearch}><Search size={15} /> {tr['nav.search'][$locale]}</button>
			</div>
			<div class="mobile-contact-row">
				<a href="tel:02744986899"><Phone size={15} /> (0274) 4986899</a>
				<a href="mailto:info@bejogja.com"><Mail size={15} /> info@bejogja.com</a>
			</div>
			<button type="button" onclick={handleHeaderChat} class="mobile-chat"><MessageCircle size={16} /> {tr['mobile.cta'][$locale]}</button>
		</div>
	</section>
{/if}

<style>
	.header-reserve { height: 116px; }
	.site-chrome { position: fixed; inset: 0 0 auto; z-index: 1030; pointer-events: none; }
	.site-chrome :global(a), .site-chrome :global(button), .site-chrome .masthead, .site-chrome .utility-bar { pointer-events: auto; }
	.chrome-container { width: 100%; max-width: 1280px; margin-inline: auto; padding-inline: 2rem; }
	.utility-bar { height: 36px; overflow: hidden; background: linear-gradient(90deg, #1a1a1a 0%, #2d0a10 100%); border-bottom: 1px solid rgba(255,255,255,.05); transition: height .42s cubic-bezier(.16,1,.3,1), opacity .24s ease, transform .42s cubic-bezier(.16,1,.3,1); }
	.utility-inner { height: 36px; display: flex; align-items: center; justify-content: space-between; }
	.masthead { width: 100%; height: 80px; margin: 0 auto; background: rgba(255,255,255,.98); border: 1px solid transparent; border-bottom-color: #e5e5e5; transition: width .42s cubic-bezier(.16,1,.3,1), height .42s cubic-bezier(.16,1,.3,1), margin .42s cubic-bezier(.16,1,.3,1), border-radius .42s cubic-bezier(.16,1,.3,1), background .26s ease, box-shadow .26s ease; }
	.masthead-grid { height: 100%; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; transition: padding .42s cubic-bezier(.16,1,.3,1); }
	.brand-link { justify-self: start; display: flex; align-items: center; min-width: 0; }
	.brand-logo { height: 36px; width: auto; transition: height .42s cubic-bezier(.16,1,.3,1), opacity .2s ease; }
	.desktop-nav { justify-self: center; align-items: center; gap: .125rem; }
	.nav-group { position: relative; }
	.nav-link { position: relative; display: inline-flex; align-items: center; gap: .3rem; padding: .75rem; color: #5c5c5c; font-size: .875rem; font-weight: 600; line-height: 1; white-space: nowrap; transition: color .18s ease; }
	.nav-link::after { content: ''; position: absolute; left: .75rem; right: .75rem; bottom: .25rem; height: 2px; border-radius: 999px; background: #c8102e; transform: scaleX(0); transition: transform .18s ease; }
	.nav-link:hover, .nav-link.active { color: #c8102e; }
	.nav-link.active::after { transform: scaleX(1); }
	.nav-trigger :global(svg) { color: #9a9a9a; transition: transform .18s ease, color .18s ease; }
	.nav-trigger.active :global(svg) { color: #c8102e; }
	.mega-panel { position: absolute; top: calc(100% + 1rem); padding: 1.5rem; border: 1px solid #e5e5e5; border-radius: 14px; background: rgba(255,255,255,.98); box-shadow: 0 18px 55px -22px rgba(26,26,26,.28); animation: menu-in .18s ease both; }
	.solutions-panel { left: 50%; width: min(760px, 90vw); transform: translateX(-50%); }
	.compact-panel { right: 0; width: 360px; }
	.mega-eyebrow { margin-bottom: .875rem; color: #5c5c5c; font-family: var(--font-mono); font-size: .65rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
	.mega-card { display: block; padding: .75rem; border-radius: 10px; transition: background .18s ease; }
	.mega-card:hover { background: #fbe9ec; }
	.header-actions { justify-self: end; display: flex; align-items: center; gap: .55rem; }
	.language-switcher { position: relative; align-items: center; padding: 3px; border: 1px solid #e5e5e5; border-radius: 10px; background: #fafafa; }
	.language-switcher button { position: relative; z-index: 1; width: 26px; height: 22px; color: #9a9a9a; font: 700 .625rem var(--font-mono); transition: color .18s ease; }
	.language-switcher button.active { color: #c8102e; }
	.language-indicator { position: absolute; inset: 3px auto 3px 3px; width: 26px; border: 1px solid #e5e5e5; border-radius: 7px; background: #fff; box-shadow: 0 2px 5px rgba(26,26,26,.08); transition: transform .3s cubic-bezier(.16,1,.3,1); }
	.search-trigger { align-items: center; gap: .45rem; min-height: 36px; padding: .45rem .6rem; color: #5c5c5c; border: 1px solid #e5e5e5; border-radius: 10px; background: #fafafa; transition: color .18s ease, background .18s ease; }
	.search-trigger:hover { color: #1a1a1a; background: #fff; }
	.search-label { font-size: .75rem; font-weight: 600; }
	.search-shortcut { display: inline-flex; align-items: center; gap: .2rem; padding: .15rem .3rem; border: 1px solid #e5e5e5; border-radius: 4px; background: #fff; color: #9a9a9a; font: 600 .6rem var(--font-mono); }
	.desktop-chat { align-items: center; gap: .4rem; padding: .65rem .9rem; border: 1px solid #910b20; border-radius: 999px; color: #fff; background: linear-gradient(135deg,#c8102e,#8b0a1f); box-shadow: 0 8px 18px -10px rgba(200,16,46,.65); font-size: .8rem; font-weight: 700; white-space: nowrap; transition: transform .18s ease, box-shadow .18s ease; }
	.desktop-chat:hover { transform: translateY(-1px); box-shadow: 0 10px 22px -10px rgba(200,16,46,.72); }
	.mobile-toggle { width: 38px; height: 38px; place-items: center; border: 1px solid rgba(26,26,26,.18); border-radius: 10px; color: #1a1a1a; background: transparent; transition: color .18s ease, border-color .18s ease, background .18s ease; }
	.mobile-toggle:hover { color: #c8102e; border-color: rgba(200,16,46,.35); background: #fbe9ec; }
	.site-chrome.is-condensed .utility-bar { height: 0; opacity: 0; transform: translateY(-100%); pointer-events: none; }
	.site-chrome.is-condensed .masthead { width: min(1280px, calc(100% - 32px)); height: 64px; margin-top: 14px; border-color: rgba(26,26,26,.1); border-radius: 999px; background: rgba(255,255,255,.82); box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 0 8px 26px -14px rgba(26,26,26,.3); backdrop-filter: blur(14px) saturate(130%); -webkit-backdrop-filter: blur(14px) saturate(130%); }
	.site-chrome.is-condensed .brand-logo { height: 28px; }
	.mega-backdrop { position: fixed; inset: 0; z-index: 1000; border: 0; background: rgba(255,255,255,.58); backdrop-filter: blur(12px) saturate(108%); -webkit-backdrop-filter: blur(12px) saturate(108%); }
	.mobile-backdrop { position: fixed; inset: 0; z-index: 1080; border: 0; background: rgba(255,255,255,.52); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
	.mobile-panel { position: fixed; z-index: 1100; top: 108px; left: 1rem; right: 1rem; bottom: calc(68px + env(safe-area-inset-bottom)); overflow-y: auto; overscroll-behavior: contain; padding: .75rem 1.25rem 1.25rem; border: 1px solid rgba(26,26,26,.1); border-radius: 22px; background: rgba(255,255,255,.98); box-shadow: 0 18px 48px -20px rgba(26,26,26,.32); animation: mobile-panel-in .2s ease both; }
	.mobile-nav-list > a, .mobile-nav-group > p { display: block; width: 100%; padding: .8rem 0; color: #1a1a1a; border-bottom: 1px solid rgba(26,26,26,.07); font-size: 1rem; font-weight: 650; }
	.mobile-nav-list > a.active { color: #c8102e; }
	.mobile-nested-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: .15rem .75rem; margin: .2rem 0 .6rem .15rem; padding: .4rem 0 .4rem .9rem; border-left: 2px solid #fbe9ec; }
	.mobile-nested-list a { padding: .4rem .15rem; color: #5c5c5c; font-size: .875rem; line-height: 1.2; transition: color .18s ease; }
	.mobile-nested-list a:hover { color: #c8102e; }
	.mobile-latest { display: block; margin: .35rem 0 .65rem 1rem; padding: .65rem .75rem; border-radius: 10px; background: #fafafa; }
	.mobile-latest span { display: block; margin-bottom: .15rem; font: 700 .625rem var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
	.mobile-latest strong { display: block; color: #1a1a1a; font-size: .82rem; }
	.mobile-utilities { margin-top: .75rem; padding-top: .9rem; border-top: 1px solid #e5e5e5; }
	.mobile-action-row, .mobile-contact-row { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
	.mobile-language { display: flex; align-items: center; gap: .35rem; color: #9a9a9a; font: 700 .7rem var(--font-mono); }
	.mobile-language button { color: #9a9a9a; }
	.mobile-language button.active { color: #c8102e; }
	.mobile-search { display: inline-flex; align-items: center; gap: .35rem; padding: .5rem .65rem; border: 1px solid #e5e5e5; border-radius: 9px; color: #5c5c5c; background: #fafafa; font-size: .75rem; font-weight: 650; }
	.mobile-contact-row { margin-top: .8rem; align-items: flex-start; flex-wrap: wrap; }
	.mobile-contact-row a { display: inline-flex; align-items: center; gap: .4rem; color: #5c5c5c; font-size: .75rem; }
	.mobile-contact-row :global(svg) { color: #c8102e; }
	.mobile-chat { display: flex; width: 100%; align-items: center; justify-content: center; gap: .45rem; margin-top: .9rem; padding: .75rem; border-radius: 12px; color: #fff; background: #c8102e; font-size: .85rem; font-weight: 700; }
	@keyframes menu-in { from { opacity: 0; } to { opacity: 1; } }
	@keyframes mobile-panel-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
	@media (max-width: 1279px) {
		.chrome-container { padding-inline: 1.25rem; }
		.masthead-grid { grid-template-columns: auto minmax(0, 1fr) auto; }
		.nav-link { padding-inline: .5rem; font-size: .8rem; }
		.nav-link::after { left: .5rem; right: .5rem; }
		.search-label, .search-shortcut, .desktop-chat span { display: none; }
		.desktop-chat { width: 36px; height: 36px; justify-content: center; padding: 0; }
	}
	@media (max-width: 1023px) {
		.header-reserve { height: 100px; }
		.chrome-container { padding-inline: 1rem; }
		.masthead { height: 64px; }
		.masthead-grid { display: flex; justify-content: space-between; }
		.brand-logo { height: 30px; }
		.mobile-toggle { display: grid; }
		.site-chrome.is-condensed .masthead { height: 58px; }
		.site-chrome.is-condensed .brand-logo { height: 27px; }
		.site-chrome.is-condensed ~ .mobile-panel { top: 80px; }
	}
	@media (max-width: 560px) {
		.chrome-container { padding-inline: .875rem; }
		.site-chrome.is-condensed .masthead { width: calc(100% - 20px); }
		.mobile-panel { left: .625rem; right: .625rem; padding-inline: 1rem; }
		.mobile-nested-list { grid-template-columns: 1fr; }
	}
	@media (prefers-reduced-motion: reduce) {
		.utility-bar, .masthead, .masthead-grid, .brand-logo, .mega-panel, .mobile-panel { animation: none !important; transition-duration: .01ms !important; }
	}
</style>
