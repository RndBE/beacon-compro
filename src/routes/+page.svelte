<script lang="ts">
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import WhyBeaconSection from '$lib/components/sections/WhyBeaconSection.svelte';
	import PillarSection from '$lib/components/sections/PillarSection.svelte';
	import StesySection from '$lib/components/sections/StesySection.svelte';
	import DataLoggersSection from '$lib/components/sections/DataLoggersSection.svelte';
	import ProjectsSection from '$lib/components/sections/ProjectsSection.svelte';
	import ClientLogosSection from '$lib/components/sections/ClientLogosSection.svelte';
	import TestimonialsSection from '$lib/components/sections/TestimonialsSection.svelte';
	import ServicesSection from '$lib/components/sections/ServicesSection.svelte';
	import InsightsSection from '$lib/components/sections/InsightsSection.svelte';
	import CtaSection from '$lib/components/sections/CtaSection.svelte';
	import { locale, translations as tr } from '$lib/i18n';
	import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, jsonLdScript } from '$lib/seo';

	let { data } = $props();
	let hp = $derived(data.homepage);

	// Identitas perusahaan untuk knowledge panel; datanya sama dengan footer.
	const ORGANIZATION_JSON_LD = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: SITE_URL,
		logo: DEFAULT_OG_IMAGE,
		email: 'info@bejogja.com',
		address: {
			'@type': 'PostalAddress',
			streetAddress: 'Kadirojo I, Purwomartani, Kalasan',
			addressLocality: 'Sleman',
			addressRegion: 'Daerah Istimewa Yogyakarta',
			postalCode: '55571',
			addressCountry: 'ID'
		},
		sameAs: [
			'https://instagram.com/beacon_engineering',
			'https://www.linkedin.com/company/beaconen-gineering/'
		]
	};

	const WEBSITE_JSON_LD = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: SITE_URL,
		inLanguage: 'id-ID',
		publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL }
	};
</script>

<svelte:head>
	<title>{tr['meta.home.title'][$locale]}</title>
	<meta name="description" content={tr['meta.home.desc'][$locale]} />
	{@html jsonLdScript(ORGANIZATION_JSON_LD)}
	{@html jsonLdScript(WEBSITE_JSON_LD)}
</svelte:head>

<HeroSection />
<WhyBeaconSection />
<PillarSection solutions={hp?.solutions} />
<StesySection />
<DataLoggersSection dataLoggers={hp?.data_loggers} />
<ProjectsSection featuredProjects={hp?.featured_projects} />
<ClientLogosSection clients={hp?.clients} />
<TestimonialsSection testimonials={hp?.testimonials} />
<ServicesSection />
<InsightsSection articles={hp?.recent_articles ?? []} />
<CtaSection />
