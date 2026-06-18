<script lang="ts">
  import LineChart from '@lucide/svelte/icons/chart-spline';
  import ScatterIcon from '@lucide/svelte/icons/chart-scatter';
  import TrendingUp from '@lucide/svelte/icons/trending-up';
  import Droplets from '@lucide/svelte/icons/droplets';
  import CloudRain from '@lucide/svelte/icons/cloud-rain';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
  import Sigma from '@lucide/svelte/icons/sigma';
  import CheckSquare from '@lucide/svelte/icons/square-check-big';
  import Square from '@lucide/svelte/icons/square';
  import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

  import Panel from '$lib/components/ews/ui/Panel.svelte';
  import MultiChart from '$lib/components/ews/ui/MultiChart.svelte';
  import ScatterPlot from '$lib/components/ews/ui/ScatterPlot.svelte';
  import Sparkline from '$lib/components/ews/ui/Sparkline.svelte';
  import Delta from '$lib/components/ews/ui/Delta.svelte';
  import KpiCard from '$lib/components/ews/ui/KpiCard.svelte';

  import { data } from '$lib/ews/stores';
  import { SIAGA_COLOR } from '$lib/ews/status';
  import { num, fmtUnit, signed } from '$lib/ews/format';
  import { riseRatePerHour, delta, minMax, lastN } from '$lib/ews/series';
  import type { Pos, HistPoint, Siaga } from '$lib/ews/types';

  // -------------------------------------------------------------------------
  // Data
  // -------------------------------------------------------------------------
  const d = $derived($data);
  const tmaList = $derived(d.pos.filter((p) => p.kind === 'tma'));
  const arrList = $derived(d.pos.filter((p) => p.kind === 'arr'));

  // -------------------------------------------------------------------------
  // Series palette (6 colours for multi-station)
  // -------------------------------------------------------------------------
  const PALETTE = ['#4f9bee', '#e08a3c', '#1f8a5c', '#9b6bc2', '#c06080', '#6aa0d4'];
  function colorFor(i: number): string {
    return PALETTE[i % PALETTE.length];
  }

  // -------------------------------------------------------------------------
  // State: TMA station selector
  // -------------------------------------------------------------------------
  let selectedTmaIds = $state<string[]>([]);

  // Initialise on first meaningful render (effect runs once)
  $effect(() => {
    if (selectedTmaIds.length === 0 && tmaList.length > 0) {
      selectedTmaIds = tmaList.slice(0, Math.min(3, tmaList.length)).map((p) => p.id);
    }
  });

  function toggleTma(id: string) {
    selectedTmaIds = selectedTmaIds.includes(id)
      ? selectedTmaIds.filter((x) => x !== id)
      : [...selectedTmaIds, id];
  }

  const selectedTma = $derived(tmaList.filter((p) => selectedTmaIds.includes(p.id)));

  // -------------------------------------------------------------------------
  // TMA trend series for MultiChart
  // -------------------------------------------------------------------------
  const tmaSeries = $derived(
    selectedTma.map((p, i) => ({
      name: p.nama,
      color: colorFor(i),
      points: p.history,
    }))
  );

  // ARR series for MultiChart (first arr station, bars=true single-series)
  // Show all arr stations as separate sparklines; main chart shows first arr
  const primaryArr = $derived(arrList[0] ?? null);
  const arrSeries = $derived(
    primaryArr
      ? [{ name: primaryArr.nama, color: '#4f9bee', points: primaryArr.history }]
      : []
  );

  // -------------------------------------------------------------------------
  // Per-station TMA statistics
  // -------------------------------------------------------------------------
  interface PosStat {
    pos: Pos;
    color: string;
    rate: number;
    d1h: number;
    d6h: number;
    mm: { min: number; max: number };
  }
  const tmaStats = $derived<PosStat[]>(
    selectedTma.map((p, i) => ({
      pos: p,
      color: colorFor(i),
      rate: riseRatePerHour(p.history),
      d1h: delta(p.history, 1),
      d6h: delta(p.history, 6),
      mm: minMax(p.history),
    }))
  );

  // KPI: worst status in selection
  const SIAGA_ORDER: Siaga[] = ['normal', 'waspada', 'siaga', 'awas'];
  const worstTma = $derived<Siaga>(
    selectedTma.reduce<Siaga>((acc, p) => {
      return SIAGA_ORDER.indexOf(p.status) > SIAGA_ORDER.indexOf(acc) ? p.status : acc;
    }, 'normal')
  );
  const avgRate = $derived(
    tmaStats.length
      ? tmaStats.reduce((s, x) => s + x.rate, 0) / tmaStats.length
      : 0
  );
  const peakTma = $derived(
    tmaStats.length
      ? [...tmaStats].sort((a, b) => b.pos.value - a.pos.value)[0]
      : null
  );

  // -------------------------------------------------------------------------
  // Rainfall stats (24-h sum over latest arr history)
  // -------------------------------------------------------------------------
  const totalRainfall24h = $derived(
    arrList.reduce((sum, p) => {
      const pts = lastN(p.history, 24);
      return sum + pts.reduce((s2, pt) => s2 + pt.v, 0);
    }, 0)
  );

  // -------------------------------------------------------------------------
  // Correlation: first arr vs first tma (upstream rain → downstream water level)
  // Pair by array index (both have 48 hourly points from the same seed clock)
  // -------------------------------------------------------------------------
  let corrArrId = $state('');
  let corrTmaId = $state('');

  // Initialise correlation defaults when data arrives
  $effect(() => {
    if (corrArrId === '' && arrList.length > 0) corrArrId = arrList[0].id;
    if (corrTmaId === '' && tmaList.length > 0) corrTmaId = tmaList[0].id;
  });

  const corrArrPos = $derived(arrList.find((p) => p.id === corrArrId) ?? arrList[0] ?? null);
  const corrTmaPos = $derived(tmaList.find((p) => p.id === corrTmaId) ?? tmaList[0] ?? null);

  interface ScatterPt { x: number; y: number; color: string }

  const corrScatter = $derived.by<{
    pts: ScatterPt[];
    r: number;
    xName: string;
    yName: string;
  } | null>(() => {
    if (!corrArrPos || !corrTmaPos) return null;
    const sx = corrArrPos.history;
    const sy = corrTmaPos.history;
    const n = Math.min(sx.length, sy.length);
    if (n < 3) return null;
    const pts: ScatterPt[] = [];
    for (let k = 0; k < n; k++) {
      pts.push({ x: sx[k].v, y: sy[k].v, color: '#4f9bee' });
    }
    // Pearson r
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (const p of pts) {
      sumX += p.x; sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
    }
    const nn = pts.length;
    const num2 = nn * sumXY - sumX * sumY;
    const den = Math.sqrt((nn * sumX2 - sumX * sumX) * (nn * sumY2 - sumY * sumY));
    const r = den < 1e-9 ? 0 : num2 / den;
    return { pts, r, xName: corrArrPos.nama, yName: corrTmaPos.nama };
  });

  function corrLabel(r: number): string {
    const abs = Math.abs(r);
    if (abs > 0.7) return '— korelasi kuat';
    if (abs > 0.4) return '— korelasi sedang';
    return '— korelasi lemah';
  }

  // -------------------------------------------------------------------------
  // Forecast / Prediksi: project TMA for a chosen station
  // -------------------------------------------------------------------------
  let fcstTmaId = $state('');

  $effect(() => {
    if (fcstTmaId === '' && tmaList.length > 0) fcstTmaId = tmaList[0].id;
  });

  const fcstPos = $derived(tmaList.find((p) => p.id === fcstTmaId) ?? tmaList[0] ?? null);

  const FORECAST_HOURS = 6;

  const fcstData = $derived.by<{
    historySeries: HistPoint[];
    forecastSeries: HistPoint[];
    rate: number;
    currentVal: number;
    etaWaspada: number | null;
    etaSiaga: number | null;
    etaAwas: number | null;
    nextSiaga: Siaga | null;
    etaHours: number | null;
  } | null>(() => {
    if (!fcstPos) return null;
    const h = fcstPos.history;
    if (h.length < 2) return null;
    const rate = riseRatePerHour(h);
    const lastPt = h[h.length - 1];
    const currentVal = lastPt.v;
    const lastT = lastPt.t;

    // Project forward FORECAST_HOURS hours
    const forecastSeries: HistPoint[] = [];
    for (let i = 1; i <= FORECAST_HOURS; i++) {
      forecastSeries.push({ t: lastT + i * 3_600_000, v: Math.max(0, currentVal + rate * i) });
    }

    // ETA to each threshold
    function eta(threshold: number): number | null {
      if (Math.abs(rate) < 1e-6) return null;
      const hoursNeeded = (threshold - currentVal) / rate;
      return hoursNeeded > 0 ? hoursNeeded : null;
    }
    const t = fcstPos.thresholds;
    const etaWaspada = eta(t.waspada);
    const etaSiaga = eta(t.siaga);
    const etaAwas = eta(t.awas);

    // Nearest upcoming threshold
    const etas: { siaga: Siaga; h: number }[] = [];
    if (etaWaspada !== null) etas.push({ siaga: 'waspada', h: etaWaspada });
    if (etaSiaga !== null) etas.push({ siaga: 'siaga', h: etaSiaga });
    if (etaAwas !== null) etas.push({ siaga: 'awas', h: etaAwas });
    etas.sort((a, b) => a.h - b.h);
    const next = etas[0] ?? null;

    return {
      historySeries: h,
      forecastSeries,
      rate,
      currentVal,
      etaWaspada,
      etaSiaga,
      etaAwas,
      nextSiaga: next?.siaga ?? null,
      etaHours: next?.h ?? null,
    };
  });

  // Combined history + forecast for MultiChart
  const fcstCombined = $derived.by<{
    histSeries: { name: string; color: string; points: HistPoint[] }[];
    fcstSeries: { name: string; color: string; points: HistPoint[] }[];
    thresholds: { value: number; color: string; label: string }[];
  } | null>(() => {
    if (!fcstPos || !fcstData) return null;
    const histSeries = [
      { name: fcstPos.nama, color: '#4f9bee', points: fcstData.historySeries },
    ];
    const fcstSeries = [
      { name: 'Proyeksi', color: '#9b6bc2', points: fcstData.forecastSeries },
    ];
    const t = fcstPos.thresholds;
    const thresholds = [
      { value: t.waspada, color: SIAGA_COLOR.waspada, label: 'Waspada' },
      { value: t.siaga, color: SIAGA_COLOR.siaga, label: 'Siaga' },
      { value: t.awas, color: SIAGA_COLOR.awas, label: 'Awas' },
    ];
    return { histSeries, fcstSeries, thresholds };
  });

  function roundHours(h: number): string {
    if (h < 1) return `${Math.round(h * 60)} menit`;
    return `${num(h, 1)} jam`;
  }
