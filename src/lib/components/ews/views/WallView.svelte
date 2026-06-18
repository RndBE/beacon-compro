<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  // Lucide icons
  import CloudRainWind from '@lucide/svelte/icons/cloud-rain-wind';
  import Waves from '@lucide/svelte/icons/waves';
  import Siren from '@lucide/svelte/icons/siren';
  import PersonStanding from '@lucide/svelte/icons/person-standing';
  import Maximize from '@lucide/svelte/icons/maximize';
  import Minimize from '@lucide/svelte/icons/minimize';
  import Pause from '@lucide/svelte/icons/pause';
  import Play from '@lucide/svelte/icons/play';
  import LogOut from '@lucide/svelte/icons/log-out';
  import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
  import Gauge from '@lucide/svelte/icons/gauge';
  import Radio from '@lucide/svelte/icons/radio';

  // Stores + auth
  import { data, markers, statusCounts, overallStatus, activeAlerts } from '$lib/ews/stores';
  import { logout } from '$lib/ews/auth';

  // Status + format helpers
  import { SIAGA_ORDER, SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
  import { num, timeHM } from '$lib/ews/format';

  // UI primitives
  import WallDonut from '$lib/components/ews/ui/WallDonut.svelte';
  import Clock from '$lib/components/ews/ui/Clock.svelte';
  import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';
  import Sparkline from '$lib/components/ews/ui/Sparkline.svelte';

  // Map
  import BasinMap from '$lib/components/ews/map/BasinMap.svelte';
  import WallMapControls from '$lib/components/ews/map/WallMapControls.svelte';

  // Panels
  import AlertPanel from '$lib/components/ews/panels/AlertPanel.svelte';
  import DetailDrawer from '$lib/components/ews/panels/DetailDrawer.svelte';
  import WallCctvPanel from '$lib/components/ews/cctv/WallCctvPanel.svelte';

  // Layout
  import Logo from '$lib/components/ews/layout/Logo.svelte';

  import type { AssetKind, MapMarker } from '$lib/ews/types';
  import type { Pos, LandslideSensor, SirenNode, Shelter, OpAsset } from '$lib/ews/types';
  type AnyAsset = Pos | LandslideSensor | SirenNode | Shelter | OpAsset;

  // ── hiddenKinds filter state (owned here, wired to both map & controls) ──
  let hiddenKinds = $state<AssetKind[]>([]);
  function toggleKind(k: AssetKind) {
    hiddenKinds = hiddenKinds.includes(k)
      ? hiddenKinds.filter((x) => x !== k)
      : [...hiddenKinds, k];
  }
  function resetFilters() {
    hiddenKinds = [];
  }

  // ── auto-tour state ──
  let tourIndex = $state(0);
  let tourPaused = $state(false);
  let tourCenter = $state<[number, number]>([-7.8, 110.37]);
  let tourZoom = $state(11);

  // ── fullscreen state ──
  let isFullscreen = $state(false);

  function toggleFullscreen() {
    if (!browser) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }
  function onFsChange() {
    isFullscreen = !!document.fullscreenElement;
  }

  // ── DetailDrawer state ──
  let drawerOpen = $state(false);
  let drawerAsset = $state<AnyAsset | null>(null);
  let drawerKind = $state<AssetKind | null>(null);

  function onMarkerClick(m: MapMarker) {
    const d = $data;
    let asset: AnyAsset | null = null;
    if (m.kind === 'pos') asset = d.pos.find((x) => x.id === m.id) ?? null;
    else if (m.kind === 'longsor') asset = d.longsor.find((x) => x.id === m.id) ?? null;
    else if (m.kind === 'sirine') asset = d.sirens.find((x) => x.id === m.id) ?? null;
    else if (m.kind === 'shelter') asset = d.shelters.find((x) => x.id === m.id) ?? null;
    else if (m.kind === 'op') asset = d.op.find((x) => x.id === m.id) ?? null;
    if (!asset) return;
    drawerAsset = asset;
    drawerKind = m.kind;
    drawerOpen = true;
  }

  function closeDrawer() {
    drawerOpen = false;
    drawerAsset = null;
    drawerKind = null;
  }

  // ── auto-tour interval ──
  onMount(() => {
    // fullscreen listener
    document.addEventListener('fullscreenchange', onFsChange);

    const id = setInterval(() => {
      if (tourPaused) return;
      const ms = $markers;
      if (!ms.length) return;
      // prefer non-normal markers; fall back to all
      const priority = ms.filter((m) => m.status !== 'normal');
      const pool = priority.length > 0 ? priority : ms;
      tourIndex = (tourIndex + 1) % pool.length;
      const next = pool[tourIndex % pool.length];
      tourCenter = [next.lat, next.lng];
      tourZoom = 13;
    }, 7000);

    return () => {
      clearInterval(id);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  });

  // ── derived aggregates ──
  const d = $derived($data);

  const highestTma = $derived.by(() => {
    const tmaPos = d.pos.filter((p) => p.kind === 'tma');
    if (!tmaPos.length) return null;
    return tmaPos.reduce((a, b) => (b.value > a.value ? b : a));
  });

  const avgRain = $derived.by(() => {
    const arrPos = d.pos.filter((p) => p.kind === 'arr');
    if (!arrPos.length) return 0;
    return arrPos.reduce((s, p) => s + p.value, 0) / arrPos.length;
  });

  const sirenReady = $derived(d.sirens.filter((s) => s.armed).length);

  const totalJiwa = $derived(d.areas.reduce((s, a) => s + a.jiwa, 0));

  // top priority pos for sparklines
  const topPos = $derived(
    [...d.pos]
      .filter((p) => p.kind === 'tma')
      .sort((a, b) => {
        const w: Record<string, number> = { awas: 3, siaga: 2, waspada: 1, normal: 0 };
        return (w[b.status] ?? 0) - (w[a.status] ?? 0) || b.value - a.value;
      })
      .slice(0, 4),
  );

  // ticker items
  const tickerItems = $derived.by(() => {
    const crit = [...d.pos]
      .filter((p) => p.status !== 'normal')
      .sort((a, b) => {
        const w: Record<string, number> = { awas: 3, siaga: 2, waspada: 1, normal: 0 };
        return (w[b.status] ?? 0) - (w[a.status] ?? 0);
      })
      .map((p) => `${siagaLabel(p.status).toUpperCase()} · ${p.nama} — ${num(p.value, 2)} ${p.unit}`);
    const items = [...crit];
    return items.length ? items : ['Seluruh pos dalam kondisi normal — tidak ada peringatan aktif'];
  });
</script>

<svelte:document onfullscreenchange={onFsChange} />

<div class="relative h-full w-full overflow-hidden" style="background:#0a0e16;">
  <!-- ════ PETA FULL-BLEED ════ -->
  <div class="absolute inset-0 z-0">
    <BasinMap
      markers={$markers}
      center={tourCenter}
      zoom={tourZoom}
      {hiddenKinds}
      onMarkerClick={onMarkerClick}
    />
  </div>

  <!-- Vignette overlay -->
  <div
    class="pointer-events-none absolute inset-0 z-[401]"
    style="background:
      radial-gradient(ellipse 60% 40% at 50% 50%, transparent 40%, rgba(10,14,22,0.45) 100%),
      linear-gradient(to bottom, rgba(10,14,22,0.55) 0%, transparent 18%, transparent 80%, rgba(10,14,22,0.65) 100%),
      linear-gradient(to right, rgba(10,14,22,0.55) 0%, transparent 22%, transparent 78%, rgba(10,14,22,0.55) 100%);"
  ></div>

  <!-- Subtle gold accent glow -->
  <div
    class="pointer-events-none absolute inset-0 z-[402]"
    style="background:
      radial-gradient(680px 360px at 50% 100%, rgba(243,177,21,0.05), transparent 60%),
      radial-gradient(520px 300px at 0% 0%, rgba(243,177,21,0.03), transparent 58%);"
  ></div>

  <!-- HUD label (peta center) -->
  <div
    class="pointer-events-none absolute left-1/2 top-[92px] z-[405] -translate-x-1/2 font-mono text-[9.5px] uppercase tracking-[0.2em]"
    style="color:rgba(170,170,170,0.6);"
  >
    Peta Operasional DIY · Auto-tour {tourPaused ? 'dijeda' : 'aktif'}
  </div>

  <!-- Layer & filter controls -->
  <WallMapControls
    markers={$markers}
    {hiddenKinds}
    {toggleKind}
    reset={resetFilters}
  />

  <!-- ════ HUD HEADER BAR ════ -->
  <header
    class="absolute inset-x-3 top-3 z-[620] flex items-center gap-5 overflow-hidden rounded-2xl px-5 py-2.5"
    style="
      background: rgba(10,14,22,0.82);
      border: 1px solid rgba(74,144,196,0.28);
      backdrop-filter: blur(20px);
      box-shadow: 0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
    "
  >
    <!-- LEFT: identity -->
    <div class="flex shrink-0 items-center gap-3">
      <Logo height={28} />
      <div class="leading-tight">
        <div
          class="text-[9px] font-semibold uppercase tracking-[0.26em]"
          style="color:#4a90c4;"
        >Pusat Kendali Operasi</div>
        <div class="text-[16px] font-semibold tracking-tight text-ink-strong">STESY — Pusat Komando</div>
      </div>
    </div>

    <!-- CENTER: inventory counts -->
    <div
      class="mx-auto hidden items-stretch rounded-xl lg:flex"
      style="border:1px solid rgba(74,144,196,0.22);background:rgba(255,255,255,0.015);"
    >
      {#each [
        { n: d.pos.length, l: 'Pos Pantau', Icon: Waves },
        { n: d.longsor.length, l: 'Sensor Longsor', Icon: PersonStanding },
        { n: d.sirens.length, l: 'Sirine EWS', Icon: Siren },
        { n: d.shelters.length, l: 'Shelter', Icon: Radio },
      ] as it, i}
        <div
          class="flex items-center gap-2.5 px-4 py-1"
          style="{i > 0 ? 'border-left:1px solid rgba(74,144,196,0.18)' : ''}"
        >
          <div
            class="grid h-8 w-8 place-items-center rounded-lg"
            style="background:rgba(74,144,196,0.12);border:1px solid rgba(74,144,196,0.28);color:#4a90c4;"
          >
            <it.Icon size={15} strokeWidth={1.9} />
          </div>
          <div class="leading-none">
            <div class="font-mono text-[19px] font-semibold text-ink-strong">{it.n}</div>
            <div class="mt-1 text-[8.5px] uppercase tracking-[0.1em] text-ink-dim">{it.l}</div>
          </div>
        </div>
      {/each}
    </div>

    <!-- RIGHT: clock + controls -->
    <div class="ml-auto flex shrink-0 items-center gap-4">
      <!-- LIVE dot + clock -->
      <div class="flex items-center gap-3">
        <div class="flex flex-col items-end leading-none">
          <span class="flex items-center gap-1.5">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style="background:{SIAGA_COLOR['normal']};"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full" style="background:{SIAGA_COLOR['normal']};"></span>
            </span>
            <span class="text-[9px] font-semibold uppercase tracking-[0.24em]" style="color:{SIAGA_COLOR['normal']};">Live</span>
          </span>
          <StatusBadge status={$overallStatus} size="xs" dot pulse={$overallStatus !== 'normal'} />
        </div>
        <Clock variant="big" />
      </div>

      <!-- Controls -->
      <div
        class="flex items-center gap-2 pl-4"
        style="border-left:1px solid rgba(74,144,196,0.22);"
      >
        <!-- Mode interaktif -->
        <button
          onclick={() => goto('/demo/ews/ringkasan')}
          title="Buka mode interaktif"
          class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11.5px] font-semibold transition-colors"
          style="border-color:rgba(74,144,196,0.4);background:rgba(74,144,196,0.15);color:#4a90c4;"
        >
          <LayoutDashboard size={15} strokeWidth={2} /> Mode Interaktif
        </button>

        <!-- Pause/play auto-tour -->
        <button
          onclick={() => (tourPaused = !tourPaused)}
          title={tourPaused ? 'Lanjutkan auto-tour' : 'Jeda auto-tour'}
          class="grid h-9 w-9 place-items-center rounded-lg border transition-colors"
          style="{tourPaused
            ? 'border-color:rgba(192,119,27,0.5);background:rgba(192,119,27,0.15);color:#c0771b;'
            : 'border-color:rgba(74,144,196,0.25);color:var(--stesy-ink-muted,#aaa);'}"
        >
          {#if tourPaused}<Play size={15} />{:else}<Pause size={15} />{/if}
        </button>

        <!-- Fullscreen -->
        <button
          onclick={toggleFullscreen}
          title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
          class="grid h-9 w-9 place-items-center rounded-lg border transition-colors"
          style="border-color:rgba(74,144,196,0.25);color:var(--stesy-ink-muted,#aaa);"
        >
          {#if isFullscreen}<Minimize size={15} />{:else}<Maximize size={15} />{/if}
        </button>

        <!-- Logout -->
        <button
          onclick={logout}
          title="Keluar sesi"
          class="grid h-9 w-9 place-items-center rounded-lg border transition-colors"
          style="border-color:rgba(181,50,44,0.4);color:rgba(181,50,44,0.9);"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  </header>

  <!-- ════ LEFT DOCK ════ -->
  <aside
    class="absolute bottom-[130px] left-3 top-[88px] z-[610] flex w-[300px] flex-col gap-2.5 overflow-hidden"
  >
    <!-- Donut status -->
    <section
      class="overflow-hidden rounded-xl"
      style="background:rgba(10,14,22,0.82);border:1px solid rgba(74,144,196,0.22);backdrop-filter:blur(16px);"
    >
      <div
        class="flex items-center gap-2 px-3 py-2"
        style="border-bottom:1px solid rgba(74,144,196,0.15);"
      >
        <Gauge size={13} strokeWidth={2} style="color:#4a90c4" />
        <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Status Pos Terpantau</span>
      </div>
      <div class="flex items-center gap-3 p-3">
        <WallDonut
          counts={$statusCounts}
          centerValue={String(d.pos.length + d.longsor.length + d.sirens.length + d.shelters.length)}
          centerLabel="Total Aset"
          centerStatus={$overallStatus}
        />
        <div class="flex flex-1 flex-col gap-1.5">
          {#each SIAGA_ORDER as s}
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-sm" style="background:{SIAGA_COLOR[s]}"></span>
              <span class="text-[11px] text-ink-muted">{siagaLabel(s)}</span>
              <span
                class="ml-auto font-mono text-[14px] font-semibold"
                style="color:{SIAGA_COLOR[s]}"
              >{$statusCounts[s]}</span>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- KPI tiles: curah hujan + TMA tertinggi + sirine siap + populasi -->
    <section
      class="overflow-hidden rounded-xl"
      style="background:rgba(10,14,22,0.82);border:1px solid rgba(74,144,196,0.22);backdrop-filter:blur(16px);"
    >
      <div
        class="flex items-center gap-2 px-3 py-2"
        style="border-bottom:1px solid rgba(74,144,196,0.15);"
      >
        <CloudRainWind size={13} strokeWidth={2} style="color:#4a90c4" />
        <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">KPI Operasional</span>
      </div>
      <div class="grid grid-cols-2 gap-1.5 p-2">
        {#each [
          { label: 'Curah Hujan', value: num(avgRain, 1), unit: 'mm', color: '#c9a227' },
          { label: 'TMA Tertinggi', value: num(highestTma?.value ?? 0, 2), unit: 'm', color: highestTma ? SIAGA_COLOR[highestTma.status] : SIAGA_COLOR['normal'] },
          { label: 'Sirine Siap', value: String(sirenReady), unit: `/ ${d.sirens.length}`, color: sirenReady === d.sirens.length ? SIAGA_COLOR['normal'] : SIAGA_COLOR['waspada'] },
          { label: 'Populasi Terdampak', value: num(totalJiwa, 0), unit: 'jiwa', color: totalJiwa > 0 ? SIAGA_COLOR['waspada'] : SIAGA_COLOR['normal'] },
        ] as kpi}
          <div
            class="rounded-lg p-2.5"
            style="background:{kpi.color}12;border:1px solid {kpi.color}28;"
          >
            <div class="text-[9.5px] uppercase tracking-wide text-ink-dim">{kpi.label}</div>
            <div class="mt-1 font-mono text-[17px] font-semibold leading-none" style="color:{kpi.color}">
              {kpi.value}<span class="ml-0.5 text-[10px] font-normal text-ink-muted">{kpi.unit}</span>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Top pos sparklines -->
    <section
      class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl"
      style="background:rgba(10,14,22,0.82);border:1px solid rgba(74,144,196,0.22);backdrop-filter:blur(16px);"
    >
      <div
        class="flex items-center gap-2 px-3 py-2"
        style="border-bottom:1px solid rgba(74,144,196,0.15);"
      >
        <Waves size={13} strokeWidth={2} style="color:#4a90c4" />
        <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">TMA · Pos Prioritas</span>
      </div>
      <div class="flex min-h-0 flex-1 flex-col divide-y overflow-y-auto" style="divide-color:rgba(74,144,196,0.15);">
        {#each topPos as p (p.id)}
          <button
            onclick={() => onMarkerClick({ id: p.id, kind: 'pos', nama: p.nama, lat: p.lat, lng: p.lng, status: p.status })}
            class="flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
          >
            <span class="h-2 w-2 shrink-0 rounded-full" style="background:{SIAGA_COLOR[p.status]}"></span>
            <div class="min-w-0 flex-1">
              <div class="truncate text-[11.5px] font-medium text-ink-strong">{p.nama}</div>
              <div class="text-[9.5px] text-ink-dim">{p.sungai}</div>
            </div>
            <div class="h-7 w-16 shrink-0">
              <Sparkline points={p.history.map((x) => x.v)} color={SIAGA_COLOR[p.status]} height={28} dot={false} />
            </div>
            <div class="w-12 shrink-0 text-right">
              <div class="font-mono text-[13px] font-semibold" style="color:{SIAGA_COLOR[p.status]}">{num(p.value, 2)}</div>
              <div class="text-[9px] text-ink-dim">{p.unit}</div>
            </div>
          </button>
        {/each}
      </div>
    </section>

    <!-- CCTV panel -->
    <WallCctvPanel />
  </aside>

  <!-- ════ RIGHT DOCK ════ -->
  <aside
    class="absolute bottom-[130px] right-3 top-[88px] z-[610] flex w-[320px] flex-col gap-2.5 overflow-hidden"
  >
    <!-- Active alerts -->
    <section
      class="flex min-h-0 flex-[2] flex-col overflow-hidden rounded-xl"
      style="background:rgba(10,14,22,0.82);border:1px solid rgba(74,144,196,0.22);backdrop-filter:blur(16px);"
    >
      <div
        class="flex items-center gap-2 px-3 py-2"
        style="border-bottom:1px solid rgba(74,144,196,0.15);"
      >
        <Radio size={13} strokeWidth={2} style="color:#4a90c4" />
        <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Peringatan Aktif</span>
        <span
          class="ml-auto rounded-full px-2 py-0.5 font-mono text-[12px] font-semibold"
          style="background:rgba(243,177,21,0.15);color:#f3b115;"
        >{$activeAlerts.length}</span>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto p-2">
        <AlertPanel items={$activeAlerts} max={12} />
      </div>
    </section>
  </aside>

  <!-- ════ BOTTOM DOCK: status ticker ════ -->
  <div
    class="absolute inset-x-3 bottom-3 z-[620] flex flex-col overflow-hidden rounded-2xl"
    style="background:rgba(10,14,22,0.85);border:1px solid rgba(74,144,196,0.25);backdrop-filter:blur(20px);"
  >
    <div class="flex items-center gap-3 px-4 py-2">
      <span
        class="flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
        style="background:rgba(181,50,44,0.15);color:#b5322c;"
      >
        <Siren size={12} /> Status
      </span>

      <!-- Ticker marquee -->
      <div class="min-w-0 flex-1 overflow-hidden" style="mask-image:linear-gradient(to right,transparent,black 5%,black 95%,transparent);">
        <div
          class="flex whitespace-nowrap"
          style="animation:ews-ticker {Math.max(30, tickerItems.length * 8)}s linear infinite;"
        >
          {#each [0, 1] as dup (dup)}
            {#each tickerItems as item}
              <span
                class="mx-5 inline-flex items-center gap-2 text-[12px] text-ink"
                aria-hidden={dup === 1 ? true : undefined}
              >
                <span class="h-1.5 w-1.5 rounded-full" style="background:#4a90c4;"></span>{item}
              </span>
            {/each}
          {/each}
        </div>
      </div>

      <span class="flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-ink-dim">
        {tourPaused ? 'Tour Dijeda' : 'Realtime'}
        <span
          class="h-1.5 w-1.5 rounded-full"
          style="background:{tourPaused ? SIAGA_COLOR['waspada'] : SIAGA_COLOR['normal']};"
        ></span>
      </span>
    </div>
  </div>

  <!-- ════ DETAIL DRAWER ════ -->
  <DetailDrawer
    asset={drawerAsset}
    kind={drawerKind}
    open={drawerOpen}
    onClose={closeDrawer}
  />
</div>

<style>
  @keyframes ews-ticker {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
</style>
