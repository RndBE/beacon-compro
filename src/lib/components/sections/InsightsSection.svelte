<script lang="ts">
	import { ArrowRight, Clock, TrendingUp } from "@lucide/svelte";
	import { onMount } from "svelte";
	import Ornaments from "$lib/components/Ornaments.svelte";

	let visible = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) visible = true;
			},
			{ threshold: 0.2 },
		);
		const el = document.getElementById("wawasan-terbaru");
		if (el) observer.observe(el);
		return () => observer.disconnect();
	});

	const featured = {
		title: "Bagaimana Telemetri ADR Menyelamatkan Keamanan Bendungan Ciawi",
		excerpt:
			"Studi kasus implementasi Automatic Deformation Recorder di Bendungan Ciawi-Sukamahi yang mampu mendeteksi pergeseran mikro-milimeter pada struktur bendungan secara real-time.",
		category: "Studi Kasus",
		readTime: "8 min",
		date: "12 Apr 2026",
		href: "/wawasan/adr-bendungan-ciawi",
	};

	const articles = [
		{
			title: "Memahami Standar SNI untuk Sistem Telemetri AWLR di Indonesia",
			category: "Artikel Teknis",
			readTime: "12 min",
			date: "5 Apr 2026",
			href: "/wawasan/standar-sni-awlr",
		},
		{
			title: "STESY 3.0: Fitur Baru yang Mengubah Cara Anda Memantau Infrastruktur",
			category: "Berita Produk",
			readTime: "5 min",
			date: "28 Mar 2026",
			href: "/wawasan/stesy-3-update",
		},
	];

	const categoryColors: Record<string, string> = {
		"Studi Kasus": "#C8102E",
		"Artikel Teknis": "#0EA5E9",
		"Berita Produk": "#8B5CF6",
	};
</script>

<!-- SKILL: Replace 3-equal-card grid with featured + side list (asymmetric 7/5 layout) -->
<section
	id="wawasan-terbaru"
	class="relative py-20 lg:py-28 section-offwhite overflow-hidden"
>
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Heading — left-aligned with CTA right -->
		<div
			class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16"
		>
			<div class="space-y-4">
				<div
					class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
					style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);"
				>
					<span
						class="w-1.5 h-1.5 rounded-full"
						style="background: #C8102E;"
					></span>
					Wawasan
				</div>
				<h2
					class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter text-zinc-950"
				>
					Wawasan <span
						class="text-transparent bg-clip-text"
						style="background-image: linear-gradient(135deg, #FF5F56 0%, #C8102E 50%, #8A0B1F 100%)"
						>Terbaru</span
					>
				</h2>
			</div>
			<a
				href="/wawasan"
				class="hidden sm:inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3"
				style="color: #C8102E;"
			>
				Baca Wawasan Lainnya
				<ArrowRight size={14} />
			</a>
		</div>

		<!-- Asymmetric layout: Featured article (large) + side list -->
		<div class="grid lg:grid-cols-12 gap-6">
			<!-- Featured article — 7 cols -->
			<a
				href={featured.href}
				class="lg:col-span-7 group rounded-[20px] overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				style="
					border: 1px solid #E5E5E5;
					opacity: {visible ? 1 : 0};
					transform: translateY({visible ? 0 : 20}px);
					transition: opacity 0.6s ease-out, transform 0.6s ease-out, box-shadow 0.3s;
				"
			>
				<!-- Large thumbnail area with gradient -->
				<div
					class="relative h-64 sm:h-72 overflow-hidden"
					style="background: linear-gradient(135deg, #FBE9EC 0%, #FFF5F6 50%, #FAFAFA 100%);"
				>
					<div
						class="absolute inset-0 flex items-center justify-center"
					>
						<div
							class="w-24 h-24 rounded-[24px] flex items-center justify-center"
							style="background: rgba(200,16,46,0.08); backdrop-filter: blur(8px);"
						>
							<TrendingUp
								size={40}
								style="color: #C8102E; opacity: 0.6;"
							/>
						</div>
					</div>
					<!-- Category badge -->
					<div class="absolute top-4 left-4">
						<span
							class="text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white"
							style="background: {categoryColors[
								featured.category
							]};"
						>
							{featured.category}
						</span>
					</div>
					<!-- Hover arrow -->
					<div
						class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2"
					>
						<ArrowRight size={16} style="color: #C8102E;" />
					</div>
				</div>

				<div class="p-7">
					<h3
						class="font-heading text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#C8102E] transition-colors leading-snug"
					>
						{featured.title}
					</h3>
					<p
						class="text-sm text-[#5C5C5C] leading-relaxed mb-5 max-w-[55ch]"
					>
						{featured.excerpt}
					</p>
					<div class="flex items-center gap-4">
						<span class="text-xs text-[#5C5C5C]"
							>{featured.date}</span
						>
						<span class="text-[#E5E5E5]">·</span>
						<span
							class="flex items-center gap-1 text-xs text-[#5C5C5C]"
						>
							<Clock size={11} />
							{featured.readTime}
						</span>
					</div>
				</div>
			</a>

			<!-- Side articles — 5 cols, stacked -->
			<div class="lg:col-span-5 flex flex-col gap-4">
				{#each articles as article, i}
					<a
						href={article.href}
						class="group flex-1 flex flex-col justify-between rounded-[20px] overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
						style="
							border: 1px solid #E5E5E5;
							opacity: {visible ? 1 : 0};
							transform: translateY({visible ? 0 : 20}px);
							transition: opacity 0.6s ease-out {(i + 1) *
							0.1}s, transform 0.6s ease-out {(i + 1) *
							0.1}s, box-shadow 0.3s;
						"
					>
						<!-- Compact thumbnail -->
						<div
							class="relative h-32 overflow-hidden"
							style="background: linear-gradient(135deg, {categoryColors[
								article.category
							]}08, {categoryColors[article.category]}15);"
						>
							<div
								class="absolute inset-0 flex items-center justify-center"
							>
								<div
									class="w-12 h-12 rounded-xl flex items-center justify-center"
									style="background: {categoryColors[
										article.category
									]}12;"
								>
									<span
										class="text-lg font-heading font-bold"
										style="color: {categoryColors[
											article.category
										]};">{article.category.charAt(0)}</span
									>
								</div>
							</div>
							<div class="absolute top-3 left-3">
								<span
									class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md text-white"
									style="background: {categoryColors[
										article.category
									]};"
								>
									{article.category}
								</span>
							</div>
						</div>

						<div class="p-5 flex-1 flex flex-col justify-between">
							<h3
								class="font-heading text-base font-bold text-[#1A1A1A] mb-3 group-hover:text-[#C8102E] transition-colors leading-snug"
							>
								{article.title}
							</h3>
							<div class="flex items-center justify-between">
								<span class="text-xs text-[#5C5C5C]"
									>{article.date}</span
								>
								<span
									class="flex items-center gap-1 text-xs text-[#5C5C5C]"
								>
									<Clock size={11} />
									{article.readTime}
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Mobile CTA -->
		<div class="sm:hidden mt-8 text-center">
			<a
				href="/wawasan"
				class="inline-flex items-center gap-2 text-sm font-semibold"
				style="color: #C8102E;"
			>
				Baca Wawasan Lainnya
				<ArrowRight size={14} />
			</a>
		</div>
	</div>
</section>
