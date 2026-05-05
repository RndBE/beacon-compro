<script lang="ts">
	import { onMount } from "svelte";
	import {
		ArrowRight,
		Activity,
		Zap,
		Terminal,
		Database,
		CheckCircle,
		ShieldAlert,
	} from "@lucide/svelte";
	import Ornaments from "$lib/components/Ornaments.svelte";
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { flip } from "svelte/animate";
	import { slide, fade } from "svelte/transition";

	let mounted = $state(false);
	let cursorX = $state(50);
	let cursorY = $state(50);

	// Floating card data tickers with smooth spring/tween animation
	let levelValue = tweened(142.3, { duration: 1000, easing: cubicOut });
	let rainfallValue = tweened(12.8, { duration: 1000, easing: cubicOut });
	let uptimeValue = tweened(98.7, { duration: 1000, easing: cubicOut });

	// Intelligent List Data
	let alerts = $state([
		{
			id: 1,
			type: "info",
			location: "Bendungan IKN",
			msg: "System check normal",
			time: "Just now",
		},
		{
			id: 2,
			type: "warning",
			location: "Stasiun Cuaca",
			msg: "Curah hujan 12mm/h",
			time: "2m ago",
		},
		{
			id: 3,
			type: "critical",
			location: "ADR Ciawi",
			msg: "Deformasi +0.02mm",
			time: "5m ago",
		},
	]);
	let nextId = 4;
	const alertPool = [
		{
			type: "info",
			location: "EWS Citarum",
			msg: "Sensor kalibrasi ulang",
		},
		{ type: "warning", location: "AWLR Cipanas", msg: "TMA naik +0.5m" },
		{
			type: "critical",
			location: "Kawah Ijen",
			msg: "Suhu ekstrem terdeteksi",
		},
		{
			type: "info",
			location: "Bendungan Keureuto",
			msg: "Data sync selesai",
		},
	];

	// Typewriter state
	let promptText = $state("");
	let isProcessing = $state(false);
	const prompts = [
		"Menganalisa pola deformasi lereng Ciawi...",
		"Mengkalibrasi ulang sensor curah hujan Jogja...",
		"Mengirim alert peringatan dini ke 3 desa...",
		"Menghitung rata-rata debit air harian...",
	];
	let promptIndex = 0;

	onMount(() => {
		mounted = true;

		// Number tweens
		const numInterval = setInterval(() => {
			levelValue.set(142 + Math.random() * 0.8);
			rainfallValue.set(12 + Math.random() * 2);
			uptimeValue.set(98 + Math.random() * 1.2);
		}, 3000);

		// Intelligent List cycle
		const listInterval = setInterval(() => {
			const newAlert =
				alertPool[Math.floor(Math.random() * alertPool.length)];
			alerts = [
				{ id: nextId++, ...newAlert, time: "Just now" },
				...alerts.slice(0, 2),
			];
			alerts.forEach((a, i) => {
				if (i > 0) a.time = `${i * 2}m ago`;
			});
		}, 4000);

		// Typewriter logic
		const typeInterval = setInterval(async () => {
			if (isProcessing || !mounted) return;
			promptText = "";
			const target = prompts[promptIndex];
			promptIndex = (promptIndex + 1) % prompts.length;

			for (let i = 0; i <= target.length; i++) {
				if (!mounted) break;
				promptText = target.slice(0, i);
				await new Promise((r) => setTimeout(r, 40));
			}
			isProcessing = true;
			await new Promise((r) => setTimeout(r, 1500));
			isProcessing = false;
		}, 3500);

		return () => {
			mounted = false;
			clearInterval(numInterval);
			clearInterval(listInterval);
			clearInterval(typeInterval);
		};
	});

	function handleMouseMove(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		cursorX = ((e.clientX - rect.left) / rect.width) * 100;
		cursorY = ((e.clientY - rect.top) / rect.height) * 100;
	}
</script>

<section
	class="relative min-h-[100dvh] flex flex-col overflow-hidden"
	onmousemove={handleMouseMove}
	id="hero"
	style="background: linear-gradient(168deg, #FFFFFF 0%, #FFF8F9 30%, #FBE9EC 65%, #F5D2D8 100%);"
