<script lang="ts">
	import { onMount } from "svelte";
	import { Plus, Cpu } from "@lucide/svelte";
	import { fly, fade, slide } from "svelte/transition";

	// Svelte 5 state
	let visible = $state(false);
	let activeId = $state("bl-2000");

	// Scroll Tracking State
	let scrollY = $state(0);
	let innerHeight = $state(0);
	let innerWidth = $state(0);
	let sectionRef: HTMLElement | undefined = $state();

	const products = [
		{
			id: "bl-2000",
			name: "BL-2000",
			tagline: "Pro beyond limits.",
			desc: "Flagship telemetry dengan edge computing, multi-channel, dan redundansi satelit. Dirancang untuk infrastruktur kritis yang membutuhkan keandalan absolut.",
			features: ["QUAD-CHANNEL", "EDGE AI", "SATELIT READY"],
		},
		{
			id: "bl-1100",
			name: "BL-1100",
			tagline: "The industrial standard.",
			desc: "Reliabilitas industrial untuk lingkungan ekstrem. Integrasi mulus dengan ratusan sensor dengan konsumsi daya minimal berkat teknologi solar-first.",
			features: ["IP68 RUGGED", "DUAL COMMS", "SOLAR READY"],
		},
		{
			id: "bl-110",
			name: "BL-110",
			tagline: "Compact yet powerful.",
			desc: "Solusi kompak dan terjangkau untuk pemantauan presisi. Pilihan paling logis untuk jaringan pengamatan padat tanpa mengorbankan akurasi data.",
			features: ["COMPACT", "LOW POWER", "PLUG & PLAY"],
		},
		{
			id: "bl-11",
			name: "BL-11",
			tagline: "Micro monitoring.",
			desc: "Spesialis pemantauan titik tunggal. Ukuran sekecil kotak korek api, namun ditenagai konektivitas NB-IoT dengan baterai tahan hingga 5 tahun.",
			features: ["NBIOT", "5YR BATTERY", "NANO SIZE"],
		},
	];

	// Action untuk efek tilt 3D khusus di dalam container Apple-style ini
	function tilt(node: HTMLElement, enabled: boolean = true) {
		const handleMove = (e: MouseEvent) => {
			if (!enabled) return;
			const rect = node.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;

			const rotateX = ((y - centerY) / centerY) * -8;
			const rotateY = ((x - centerX) / centerX) * 8;

			node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
		};

		const handleLeave = () => {
			if (!enabled) return;
			node.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
		};

		node.addEventListener("mousemove", handleMove);
		node.addEventListener("mouseleave", handleLeave);

		return {
			update(newEnabled: boolean) {
				enabled = newEnabled;
				if (!enabled) {
					node.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
				}
			},
			destroy() {
				node.removeEventListener("mousemove", handleMove);
				node.removeEventListener("mouseleave", handleLeave);
			},
		};
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.1 },
		);

		const el = document.getElementById("data-loggers-section");
		if (el) observer.observe(el);

		return () => observer.disconnect();
	});

	// Sticky Scroll Logic
	$effect(() => {
		// Only run sticky logic on desktop viewports
		if (innerWidth < 1024) return;

		let currentScroll = scrollY; // register dependency
		if (!sectionRef) return;

		const rect = sectionRef.getBoundingClientRect();
		// maxScroll is the total scrollable distance inside the sticky track
		const maxScroll = rect.height - innerHeight;

		if (maxScroll <= 0) return;

		let progress = -rect.top / maxScroll;
		if (progress < 0) progress = 0;
		if (progress > 1) progress = 1;

		let index = Math.floor(progress * products.length);
		if (index >= products.length) index = products.length - 1;

		activeId = products[index].id;
	});

	function scrollToProduct(index: number) {
		// On mobile, just change the state instantly
		if (innerWidth < 1024) {
			activeId = products[index].id;
			return;
		}

		// On desktop, scroll the window to the correct part of the sticky track
		if (!sectionRef) return;
		const rect = sectionRef.getBoundingClientRect();
		const maxScroll = rect.height - innerHeight;

		// Target the middle of the product's scroll segment
		const targetProgress = (index + 0.5) / products.length;
		const targetScrollY =
			window.scrollY + rect.top + maxScroll * targetProgress;

		window.scrollTo({ top: targetScrollY, behavior: "smooth" });
	}

	let activeProduct = $derived(
		products.find((p) => p.id === activeId) || products[0],
	);