</script>

<div class="flex flex-col gap-3">
  <!-- ===== KPI STRIP ===== -->
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <KpiCard
      label="Status Terburuk (TMA)"
      value={worstTma.toUpperCase()}
      accent
    >
      {#snippet footer()}
        <span class="inline-block h-2 w-2 rounded-full" style="background:{SIAGA_COLOR[worstTma]}"></span>
        <span class="ml-1.5 text-[10px] text-ink-muted">{selectedTma.length} pos dipilih</span>
      {/snippet}
    </KpiCard>

    <KpiCard
      label="Laju Naik Rata-rata"
      value={signed(avgRate, 2)}
      unit="m/jam"
    >
      {#snippet footer()}
        <Delta delta={avgRate} digits={2} unit="m/jam" badWhen="up" />
      {/snippet}
    </KpiCard>

    <KpiCard
      label="TMA Tertinggi Saat Ini"
      value={peakTma ? num(peakTma.pos.value, 2) : '–'}
      unit={peakTma?.pos.unit ?? 'm'}
    >
      {#snippet footer()}
        {#if peakTma}
          <span class="text-[10px] text-ink-dim truncate">{peakTma.pos.nama}</span>
        {/if}
      {/snippet}
    </KpiCard>

    <KpiCard
      label="Total CH 24 Jam"
      value={num(totalRainfall24h, 0)}
      unit="mm"
    >
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">{arrList.length} pos hujan</span>
      {/snippet}
    </KpiCard>
  </div>

  <!-- ===== MAIN CONTENT GRID ===== -->
  <div class="grid grid-cols-1 gap-3 xl:grid-cols-3">

    <!-- Left 2 columns -->
    <div class="flex flex-col gap-3 xl:col-span-2">

      <!-- ===== 1. TREN TMA ===== -->
      <Panel title="Tren TMA — Tinggi Muka Air" subtitle="48 jam terakhir · multi-stasiun" icon={LineChart} accent>
        {#snippet actions()}
          <span class="text-[10px] text-ink-dim">{selectedTma.length}/{tmaList.length} pos aktif</span>
        {/snippet}

        <!-- Station selector -->
        <div class="mb-3 flex flex-wrap items-center gap-1.5">
          {#each tmaList as p, i}
            {@const on = selectedTmaIds.includes(p.id)}
            <button
              onclick={() => toggleTma(p.id)}
              class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors {on
                ? 'border-accent/50 bg-accent/15 text-ink-strong'
                : 'border-line bg-surface text-ink-muted hover:bg-panel hover:text-ink'}"
            >
              {#if on}<CheckSquare size={12} class="text-accent-bright" />{:else}<Square size={12} />{/if}
              <span class="h-1.5 w-1.5 rounded-full" style="background:{on ? colorFor(selectedTma.findIndex((x) => x.id === p.id)) : '#888'}"></span>
              <span class="truncate max-w-[140px]">{p.nama.replace(/^Pos (Duga Air |Lahar )/, '')}</span>
            </button>
          {/each}
        </div>

        <MultiChart series={tmaSeries} height={280} unit="m" digits={2} />

        <!-- Legend with stats -->
        {#if tmaStats.length}
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line-soft pt-2.5">
            {#each tmaStats as s}
              <span class="inline-flex items-center gap-1.5 text-[11px]">
                <span class="h-2.5 w-2.5 rounded-sm" style="background:{s.color}"></span>
                <span class="text-ink">{s.pos.nama.replace(/^Pos (Duga Air |Lahar )/, '')}</span>
                <span class="font-mono text-ink-strong tnum">{num(s.pos.value, 2)} m</span>
                <Delta delta={s.d1h} digits={2} unit="m" badWhen="up" />
              </span>
            {/each}
          </div>
        {/if}
      </Panel>

      <!-- ===== 2. TREN CURAH HUJAN ===== -->
      <Panel title="Tren Curah Hujan" subtitle="48 jam terakhir · curah hujan per jam" icon={CloudRain}>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {#each arrList as p, i}
            <div class="rounded-lg border border-line-soft bg-surface px-3 py-2.5">
              <div class="mb-1.5 flex items-center justify-between">
                <span class="text-[11px] font-medium text-ink">{p.nama.replace('Pos Hujan ', '')}</span>
                <span class="font-mono text-[12px] font-semibold text-ink-strong tnum">{num(p.value, 1)} mm</span>
              </div>
              <div class="h-[56px]">
                <Sparkline
                  points={p.history.map((h) => h.v)}
                  color={colorFor(i)}
                  height={56}
                  bars
                  dot={false}
                  area={false}
                />
              </div>
              <div class="mt-1 flex items-center justify-between text-[10px] text-ink-dim">
                <span>CH 24 jam: <span class="font-mono text-ink">{num(lastN(p.history, 24).reduce((s, x) => s + x.v, 0), 0)} mm</span></span>
                <span class="h-1.5 w-1.5 rounded-full" style="background:{SIAGA_COLOR[p.status]}"></span>
              </div>
            </div>
          {/each}
        </div>
      </Panel>

      <!-- ===== 3. KORELASI HUJAN vs TMA ===== -->
      <Panel title="Korelasi Curah Hujan vs TMA" subtitle="Scatter plot berpasangan · 48 titik data" icon={ScatterIcon} accent>
        <!-- Selector row -->
        <div class="mb-3 grid grid-cols-2 gap-3">
          <div>
            <div class="mb-1 text-[10px] uppercase tracking-wide text-ink-dim">Pos Hujan (sumbu X)</div>
            <div class="flex flex-wrap gap-1.5">
              {#each arrList as p}
                <button
                  onclick={() => (corrArrId = p.id)}
                  class="rounded-md border px-2 py-0.5 text-[11px] transition-colors {corrArrId === p.id
                    ? 'border-accent/50 bg-accent/15 text-ink-strong'
                    : 'border-line text-ink-muted hover:bg-panel'}"
                >
                  {p.nama.replace('Pos Hujan ', '')}
                </button>
              {/each}
            </div>
          </div>
          <div>
            <div class="mb-1 text-[10px] uppercase tracking-wide text-ink-dim">Pos TMA (sumbu Y)</div>
            <div class="flex flex-wrap gap-1.5">
              {#each tmaList as p}
                <button
                  onclick={() => (corrTmaId = p.id)}
                  class="rounded-md border px-2 py-0.5 text-[11px] transition-colors {corrTmaId === p.id
                    ? 'border-accent/50 bg-accent/15 text-ink-strong'
                    : 'border-line text-ink-muted hover:bg-panel'}"
                >
                  {p.nama.replace(/^Pos (Duga Air |Lahar )/, '')}
                </button>
              {/each}
            </div>
          </div>
        </div>

        {#if corrScatter}
          <div class="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
            Koefisien korelasi Pearson:
            <span class="font-mono font-semibold {Math.abs(corrScatter.r) > 0.5 ? 'text-gold' : 'text-ink-strong'}">{num(corrScatter.r, 3)}</span>
            <span class="text-ink-dim">{corrLabel(corrScatter.r)}</span>
          </div>
          <ScatterPlot
            points={corrScatter.pts}
            height={280}
            xLabel="{corrScatter.xName.replace('Pos Hujan ', '')} (mm)"
            yLabel="{corrScatter.yName.replace(/^Pos (Duga Air |Lahar )/, '')} (m)"
            fit
          />
        {:else}
          <div class="flex h-[280px] items-center justify-center text-[12px] text-ink-dim">
            Data tidak cukup untuk korelasi.
          </div>
        {/if}
      </Panel>
    </div>

    <!-- Right column -->
    <div class="flex flex-col gap-3">

      <!-- ===== PREDIKSI / FORECAST ===== -->
      <Panel title="Prediksi & Proyeksi TMA" subtitle="Estimasi 6 jam ke depan" icon={TrendingUp} accent>
        <!-- Station picker -->
        <div class="mb-3">
          <div class="mb-1 text-[10px] uppercase tracking-wide text-ink-dim">Pilih pos TMA</div>
          <div class="flex flex-wrap gap-1.5">
            {#each tmaList as p}
              <button
                onclick={() => (fcstTmaId = p.id)}
                class="rounded-md border px-2 py-0.5 text-[11px] transition-colors {fcstTmaId === p.id
                  ? 'border-accent/50 bg-accent/15 text-ink-strong'
                  : 'border-line text-ink-muted hover:bg-panel'}"
              >
                {p.nama.replace(/^Pos (Duga Air |Lahar )/, '')}
              </button>
            {/each}
          </div>
        </div>

        {#if fcstData && fcstCombined && fcstPos}
          <!-- Forecast banner -->
          {#if fcstData.nextSiaga && fcstData.etaHours !== null}
            <div class="mb-3 flex items-start gap-2 rounded-lg border px-3 py-2.5"
              style="border-color:{SIAGA_COLOR[fcstData.nextSiaga]}40;background:{SIAGA_COLOR[fcstData.nextSiaga]}15"
            >
              <AlertTriangle size={14} class="mt-0.5 shrink-0" style="color:{SIAGA_COLOR[fcstData.nextSiaga]}" />
              <div class="min-w-0">
                <div class="text-[11.5px] font-medium text-ink-strong">
                  Estimasi mencapai Siaga <span class="uppercase" style="color:{SIAGA_COLOR[fcstData.nextSiaga]}">{fcstData.nextSiaga}</span>
                </div>
                <div class="mt-0.5 font-mono text-[12px] font-semibold" style="color:{SIAGA_COLOR[fcstData.nextSiaga]}">
                  ~{roundHours(fcstData.etaHours)}
                </div>
                <div class="mt-0.5 text-[10px] text-ink-dim">
                  Berdasarkan laju saat ini: {signed(fcstData.rate, 3)} m/jam. Hanya estimasi.
                </div>
              </div>
            </div>
          {:else if fcstData.rate <= 0}
            <div class="mb-3 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
              <span class="h-2 w-2 rounded-full" style="background:{SIAGA_COLOR.normal}"></span>
              <span class="text-[11.5px] text-ink-muted">TMA stabil atau menurun ({signed(fcstData.rate, 3)} m/jam).</span>
            </div>
          {:else}
            <div class="mb-3 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
              <span class="h-2 w-2 rounded-full bg-gold"></span>
              <span class="text-[11.5px] text-ink-muted">Tidak ada ambang yang akan dicapai dalam 6 jam ke depan.</span>
            </div>
          {/if}

          <!-- Combined chart: history + forecast -->
          <MultiChart
            series={[...fcstCombined.histSeries, ...fcstCombined.fcstSeries]}
            height={220}
            unit="m"
            digits={2}
            thresholds={fcstCombined.thresholds}
          />

          <!-- Threshold ETA table -->
          <div class="mt-3 space-y-1.5 border-t border-line-soft pt-3">
            <div class="text-[10px] uppercase tracking-wide text-ink-dim">Estimasi Waktu Pencapaian Ambang</div>
            {#each [
              { label: 'Waspada', eta: fcstData.etaWaspada, threshold: fcstPos.thresholds.waspada, s: 'waspada' as Siaga },
              { label: 'Siaga', eta: fcstData.etaSiaga, threshold: fcstPos.thresholds.siaga, s: 'siaga' as Siaga },
              { label: 'Awas', eta: fcstData.etaAwas, threshold: fcstPos.thresholds.awas, s: 'awas' as Siaga },
            ] as row}
              <div class="flex items-center gap-2 text-[11px]">
                <span class="h-2 w-2 shrink-0 rounded-full" style="background:{SIAGA_COLOR[row.s]}"></span>
                <span class="w-16 text-ink-muted">{row.label}</span>
                <span class="font-mono text-ink">{num(row.threshold, 2)} m</span>
                <span class="ml-auto font-mono text-ink-strong">
                  {row.eta !== null ? '~' + roundHours(row.eta) : (fcstData.currentVal >= row.threshold ? 'terlampaui' : 'tidak tercapai')}
                </span>
              </div>
            {/each}
          </div>

          <!-- Current stats -->
          <div class="mt-3 grid grid-cols-2 gap-2 border-t border-line-soft pt-3">
            <div class="rounded-lg border border-line bg-panel-2 px-2.5 py-2">
              <div class="text-[9.5px] uppercase tracking-wide text-ink-dim">TMA Terkini</div>
              <div class="mt-0.5 font-mono text-[15px] font-semibold text-ink-strong tnum">{num(fcstData.currentVal, 2)} m</div>
            </div>
            <div class="rounded-lg border border-line bg-panel-2 px-2.5 py-2">
              <div class="text-[9.5px] uppercase tracking-wide text-ink-dim">Laju</div>
              <div class="mt-0.5 font-mono text-[15px] font-semibold tnum {fcstData.rate > 0 ? 'text-awas' : fcstData.rate < 0 ? 'text-normal' : 'text-ink'}">{signed(fcstData.rate, 3)} m/j</div>
            </div>
          </div>
        {:else}
          <div class="flex h-32 items-center justify-center text-[12px] text-ink-dim">
            Pilih pos TMA untuk melihat prediksi.
          </div>
        {/if}
      </Panel>

      <!-- ===== STATISTIK RINGKAS TMA ===== -->
      <Panel title="Statistik Ringkas TMA" subtitle="Berdasarkan pos terpilih" icon={Sigma} flush>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-[11px]">
            <thead>
              <tr class="border-b border-line text-[10px] uppercase tracking-wide text-ink-dim">
                <th class="px-3 py-2 font-medium">Pos</th>
                <th class="px-2 py-2 text-right font-medium">Min</th>
                <th class="px-2 py-2 text-right font-medium">Maks</th>
                <th class="px-2 py-2 text-right font-medium">Laju</th>
                <th class="px-3 py-2 text-right font-medium">Δ6j</th>
              </tr>
            </thead>
            <tbody>
              {#each tmaStats as s (s.pos.id)}
                <tr class="border-b border-line-soft hover:bg-[var(--surface-hover)]">
                  <td class="px-3 py-1.5">
                    <div class="flex items-center gap-1.5">
                      <span class="h-2 w-2 shrink-0 rounded-sm" style="background:{s.color}"></span>
                      <span class="truncate max-w-[120px] text-ink">{s.pos.nama.replace(/^Pos (Duga Air |Lahar )/, '')}</span>
                    </div>
                  </td>
                  <td class="px-2 py-1.5 text-right font-mono text-ink tnum">{num(s.mm.min, 2)}</td>
                  <td class="px-2 py-1.5 text-right font-mono text-ink tnum">{num(s.mm.max, 2)}</td>
                  <td class="px-2 py-1.5 text-right font-mono tnum {s.rate > 0 ? 'text-awas' : s.rate < 0 ? 'text-normal' : 'text-ink-dim'}">{signed(s.rate, 2)}</td>
                  <td class="px-3 py-1.5 text-right"><Delta delta={s.d6h} digits={2} unit="m" badWhen="up" /></td>
                </tr>
              {:else}
                <tr><td colspan="5" class="px-3 py-4 text-center text-ink-dim">Pilih pos TMA di atas.</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Panel>

      <!-- ===== RANKING CURAH HUJAN ===== -->
      <Panel title="Peringkat Curah Hujan" subtitle="Nilai terkini · semua pos hujan" icon={Droplets}>
        <div class="space-y-2.5">
          {#each [...arrList].sort((a, b) => b.value - a.value) as p, i}
            {@const maxVal = Math.max(1, ...arrList.map((x) => x.value))}
            <div class="flex items-center gap-2.5">
              <span class="w-24 shrink-0 truncate text-[11px] text-ink-muted">{p.nama.replace('Pos Hujan ', '')}</span>
              <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-2">
                <div class="h-full rounded-full" style="width:{(p.value / maxVal) * 100}%;background:{colorFor(i)}"></div>
              </div>
              <span class="w-14 text-right font-mono text-[11px] text-ink-strong tnum">{num(p.value, 1)} mm</span>
            </div>
          {/each}
        </div>
      </Panel>

      <!-- Rainfall + Water level correlation info -->
      <Panel title="Catatan Analisa" subtitle="Metodologi & asumsi" icon={ArrowUpRight}>
        <div class="space-y-2 text-[11.5px] text-ink-muted">
          <p>Korelasi dihitung menggunakan koefisien Pearson antara 48 titik data historis jam-an pos hujan dan pos TMA yang dipilih.</p>
          <p>Proyeksi menggunakan <span class="font-mono text-ink">laju naik rata-rata</span> (m/jam) dihitung dari seluruh riwayat 48 jam terakhir, diproyeksikan secara linier.</p>
          <p class="text-[10.5px] text-ink-dim">Perhatian: Prediksi adalah estimasi linier sederhana. Tidak memperhitungkan debit masuk, curah hujan real-time, atau kondisi lapangan.</p>
        </div>
      </Panel>
    </div>
  </div>
</div>
