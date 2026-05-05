<script lang="ts">
	import { onMount } from 'svelte';
	import { Check, ArrowRight } from '@lucide/svelte';

	let visible = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) visible = true; },
			{ threshold: 0.2 }
		);
		const el = document.getElementById('stesy-spotlight');
		if (el) observer.observe(el);
		return () => observer.disconnect();
	});

	const features = [
		'Cross-platform: Windows, macOS, iOS, Android',
		'Grafik historis & analytics',
		'Integrasi monitoring CCTV',
		'Alarm otomatis untuk threshold kritis'
	];
</script>

<section id="stesy-spotlight" class="relative py-20 lg:py-28 overflow-hidden" style="background: linear-gradient(180deg, #FAFAFA 0%, #FFF5F6 50%, #FBE9EC 100%);">
	<!-- Decorative ornaments — SKILL: Asymmetric scatter for DESIGN_VARIANCE 8 -->
	<div class="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none opacity-[0.06]" style="border: 2px solid #C8102E;"></div>
	<div class="absolute -top-8 -left-8 w-40 h-40 rounded-full pointer-events-none opacity-[0.04]" style="border: 1.5px solid #C8102E;"></div>
	<div class="absolute -bottom-20 -right-20 w-72 h-72 rounded-full pointer-events-none opacity-[0.04]" style="border: 2px solid #C8102E;"></div>

	<!-- Floating diamonds -->
	<div class="absolute top-10 right-[5%] w-8 h-8 rotate-45 rounded-sm pointer-events-none opacity-[0.06]" style="background: #C8102E;"></div>
	<div class="absolute bottom-[20%] left-[4%] w-10 h-10 rotate-45 rounded-lg pointer-events-none opacity-[0.04] animate-float" style="background: #C8102E;"></div>
	<div class="absolute top-[40%] right-[3%] w-5 h-5 rotate-45 pointer-events-none opacity-[0.04]" style="border: 1.5px solid #C8102E;"></div>

	<!-- Concentric circles -->
	<svg class="absolute bottom-10 left-[8%] w-12 h-12 opacity-[0.05] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="1.5">
		<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
	</svg>

	<!-- Plus signs -->
	<svg class="absolute top-[25%] right-[8%] w-7 h-7 opacity-[0.05] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="2">
		<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
	</svg>
	<svg class="absolute bottom-[35%] left-[2%] w-6 h-6 opacity-[0.03] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="2">
		<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
	</svg>

	<!-- Dot grid cluster -->
	<svg class="absolute top-[55%] right-[5%] w-14 h-14 opacity-[0.04] pointer-events-none" viewBox="0 0 40 40" fill="#C8102E">
		<circle cx="5" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="25" cy="5" r="2"/><circle cx="35" cy="5" r="2"/>
		<circle cx="5" cy="15" r="2"/><circle cx="15" cy="15" r="2"/><circle cx="25" cy="15" r="2"/><circle cx="35" cy="15" r="2"/>
		<circle cx="5" cy="25" r="2"/><circle cx="15" cy="25" r="2"/><circle cx="25" cy="25" r="2"/><circle cx="35" cy="25" r="2"/>
	</svg>

	<!-- Wavy line -->
	<svg class="absolute top-[70%] left-[1%] w-24 h-8 opacity-[0.04] pointer-events-none" viewBox="0 0 100 30" fill="none">
		<path d="M0,15 Q25,0 50,15 T100,15" stroke="#C8102E" stroke-width="2" fill="none"/>
	</svg>

	<!-- Triangle -->
	<svg class="absolute top-[15%] left-[6%] w-8 h-8 opacity-[0.04] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="1.5">
		<polygon points="12,3 22,21 2,21"/>
	</svg>

	<!-- Arc -->
	<svg class="absolute bottom-[8%] right-[7%] w-14 h-14 opacity-[0.03] pointer-events-none" viewBox="0 0 50 50" fill="none">
		<path d="M0,50 A50,50 0 0,1 50,0" stroke="#C8102E" stroke-width="2" fill="none"/>
	</svg>

	<!-- Hexagon -->
	<svg class="absolute bottom-[25%] right-[14%] w-9 h-9 opacity-[0.03] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="1.5">
		<polygon points="12,2 21,7 21,17 12,22 3,17 3,7"/>
	</svg>

	<!-- Scattered small circles -->
	<div class="absolute top-[30%] left-[14%] w-3 h-3 rounded-full pointer-events-none opacity-[0.05]" style="background: #C8102E;"></div>
	<div class="absolute top-[65%] right-[12%] w-2 h-2 rounded-full pointer-events-none opacity-[0.04]" style="background: #C8102E;"></div>
	<div class="absolute bottom-[15%] left-[18%] w-4 h-4 rounded-full pointer-events-none opacity-[0.03]" style="border: 1.5px solid #C8102E;"></div>

	<!-- Dotted vertical line -->
	<svg class="absolute top-[30%] right-[1.5%] w-1 h-24 opacity-[0.04] pointer-events-none" viewBox="0 0 4 100" fill="none">
		<line x1="2" y1="0" x2="2" y2="100" stroke="#C8102E" stroke-width="2" stroke-dasharray="4 6"/>
	</svg>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
			<!-- Left: Mock Dashboard -->
			<div
				style="
					opacity: {visible ? 1 : 0};
					transform: translateX({visible ? 0 : -40}px);
					transition: opacity 0.8s ease-out, transform 0.8s ease-out;
				"
			>
				<!-- Laptop mockup with bright theme -->
				<div class="relative rounded-[24px] overflow-hidden p-[2px]" style="background: linear-gradient(135deg, #C8102E 0%, #E5E5E5 50%, #C8102E 100%); box-shadow: 0 20px 60px rgba(0,0,0,0.08);">
					<div class="rounded-[22px] overflow-hidden bg-white">
						<!-- Top bar -->
						<div class="flex items-center gap-2 px-4 py-2.5" style="background: #F5F5F5; border-bottom: 1px solid #E5E5E5;">
							<div class="flex gap-1.5">
								<div class="w-2.5 h-2.5 rounded-full" style="background: #FF5F56;"></div>
								<div class="w-2.5 h-2.5 rounded-full" style="background: #FFBD2E;"></div>
								<div class="w-2.5 h-2.5 rounded-full" style="background: #27C93F;"></div>
							</div>
							<div class="flex-1 text-center">
								<span class="text-[10px] font-mono" style="color: #9A9A9A;">stesy.bejogja.com</span>
							</div>
						</div>

						<!-- Dashboard content -->
						<div class="p-4 space-y-3" style="background: #FAFAFA;">
							<!-- Stats row -->
							<div class="grid grid-cols-4 gap-2">
								{#each [
									{ label: 'Active', value: '47', color: '#1B7F3A' },
									{ label: 'Data Pts', value: '12.4K', color: '#C8102E' },
									{ label: 'Uptime', value: '98.7%', color: '#F5A623' },
									{ label: 'Alerts', value: '2', color: '#C8102E' }
								] as stat}
									<div class="rounded-xl p-2.5 bg-white" style="border: 1px solid #E5E5E5;">
										<span class="block text-[9px] uppercase tracking-wider" style="color: #9A9A9A;">{stat.label}</span>
										<span class="block text-lg font-mono font-bold mt-0.5 tabular-nums" style="color: {stat.color};">{stat.value}</span>
									</div>
								{/each}
							</div>

							<!-- Chart mock -->
							<div class="rounded-xl p-3 bg-white" style="border: 1px solid #E5E5E5;">
								<div class="flex items-center justify-between mb-2">
									<span class="text-[10px] font-medium" style="color: #5C5C5C;">Water Level — Bendungan Ciawi</span>
									<span class="text-[9px]" style="color: #9A9A9A;">Last 24h</span>
								</div>
								<svg class="w-full h-16" viewBox="0 0 300 60" fill="none">
									<defs>
										<linearGradient id="chartGradLight" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" style="stop-color: #C8102E; stop-opacity: 0.15;" />
											<stop offset="100%" style="stop-color: #C8102E; stop-opacity: 0;" />
										</linearGradient>
									</defs>
									<path d="M0,40 Q30,35 60,38 T120,30 T180,25 T240,32 T300,20" stroke="#C8102E" stroke-width="2" fill="none" style="stroke-dasharray: 400; stroke-dashoffset: 400; animation: chartDraw 4s ease-out infinite alternate;" />
									<path d="M0,40 Q30,35 60,38 T120,30 T180,25 T240,32 T300,20 V60 H0 Z" fill="url(#chartGradLight)" style="opacity: 0; animation: fadeUp 4s ease-out infinite alternate;" />
								</svg>
							</div>

							<!-- Station list -->
							<div class="space-y-1.5">
								{#each [
									{ name: 'AWLR Cipanas', val: '142.3m' },
									{ name: 'ADR Ciawi', val: '0.02mm' },
									{ name: 'EWS Bogowonto', val: 'Level 1' }
								] as station}
									<div class="flex items-center justify-between rounded-xl px-3 py-2 bg-white" style="border: 1px solid #E5E5E5;">
										<div class="flex items-center gap-2">
											<div class="w-1.5 h-1.5 rounded-full bg-[#1B7F3A] animate-pulse-dot"></div>
											<span class="text-xs font-medium" style="color: #1A1A1A;">{station.name}</span>
										</div>
										<span class="text-xs font-mono tabular-nums" style="color: #5C5C5C;">{station.val}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Floating phone mockup -->
				<div class="absolute -bottom-4 -right-4 w-32 rounded-[16px] overflow-hidden hidden md:block bg-white" style="border: 1px solid #E5E5E5; box-shadow: 0 12px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3);">
					<div class="p-2 space-y-1.5" style="background: #FAFAFA;">
						<div class="rounded-lg p-2 bg-white" style="border: 1px solid #E5E5E5;">
							<span class="text-[8px] block" style="color: #9A9A9A;">Bendungan IKN</span>
							<span class="text-sm font-mono font-bold" style="color: #1A1A1A;">86.4m</span>
						</div>
						<div class="rounded-lg p-2 bg-white" style="border: 1px solid #E5E5E5;">
							<span class="text-[8px] block" style="color: #9A9A9A;">Curah Hujan</span>
							<span class="text-sm font-mono font-bold" style="color: #1A1A1A;">5.2mm</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Copy -->
			<div
				class="space-y-8"
				style="
					opacity: {visible ? 1 : 0};
					transform: translateX({visible ? 0 : 40}px);
					transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s;
				"
			>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);">
					<span class="w-1.5 h-1.5 rounded-full" style="background: #C8102E;"></span>
					Platform Monitoring
				</div>
				<h2 class="font-heading text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-zinc-950 leading-[1.05] tracking-tighter">
					Satu Layar untuk Memantau <br /> <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(135deg, #FF5F56 0%, #C8102E 50%, #8A0B1F 100%);">Semua Aset Anda</span>
				</h2>
				<div>
					<span class="font-heading text-lg font-semibold" style="color: #1A1A1A;">STESY — Smart Telemetry System</span>
				</div>
				<p class="text-base leading-relaxed" style="color: #5C5C5C;">
					Bayangkan: ketinggian air Bendungan A, curah hujan Stasiun B, deformasi Lereng C, status pintu air Bendung D — semua di satu dashboard. Real-time. Dari mana saja.
				</p>

				<ul class="space-y-3">
					{#each features as feature}
						<li class="flex items-start gap-3">
							<div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style="background: #FBE9EC;">
								<Check size={12} style="color: #C8102E;" />
							</div>
							<span class="text-sm" style="color: #3A3A3A;">{feature}</span>
						</li>
					{/each}
				</ul>

				<div class="flex flex-col sm:flex-row gap-3 pt-4">
					<a
						href="/solusi/stesy"
						class="btn-tactile inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white"
						style="background: linear-gradient(135deg, #C8102E 0%, #A50D25 100%); box-shadow: 0 4px 12px rgba(200,16,46,0.25);"
					>
						Lihat Demo STESY
						<ArrowRight size={14} />
					</a>
					<a
						href="/solusi/stesy"
						class="btn-tactile inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all duration-200 hover:bg-[#FBE9EC]"
						style="border: 1.5px solid #E5E5E5; color: #1A1A1A;"
					>
						Pelajari Lebih Lanjut
					</a>
				</div>
			</div>
		</div>
	</div>

</section>
