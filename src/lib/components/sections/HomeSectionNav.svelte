<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import { locale } from '$lib/i18n';

	type SectionItem = {
		id: string;
		surface: 'light' | 'dark';
		label: {
			ID: string;
			EN: string;
		};
		short: string;
	};

	const sections: SectionItem[] = [
		{ id: 'hero', surface: 'light', short: '01', label: { ID: 'Beranda', EN: 'Home' } },
		{ id: 'mengapa-beacon', surface: 'light', short: '02', label: { ID: 'Keunggulan', EN: 'Why Beacon' } },
		{ id: 'pilar-solusi', surface: 'dark', short: '03', label: { ID: 'Pilar Solusi', EN: 'Solution Pillars' } },
		{ id: 'stesy-spotlight', surface: 'light', short: '04', label: { ID: 'STESY', EN: 'STESY' } },
		{ id: 'data-loggers-section', surface: 'light', short: '05', label: { ID: 'Data Logger', EN: 'Data Loggers' } },
		{ id: 'bukti-lapangan', surface: 'light', short: '06', label: { ID: 'Proyek', EN: 'Projects' } },
		{ id: 'logo-klien', surface: 'light', short: '07', label: { ID: 'Klien', EN: 'Clients' } },
		{ id: 'suara-mitra', surface: 'light', short: '08', label: { ID: 'Testimoni', EN: 'Testimonials' } },
		{ id: 'layanan-beyond', surface: 'light', short: '09', label: { ID: 'Layanan', EN: 'Services' } },
		{ id: 'wawasan-terbaru', surface: 'light', short: '10', label: { ID: 'Wawasan', EN: 'Insights' } },
		{ id: 'cta-final', surface: 'dark', short: '11', label: { ID: 'Kontak', EN: 'Contact' } }
	];

	let activeId = $state(sections[0].id);
	let mounted = $state(false);

	const activeIndex = $derived(Math.max(0, sections.findIndex((section) => section.id === activeId)));
	const visibleStart = $derived(
		Math.min(Math.max(activeIndex - 1, 0), Math.max(sections.length - 3, 0))
	);
	const visibleSections = $derived(sections.slice(visibleStart, visibleStart + 3));
	const canGoPrev = $derived(activeIndex > 0);
	const canGoNext = $derived(activeIndex < sections.length - 1);
	const activeSurface = $derived(sections[activeIndex]?.surface ?? 'light');

	onMount(() => {
		mounted = true;
		const targets = sections
			.map((section) => document.getElementById(section.id))
			.filter((target): target is HTMLElement => Boolean(target));

		if (targets.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				if (visible[0]?.target.id) {
					activeId = visible[0].target.id;
				}
			},
			{
				rootMargin: '-34% 0px -48% 0px',
				threshold: [0, 0.12, 0.28, 0.45, 0.65]
			}
		);

		targets.forEach((target) => observer.observe(target));

		return () => observer.disconnect();
	});

	function sectionLabel(section: SectionItem): string {
		return section.label[$locale] ?? section.label.ID;
	}

	function goToSection(id: string) {
		const target = document.getElementById(id);
		if (!target) return;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		target.scrollIntoView({
			behavior: reduceMotion ? 'auto' : 'smooth',
			block: 'start'
		});
		history.replaceState(null, '', `#${id}`);
		activeId = id;
	}

	function scrollToSection(event: MouseEvent, id: string) {
		event.preventDefault();
		goToSection(id);
	}

	function stepSection(direction: -1 | 1) {
		const nextIndex = Math.min(Math.max(activeIndex + direction, 0), sections.length - 1);
		goToSection(sections[nextIndex].id);
	}
</script>

<nav
	class="home-section-nav hidden lg:block"
	data-section-surface={activeSurface}
	aria-label={$locale === 'EN' ? 'Homepage section navigation' : 'Navigasi section beranda'}
	style="opacity: {mounted ? 1 : 0}; transform: translateY(-50%) translateX({mounted ? 0 : 12}px);"
