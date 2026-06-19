<script lang="ts">
  import { onMount } from "svelte";
  import {
    ArrowRight,
    Check,
    MessageCircle,
    Download,
    ChevronRight,
    Waves,
    Gauge,
    Radio,
    HardDrive,
    LayoutDashboard,
    Activity,
    ShieldCheck,
    Droplets,
    Factory,
    Sun,
  } from "@lucide/svelte";
	import { locale } from "$lib/i18n";
  import { openChat } from "$lib/stores/chat";
  import { mapTrackRecords } from "$lib/loaders/sub-solution";
  import productImage from "$lib/assets/product_awlr.webp";

  let { data } = $props();

  const ACCENT = "#C8102E";
  const ACCENT_SOFT = "#FF4D6D";
  const LIVE = "#1B7F3A";

  const ss = $derived(data.subSolutionDetail?.sub_solution ?? null);
  const mainContent = $derived(
    ss?.main_content?.trim() ||
      "<p>Pengukuran ketinggian muka air otomatis, 100% online, terkirim langsung ke STESY. Akurasi ±1mm, IP68, solar-powered — siap di pos hidrologi manapun di Indonesia.</p>",
  );

  let activeVariant = $state(0);
  let activeSpecComponent = $state(0);

  const countComponentSpecs = (component: any) =>
    (component.specs ?? []).reduce(
      (total: number, group: any) => total + (group.items?.length ?? 0),
      0,
    );

  const fallbackVariants = [
    {
      name: "BL-1100",
      subtitle: "Professional Grade",
      desc: "Varian utama untuk pos hidrologi bendungan dan sungai besar. Mendukung sensor presisi tinggi dan redundansi telemetri untuk critical infrastructure.",
      use: "Bendungan, sungai besar, DAS utama",
      image: productImage,
      brochure_pdf: null,
      components: [],
      specs: [
        { label: "Range Pengukuran", value: "0 – 30 m" },
        { label: "Akurasi", value: "±1 mm" },
        { label: "Resolusi", value: "0.1 mm" },
        { label: "Tipe Sensor", value: "Pressure transducer" },
        { label: "Proteksi", value: "IP68 (Submersible)" },
        { label: "Interval Data", value: "1 – 60 menit" },
        { label: "Komunikasi", value: "4G/LTE, GSM, Satellite" },
        { label: "Power Supply", value: "100W Solar + 100Ah Battery" },
      ],
    },
    {
      name: "BL-110",
      subtitle: "Compact Node",
      desc: "Varian kompak dan efisien untuk sumur pantau, saluran irigasi, dan titik monitoring hidrologi yang tersebar massal.",
      use: "Sumur pantau, irigasi, monitoring massal",
      image: null,
      brochure_pdf: null,
      components: [],
      specs: [
        { label: "Range Pengukuran", value: "0 – 10 m" },
        { label: "Akurasi", value: "±3 mm" },
        { label: "Resolusi", value: "1 mm" },
        { label: "Tipe Sensor", value: "Ultrasonic / Pressure" },
        { label: "Proteksi", value: "IP67" },
        { label: "Interval Data", value: "5 – 60 menit" },
        { label: "Komunikasi", value: "NB-IoT / GSM" },
        { label: "Power Supply", value: "20W Solar + 12Ah Battery" },
      ],
    },
  ];

  // API data wins: use products from DB, fallback to static when DB has no products
  const variants = $derived(
    data.subSolutionDetail?.products &&
      data.subSolutionDetail.products.length > 0
      ? data.subSolutionDetail.products.map((p: any) => ({
          name: p.name,
          subtitle: p.use_case ?? "",
          desc: p.description ?? "",
          use: p.use_case ?? "",
          image: p.main_image ?? p.thumbnail ?? null,
          brochure_pdf: p.brochure_pdf ?? null,
          specs: Array.isArray(p.highlight_points)
            ? p.highlight_points.map((pt: string, i: number) => ({
                label: `Fitur ${i + 1}`,
                value: pt,
              }))
            : [],
          components: Array.isArray(p.components) ? p.components : [],
        }))
      : fallbackVariants,
  );
  const activeProduct = $derived(variants[activeVariant] ?? variants[0]);
  const activeSpecs = $derived(activeProduct?.specs ?? []);
  const activeComponents = $derived(activeProduct?.components ?? []);
  const showcaseComponents = $derived(activeComponents.slice(0, 2));
  const selectedSpecComponent = $derived(
    activeComponents[activeSpecComponent] ?? activeComponents[0] ?? null,
  );
  const fallbackSpecGroups = $derived(
    activeSpecs.length > 0
      ? [
          {
            category: "Ringkasan Produk",
            items: activeSpecs.map((spec: any) => ({
              name: spec.label,
              value: spec.value,
            })),
          },
        ]
      : [],
  );
  const displaySpecGroups = $derived(
    selectedSpecComponent?.specs?.length > 0
      ? selectedSpecComponent.specs
      : fallbackSpecGroups,
  );
  const displaySpecs = $derived(
    displaySpecGroups.flatMap((group: any) =>
      (group.items ?? []).map((item: any) => ({
        label: item.name,
        value: item.value,
        meta: group.category,
      })),
    ),
  );
  const heroStats = $derived(displaySpecs.slice(0, 4));

  $effect(() => {
    activeVariant;
    activeSpecComponent = 0;
  });

  const fallbackProjects = [
    {
      name: "Bendungan Cipanas",
      client: "BWS Ciliwung-Cisadane",
      year: "2022",
    },
    { name: "Bendungan Sepaku IKN", client: "BWS Kalimantan IV", year: "2024" },
    { name: "Bendungan Keureuto Aceh", client: "BWS Sumatera I", year: "2023" },
    {
      name: "Sungai Bengawan Solo",
      client: "BBWS Bengawan Solo",
      year: "2022",
    },
    { name: "DAS Bogowonto", client: "BBWS Serayu Opak", year: "2023" },
  ];

  // API data wins: use track records from DB, fallback to static
  const projects = $derived(
    mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects),
  );

  const copy = $derived(
    $locale === "EN"
      ? {
          home: "Home", solutions: "Solutions", parent: "Water Security",
          eyebrow: "Water Security · Hydrology",
          title1: "Because every centimetre", title2: "counts.",
          consult: "Consult AWLR", other: "Other Solutions", live: "LIVE",
          fig: "FIG.03 — WATER LEVEL", lvl: "WATER LEVEL", fill: "RANGE", status: "ONLINE",
          chainBadge: "Signal Chain", chainTitle: "From the water surface to your dashboard",
          chainDesc:
            "A pressure transducer reads the stage to the millimetre, logged on-site and streamed over 4G / satellite into STESY — no day of data ever lost.",
          capBadge: "Capabilities", capTitle: "Hydrology-grade, built for the tropics",
          appBadge: "Where it works", appTitle: "For every gauge that must never go dark",
          appDesc: "Dams, rivers, irrigation channels, monitoring wells, and SNI hydrology posts.",
          trackBadge: "Track Record", trackTitle: "Already deployed at",
          ctaBadge: "Next Step", ctaTitle: "Gauge your water with AWLR",
          ctaDesc: "Our engineers will design the right hydrology post and integrate it into your STESY dashboard.",
          ctaPrimary: "Consult AWLR", ctaSecondary: "Explore Other Products",
        }
      : {
          home: "Beranda", solutions: "Solusi", parent: "Water Security",
          eyebrow: "Water Security · Hidrologi",
          title1: "Karena setiap sentimeter", title2: "berarti.",
          consult: "Konsultasi AWLR", other: "Solusi Lain", live: "LIVE",
          fig: "FIG.03 — MUKA AIR", lvl: "MUKA AIR", fill: "RANGE", status: "ONLINE",
          chainBadge: "Rantai Sinyal", chainTitle: "Dari permukaan air hingga dashboard Anda",
          chainDesc:
            "Pressure transducer membaca tinggi muka air hingga milimeter, direkam di lokasi dan dialirkan lewat 4G / satelit ke STESY — tak ada satu hari data pun hilang.",
          capBadge: "Kemampuan", capTitle: "Sekelas hidrologi, dibangun untuk tropis",
          appBadge: "Penerapan", appTitle: "Untuk setiap pos yang tak boleh padam",
          appDesc: "Bendungan, sungai, saluran irigasi, sumur pantau, dan pos hidrologi SNI.",
          trackBadge: "Track Record", trackTitle: "Sudah Terpasang Di",
          ctaBadge: "Langkah Selanjutnya", ctaTitle: "Pantau muka air Anda dengan AWLR",
          ctaDesc: "Tim engineer kami akan merancang pos hidrologi yang tepat dan mengintegrasikannya ke dashboard STESY.",
          ctaPrimary: "Konsultasi AWLR", ctaSecondary: "Jelajahi Produk Lain",
        },
  );

  // ── Live water level (stilling well) ──
  let mounted = $state(false);
  let level = $state(0); // percent of range
  const depthM = $derived(Math.round((level / 100) * 12 * 100) / 100); // 0–12 m

  onMount(() => {
    mounted = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = () => Math.round((44 + Math.random() * 34) * 10) / 10; // 44–78 %
    level = r();
    if (reduce) return;
    const id = setInterval(() => {
      level = r();
    }, 2500);
    return () => clearInterval(id);
  });

  const chain = [
    { icon: Waves, k: "01", t: $locale === "EN" ? "Level Sensor" : "Sensor Level", d: $locale === "EN" ? "Pressure transducer" : "Pressure transducer" },
    { icon: HardDrive, k: "02", t: "Datalogger", d: $locale === "EN" ? "On-site logging" : "Perekaman lokasi" },
    { icon: Radio, k: "03", t: $locale === "EN" ? "Transmission" : "Transmisi", d: "4G/LTE · Satellite" },
    { icon: LayoutDashboard, k: "04", t: "STESY", d: "Dashboard" },
  ];

  const capabilities = $derived([
    { icon: Gauge, value: "±1", unit: "mm", label: $locale === "EN" ? "Lab-grade accuracy" : "Akurasi lab-grade" },
    { icon: Waves, value: "0–30", unit: "m", label: $locale === "EN" ? "Measurement range" : "Range pengukuran" },
    { icon: ShieldCheck, value: "IP68", unit: "", label: $locale === "EN" ? "Submersible, flood-proof" : "Terendam, tahan banjir" },
    { icon: Sun, value: "Solar", unit: "", label: $locale === "EN" ? "Off-grid powered" : "Mandiri tanpa PLN" },
  ]);

  const applications = $derived([
    { icon: Waves, label: $locale === "EN" ? "Dams" : "Bendungan" },
    { icon: Activity, label: $locale === "EN" ? "Rivers" : "Sungai" },
    { icon: Droplets, label: $locale === "EN" ? "Irrigation" : "Irigasi" },
    { icon: Gauge, label: $locale === "EN" ? "Monitoring Wells" : "Sumur Pantau" },
    { icon: Factory, label: $locale === "EN" ? "Hydrology Posts" : "Pos Hidrologi" },
  ]);
