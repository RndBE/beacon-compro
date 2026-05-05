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

	let { data } = $props();
	const hp = data.homepage;
</script>

<svelte:head>
	<title>Beacon Engineering — Pantau Setiap Tetes, Setiap Getaran, Setiap Awan</title>
	<meta name="description" content="Sistem telemetri pintar buatan Indonesia untuk infrastruktur paling strategis negeri ini. 300+ proyek, 200+ partner, 14 tahun pengalaman." />
</svelte:head>

<HeroSection />
<WhyBeaconSection />
<PillarSection solutions={hp?.solutions} />
<StesySection />
<DataLoggersSection />
<ProjectsSection featuredProjects={hp?.featured_projects} />
<ClientLogosSection clients={hp?.clients} />
<TestimonialsSection testimonials={hp?.testimonials} />
<ServicesSection />
<InsightsSection />
<CtaSection />