>
	<Ornaments variant="hero" />

	<!-- Cursor-aware gradient glow -->
	<div
		class="absolute inset-0 transition-opacity duration-700 pointer-events-none z-0"
		style="
			background: radial-gradient(600px circle at {cursorX}% {cursorY}%, rgba(200,16,46,0.03), transparent 50%);
			opacity: {mounted ? 1 : 0};
		"
	></div>

	<!-- Content — SKILL: Asymmetric, left-aligned -->
	<div
		class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-0 w-full flex-1 flex flex-col justify-center gap-12 lg:gap-16"
	>
		<div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
			<!-- Text Content — 6 cols (asymmetric split) -->
			<div class="lg:col-span-6 space-y-8 lg:pr-10">
				<!-- Eyebrow badge -->
				<div class="overflow-hidden" class:animate-fade-in-up={mounted}>
					<div
						class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-zinc-200/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
					>
						<span class="relative flex h-2 w-2">
							<span
								class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8102E] opacity-75"
							></span>
							<span
								class="relative inline-flex rounded-full h-2 w-2 bg-[#C8102E]"
							></span>
						</span>
						<span
							class="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-zinc-600"
						>
							Sistem Telemetri Pintar
						</span>
					</div>
				</div>

				<!-- Headline — SKILL: tracking-tighter, leading-none, bold text-zinc-950 -->
				<div
					class="space-y-6"
					class:animate-fade-in-up={mounted}
					style="animation-delay: 100ms;"
				>
					<h1
						class="font-heading text-5xl sm:text-6xl lg:text-[72px] font-extrabold text-zinc-950 leading-[1.05] tracking-tighter"
					>
						Pantau Setiap Tetes. <br />
						Setiap Getaran. <br />
						<span
							class="text-transparent bg-clip-text"
							style="background-image: linear-gradient(135deg, #1A1A1A 0%, #737373 100%);"
							>Setiap Awan.</span
						>
					</h1>
					<p
						class="text-lg sm:text-xl text-zinc-500 leading-relaxed max-w-[500px] font-medium"
					>
						Arsitektur telemetri industri buatan Indonesia.
						Melindungi infrastruktur paling strategis negeri dengan <span
							class="text-zinc-900 border-b border-[#C8102E]/30 pb-0.5"
							>akurasi milidetik</span
						>.
					</p>
				</div>

				<!-- Dual CTA — SKILL: Tactile feedback, Liquid Glass -->
				<div
					class="flex flex-col sm:flex-row gap-4 opacity-0 pt-2"
					class:animate-fade-in-up={mounted}
					style:animation-delay="200ms"
				>
					<a
						href="https://wa.me/628112850986"
						target="_blank"
						rel="noopener"
						class="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[0.98] active:scale-95"
						style="background: #C8102E; box-shadow: 0 10px 30px -10px rgba(200,16,46,0.4);"
					>
						<!-- Perpetual Shimmer Effect -->
						<div
							class="absolute inset-0 pointer-events-none translate-x-[-100%] animate-shimmer"
							style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); background-size: 200% 100%;"
						></div>
						<!-- Inner Refraction -->
						<div
							class="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
						></div>

						<span class="relative z-10 flex items-center gap-2">
							Mulai Konsultasi
							<ArrowRight
								size={16}
								class="group-hover:translate-x-1 transition-transform"
							/>
						</span>
					</a>
					<a
						href="#pilar-solusi"
						class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-zinc-700 bg-white border border-zinc-200/60 shadow-sm transition-all duration-300 hover:bg-zinc-50 hover:text-zinc-950 hover:-translate-y-0.5 hover:shadow-md"
					>
						Lihat Pilar Solusi
					</a>
				</div>

				<!-- Trust indicators -->
				<div
					class="flex flex-wrap items-center gap-6 pt-6 opacity-0"
					class:animate-fade-in-up={mounted}
					style:animation-delay="300ms"
				>
					<div class="flex -space-x-2">
						{#each [1, 2, 3] as i}
							<div
								class="w-8 h-8 rounded-full border-2 border-[#FAFAFA] bg-zinc-200 overflow-hidden shadow-sm"
							>
								<img
									src="https://picsum.photos/seed/partner{i}/100/100"
									alt="Partner {i}"
									class="w-full h-full object-cover grayscale opacity-80"
								/>
							</div>
						{/each}
						<div
							class="w-8 h-8 rounded-full border-2 border-[#FAFAFA] bg-zinc-100 flex items-center justify-center shadow-sm"
						>
							<span class="text-[9px] font-bold text-zinc-600"
								>+30</span
							>
						</div>
					</div>
					<p class="text-xs font-medium text-zinc-500">
						Dipercaya oleh <span class="text-zinc-900 font-semibold"
							>BBWS & BUMN</span
						> se-Indonesia
					</p>
				</div>
			</div>

			<!-- Right Side: Motion-Engine Bento Paradigm 2.0 -->
			<div
				class="lg:col-span-6 hidden lg:flex flex-col gap-6 relative"
				style="opacity: {mounted
					? 1
					: 0}; transform: translateX({mounted
					? 0
					: 40}px); transition: all 1s cubic-bezier(0.16,1,0.3,1) 0.3s;"
			>
				<!-- Module 1: The Command Input (AI Typing) -->
				<div
					class="rounded-[2rem] p-6 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group"
				>
					<div
						class="absolute inset-0 bg-gradient-to-br from-zinc-50/50 to-transparent pointer-events-none"
					></div>
					<div class="relative z-10">
						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center gap-2">
								<Terminal size={14} class="text-zinc-400" />
								<span
									class="text-[10px] uppercase tracking-widest font-semibold text-zinc-500"
									>Auto-Agent Process</span
								>
							</div>
							<div
								class="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-[#C8102E] transition-colors"
							></div>
						</div>
						<div class="flex flex-col gap-2">
							<div
								class="font-mono text-sm text-zinc-800 min-height-[20px] leading-relaxed"
							>
								<span class="text-[#C8102E] mr-2">~%</span
								>{promptText}<span class="animate-pulse">_</span
								>
							</div>
							{#if isProcessing}
								<div
									class="h-1 w-full rounded-full overflow-hidden mt-2 bg-zinc-100"
									transition:fade={{ duration: 200 }}
								>
									<div
										class="h-full w-1/2 rounded-full animate-shimmer"
										style="background: linear-gradient(90deg, #C8102E, #FF5F56, #C8102E); background-size: 200% 100%;"
									></div>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-6">
					<div
						class="col-span-1 rounded-[2.5rem] p-6 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col h-full relative overflow-hidden"
					>
						<div class="flex items-center justify-between mb-6">
							<span
								class="text-[10px] uppercase tracking-widest font-semibold text-zinc-400"
								>Live Alert Stream</span
							>
							<span
								class="w-2 h-2 rounded-full bg-[#C8102E] animate-pulse-dot shadow-[0_0_8px_rgba(200,16,46,0.6)]"
							></span>
						</div>

						<div class="space-y-3 relative flex-1">
							{#each alerts as alert (alert.id)}
								<div
									class="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100"
									animate:flip={{
										duration: 500,
										easing: cubicOut,
									}}
									in:slide={{ duration: 400 }}
									out:fade={{ duration: 200 }}
								>
									<div class="mt-1">
										{#if alert.type === "critical"}
											<ShieldAlert
												size={14}
												class="text-[#C8102E]"
											/>
										{:else if alert.type === "warning"}
											<Activity
												size={14}
												class="text-[#F5A623]"
											/>
										{:else}
											<CheckCircle
												size={14}
												class="text-[#1B7F3A]"
											/>
										{/if}
									</div>
									<div class="flex-1">
										<span
											class="block text-xs font-bold text-zinc-900"
											>{alert.location}</span
										>
										<span
											class="block text-[10px] text-zinc-500 mt-0.5 leading-snug"
											>{alert.msg}</span
										>
										<span
											class="block text-[9px] font-mono text-zinc-400 mt-1.5"
											>{alert.time}</span
										>
									</div>
								</div>
							{/each}
						</div>
					</div>
					<div class="col-span-1 flex flex-col gap-6">
						<div
							class="flex-1 rounded-[2.5rem] p-6 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group"
						>
							<div
								class="absolute inset-0 bg-zinc-50/50 group-hover:bg-zinc-50 transition-colors pointer-events-none"
							></div>
							<div
								class="relative z-10 flex flex-col justify-between h-full"
							>
								<div class="flex items-center justify-between">
									<span
										class="text-[10px] uppercase tracking-widest font-semibold text-zinc-400"
										>Network Uptime</span
									>
									<div
										class="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center"
									>
										<Activity
											size={10}
											class="text-[#1B7F3A]"
										/>
									</div>
								</div>
								<div class="mt-4">
									<div class="flex items-baseline gap-1">
										<span
											class="text-4xl font-mono font-bold tabular-nums tracking-tighter text-zinc-900"
											>{$uptimeValue.toFixed(2)}</span
										>
										<span
											class="text-sm font-semibold text-zinc-400"
											>%</span
										>
									</div>
								</div>
							</div>
						</div>

						<div
							class="flex-1 rounded-[2.5rem] p-6 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group"
						>
							<div
								class="absolute inset-0 translate-x-[-100%] group-hover:animate-shimmer opacity-30"
								style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.05), transparent); background-size: 200% 100%;"
							></div>
							<div
								class="relative z-10 flex flex-col justify-between h-full"
							>
								<div class="flex items-center justify-between">
									<span
										class="text-[10px] uppercase tracking-widest font-semibold text-zinc-400"
										>Data Load</span
									>
									<div
										class="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center"
									>
										<Database
											size={10}
											class="text-[#C8102E]"
										/>
									</div>
								</div>
								<div class="mt-4">
									<div class="flex items-baseline gap-1">
										<span
											class="text-4xl font-mono font-bold tabular-nums tracking-tighter text-[#C8102E]"
											>{$levelValue.toFixed(1)}</span
										>
										<span
											class="text-sm font-semibold text-zinc-400"
											>ms</span
										>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					class="absolute -right-4 top-[40%] p-[1.5px] rounded-full overflow-hidden shadow-lg z-20 animate-float"
					style="animation-delay: 1s;"
				>
					<div
						class="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] bg-[conic-gradient(from_0deg,transparent_70%,rgba(200,16,46,0.8)_100%)] animate-[spin_2s_linear_infinite]"
					></div>
					<div
						class="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white backdrop-blur-md"
					>
						<Zap size={12} class="text-[#C8102E]" />
						<span
							class="text-[10px] font-bold tracking-widest uppercase text-zinc-900"
							>Live Sync</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