</script>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />

<section id="data-loggers-section" class="relative w-full py-24 bg-[#F9FAFB]">
	<!-- Background Mesh Gradient Simulation (Whole Section) -->
	<div
		class="absolute top-0 inset-x-0 h-[600px] pointer-events-none opacity-40 mix-blend-multiply"
		style="background: radial-gradient(circle at 50% -20%, rgba(200,16,46,0.1) 0%, transparent 70%);"
	></div>

	<!-- Desktop Sticky Track / Mobile Normal Wrapper -->
	<div
		class="w-full relative"
		style={innerWidth >= 1024 ? `height: ${products.length * 100}vh;` : ""}
		bind:this={sectionRef}
	>
		<!-- Sticky Container on Desktop -->
		<div
			class="w-full lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-center relative z-10"
		>
			<div
				class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full"
			>
				<!-- HEADER SECTION (Inside sticky track) -->
				<div
					class="mb-8 lg:mb-10 flex flex-col items-center text-center lg:items-start lg:text-left"
					style="
						opacity: {visible ? 1 : 0};
						transform: translateY({visible ? 0 : 30}px);
						transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
					"
				>
					<div
						class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 lg:mb-6"
						style="background: white; color: #1A1A1A; border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.03);"
					>
						<span
							class="w-1.5 h-1.5 rounded-full animate-pulse"
							style="background: #C8102E;"
						></span>
						Hardware Ecosystem
					</div>
					<h2
						class="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-zinc-950 leading-none"
					>
						Data Logger <span
							class="text-transparent bg-clip-text"
							style="background-image: linear-gradient(135deg, #1A1A1A 0%, #737373 100%);"
							>Series.</span
						>
					</h2>
					<p
						class="mt-4 lg:mt-6 text-lg md:text-xl text-zinc-500 max-w-2xl leading-relaxed"
					>
						Dirancang dari nol untuk stabilitas tanpa kompromi.
						Dibuat dari material kelas industri dengan presisi
						tinggi.
					</p>
				</div>

				<!-- Massive Dark Container for Accordion & 3D Stage -->
				<div
					class="bg-[#050505] rounded-[3rem] p-6 sm:p-10 lg:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] relative overflow-hidden border border-zinc-800 lg:min-h-[65vh] flex flex-col justify-center"
					style="
						opacity: {visible ? 1 : 0};
						transform: translateY({visible ? 0 : 40}px);
						transition: opacity 1s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.2s;
					"
				>
					<!-- Deep Glassmorphism Blurs inside Container -->
					<div
						class="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C8102E]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"
					></div>
					<div
						class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4"
					></div>

					<!-- Split Layout -->
					<div
						class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start relative z-10"
					>
						<!-- Left: Product Selection Accordion Menu (4 cols) -->
						<div class="lg:col-span-4 flex flex-col gap-4">
							{#each products as product, idx}
								<div class="flex flex-col items-start">
									<!-- The Pill Button -->
									<button
										class="inline-flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-300 backdrop-blur-md border outline-none cursor-pointer"
										style="
											background: {activeId === product.id
											? 'rgba(255,255,255,0.1)'
											: 'rgba(255,255,255,0.05)'};
											border-color: {activeId === product.id
											? 'rgba(255,255,255,0.2)'
											: 'rgba(255,255,255,0.1)'};
											box-shadow: {activeId === product.id
											? '0 10px 20px -5px rgba(0,0,0,0.5)'
											: 'none'};
										"
										onmouseover={(e) => {
											if (activeId !== product.id) {
												e.currentTarget.style.background =
													"rgba(255,255,255,0.08)";
											}
										}}
										onfocus={(e) => {
											if (activeId !== product.id) {
												e.currentTarget.style.background =
													"rgba(255,255,255,0.08)";
											}
										}}
										onmouseout={(e) => {
											if (activeId !== product.id) {
												e.currentTarget.style.background =
													"rgba(255,255,255,0.05)";
											}
										}}
										onblur={(e) => {
											if (activeId !== product.id) {
												e.currentTarget.style.background =
													"rgba(255,255,255,0.05)";
											}
										}}
										onclick={() => scrollToProduct(idx)}
									>
										{#if activeId === product.id}
											<div
												class="w-5 h-5 rounded-full bg-[#FF5F56] flex items-center justify-center shadow-[0_0_12px_rgba(255,95,86,0.6)] border border-white/20"
											></div>
										{:else}
											<div
												class="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center text-white/60"
											>
												<Plus
													size={14}
													strokeWidth={2.5}
												/>
											</div>
										{/if}
										<span
											class="text-sm font-semibold text-white tracking-wide"
											>{product.name}</span
										>
									</button>

									<!-- The Expanded Content (Liquid Glass) -->
									{#if activeId === product.id}
										<div
											transition:slide={{ duration: 400 }}
											class="mt-4 ml-2 overflow-hidden w-full"
										>
											<div
												class="p-6 rounded-3xl bg-zinc-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative"
											>
												<!-- Inner Refraction -->
												<div
													class="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
												></div>

												<p
													class="text-[15px] text-zinc-400 leading-relaxed font-medium relative z-10"
												>
													<strong
														class="text-white font-semibold"
														>{product.tagline}</strong
													>
													{product.desc}
												</p>
												<!-- Feature Badges -->
												<div
													class="flex flex-wrap gap-2 mt-5 relative z-10"
												>
													{#each product.features as feature}
														<span
															class="px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-white/10 text-zinc-200 border border-white/10 shadow-sm"
														>
															{feature}
														</span>
													{/each}
												</div>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>

						<!-- Right: 3D Asset Stage (8 cols) -->
						<div
							class="lg:col-span-8 relative h-[450px] lg:h-full lg:min-h-[500px] w-full mt-10 lg:mt-0 flex items-center justify-center"
						>
							{#key activeId}
								<!-- Subtle Inner Container for 3D Asset -->
								<div
									class="absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden group will-change-transform flex flex-col items-center justify-center"
									style="
										background: rgba(255,255,255,0.015);
										border: 1px solid rgba(255,255,255,0.03);
										box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
									"
									in:fly={{
										y: 30,
										duration: 600,
										delay: 150,
									}}
									out:fade={{ duration: 250 }}
								>
									<!-- Large 3D Mockup Container with tilt -->
									<div
										class="w-full h-full flex flex-col items-center justify-center relative z-10"
										use:tilt={activeProduct.id !==
											"bl-1100"}
									>
										<!-- Floating infinite animation wrapper -->
										<div
											class="relative w-full max-w-[450px] aspect-square flex items-center justify-center {activeProduct.id !==
											'bl-1100'
												? 'animate-float'
												: ''}"
										>
											{#if activeProduct.id === "bl-2000"}
												<!-- Pro Hardware Mockup (Large) -->
												<div
													class="relative w-[360px] h-[250px] rounded-[3rem] bg-[#111111] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-t border-x border-zinc-700/50 flex flex-col justify-end p-8 overflow-hidden"
												>
													<!-- Metallic Texture -->
													<div
														class="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-500 via-[#111] to-[#050505] pointer-events-none"
													></div>
													<div
														class="absolute inset-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] rounded-[3rem] pointer-events-none"
													></div>

													<!-- Antenna -->
													<div
														class="absolute -top-24 right-12 w-5 h-32 bg-zinc-800 rounded-t-full border border-zinc-600 shadow-xl"
													></div>

													<!-- Screen/Display -->
													<div
														class="w-full h-28 bg-black rounded-2xl mb-6 border border-zinc-800 p-5 flex items-center gap-5 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] relative overflow-hidden"
													>
														<div
															class="absolute inset-0 opacity-10"
															style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px);"
														></div>
														<div
															class="w-3 h-3 bg-[#C8102E] rounded-full animate-pulse shadow-[0_0_15px_#C8102E]"
														></div>
														<div
															class="text-[13px] font-mono text-zinc-400 flex-1 leading-tight relative z-10"
														>
															SYS_OK / 99.9%<br
															/>CH_01: ACTIVE<br
															/>UPLINK: SAT_RDY
														</div>
														<svg
															class="w-20 h-10 opacity-70 relative z-10"
															viewBox="0 0 40 20"
															fill="none"
														>
															<path
																d="M0,10 L10,10 L15,2 L25,18 L30,10 L40,10"
																stroke="#FF5F56"
																stroke-width="2"
																stroke-linejoin="round"
															/>
														</svg>
													</div>
													<!-- Ports -->
													<div
														class="flex justify-between px-4"
													>
														{#each Array(4) as _}
															<div
																class="w-10 h-10 rounded-full bg-black border border-zinc-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)]"
															></div>
														{/each}
													</div>
												</div>
											{:else if activeProduct.id === "bl-1100"}
												<!-- Single Image Viewer for BL-1100 -->
												<div
													class="relative w-[340px] h-[380px] bg-black rounded-[2.5rem] flex items-center justify-center p-8 shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-zinc-800/50 overflow-hidden"
												>
													<!-- Subtle gradient to give depth to the black background -->
													<div
														class="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none"
													></div>
													<img
														src="/images/bl-1100.webp"
														alt="BL-1100 Data Logger"
														class="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
														draggable="false"
													/>
												</div>
											{:else if activeProduct.id === "bl-110"}
												<!-- Compact Hardware Mockup (Large) -->
												<div
													class="relative w-[280px] h-[280px] rounded-full bg-zinc-100 shadow-[0_40px_80px_rgba(0,0,0,0.3)] border-[3px] border-white flex items-center justify-center"
												>
													<div
														class="absolute w-full h-full rounded-full border-[12px] border-zinc-300/50 pointer-events-none"
													></div>
													<div
														class="w-[160px] h-[160px] rounded-full bg-white shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center border border-zinc-200"
													>
														<div
															class="w-5 h-5 bg-[#1B7F3A] rounded-full animate-pulse shadow-[0_0_25px_#1B7F3A]"
														></div>
													</div>
												</div>
											{:else}
												<!-- Micro Hardware Mockup (Large) -->
												<div
													class="relative w-[160px] h-[260px] rounded-[1.5rem] bg-[#111] shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-t border-zinc-700 flex flex-col items-center pt-10"
												>
													<div
														class="w-24 h-24 rounded-2xl bg-black border border-zinc-800 shadow-[inset_0_4px_16px_rgba(0,0,0,0.8)] flex items-center justify-center"
													>
														<Cpu
															size={44}
															class="text-zinc-600"
															strokeWidth={1}
														/>
													</div>
													<div
														class="w-16 h-2 bg-[#27C93F] mt-10 rounded-full shadow-[0_0_15px_#27C93F] opacity-90"
													></div>
													<div
														class="mt-auto mb-8 text-[11px] font-mono text-zinc-500 tracking-widest"
													>
														NBIOT_LINK
													</div>
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/key}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes float {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-15px);
		}
		100% {
			transform: translateY(0px);
		}
	}
	.animate-float {
		animation: float 6s ease-in-out infinite;
	}
</style>
