<script lang="ts">
  import {
    ArrowRight,
    Check,
    MessageCircle,
    Download,
    ChevronRight,
    Waves,
  } from "@lucide/svelte";
  import Ornaments from "$lib/components/Ornaments.svelte";
  import { mapTrackRecords } from "$lib/loaders/sub-solution";
  import productImage from "$lib/assets/product_awlr.webp";

  let { data } = $props();

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

  const useCases = [
    "Sistem irigasi yang harus presisi",
    "Bendungan yang tidak boleh kehilangan data sehari pun",
    "Sungai yang melayani jutaan jiwa",
    "Sumur pantau yang tersebar dan sulit diakses",
    "Pos hidrologi BBWS/BWS standar SNI",
  ];

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

  const features = [
    {
      title: "Akurasi Lab-Grade",
      desc: "Sensor pressure transducer dengan akurasi ±1mm, melebihi standar SNI untuk pos hidrologi.",
    },
    {
      title: "Real-time 24/7",
      desc: "Data terkirim setiap interval yang dikonfigurasi langsung ke dashboard STESY.",
    },
    {
      title: "Tahan Iklim Tropis",
      desc: "IP68 waterproof, teruji di banjir, sungai deras, dan suhu ekstrem Indonesia.",
    },
    {
      title: "Solar Powered",
      desc: "Panel surya + baterai backup — beroperasi tanpa listrik PLN di lokasi remote.",
    },
    {
      title: "Multi-Konektivitas",
      desc: "4G/LTE, GSM, dan opsi satelit untuk area tanpa sinyal seluler.",
    },
    {
      title: "Alert Otomatis",
      desc: "Alarm threshold otomatis via SMS dan notifikasi STESY saat level kritis.",
    },
  ];
</script>

<svelte:head>
  <title>AWLR — Automatic Water Level Recorder — Beacon Engineering</title>
  <meta
    name="description"
    content="AWLR Beacon Engineering: pengukuran ketinggian muka air otomatis, akurasi ±1mm, 100% online, terkirim langsung ke STESY."
  />
</svelte:head>

<!-- Breadcrumb -->
<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <nav class="flex items-center gap-1.5 text-xs" style="color: #9A9A9A;">
      <a href="/" class="hover:text-[#C8102E] transition-colors">Beranda</a>
      <ChevronRight size={11} />
      <a href="/solusi" class="hover:text-[#C8102E] transition-colors">Solusi</a
      >
      <ChevronRight size={11} />
      <a
        href="/solusi/water-security"
        class="hover:text-[#C8102E] transition-colors">Water Security</a
      >
      <ChevronRight size={11} />
      <span style="color: #C8102E;" class="font-medium">AWLR</span>
    </nav>
  </div>
</div>

<!-- Hero -->
<section
  class="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden"
>
  <!-- Subtle Grid Pattern -->
  <div
    class="absolute inset-0 z-0 opacity-[0.03]"
    style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"
  ></div>
  <div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
    <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      <div class="space-y-8">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
          style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);"
        >
          <span class="w-1.5 h-1.5 rounded-full" style="background: #C8102E;"
          ></span>
          Water Security
          <span class="mx-1" style="color: #C8102E; opacity: 0.5;">/</span>
          Produk Unggulan
        </div>

        <h1
          class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter text-zinc-950"
        >
          Karena Setiap Sentimeter <br />
          <span style="color: #C8102E;">Berarti</span>
        </h1>

        <div>
          <span class="font-heading text-2xl font-bold text-zinc-950">AWLR</span
          >
          <span class="text-base ml-2 text-zinc-500 font-medium"
            >— Automatic Water Level Recorder</span
          >
        </div>

        <p
          class="text-lg leading-relaxed text-zinc-600 max-w-[50ch] font-medium"
        >
          Pengukuran ketinggian muka air otomatis, 100% online, terkirim
          langsung ke STESY. Akurasi ±1mm, IP68, solar-powered — siap di pos
          hidrologi manapun di Indonesia.
        </p>

        <div class="flex flex-wrap gap-4 pt-2">
          <a
            href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWLR."
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);"
          >
            <MessageCircle size={15} />
            Konsultasi AWLR
          </a>
          <button
            class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC]"
            style="border: 1.5px solid #E5E5E5; color: #1A1A1A;"
          >
            <Download size={15} />
            Download Datasheet
          </button>
        </div>
      </div>

      <!-- Product Visual -->
      <div class="relative flex justify-center">
        <div
          class="relative w-64 h-80 rounded-3xl overflow-hidden"
          style="background: linear-gradient(180deg, #0EA5E9 0%, #0369A1 100%); box-shadow: 0 20px 60px rgba(14,165,233,0.2);"
        >
          <div
            class="absolute inset-0 flex flex-col items-center justify-center p-6 text-white"
          >
            <Waves size={48} class="mb-4 opacity-80" />
            <span class="font-heading text-3xl font-extrabold">AWLR</span>
            <span class="text-xs mt-1 opacity-70 uppercase tracking-widest"
              >BL-1100</span
            >
            <div class="mt-6 w-full space-y-2">
              <div class="flex justify-between text-xs opacity-80">
                <span>Water Level</span>
                <span class="font-mono tabular-nums">3.42 m</span>
              </div>
              <div class="h-1 rounded-full bg-white/20">
                <div
                  class="h-full rounded-full bg-white/80"
                  style="width: 68%;"
                ></div>
              </div>
              <div class="flex justify-between text-xs opacity-80">
                <span>Status</span>
                <span class="flex items-center gap-1"
                  ><span class="w-1.5 h-1.5 rounded-full bg-green-400"
                  ></span>Online</span
                >
              </div>
            </div>
          </div>
        </div>
        <div
          class="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold"
          style="border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.06); color: #C8102E;"
        >
          ±1mm Accuracy
        </div>
      </div>
    </div>
  </div>