>
	<div class="home-section-panel">
		<button
			type="button"
			class="home-section-step"
			disabled={!canGoPrev}
			aria-label={$locale === 'EN' ? 'Previous homepage section' : 'Section beranda sebelumnya'}
			onclick={() => stepSection(-1)}
		>
			<ChevronUp size={15} strokeWidth={2.2} />
		</button>

		<div class="home-section-bullets" aria-live="polite">
			{#each visibleSections as section}
				<a
					href="#{section.id}"
					class="home-section-bullet-link"
					class:is-active={activeId === section.id}
					aria-label="Lompat ke {sectionLabel(section)}"
					aria-current={activeId === section.id ? 'location' : undefined}
					onclick={(event) => scrollToSection(event, section.id)}
				>
					<span class="home-section-bullet" aria-hidden="true">
						<span></span>
					</span>
					<span class="home-section-bullet-label">{sectionLabel(section)}</span>
				</a>
			{/each}
		</div>

		<button
			type="button"
			class="home-section-step"
			disabled={!canGoNext}
			aria-label={$locale === 'EN' ? 'Next homepage section' : 'Section beranda berikutnya'}
			onclick={() => stepSection(1)}
		>
			<ChevronDown size={15} strokeWidth={2.2} />
		</button>
	</div>
</nav>

<nav
	class="home-section-mobile lg:hidden"
	aria-label={$locale === 'EN' ? 'Homepage section navigation' : 'Navigasi section beranda'}
	style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px);"
