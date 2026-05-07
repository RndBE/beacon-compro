<script lang="ts">
	import { onMount } from 'svelte';
	import { BrainCircuit, Wrench, MonitorSmartphone, Users, ArrowUpRight } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import { locale } from '$lib/i18n';

	let visible = $state(false);
	let activeService = $state(0);
	let autoRotate = $state(true);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) visible = true; },
			{ threshold: 0.15 }
		);
		const el = document.getElementById('layanan-beyond');
		if (el) observer.observe(el);

		// Auto rotate active service
		const interval = setInterval(() => {
			if (autoRotate) {
				activeService = (activeService + 1) % services.length;
			}
		}, 5000);

		return () => { observer.disconnect(); clearInterval(interval); };
	});

	const services = [
		{
			icon: BrainCircuit,
			title: 'Telemetri Berbasis AI',
			desc: 'Pengumpulan, analisa, dan komparasi data otomatis untuk insight yang lebih dalam.',
			detail: 'Machine learning menganalisis pola data historis, memprediksi anomali, dan mengoptimalkan threshold alarm secara otomatis. Menghapus kebutuhan monitoring manual 24/7.',
			number: '01'
		},
		{
			icon: Wrench,
			title: 'Garansi & Maintenance',
			desc: 'Pengecekan teknis, kebersihan, penggantian suku cadang, kalibrasi, uji fungsional.',
			detail: 'Tim teknis terlatih hadir langsung ke lokasi. Dukungan sepanjang tahun dengan SLA response time yang ketat untuk memastikan tidak ada data yang hilang.',
			number: '02'
		},
		{
			icon: MonitorSmartphone,
			title: 'Monitoring Terintegrasi',
			desc: 'Akses lewat satu aplikasi STESY, tidak peduli berapa banyak perangkat.',
			detail: 'Dashboard tunggal menampilkan seluruh stasiun secara real-time. Mendukung multi-tenant untuk berbagai instansi dengan sistem manajemen role yang aman.',
			number: '03'
		},
		{
			icon: Users,
			title: 'Konsultasi Teknis',
			desc: 'Tim engineer kami membantu sejak fase desain sampai operasional.',
			detail: 'Dari site survey, desain teknis, hingga training operator — kami mendampingi setiap tahap implementasi. Memastikan solusi tepat guna untuk medan ekstrem.',
			number: '04'
		}
	];
</script>

