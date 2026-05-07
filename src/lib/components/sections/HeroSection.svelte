<script lang="ts">
	import { onMount } from "svelte";
	import {
		ArrowRight,
		Activity,
		Zap,
		Terminal,
		Radio,
		CloudRain,
		Cpu,
		Gauge,
		Waves,
		Satellite,
		ShieldAlert,
	} from "@lucide/svelte";
	import Ornaments from "$lib/components/Ornaments.svelte";
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";

	let mounted = $state(false);
	let cursorX = $state(50);
	let cursorY = $state(50);

	// Field atlas telemetry tickers with smooth hardware-friendly motion.
	let levelValue = tweened(142.3, { duration: 1000, easing: cubicOut });
	let rainfallValue = tweened(12.8, { duration: 1000, easing: cubicOut });
	let uptimeValue = tweened(98.7, { duration: 1000, easing: cubicOut });

	const fieldNodes = [
		{
			id: "ikn",
			name: "Bendungan IKN",
			code: "AWLR-17",
			metric: "TMA +0.18 m",
			kind: "water",
			status: "stable",
			x: 68,
			y: 27,
			delay: 0,
		},
		{
			id: "ijen",
			name: "Kawah Ijen",
			code: "APLR-04",
			metric: "Thermal +2.7 C",
			kind: "pressure",
			status: "critical",
			x: 33,
			y: 35,
			delay: 180,
		},
		{
			id: "ciawi",
			name: "ADR Ciawi",
			code: "VW-32",
			metric: "0.021 mm",
			kind: "strain",
			status: "watch",
			x: 53,
			y: 68,
			delay: 360,
		},
		{
			id: "cuaca",
			name: "Stasiun Cuaca",
			code: "ARR-09",
			metric: "12.8 mm/h",
			kind: "rain",
			status: "stable",
			x: 79,
			y: 63,
			delay: 540,
		},
		{
			id: "keureuto",
			name: "Keureuto",
			code: "EWS-21",
			metric: "sirene armed",
			kind: "radio",
			status: "stable",
			x: 23,
			y: 76,
			delay: 720,
		},
	] as const;

	const signalRoutes = [
		{ id: "r1", d: "M 334 276 C 374 238, 410 185, 438 143", duration: 6.8, delay: "0s" },
		{ id: "r2", d: "M 334 276 C 292 232, 246 202, 214 185", duration: 7.4, delay: "1.1s" },
		{ id: "r3", d: "M 334 276 C 333 333, 332 370, 342 404", duration: 8.2, delay: "0.5s" },
		{ id: "r4", d: "M 334 276 C 405 302, 471 334, 508 372", duration: 7.8, delay: "1.7s" },
		{ id: "r5", d: "M 334 276 C 260 333, 194 388, 148 446", duration: 8.9, delay: "2.2s" },
	] as const;

	const fieldEvents = [
		{
			station: "Kawah Ijen",
			line: "Thermal pressure melewati baseline",
			value: "+2.7 C",
			tone: "critical",
		},
		{
			station: "ADR Ciawi",
			line: "Deformasi mikro terkunci stabil",
			value: "0.021 mm",
			tone: "watch",
		},
		{
			station: "Bendungan IKN",
			line: "Paket AWLR tersinkron ke STESY",
			value: "18 ms",
			tone: "stable",
		},
		{
			station: "Stasiun Cuaca",
			line: "Intensitas hujan terukur realtime",
			value: "12.8 mm/h",
			tone: "stable",
		},
	] as const;

	const telemetryBars = [42, 66, 51, 78, 63, 88, 57, 74, 69, 81];
	let eventIndex = $state(0);
	let activeEvent = $derived(fieldEvents[eventIndex]);

	// Typewriter state
	let promptText = $state("");
	let isProcessing = $state(false);
	const prompts = [
		"Menggabungkan sinyal AWLR, ADR, ARR, dan APLR...",
		"Menandai korelasi hujan terhadap deformasi Ciawi...",
		"Mengirim ringkasan anomali ke operator BBWS...",
		"Menyusun prioritas alert dari 47 stasiun aktif...",
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

		const eventInterval = setInterval(() => {
			eventIndex = (eventIndex + 1) % fieldEvents.length;
		}, 4200);

		// Typewriter logic
		let typeTimeout: ReturnType<typeof setTimeout> | undefined;
		const runTypewriter = async () => {
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
			if (mounted) {
				typeTimeout = setTimeout(runTypewriter, 900);
			}
		};

		runTypewriter();

		return () => {
			mounted = false;
			clearInterval(numInterval);
			clearInterval(eventInterval);
			if (typeTimeout) clearTimeout(typeTimeout);
		};
	});

	function handlePointerMove(e: PointerEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		cursorX = ((e.clientX - rect.left) / rect.width) * 100;
		cursorY = ((e.clientY - rect.top) / rect.height) * 100;
	}
