<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Chatbot from '$lib/components/Chatbot.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import { locale, translations as tr } from '$lib/i18n';
	import {
		DEFAULT_OG_IMAGE,
		SITE_NAME,
		absoluteUrl,
		canonicalUrl,
		clampDescription,
		toIsoDateTime,
		type SeoMeta
	} from '$lib/seo';

	let { children, data } = $props();

	let isDemo = $derived($page.url.pathname.startsWith('/demo'));

	// Halaman internal tidak perlu masuk indeks pencarian.
	let noIndex = $derived(isDemo || $page.url.pathname.startsWith('/presentasi'));

	let seo = $derived(($page.data.seo ?? {}) as SeoMeta);
	let canonical = $derived(canonicalUrl($page.url));
	let ogTitle = $derived(seo.title || tr['meta.home.title'][$locale]);
	let ogDescription = $derived(
		clampDescription(seo.description || tr['meta.home.desc'][$locale], 200)
	);
	let ogImage = $derived(seo.image ? absoluteUrl(seo.image) : DEFAULT_OG_IMAGE);
</script>

<svelte:head>
	<title>{tr['meta.home.title'][$locale]}</title>

	{#if noIndex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<link rel="canonical" href={canonical} />
	{/if}

	{#if seo.description}
		<meta name="description" content={clampDescription(seo.description)} />
	{/if}

	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content={$locale === 'EN' ? 'en_US' : 'id_ID'} />
	<meta property="og:type" content={seo.type ?? 'website'} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={ogDescription} />
	<meta property="og:image" content={ogImage} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={ogTitle} />
	<meta name="twitter:description" content={ogDescription} />
	<meta name="twitter:image" content={ogImage} />

	{#if seo.type === 'article'}
		{#if seo.publishedTime}
			<meta property="article:published_time" content={toIsoDateTime(seo.publishedTime)} />
		{/if}
		{#if seo.modifiedTime}
			<meta property="article:modified_time" content={toIsoDateTime(seo.modifiedTime)} />
		{/if}
		{#if seo.section}
			<meta property="article:section" content={seo.section} />
		{/if}
		{#each seo.tags ?? [] as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}
</svelte:head>

{#if isDemo}
	{@render children()}
{:else}
	<div class="min-h-screen flex flex-col">
		<a href="#main-content" class="skip-link"
			>{$locale === 'EN' ? 'Skip to main content' : 'Lompat ke konten utama'}</a
		>
		<Header solutions={data.solutions} latestArticle={data.latestArticle} />
		<main id="main-content" tabindex="-1" class="flex-1">
			{@render children()}
		</main>
		<Footer solutions={data.solutions} />
		<Chatbot />
		<CookieConsent />
	</div>
{/if}
