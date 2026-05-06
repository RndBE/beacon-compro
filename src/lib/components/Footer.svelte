<script lang="ts">
	import { Phone, Mail, MessageCircle, MapPin, Clock, ArrowUpRight } from '@lucide/svelte';
	import logoBeacon from '$lib/assets/logo_be.png';
	import InstagramFeed from './InstagramFeed.svelte';
	import type { SolutionSummary } from '$lib/api';

	let { solutions = null }: { solutions?: SolutionSummary[] | null } = $props();

	const fallbackSolutions = [
		{ name: 'Water Security', slug: 'water-security' },
		{ name: 'Weather Forecast', slug: 'weather-forecast' },
		{ name: 'Early Warning', slug: 'early-warning' },
		{ name: 'Pressure Measurement', slug: 'pressure-measurement' },
		{ name: 'STESY', slug: 'stesy' }
	];

	const footerSolutions = $derived(
		solutions && solutions.length > 0
			? solutions.slice(0, 6).map((solution) => ({
					name: solution.name,
					slug: solution.slug
				}))
			: fallbackSolutions
	);
</script>

<footer
	class="relative bg-zinc-950 border-t border-white/10 pt-20 pb-8 overflow-hidden text-zinc-400"
>
	<!-- Abstract Glow / Liquid Refraction -->
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-[#C8102E]/50 to-transparent opacity-50"
	></div>
	<div
		class="absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-[100%] bg-[#C8102E]/5 blur-[120px] pointer-events-none"
	></div>

	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-16">
			<!-- Column 1: Brand & Identity (Spans 4 cols on lg) -->
			<div class="lg:col-span-4 space-y-8">
				<div class="flex flex-col items-start gap-6">
					<!-- Logo Inverted for Dark Mode -->
					<div class="relative">
						<img
							src={logoBeacon}
							alt="Beacon Engineering"
							class="h-10 w-auto"
							style="filter: brightness(0) invert(1);"
						/>
						<div
							class="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#C8102E] to-transparent opacity-20 blur-xl rounded-full"
						></div>
					</div>

					<p
						class="text-sm leading-relaxed text-zinc-500 font-medium max-w-[40ch]"
					>
						Pionir Sistem Telemetri Pintar di Indonesia.
						Menghadirkan solusi instrumentasi cerdas untuk efisiensi
						dan keamanan infrastruktur nasional.
					</p>
				</div>

				<!-- Minimalist Address Box -->
				<div
					class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 w-fit"
				>
					<div
						class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0"
					>
						<MapPin size={14} class="text-zinc-300" />
					</div>
					<div class="text-xs leading-relaxed text-zinc-400">
						<span class="block text-zinc-200 font-semibold mb-0.5"
							>Headquarters</span
						>
						Kadirojo I, Purwomartani, Kalasan,<br />Sleman, DIY
						55571
					</div>
				</div>

				<!-- Social Links Bento Style -->
				<div class="flex items-center gap-3">
					<a
						href="https://instagram.com/beacon_engineering"
						target="_blank"
						rel="noopener"
						class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 group"
						aria-label="Instagram"
					>
						<svg
							class="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors"
							fill="currentColor"
							viewBox="0 0 24 24"
							><path
								d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
							/></svg
						>
					</a>
					<a
						href="https://linkedin.com/company/beacon-engineering"
						target="_blank"
						rel="noopener"
						class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 group"
						aria-label="LinkedIn"
					>
						<svg
							class="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors"
							fill="currentColor"
							viewBox="0 0 24 24"
							><path
								d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
							/></svg
						>
					</a>
					<a
						href="https://youtube.com/@beacon_engineering"
						target="_blank"
						rel="noopener"
						class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 group"
						aria-label="YouTube"
					>
						<svg
							class="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors"
							fill="currentColor"
							viewBox="0 0 24 24"
							><path
								d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
							/></svg
						>
					</a>
				</div>
			</div>

			<!-- Column 2: Solusi (Spans 2 cols) -->
			<div class="lg:col-span-3 lg:col-start-6">
				<h3
					class="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-80"
				>
					Solusi Kami
				</h3>
				<ul class="space-y-4">
					{#each footerSolutions as item}
						<li>
							<a
								href="/solusi/{item.slug}"
								class="group inline-flex items-center text-sm font-medium text-zinc-500 transition-colors hover:text-white"
							>
								{item.name}
								<ArrowUpRight
									size={14}
									class="ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-[#C8102E]"
								/>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Column 3: Perusahaan (Spans 2 cols) -->
			<div class="lg:col-span-2">
				<h3
					class="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-80"
				>
					Perusahaan
				</h3>
				<ul class="space-y-4">
					{#each [{ name: "Tentang Kami", href: "/tentang-kami" }, { name: "Proyek", href: "/proyek" }, { name: "Sertifikasi", href: "/tentang-kami#sertifikasi" }, { name: "Wawasan", href: "/wawasan" }] as item}
						<li>
							<a
								href={item.href}
								class="text-sm font-medium text-zinc-500 transition-colors hover:text-white"
								>{item.name}</a
							>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Column 4: Kontak (Spans 2 cols) -->
			<div class="lg:col-span-2">
				<h3
					class="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-80"
				>
					Kontak
				</h3>
				<ul class="space-y-4">
					<li class="flex items-start gap-3 group">
						<div
							class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-[#C8102E] transition-colors"
						>
							<Phone
								size={12}
								class="text-zinc-300 group-hover:text-white"
							/>
						</div>
						<div class="pt-1">
							<span
								class="block text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1"
								>Telepon</span
							>
							<a
								href="tel:02744986899"
								class="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
								>(0274) 4986899</a
							>
						</div>
					</li>
					<li class="flex items-start gap-3 group">
						<div
							class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-[#C8102E] transition-colors"
						>
							<MessageCircle
								size={12}
								class="text-zinc-300 group-hover:text-white"
							/>
						</div>
						<div class="pt-1">
							<span
								class="block text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1"
								>WhatsApp</span
							>
							<a
								href="https://wa.me/628112850986"
								class="text-sm font-medium text-zinc-400 hover:text-white transition-colors tabular-nums"
								>0811-2850-9986</a
							>
						</div>
					</li>
					<li class="flex items-start gap-3 group">
						<div
							class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-[#C8102E] transition-colors"
						>
							<Mail
								size={12}
								class="text-zinc-300 group-hover:text-white"
							/>
						</div>
						<div class="pt-1">
							<span
								class="block text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1"
								>Email</span
							>
							<a
								href="mailto:info@bejogja.com"
								class="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
								>info@bejogja.com</a
							>
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div
							class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10"
						>
							<Clock size={12} class="text-zinc-300" />
						</div>
						<div class="pt-1">
							<span
								class="block text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1"
								>Jam Kerja</span
							>
							<span class="text-sm font-medium text-zinc-400"
								>08:00 - 17:00 WIB</span
							>
						</div>
					</li>
				</ul>
			</div>
		</div>

		<InstagramFeed />

		<!-- Big Separator -->
		<div
			class="mt-20 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
		></div>

		<!-- Bottom Bar -->
		<div
			class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
		>
			<div class="flex items-center gap-2">
				<p class="text-xs font-medium text-zinc-600">
					© {new Date().getFullYear()} PT Arta Teknologi Comunindo.
				</p>
			</div>

			<div class="flex items-center gap-6">
				<a
					href="/privacy-policy"
					class="text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-colors"
					>Privacy Policy</a
				>
				<span class="w-1 h-1 rounded-full bg-white/10"></span>
				<a
					href="/terms-of-service"
					class="text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-colors"
					>Terms of Service</a
				>
			</div>

			<div class="flex items-center gap-2">
				<div
					class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
				></div>
				<p
					class="text-[11px] font-bold uppercase tracking-widest text-zinc-500"
				>
					All Systems Operational
				</p>
			</div>
		</div>
	</div>
</footer>