>
	<div class="home-section-mobile-scroll">
		{#each sections as section}
			<a
				href="#{section.id}"
				class="home-section-chip"
				class:is-active={activeId === section.id}
				aria-label="Lompat ke {sectionLabel(section)}"
				aria-current={activeId === section.id ? 'location' : undefined}
				onclick={(event) => scrollToSection(event, section.id)}
			>
				<span>{section.short}</span>
				{sectionLabel(section)}
			</a>
		{/each}
	</div>
</nav>

<style>
	.home-section-nav {
		--section-nav-panel-bg:
			linear-gradient(180deg, rgba(24, 24, 27, 0.84), rgba(39, 39, 42, 0.64)),
			rgba(24, 24, 27, 0.68);
		--section-nav-panel-border: rgba(255, 255, 255, 0.16);
		--section-nav-panel-shadow:
			0 20px 46px -28px rgba(24, 24, 27, 0.72),
			inset 0 1px 0 rgba(255, 255, 255, 0.16),
			inset 0 -1px 0 rgba(255, 255, 255, 0.08);
		--section-nav-step-bg: rgba(255, 255, 255, 0.08);
		--section-nav-step-ring: rgba(255, 255, 255, 0.1);
		--section-nav-step-color: rgba(250, 250, 250, 0.74);
		--section-nav-hover-bg: rgba(255, 255, 255, 0.12);
		--section-nav-rail: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0),
			rgba(255, 255, 255, 0.22) 24%,
			rgba(200, 16, 46, 0.42) 50%,
			rgba(255, 255, 255, 0.22) 76%,
			rgba(255, 255, 255, 0)
		);
		--section-nav-link-color: rgba(244, 244, 245, 0.78);
		--section-nav-bullet-bg: rgba(24, 24, 27, 0.78);
		--section-nav-bullet-border: rgba(255, 255, 255, 0.18);
		--section-nav-bullet-ring: rgba(255, 255, 255, 0.1);
		--section-nav-bullet-active-bg: #c8102e;
		--section-nav-bullet-active-border: rgba(255, 255, 255, 0.28);
		--section-nav-label-bg: rgba(24, 24, 27, 0.86);
		--section-nav-label-border: rgba(255, 255, 255, 0.14);
		--section-nav-label-color: #fafafa;
		--section-nav-label-active-color: #fafafa;
		position: fixed;
		top: 50%;
		right: clamp(0.9rem, 1.6vw, 1.8rem);
		z-index: 30;
		transition:
			opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-nav[data-section-surface='dark'] {
		--section-nav-panel-bg:
			linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.58)),
			rgba(255, 255, 255, 0.62);
		--section-nav-panel-border: rgba(255, 255, 255, 0.64);
		--section-nav-panel-shadow:
			0 20px 46px -28px rgba(24, 24, 27, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.86),
			inset 0 -1px 0 rgba(255, 255, 255, 0.32);
		--section-nav-step-bg: rgba(255, 255, 255, 0.34);
		--section-nav-step-ring: rgba(255, 255, 255, 0.24);
		--section-nav-step-color: #71717a;
		--section-nav-hover-bg: rgba(200, 16, 46, 0.1);
		--section-nav-rail: linear-gradient(
			180deg,
			rgba(113, 113, 122, 0),
			rgba(113, 113, 122, 0.22) 24%,
			rgba(200, 16, 46, 0.22) 50%,
			rgba(113, 113, 122, 0.22) 76%,
			rgba(113, 113, 122, 0)
		);
		--section-nav-link-color: #52525b;
		--section-nav-bullet-bg: rgba(255, 255, 255, 0.82);
		--section-nav-bullet-border: rgba(113, 113, 122, 0.28);
		--section-nav-bullet-ring: rgba(255, 255, 255, 0.58);
		--section-nav-bullet-active-bg: #c8102e;
		--section-nav-bullet-active-border: rgba(200, 16, 46, 0.62);
		--section-nav-label-bg: rgba(255, 255, 255, 0.88);
		--section-nav-label-border: rgba(255, 255, 255, 0.68);
		--section-nav-label-color: #27272a;
		--section-nav-label-active-color: #c8102e;
	}

	.home-section-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.42rem;
		width: 3.4rem;
		padding: 0.42rem;
		border: 1px solid var(--section-nav-panel-border);
		border-radius: 999px;
		background: var(--section-nav-panel-bg);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		box-shadow: var(--section-nav-panel-shadow);
		transition:
			background 0.28s cubic-bezier(0.16, 1, 0.3, 1),
			border-color 0.28s cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-step {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.26rem;
		min-height: 2.02rem;
		border: 0;
		border-radius: 999px;
		background: var(--section-nav-step-bg);
		color: var(--section-nav-step-color);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.58),
			inset 0 0 0 1px var(--section-nav-step-ring);
		transition:
			background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-step:hover:not(:disabled),
	.home-section-step:focus-visible:not(:disabled) {
		background: var(--section-nav-hover-bg);
		color: #c8102e;
		transform: translateY(-1px);
	}

	.home-section-step:disabled {
		cursor: default;
		opacity: 0.35;
	}

	.home-section-bullets {
		position: relative;
		display: grid;
		gap: 0.28rem;
		justify-items: center;
		padding: 0.1rem 0;
	}

	.home-section-bullets::before {
		content: '';
		position: absolute;
		top: 1.08rem;
		bottom: 1.08rem;
		left: 50%;
		width: 1px;
		border-radius: 999px;
		background: var(--section-nav-rail);
		transform: translateX(-50%);
	}

	.home-section-bullet-link {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.28rem;
		height: 2.28rem;
		border-radius: 999px;
		color: var(--section-nav-link-color);
		text-decoration: none;
		transition:
			background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-bullet {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 0.78rem;
		height: 0.78rem;
		border-radius: 999px;
		border: 1px solid var(--section-nav-bullet-border);
		background: var(--section-nav-bullet-bg);
		box-shadow:
			0 0 0 5px var(--section-nav-bullet-ring),
			inset 0 1px 0 rgba(255, 255, 255, 0.86);
		transition:
			border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-bullet span {
		width: 0.28rem;
		height: 0.28rem;
		border-radius: inherit;
		background: currentColor;
		opacity: 0.42;
		transform: scale(0.88);
		transition:
			opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-bullet-label {
		position: absolute;
		top: 50%;
		right: calc(100% + 0.62rem);
		max-width: 12rem;
		width: max-content;
		padding: 0.5rem 0.68rem;
		border: 1px solid var(--section-nav-label-border);
		border-radius: 999px;
		background: var(--section-nav-label-bg);
		backdrop-filter: blur(18px) saturate(170%);
		-webkit-backdrop-filter: blur(18px) saturate(170%);
		box-shadow:
			0 16px 34px -24px rgba(24, 24, 27, 0.48),
			inset 0 1px 0 rgba(255, 255, 255, 0.82);
		color: var(--section-nav-label-color);
		font-size: 0.72rem;
		font-weight: 850;
		line-height: 1;
		pointer-events: none;
		opacity: 0;
		transform: translateY(-50%) translateX(0.4rem) scale(0.96);
		transform-origin: right center;
		transition:
			opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-bullet-link:hover,
	.home-section-bullet-link:focus-visible,
	.home-section-bullet-link.is-active {
		background: rgba(200, 16, 46, 0.08);
		color: #c8102e;
		transform: translateX(-1px) scale(1.02);
	}

	.home-section-bullet-link:hover .home-section-bullet,
	.home-section-bullet-link:focus-visible .home-section-bullet,
	.home-section-bullet-link.is-active .home-section-bullet {
		border-color: rgba(200, 16, 46, 0.38);
		background: rgba(255, 255, 255, 0.96);
		box-shadow:
			0 0 0 6px rgba(200, 16, 46, 0.11),
			inset 0 1px 0 rgba(255, 255, 255, 0.92);
		transform: scale(1.04);
	}

	.home-section-bullet-link:hover .home-section-bullet span,
	.home-section-bullet-link:focus-visible .home-section-bullet span,
	.home-section-bullet-link.is-active .home-section-bullet span {
		opacity: 1;
		transform: scale(1.2);
	}

	.home-section-bullet-link:hover .home-section-bullet-label,
	.home-section-bullet-link:focus-visible .home-section-bullet-label,
	.home-section-bullet-link.is-active .home-section-bullet-label {
		opacity: 1;
		transform: translateY(-50%) translateX(0) scale(1);
	}

	.home-section-bullet-link.is-active .home-section-bullet {
		background: var(--section-nav-bullet-active-bg);
		border-color: var(--section-nav-bullet-active-border);
		color: white;
	}

	.home-section-bullet-link.is-active .home-section-bullet span {
		color: white;
	}

	.home-section-bullet-link.is-active .home-section-bullet-label {
		color: var(--section-nav-label-active-color);
	}

	.home-section-mobile {
		position: fixed;
		right: 6rem;
		bottom: calc(4.5rem + env(safe-area-inset-bottom));
		left: 1rem;
		z-index: 35;
		border: 1px solid rgba(255, 255, 255, 0.66);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(18px) saturate(165%);
		-webkit-backdrop-filter: blur(18px) saturate(165%);
		box-shadow:
			0 16px 36px -24px rgba(24, 24, 27, 0.45),
			inset 0 1px 0 rgba(255, 255, 255, 0.75);
		transition:
			opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-mobile-scroll {
		display: flex;
		gap: 0.4rem;
		overflow-x: auto;
		padding: 0.45rem;
		scrollbar-width: none;
	}

	.home-section-mobile-scroll::-webkit-scrollbar {
		display: none;
	}

	.home-section-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.38rem;
		flex: 0 0 auto;
		min-height: 2rem;
		padding: 0 0.68rem;
		border-radius: 0.72rem;
		color: #52525b;
		font-size: 0.72rem;
		font-weight: 800;
		text-decoration: none;
		transition:
			background 0.22s cubic-bezier(0.16, 1, 0.3, 1),
			color 0.22s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.home-section-chip span {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		color: #a1a1aa;
	}

	.home-section-chip.is-active {
		background: #c8102e;
		color: white;
		transform: translateY(-1px);
	}

	.home-section-chip.is-active span {
		color: rgba(255, 255, 255, 0.72);
	}

	@media (max-width: 380px) {
		.home-section-mobile {
			right: 5.25rem;
			left: 0.7rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.home-section-nav,
		.home-section-mobile,
		.home-section-panel,
		.home-section-step,
		.home-section-bullet-link,
		.home-section-bullet,
		.home-section-bullet span,
		.home-section-bullet-label,
		.home-section-chip {
			transition: none !important;
		}
	}
</style>
