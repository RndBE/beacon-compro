<script lang="ts">
	import { onMount } from "svelte";
	import {
		Target,
		Eye,
		Building2,
		MapPin,
		ArrowUpRight,
		ShieldCheck,
		Award,
		FileBadge,
		CheckCircle2,
		Quote,
	} from "@lucide/svelte";
	import Ornaments from "$lib/components/Ornaments.svelte";
	import type { ClientSummary, TestimonialSummary } from "$lib/api";
	import { locale } from "$lib/i18n";

	let { data } = $props();
	let clients = $derived((data.clients ?? []) as ClientSummary[]);
	let cmsTestimonials = $derived((data.testimonials ?? []) as TestimonialSummary[]);
	let aboutPage = $derived(data.aboutPage);

	let timelineVisible = $state(false);
	let contribVisible = $state(false);
	let mitraVisible = $state(false);
	let testimoniVisible = $state(false);
	let activeKategori = $state("semua");
	let showAllTestimonials = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.target.id === "timeline" && e.isIntersecting)
						timelineVisible = true;
					if (e.target.id === "kontribusi" && e.isIntersecting)
						contribVisible = true;
					if (e.target.id === "mitra" && e.isIntersecting)
						mitraVisible = true;
					if (e.target.id === "testimoni" && e.isIntersecting)
						testimoniVisible = true;
				});
			},
			{ threshold: 0.1 },
		);
		const el1 = document.getElementById("timeline");
		const el2 = document.getElementById("kontribusi");
		const el3 = document.getElementById("mitra");
		const el4 = document.getElementById("testimoni");
		if (el1) observer.observe(el1);
		if (el2) observer.observe(el2);
		if (el3) observer.observe(el3);
		if (el4) observer.observe(el4);
		return () => observer.disconnect();
	});

	const pageCopy = {
		ID: {
			metaTitle: "Tentang Kami — Beacon Engineering",
			metaDesc:
				"Beacon Engineering, didirikan 2013, adalah pionir sistem telemetri pintar buatan Indonesia dengan 300+ proyek infrastruktur strategis.",
			heroBadge: "Tentang Kami",
			heroTitleBefore: "Mulai dengan",
			heroTitleAccent: "Satu Pertanyaan.",
			heroQuestion:
				'"Kenapa monitoring infrastruktur strategis Indonesia harus selalu bergantung pada perangkat impor?"',
			heroTagline:
				"Tiga belas tahun kemudian, jawaban itu terbentang di 300+ lokasi.",
			heroAlt: "Ilustrasi tim Beacon Engineering",
			stats: [
				{ value: "2013", label: "Tahun Berdiri" },
				{ value: "300+", label: "Sistem Aktif" },
				{ value: "100%", label: "Riset Lokal" },
			],
			visionTitle: "Visi",
			missionTitle: "Misi",
			vision:
				"Menjadi perusahaan teknologi telemetri terdepan di Indonesia yang memberikan solusi monitoring real-time terpercaya untuk infrastruktur strategis negara.",
			missions: [
				"Mengembangkan produk telemetri berkualitas tinggi dengan hak cipta lokal",
				"Menyediakan after-sales support terbaik melalui tim teknis Indonesia",
				"Mengintegrasikan AI dan IoT dalam ekosistem monitoring STESY",
				"Mendukung program nasional pengelolaan sumber daya air dan bencana",
			],
			contributionBadge: "Bidang Kontribusi",
			contributionTitle: "Tiga Pilar Kontribusi Beacon",
			timelineBadge: "Perjalanan",
			timelineTitle: "Timeline Beacon Engineering",
			timelineDesc:
				"Dari garasi kecil di Yogyakarta hingga mengamankan infrastruktur strategis nasional.",
			certBadge: "Standar Kualitas",
			certTitlePrefix: "Sertifikasi &",
			certTitleAccent: "HAKI",
			certDesc:
				"Berkomitmen pada standar kualitas dan keamanan internasional dalam setiap lini produk telemetri kami.",
			certifications: [
				{
					title: "ISO 9001:2025",
					subtitle: "Manajemen Mutu",
					desc: "Standar internasional untuk sistem manajemen mutu R&D dan manufaktur perangkat.",
					status: "Certified",
				},
				{
					title: "ISO 27001",
					subtitle: "Keamanan Informasi",
					desc: "Jaminan keamanan data tingkat tinggi untuk arsitektur STESY dan perlindungan data klien.",
					status: "Certified",
				},
				{
					title: "ISO 30141",
					subtitle: "IoT Architecture",
					desc: "Kepatuhan arsitektur standar sistem Internet of Things (IoT) berskala enterprise.",
					status: "Certified",
				},
				{
					title: "HAKI Terdaftar",
					subtitle: "Kekayaan Intelektual",
					desc: "Desain industri dan algoritma perangkat lunak kami telah terlindungi secara hukum nasional.",
					status: "Registered",
				},
			],
			clientsBadge: "Mitra & Klien",
			clientsTitle: "Dipercaya Institusi",
			clientsTitleMuted: "& Korporasi Strategis.",
			clientsStat: "Mitra & Klien Aktif",
			clientCategories: [
				{ id: "semua", label: "Semua" },
				{ id: "sda", label: "Instansi SDA" },
				{ id: "bumn", label: "BUMN / Konstruksi" },
				{ id: "swasta", label: "Swasta / Industri" },
				{ id: "mitra", label: "Mitra / Distributor" },
				{ id: "pendidikan", label: "Pendidikan / Riset" },
			],
			emptyClients: "Belum ada data untuk kategori ini.",
			testimonialBadge: "Testimoni",
			testimonialTitle: "Suara Mitra yang",
			testimonialTitleMuted: "Bekerja di Lapangan.",
			testimonialDesc:
				"Testimoni ini merangkum hal yang paling penting bagi tim lapangan: data yang presisi, perangkat yang tahan kondisi ekstrem, dan dukungan teknis yang bisa dijangkau saat dibutuhkan.",
			showLessTestimonials: "Tampilkan lebih ringkas",
			showMoreTestimonials: (count: number) => `Lihat ${count} testimoni lainnya`,
			officeBadge: "Kantor Kami",
			officeTitle: "Dirancang & Dirakit",
			officeTitleMuted: "di Yogyakarta",
			officeDesc:
				"Seluruh kegiatan R&D, produksi, dan support teknis kami berpusat secara mandiri di Daerah Istimewa Yogyakarta.",
			hqLabel: "Alamat HQ",
		},
		EN: {
			metaTitle: "About Us — Beacon Engineering",
			metaDesc:
				"Beacon Engineering, founded in 2013, is an Indonesian pioneer in smart telemetry systems with 300+ strategic infrastructure projects.",
			heroBadge: "About Us",
			heroTitleBefore: "It Started with",
			heroTitleAccent: "One Question.",
			heroQuestion:
				'"Why should Indonesia\'s strategic infrastructure monitoring always depend on imported devices?"',
			heroTagline:
				"Thirteen years later, the answer now spans 300+ locations.",
			heroAlt: "Beacon Engineering team illustration",
			stats: [
				{ value: "2013", label: "Founded" },
				{ value: "300+", label: "Active Systems" },
				{ value: "100%", label: "Local R&D" },
			],
			visionTitle: "Vision",
			missionTitle: "Mission",
			vision:
				"To become Indonesia's leading telemetry technology company, delivering trusted real-time monitoring solutions for the nation's strategic infrastructure.",
			missions: [
				"Develop high-quality telemetry products backed by local intellectual property",
				"Provide reliable after-sales support through Indonesia-based technical teams",
				"Integrate AI and IoT into the STESY monitoring ecosystem",
				"Support national water-resource management and disaster mitigation programs",
			],
			contributionBadge: "Contribution Areas",
			contributionTitle: "Beacon's Three Contribution Pillars",
			timelineBadge: "Journey",
			timelineTitle: "Beacon Engineering Timeline",
			timelineDesc:
				"From a small garage in Yogyakarta to safeguarding national strategic infrastructure.",
			certBadge: "Quality Standards",
			certTitlePrefix: "Certifications &",
			certTitleAccent: "IP Rights",
			certDesc:
				"Committed to international quality and security standards across every line of our telemetry products.",
			certifications: [
				{
					title: "ISO 9001:2025",
					subtitle: "Quality Management",
					desc: "International standard for quality management in R&D and device manufacturing.",
					status: "Certified",
				},
				{
					title: "ISO 27001",
					subtitle: "Information Security",
					desc: "High-level data security assurance for STESY architecture and client data protection.",
					status: "Certified",
				},
				{
					title: "ISO 30141",
					subtitle: "IoT Architecture",
					desc: "Compliance with enterprise-scale Internet of Things (IoT) architecture standards.",
					status: "Certified",
				},
				{
					title: "Registered IP",
					subtitle: "Intellectual Property",
					desc: "Our industrial designs and software algorithms are protected under national law.",
					status: "Registered",
				},
			],
			clientsBadge: "Partners & Clients",
			clientsTitle: "Trusted by Institutions",
			clientsTitleMuted: "& Strategic Corporations.",
			clientsStat: "Active Partners & Clients",
			clientCategories: [
				{ id: "semua", label: "All" },
				{ id: "sda", label: "Water Agencies" },
				{ id: "bumn", label: "SOEs / Construction" },
				{ id: "swasta", label: "Private / Industry" },
				{ id: "mitra", label: "Partners / Distributors" },
				{ id: "pendidikan", label: "Education / Research" },
			],
			emptyClients: "No data is available for this category yet.",
			testimonialBadge: "Testimonials",
			testimonialTitle: "Voices from Partners",
			testimonialTitleMuted: "Working in the Field.",
			testimonialDesc:
				"These testimonials capture what matters most to field teams: precise data, devices built for extreme conditions, and technical support that remains reachable when needed.",
			showLessTestimonials: "Show fewer testimonials",
			showMoreTestimonials: (count: number) => `View ${count} more testimonials`,
			officeBadge: "Our Office",
			officeTitle: "Designed & Assembled",
			officeTitleMuted: "in Yogyakarta",
			officeDesc:
				"All of our R&D, production, and technical support activities are independently centered in the Special Region of Yogyakarta.",
			hqLabel: "HQ Address",
		},
	};

	const fallbackTimeline = {
		ID: [
			{
				year: "2013",
				title: "Beacon Didirikan",
				desc: 'Berawal dari pertanyaan: "Kenapa monitoring infrastruktur strategis Indonesia harus bergantung pada perangkat impor?"',
			},
			{
				year: "2015",
				title: "Produk Pertama",
				desc: "AWLR generasi pertama berhasil dipasang di pos hidrologi Jawa Tengah.",
			},
			{
				year: "2017",
				title: "Hak Cipta & Sertifikasi",
				desc: "Mendapatkan hak cipta produk dan sertifikasi standar nasional.",
			},
			{
				year: "2019",
				title: "100 Proyek",
				desc: "Milestone 100 proyek tercapai. Ekspansi ke Kalimantan dan Sulawesi.",
			},
			{
				year: "2021",
				title: "STESY Diluncurkan",
				desc: "Platform Smart Telemetry System hadir untuk menyatukan seluruh perangkat dalam satu dashboard.",
			},
			{
				year: "2023",
				title: "Proyek IKN & Ijen",
				desc: "Dipercaya untuk monitoring Bendungan IKN dan Kawah Ijen — bukti kematangan teknologi.",
			},
			{
				year: "2024",
				title: "300+ Proyek",
				desc: "Tersebar dari Aceh sampai Papua, 200+ partner, 30+ BBWS & BUMN.",
			},
			{
				year: "2026",
				title: "STESY 3.0 & AI",
				desc: "Mengintegrasikan AI analytics dan prediktif monitoring ke dalam ekosistem STESY.",
			},
		],
		EN: [
			{
				year: "2013",
				title: "Beacon Founded",
				desc: 'Started with one question: "Why should Indonesia\'s strategic infrastructure monitoring depend on imported devices?"',
			},
			{
				year: "2015",
				title: "First Product",
				desc: "The first-generation AWLR was successfully installed at a hydrology station in Central Java.",
			},
			{
				year: "2017",
				title: "Copyrights & Certification",
				desc: "Received product copyrights and national standard certifications.",
			},
			{
				year: "2019",
				title: "100 Projects",
				desc: "Reached the 100-project milestone, with expansion to Kalimantan and Sulawesi.",
			},
			{
				year: "2021",
				title: "STESY Launched",
				desc: "The Smart Telemetry System platform was introduced to unify all devices in one dashboard.",
			},
			{
				year: "2023",
				title: "IKN & Ijen Projects",
				desc: "Trusted for IKN Dam and Ijen Crater monitoring, proving the maturity of our technology.",
			},
			{
				year: "2024",
				title: "300+ Projects",
				desc: "Deployed from Aceh to Papua, with 200+ partners and 30+ river basin agencies and SOEs.",
			},
			{
				year: "2026",
				title: "STESY 3.0 & AI",
				desc: "Integrating AI analytics and predictive monitoring into the STESY ecosystem.",
			},
		],
	};

	const fallbackContributions = {
		ID: [
			{
				icon: Target,
				title: "Water Management",
				desc: "Monitoring ketinggian muka air, debit, dan kualitas air sungai serta bendungan di seluruh Indonesia.",
				metric: "200+",
				metricLabel: "Stasiun Air",
			},
			{
				icon: Eye,
				title: "Dam Safety",
				desc: "Sistem deformation recorder dan vibrating wire untuk memantau keamanan struktur bendungan 24/7.",
				metric: "50+",
				metricLabel: "Bendungan",
			},
			{
				icon: Building2,
				title: "Structure Monitoring",
				desc: "Pengawasan kondisi aset, getaran, akses lapangan, dan pergerakan struktur kritis untuk infrastruktur BUMN.",
				metric: "30+",
				metricLabel: "Struktur Kritis",
			},
		],
		EN: [
			{
				icon: Target,
				title: "Water Management",
				desc: "Monitoring water level, discharge, and water quality across rivers and dams throughout Indonesia.",
				metric: "200+",
				metricLabel: "Water Stations",
			},
			{
				icon: Eye,
				title: "Dam Safety",
				desc: "Deformation recorder and vibrating wire systems for 24/7 monitoring of dam structure safety.",
				metric: "50+",
				metricLabel: "Dams",
			},
			{
				icon: Building2,
				title: "Structure Monitoring",
				desc: "Monitoring asset condition, vibration, field access, and critical structural movement for SOE infrastructure.",
				metric: "30+",
				metricLabel: "Critical Structures",
			},
		],
	};

	const fallbackTestimonials = {
		ID: [
			{
				name: "Prahasdipta Bayu Adhi Koesoemo",
				position: "Kepala Satuan Unit Pengelola Bendungan Ciawi-Sukamahi-Gintung",
				organization: "BBWS Ciliwung-Cisadane",
				quote: "Perangkat ADR dari Beacon memberikan presisi data deformasi yang sangat kami butuhkan untuk monitoring keamanan bendungan secara real-time. Respons tim teknis mereka terhadap kebutuhan di lapangan sangat cepat dan profesional.",
				initials: "PB",
				photo: null,
			},
			{
				name: "Ali Sukali, S.Sos, S.T, M.Si",
				position: "PPK Bendungan II",
				organization: "Kementerian PUPR",
				quote: "Mitra yang berkomitmen terhadap kualitas buatan anak negeri. Beacon membuktikan bahwa produk lokal mampu bersaing dengan impor, bahkan dalam hal after-sales support jauh lebih unggul karena tim teknisnya ada di Indonesia.",
				initials: "AS",
				photo: null,
			},
			{
				name: "Seto Ariwibowo, ST. MT.",
				position: "PPKom Operasi & Pemeliharaan Pos Hidrologi",
				organization: "BBWS Serayu Opak",
				quote: "Akurasi dan konektivitas perangkat Beacon sudah teruji di berbagai kondisi lapangan yang ekstrem. Data terkirim real-time 24 jam, dan ketika ada kendala, tim support selalu bisa diandalkan untuk penyelesaian cepat.",
				initials: "SA",
				photo: null,
			},
		],
		EN: [
			{
				name: "Prahasdipta Bayu Adhi Koesoemo",
				position: "Head of Ciawi-Sukamahi-Gintung Dam Management Unit",
				organization: "BBWS Ciliwung-Cisadane",
				quote: "Beacon's ADR device delivers the deformation data precision we need for real-time dam safety monitoring. Their technical team's response to field requirements is fast and professional.",
				initials: "PB",
				photo: null,
			},
			{
				name: "Ali Sukali, S.Sos, S.T, M.Si",
				position: "Commitment-Making Officer for Dam II",
				organization: "Ministry of Public Works and Housing",
				quote: "A partner committed to the quality of Indonesian-made products. Beacon proves that local products can compete with imports, especially with stronger after-sales support because the technical team is based in Indonesia.",
				initials: "AS",
				photo: null,
			},
			{
				name: "Seto Ariwibowo, ST. MT.",
				position: "Commitment-Making Officer for Hydrology Station Operations & Maintenance",
				organization: "BBWS Serayu Opak",
				quote: "Beacon's device accuracy and connectivity have been proven across extreme field conditions. Data is transmitted in real time around the clock, and the support team can always be relied on for fast resolution.",
				initials: "SA",
				photo: null,
			},
		],
	};

	// Icon mapping for dynamic data
	const iconMap: Record<string, any> = {
		'Target': Target,
		'Eye': Eye,
		'Building2': Building2,
		'Award': Award,
		'ShieldCheck': ShieldCheck,
		'FileBadge': FileBadge,
	};

	// --- Dynamic data with fallbacks ---
	const copy = $derived(pageCopy[$locale]);
	const useCmsContent = $derived($locale === "ID");

	const timeline = $derived(
		useCmsContent && aboutPage?.milestones && aboutPage.milestones.length > 0
			? aboutPage.milestones
			: fallbackTimeline[$locale]
	);

	const visiText = $derived(
		useCmsContent && aboutPage?.visi
			? aboutPage.visi
			: copy.vision
	);

	const misiList = $derived(
		useCmsContent && aboutPage?.misi && aboutPage.misi.length > 0
			? aboutPage.misi
			: copy.missions
	);

	const contributions = $derived(
		useCmsContent && aboutPage?.contributions && aboutPage.contributions.length > 0
			? aboutPage.contributions.map((c: any) => ({
				icon: iconMap[c.icon_name] ?? Target,
				title: c.title,
				desc: c.desc,
				metric: c.metric,
				metricLabel: c.metric_label,
			}))
			: fallbackContributions[$locale]
	);

	// Kategori client
	const kategoriList = $derived(copy.clientCategories);

	function getKategori(name: string): string {
		if (/^(BBWS|BWS|Dinas|Perum\.|SDA ESDM)/.test(name)) return "sda";
		if (/^PT\. (Adhi|Brantas|Hutama|Nindya|PP|Waskita|Wijaya)/.test(name))
			return "bumn";
		if (/^CV\./.test(name)) return "mitra";
		if (/^(Universitas|UGM|Institut)/.test(name)) return "pendidikan";
		return "swasta";
	}

	const filteredClients = $derived(
		activeKategori === "semua"
			? clients
			: clients.filter((c) => getKategori(c.name) === activeKategori),
	);

	const testimonials = $derived(
		useCmsContent && cmsTestimonials.length > 0
			? cmsTestimonials.map((item) => ({
					name: item.name,
					position: item.position ?? "",
					organization: item.organization ?? item.client_name ?? "",
					quote: item.quote,
					initials: item.initials,
					photo: item.photo,
				}))
			: fallbackTestimonials[$locale],
	);

	const featuredTestimonial = $derived(testimonials[0]);
	const supportingTestimonials = $derived(testimonials.slice(1));
	const visibleSupportingTestimonials = $derived(
		showAllTestimonials ? supportingTestimonials : supportingTestimonials.slice(0, 4),
	);
	const hiddenTestimonialsCount = $derived(
		Math.max(supportingTestimonials.length - visibleSupportingTestimonials.length, 0),
	);