</script>

<section
	class="relative min-h-[100dvh] flex flex-col overflow-hidden"
	onpointermove={handlePointerMove}
	id="hero"
	aria-label="Hero Beacon Engineering"
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
						href="https://wa.me/628112632151"
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

			<!-- Right Side: Telemetry Field Atlas -->
			<div
				class="lg:col-span-6 hidden h-[640px] lg:block relative"
				style="opacity: {mounted
					? 1
					: 0}; transform: translateX({mounted
					? 0
					: 40}px); transition: all 1s cubic-bezier(0.16,1,0.3,1) 0.3s;"
			>
				<div
					class="atlas-shell relative h-full overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/70 shadow-[0_32px_70px_-34px_rgba(200,16,46,0.35)] backdrop-blur-xl"
					style="--atlas-x: {cursorX}%; --atlas-y: {cursorY}%;"
				>
					<div class="atlas-grid absolute inset-0"></div>
					<div class="atlas-spotlight absolute inset-0"></div>
					<div class="atlas-noise absolute inset-0"></div>

					<svg
						class="absolute inset-0 h-full w-full opacity-80"
						viewBox="0 0 640 560"
						preserveAspectRatio="none"
						aria-hidden="true"
					>
						<path
							class="atlas-topo-line"
							d="M 53 154 C 122 88, 232 82, 306 130 C 396 188, 465 124, 559 160"
						/>
						<path
							class="atlas-topo-line atlas-delay-1"
							d="M 78 250 C 146 190, 236 205, 305 242 C 382 284, 473 246, 582 284"
						/>
						<path
							class="atlas-topo-line atlas-delay-2"
							d="M 48 382 C 126 334, 207 358, 288 398 C 390 449, 478 396, 606 432"
						/>
						<path
							class="atlas-topo-line atlas-delay-3"
							d="M 121 92 C 190 48, 303 55, 370 98 C 459 155, 520 74, 612 121"
						/>
						<path
							class="atlas-topo-line atlas-delay-4"
							d="M 18 476 C 110 435, 202 462, 284 494 C 377 531, 478 483, 624 516"
						/>
					</svg>

					<svg
						class="absolute inset-0 h-full w-full"
						viewBox="0 0 640 560"
						preserveAspectRatio="none"
						aria-hidden="true"
					>
						{#each signalRoutes as route}
							<path class="atlas-route-base" d={route.d} />
							<path
								class="atlas-route-pulse"
								d={route.d}
								style="animation-duration: {route.duration}s; animation-delay: {route.delay};"
							/>
							<circle class="atlas-packet" r="4">
								<animateMotion
									dur={`${route.duration}s`}
									begin={route.delay}
									repeatCount="indefinite"
									path={route.d}
								/>
							</circle>
						{/each}
					</svg>

					<div class="atlas-scanline absolute left-[-12%] right-[-12%] top-0 h-16"></div>

					<div class="absolute left-5 right-5 top-5 z-20 flex items-start justify-between gap-4">
						<div
							class="rounded-[1.35rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md"
						>
							<div class="mb-2 flex items-center gap-2">
								<Terminal size={14} class="text-zinc-400" strokeWidth={1.8} />
								<span
									class="text-[10px] uppercase tracking-widest font-semibold text-zinc-500"
									>Field Network Atlas</span
								>
							</div>
							<div class="min-h-5 font-mono text-[12px] leading-relaxed text-zinc-800">
								<span class="mr-2 text-[#C8102E]">~%</span>{promptText}<span class="atlas-caret">_</span>
							</div>
							<div class="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100">
								<div
									class={`h-full rounded-full bg-[#C8102E] transition-[width] duration-500 ${isProcessing ? "w-[88%]" : "w-[34%]"}`}
								></div>
							</div>
						</div>

						<div
							class={`w-[236px] rounded-[1.35rem] border px-4 py-3 shadow-[0_18px_40px_-26px_rgba(24,24,27,0.4)] backdrop-blur-md transition-colors duration-500 ${
								activeEvent.tone === "critical"
									? "border-[#C8102E]/30 bg-white/90"
									: "border-white/70 bg-white/80"
							}`}
						>
							<div class="mb-2 flex items-center justify-between gap-3">
								<div class="flex items-center gap-2">
									{#if activeEvent.tone === "critical"}
										<ShieldAlert size={14} class="text-[#C8102E]" strokeWidth={1.8} />
									{:else}
										<Activity size={14} class="text-zinc-500" strokeWidth={1.8} />
									{/if}
									<span class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
										Live Decision
									</span>
								</div>
								<span class="h-1.5 w-1.5 rounded-full bg-[#C8102E] atlas-live-dot"></span>
							</div>
							<span class="block text-xs font-bold text-zinc-950">{activeEvent.station}</span>
							<span class="mt-1 block text-[11px] leading-snug text-zinc-500">{activeEvent.line}</span>
							<span class="mt-3 block font-mono text-lg font-bold tabular-nums tracking-tight text-[#C8102E]">
								{activeEvent.value}
							</span>
						</div>
					</div>

					<div
						class="absolute left-1/2 top-[48%] z-20 w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-[1.8rem] bg-zinc-950/95 p-4 text-white shadow-[0_28px_60px_-34px_rgba(24,24,27,0.9)]"
					>
						<div class="absolute inset-0 rounded-[1.8rem] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"></div>
						<div class="relative z-10">
							<div class="mb-4 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<Cpu size={16} class="text-zinc-300" strokeWidth={1.8} />
									<span class="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
										STESY Core
									</span>
								</div>
								<span class="h-2 w-2 rounded-full bg-[#C8102E] atlas-live-dot"></span>
							</div>
							<div class="grid grid-cols-10 gap-1.5">
								{#each telemetryBars as bar, i}
									<span
										class="atlas-core-bar rounded-full bg-white/20"
										style="height: {bar}px; animation-delay: {i * 90}ms;"
									></span>
								{/each}
							</div>
							<div class="mt-4 flex items-end justify-between">
								<div>
									<span class="block text-[9px] uppercase tracking-widest text-zinc-500">Uplink</span>
									<span class="font-mono text-2xl font-bold tabular-nums tracking-tighter">
										{$uptimeValue.toFixed(2)}
									</span>
								</div>
								<span class="pb-1 text-[10px] font-semibold text-zinc-500">%</span>
							</div>
						</div>
					</div>

					<div class="absolute inset-0 z-10">
						{#each fieldNodes as node}
							<div
								class="atlas-node absolute"
								style="left: {node.x}%; top: {node.y}%; animation-delay: {node.delay}ms;"
							>
								<div
									class={`atlas-node-pulse absolute inset-[-13px] rounded-full ${
										node.status === "critical" ? "border-[#C8102E]/45" : "border-zinc-300/55"
									}`}
								></div>
								<div
									class={`relative flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-[0_16px_32px_-22px_rgba(24,24,27,0.65)] ${
										node.status === "critical" ? "border-[#C8102E]/35" : "border-white/80"
									}`}
								>
									{#if node.kind === "water"}
										<Waves size={17} class="text-zinc-700" strokeWidth={1.8} />
									{:else if node.kind === "rain"}
										<CloudRain size={17} class="text-zinc-700" strokeWidth={1.8} />
									{:else if node.kind === "radio"}
										<Radio size={17} class="text-zinc-700" strokeWidth={1.8} />
									{:else if node.kind === "strain"}
										<Gauge size={17} class="text-zinc-700" strokeWidth={1.8} />
									{:else}
										<Satellite size={17} class="text-zinc-700" strokeWidth={1.8} />
									{/if}
								</div>
								<div
									class={`atlas-node-label absolute left-1/2 w-[152px] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-[0_16px_36px_-28px_rgba(24,24,27,0.55)] backdrop-blur-md ${
										node.y > 58 ? "bottom-14" : "top-14"
									}`}
								>
									<div class="mb-1 flex items-center justify-between gap-2">
										<span class="truncate text-[11px] font-bold text-zinc-950">{node.name}</span>
										<span
											class={`h-1.5 w-1.5 rounded-full ${
												node.status === "critical" ? "bg-[#C8102E]" : "bg-zinc-400"
											}`}
										></span>
									</div>
									<span class="block font-mono text-[9px] uppercase tracking-widest text-zinc-400">
										{node.code}
									</span>
									<span class="mt-1 block font-mono text-[11px] font-semibold tabular-nums text-zinc-700">
										{node.metric}
									</span>
								</div>
							</div>
						{/each}
					</div>

					<div class="atlas-corridor absolute -right-16 top-[156px] z-10 h-[260px] w-[224px] rotate-[13deg]">
						{#each telemetryBars.slice(0, 8) as _, i}
							<span style="animation-delay: {i * 170}ms;"></span>
						{/each}
					</div>

					<div class="absolute bottom-5 left-5 right-5 z-20 grid grid-cols-3 gap-3">
						<div
							class="rounded-[1.35rem] border border-white/70 bg-white/85 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md"
						>
							<div class="mb-2 flex items-center gap-2">
								<Activity size={13} class="text-zinc-400" strokeWidth={1.8} />
								<span class="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
									Network
								</span>
							</div>
							<div class="flex items-baseline gap-1">
								<span class="font-mono text-2xl font-bold tabular-nums tracking-tighter text-zinc-950">
									{$uptimeValue.toFixed(2)}
								</span>
								<span class="text-xs font-semibold text-zinc-400">%</span>
							</div>
						</div>

						<div
							class="rounded-[1.35rem] border border-white/70 bg-white/85 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md"
						>
							<div class="mb-2 flex items-center gap-2">
								<CloudRain size={13} class="text-zinc-400" strokeWidth={1.8} />
								<span class="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
									Rainfall
								</span>
							</div>
							<div class="flex items-baseline gap-1">
								<span class="font-mono text-2xl font-bold tabular-nums tracking-tighter text-zinc-950">
									{$rainfallValue.toFixed(1)}
								</span>
								<span class="text-xs font-semibold text-zinc-400">mm/h</span>
							</div>
						</div>

						<div
							class="rounded-[1.35rem] border border-white/70 bg-white/85 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md"
						>
							<div class="mb-2 flex items-center gap-2">
								<Zap size={13} class="text-[#C8102E]" strokeWidth={1.8} />
								<span class="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
									Latency
								</span>
							</div>
							<div class="flex items-baseline gap-1">
								<span class="font-mono text-2xl font-bold tabular-nums tracking-tighter text-[#C8102E]">
									{$levelValue.toFixed(1)}
								</span>
								<span class="text-xs font-semibold text-zinc-400">ms</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.atlas-shell {
		isolation: isolate;
	}

	.atlas-shell::before {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		content: "";
		border-radius: inherit;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.78),
			inset 0 -1px 0 rgba(200, 16, 46, 0.07);
	}

	.atlas-grid {
		background-image:
			linear-gradient(rgba(24, 24, 27, 0.045) 1px, transparent 1px),
			linear-gradient(90deg, rgba(24, 24, 27, 0.045) 1px, transparent 1px),
			radial-gradient(circle at 72% 28%, rgba(200, 16, 46, 0.09), transparent 26%),
			radial-gradient(circle at 28% 78%, rgba(24, 24, 27, 0.07), transparent 30%);
		background-size:
			38px 38px,
			38px 38px,
			100% 100%,
			100% 100%;
		opacity: 0.9;
	}

	.atlas-spotlight {
		z-index: 1;
		pointer-events: none;
		background: radial-gradient(
			320px circle at var(--atlas-x) var(--atlas-y),
			rgba(200, 16, 46, 0.12),
			transparent 58%
		);
	}

	.atlas-noise {
		z-index: 2;
		pointer-events: none;
		background-image:
			radial-gradient(circle at 20% 30%, rgba(24, 24, 27, 0.05) 0 1px, transparent 1px),
			radial-gradient(circle at 80% 60%, rgba(200, 16, 46, 0.05) 0 1px, transparent 1px);
		background-size:
			18px 18px,
			22px 22px;
		opacity: 0.28;
		mix-blend-mode: multiply;
	}

	.atlas-topo-line {
		fill: none;
		stroke: rgba(113, 113, 122, 0.24);
		stroke-width: 1.35;
		stroke-dasharray: 9 13;
		stroke-linecap: round;
		animation: atlasTopo 16s ease-in-out infinite;
	}

	.atlas-delay-1 {
		animation-delay: 0.9s;
	}

	.atlas-delay-2 {
		animation-delay: 1.8s;
	}

	.atlas-delay-3 {
		animation-delay: 2.7s;
	}

	.atlas-delay-4 {
		animation-delay: 3.6s;
	}

	.atlas-route-base {
		fill: none;
		stroke: rgba(63, 63, 70, 0.22);
		stroke-width: 1.1;
		stroke-linecap: round;
	}

	.atlas-route-pulse {
		fill: none;
		stroke: #c8102e;
		stroke-width: 1.65;
		stroke-linecap: round;
		stroke-dasharray: 16 28;
		opacity: 0.72;
		animation: atlasRouteFlow 8s linear infinite;
	}

	.atlas-packet {
		fill: #c8102e;
		opacity: 0.72;
	}

	.atlas-scanline {
		z-index: 6;
		pointer-events: none;
		background: linear-gradient(
			180deg,
			transparent,
			rgba(200, 16, 46, 0.08),
			rgba(255, 255, 255, 0.5),
			transparent
		);
		transform: translateY(-140%) rotate(-8deg);
		animation: atlasScan 5.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
	}

	.atlas-node {
		transform: translate(-50%, -50%);
		animation: atlasNodeFloat 6s ease-in-out infinite;
	}

	.atlas-node-pulse {
		border-width: 1px;
		animation: atlasNodePulse 2.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
	}

	.atlas-node-label {
		opacity: 0.9;
		transform: translateX(-50%) scale(0.96);
		transition:
			opacity 260ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.atlas-node:hover .atlas-node-label {
		opacity: 1;
		transform: translateX(-50%) scale(1);
	}

	.atlas-live-dot {
		animation: atlasLiveDot 1.35s ease-in-out infinite;
	}

	.atlas-caret {
		animation: atlasCaret 0.9s step-end infinite;
	}

	.atlas-core-bar {
		align-self: end;
		min-height: 18px;
		transform-origin: bottom;
		animation: atlasCoreBar 3.2s ease-in-out infinite;
	}

	.atlas-corridor {
		display: grid;
		gap: 10px;
		pointer-events: none;
		opacity: 0.58;
	}

	.atlas-corridor span {
		display: block;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(200, 16, 46, 0.34),
			rgba(63, 63, 70, 0.22),
			transparent
		);
		transform: translateX(-24px);
		animation: atlasCorridor 2.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
	}

	@keyframes atlasTopo {
		0%,
		100% {
			stroke-dashoffset: 0;
			opacity: 0.5;
		}
		50% {
			stroke-dashoffset: -42;
			opacity: 0.9;
		}
	}

	@keyframes atlasRouteFlow {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: -176;
		}
	}

	@keyframes atlasScan {
		0% {
			opacity: 0;
			transform: translateY(-140%) rotate(-8deg);
		}
		12%,
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(760%) rotate(-8deg);
		}
	}

	@keyframes atlasNodeFloat {
		0%,
		100% {
			transform: translate(-50%, -50%) translateY(0);
		}
		50% {
			transform: translate(-50%, -50%) translateY(-7px);
		}
	}

	@keyframes atlasNodePulse {
		0%,
		100% {
			opacity: 0.36;
			transform: scale(0.82);
		}
		50% {
			opacity: 0.78;
			transform: scale(1.12);
		}
	}

	@keyframes atlasLiveDot {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(0.9);
		}
		50% {
			opacity: 1;
			transform: scale(1.18);
		}
	}

	@keyframes atlasCaret {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	@keyframes atlasCoreBar {
		0%,
		100% {
			opacity: 0.45;
			transform: scaleY(0.78);
		}
		50% {
			opacity: 0.96;
			transform: scaleY(1);
		}
	}

	@keyframes atlasCorridor {
		0% {
			opacity: 0;
			transform: translateX(-24px);
		}
		35%,
		68% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateX(48px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.atlas-topo-line,
		.atlas-route-pulse,
		.atlas-scanline,
		.atlas-node,
		.atlas-node-pulse,
		.atlas-live-dot,
		.atlas-caret,
		.atlas-core-bar,
		.atlas-corridor span {
			animation: none !important;
		}
	}
</style>
