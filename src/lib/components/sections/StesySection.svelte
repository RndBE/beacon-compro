<script lang="ts">
	import { locale } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { Activity, ArrowRight, CloudRain, RadioTower, ShieldAlert } from '@lucide/svelte';

	let visible = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) visible = true;
			},
			{ threshold: 0.2 }
		);
		const el = document.getElementById('stesy-spotlight');
		if (el) observer.observe(el);
		return () => observer.disconnect();
	});

	const stats = [
		{ label: 'Active', value: '47', color: '#167A3A' },
		{ label: 'Data Pts', value: '12.4K', color: '#C8102E' },
		{ label: 'Uptime', value: '98.7%', color: '#A66B00' },
		{ label: 'Alerts', value: '2', color: '#C8102E' }
	];

	const stations = [
		{ name: 'AWLR Cipanas', value: '142.3m', tone: 'Normal' },
		{ name: 'ADR Ciawi', value: '0.02mm', tone: 'Stabil' },
		{ name: 'EWS Bogowonto', value: 'Level 1', tone: 'Siaga' }
	];

	const featureIcons = [RadioTower, Activity, CloudRain, ShieldAlert];

	const features = $derived([
		$locale === 'EN' ? 'Cross-platform: Windows, macOS, iOS, Android' : 'Cross-platform: Windows, macOS, iOS, Android',
		$locale === 'EN' ? 'Historical charts & analytics' : 'Grafik historis & analitik',
		$locale === 'EN' ? 'CCTV monitoring integration' : 'Integrasi monitoring CCTV',
		$locale === 'EN' ? 'Automatic alarms for critical thresholds' : 'Alarm otomatis untuk threshold kritis'
	]);
</script>

<section
	id="stesy-spotlight"
	class="relative overflow-hidden py-16 sm:py-20 lg:py-28"
	style="background: linear-gradient(180deg, #FFFFFF 0%, #FFF7F8 48%, #FBE9EC 100%);"