<section id="layanan-beyond" class="relative py-16 sm:py-20 lg:py-32 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
		<!-- Grid layout: Left copy + Right interactive cards -->
		<div class="grid lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-start lg:items-center">
			
			<!-- Left: Header and service selectors — 5 cols -->
			<div
				class="lg:col-span-5 flex flex-col"
				style="
					opacity: {visible ? 1 : 0};
					transform: translateX({visible ? 0 : -40}px);
					transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
				"
			>
				<div class="mb-8 lg:mb-10">
					<div class="flex items-center gap-3 mb-4 sm:mb-6">
						<div class="w-7 sm:w-8 h-[1px] bg-[#C8102E]"></div>
						<span class="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#C8102E]">
							{$locale === 'EN' ? 'Ongoing Services' : 'Layanan Berkelanjutan'}
						</span>
					</div>
					<h2 class="font-heading text-3xl sm:text-5xl lg:text-[56px] font-bold text-zinc-950 leading-[1.08] tracking-tight mb-4">
						Kami Tidak Berhenti Setelah <span class="text-[#C8102E]">Perangkat Terpasang.</span>
					</h2>
					<p class="text-sm sm:text-base text-zinc-500 leading-relaxed max-w-[45ch] font-medium">
						Setiap instalasi didukung oleh ekosistem layanan menyeluruh — dari rancangan awal hingga pemeliharaan puluhan tahun ke depan.
					</p>
				</div>

				<!-- Mobile service accordion -->
				<div class="grid gap-3 lg:hidden">
					{#each services as service, i}
						{@const ServiceIcon = service.icon}
						<div
							class="w-full rounded-3xl border p-4 shadow-[0_16px_34px_-28px_rgba(24,24,27,0.35)] transition {activeService === i
								? 'border-[#C8102E]/30 bg-[#FFF8F9]'
								: 'border-zinc-200/70 bg-white'}"
						>
							<button
								type="button"
								class="w-full text-left transition active:scale-[0.99]"
								onclick={() => activeService = i}
							>
								<div class="flex items-start gap-3">
								<div
									class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors {activeService === i
										? 'border-transparent bg-[#C8102E]'
										: 'border-zinc-200 bg-white'}"
								>
									<ServiceIcon size={19} style="color: {activeService === i ? '#FFFFFF' : '#71717A'};" />
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center justify-between gap-3">
										<span class="text-[11px] font-mono font-semibold text-[#C8102E]">{service.number}</span>
										<span class="h-2 w-2 rounded-full bg-[#C8102E]" style="opacity: {activeService === i ? 1 : 0.2};"></span>
									</div>
									<h3 class="mt-1 text-base font-bold leading-snug text-zinc-950">{service.title}</h3>
									<p class="mt-1 text-sm font-medium leading-relaxed text-zinc-500">{service.desc}</p>
								</div>
							</div>
							</button>

							{#if activeService === i}
								<div class="mt-4 border-t border-[#C8102E]/10 pt-4">
									<p class="text-sm leading-relaxed text-zinc-600">{service.detail}</p>
									<a
										href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20tertarik%20dengan%20layanan%20{encodeURIComponent(service.title)}."
										class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C8102E] px-5 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
										target="_blank"
										rel="noopener"
										onclick={(event) => event.stopPropagation()}
									>
										{$locale === 'EN' ? 'Consult Services' : 'Konsultasi Layanan'}
										<ArrowUpRight size={17} />
									</a>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Service tabs / selectors -->
				<div class="hidden lg:flex flex-col gap-2 relative" onmouseenter={() => autoRotate = false} onmouseleave={() => autoRotate = true} role="group">
					<!-- Animated Highlight Background -->
					<div 
						class="absolute left-0 right-0 h-[88px] bg-zinc-50 rounded-[16px] border border-zinc-200/50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
						style="transform: translateY({activeService * 96}px);"
					>
						<!-- Left Active Indicator -->
						<div class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-full bg-[#C8102E] shadow-[0_0_12px_rgba(200,16,46,0.4)]"></div>
					</div>

					{#each services as service, i}
						{@const ServiceIcon = service.icon}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="relative z-10 w-full text-left group flex items-center gap-4 p-4 h-[88px] rounded-[16px] transition-all duration-300 cursor-pointer"
							onclick={() => activeService = i}
						>
							<div
								class="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-500 ease-out"
								style="
									background: {activeService === i ? '#C8102E' : '#FFFFFF'};
									border: 1px solid {activeService === i ? 'transparent' : 'rgba(229,229,229,0.8)'};
									box-shadow: {activeService === i ? '0 8px 16px -4px rgba(200,16,46,0.3)' : '0 2px 4px rgba(0,0,0,0.02)'};
								"
							>
								<ServiceIcon size={20} style="color: {activeService === i ? '#FFFFFF' : '#71717A'};" class="transition-colors duration-300" />
							</div>
							<div class="min-w-0 flex-1">
								<span class="block text-base font-bold transition-colors duration-300" style="color: {activeService === i ? '#18181B' : '#52525B'};">{service.title}</span>
								<span class="block text-xs font-medium text-zinc-400 mt-0.5 truncate transition-colors duration-300 group-hover:text-zinc-500">{service.desc}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: Active service detail card — 7 cols -->
			<div class="hidden lg:block lg:col-span-7 relative lg:h-[600px] w-full">
				{#each services as service, i}
					{@const ServiceIcon = service.icon}
					<div
						class="absolute inset-0 rounded-[2.5rem] p-8 sm:p-10 lg:p-14 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
						style="
							background: linear-gradient(135deg, #FFFFFF 0%, #FFF8F9 100%);
							border: 1px solid rgba(200,16,46,0.08);
							box-shadow: 0 30px 60px -20px rgba(200,16,46,0.08);
							opacity: {activeService === i ? 1 : 0};
							transform: translateY({activeService === i ? 0 : 40}px) scale({activeService === i ? 1 : 0.95});
							pointer-events: {activeService === i ? 'auto' : 'none'};
							z-index: {activeService === i ? 10 : 0};
						"
					>
						<!-- Liquid Glass Inner Border -->
						<div class="absolute inset-0 rounded-[2.5rem] border border-white pointer-events-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]"></div>

						<!-- Large number watermark -->
						<span class="absolute -top-6 -right-4 font-heading text-[240px] font-extrabold leading-none pointer-events-none tracking-tighter" style="color: rgba(200,16,46,0.03);">
							{service.number}
						</span>

						<div class="relative z-10 flex flex-col h-full justify-between">
							<div>
								<div class="w-16 h-16 rounded-[20px] flex items-center justify-center mb-8" style="background: white; border: 1px solid rgba(200,16,46,0.1); box-shadow: 0 10px 20px -5px rgba(200,16,46,0.05);">
									<ServiceIcon size={28} style="color: #C8102E;" />
								</div>

								<h3 class="font-heading text-3xl lg:text-[40px] font-bold text-zinc-900 leading-[1.1] mb-5 tracking-tight">{service.title}</h3>
								<div class="space-y-4">
									<p class="text-lg text-zinc-700 leading-relaxed font-semibold max-w-[45ch]">{service.desc}</p>
									<p class="text-base text-zinc-500 leading-relaxed max-w-[45ch]">{service.detail}</p>
								</div>
							</div>

							<div class="pt-8">
								<a
									href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20tertarik%20dengan%20layanan%20{encodeURIComponent(service.title)}."
									class="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold text-white overflow-hidden transition-transform active:scale-95"
									style="background: #C8102E; box-shadow: 0 12px 24px -8px rgba(200,16,46,0.4);"
									target="_blank"
									rel="noopener"
								>
									<!-- Perpetual Shimmer Effect -->
									<div class="absolute inset-0 pointer-events-none translate-x-[-100%] group-hover:animate-shimmer" style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); background-size: 200% 100%;"></div>
									<div class="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"></div>
									
									<span class="relative z-10 flex items-center gap-2">
										Tanya Soal {service.title}
										<ArrowUpRight size={18} class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
									</span>
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