</script>

<svelte:head>
	<title>{copy.metaTitle}</title>
	<meta
		name="description"
		content={copy.metaDesc}
	/>
</svelte:head>

<!-- Hero — SKILL: Split Screen, DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6 -->
<section
	class="relative pt-24 pb-0 lg:pt-32 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden"
>
	<!-- Subtle Dot Grid -->
	<div
		class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
		style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"
	></div>
	<!-- Decorative circle top-left -->
	<div
		class="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-[0.06]"
		style="border: 2px solid #C8102E;"
	></div>
	<!-- Red glow behind illustration -->
	<div
		class="absolute top-1/2 right-0 -translate-y-1/2 w-[55%] h-full pointer-events-none opacity-[0.035] rounded-full"
		style="background: radial-gradient(ellipse at center, #C8102E 0%, transparent 70%);"
	></div>

	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<!-- SKILL Rule 3: Split-screen — text left, illustration right -->
		<div
			class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center"
		>
			<!-- Left: Text -->
			<div
				class="flex flex-col justify-center pb-16 lg:pb-24 lg:pr-12 xl:pr-16"
			>
				<div class="flex items-center gap-3 mb-6">
					<div class="w-8 h-[1px] bg-[#C8102E]"></div>
					<span
						class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]"
					>
						{copy.heroBadge}
					</span>
				</div>

				<h1
					class="font-heading text-4xl md:text-5xl lg:text-[52px] xl:text-[60px] font-extrabold tracking-tighter leading-[1.06] mb-6"
					style="color: #1A1A1A;"
				>
					{copy.heroTitleBefore} <br />
					<span style="color: #C8102E;">{copy.heroTitleAccent}</span>
				</h1>

				<p
					class="text-base md:text-lg text-gray-600 leading-relaxed max-w-[52ch] mb-4"
				>
					{copy.heroQuestion}
				</p>
				<p
					class="text-base md:text-lg font-semibold"
					style="color: #C8102E;"
				>
					{copy.heroTagline}
				</p>

				<!-- Stat strip -->
				<div
					class="flex items-center gap-8 mt-10 pt-8 border-t border-[#E5E5E5]"
				>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							{copy.stats[0].value}
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							{copy.stats[0].label}
						</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							{copy.stats[1].value}
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							{copy.stats[1].label}
						</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							{copy.stats[2].value}
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							{copy.stats[2].label}
						</p>
					</div>
				</div>
			</div>

			<!-- Right: Illustration — float animation -->
			<div
				class="relative flex items-center justify-center lg:justify-end -mt-8 lg:-mt-16"
			>
				<!-- Faint dashed ring -->
				<div
					class="absolute inset-0 flex items-center justify-center pointer-events-none"
				>
					<div
						class="w-[85%] h-[85%] rounded-full opacity-[0.07]"
						style="border: 1.5px dashed #C8102E;"
					></div>
				</div>
				<!-- Illustration -->
				<div
					class="ws-hero-float w-full max-w-[700px] lg:max-w-none lg:w-[125%] xl:w-[135%] lg:translate-x-12"
				>
					<img
						src="/ilustrasi_tentang_kami.webp"
						alt={copy.heroAlt}
						class="w-full h-auto object-contain select-none"
						draggable="false"
					/>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Visi Misi — SKILL: Asymmetric 5/7 layout Bento 2.0 -->
