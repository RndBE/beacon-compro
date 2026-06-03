<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import WhatsAppFloat from '$lib/components/WhatsAppFloat.svelte';
	import Chatbot from '$lib/components/Chatbot.svelte';
	import { locale, translations as tr } from '$lib/i18n';

	let { children, data } = $props();

	let isDemo = $derived($page.url.pathname.startsWith('/demo'));
</script>

<svelte:head>
	<title>{tr['meta.home.title'][$locale]}</title>
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
		<WhatsAppFloat />
		<Chatbot />
	</div>
{/if}
