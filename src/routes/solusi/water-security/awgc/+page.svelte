<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, Check, MessageCircle, Download, ChevronRight, Activity, Settings, Wifi, ShieldCheck, Zap, Clock } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import ProductSpecs from '$lib/components/ProductSpecs.svelte';

	let { data } = $props();

	let mounted = $state(false);
	onMount(() => { mounted = true; });

	let activeVariant = $state(0);

	const fallbackVariants = [
		{ name: 'BG-200', subtitle: 'Full Actuator System', desc: 'Sistem aktuator lengkap dengan motor, gearbox, dan controller terintegrasi. Untuk pintu air baru atau renovasi total.', use: 'Bendungan baru, renovasi pintu air, BBWS/BWS' ,
		specs: [
		{ label: 'Tipe Aktuator', value: 'Motor DC / Hydraulic' },
		{ label: 'Torque Maksimal', value: '500 Nm' },
		{ label: 'Mode Operasi', value: 'Remote / Auto / Manual' },
		{ label: 'Proteksi', value: 'IP67' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM' },
		{ label: 'Feedback Posisi', value: 'Encoder absolute' },
		{ label: 'Interval Kontrol', value: 'Real-time (< 2 detik)' },
		{ label: 'Power Supply', value: 'AC PLN / Solar Backup' },
		{ label: 'Fail-safe', value: 'Auto-lock saat putus sinyal' },
		{ label: 'Sensor Terintegrasi', value: 'Water Level + Gate Position' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'SNI Compliant' }
	]
	},
		{ name: 'BG-210', subtitle: 'Retrofit Kit', desc: 'Kit upgrade untuk pintu air eksisting. Pasang di atas mekanisme manual tanpa mengganti struktur pintu.', use: 'Upgrade pintu manual, irigasi eksisting, PUPR' ,
		specs: [
		{ label: 'Tipe Aktuator', value: 'Motor DC / Hydraulic' },
		{ label: 'Torque Maksimal', value: '500 Nm' },
		{ label: 'Mode Operasi', value: 'Remote / Auto / Manual' },
		{ label: 'Proteksi', value: 'IP67' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM' },
		{ label: 'Feedback Posisi', value: 'Encoder absolute' },
		{ label: 'Interval Kontrol', value: 'Real-time (< 2 detik)' },
		{ label: 'Power Supply', value: 'AC PLN / Solar Backup' },
		{ label: 'Fail-safe', value: 'Auto-lock saat putus sinyal' },
		{ label: 'Sensor Terintegrasi', value: 'Water Level + Gate Position' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'SNI Compliant' }
	]
	}
	];

	// API data wins: use products from DB, fallback to static when DB has no products
	const variants = $derived(
		data.subSolutionDetail?.products && data.subSolutionDetail.products.length > 0
			? data.subSolutionDetail.products.map((p: any) => ({
				name: p.name,
				subtitle: p.use_case ?? '',
				desc: p.description ?? '',
				use: p.use_case ?? '',
				image: p.main_image ?? p.thumbnail ?? null,
				brochure_pdf: p.brochure_pdf ?? null,
				specs: Array.isArray(p.highlight_points)
					? p.highlight_points.map((pt: string, i: number) => ({ label: `Fitur ${i + 1}`, value: pt }))
					: [],
				components: Array.isArray(p.components) ? p.components : []
			}))
			: fallbackVariants
	);

	const useCases = [
		'Pintu bendungan yang harus dioperasikan saat bencana malam hari',
		'Irigasi multi-titik yang perlu diatur dari satu pusat kontrol',
		'Bendung otomatis untuk regulasi debit sungai',
		'Pintu spillway yang memerlukan respons cepat saat banjir',
		'Sistem drainase perkotaan terintegrasi'
	];

	const fallbackProjects = [
		{ name: 'Bendung Walahar', client: 'BWS Citarum', year: '2023' },
		{ name: 'Irigasi Brantas Hilir', client: 'BBWS Brantas', year: '2024' },
		{ name: 'Bendung Cimulu', client: 'BWS Ciliwung-Cisadane', year: '2023' },
		{ name: 'Pintu Air Muara Angke', client: 'Dinas SDA DKI', year: '2022' }
	];

	// API data wins: use track records from DB, fallback to static
	const projects = $derived(
		data.subSolutionDetail?.track_records && data.subSolutionDetail.track_records.length > 0
			? data.subSolutionDetail.track_records.map((tr: any) => ({
				name: tr.project_name,
				client: tr.client,
				year: tr.year
			}))
			: fallbackProjects
	);


	const features = [
		{ title: 'Remote Control Real-time', desc: 'Buka-tutup pintu air dari smartphone atau dashboard STESY. Respons di bawah 2 detik.', icon: Wifi },
		{ title: 'Auto-leveling', desc: 'Atur target level, pintu otomatis menyesuaikan posisi untuk mempertahankan ketinggian air yang dikehendaki.', icon: Settings },
		{ title: 'Fail-safe Mode', desc: 'Saat sinyal putus atau power mati, pintu otomatis terkunci di posisi aman terakhir.', icon: ShieldCheck },
		{ title: 'Feedback Presisi', desc: 'Encoder absolute mengirim posisi pintu aktual — bukan estimasi. Akurasi tingkat milimeter.', icon: Activity },
		{ title: 'Respons Darurat', desc: 'Override mode untuk situasi banjir — buka pintu maksimal dalam satu tap tanpa menunggu konfirmasi.', icon: Zap },
		{ title: 'Logging Operasional', desc: 'Setiap gerakan pintu tercatat lengkap dengan timestamp, operator, dan trigger. Audit-ready.', icon: Clock }
	];
</script>

<svelte:head>
	<title>AWGC — Automatic Water Gate Controller — Beacon Engineering</title>
	<meta name="description" content="AWGC Beacon Engineering: kontrol pintu air otomatis berbasis telemetri, remote control via STESY, fail-safe, auto-leveling." />
</svelte:head>

<!-- Breadcrumb -->
<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs" style="color: #9A9A9A;">
			<a href="/" class="hover:text-[#C8102E] transition-colors">Beranda</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#C8102E] transition-colors">Solusi</a>
			<ChevronRight size={11} />
			<a href="/solusi/water-security" class="hover:text-[#C8102E] transition-colors">Water Security</a>
			<ChevronRight size={11} />
			<span style="color: #C8102E;" class="font-medium">AWGC</span>
		</nav>
	</div>
</div>

<!-- Hero -->
<section class="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden">
	<!-- Subtle Grid Pattern -->
	<div class="absolute inset-0 z-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="space-y-6">
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Water Security</span>
					<span style="color: #E5E5E5;">·</span>
					<span class="text-xs" style="color: #9A9A9A;">Remote Control</span>
				</div>
				<h1
					class="font-heading text-3xl sm:text-4xl lg:text-[52px] font-extrabold leading-tight"
					style="letter-spacing: -0.03em; color: #1A1A1A; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 20}px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s;"
				>
					Kendalikan Pintu Air <span style="color: #C8102E;">dari Mana Saja</span>
				</h1>
				<div>
					<span class="font-heading text-xl font-bold" style="color: #1A1A1A;">AWGC</span>
					<span class="text-sm ml-2" style="color: #5C5C5C;">— Automatic Water Gate Controller</span>
				</div>
				<p class="text-base leading-relaxed" style="color: #5C5C5C;">
					Buka-tutup pintu air dari smartphone Anda. Tidak perlu lagi operator turun ke lapangan saat hujan deras tengah malam. Auto-leveling, fail-safe, audit-ready.
				</p>
				<div class="flex flex-wrap gap-3">
					<a href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWGC." target="_blank" rel="noopener"
						class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.02]"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);">
						<MessageCircle size={15} />
						Konsultasi AWGC
					</a>
					<button class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC]" style="border: 1.5px solid #E5E5E5; color: #1A1A1A;">
						<Download size={15} />
						Download Datasheet
					</button>
				</div>
			</div>

			<!-- Product Visual -->
			<div class="relative flex justify-center">
				<div class="relative w-64 h-80 rounded-3xl overflow-hidden" style="background: linear-gradient(180deg, #0EA5E9 0%, #0369A1 100%); box-shadow: 0 20px 60px rgba(14,165,233,0.2);">
					<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
						<Activity size={48} class="mb-4 opacity-80" />
						<span class="font-heading text-3xl font-extrabold">AWGC</span>
						<span class="text-xs mt-1 opacity-70 uppercase tracking-widest">BG-200</span>
						<div class="mt-6 w-full space-y-2">
							<div class="flex justify-between text-xs opacity-80">
								<span>Gate</span>
								<span class="font-mono tabular-nums">42.7%</span>
							</div>
							<div class="h-1 rounded-full bg-white/20">
								<div class="h-full rounded-full bg-white/80" style="width: 42.7%;"></div>
							</div>
							<div class="flex justify-between text-xs opacity-80">
								<span>Mode</span>
								<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Auto</span>
							</div>
						</div>
					</div>
				</div>
				<div class="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold" style="border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.06); color: #C8102E;">
					Fail-safe Certified
				</div>
			</div>
		</div>
	</div>

