<script lang="ts">
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import WhyBeaconSection from '$lib/components/sections/WhyBeaconSection.svelte';
	import PillarSection from '$lib/components/sections/PillarSection.svelte';
	import SolutionFinderSection from '$lib/components/sections/SolutionFinderSection.svelte';
	import StesySection from '$lib/components/sections/StesySection.svelte';
	import DataLoggersSection from '$lib/components/sections/DataLoggersSection.svelte';
	import ProjectsSection from '$lib/components/sections/ProjectsSection.svelte';
	import ClientLogosSection from '$lib/components/sections/ClientLogosSection.svelte';
	import TestimonialsSection from '$lib/components/sections/TestimonialsSection.svelte';
	import ServicesSection from '$lib/components/sections/ServicesSection.svelte';
	import InsightsSection from '$lib/components/sections/InsightsSection.svelte';
	import CtaSection from '$lib/components/sections/CtaSection.svelte';
	import { locale, translations as tr } from '$lib/i18n';

	let { data } = $props();
	let hp = $derived(data.homepage);
</script>

<svelte:head>
	<title>{tr['meta.home.title'][$locale]}</title>
	<meta name="description" content={tr['meta.home.desc'][$locale]} />
</svelte:head>

<HeroSection />
<WhyBeaconSection />
<PillarSection solutions={hp?.solutions} />
<SolutionFinderSection />
<StesySection />
<DataLoggersSection dataLoggers={hp?.data_loggers} />
<ProjectsSection featuredProjects={hp?.featured_projects} />
<ClientLogosSection clients={hp?.clients} />
<TestimonialsSection testimonials={hp?.testimonials} />
<ServicesSection />
<InsightsSection articles={hp?.recent_articles ?? []} />
<CtaSection />