<section id="visi-misi" class="py-24 lg:py-32 bg-white">
	<div class="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<div class="grid lg:grid-cols-12 gap-8 lg:gap-10">
			<!-- Visi Card -->
			<div
				class="lg:col-span-5 p-10 lg:p-14 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500"
				style="background: linear-gradient(145deg, #FBE9EC 0%, #FFF5F6 100%); box-shadow: 0 20px 40px -15px rgba(200,16,46,0.1);"
			>
				<!-- Liquid Glass Border -->
				<div
					class="absolute inset-0 rounded-[2.5rem] border border-white pointer-events-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]"
				></div>
				<!-- Background glow -->
				<div
					class="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-60 pointer-events-none"
				></div>

				<div class="relative z-10">
					<div
						class="w-16 h-16 rounded-[20px] flex items-center justify-center mb-8 shadow-sm transition-transform duration-500 group-hover:scale-110"
						style="background: #C8102E;"
					>
						<Eye size={28} class="text-white" />
					</div>
					<h3
						class="font-heading text-3xl font-bold text-zinc-950 tracking-tight mb-5"
					>
						{copy.visionTitle}
					</h3>
					<p
						class="text-lg leading-relaxed font-semibold text-zinc-700"
					>
						{visiText}
					</p>
				</div>
			</div>

			<!-- Misi Card -->
			<div
				class="lg:col-span-7 p-10 lg:p-14 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500"
				style="background: #FAFAFA; border: 1px solid rgba(229,229,229,0.8); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);"
			>
				<div
					class="absolute inset-0 rounded-[2.5rem] border border-white/50 pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]"
				></div>

				<div class="relative z-10">
					<div
						class="w-16 h-16 rounded-[20px] flex items-center justify-center mb-8 shadow-sm transition-transform duration-500 group-hover:scale-110"
						style="background: #C8102E;"
					>
						<Target size={28} class="text-white" />
					</div>
					<h3
						class="font-heading text-3xl font-bold text-zinc-950 tracking-tight mb-6"
					>
						{copy.missionTitle}
					</h3>
					<ul class="space-y-4">
						{#each misiList as mission}
							<li class="flex items-start gap-4">
								<div
									class="w-2 h-2 rounded-full shrink-0 mt-2.5"
									style="background: #C8102E; box-shadow: 0 0 8px rgba(200,16,46,0.4);"
								></div>
								<span
									class="text-base leading-relaxed font-medium text-zinc-600"
									>{mission}</span
								>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- 3 Contributions — SKILL: Zig-zag rows, Bento styling -->
<section
	id="kontribusi"
	class="py-24 lg:py-32 relative overflow-hidden bg-[#FAFAFA]"
>
	<Ornaments variant="dense" />

	<div class="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
		<div class="max-w-2xl mb-20 space-y-4">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-8 h-[1px] bg-[#C8102E]"></div>
				<span
					class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]"
				>
					{copy.contributionBadge}
				</span>
			</div>
			<h2
				class="font-heading text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.05] tracking-tight text-zinc-950"
			>
				{copy.contributionTitle}
			</h2>
		</div>

		<div class="space-y-8">
			{#each contributions as item, i}
				{@const ItemIcon = item.icon}
				<div
					class="group flex flex-col md:flex-row gap-0 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(200,16,46,0.15)] hover:-translate-y-1 relative"
					style="
						background: #FFFFFF; border: 1px solid rgba(229,229,229,0.8);
						opacity: {contribVisible ? 1 : 0};
						transform: translateY({contribVisible ? 0 : 40}px);
						transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) {i *
						0.15}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) {i *
						0.15}s, box-shadow 0.5s ease, transform 0.5s ease;
					"
				>
					<div
						class="absolute inset-0 border border-white pointer-events-none rounded-[2rem] z-20"
					></div>

					<div
						class="w-full md:w-1/3 p-8 lg:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden {i %
							2 ===
						1
							? 'md:order-2'
							: ''}"
						style="background: linear-gradient(135deg, #FFF8F9 0%, #FBE9EC 100%);"
					>
						<div
							class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl opacity-60 pointer-events-none"
						></div>
						<div
							class="absolute inset-y-0 {i % 2 === 1
								? 'left-0'
								: 'right-0'} w-[1px] bg-gradient-to-b from-transparent via-[#C8102E]/20 to-transparent"
						></div>

						<span
							class="relative z-10 font-heading text-5xl lg:text-[72px] font-extrabold text-[#C8102E] tracking-tighter tabular-nums leading-none mb-3"
							>{item.metric}</span
						>
						<span
							class="relative z-10 text-[13px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8102E]/80"
							>{item.metricLabel}</span
						>
					</div>
					<div
						class="w-full md:w-2/3 p-8 sm:p-10 lg:p-14 flex items-center {i %
							2 ===
						1
							? 'md:order-1'
							: ''} bg-white relative"
					>
						<div
							class="absolute inset-0 bg-gradient-to-br from-zinc-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]"
						></div>

						<div
							class="relative z-10 flex flex-col sm:flex-row items-start gap-6 lg:gap-8"
						>
							<div
								class="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-sm border border-zinc-100"
								style="background: #FBE9EC;"
							>
								<ItemIcon size={28} style="color: #C8102E;" />
							</div>
							<div class="flex-1 mt-2 sm:mt-0">
								<h3
									class="font-heading text-2xl lg:text-3xl font-bold text-zinc-950 tracking-tight mb-4 group-hover:text-[#C8102E] transition-colors duration-300"
								>
									{item.title}
								</h3>
								<p
									class="text-base lg:text-lg text-zinc-500 font-medium leading-relaxed max-w-[55ch]"
								>
									{item.desc}
								</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Timeline — SKILL: Left-aligned heading, polished UI -->
