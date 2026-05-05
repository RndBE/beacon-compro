<script lang="ts">
	import {
		MapPin,
		Calendar,
		Filter,
		ArrowRight,
		SearchX,
		Inbox,
	} from "@lucide/svelte";
	import type { ProjectListItem } from "./+page.server";

	let { data } = $props();

	let activeFilter = $state("semua");

	// Fallback hardcoded data
	const fallbackProjects = [
		{
			name: "Telemetri ADR Bendungan Ciawi-Sukamahi",
			year: "2024",
			client: "BBWS Ciliwung-Cisadane",
			location: "Bogor, Jawa Barat",
			products: ["ADR", "STESY"],
			category: "Water Security",
			highlight: "Proyek strategis pengendalian banjir Jakarta",
			image: "https://picsum.photos/seed/p1/800/600",
		},
		{
			name: "Telemetri AWLR Bendungan Sepaku IKN",
			year: "2024",
			client: "BWS Kalimantan IV",
			location: "Kalimantan Timur",
			products: ["AWLR", "STESY"],
			category: "Water Security",
			highlight: "Mendukung infrastruktur Ibu Kota Nusantara",
			image: "https://picsum.photos/seed/p2/800/600",
		},
		{
			name: "Telemetri APLR Kawah Ijen",
			year: "2023",
			client: "PT Medco Energi",
			location: "Banyuwangi, Jawa Timur",
			products: ["APLR"],
			category: "Pressure",
			highlight: "",
			image: "https://picsum.photos/seed/p3/800/600",
		},
		{
			name: "Telemetri AWGC Sungai Cisadane BKC 3",
			year: "2023",
			client: "BBWS Ciliwung-Cisadane",
			location: "Tangerang, Banten",
			products: ["AWGC", "STESY"],
			category: "Water Security",
			highlight: "",
			image: "https://picsum.photos/seed/p4/800/600",
		},
		{
			name: "Sistem Telemetri Bendungan Keureuto",
			year: "2023",
			client: "BWS Sumatera I",
			location: "Aceh",
			products: ["AWLR", "ADR", "STESY"],
			category: "Water Security",
			highlight: "",
			image: "https://picsum.photos/seed/p5/800/600",
		},
	];

	// Map API data to the shape the template expects
	const projects = $derived(
		data.projects && data.projects.length > 0
			? data.projects.map((p: ProjectListItem) => ({
					name: p.name,
					year: p.year,
					client: p.client_name ?? "",
					location: p.location,
					products: [p.category_name ?? ""].filter(Boolean),
					category: p.category_name ?? "",
					highlight: p.is_featured ? "" : "",
					image:
						p.thumbnail ??
						`https://picsum.photos/seed/${p.slug}/800/600`,
				}))
			: fallbackProjects,
	);

	// Derive unique categories from data
	const categories = $derived([
		"semua",
		...new Set(projects.map((p: any) => p.category).filter(Boolean)),
	]);

	let filteredProjects = $derived(
		activeFilter === "semua"
			? projects
			: projects.filter((p: any) => p.category === activeFilter),
	);

	// Reset stagger key when filter changes to re-trigger animations
	let filterKey = $state(0);

	function setFilter(cat: string) {
		activeFilter = cat;
		filterKey++;
	}
</script>

<svelte:head>
	<title>Proyek — Beacon Engineering</title>
	<meta
		name="description"
		content="300+ proyek telemetri dari Aceh sampai Papua. Lihat track record Beacon Engineering di infrastruktur strategis Indonesia."
	/>
	<link rel="canonical" href="https://beaconengineering.co.id/proyek" />
</svelte:head>

<!-- Hero — SKILL: Split Screen, DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6 -->
<section
	class="relative pt-28 pb-16 lg:pt-36 lg:pb-20 overflow-hidden bg-[#FAFAFA] border-b border-[#E5E5E5]"
