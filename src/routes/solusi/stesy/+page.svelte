<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Activity,
		ArrowRight,
		BarChart3,
		Bell,
		BrainCircuit,
		Check,
		Cpu,
		Database,
		Download,
		FileText,
		MapPin,
		MessageCircle,
		Monitor,
		Radio,
		Smartphone,
		Sparkles,
		Wifi
	} from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	const systemPreviewImage = 'https://picsum.photos/seed/stesy-system-interface/1400/900';

	const heroStats = [
		{ label: 'Android', value: 'Beacon View', detail: 'Ponsel & tablet' },
		{ label: 'Apple', value: 'iPhone / iPad', detail: 'Tim lapangan dan manajemen' },
		{ label: 'Web', value: 'Browser', detail: 'Desktop command center' }
	];

	const telemetryRows = [
		{ station: 'AWLR Serayu', metric: 'TMA', value: '+1.42 m', status: 'Normal' },
		{ station: 'ARR Kalasan', metric: 'Hujan', value: '18.6 mm', status: 'Watch' },
		{ station: 'ADR Ciawi', metric: 'Shift', value: '0.021 mm', status: 'Normal' },
		{ station: 'AWQR Progo', metric: 'pH', value: '7.18', status: 'Normal' }
	];

	const aiQueue = [
		{ title: 'Anomali hujan terdeteksi', desc: 'ARR Kalasan naik 18.6 mm dalam 42 menit.', tone: 'warning' },
		{ title: 'Rekomendasi cek threshold', desc: 'Level AWLR Serayu mendekati batas siaga awal.', tone: 'critical' },
		{ title: 'Data gap recovery', desc: 'Impor SD Card Logger tersedia untuk 2 paket data.', tone: 'neutral' }
	];

	const aiCapabilities = [
		{
			icon: BrainCircuit,
			title: 'AI Trend Reading',
			desc: 'Membaca pola harian, bulanan, tahunan, dan rentang data untuk mempercepat interpretasi operator.'
		},
		{
			icon: Bell,
			title: 'Anomaly Triage',
			desc: 'Memprioritaskan pos yang perlu dicek berdasarkan lonjakan data, koneksi logger, dan status sensor.'
		},
		{
			icon: FileText,
			title: 'Report Assistant',
			desc: 'Membantu menyusun ringkasan analisis dari grafik, tabel, dan data ekspor operasional.'
		},
		{
			icon: Database,
			title: 'Data Continuity',
			desc: 'Mendukung input data SD Card Logger saat koneksi terganggu, lalu menyatukan kembali histori data.'
		}
	];

	const platformModules = [
		{
			icon: Monitor,
			title: 'Custom Dashboard',
			desc: 'Subdomain monitoring dengan logo instansi, daftar kategori logger, status koneksi, dan data sensor terbaru.'
		},
		{
			icon: MapPin,
			title: 'Location Map',
			desc: 'Titik logger tampil di peta dengan indikator koneksi sehingga operator langsung tahu lokasi yang perlu dicek.'
		},
		{
			icon: BarChart3,
			title: 'Analysis Workspace',
			desc: 'Analisis harian, bulanan, tahunan, dan rentang data. Grafik dan tabel siap diekspor untuk laporan.'
		},
		{
			icon: Download,
			title: 'Export Ready',
			desc: 'Data dapat diunduh sebagai CSV, Excel, PDF, PNG, dan JPG untuk audit, rapat teknis, atau arsip.'
		},
		{
			icon: Smartphone,
			title: 'Cross-Platform Access',
			desc: 'Akses monitoring dari Android, iPhone, iPad, tablet, dan komputer. Desain responsif untuk tim lapangan dan ruang komando.'
		},
		{
			icon: Wifi,
			title: 'API Integration',
			desc: 'Menerima integrasi data melalui POST dan GET untuk sistem lain yang perlu bertukar data sensor.'
		}
	];

	const benefits = [
		'Automatic measurement dengan intervensi manual minimal',
		'Remote measurement untuk mengurangi kunjungan langsung',
		'SSL/HTTPS, secure hosting, dan auth username-password',
		'Dapat menambahkan custom feature sesuai kebutuhan proyek'
	];

	const platformSupport = [
		{
			icon: Smartphone,
			label: 'Android',
			title: 'Beacon View untuk Android',
			desc: 'Operator lapangan bisa membuka dashboard, notifikasi, dan status pos langsung dari perangkat Android.'
		},
		{
			icon: Smartphone,
			label: 'Apple',
			title: 'Support iPhone & iPad',
			desc: 'Tim manajemen dan engineer tetap bisa memantau data STESY dari ekosistem Apple.'
		},
		{
			icon: Monitor,
			label: 'Web',
			title: 'Browser modern',
			desc: 'Ruang komando dapat mengakses dashboard penuh melalui Chrome, Mozilla, Edge, Safari, dan browser modern lain.'
		},
		{
			icon: Cpu,
			label: 'Responsive',
			title: 'Satu antarmuka adaptif',
			desc: 'Tampilan menyesuaikan kebutuhan desktop, tablet, dan ponsel tanpa memecah workflow operator.'
		}
	];

	const supportedFields = ['Hidrologi', 'Klimatologi', 'Geoteknik', 'Kualitas air', 'Kualitas udara', 'Panas bumi'];