<section id="timeline" class="py-24 lg:py-32 bg-white">
	<div class="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<div class="grid lg:grid-cols-12 gap-16 lg:gap-20">
			<!-- Left: Heading sticky -->
			<div class="lg:col-span-4 lg:sticky lg:top-40 lg:self-start">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-8 h-[1px] bg-[#C8102E]"></div>
					<span
						class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]"
					>
						{copy.timelineBadge}
					</span>
				</div>
				<h2
					class="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.05] mb-5"
				>
					{copy.timelineTitle}
				</h2>
				<p class="text-lg font-medium leading-relaxed text-zinc-500">
					{copy.timelineDesc}
				</p>
			</div>

			<!-- Right: Timeline items -->
			<div class="lg:col-span-8">
				<div class="relative pb-10">
					<!-- Animated Line -->
					<div
						class="absolute left-7 top-4 bottom-0 w-[2px] rounded-full"
						style="background: linear-gradient(180deg, #C8102E 0%, #FBE9EC 80%, transparent 100%);"
					></div>

					<div class="space-y-12">
						{#each timeline as item, i}
							<div
								class="group relative flex items-start gap-8 pl-3"
								style="
									opacity: {timelineVisible ? 1 : 0};
									transform: translateX({timelineVisible ? 0 : -30}px);
									transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) {i *
									0.1}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) {i *
									0.1}s;
								"
							>
								<!-- Timeline Node -->
								<div
									class="relative z-10 w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-sm"
									style="background: {i ===
									timeline.length - 1
										? '#C8102E'
										: '#FFFFFF'}; border: 2px solid #C8102E;"
								>
									<span
										class="text-[11px] font-mono font-bold"
										style="color: {i === timeline.length - 1
											? 'white'
											: '#C8102E'};"
										>{item.year.slice(2)}</span
									>
								</div>

								<div
									class="pb-4 group-hover:translate-x-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
								>
									<span
										class="inline-block px-3 py-1 rounded-md text-xs font-mono font-bold tracking-[0.1em] mb-3"
										style="background: #FBE9EC; color: #C8102E;"
										>{item.year}</span
									>
									<h3
										class="font-heading text-2xl font-bold tracking-tight text-zinc-950 mb-2"
									>
										{item.title}
									</h3>
									<p
										class="text-base font-medium leading-relaxed text-zinc-500 max-w-[50ch]"
									>
										{item.desc}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Sertifikasi & HAKI -->