</section>

<!-- "Untuk Anda yang..." -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="font-heading text-2xl sm:text-3xl font-bold mb-8" style="color: #1A1A1A;">Untuk Anda yang Bertanggung Jawab Atas...</h2>
		<div class="flex flex-wrap justify-center gap-3">
			{#each useCases as useCase}
				<div class="px-5 py-3 rounded-xl text-sm font-medium bg-[#FAFAFA] transition-all hover:bg-[#FBE9EC] hover:-translate-y-0.5" style="border: 1px solid #E5E5E5; color: #3A3A3A;">
					{useCase}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- 6 Keunggulan -->
<section class="relative py-16 lg:py-24 overflow-hidden" style="background: linear-gradient(180deg, #FAFAFA 0%, #FFF5F6 100%);">
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Keunggulan</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">Mengapa AWGC Beacon</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feat, i}
				<div
					class="group p-6 rounded-2xl bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
					style="border: 1px solid #E5E5E5; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 24}px); transition: opacity 0.6s ease-out {0.3 + i * 0.08}s, transform 0.6s ease-out {0.3 + i * 0.08}s, box-shadow 0.3s;"
				>
					<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style="background: #FBE9EC;">
						<svelte:component this={feat.icon} size={18} style="color: #C8102E;" />
					</div>
					<h3 class="font-heading text-base font-bold mb-2 group-hover:text-[#C8102E] transition-colors" style="color: #1A1A1A;">{feat.title}</h3>
					<p class="text-sm leading-relaxed" style="color: #5C5C5C;">{feat.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Interactive Variant & Specs Explorer (SKILL: Bento 2.0 & Contextual UI) -->
<section class="relative py-24 lg:py-32 overflow-hidden bg-white">
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<div class="max-w-4xl mb-12 space-y-6 text-center mx-auto">
			<div class="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto" style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);">
				<span class="w-1.5 h-1.5 rounded-full" style="background: #C8102E;"></span>
				Varian & Spesifikasi
			</div>
			<h2 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter text-zinc-950">
				Pilih <span style="color: #C8102E;">Varian</span> yang <span class="text-zinc-400">Tepat</span>
			</h2>
		</div>

		<!-- Variant Selector Tabs -->
		<div class="flex flex-wrap items-center justify-center gap-4 mb-16">
			{#each variants as v, i}
				<button 
					onclick={() => activeVariant = i}
					class="group px-8 py-4 rounded-[1.25rem] text-left transition-all duration-500 min-w-[260px] cursor-pointer {activeVariant === i ? 'bg-[#C8102E] text-white shadow-[0_20px_40px_-15px_rgba(200,16,46,0.4)] -translate-y-1' : 'bg-[#FAFAFA] text-zinc-500 hover:bg-[#FBE9EC] hover:text-[#C8102E] border border-[#E5E5E5]'}"
				>
					<span class="block font-heading text-2xl font-extrabold transition-colors duration-300 {activeVariant === i ? 'text-white' : 'text-zinc-900 group-hover:text-[#C8102E]'}">{v.name}</span>
					<span class="block text-[11px] font-semibold uppercase tracking-widest mt-1 transition-colors duration-300 {activeVariant === i ? 'text-white/80' : 'text-zinc-400'}">{v.subtitle || 'Varian ' + v.name}</span>
				</button>
			{/each}
		</div>

		<!-- Active Variant Display -->
		<div class="relative min-h-[600px]">
			{#key activeVariant}
				<div class="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start animate-in fade-in slide-in-from-bottom-8 duration-500">
					
					<!-- Left: Variant Info & Image -->
					<div class="space-y-8">
						<div class="p-8 sm:p-10 rounded-[2.5rem] bg-[#FAFAFA] border border-[#E5E5E5] relative overflow-hidden group/card shadow-sm">
							<!-- Subtle liquid shine -->
							<div class="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none z-0"></div>
							
							<h3 class="relative z-10 font-heading text-4xl font-extrabold text-[#C8102E] tracking-tight mb-4">{variants[activeVariant].name}</h3>
							<p class="relative z-10 text-lg leading-relaxed text-zinc-600 font-medium mb-8 max-w-[40ch]">{variants[activeVariant].desc}</p>
							
							<div class="relative z-10 mb-10 inline-flex flex-col sm:flex-row sm:items-center gap-3 bg-white px-5 py-3.5 rounded-2xl border border-[#E5E5E5] shadow-sm">
								<span class="inline-flex text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Cocok Untuk</span>
								<span class="text-sm font-bold text-zinc-950">{variants[activeVariant].use || 'Berbagai kebutuhan'}</span>
							</div>

							<!-- Image Viewer -->
							<div class="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden bg-white/50 border border-[#E5E5E5] flex items-center justify-center p-8 group-hover/card:bg-white transition-colors duration-500">
								{#if variants[activeVariant].image}
									<img src={variants[activeVariant].image} alt="Varian {variants[activeVariant].name}" class="w-full h-full object-contain transition-transform duration-700 group-hover/card:scale-110 drop-shadow-2xl" />
								{:else}
									<div class="w-full h-full flex flex-col items-center justify-center">
										<div class="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
											<span class="font-heading font-bold text-zinc-300">{variants[activeVariant].name}</span>
										</div>
										<span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Gambar Menyusul</span>
									</div>
								{/if}
								<div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
							</div>
						</div>
					</div>

					<!-- Right: Technical Specs for this variant -->
					<div class="space-y-6 pt-4">
						<div class="flex items-center justify-between mb-4">
							<h3 class="font-heading text-2xl font-bold text-zinc-950">Spesifikasi Teknis</h3>
							<span class="px-3 py-1 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-500 font-mono border border-zinc-200">{variants[activeVariant].name}</span>
						</div>

						<ProductSpecs {variants} {activeVariant} />
					</div>

				</div>
			{/key}
		</div>
	</div>
</section>

<!-- Sudah Terpasang Di -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-10">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Track Record</span>
			<h2 class="font-heading text-3xl font-bold mt-3" style="color: #1A1A1A;">Sudah Terpasang Di</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each projects as proj}
				<div class="p-5 rounded-2xl bg-[#FAFAFA] hover:bg-[#FBE9EC] transition-all" style="border: 1px solid #E5E5E5;">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white tabular-nums" style="background: #C8102E;">{proj.year}</span>
						<div class="w-1.5 h-1.5 rounded-full bg-[#1B7F3A] animate-pulse-dot"></div>
					</div>
					<h3 class="font-heading text-sm font-bold" style="color: #1A1A1A;">{proj.name}</h3>
					<p class="text-xs mt-1" style="color: #5C5C5C;">{proj.client}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Premium Floating CTA (SKILL: Cockpit Mode) -->
<section class="relative py-20 bg-white">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 sm:p-16 lg:p-20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 group" style="box-shadow: 0 40px 80px -20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.05);">
			
			<!-- Subtle glow / Liquid Glass refraction -->
			<div class="absolute inset-0 bg-gradient-to-br from-[#C8102E]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>
			<div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C8102E]/10 blur-3xl pointer-events-none z-0"></div>

			<div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
				<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6" style="background: rgba(200,16,46,0.15); color: #FF4D6D; border: 1px solid rgba(200,16,46,0.3);">
					<span class="w-1.5 h-1.5 rounded-full" style="background: #FF4D6D; box-shadow: 0 0 10px #FF4D6D;"></span>
					Next Step
				</span>
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">Mulai Proyek dengan AWGC</h2>
				<p class="text-lg text-zinc-400 font-medium">Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<a href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWGC%20untuk%20proyek%20saya." target="_blank" rel="noopener"
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					Konsultasi AWGC
				</a>
				<a href="/solusi/water-security" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					Jelajahi Produk Lain
				</a>
			</div>
		</div>
	</div>
</section>
