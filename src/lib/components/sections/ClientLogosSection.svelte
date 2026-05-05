<script lang="ts">
	import { onMount } from "svelte";
	import Ornaments from "$lib/components/Ornaments.svelte";
	import type { ClientSummary } from "$lib/api";

	let { clients = undefined }: { clients?: ClientSummary[] | null } =
		$props();

	let visible = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) visible = true;
			},
			{ threshold: 0.2 },
		);
		const el = document.getElementById("logo-klien");
		if (el) observer.observe(el);
		return () => observer.disconnect();
	});

	// Row 1: Government agencies — all use Kementerian PUPR logo
	const fallbackRow1 = [
		{ name: "BBWS Ciliwung-Cisadane", initials: "CC", color: "1A56DB" },
		{ name: "BBWS Serayu Opak", initials: "SO", color: "1A56DB" },
		{ name: "BBWS Brantas", initials: "BR", color: "1A56DB" },
		{ name: "BBWS Bengawan Solo", initials: "BS", color: "1A56DB" },
		{ name: "BBWS Cimanuk-Cisanggarung", initials: "CM", color: "1A56DB" },
		{ name: "BBWS Citanduy", initials: "CT", color: "1A56DB" },
		{ name: "BBWS Citarum", initials: "CR", color: "1A56DB" },
		{ name: "BWS Sumatra I", initials: "S1", color: "0E7490" },
		{ name: "BWS Kalimantan IV", initials: "K4", color: "0E7490" },
		{ name: "BWS NT1", initials: "N1", color: "0E7490" },
		{ name: "BWS NT2", initials: "N2", color: "0E7490" },
		{ name: "BWS Papua Barat", initials: "PB", color: "0E7490" },
		{ name: "BWS Sulawesi I", initials: "SL", color: "0E7490" },
		{ name: "Perum Jasa Tirta I", initials: "JT", color: "0369A1" },
		{ name: "Perum Jasa Tirta II", initials: "J2", color: "0369A1" },
		{ name: "Dinas PUSDA Jatim", initials: "PD", color: "15803D" },
		{ name: "Dinas SDA DKI", initials: "DK", color: "15803D" },
		{ name: "SDA ESDM DIY", initials: "DY", color: "15803D" },
	];

	// Row 2: BUMN & Private sector
	const fallbackRow2 = [
		{ name: "Waskita Karya", initials: "WK", color: "C8102E" },
		{ name: "Hutama Karya", initials: "HK", color: "1E40AF" },
		{ name: "Brantas Abipraya", initials: "BA", color: "0E7490" },
		{ name: "Adhi Karya", initials: "AK", color: "1E40AF" },
		{ name: "Wijaya Karya", initials: "WK", color: "15803D" },
		{ name: "PP", initials: "PP", color: "1E40AF" },
		{ name: "Nindya Karya", initials: "NK", color: "C8102E" },
		{ name: "PLN UIB JBT II", initials: "PLN", color: "0369A1" },
		{ name: "Linde Indonesia", initials: "LI", color: "1A56DB" },
		{ name: "Medco Energi", initials: "ME", color: "C8102E" },
		{ name: "Dyfco Energy", initials: "DE", color: "7C3AED" },
		{ name: "Hydro Techno Utama", initials: "HT", color: "0E7490" },
		{ name: "ASABA", initials: "AS", color: "1E40AF" },
		{ name: "Teknindo Geosistem", initials: "TG", color: "15803D" },
		{ name: "Multi Fabrindo Gemilang", initials: "MF", color: "7C3AED" },
		{ name: "UGM", initials: "UGM", color: "1A56DB" },
	];

	// If API clients available, split into 2 rows; otherwise use fallback
	function getInitials(name: string): string {
		return name
			.split(" ")
			.map((w) => w[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	}

	const row1 = $derived(
		clients && clients.length > 0
			? clients.slice(0, Math.ceil(clients.length / 2)).map((c) => ({
					name: c.name,
					initials: getInitials(c.name),
					color: "1A56DB",
					logo: c.logo,
				}))
			: fallbackRow1,
	);

	const row2 = $derived(
		clients && clients.length > 0
			? clients.slice(Math.ceil(clients.length / 2)).map((c) => ({
					name: c.name,
					initials: getInitials(c.name),
					color: "0E7490",
					logo: c.logo,
				}))
			: fallbackRow2,
	);

	function avatarUrl(initials: string, color: string): string {
		return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=80&bold=true&font-size=0.4&format=svg`;
	}
</script>

<section
	id="logo-klien"
	class="relative py-24 lg:py-32 bg-white overflow-hidden"
>
	<Ornaments />
	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<div class="max-w-4xl mb-16 space-y-6 text-center mx-auto">
			<div
				class="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto"
				style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);"
			>
				<span
					class="w-1.5 h-1.5 rounded-full"
					style="background: #C8102E;"
				></span>
				Mitra & Klien
			</div>
			<h2
				class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter text-zinc-950"
			>
				Dipercaya Lembaga & Korporasi yang Memegang <span
					class="text-transparent bg-clip-text"
					style="background-image: linear-gradient(135deg, #1A1A1A 0%, #737373 100%)"
					>Tanggung Jawab Besar</span
				>
			</h2>
		</div>
	</div>

	<!-- Marquee Row 1: Government/BBWS -->
	<div class="relative mb-4">
		<div
			class="absolute left-0 top-0 bottom-0 w-24 z-10"
			style="background: linear-gradient(90deg, white, transparent);"
		></div>
		<div
			class="absolute right-0 top-0 bottom-0 w-24 z-10"
			style="background: linear-gradient(270deg, white, transparent);"
		></div>
		<div class="flex animate-marquee">
			{#each [...row1, ...row1] as client}
				<div class="flex-shrink-0 mx-2.5">
					<div
						class="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#C8102E] hover:bg-[#FBE9EC] transition-all duration-300 cursor-default group"
					>
						<img
							src={"logo" in client && client.logo
								? client.logo
								: avatarUrl(client.initials, client.color)}
							alt={client.name}
							class="w-7 h-7 rounded-lg shrink-0 object-contain"
							loading="lazy"
						/>
						<span
							class="text-xs font-medium text-[#5C5C5C] group-hover:text-[#C8102E] transition-colors whitespace-nowrap"
							>{client.name}</span
						>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Marquee Row 2: BUMN & Private (reversed direction) -->
	<div class="relative">
		<div
			class="absolute left-0 top-0 bottom-0 w-24 z-10"
			style="background: linear-gradient(90deg, white, transparent);"
		></div>
		<div
			class="absolute right-0 top-0 bottom-0 w-24 z-10"
			style="background: linear-gradient(270deg, white, transparent);"
		></div>
		<div class="flex animate-marquee-reverse">
			{#each [...row2, ...row2] as client}
				<div class="flex-shrink-0 mx-2.5">
					<div
						class="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#C8102E] hover:bg-[#FBE9EC] transition-all duration-300 cursor-default group"
					>
						<img
							src={"logo" in client && client.logo
								? client.logo
								: avatarUrl(client.initials, client.color)}
							alt={client.name}
							class="w-7 h-7 rounded-lg shrink-0 object-contain"
							loading="lazy"
						/>
						<span
							class="text-xs font-medium text-[#5C5C5C] group-hover:text-[#C8102E] transition-colors whitespace-nowrap"
							>{client.name}</span
						>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