<section
	id="sertifikasi"
	class="py-24 lg:py-32 bg-[#FAFAFA] border-y border-[#E5E5E5] relative overflow-hidden"
>
	<!-- Ornamental Background -->
	<div
		class="absolute inset-0 z-0 opacity-30 mix-blend-multiply"
		style="background: radial-gradient(circle at top right, rgba(200,16,46,0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(200,16,46,0.05), transparent 40%);"
	></div>

	<div class="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
		<div
			class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
		>
			<div class="max-w-2xl">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-8 h-[1px] bg-[#C8102E]"></div>
					<span
						class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]"
						>{copy.certBadge}</span
					>
				</div>
				<h2
					class="font-heading text-4xl sm:text-5xl font-extrabold tracking-tighter text-zinc-950 leading-[1.05]"
				>
					{copy.certTitlePrefix} <span style="color: #C8102E;">{copy.certTitleAccent}</span>
				</h2>
			</div>
			<p
				class="text-lg font-medium leading-relaxed text-zinc-500 max-w-md"
			>
				{copy.certDesc}
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
			<!-- ISO 9001 -->
			<div
				class="group relative p-8 rounded-[2rem] bg-white border border-[#E5E5E5] hover:border-[#C8102E]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(200,16,46,0.1)]"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-white to-zinc-50/50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
				></div>

				<div class="relative z-10 flex flex-col h-full">
					<div
						class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-6 transition-transform duration-500 group-hover:scale-110 shadow-sm"
						style="background: #FBE9EC;"
					>
						<Award size={24} style="color: #C8102E;" />
					</div>
					<h3
						class="font-heading text-2xl font-bold text-zinc-950 tracking-tight mb-2"
					>
						{copy.certifications[0].title}
					</h3>
					<span
						class="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[#C8102E] mb-4"
						>{copy.certifications[0].subtitle}</span
					>
					<p
						class="text-sm font-medium leading-relaxed text-zinc-500 flex-1"
					>
						{copy.certifications[0].desc}
					</p>

					<div
						class="pt-6 mt-6 border-t border-[#E5E5E5] flex items-center gap-2"
					>
						<CheckCircle2 size={16} class="text-[#1B7F3A]" />
						<span class="text-xs font-bold text-zinc-900"
							>{copy.certifications[0].status}</span
						>
					</div>
				</div>
			</div>

			<!-- ISO 27001 -->
			<div
				class="group relative p-8 rounded-[2rem] bg-white border border-[#E5E5E5] hover:border-[#C8102E]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(200,16,46,0.1)]"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-white to-zinc-50/50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
				></div>

				<div class="relative z-10 flex flex-col h-full">
					<div
						class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-6 transition-transform duration-500 group-hover:scale-110 shadow-sm"
						style="background: #FBE9EC;"
					>
						<ShieldCheck size={24} style="color: #C8102E;" />
					</div>
					<h3
						class="font-heading text-2xl font-bold text-zinc-950 tracking-tight mb-2"
					>
						{copy.certifications[1].title}
					</h3>
					<span
						class="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[#C8102E] mb-4"
						>{copy.certifications[1].subtitle}</span
					>
					<p
						class="text-sm font-medium leading-relaxed text-zinc-500 flex-1"
					>
						{copy.certifications[1].desc}
					</p>

					<div
						class="pt-6 mt-6 border-t border-[#E5E5E5] flex items-center gap-2"
					>
						<CheckCircle2 size={16} class="text-[#1B7F3A]" />
						<span class="text-xs font-bold text-zinc-900"
							>{copy.certifications[1].status}</span
						>
					</div>
				</div>
			</div>

			<!-- ISO 30141 -->
			<div
				class="group relative p-8 rounded-[2rem] bg-white border border-[#E5E5E5] hover:border-[#C8102E]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(200,16,46,0.1)]"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-white to-zinc-50/50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
				></div>

				<div class="relative z-10 flex flex-col h-full">
					<div
						class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-6 transition-transform duration-500 group-hover:scale-110 shadow-sm"
						style="background: #FBE9EC;"
					>
						<Target size={24} style="color: #C8102E;" />
					</div>
					<h3
						class="font-heading text-2xl font-bold text-zinc-950 tracking-tight mb-2"
					>
						{copy.certifications[2].title}
					</h3>
					<span
						class="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[#C8102E] mb-4"
						>{copy.certifications[2].subtitle}</span
					>
					<p
						class="text-sm font-medium leading-relaxed text-zinc-500 flex-1"
					>
						{copy.certifications[2].desc}
					</p>

					<div
						class="pt-6 mt-6 border-t border-[#E5E5E5] flex items-center gap-2"
					>
						<CheckCircle2 size={16} class="text-[#1B7F3A]" />
						<span class="text-xs font-bold text-zinc-900"
							>{copy.certifications[2].status}</span
						>
					</div>
				</div>
			</div>

			<!-- HAKI -->
			<div
				class="group relative p-8 rounded-[2rem] bg-zinc-950 border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
				></div>
				<div
					class="absolute -top-10 -right-10 w-32 h-32 bg-[#C8102E]/20 blur-2xl rounded-full pointer-events-none"
				></div>

				<div class="relative z-10 flex flex-col h-full">
					<div
						class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-6 transition-transform duration-500 group-hover:scale-110 border border-white/10"
						style="background: rgba(255,255,255,0.05);"
					>
						<FileBadge size={24} class="text-white" />
					</div>
					<h3
						class="font-heading text-2xl font-bold text-white tracking-tight mb-2"
					>
						{copy.certifications[3].title}
					</h3>
					<span
						class="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4"
						>{copy.certifications[3].subtitle}</span
					>
					<p
						class="text-sm font-medium leading-relaxed text-zinc-400 flex-1"
					>
						{copy.certifications[3].desc}
					</p>

					<div
						class="pt-6 mt-6 border-t border-white/10 flex items-center gap-2"
					>
						<CheckCircle2 size={16} class="text-emerald-500" />
						<span class="text-xs font-bold text-white"
							>{copy.certifications[3].status}</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Mitra & Klien — SKILL: DESIGN_VARIANCE=8, asymmetric header, kategori filter, staggered grid -->