>
	<!-- Subtle Dot Grid -->
	<div
		class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
		style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"
	></div>
	<!-- Decorative circle (top-left) -->
	<div
		class="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-[0.06]"
		style="border: 2px solid #C8102E;"
	></div>
	<!-- Decorative rotated square -->
	<div
		class="absolute top-[35%] left-[42%] w-8 h-8 rotate-45 rounded-md pointer-events-none opacity-[0.05] animate-float-slow"
		style="background: #C8102E;"
	></div>
	<!-- Warm glow behind map -->
	<div
		class="absolute top-1/2 right-0 -translate-y-1/2 w-[55%] h-[90%] pointer-events-none opacity-[0.04] rounded-full"
		style="background: radial-gradient(ellipse at center, #C8102E 0%, transparent 70%);"
	></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- SKILL Rule 3: Split-screen layout — text left, asset right -->
		<div
			class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-[52vh]"
		>
			<!-- Left: Text content -->
			<div class="flex flex-col justify-center lg:pr-12 xl:pr-20">
				<span
					class="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6 w-fit"
					style="background: rgba(200,16,46,0.06); color: #C8102E; border: 1px solid rgba(200,16,46,0.12);"
					>Portfolio</span
				>
				<h1
					class="font-heading text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-extrabold leading-[1.04] mb-6"
					style="letter-spacing: -0.035em; color: #1A1A1A;"
				>
					<span class="gradient-text-animated">300+</span> Titik.<br
					/>Satu Indonesia.
				</h1>
				<p
					class="text-lg leading-relaxed max-w-[48ch]"
					style="color: #5C5C5C;"
				>
					Setiap pin di peta ini adalah cerita tentang bendungan yang
					dijaga, sungai yang dipantau, atau wilayah yang dilindungi
					dari bencana.
				</p>
				<!-- Stat strip -->
				<div
					class="flex items-center gap-8 mt-10 pt-8 border-t border-[#E5E5E5]"
				>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							34
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							Provinsi
						</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							12+
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							Tahun Berpengalaman
						</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							5
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							Kategori Solusi
						</p>
					</div>
				</div>
			</div>

			<!-- Right: Indonesia Map SVG — SKILL: Floating micro-animation -->
			<div
				class="relative flex items-center justify-center lg:justify-end"
			>
				<!-- Faint ring behind the map -->
				<div
					class="absolute inset-0 flex items-center justify-center pointer-events-none"
				>
					<div
						class="w-[90%] h-[90%] rounded-full opacity-[0.07]"
						style="border: 1.5px dashed #C8102E;"
					></div>
				</div>
				<!-- Map container with float animation -->
				<div
					class="hero-map-float relative w-full max-w-[700px] lg:max-w-none lg:w-[120%] xl:w-[135%]"
				>
					<img
						src="/ilustrasi_peta_indonesia.webp"
						alt="Peta sebaran monitoring Beacon Engineering di seluruh Indonesia"
						class="w-full h-auto object-contain select-none"
						draggable="false"
					/>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Filter + Grid -->