</script>

<svelte:head>
  <title>AWLR — Automatic Water Level Recorder — Beacon Engineering</title>
  <meta
    name="description"
    content="AWLR Beacon Engineering: pengukuran ketinggian muka air otomatis, akurasi ±1mm, 100% online, terkirim langsung ke STESY."
  />
</svelte:head>

<!-- Breadcrumb -->
<div class="border-b" style="background: #100A0B; border-color: rgba(200,16,46,0.18);">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <nav class="flex items-center gap-1.5 text-xs font-mono" style="color: #8a767a;">
      <a href="/" class="hover:text-[#FF4D6D] transition-colors">{copy.home}</a>
      <ChevronRight size={11} />
      <a href="/solusi" class="hover:text-[#FF4D6D] transition-colors">{copy.solutions}</a>
      <ChevronRight size={11} />
      <a href="/solusi/water-security" class="hover:text-[#FF4D6D] transition-colors">{copy.parent}</a>
      <ChevronRight size={11} />
      <span class="font-semibold" style="color: {ACCENT_SOFT};">AWLR</span>
    </nav>
  </div>
</div>

<!-- HERO -->
<section class="relative overflow-hidden" style="background: #0C0809;">
  <div class="awlr-grid absolute inset-0 pointer-events-none"></div>
  <div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
  <div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
    <div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8" style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;">
          <ShieldCheck size={13} />{copy.eyebrow}
        </div>
        <h1 class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[64px]" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;">
          {copy.title1}<br /><span class="awlr-gradient">{copy.title2}</span>
        </h1>
        <div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
          <span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">AWLR</span>
          <span class="text-sm text-zinc-500 font-mono">Automatic Water Level Recorder</span>
        </div>
        <div class="awlr-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;">
          {@html mainContent}
        </div>
        <div class="mt-10 flex flex-wrap gap-3" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .5s;">
          <button type="button" onclick={openChat} class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
            <MessageCircle size={16} />{copy.consult}
          </button>
          <a href="/solusi/water-security" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-zinc-200 transition-colors hover:text-white" style="border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03);">
            {copy.other}<ArrowRight size={15} />
          </a>
        </div>
      </div>

      <!-- Live water level (stilling well) -->
      <div class="relative flex justify-center lg:justify-end" style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;">
        <div class="awlr-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
          <div class="flex items-center justify-between mb-6">
            <span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
            <span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
              </span>{copy.live}
            </span>
          </div>

          <div class="flex items-stretch gap-5">
            <!-- stilling well -->
            <div class="awlr-well">
              <div class="awlr-water" style="height: {level}%;"><div class="awlr-surface"></div></div>
              {#each [20, 40, 60, 80] as g}
                <div class="awlr-tick" style="bottom: {g}%;"></div>
              {/each}
            </div>
            <!-- readouts -->
            <div class="flex-1 flex flex-col justify-center gap-3">
              <div class="awlr-readout">
                <span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.lvl}</span>
                <span class="font-mono text-xl font-bold tabular-nums" style="color: {ACCENT_SOFT};">{depthM.toFixed(2)} <span class="text-xs text-zinc-500">m</span></span>
              </div>
              <div class="awlr-readout">
                <span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.fill}</span>
                <span class="font-mono text-xl font-bold tabular-nums text-white">{level.toFixed(1)}<span class="text-xs text-zinc-500"> %</span></span>
              </div>
              <div class="awlr-readout">
                <span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">STATUS</span>
                <span class="inline-flex items-center gap-1.5 font-mono text-sm font-bold" style="color: {LIVE};">
                  <span class="w-1.5 h-1.5 rounded-full" style="background: {LIVE};"></span>{copy.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SIGNAL CHAIN -->
<section class="relative py-20 lg:py-28 bg-white overflow-hidden">
  <div class="absolute inset-0 pointer-events-none opacity-[0.5]" style="background: radial-gradient(60% 60% at 50% 0%, rgba(200,16,46,0.05), transparent 70%);"></div>
  <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mb-14">
      <span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.chainBadge}</span>
      <h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 leading-[1.12]" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.chainTitle}</h2>
      <p class="text-base leading-relaxed mt-4" style="color: #5C5C5C;">{copy.chainDesc}</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3">
      {#each chain as step, i}
        {@const Icon = step.icon}
        <div class="group relative rounded-2xl p-6 bg-white transition-all duration-300 hover:-translate-y-1" style="border: 1px solid #E5E5E5;">
          {#if i < chain.length - 1}
            <div class="hidden lg:flex absolute top-0 bottom-0 right-[-6px] translate-x-1/2 z-20 items-center">
              <div class="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-white text-[#C8102E]" style="border: 1px solid #E5E5E5; box-shadow: 0 2px 6px rgba(0,0,0,0.05);"><ArrowRight size={13} strokeWidth={2.5} /></div>
            </div>
          {/if}
          <div class="flex items-center justify-between mb-5">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style="background: rgba(200,16,46,0.09);">
              <Icon size={20} style="color: {ACCENT};" />
            </div>
            <span class="font-mono text-[11px] font-bold tracking-widest text-[#CFCFCF]">{step.k}</span>
          </div>
          <h3 class="font-heading text-lg font-bold" style="color: #1A1A1A;">{step.t}</h3>
          <p class="text-xs font-mono mt-1" style="color: #9A9A9A;">{step.d}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CAPABILITIES -->
<section class="relative py-20 lg:py-24 overflow-hidden" style="background: #130A0C;">
  <div class="awlr-grid absolute inset-0 pointer-events-none opacity-60"></div>
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mb-12">
      <span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT_SOFT};">{copy.capBadge}</span>
      <h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 text-white leading-[1.12]" style="letter-spacing: -0.02em;">{copy.capTitle}</h2>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {#each capabilities as cap}
        {@const Icon = cap.icon}
        <div class="rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(200,16,46,0.18);">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style="background: rgba(200,16,46,0.13);">
            <Icon size={20} style="color: {ACCENT_SOFT};" />
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="font-heading text-3xl font-extrabold text-white tabular-nums tracking-tight">{cap.value}</span>
            {#if cap.unit}<span class="text-sm font-medium text-zinc-500">{cap.unit}</span>{/if}
          </div>
          <p class="text-xs mt-2 leading-snug" style="color: #B49AA0;">{cap.label}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Interactive Variant & Specs Explorer -->
<section class="relative overflow-hidden bg-[#080B10] py-20 lg:py-28">
  <div
    class="absolute inset-0 opacity-[0.07]"
    style="background-image: radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px); background-size: 28px 28px;"
  ></div>
  <div class="absolute inset-x-0 top-0 h-px bg-white/10"></div>
  <div class="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    <div
      class="variant-dossier overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#10141B] p-5 shadow-[0_34px_90px_-46px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8 lg:p-12"
    >
      <div class="relative z-10 flex flex-col gap-8">
        <div
          class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500"
          >
            <span>Beacon Engineering</span>
            <span class="h-1 w-1 rounded-full bg-zinc-700"></span>
            <span>AWLR Variant System</span>
          </div>
          <div
            class="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <span class="relative flex h-3 w-3">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-35"
              ></span>
              <span
                class="relative inline-flex h-3 w-3 rounded-full bg-emerald-400"
              ></span>
            </span>
            Field Ready
          </div>
        </div>

        <div
          class="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end"
        >
          <div>
            <h2
              class="font-heading text-4xl font-extrabold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Varian AWLR untuk tiap karakter pos
            </h2>
            <p
              class="mt-5 max-w-[52ch] text-base font-medium leading-relaxed text-zinc-400"
            >
              Pilih konfigurasi berdasarkan kedalaman muka air, karakter sungai,
              kebutuhan interval data, dan kondisi akses lapangan.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            {#each variants as v, i}
              <button
                type="button"
                onclick={() => (activeVariant = i)}
                class="group relative overflow-hidden rounded-[1.35rem] border px-5 py-4 text-left transition-all duration-300 active:scale-[0.98] {activeVariant ===
                i
                  ? 'border-[#C8102E]/70 bg-[#C8102E] text-white shadow-[0_22px_42px_-26px_rgba(200,16,46,0.8)]'
                  : 'border-white/10 bg-white/[0.035] text-zinc-500 hover:border-white/20 hover:bg-white/[0.065] hover:text-white'}"
              >
                <div class="mb-4 flex items-center justify-between">
                  <span
                    class="font-mono text-[11px] font-bold uppercase tracking-[0.24em]"
                    >{String(i + 1).padStart(2, "0")}</span
                  >
                  <span
                    class="h-2 w-2 rounded-full {activeVariant === i
                      ? 'bg-white'
                      : 'bg-zinc-700 group-hover:bg-[#C8102E]'}"
                  ></span>
                </div>
                <span
                  class="block font-heading text-2xl font-extrabold tracking-tight"
                  >{v.name}</span
                >
                <span
                  class="mt-1 block text-xs font-bold uppercase tracking-[0.18em] opacity-70"
                  >{v.subtitle || "AWLR Variant"}</span
                >
              </button>
            {/each}
          </div>
        </div>

        {#key activeVariant}
          <div class="variant-showcase grid gap-5">
            <div
              class="grid gap-5 lg:grid-cols-[minmax(280px,0.42fr)_minmax(0,1fr)]"
            >
              <aside
                class="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[#080B10]/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] lg:p-8"
              >
                <div>
                  <div
                    class="mb-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500"
                  >
                    <span>Beacon Engineering</span>
                    <span class="h-1 w-1 rounded-full bg-zinc-700"></span>
                    <span>AWLR</span>
                  </div>
                  <h3
                    class="font-heading text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl"
                  >
                    BE WLR
                  </h3>
                  <p
                    class="mt-4 text-base font-medium leading-relaxed text-zinc-400"
                  >
                    {activeProduct.name}
                  </p>
                </div>

                <div
                  class="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <div class="mb-4 flex items-center justify-between gap-4">
                    <span
                      class="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500"
                      >Pilih Logger / Sensor</span
                    >
                    <span class="font-mono text-[11px] font-bold text-zinc-600"
                      >{displaySpecs.length} item</span
                    >
                  </div>
                  {#if activeComponents.length > 0}
                    <div class="grid gap-2">
                      {#each activeComponents as component, ci}
                        <button
                          type="button"
                          onclick={() => (activeSpecComponent = ci)}
                          class="group rounded-2xl border px-4 py-3 text-left transition-all duration-300 active:scale-[0.98] {activeSpecComponent ===
                          ci
                            ? 'border-[#C8102E]/70 bg-[#C8102E] text-white'
                            : 'border-white/10 bg-[#080B10]/45 text-zinc-500 hover:border-white/20 hover:bg-white/[0.055] hover:text-white'}"
                        >
                          <span class="flex items-start justify-between gap-4">
                            <span>
                              <span
                                class="block font-heading text-base font-extrabold tracking-tight"
                                >{component.name}</span
                              >
                              <span
                                class="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] opacity-70"
                                >{component.type || "Komponen"}</span
                              >
                            </span>
                            <span
                              class="font-mono text-[11px] font-bold opacity-70"
                              >{countComponentSpecs(component)}</span
                            >
                          </span>
                        </button>
                      {/each}
                    </div>
                  {:else}
                    <div
                      class="rounded-2xl border border-white/10 bg-[#080B10]/45 px-4 py-3 text-sm font-semibold text-zinc-500"
                    >
                      Menampilkan ringkasan spesifikasi produk.
                    </div>
                  {/if}
                </div>

                <div
                  class="rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-5 py-4"
                >
                  <div
                    class="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500"
                  >
                    Cocok Untuk
                  </div>
                  <div class="text-sm font-extrabold text-white">
                    {activeProduct.use}
                  </div>
                </div>

                {#if activeProduct.brochure_pdf}
                  <a
                    href={activeProduct.brochure_pdf}
                    target="_blank"
                    rel="noopener"
                    class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3.5 text-sm font-extrabold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Download size={16} />
                    {$locale === "EN" ? "Download Brochure" : "Download Brosur"}
                  </a>
                {/if}
              </aside>

              <div
                class="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#151922] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6 lg:p-8"
              >
                <div
                  class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_4%,rgba(200,16,46,0.20),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_42%)]"
                ></div>
                <div
                  class="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.06),transparent)] variant-sheen"
                ></div>

                <div class="relative z-10 flex min-h-[500px] flex-col gap-5">
                  <div
                    class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <div
                        class="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500"
                      >
                        Product Bay
                      </div>
                      <div
                        class="mt-2 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
                      >
                        {activeProduct.name}
                      </div>
                      <p
                        class="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-zinc-400"
                      >
                        {activeProduct.desc}
                      </p>
                    </div>
                  </div>

                  <div class="grid flex-1 gap-4 md:grid-cols-2">
                    {#if showcaseComponents.length > 0}
                      {#each showcaseComponents as comp, ci}
                        <div
                          class="flex min-h-[320px] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-[#080B10]/55 p-5 transition-transform duration-500 hover:-translate-y-1"
                        >
                          <div
                            class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500"
                          >
                            <span
                              class="grid h-9 w-9 place-items-center rounded-full border border-[#C8102E] text-sm text-white"
                              >{ci + 1}</span
                            >
                            <span>{comp.type || "Komponen"} · {comp.name}</span>
                          </div>
                          {#if comp.image_1 || comp.image_2}
                            <img
                              src={comp.image_1 || comp.image_2}
                              alt={comp.name}
                              class="mx-auto max-h-[280px] w-full object-contain drop-shadow-[0_30px_28px_rgba(0,0,0,0.42)] transition-transform duration-700 hover:scale-[1.04]"
                            />
                          {:else}
                            <div
                              class="grid flex-1 place-items-center text-zinc-600"
                            >
                              <Waves size={46} />
                            </div>
                          {/if}
                        </div>
                      {/each}
                    {:else if activeProduct.image}
                      <div
                        class="md:col-span-2 grid min-h-[400px] place-items-center rounded-[1.5rem] border border-white/10 bg-[#080B10]/55 p-8"
                      >
                        <img
                          src={activeProduct.image}
                          alt="Varian {activeProduct.name}"
                          class="max-h-[390px] w-full object-contain drop-shadow-[0_38px_34px_rgba(0,0,0,0.48)] transition-transform duration-700 hover:scale-[1.035]"
                        />
                      </div>
                    {:else}
                      <div
                        class="md:col-span-2 grid min-h-[400px] place-items-center rounded-[1.5rem] border border-white/10 bg-[#080B10]/55 p-8 text-center"
                      >
                        <div>
                          <Waves size={48} class="mx-auto mb-3 text-zinc-700" />
                          <span
                            class="text-xs font-bold uppercase tracking-[0.28em] text-zinc-600"
                            >{$locale === "EN" ? "Image Coming Soon" : "Gambar Menyusul"}</span
                          >
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>

            <div
              class="rounded-[2rem] border border-white/10 bg-[#080B10]/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] sm:p-6 lg:p-8"
            >
              <div
                class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
              >
                <div>
                  <div
                    class="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500"
                  >
                    Spesifikasi Teknis
                  </div>
                  <h4
                    class="mt-1 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
                  >
                    {selectedSpecComponent?.name ?? activeProduct.name}
                  </h4>
                </div>
                <div class="flex flex-wrap gap-3">
                  <span
                    class="w-fit rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                  >
                    {displaySpecs.length} item
                  </span>
                  <span
                    class="w-fit rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                  >
                    {displaySpecGroups.length} kategori
                  </span>
                </div>
              </div>

              {#if displaySpecGroups.length > 0}
                <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {#each displaySpecGroups as group}
                    <div
                      class="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-5"
                    >
                      <div
                        class="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4D6D]"
                      >
                        {group.category}
                      </div>
                      <div class="divide-y divide-white/10">
                        {#each group.items ?? [] as item}
                          <div
                            class="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-4"
                          >
                            <span
                              class="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500"
                              >{item.name}</span
                            >
                            <span
                              class="font-mono text-sm font-bold leading-snug text-zinc-100 sm:text-right"
                              >{item.value}</span
                            >
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div
                  class="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm font-semibold text-zinc-500"
                >
                  Spesifikasi belum tersedia di CMS.
                </div>
              {/if}
            </div>

            <div>
              <div
                class="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-zinc-500"
              >
                Highlight Spek
              </div>
              <div class="grid gap-3 lg:grid-cols-[1.25fr_0.8fr_1fr_0.95fr]">
                {#each heroStats as spec}
                  <div
                    class="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                  >
                    <div
                      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#080B10]/70 text-[#FF4D6D]"
                    >
                      <Check size={18} />
                    </div>
                    <div class="font-heading text-lg font-extrabold text-white">
                      {spec.value}
                    </div>
                    <div
                      class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500"
                    >
                      {spec.label}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/key}
      </div>
    </div>
  </div>
</section>

<!-- APPLICATIONS -->
<section class="relative py-20 lg:py-28 bg-[#FAFAFA] overflow-hidden">
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mb-14">
      <span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.appBadge}</span>
      <h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 leading-[1.12]" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.appTitle}</h2>
      <p class="text-base leading-relaxed mt-4" style="color: #5C5C5C;">{copy.appDesc}</p>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {#each applications as app}
        {@const Icon = app.icon}
        <div class="group flex flex-col items-center justify-center gap-3 rounded-2xl py-7 px-3 bg-white text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-22px_rgba(200,16,46,0.5)]" style="border: 1px solid #E5E5E5;">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style="background: rgba(200,16,46,0.07);">
            <Icon size={22} style="color: {ACCENT};" />
          </div>
          <span class="text-xs font-semibold leading-tight" style="color: #3A3A3A;">{app.label}</span>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- TRACK RECORD -->
<section class="relative py-16 lg:py-24 bg-white overflow-hidden">
  <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mb-12">
      <span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.trackBadge}</span>
      <h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.trackTitle}</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each projects as proj}
        <div class="p-5 rounded-2xl bg-[#FAFAFA] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-22px_rgba(200,16,46,0.45)]" style="border: 1px solid #E5E5E5;">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md text-white tabular-nums" style="background: {ACCENT};">{proj.year}</span>
            <div class="w-1.5 h-1.5 rounded-full animate-pulse-dot" style="background: {LIVE};"></div>
          </div>
          <h3 class="font-heading text-sm font-bold" style="color: #1A1A1A;">{proj.name}</h3>
          <p class="text-xs mt-1" style="color: #5C5C5C;">{proj.client}</p>
          {#if proj.location}<p class="text-[11px] mt-1 font-mono" style="color: #8A8A8A;">{proj.location}</p>{/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="relative py-20 bg-white">
  <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    <div class="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 group" style="background: #1A0A0D; box-shadow: 0 40px 80px -24px rgba(26,10,13,0.55);">
      <div class="awlr-grid absolute inset-0 pointer-events-none opacity-50"></div>
      <div class="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style="background: rgba(200,16,46,0.18);"></div>
      <div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-6" style="background: rgba(200,16,46,0.16); color: #FF8095; border: 1px solid rgba(200,16,46,0.32);">
          <span class="w-1.5 h-1.5 rounded-full" style="background: {ACCENT_SOFT}; box-shadow: 0 0 10px {ACCENT_SOFT};"></span>{copy.ctaBadge}
        </span>
        <h2 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tighter mb-4">{copy.ctaTitle}</h2>
        <p class="text-lg text-zinc-400 font-medium">{copy.ctaDesc}</p>
      </div>
      <div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
        <button type="button" onclick={openChat} class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
          <MessageCircle size={18} />{copy.ctaPrimary}
        </button>
        <a href="/solusi/water-security" class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/5" style="border: 1px solid rgba(255,255,255,0.15);">
          <ArrowRight size={18} />{copy.ctaSecondary}
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  .awlr-gradient { background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .awlr-lead :global(p) { margin: 0; }
  .awlr-grid {
    background-image: linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px);
    background-size: 38px 38px;
    mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
    -webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
  }
  .awlr-instrument {
    background: linear-gradient(180deg, rgba(200,16,46,0.05), rgba(12,8,9,0.6));
    border: 1px solid rgba(200,16,46,0.22);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -30px rgba(0,0,0,0.8);
    backdrop-filter: blur(6px);
  }
  .awlr-well {
    position: relative;
    width: 116px;
    min-height: 210px;
    border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(200,16,46,0.22);
    overflow: hidden;
    box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
  }
  .awlr-water {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    background: linear-gradient(180deg, #FF4D6D 0%, #C8102E 55%, #8c0c20 100%);
    transition: height 2.2s cubic-bezier(0.25,0.8,0.3,1);
  }
  .awlr-surface {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: rgba(255,200,210,0.85);
    box-shadow: 0 0 12px rgba(255,77,109,0.9);
  }
  .awlr-tick { position: absolute; left: 0; width: 7px; height: 1px; background: rgba(255,255,255,0.18); }
  .awlr-readout { display: flex; flex-direction: column; gap: 2px; border-radius: 12px; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.16); }
  @media (prefers-reduced-motion: reduce) { .awlr-water { transition: none; } }

  .variant-showcase {
    animation: variantRise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .variant-sheen {
    animation: variantSheen 6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    transform: translateX(-140%);
  }

  @keyframes variantRise {
    from {
      opacity: 0;
      transform: translateY(22px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes variantSheen {
    0%,
    38% {
      transform: translateX(-140%);
    }
    72%,
    100% {
      transform: translateX(140%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .variant-showcase,
    .variant-sheen {
      animation: none;
      transform: none;
    }
  }
</style>