<section
	id="mitra"
	class="py-24 lg:py-32 bg-white border-y border-[#E5E5E5] relative overflow-hidden"
>
	<!-- Subtle dot grid -->
	<div
		class="absolute inset-0 z-0 opacity-[0.025]"
		style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 28px 28px;"
	></div>

	<div class="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
		<!-- Asymmetric header: left heading + right stat —— SKILL Rule 3 -->
		<div
			class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-16"
		>
			<div class="max-w-2xl">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-8 h-[1px] bg-[#C8102E]"></div>
					<span
						class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]"
						>{copy.clientsBadge}</span
					>
				</div>
				<h2
					class="font-heading text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.05] tracking-tight text-zinc-950"
				>
					{copy.clientsTitle} <br /><span class="text-zinc-400"
						>{copy.clientsTitleMuted}</span
					>
				</h2>
			</div>
			<!-- Right: live stat dari DB -->
			<div class="flex flex-col items-start lg:items-end gap-1 shrink-0">
				<span
					class="font-heading text-[72px] lg:text-[96px] font-extrabold leading-none tracking-tighter text-zinc-950 tabular-nums"
					>{clients.length}+</span
				>
				<span
					class="text-sm font-mono font-bold uppercase tracking-[0.2em] text-zinc-400"
					>{copy.clientsStat}</span
				>
			</div>
		</div>

		<!-- Filter Kategori — pill tabs -->
		<div class="flex flex-wrap gap-2 mb-12">
			{#each kategoriList as kat}
				<button
					onclick={() => (activeKategori = kat.id)}
					class="px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-[0.15em] border transition-all duration-300 active:scale-95"
					style="
						background: {activeKategori === kat.id ? '#C8102E' : 'transparent'};
						color: {activeKategori === kat.id ? '#fff' : '#5C5C5C'};
						border-color: {activeKategori === kat.id ? '#C8102E' : '#E5E5E5'};
					"
				>
					{kat.label}
				</button>
			{/each}
		</div>

		<!-- Logo Grid — SKILL: Masonry-style asymmetric grid, tidak 3-col equal (Rule Layout) -->
		<div
			class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
		>
			{#each filteredClients as client, i}
				<div
					class="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#C8102E]/40 hover:bg-[#FFF8F9] hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(200,16,46,0.10)] transition-all duration-300 cursor-default"
					style="
						opacity: {mitraVisible ? 1 : 0};
						transform: translateY({mitraVisible ? 0 : 24}px);
						transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1) {(i % 12) *
						0.04}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) {(i %
						12) *
						0.04}s, box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
					"
				>
					<!-- Liquid glass inner border — SKILL Section 4 -->
					<div
						class="absolute inset-0 rounded-2xl border border-white pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
					></div>

					<!-- Logo -->
					<div
						class="w-14 h-14 flex items-center justify-center shrink-0 relative z-10"
					>
						{#if client.logo}
							<img
								src={client.logo}
								alt={client.name}
								class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
								loading="lazy"
							/>
						{:else}
							<div
								class="w-full h-full rounded-xl flex items-center justify-center text-white text-sm font-bold font-mono"
								style="background: #C8102E;"
							>
								{client.name
									.split(" ")
									.map((w: string) => w[0])
									.join("")
									.slice(0, 2)
									.toUpperCase()}
							</div>
						{/if}
					</div>

					<!-- Nama -->
					<p
						class="relative z-10 text-[11px] font-medium text-zinc-500 group-hover:text-[#C8102E] text-center leading-tight transition-colors duration-300 line-clamp-2"
					>
						{client.name}
					</p>
				</div>
			{/each}
		</div>

		<!-- Empty state jika filter kosong -->
		{#if filteredClients.length === 0}
			<div class="py-24 flex flex-col items-center gap-4 text-center">
				<div
					class="w-16 h-16 rounded-2xl flex items-center justify-center"
					style="background: #FBE9EC;"
				>
					<Building2 size={28} style="color: #C8102E;" />
				</div>
				<p class="text-base font-medium text-zinc-400">
					{copy.emptyClients}
				</p>
			</div>
		{/if}
	</div>
</section>

<!-- Testimoni — SKILL: DESIGN_VARIANCE=8, asymmetric quote wall, motion CSS only -->
<section
	id="testimoni"
	class="relative overflow-hidden py-24 lg:py-32 bg-[#FAFAFA] border-b border-[#E5E5E5]"
>
	<div
		class="absolute inset-0 pointer-events-none opacity-[0.025]"
		style="background-image: linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px); background-size: 42px 42px;"
	></div>
	<div
		class="absolute -right-28 top-24 h-72 w-72 rounded-full border border-[#C8102E]/15 pointer-events-none"
	></div>
	<div
		class="absolute left-[7vw] bottom-16 h-24 w-24 rotate-45 rounded-[1.5rem] border border-[#C8102E]/10 pointer-events-none"
	></div>

	<div class="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<div class="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-end mb-16">
			<div>
				<div class="flex items-center gap-3 mb-6">
					<div class="w-8 h-[1px] bg-[#C8102E]"></div>
					<span
						class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]"
						>{copy.testimonialBadge}</span
					>
				</div>
				<h2
					class="font-heading text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tighter leading-[1.05] text-zinc-950"
				>
					{copy.testimonialTitle} <span class="text-zinc-400">{copy.testimonialTitleMuted}</span>
				</h2>
			</div>
			<p class="text-base lg:text-lg leading-relaxed text-zinc-600 max-w-[58ch] lg:justify-self-end">
				{copy.testimonialDesc}
			</p>
		</div>

		{#if featuredTestimonial}
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
				<article
					class="relative lg:col-span-5 lg:sticky lg:top-28 min-h-[430px] rounded-[2rem] bg-white border border-[#E5E5E5] p-7 sm:p-10 lg:p-12 overflow-hidden shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] transition-all duration-700"
					style="
						opacity: {testimoniVisible ? 1 : 0};
						transform: translateY({testimoniVisible ? 0 : 28}px);
					"
				>
					<div
						class="absolute inset-0 rounded-[2rem] border border-white pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
					></div>
					<div
						class="absolute -right-20 -top-20 h-56 w-56 rounded-full pointer-events-none"
						style="background: radial-gradient(circle, rgba(200,16,46,0.12) 0%, transparent 68%);"
					></div>
					<Quote size={44} class="mb-10 text-[#C8102E]/25" />
					<p class="relative text-xl sm:text-2xl lg:text-[28px] leading-snug font-semibold tracking-tight text-zinc-950 max-w-[24ch]">
						"{featuredTestimonial.quote}"
					</p>
					<div class="relative mt-12 flex items-center gap-4">
						{#if featuredTestimonial.photo}
							<img
								src={featuredTestimonial.photo}
								alt={featuredTestimonial.name}
								class="h-14 w-14 rounded-2xl object-cover"
								loading="lazy"
							/>
						{:else}
							<div
								class="h-14 w-14 rounded-2xl flex items-center justify-center text-sm font-bold text-white font-mono"
								style="background: #C8102E;"
							>
								{featuredTestimonial.initials}
							</div>
						{/if}
						<div class="min-w-0">
							<h3 class="font-heading text-base font-bold text-zinc-950 truncate">
								{featuredTestimonial.name}
							</h3>
							<p class="text-sm text-zinc-500 leading-tight">
								{featuredTestimonial.position}
							</p>
							<p class="mt-1 text-[11px] font-mono uppercase tracking-[0.16em] text-[#C8102E]">
								{featuredTestimonial.organization}
							</p>
						</div>
					</div>
				</article>

				<div class="lg:col-span-7 grid gap-4 sm:grid-cols-2 content-start">
					{#each visibleSupportingTestimonials as testimonial, i}
						<article
							class="group relative h-full rounded-[1.5rem] border border-[#E5E5E5] bg-white/80 p-5 sm:p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#C8102E]/35 hover:bg-white hover:shadow-[0_18px_36px_-24px_rgba(200,16,46,0.35)]"
							style="
								opacity: {testimoniVisible ? 1 : 0};
								transform: translateY({testimoniVisible ? 0 : 22}px);
								transition-delay: {0.12 + i * 0.08}s;
							"
						>
							<div class="flex h-full flex-col gap-4">
								{#if testimonial.photo}
									<img
										src={testimonial.photo}
										alt={testimonial.name}
										class="h-11 w-11 rounded-xl object-cover shrink-0"
										loading="lazy"
									/>
								{:else}
									<div
										class="h-11 w-11 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors duration-300"
										style="background: #FBE9EC; color: #C8102E;"
									>
										{testimonial.initials}
									</div>
								{/if}
								<div class="min-w-0 flex flex-1 flex-col">
									<p class="text-sm sm:text-base leading-relaxed text-zinc-700 flex-1">
										"{testimonial.quote}"
									</p>
									<div class="mt-4 border-t border-[#E5E5E5] pt-4">
										<h3 class="text-sm font-bold text-zinc-950 truncate">
											{testimonial.name}
										</h3>
										<p class="text-xs text-zinc-500 truncate">
											{testimonial.position}
										</p>
										<p class="mt-1 text-[10px] font-mono uppercase tracking-[0.16em] text-[#C8102E] truncate">
											{testimonial.organization}
										</p>
									</div>
								</div>
							</div>
						</article>
					{/each}

					{#if supportingTestimonials.length > 4}
						<button
							type="button"
							onclick={() => (showAllTestimonials = !showAllTestimonials)}
							class="mt-2 sm:col-span-2 inline-flex items-center justify-center rounded-[1.25rem] border border-[#E5E5E5] bg-white px-5 py-4 text-sm font-bold text-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8102E]/40 hover:text-[#C8102E] hover:shadow-[0_16px_32px_-24px_rgba(200,16,46,0.35)] active:scale-[0.98]"
						>
							{showAllTestimonials
								? copy.showLessTestimonials
								: copy.showMoreTestimonials(hiddenTestimonialsCount)}
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- Office — SKILL: High-end Contact Block -->
<section
	class="py-24 lg:py-32 relative overflow-hidden"
	style="background: linear-gradient(180deg, #FAFAFA 0%, #FBE9EC 100%);"
>
	<div
		class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"
	></div>

	<div class="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
		<div class="max-w-3xl flex flex-col items-start text-left">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-8 h-[1px] bg-[#C8102E]"></div>
				<span
					class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]"
				>
					{copy.officeBadge}
				</span>
			</div>
			<h2
				class="font-heading text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tighter text-zinc-950 leading-[1.05] mb-6"
			>
				{copy.officeTitle} <br /><span class="text-zinc-400"
					>{copy.officeTitleMuted}</span
				>
			</h2>
			<p
				class="text-xl font-medium leading-relaxed text-zinc-600 mb-10 max-w-[45ch]"
			>
				{copy.officeDesc}
			</p>

			<a
				href="https://goo.gl/maps/placeholder"
				class="group relative inline-flex items-center gap-4 px-8 py-5 rounded-[1.25rem] overflow-hidden transition-transform active:scale-95 bg-white border border-zinc-200 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(200,16,46,0.15)] hover:border-[#C8102E]/30"
				target="_blank"
				rel="noopener"
			>
				<div
					class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110"
					style="background: #FBE9EC;"
				>
					<MapPin size={22} style="color: #C8102E;" />
				</div>
				<div class="flex flex-col text-left">
					<span
						class="text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-zinc-400 mb-0.5"
						>{copy.hqLabel}</span
					>
					<span
						class="text-base font-bold text-zinc-900 group-hover:text-[#C8102E] transition-colors"
						>Kadirojo I, Kalasan, Sleman, DIY 55571</span
					>
				</div>
				<ArrowUpRight
					size={20}
					class="ml-4 text-zinc-300 group-hover:text-[#C8102E] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
				/>
			</a>
		</div>
	</div>
</section>

<style>
	/* SKILL MOTION_INTENSITY: 6 — Hero illustration gentle float */
	.ws-hero-float {
		animation: wsFloat 6s ease-in-out infinite;
		will-change: transform;
	}

	@keyframes wsFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-12px);
		}
	}

	@media (max-width: 1023px) {
		.ws-hero-float {
			transform: none !important;
		}
		@keyframes wsFloat {
			0%,
			100% {
				transform: translateY(0px);
			}
			50% {
				transform: translateY(-10px);
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ws-hero-float {
			animation: none !important;
		}
	}
</style>