<section class="py-20 lg:py-24 bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Filters — SKILL: pill-style with active indicator -->
		<div class="flex flex-wrap gap-2 mb-12">
			{#each categories as cat}
				<button
					class="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 btn-tactile"
					style="
						background: {activeFilter === cat ? '#C8102E' : 'white'};
						color: {activeFilter === cat ? 'white' : '#5C5C5C'};
						border: 1px solid {activeFilter === cat ? '#C8102E' : '#E5E5E5'};
						box-shadow: {activeFilter === cat ? '0 4px 12px rgba(200,16,46,0.2)' : 'none'};
					"
					onclick={() => setFilter(cat)}
				>
					{cat === "semua" ? "Semua" : cat}
				</button>
			{/each}
		</div>

		<!-- Project Grid — SKILL: Staggered 2-column, featured first card -->
		{#if filteredProjects.length === 0}
			<!-- SKILL Rule 5: Empty State -->
			<div
				class="flex flex-col items-center justify-center py-24 animate-fade-in-up"
			>
				<div
					class="w-20 h-20 rounded-full flex items-center justify-center mb-6"
					style="background: #FBE9EC;"
				>
					<Inbox size={32} style="color: #C8102E;" />
				</div>
				<h3
					class="font-heading text-xl font-bold mb-2"
					style="color: #1A1A1A;"
				>
					Belum ada proyek di kategori ini
				</h3>
				<p
					class="text-sm max-w-[40ch] text-center mb-6"
					style="color: #5C5C5C;"
				>
					Coba pilih kategori lain, atau lihat semua proyek untuk
					melihat portfolio lengkap kami.
				</p>
				<button
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white btn-tactile"
					style="background: #C8102E; box-shadow: 0 4px 12px rgba(200,16,46,0.2);"
					onclick={() => setFilter("semua")}
				>
					Lihat Semua Proyek
					<ArrowRight size={14} />
				</button>
			</div>
		{:else}
			{#key filterKey}
				<div class="grid md:grid-cols-2 gap-5">
					{#each filteredProjects as project, i}
						<!-- SKILL: Featured first card spans full width for DESIGN_VARIANCE: 8 -->
						{#if i === 0 && project.highlight}
							<div
								class="group md:col-span-2 relative p-8 md:p-12 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl overflow-hidden stagger-item"
								style="--stagger-index: {i};"
							>
								<!-- Background Image & Overlay -->
								<div
									class="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover:scale-105"
									style="background-image: url('{project.image}');"
								></div>
								<div
									class="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 to-transparent group-hover:from-zinc-950/90 transition-colors duration-500"
								></div>

								<!-- Inner Glass Refraction Border -->
								<div
									class="absolute inset-0 border border-white/10 rounded-[2.5rem] pointer-events-none z-20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"
								></div>

								<div class="relative z-10 md:w-2/3">
									<div
										class="flex flex-wrap items-center gap-3 mb-5"
									>
										<span
											class="text-xs font-bold px-3 py-1.5 rounded-[10px] text-white tabular-nums"
											style="background: #C8102E;"
											>{project.year}</span
										>
										<span
											class="text-xs flex items-center gap-1.5"
											style="color: rgba(255,255,255,0.5);"
										>
											<MapPin size={11} />
											{project.location}
										</span>
									</div>

									<h3
										class="font-heading text-2xl lg:text-3xl font-bold mb-3 text-white group-hover:text-[#F5D2D8] transition-colors"
										style="letter-spacing: -0.02em;"
									>
										{project.name}
									</h3>
									<p
										class="text-sm mb-2"
										style="color: rgba(255,255,255,0.6);"
									>
										{project.client}
									</p>
									{#if project.highlight}
										<p
											class="text-sm mb-5 max-w-[60ch]"
											style="color: rgba(200,16,46,0.7); font-style: italic;"
										>
											{project.highlight}
										</p>
									{/if}

									<div class="flex flex-wrap gap-1.5">
										{#each project.products as prod}
											<span
												class="text-[10px] px-2.5 py-1 rounded-full font-medium"
												style="background: rgba(200,16,46,0.15); color: #F5A0AD; border: 1px solid rgba(200,16,46,0.2);"
												>{prod}</span
											>
										{/each}
									</div>
								</div>
							</div>
						{:else}
							<div
								class="group p-3 rounded-[24px] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-zinc-200/50 flex flex-col stagger-item"
								style="border: 1px solid #E5E5E5; --stagger-index: {i};"
							>
								<!-- Image Block -->
								<div
									class="relative w-full h-48 rounded-[16px] overflow-hidden mb-5 bg-zinc-100"
								>
									<div
										class="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
										style="background-image: url('{project.image}');"
									></div>
									<div
										class="absolute inset-0 bg-zinc-950/5 group-hover:bg-transparent transition-colors duration-300"
									></div>
								</div>

								<div class="px-3 pb-3 flex-1 flex flex-col">
									<!-- Year Badge + Location -->
									<div class="flex items-center gap-3 mb-3">
										<span
											class="text-[11px] font-bold px-2.5 py-1 rounded-[8px] text-white tabular-nums"
											style="background: #C8102E;"
											>{project.year}</span
										>
										<span
											class="text-xs flex items-center gap-1.5 font-medium"
											style="color: #7A7A7A;"
										>
											<MapPin size={11} />
											{project.location}
										</span>
									</div>

									<h3
										class="font-heading text-[17px] font-bold mb-2 group-hover:text-[#C8102E] transition-colors leading-snug"
										style="color: #1A1A1A; letter-spacing: -0.01em;"
									>
										{project.name}
									</h3>
									<p
										class="text-sm mb-5 font-medium leading-relaxed"
										style="color: #5C5C5C;"
									>
										{project.client}
									</p>

									<div
										class="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-zinc-100"
									>
										{#each project.products as prod}
											<span
												class="text-[10px] px-2.5 py-1.5 rounded-md font-bold"
												style="background: #FBE9EC; color: #C8102E;"
												>{prod}</span
											>
										{/each}
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/key}
		{/if}
	</div>
</section>

<style>
	/* SKILL Section 4: Staggered Orchestration — CSS cascade animation-delay */
	.stagger-item {
		opacity: 0;
		animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: calc(var(--stagger-index, 0) * 80ms);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* SKILL MOTION_INTENSITY: 6 — Hero map gentle float */
	.hero-map-float {
		animation: mapFloat 6s ease-in-out infinite;
		will-change: transform;
	}

	@keyframes mapFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	/* Slow decorative square float */
	.animate-float-slow {
		animation: floatSlow 8s ease-in-out infinite;
		will-change: transform;
	}

	@keyframes floatSlow {
		0%,
		100% {
			transform: translateY(0) rotate(45deg);
		}
		50% {
			transform: translateY(-8px) rotate(45deg);
		}
	}

	/* Pulsing red dot for live status badge */
	.animate-pulse-red {
		animation: pulseRed 2s ease-in-out infinite;
	}

	@keyframes pulseRed {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.7);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stagger-item {
			animation: none !important;
			opacity: 1;
		}
		.hero-map-float,
		.animate-float-slow,
		.animate-pulse-red {
			animation: none !important;
		}
	}
</style>
