<script lang="ts">
	import { onMount } from "svelte";
	import {
		Quote,
		ArrowRight,
		ChevronLeft,
		ChevronRight,
	} from "@lucide/svelte";
	import type { TestimonialSummary } from "$lib/api";

	type TestimonialCard = {
		name: string;
		title: string;
		quote: string;
		initials: string;
		org: string;
		photo: string | null;
	};

	let { testimonials = undefined }: { testimonials?: TestimonialSummary[] | null } =
		$props();

	let visible = $state(false);
	let activeIndex = $state(0);

	const fallbackTestimonials: TestimonialCard[] = [
		{
			name: "Prahasdipta Bayu Adhi Koesoemo",
			title: "Kepala Satuan Unit Pengelola Bendungan Ciawi-Sukamahi-Gintung",
			quote: "Perangkat ADR dari Beacon memberikan presisi data deformasi yang sangat kami butuhkan untuk monitoring keamanan bendungan secara real-time. Respons tim teknis mereka terhadap kebutuhan di lapangan sangat cepat dan profesional.",
			initials: "PB",
			org: "BBWS Ciliwung-Cisadane",
			photo: null,
		},
		{
			name: "Ali Sukali, S.Sos, S.T, M.Si",
			title: "PPK Bendungan II",
			quote: "Mitra yang berkomitmen terhadap kualitas buatan anak negeri. Beacon membuktikan bahwa produk lokal mampu bersaing dengan impor, bahkan dalam hal after-sales support jauh lebih unggul karena tim teknisnya ada di Indonesia.",
			initials: "AS",
			org: "Kementerian PUPR",
			photo: null,
		},
		{
			name: "Seto Ariwibowo, ST. MT.",
			title: "PPKom Operasi & Pemeliharaan Pos Hidrologi",
			quote: "Akurasi dan konektivitas perangkat Beacon sudah teruji di berbagai kondisi lapangan yang ekstrem. Data terkirim real-time 24 jam, dan ketika ada kendala, tim support selalu bisa diandalkan untuk penyelesaian cepat.",
			initials: "SA",
			org: "BBWS Serayu Opak",
			photo: null,
		},
	];

	const displayTestimonials = $derived(
		testimonials && testimonials.length > 0
			? testimonials.map((item) => ({
					name: item.name,
					title: item.position ?? "",
					quote: item.quote,
					initials: item.initials,
					org: item.organization ?? item.client_name ?? "",
					photo: item.photo,
				}))
			: fallbackTestimonials,
	);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) visible = true;
			},
			{ threshold: 0.15 },
		);
		const el = document.getElementById("suara-mitra");
		if (el) observer.observe(el);

		// Auto-rotate
		const interval = setInterval(() => {
			activeIndex = (activeIndex + 1) % displayTestimonials.length;
		}, 6000);

		return () => {
			observer.disconnect();
			clearInterval(interval);
		};
	});

	function nextSlide() {
		activeIndex = (activeIndex + 1) % displayTestimonials.length;
	}
	function prevSlide() {
		activeIndex =
			(activeIndex - 1 + displayTestimonials.length) %
			displayTestimonials.length;
	}
</script>

<!-- SKILL: Replace 3-equal-column with single-spotlight carousel + side dots -->
<section
	id="suara-mitra"
	class="relative py-20 lg:py-28 overflow-hidden"
	style="background: linear-gradient(180deg, #FFF5F6 0%, #FBE9EC 50%, #F8D7DC 100%);"
