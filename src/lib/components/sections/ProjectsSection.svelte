<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, MapPin, Radio } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import type { FeaturedProject } from '$lib/api';

	let { featuredProjects = undefined }: { featuredProjects?: FeaturedProject[] | null } = $props();

	let visible = $state(false);
	let activeProject = $state(0);
	let mapContainer: HTMLDivElement;
	let mapInstance: any = null;
	let stationCount = $state(0);
	let mapReady = $state(false);

	// Coordinate lookup for map flyTo (not from API — geo data is local)
	const coordsMap: Record<string, [number, number]> = {
		'Bogor, Jawa Barat': [-6.6708, 106.8813],
		'Kalimantan Timur': [-0.9002, 116.7682],
		'Jawa Timur': [-8.0468, 114.1676],
		'Tangerang, Banten': [-6.1607, 106.6295],
		'Aceh': [4.9376, 97.1524],
		'Aceh Utara': [4.9376, 97.1524],
		'Purworejo, Jawa Tengah': [-7.7193, 110.0047],
		'Banyumas, Jawa Tengah': [-7.4832, 109.1404],
		'Jawa Barat': [-6.9175, 107.6191],
		'Jawa Tengah': [-7.1508, 110.1403],
		'DKI Jakarta': [-6.2088, 106.8456],
		'Yogyakarta': [-7.7956, 110.3695],
		'Nusa Tenggara Barat': [-8.6529, 117.3616],
		'Nusa Tenggara Timur': [-8.6574, 121.0794],
		'Jakarta': [-6.2088, 106.8456],
	};

	// Fallback hardcoded projects
	const fallbackProjects = [
		{ name: 'Telemetri ADR Bendungan Ciawi-Sukamahi', year: '2024', client: 'BBWS Ciliwung-Cisadane', products: ['ADR', 'STESY'], location: 'Bogor, Jawa Barat', coords: [-6.6708, 106.8813] as [number, number] },
		{ name: 'Telemetri AWLR Bendungan Sepaku IKN', year: '2024', client: 'BWS Kalimantan IV', products: ['AWLR', 'STESY'], location: 'Kalimantan Timur', coords: [-0.9002, 116.7682] as [number, number] },
		{ name: 'Telemetri APLR Kawah Ijen', year: '2023', client: 'PT Medco Energi', products: ['APLR'], location: 'Banyuwangi, Jawa Timur', coords: [-8.0468, 114.1676] as [number, number] },
		{ name: 'Telemetri AWGC Sungai Cisadane BKC 3', year: '2023', client: 'BBWS Ciliwung-Cisadane', products: ['AWGC', 'STESY'], location: 'Tangerang, Banten', coords: [-6.1607, 106.6295] as [number, number] },
		{ name: 'Sistem Telemetri Bendungan Keureuto', year: '2023', client: 'BWS Sumatera I', products: ['AWLR', 'ADR', 'STESY'], location: 'Aceh', coords: [4.9376, 97.1524] as [number, number] }
	];

	// Build projects from API data or fallback
	const projects = $derived(
		featuredProjects && featuredProjects.length > 0
			? featuredProjects.map((p) => ({
					name: p.name,
					year: p.year,
					client: p.client_name ?? '',
					products: [p.category_name ?? ''].filter(Boolean),
					location: p.location,
					coords: coordsMap[p.location] ?? [-2.5, 118] as [number, number]
				}))
			: fallbackProjects
	);

	onMount(async () => {
		// Intersection Observer for section visibility
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) visible = true; },
			{ threshold: 0.15 }
		);
		const el = document.getElementById('bukti-lapangan');
		if (el) observer.observe(el);

		// Auto-rotate carousel
		const interval = setInterval(() => {
			activeProject = (activeProject + 1) % projects.length;
		}, 5000);

		// Dynamic import Leaflet (SSR-safe)
		const L = (await import('leaflet')).default ?? (await import('leaflet'));

		// Import Leaflet CSS dynamically to avoid SSR issues
		await import('leaflet/dist/leaflet.css');

		// Initialize map
		mapInstance = L.map(mapContainer, {
			center: [-2.5, 118],
			zoom: 5,
			zoomControl: false,
			attributionControl: false,
			scrollWheelZoom: false,
			dragging: true,
			doubleClickZoom: false,
			touchZoom: true
		});

		// CartoDB Positron tiles — clean, minimal
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			subdomains: 'abcd',
			maxZoom: 19
		}).addTo(mapInstance);

		// Custom pulsing dot icon
		const pulseIcon = L.divIcon({
			className: 'beacon-pulse-marker',
			iconSize: [6, 6],
			iconAnchor: [3, 3]
		});

		// Featured project icon (larger)
		const featuredIcon = L.divIcon({
			className: 'beacon-featured-marker',
			iconSize: [10, 10],
			iconAnchor: [5, 5]
		});

		// Load real telemetry station data
		try {
			const res = await fetch('/pos_lokasi.json');
			const stations: { nama_pos: string; latitude: number; longitude: number }[] = await res.json();
			stationCount = stations.length;

			stations.forEach((station) => {
				if (station.latitude && station.longitude) {
					L.marker([station.latitude, station.longitude], { icon: pulseIcon })
						.addTo(mapInstance!)
						.bindPopup(
							`<div style="font-family: 'Outfit', sans-serif; padding: 2px 0;">
								<strong style="font-size: 12px; color: #1A1A1A;">${station.nama_pos}</strong>
							</div>`,
							{ closeButton: false }
						);
				}
			});
		} catch (err) {
			console.error('Failed to load station data:', err);
		}

		// Add featured project markers
		projects.forEach((project) => {
			L.marker(project.coords, { icon: featuredIcon })
				.addTo(mapInstance!)
				.bindPopup(
					`<div style="font-family: 'Outfit', sans-serif; padding: 2px 0;">
						<strong style="font-size: 13px; color: #C8102E;">${project.name}</strong><br/>
						<span style="font-size: 11px; color: #5C5C5C;">${project.client}</span>
					</div>`,
					{ closeButton: false }
				);
		});

		// Zoom controls
		L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
		mapReady = true;

		return () => {
			observer.disconnect();
			clearInterval(interval);
			if (mapInstance) mapInstance.remove();
		};
	});

	function flyToProject(index: number) {
		activeProject = index;
		if (mapInstance) {
			mapInstance.flyTo(projects[index].coords, 10, { duration: 1.2 });
		}
	}