</script>

<svelte:head>
	<title>STESY — Smart Telemetry Systems — Beacon Engineering</title>
	<meta
		name="description"
		content="STESY adalah platform Smart Telemetry Systems untuk monitoring perangkat telemetri, analisis AI, peta logger, grafik real-time, dan ekspor laporan."
	/>
</svelte:head>

<section class="relative overflow-hidden bg-[#F9FAFB] border-b border-[#E5E5E5]">
	<div
		class="absolute inset-0 pointer-events-none opacity-[0.035]"
		style="background-image: linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px); background-size: 44px 44px;"
	></div>
	<div
		class="absolute -right-28 top-24 h-[460px] w-[460px] rounded-full pointer-events-none opacity-[0.055]"
		style="border: 1px solid #C8102E;"
	></div>

	<div class="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
		<div class="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
			<div
				class="lg:col-span-5"
				style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 22}px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);"
			>
				<div
					class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] mb-6"
					style="background: rgba(200,16,46,0.07); color: #C8102E; border: 1px solid rgba(200,16,46,0.14);"
				>
					<Sparkles size={13} />
					Smart Telemetry Systems
				</div>

				<h1
					class="font-heading text-4xl md:text-5xl lg:text-[64px] font-extrabold tracking-tighter leading-[1.02] mb-6"
					style="color: #1A1A1A;"
				>
					Platform monitoring dengan analisis AI untuk seluruh perangkat telemetri.
				</h1>

				<p class="text-base md:text-lg leading-relaxed mb-8 max-w-[62ch]" style="color: #5C5C5C;">
					STESY menyatukan data hidrologi, klimatologi, geoteknik, kualitas lingkungan, dan perangkat IoT lain ke dashboard web yang siap diakses lintas platform. Operator bisa memantau, menganalisis, dan mengekspor data dari satu tempat.
				</p>

				<div class="flex flex-col sm:flex-row gap-3 mb-10">
					<a
						href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20minta%20demo%20STESY%20dengan%20fitur%20AI%20analysis."
						target="_blank"
						rel="noopener"
						class="btn-tactile inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[14px] text-sm font-semibold text-white"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 12px 24px -14px rgba(200,16,46,0.7);"
					>
						<MessageCircle size={17} />
						Minta Demo STESY
					</a>
					<a
						href="/solusi/stesy/smart-telemetry-system"
						class="btn-tactile inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[14px] text-sm font-semibold bg-white"
						style="border: 1px solid #E5E5E5; color: #1A1A1A;"
					>
						Detail Produk
						<ArrowRight size={16} />
					</a>
				</div>

				<div class="grid grid-cols-3 gap-3">
					{#each heroStats as stat}
						<div class="rounded-[18px] bg-white p-4" style="border: 1px solid #E5E5E5;">
							<span class="block text-[10px] font-bold uppercase tracking-[0.14em]" style="color: #9A9A9A;">{stat.label}</span>
							<span class="block font-mono text-lg sm:text-xl font-extrabold mt-2 tabular-nums" style="color: #1A1A1A;">{stat.value}</span>
							<span class="block text-[11px] mt-1 leading-snug" style="color: #7A7A7A;">{stat.detail}</span>
						</div>
					{/each}
				</div>
			</div>

			<div
				class="lg:col-span-7"
				style="opacity: {mounted ? 1 : 0}; transform: translateX({mounted ? 0 : 34}px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s;"
			>
				<div class="relative rounded-[2rem] lg:rounded-[2.5rem] bg-[#1A1A1A] p-3 sm:p-4 shadow-[0_24px_60px_-28px_rgba(26,26,26,0.45)]">
					<div class="absolute -left-6 top-16 hidden lg:block rounded-2xl bg-white/90 backdrop-blur-xl px-4 py-3 shadow-[0_18px_36px_-24px_rgba(26,26,26,0.5)]" style="border: 1px solid rgba(255,255,255,0.9);">
						<div class="flex items-center gap-3">
							<span class="relative flex h-2.5 w-2.5">
								<span class="absolute inline-flex h-full w-full rounded-full bg-[#1B7F3A] opacity-60 animate-ping"></span>
								<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1B7F3A]"></span>
							</span>
							<span class="text-xs font-bold" style="color: #1A1A1A;">347 pos online</span>
						</div>
					</div>

					<div class="rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden bg-white">
						<div class="flex items-center gap-2 px-4 py-3 bg-[#F5F5F5]" style="border-bottom: 1px solid #E5E5E5;">
							<div class="flex gap-1.5">
								<span class="h-2.5 w-2.5 rounded-full bg-[#C8102E]"></span>
								<span class="h-2.5 w-2.5 rounded-full bg-[#F5A623]"></span>
								<span class="h-2.5 w-2.5 rounded-full bg-[#1B7F3A]"></span>
							</div>
							<div class="flex-1 text-center">
								<span class="font-mono text-[10px] font-semibold" style="color: #7A7A7A;">monitoring.bejogja.com / ai-analysis</span>
							</div>
						</div>

						<div class="grid lg:grid-cols-[1.35fr_0.65fr] min-h-[500px] bg-[#FAFAFA]">
							<div class="relative min-h-[360px] overflow-hidden">
								<img
									src={systemPreviewImage}
									alt="Tampilan sistem STESY sementara"
									class="absolute inset-0 h-full w-full object-cover opacity-75 grayscale"
									loading="eager"
								/>
								<div class="absolute inset-0 bg-gradient-to-br from-white via-white/82 to-white/48"></div>
								<div class="relative h-full p-5 sm:p-7 lg:p-8">
									<div class="flex flex-wrap items-center justify-between gap-3 mb-6">
										<div>
											<p class="font-mono text-[11px] font-bold uppercase tracking-[0.18em]" style="color: #C8102E;">Command Center</p>
											<h2 class="font-heading text-2xl sm:text-3xl font-extrabold mt-1" style="color: #1A1A1A;">DAS Monitoring</h2>
										</div>
										<div class="rounded-xl bg-white/80 backdrop-blur-md px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]" style="border: 1px solid rgba(255,255,255,0.95);">
											<span class="font-mono text-xs font-bold tabular-nums" style="color: #1A1A1A;">Live 11:42 WIB</span>
										</div>
									</div>

									<div class="grid sm:grid-cols-3 gap-3 mb-4">
										{#each [{ label: 'Logger Online', value: '347' }, { label: 'Data Today', value: '18.704' }, { label: 'AI Flags', value: '6' }] as metric}
											<div class="rounded-2xl bg-white/82 backdrop-blur-xl p-4" style="border: 1px solid rgba(255,255,255,0.95);">
												<span class="block text-[10px] font-bold uppercase tracking-widest" style="color: #9A9A9A;">{metric.label}</span>
												<span class="block font-mono text-2xl font-extrabold mt-2 tabular-nums" style="color: #1A1A1A;">{metric.value}</span>
											</div>
										{/each}
									</div>

									<div class="grid md:grid-cols-[1fr_0.8fr] gap-4">
										<div class="rounded-[22px] bg-white/86 backdrop-blur-xl p-5" style="border: 1px solid rgba(255,255,255,0.95);">
											<div class="flex items-center justify-between mb-5">
												<span class="text-xs font-bold" style="color: #5C5C5C;">AI Trend Analysis</span>
												<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style="background: rgba(27,127,58,0.09); color: #1B7F3A;">
													<span class="h-1.5 w-1.5 rounded-full bg-[#1B7F3A] animate-pulse-dot"></span>
													Active
												</span>
											</div>
											<div class="relative h-36 overflow-hidden rounded-2xl bg-[#FAFAFA] px-4 pt-5" style="border: 1px solid #E5E5E5;">
												<div class="absolute inset-x-0 top-1/2 h-px bg-[#E5E5E5]"></div>
												<svg class="relative h-full w-full" viewBox="0 0 420 130" fill="none" preserveAspectRatio="none">
													<path d="M0 94 C45 86 62 69 100 76 C140 84 145 38 190 43 C235 47 248 91 288 77 C332 62 348 36 420 44" stroke="#C8102E" stroke-width="3" fill="none" stroke-linecap="round" class="stesy-chart-line" />
													<path d="M0 110 C60 104 72 95 112 94 C170 92 190 82 230 88 C284 96 338 76 420 78" stroke="#1B7F3A" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.55" class="stesy-chart-line-slow" />
												</svg>
												<div class="absolute left-[58%] top-8 rounded-xl bg-[#1A1A1A] px-3 py-2 text-white shadow-[0_12px_24px_-16px_rgba(26,26,26,0.7)]">
													<span class="block font-mono text-[10px] text-white/50">AI note</span>
													<span class="block text-xs font-bold">Rain spike likely</span>
												</div>
											</div>
										</div>

										<div class="rounded-[22px] bg-white/86 backdrop-blur-xl p-5" style="border: 1px solid rgba(255,255,255,0.95);">
											<div class="flex items-center justify-between mb-4">
												<span class="text-xs font-bold" style="color: #5C5C5C;">Logger Status</span>
												<Radio size={15} style="color: #C8102E;" />
											</div>
											<div class="space-y-2.5">
												{#each telemetryRows as row, i}
													<div class="flex items-center justify-between gap-3 rounded-xl bg-[#FAFAFA] px-3 py-2.5 stesy-row-rise" style="border: 1px solid #E5E5E5; animation-delay: {i * 90}ms;">
														<div class="min-w-0">
															<span class="block truncate text-xs font-bold" style="color: #1A1A1A;">{row.station}</span>
															<span class="block font-mono text-[10px]" style="color: #9A9A9A;">{row.metric}</span>
														</div>
														<div class="text-right">
															<span class="block font-mono text-xs font-bold tabular-nums" style="color: #1A1A1A;">{row.value}</span>
															<span class="text-[10px] font-bold uppercase tracking-wider" style="color: {row.status === 'Watch' ? '#F5A623' : '#1B7F3A'};">{row.status}</span>
														</div>
													</div>
												{/each}
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="bg-[#1A1A1A] p-5 sm:p-6 lg:p-7 text-white">
								<div class="flex items-center justify-between mb-7">
									<div>
										<p class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">AI Copilot</p>
										<h3 class="font-heading text-xl font-extrabold mt-1">Analisa otomatis</h3>
									</div>
									<BrainCircuit size={24} class="text-white/70" />
								</div>

								<div class="rounded-2xl bg-white/7 p-4 mb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" style="border: 1px solid rgba(255,255,255,0.08);">
									<div class="flex items-center gap-2 text-sm text-white/80">
										<span class="font-mono text-[#FFB4C1]">~%</span>
										<span>buat analisa hujan 24 jam terakhir</span>
										<span class="stesy-cursor">_</span>
									</div>
									<div class="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
										<div class="h-full w-2/3 rounded-full stesy-shimmer" style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);"></div>
									</div>
								</div>

								<div class="space-y-3">
									{#each aiQueue as item}
										<div class="rounded-2xl bg-white/6 p-4" style="border: 1px solid rgba(255,255,255,0.08);">
											<div class="flex items-start gap-3">
												<span class="mt-1 h-2 w-2 rounded-full shrink-0" style="background: {item.tone === 'critical' ? '#C8102E' : item.tone === 'warning' ? '#F5A623' : '#9A9A9A'};"></span>
												<div>
													<h4 class="text-sm font-bold">{item.title}</h4>
													<p class="text-xs leading-relaxed text-white/52 mt-1">{item.desc}</p>
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="relative bg-white py-16 lg:py-20 overflow-hidden">
	<Ornaments />
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
			<div>
				<span class="text-xs font-bold uppercase tracking-[0.18em]" style="color: #C8102E;">Dari Brosur STESY</span>
				<h2 class="font-heading text-3xl md:text-4xl font-extrabold tracking-tighter mt-3 max-w-[14ch]" style="color: #1A1A1A;">
					Dibangun untuk monitoring berkelanjutan.
				</h2>
			</div>
			<div class="flex flex-wrap gap-2 max-w-2xl">
				{#each supportedFields as field}
					<span class="rounded-full bg-[#FAFAFA] px-4 py-2 text-xs font-bold" style="border: 1px solid #E5E5E5; color: #5C5C5C;">{field}</span>
				{/each}
			</div>
		</div>

		<div class="grid lg:grid-cols-12 gap-5">
			<div class="lg:col-span-5 rounded-[2rem] bg-[#FAFAFA] p-6 sm:p-8" style="border: 1px solid #E5E5E5;">
				<div class="flex items-center gap-3 mb-6">
					<div class="h-11 w-11 rounded-2xl bg-white flex items-center justify-center" style="border: 1px solid #E5E5E5;">
						<Database size={19} style="color: #C8102E;" />
					</div>
					<div>
						<h3 class="font-heading text-xl font-extrabold" style="color: #1A1A1A;">Subdomain dan database sensor</h3>
						<p class="text-sm mt-1" style="color: #7A7A7A;">Struktur monitoring siap dipakai untuk membaca data pos, logger, dan sensor.</p>
					</div>
				</div>
				<div class="space-y-3">
					{#each benefits as benefit}
						<div class="flex items-start gap-3 rounded-2xl bg-white p-4" style="border: 1px solid #E5E5E5;">
							<Check size={16} class="mt-0.5 shrink-0 text-[#1B7F3A]" />
							<span class="text-sm leading-relaxed" style="color: #3A3A3A;">{benefit}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="lg:col-span-7 grid sm:grid-cols-2 gap-5">
				{#each aiCapabilities as capability}
					{@const CapabilityIcon = capability.icon}
					<div class="group rounded-[2rem] bg-white p-6 sm:p-7 transition-transform duration-300 hover:-translate-y-1" style="border: 1px solid #E5E5E5; box-shadow: 0 20px 40px -30px rgba(26,26,26,0.18);">
						<div class="h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105" style="background: #FBE9EC; border: 1px solid rgba(200,16,46,0.12);">
							<CapabilityIcon size={20} style="color: #C8102E;" />
						</div>
						<h3 class="font-heading text-lg font-extrabold mb-2" style="color: #1A1A1A;">{capability.title}</h3>
						<p class="text-sm leading-relaxed" style="color: #5C5C5C;">{capability.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<section id="stesy-features" class="relative py-16 lg:py-24 bg-[#F9FAFB] border-y border-[#E5E5E5] overflow-hidden">
	<div class="absolute inset-x-0 top-0 h-px bg-white"></div>
	<div class="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
			<div class="lg:col-span-4 lg:sticky lg:top-28">
				<span class="text-xs font-bold uppercase tracking-[0.18em]" style="color: #C8102E;">Platform Modules</span>
				<h2 class="font-heading text-3xl md:text-5xl font-extrabold tracking-tighter leading-[1.05] mt-3 mb-5" style="color: #1A1A1A;">
					Menu inti yang dipakai operator setiap hari.
				</h2>
				<p class="text-base leading-relaxed mb-8" style="color: #5C5C5C;">
					Strukturnya mengikuti kebutuhan operasional lapangan: lihat status pos, buka peta, analisis data, ekspor laporan, lalu tindak lanjuti alarm.
				</p>
				<a
					href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20melihat%20demo%20dashboard%20STESY."
					target="_blank"
					rel="noopener"
					class="btn-tactile inline-flex items-center gap-2 rounded-[14px] px-6 py-3 text-sm font-semibold text-white"
					style="background: #1A1A1A;"
				>
					Lihat Demo Dashboard
					<ArrowRight size={16} />
				</a>
			</div>

			<div class="lg:col-span-8 grid md:grid-cols-2 gap-5">
				{#each platformModules as module, i}
					{@const ModuleIcon = module.icon}
					<div class="group rounded-[2rem] bg-white p-6 sm:p-8 stesy-card-in" style="border: 1px solid #E5E5E5; animation-delay: {i * 70}ms;">
						<div class="flex items-start justify-between gap-5 mb-8">
							<div class="h-12 w-12 rounded-2xl flex items-center justify-center" style="background: #FBE9EC;">
								<ModuleIcon size={20} style="color: #C8102E;" />
							</div>
							<span class="font-mono text-xs font-bold tabular-nums" style="color: #D1D1D1;">0{i + 1}</span>
						</div>
						<h3 class="font-heading text-xl font-extrabold mb-3" style="color: #1A1A1A;">{module.title}</h3>
						<p class="text-sm leading-relaxed" style="color: #5C5C5C;">{module.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<section class="relative bg-white py-16 lg:py-24 overflow-hidden">
	<Ornaments variant="dense" />
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center">
			<div>
				<span class="text-xs font-bold uppercase tracking-[0.18em]" style="color: #C8102E;">Cross-Platform Support</span>
				<h2 class="font-heading text-3xl md:text-5xl font-extrabold tracking-tighter leading-[1.05] mt-3 mb-5" style="color: #1A1A1A;">
					Akses STESY dari Android, Apple, dan browser modern.
				</h2>
				<p class="text-base leading-relaxed mb-8" style="color: #5C5C5C;">
					Satu dashboard untuk ruang komando dan satu pengalaman responsif untuk tim lapangan. Fokusnya bukan spesifikasi perangkat, tetapi akses cepat lintas platform.
				</p>
				<div class="flex flex-wrap gap-3">
					<span class="inline-flex items-center gap-2 rounded-full bg-[#FAFAFA] px-4 py-2 text-xs font-bold" style="border: 1px solid #E5E5E5; color: #1A1A1A;">
						<Smartphone size={14} style="color: #C8102E;" />
						Android Ready
					</span>
					<span class="inline-flex items-center gap-2 rounded-full bg-[#FAFAFA] px-4 py-2 text-xs font-bold" style="border: 1px solid #E5E5E5; color: #1A1A1A;">
						<Monitor size={14} style="color: #C8102E;" />
						Apple & Web
					</span>
				</div>
			</div>

			<div class="rounded-[2.25rem] bg-[#1A1A1A] p-4 sm:p-5 shadow-[0_28px_58px_-34px_rgba(26,26,26,0.55)]">
				<div class="grid sm:grid-cols-2 gap-2">
					{#each platformSupport as platform}
						{@const PlatformIcon = platform.icon}
						<div class="rounded-[1.5rem] bg-white/6 p-5" style="border: 1px solid rgba(255,255,255,0.08);">
							<div class="flex items-center gap-3 mb-4">
								<div class="h-10 w-10 rounded-xl bg-white/8 flex items-center justify-center">
									<PlatformIcon size={18} style="color: #FFFFFF;" />
								</div>
								<span class="text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">{platform.label}</span>
							</div>
							<h3 class="font-heading text-lg font-extrabold text-white">{platform.title}</h3>
							<p class="text-xs leading-relaxed text-white/52 mt-2">{platform.desc}</p>
						</div>
					{/each}
				</div>
				<div class="mt-3 rounded-[1.5rem] bg-white p-5 sm:p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="h-10 w-10 rounded-xl flex items-center justify-center" style="background: #FBE9EC;">
							<Activity size={18} style="color: #C8102E;" />
						</div>
						<div>
							<h3 class="font-heading text-lg font-extrabold" style="color: #1A1A1A;">Satu akses untuk semua peran</h3>
							<p class="text-xs mt-0.5" style="color: #7A7A7A;">Operator, engineer, dan manajemen bisa membuka data yang sama dari perangkat berbeda.</p>
						</div>
					</div>
					<div class="h-2 rounded-full bg-[#F5F5F5] overflow-hidden">
						<div class="h-full w-[78%] rounded-full stesy-scan" style="background: linear-gradient(90deg, #C8102E, #A50D25);"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="relative py-20 bg-[#F9FAFB]">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-[2.5rem] bg-[#1A1A1A] p-8 sm:p-12 lg:p-16">
			<div class="absolute inset-0 pointer-events-none opacity-[0.08]" style="background-image: radial-gradient(#FFFFFF 1px, transparent 1px); background-size: 24px 24px;"></div>
			<div class="relative grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
				<div class="lg:col-span-7">
					<span class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] mb-6 text-white/70" style="border: 1px solid rgba(255,255,255,0.12);">
						<span class="h-1.5 w-1.5 rounded-full bg-[#C8102E]"></span>
						STESY AI Analysis Ready
					</span>
					<h2 class="font-heading text-3xl md:text-5xl font-extrabold tracking-tighter leading-[1.05] text-white mb-5">
						Bawa data lapangan ke dashboard yang bisa dibaca cepat oleh tim teknis.
					</h2>
					<p class="text-base leading-relaxed text-white/56 max-w-[62ch]">
						Kami bisa bantu setup subdomain, struktur pos, kategori logger, user access, dan format laporan sesuai kebutuhan instansi.
					</p>
				</div>
				<div class="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
					<a
						href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20setup%20STESY%20untuk%20monitoring%20telemetri."
						target="_blank"
						rel="noopener"
						class="btn-tactile inline-flex items-center justify-center gap-2 rounded-[14px] bg-white px-7 py-4 text-sm font-bold"
						style="color: #1A1A1A;"
					>
						<MessageCircle size={18} />
						Konsultasi Setup
					</a>
					<a
						href="/solusi"
						class="btn-tactile inline-flex items-center justify-center gap-2 rounded-[14px] px-7 py-4 text-sm font-bold text-white"
						style="border: 1px solid rgba(255,255,255,0.14);"
					>
						Jelajahi Perangkat
						<ArrowRight size={18} />
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.stesy-chart-line {
		stroke-dasharray: 620;
		stroke-dashoffset: 620;
		animation: stesyDraw 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.stesy-chart-line-slow {
		stroke-dasharray: 620;
		stroke-dashoffset: 620;
		animation: stesyDraw 3.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
	}

	.stesy-shimmer {
		animation: stesyShimmer 1.8s ease-in-out infinite;
	}

	.stesy-cursor {
		animation: stesyBlink 1s steps(2, start) infinite;
	}

	.stesy-row-rise,
	.stesy-card-in {
		opacity: 0;
		transform: translateY(12px);
		animation: stesyRise 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.stesy-scan {
		transform-origin: left center;
		animation: stesyScan 3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
	}

	@keyframes stesyDraw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes stesyShimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(150%);
		}
	}

	@keyframes stesyBlink {
		50% {
			opacity: 0;
		}
	}

	@keyframes stesyRise {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes stesyScan {
		0%,
		100% {
			transform: scaleX(0.72);
		}
		50% {
			transform: scaleX(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stesy-chart-line,
		.stesy-chart-line-slow,
		.stesy-shimmer,
		.stesy-cursor,
		.stesy-row-rise,
		.stesy-card-in,
		.stesy-scan {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
			stroke-dashoffset: 0 !important;
		}
	}
</style>