</section>

<!-- "Untuk Anda yang..." -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
  <Ornaments />
  <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2
      class="font-heading text-2xl sm:text-3xl font-bold mb-8"
      style="color: #1A1A1A;"
    >
      Untuk Anda yang Bertanggung Jawab Atas...
    </h2>
    <div class="flex flex-wrap justify-center gap-3">
      {#each useCases as useCase}
        <div
          class="px-5 py-3 rounded-xl text-sm font-medium bg-[#FAFAFA] transition-all hover:bg-[#FBE9EC] hover:-translate-y-0.5"
          style="border: 1px solid #E5E5E5; color: #3A3A3A;"
        >
          {useCase}
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 6 Keunggulan -->
<section
  class="relative py-16 lg:py-24 overflow-hidden"
  style="background: linear-gradient(180deg, #FAFAFA 0%, #FFF5F6 100%);"
>
  <Ornaments variant="dense" />
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <span
        class="text-xs font-semibold uppercase tracking-widest"
        style="color: #C8102E;">Keunggulan</span
      >
      <h2
        class="font-heading text-3xl sm:text-4xl font-bold mt-3"
        style="color: #1A1A1A;"
      >
        Mengapa AWLR Beacon
      </h2>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each features as feat, i}
        <div
          class="group p-6 rounded-2xl bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          style="border: 1px solid #E5E5E5;"
        >
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
            style="background: #FBE9EC;"
          >
            <Check size={18} style="color: #C8102E;" />
          </div>
          <h3
            class="font-heading text-base font-bold mb-2 group-hover:text-[#C8102E] transition-colors"
            style="color: #1A1A1A;"
          >
            {feat.title}
          </h3>
          <p class="text-sm leading-relaxed" style="color: #5C5C5C;">
            {feat.desc}
          </p>
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
                    Download Brosur
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
                            >Gambar Menyusul</span
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

<!-- Sudah Terpasang Di -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
  <Ornaments />
  <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-10">
      <span
        class="text-xs font-semibold uppercase tracking-widest"
        style="color: #C8102E;">Track Record</span
      >
      <h2 class="font-heading text-3xl font-bold mt-3" style="color: #1A1A1A;">
        Sudah Terpasang Di
      </h2>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each projects as proj}
        <div
          class="p-5 rounded-2xl bg-[#FAFAFA] hover:bg-[#FBE9EC] transition-all"
          style="border: 1px solid #E5E5E5;"
        >
          <div class="flex items-center gap-2 mb-2">
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white tabular-nums"
              style="background: #C8102E;">{proj.year}</span
            >
            <div
              class="w-1.5 h-1.5 rounded-full bg-[#1B7F3A] animate-pulse-dot"
            ></div>
          </div>
          <h3 class="font-heading text-sm font-bold" style="color: #1A1A1A;">
            {proj.name}
          </h3>
          <p class="text-xs mt-1" style="color: #5C5C5C;">{proj.client}</p>
          {#if proj.location}
            <p class="text-[11px] mt-1" style="color: #8A8A8A;">
              {proj.location}
            </p>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Premium Floating CTA (SKILL: Cockpit Mode) -->
<section class="relative py-20 bg-white">
  <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    <div
      class="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 sm:p-16 lg:p-20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 group"
      style="box-shadow: 0 40px 80px -20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.05);"
    >
      <!-- Subtle glow / Liquid Glass refraction -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-[#C8102E]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
      ></div>
      <div
        class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C8102E]/10 blur-3xl pointer-events-none z-0"
      ></div>

      <div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
          style="background: rgba(200,16,46,0.15); color: #FF4D6D; border: 1px solid rgba(200,16,46,0.3);"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            style="background: #FF4D6D; box-shadow: 0 0 10px #FF4D6D;"
          ></span>
          Next Step
        </span>
        <h2
          class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4"
        >
          Mulai Proyek dengan AWLR
        </h2>
        <p class="text-lg text-zinc-400 font-medium">
          Tim engineer kami akan merancang arsitektur telemetri yang tepat dan
          menghitung kebutuhan riil proyek Anda.
        </p>
      </div>

      <div
        class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0"
      >
        <a
          href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWLR%20untuk%20proyek%20saya."
          target="_blank"
          rel="noopener"
          class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile"
        >
          <MessageCircle size={18} />
          Konsultasi AWLR
        </a>
        <a
          href="/solusi/water-security"
          class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile"
          style="border: 1px solid rgba(255,255,255,0.15);"
        >
          <ArrowRight size={18} />
          Jelajahi Produk Lain
        </a>
      </div>
    </div>
  </div>
</section>

<style>
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