>
	<div class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(200,16,46,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(200,16,46,0.045)_1px,transparent_1px)] bg-[size:56px_56px] opacity-70"></div>
	<div class="pointer-events-none absolute left-0 top-20 h-56 w-[34vw] rounded-r-full bg-white/80 blur-3xl"></div>
	<div class="pointer-events-none absolute bottom-0 right-0 h-72 w-[42vw] rounded-l-full bg-[#f4cdd3]/55 blur-3xl"></div>
	<div class="pointer-events-none absolute left-[5%] top-[18%] hidden h-24 w-24 rounded-full border border-[#C8102E]/10 lg:block"></div>
	<div class="pointer-events-none absolute bottom-[14%] right-[8%] hidden h-3 w-3 rounded-full bg-[#C8102E]/30 lg:block"></div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
			<div
				class="relative order-2 lg:order-1"
				style="
					opacity: {visible ? 1 : 0};
					transform: translate3d({visible ? 0 : -32}px, {visible ? 0 : 16}px, 0);
					transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
				"
			>
				<div class="absolute -left-5 top-8 hidden h-20 w-20 rounded-full border border-[#C8102E]/15 md:block"></div>
				<div class="absolute -bottom-7 left-14 hidden h-10 w-10 rotate-45 rounded-md bg-[#C8102E]/10 md:block"></div>

				<div class="relative rounded-[26px] border border-[#C8102E]/20 bg-white/70 p-2 shadow-[0_28px_80px_-46px_rgba(111,12,28,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
					<div class="overflow-hidden rounded-[20px] border border-[#E7D8DA] bg-[#FBFBFB]">
						<div class="flex items-center gap-3 border-b border-[#E7D8DA] bg-white/80 px-4 py-3">
							<div class="flex gap-1.5">
								<span class="h-2.5 w-2.5 rounded-full bg-[#E45D55]"></span>
								<span class="h-2.5 w-2.5 rounded-full bg-[#DCA630]"></span>
								<span class="h-2.5 w-2.5 rounded-full bg-[#2C9A4F]"></span>
							</div>
							<div class="flex flex-1 justify-center">
								<span class="rounded-full border border-[#E7D8DA] bg-[#FAFAFA] px-3 py-1 font-mono text-[10px] text-[#777]">stesy.bejogja.com</span>
							</div>
							<div class="hidden items-center gap-1.5 rounded-full bg-[#ECF8EF] px-2.5 py-1 text-[10px] font-semibold text-[#167A3A] sm:flex">
								<span class="h-1.5 w-1.5 rounded-full bg-[#167A3A] animate-pulse-dot"></span>
								LIVE
							</div>
						</div>

						<div class="grid gap-3 p-3 sm:p-4">
							<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{#each stats as stat, index}
									<div
										class="rounded-2xl border border-[#E7D8DA] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
										style="animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) both; animation-delay: {index * 80}ms;"
									>
										<span class="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8B8586]">{stat.label}</span>
										<span class="mt-1 block font-mono text-xl font-extrabold tabular-nums" style="color: {stat.color};">{stat.value}</span>
									</div>
								{/each}
							</div>

							<div class="grid gap-3 lg:grid-cols-[1fr_150px]">
								<div class="rounded-2xl border border-[#E7D8DA] bg-white p-4">
									<div class="mb-3 flex items-start justify-between gap-4">
										<div>
											<p class="text-xs font-semibold text-[#272123]">{$locale === 'EN' ? 'Water Level - Ciawi Dam' : 'Tinggi Muka Air - Bendungan Ciawi'}</p>
											<p class="mt-0.5 text-[10px] text-[#8B8586]">{$locale === 'EN' ? 'Last 24 hours telemetry' : 'Telemetri 24 jam terakhir'}</p>
										</div>
										<span class="rounded-full bg-[#FBE9EC] px-2.5 py-1 font-mono text-[10px] font-bold text-[#A50D25]">+8.2%</span>
									</div>
									<svg class="h-28 w-full" viewBox="0 0 420 130" fill="none" aria-hidden="true">
										<defs>
											<linearGradient id="stesyChartFill" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stop-color="#C8102E" stop-opacity="0.18" />
												<stop offset="100%" stop-color="#C8102E" stop-opacity="0" />
											</linearGradient>
										</defs>
										{#each [25, 55, 85, 115] as y}
											<path d="M0 {y}H420" stroke="#EEE4E6" stroke-width="1" />
										{/each}
										<path d="M0 88C37 73 57 77 90 80C128 84 150 54 190 58C230 62 236 34 278 42C323 51 341 82 382 62C399 54 409 48 420 43V130H0V88Z" fill="url(#stesyChartFill)" />
										<path class="stesy-chart-line" d="M0 88C37 73 57 77 90 80C128 84 150 54 190 58C230 62 236 34 278 42C323 51 341 82 382 62C399 54 409 48 420 43" stroke="#C8102E" stroke-width="3" stroke-linecap="round" fill="none" />
										<circle cx="420" cy="43" r="5" fill="#C8102E" />
									</svg>
								</div>

								<div class="grid grid-cols-2 gap-3 lg:grid-cols-1">
									<div class="rounded-2xl border border-[#E7D8DA] bg-[#21191B] p-3 text-white">
										<span class="text-[10px] font-medium text-white/55">{$locale === 'EN' ? 'Gate Status' : 'Status Pintu'}</span>
										<span class="mt-2 block font-mono text-xl font-extrabold tabular-nums">04/06</span>
										<span class="mt-1 block text-[10px] text-white/60">{$locale === 'EN' ? 'open safely' : 'terbuka aman'}</span>
									</div>
									<div class="rounded-2xl border border-[#E7D8DA] bg-white p-3">
										<span class="text-[10px] font-medium text-[#8B8586]">{$locale === 'EN' ? 'Rainfall' : 'Curah Hujan'}</span>
										<span class="mt-2 block font-mono text-xl font-extrabold text-[#272123] tabular-nums">5.2mm</span>
										<span class="mt-1 block text-[10px] text-[#8B8586]">AWS Sentul</span>
									</div>
								</div>
							</div>

							<div class="grid gap-2">
								{#each stations as station, index}
									<div
										class="group grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-[#E7D8DA] bg-white px-3 py-2.5 transition duration-300 hover:-translate-y-0.5 hover:border-[#C8102E]/30"
										style="animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) both; animation-delay: {260 + index * 90}ms;"
									>
										<div class="flex min-w-0 items-center gap-2.5">
											<span class="h-2 w-2 shrink-0 rounded-full bg-[#167A3A] animate-pulse-dot"></span>
											<span class="truncate text-xs font-semibold text-[#272123]">{station.name}</span>
											<span class="hidden rounded-full bg-[#F6F2F3] px-2 py-0.5 text-[10px] text-[#777] sm:inline">{station.tone}</span>
										</div>
										<span class="font-mono text-xs font-bold text-[#5C5557] tabular-nums">{station.value}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<div class="absolute -right-2 -top-7 hidden w-36 rounded-2xl border border-white/70 bg-white/85 p-3 shadow-[0_18px_42px_-28px_rgba(111,12,28,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl md:block lg:-right-8">
					<p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B8586]">{$locale === 'EN' ? 'Latency' : 'Latensi'}</p>
					<p class="mt-1 font-mono text-2xl font-extrabold text-[#272123] tabular-nums">1.4s</p>
					<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F3E6E8]">
						<div class="h-full w-[72%] rounded-full bg-[#C8102E]"></div>
					</div>
				</div>

				<div class="absolute -bottom-6 right-4 hidden w-40 rounded-2xl border border-[#E7D8DA] bg-white p-3 shadow-[0_24px_52px_-32px_rgba(111,12,28,0.65)] md:block">
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B8586]">{$locale === 'EN' ? 'Alarm' : 'Alarm'}</span>
						<span class="rounded-full bg-[#FBE9EC] px-2 py-0.5 font-mono text-[10px] font-bold text-[#A50D25]">2</span>
					</div>
					<p class="mt-2 text-xs font-semibold leading-snug text-[#272123]">{$locale === 'EN' ? 'Bogowonto threshold watch' : 'Pantau ambang Bogowonto'}</p>
				</div>
			</div>

			<div
				class="order-1 lg:order-2 lg:pl-2"
				style="
					opacity: {visible ? 1 : 0};
					transform: translate3d({visible ? 0 : 32}px, {visible ? 0 : 16}px, 0);
					transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s;
				"
			>
				<div class="inline-flex items-center gap-2 rounded-full border border-[#C8102E]/15 bg-white/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#C8102E] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
					<span class="h-1.5 w-1.5 rounded-full bg-[#C8102E]"></span>
					{$locale === 'EN' ? 'Monitoring Platform' : 'Platform Monitoring'}
				</div>

				<h2 class="mt-7 max-w-[11ch] font-heading text-4xl font-extrabold leading-[1.02] tracking-tighter text-[#181315] sm:text-5xl lg:text-[58px]">
					{$locale === 'EN' ? 'One Screen to Monitor' : 'Satu Layar untuk Memantau'}
					<span class="block text-[#C8102E]">{$locale === 'EN' ? 'All Your Assets' : 'Semua Aset Anda'}</span>
				</h2>

				<div class="mt-7 border-l-2 border-[#C8102E] pl-4">
					<p class="font-heading text-lg font-bold text-[#272123]">STESY - Smart Telemetry System</p>
					<p class="mt-4 max-w-[58ch] text-base leading-relaxed text-[#5C5557]">
						{$locale === 'EN' ? 'Imagine: water level at Dam A, rainfall at Station B, slope deformation at C, gate status at D - all in one dashboard. Real-time. From anywhere.' : 'Bayangkan: ketinggian air Bendungan A, curah hujan Stasiun B, deformasi Lereng C, status pintu air Bendung D - semua di satu dashboard. Real-time. Dari mana saja.'}
					</p>
				</div>

				<ul class="mt-8 grid gap-3 sm:grid-cols-2">
					{#each features as feature, index}
						{@const Icon = featureIcons[index]}
						<li class="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FBE9EC] text-[#C8102E]">
								<Icon size={15} strokeWidth={2} />
							</div>
							<span class="pt-1 text-sm font-medium leading-snug text-[#3A3335]">{feature}</span>
						</li>
					{/each}
				</ul>

				<div class="mt-9 flex flex-col gap-3 sm:flex-row">
					<a
						href="/solusi/digital-monitoring-platform"
						class="btn-tactile inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(200,16,46,0.8)] hover:bg-[#A50D25]"
					>
						{$locale === 'EN' ? 'View STESY Demo' : 'Lihat Demo STESY'}
						<ArrowRight size={15} strokeWidth={2} />
					</a>
					<a
						href="/solusi/digital-monitoring-platform"
						class="btn-tactile inline-flex items-center justify-center gap-2 rounded-xl border border-[#E0D3D5] bg-white/60 px-6 py-3 text-sm font-bold text-[#272123] backdrop-blur transition-colors hover:bg-white"
					>
						{$locale === 'EN' ? 'Learn More' : 'Pelajari Lebih Lanjut'}
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
		animation: stesy-chart-draw 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite alternate;
	}

	@keyframes stesy-chart-draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stesy-chart-line {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
</style>