</script>

<section id="bukti-lapangan" class="relative py-24 lg:py-32 bg-white overflow-hidden">
	<Ornaments variant="default" />
	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<!-- Heading — SKILL: Left-aligned (LAYOUT_VARIANCE=8) -->
		<div class="max-w-3xl mb-16 space-y-4">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-8 h-[1px] bg-[#C8102E]"></div>
				<span class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]">
					Portfolio Proyek
				</span>
			</div>
			<h2 class="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-950 leading-[1.05] tracking-tight mb-4">
				Kami Sudah di Sana, Kami <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(135deg, #FF5F56 0%, #C8102E 50%, #8A0B1F 100%);">Tetap di Sana.</span>
			</h2>
			<p class="text-lg text-zinc-500 leading-relaxed max-w-[55ch] font-medium">
				Tiga ratus lebih pos telemetri tersebar dari Aceh sampai Papua. Setiap titik merah di peta adalah perangkat Beacon yang beroperasi 24 jam non-stop.
			</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
			<!-- Left: Interactive Leaflet Map (7 cols) -->
			<div
				class="lg:col-span-7 relative"
				style="
					opacity: {visible ? 1 : 0};
					transform: translateX({visible ? 0 : -40}px);
					transition: all 0.8s cubic-bezier(0.16,1,0.3,1);
				"
			>
				<div class="leaflet-scope relative rounded-[2.5rem] overflow-hidden bg-zinc-50 border border-zinc-200/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]">
					<!-- Inner Liquid Glass Border -->
					<div class="absolute inset-0 border border-white pointer-events-none rounded-[2.5rem] z-[400] shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]"></div>

					<!-- Map container -->
					<div
						bind:this={mapContainer}
						class="w-full"
						style="height: 540px;"
					></div>

					<!-- Overlay: station counter -->
					<div class="absolute top-6 left-6 z-[1000] rounded-[1.5rem] p-5 backdrop-blur-md bg-white/80 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-transform hover:scale-105">
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 rounded-[14px] flex items-center justify-center" style="background: #FBE9EC;">
								<Radio size={20} style="color: #C8102E;" />
							</div>
							<div>
								<span class="block text-3xl font-mono font-extrabold tabular-nums leading-none tracking-tight text-zinc-900">{stationCount}</span>
								<span class="block text-[11px] uppercase tracking-[0.15em] font-bold text-zinc-500 mt-1">Pos Telemetri Aktif</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Project carousel (5 cols) -->
			<div class="lg:col-span-5 relative">
				<div class="flex flex-col gap-3 relative">
					{#each projects as project, i}
						<button
							class="w-full text-left group relative p-5 rounded-[1.25rem] transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden"
							style="
								background: {activeProject === i ? '#FFFFFF' : 'transparent'};
								border: 1px solid {activeProject === i ? 'rgba(200,16,46,0.2)' : 'transparent'};
								box-shadow: {activeProject === i ? '0 12px 24px -8px rgba(200,16,46,0.12)' : 'none'};
								opacity: {visible ? 1 : 0};
								transform: translateY({visible ? 0 : 20}px);
								transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1) {i * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) {i * 0.1}s, background 0.3s, border-color 0.3s, box-shadow 0.3s;
							"
							onclick={() => flyToProject(i)}
						>
							<!-- Left Accent Line for Active State -->
							{#if activeProject === i}
								<div class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-full bg-[#C8102E] shadow-[0_0_12px_rgba(200,16,46,0.4)]"></div>
							{/if}

							<div class="flex items-start justify-between relative z-10 pl-{activeProject === i ? '2' : '0'} transition-all duration-300">
								<div class="flex-1">
									<div class="flex items-center gap-3 mb-2">
										<span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md text-white tabular-nums" style="background: #C8102E;">{project.year}</span>
										<span class="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
											<MapPin size={12} class="text-zinc-400" />
											{project.location}
										</span>
									</div>
									<h3 class="font-heading text-[17px] font-bold text-zinc-900 mb-1.5 group-hover:text-[#C8102E] transition-colors">
										{project.name}
									</h3>
									<p class="text-[13px] font-medium text-zinc-500">{project.client}</p>
								</div>
								<div class="flex flex-wrap gap-1.5 ml-4 justify-end w-20">
									{#each project.products as prod}
										<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide" style="background: #FBE9EC; color: #C8102E;">{prod}</span>
									{/each}
								</div>
							</div>
						</button>
					{/each}
				</div>

				<div class="mt-8">
					<a
						href="/proyek"
						class="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold text-white overflow-hidden transition-transform active:scale-95"
						style="background: #C8102E; box-shadow: 0 12px 24px -8px rgba(200,16,46,0.4);"
					>
						<!-- Perpetual Shimmer Effect -->
						<div class="absolute inset-0 pointer-events-none translate-x-[-100%] group-hover:animate-shimmer" style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); background-size: 200% 100%;"></div>
						<div class="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"></div>
						
						<span class="relative z-10 flex items-center gap-2">
							Jelajahi Semua Proyek
							<ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
						</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Scope: Reset the global * { border-color } from shadcn-ui base
	   so Leaflet tiles and controls render correctly */
	:global(.leaflet-scope *) {
		border-color: initial;
		outline: initial;
	}
	:global(.leaflet-scope img) {
		max-width: none !important;
		border: none !important;
	}

	/* Custom Leaflet marker styles */
	:global(.beacon-pulse-marker) {
		background: rgba(200, 16, 46, 0.7);
		border-radius: 50%;
		border: none !important;
	}
	:global(.beacon-featured-marker) {
		background: #C8102E;
		border: 2.5px solid white !important;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(200, 16, 46, 0.4);
	}

	/* Leaflet popup customization */
	:global(.leaflet-popup-content-wrapper) {
		border-radius: 12px !important;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
		border: 1px solid rgba(229, 229, 229, 0.5) !important;
	}
	:global(.leaflet-popup-tip) {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06) !important;
		border: none !important;
	}
	:global(.leaflet-control-zoom a) {
		border-radius: 10px !important;
		border: 1px solid #E5E5E5 !important;
		color: #1A1A1A !important;
		font-family: 'Outfit', sans-serif !important;
		width: 34px !important;
		height: 34px !important;
		line-height: 34px !important;
	}
	:global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
		border-radius: 12px !important;
		overflow: hidden;
	}
</style>