>
	<!-- Decorative ornaments — SKILL: Asymmetric scatter for DESIGN_VARIANCE 8 -->
	<div
		class="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none opacity-[0.06]"
		style="border: 2px solid #C8102E;"
	></div>
	<div
		class="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none opacity-[0.04]"
		style="border: 1.5px solid #C8102E;"
	></div>
	<div
		class="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none opacity-[0.04]"
		style="border: 2px solid #C8102E;"
	></div>

	<!-- Floating diamonds -->
	<div
		class="absolute bottom-10 left-[5%] w-12 h-12 rotate-45 rounded-lg pointer-events-none opacity-[0.04]"
		style="background: #C8102E;"
	></div>
	<div
		class="absolute top-[20%] left-[8%] w-6 h-6 rotate-45 pointer-events-none opacity-[0.05] animate-float-delayed"
		style="background: #C8102E;"
	></div>
	<div
		class="absolute top-[50%] right-[4%] w-5 h-5 rotate-45 pointer-events-none opacity-[0.04]"
		style="border: 1.5px solid #C8102E;"
	></div>

	<!-- Plus signs -->
	<svg
		class="absolute top-[35%] right-[6%] w-7 h-7 opacity-[0.05] pointer-events-none"
		viewBox="0 0 24 24"
		fill="none"
		stroke="#C8102E"
		stroke-width="2"
	>
		<line x1="12" y1="5" x2="12" y2="19" /><line
			x1="5"
			y1="12"
			x2="19"
			y2="12"
		/>
	</svg>

	<!-- Dot grid cluster -->
	<svg
		class="absolute bottom-[20%] right-[8%] w-14 h-14 opacity-[0.04] pointer-events-none"
		viewBox="0 0 40 40"
		fill="#C8102E"
	>
		<circle cx="5" cy="5" r="2" /><circle cx="15" cy="5" r="2" /><circle
			cx="25"
			cy="5"
			r="2"
		/>
		<circle cx="5" cy="15" r="2" /><circle cx="15" cy="15" r="2" /><circle
			cx="25"
			cy="15"
			r="2"
		/>
		<circle cx="5" cy="25" r="2" /><circle cx="15" cy="25" r="2" /><circle
			cx="25"
			cy="25"
			r="2"
		/>
	</svg>

	<!-- Wavy line -->
	<svg
		class="absolute bottom-[35%] left-[2%] w-20 h-6 opacity-[0.04] pointer-events-none"
		viewBox="0 0 100 30"
		fill="none"
	>
		<path
			d="M0,15 Q25,30 50,15 T100,15"
			stroke="#C8102E"
			stroke-width="1.5"
			fill="none"
		/>
	</svg>

	<!-- Hexagon -->
	<svg
		class="absolute top-[65%] left-[6%] w-10 h-10 opacity-[0.03] pointer-events-none"
		viewBox="0 0 24 24"
		fill="none"
		stroke="#C8102E"
		stroke-width="1.5"
	>
		<polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
	</svg>

	<!-- Triangle -->
	<svg
		class="absolute top-[15%] right-[12%] w-7 h-7 opacity-[0.03] pointer-events-none"
		viewBox="0 0 24 24"
		fill="none"
		stroke="#C8102E"
		stroke-width="1.5"
	>
		<polygon points="12,3 22,21 2,21" />
	</svg>

	<!-- Arc -->
	<svg
		class="absolute bottom-[5%] right-[10%] w-12 h-12 opacity-[0.03] pointer-events-none"
		viewBox="0 0 50 50"
		fill="none"
	>
		<path
			d="M50,0 A50,50 0 0,1 0,50"
			stroke="#C8102E"
			stroke-width="1.5"
			fill="none"
		/>
	</svg>

	<!-- Scattered small circles -->
	<div
		class="absolute top-[30%] left-[16%] w-3 h-3 rounded-full pointer-events-none opacity-[0.05]"
		style="background: #C8102E;"
	></div>
	<div
		class="absolute top-[45%] right-[15%] w-2 h-2 rounded-full pointer-events-none opacity-[0.04]"
		style="background: #C8102E;"
	></div>
	<div
		class="absolute bottom-[12%] left-[20%] w-4 h-4 rounded-full pointer-events-none opacity-[0.03]"
		style="border: 1.5px solid #C8102E;"
	></div>

	<!-- Dotted vertical line -->
	<svg
		class="absolute top-[25%] left-[1.5%] w-1 h-20 opacity-[0.04] pointer-events-none"
		viewBox="0 0 4 100"
		fill="none"
	>
		<line
			x1="2"
			y1="0"
			x2="2"
			y2="100"
			stroke="#C8102E"
			stroke-width="2"
			stroke-dasharray="4 6"
		/>
	</svg>

	<!-- Large decorative quote watermark -->
	<div class="absolute top-8 left-8 opacity-[0.03] pointer-events-none">
		<Quote size={200} style="color: #C8102E;" />
	</div>

	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<!-- Heading — left-aligned with nav controls on right -->
		<div
			class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
		>
			<div class="max-w-3xl space-y-6">
				<div
					class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
					style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);"
				>
					<span
						class="w-1.5 h-1.5 rounded-full"
						style="background: #C8102E;"
					></span>
					Testimoni
				</div>
				<h2
					class="font-heading text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.05] tracking-tighter text-zinc-950"
				>
					<span class="text-zinc-300">"</span>Mitra yang Berkomitmen
					Terhadap
					<span
						class="text-transparent bg-clip-text"
						style="background-image: linear-gradient(135deg, #FF5F56 0%, #C8102E 50%, #8A0B1F 100%)"
						>Kualitas Buatan Anak Negeri."</span
					>
				</h2>
			</div>
			<!-- Navigation arrows — desktop only -->
			<div class="hidden md:flex items-center gap-2">
				<button
					onclick={prevSlide}
					class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#C8102E] hover:text-white btn-tactile"
					style="border: 1.5px solid #E5E5E5; color: #5C5C5C; background: white;"
				>
					<ChevronLeft size={18} />
				</button>
				<button
					onclick={nextSlide}
					class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#C8102E] hover:text-white btn-tactile"
					style="border: 1.5px solid #E5E5E5; color: #5C5C5C; background: white;"
				>
					<ChevronRight size={18} />
				</button>
			</div>
		</div>

		<!-- Single spotlight testimonial — SKILL: Asymmetric grid layout -->
		<div class="grid lg:grid-cols-12 gap-8 items-start">
			<!-- Left: Active testimonial card — 8 cols -->
			<div class="lg:col-span-8 relative">
				{#each displayTestimonials as test, i}
					<div
						class="rounded-[24px] p-8 lg:p-12 bg-white transition-all duration-500"
						style="
							border: 1px solid #E5E5E5;
							box-shadow: 0 8px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5);
							opacity: {activeIndex === i ? 1 : 0};
							transform: translateX({activeIndex === i ? 0 : 20}px);
							position: {i === 0 ? 'relative' : 'absolute'};
							top: {i === 0 ? 'auto' : '0'};
							left: {i === 0 ? 'auto' : '0'};
							right: {i === 0 ? 'auto' : '0'};
							pointer-events: {activeIndex === i ? 'auto' : 'none'};
							transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1);
						"
					>
						<!-- Red accent bar at top -->
						<div
							class="absolute top-0 left-8 right-8 h-[3px] rounded-full"
							style="background: linear-gradient(90deg, #C8102E, rgba(200,16,46,0.15));"
						></div>

						<Quote
							size={28}
							class="mb-6"
							style="color: #C8102E; opacity: 0.25;"
						/>

						<p
							class="text-base sm:text-lg leading-relaxed mb-8"
							style="color: #3A3A3A; font-style: italic; max-width: 60ch;"
						>
							"{test.quote}"
						</p>

						<div class="flex items-center gap-4">
							{#if test.photo}
								<img
									src={test.photo}
									alt={test.name}
									class="w-12 h-12 rounded-full object-cover"
									style="box-shadow: 0 4px 12px rgba(200,16,46,0.2);"
								/>
							{:else}
								<div
									class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
									style="background: linear-gradient(135deg, #C8102E, #E8384F); box-shadow: 0 4px 12px rgba(200,16,46,0.2);"
								>
									{test.initials}
								</div>
							{/if}
							<div>
								<span
									class="block text-sm font-semibold"
									style="color: #1A1A1A;">{test.name}</span
								>
								<span
									class="block text-xs leading-tight"
									style="color: #7A7A7A;">{test.title}</span
								>
								<span
									class="block text-[10px] uppercase tracking-wider font-medium mt-1"
									style="color: #C8102E;">{test.org}</span
								>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Right: Dot indicators + mini cards — 4 cols -->
			<div class="lg:col-span-4 space-y-3">
				{#each displayTestimonials as test, i}
					<button
						class="w-full text-left p-4 rounded-[16px] transition-all duration-300 cursor-pointer"
						style="
							background: {activeIndex === i ? 'white' : 'transparent'};
							border: 1px solid {activeIndex === i ? '#C8102E' : 'rgba(200,16,46,0.1)'};
							box-shadow: {activeIndex === i ? '0 4px 16px rgba(200,16,46,0.08)' : 'none'};
						"
						onclick={() => (activeIndex = i)}
					>
						<div class="flex items-center gap-3">
							{#if test.photo}
								<img
									src={test.photo}
									alt={test.name}
									class="w-9 h-9 rounded-full object-cover shrink-0"
								/>
							{:else}
								<div
									class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
									style="
										background: {activeIndex === i
										? 'linear-gradient(135deg, #C8102E, #E8384F)'
										: '#FBE9EC'};
										color: {activeIndex === i ? 'white' : '#C8102E'};
									"
								>
									{test.initials}
								</div>
							{/if}
							<div class="min-w-0">
								<span
									class="block text-sm font-semibold text-[#1A1A1A] truncate"
									>{test.name}</span
								>
								<span
									class="block text-[11px] text-[#9A9A9A] truncate"
									>{test.org}</span
								>
							</div>
						</div>
					</button>
				{/each}

				<a
					href="/tentang-kami#testimoni"
					class="inline-flex items-center gap-2 text-sm font-semibold mt-4 transition-colors hover:gap-3 pl-4"
					style="color: #C8102E;"
				>
					Lihat semua testimoni
					<ArrowRight size={14} />
				</a>
			</div>
		</div>

		<!-- Mobile dots -->
		<div class="flex justify-center gap-2 mt-6 lg:hidden">
			{#each displayTestimonials as _, i}
				<button
					class="w-2.5 h-2.5 rounded-full transition-all duration-300"
					style="background: {activeIndex === i
						? '#C8102E'
						: '#E5E5E5'}; transform: scale({activeIndex === i
						? 1.2
						: 1});"
					onclick={() => (activeIndex = i)}
				></button>
			{/each}
		</div>
	</div>
</section>
