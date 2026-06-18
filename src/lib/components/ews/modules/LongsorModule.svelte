<script lang="ts">
  import MoveUpRight from '@lucide/svelte/icons/move-up-right';
  import CloudRain from '@lucide/svelte/icons/cloud-rain';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import Mountain from '@lucide/svelte/icons/mountain';
  import Map from '@lucide/svelte/icons/map';

  import Panel from '$lib/components/ews/ui/Panel.svelte';
  import KpiCard from '$lib/components/ews/ui/KpiCard.svelte';
  import Gauge from '$lib/components/ews/ui/Gauge.svelte';
  import LevelBar from '$lib/components/ews/ui/LevelBar.svelte';
  import Sparkline from '$lib/components/ews/ui/Sparkline.svelte';
  import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';
  import BasinMap from '$lib/components/ews/map/BasinMap.svelte';

  import { data, markers } from '$lib/ews/stores';
  import { SIAGA_COLOR, siagaLabel, worstOf } from '$lib/ews/status';
  import { num } from '$lib/ews/format';
  import { goto } from '$app/navigation';
  import type { Siaga } from '$lib/ews/types';

  // ── derived data ──────────────────────────────────────────────
  const sensors = $derived($data.longsor);

  const longsorMarkers = $derived($markers.filter((m) => m.kind === 'longsor'));

  const counts = $derived.by(() => {
    const c: Record<Siaga, number> = { normal: 0, waspada: 0, siaga: 0, awas: 0 };
    for (const s of sensors) c[s.status] += 1;
    return c;
  });

  const worstStatus = $derived(worstOf(sensors.map((s) => s.status)));

  const highestRisk = $derived(
    [...sensors].sort((a, b) => {
      const rA = Math.max(ratio(a.movementMm, a.movementThreshold), ratio(a.rainAccumMm, a.rainThreshold));
      const rB = Math.max(ratio(b.movementMm, b.movementThreshold), ratio(b.rainAccumMm, b.rainThreshold));
      return rB - rA;
    })[0] ?? null
  );

  const nonNormalCount = $derived(
    (counts.waspada ?? 0) + (counts.siaga ?? 0) + (counts.awas ?? 0)
  );

  // ── helpers ───────────────────────────────────────────────────
  function ratio(val: number, thr: number): number {
    return thr > 0 ? val / thr : 0;
  }

  function zoneLabel(status: Siaga): string {
    const z: Record<Siaga, string> = {
      normal: 'Zona Aman',
      waspada: 'Zona Waspada',
      siaga: 'Zona Siaga',
      awas: 'Zona Bahaya',
    };
    return z[status];
  }
</script>

<div class="flex flex-col gap-3">
  <!-- KPI strip -->
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <KpiCard label="Sensor Longsor" value={String(sensors.length)} unit="unit" icon={Mountain} accent>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">{nonNormalCount} sensor waspada/aktif</span>
      {/snippet}
    </KpiCard>

    <KpiCard label="Status Tertinggi" value={siagaLabel(worstStatus)} icon={TriangleAlert} accent={worstStatus !== 'normal'}>
      {#snippet footer()}
        <StatusBadge status={worstStatus} size="xs" pulse={worstStatus !== 'normal'} />
      {/snippet}
    </KpiCard>

    <KpiCard
      label="Pergerakan Tertinggi"
      value={highestRisk ? num(highestRisk.movementMm, 1) : '—'}
      unit="mm"
      icon={MoveUpRight}
    >
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">
          {highestRisk ? highestRisk.nama : '—'}
        </span>
      {/snippet}
    </KpiCard>

    <KpiCard
      label="Hujan Tertinggi"
      value={highestRisk ? num(highestRisk.rainAccumMm, 0) : '—'}
      unit="mm"
      icon={CloudRain}
    >
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">akumulasi curah hujan</span>
      {/snippet}
    </KpiCard>
  </div>

  <!-- Summary strip -->
  <div class="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel px-3.5 py-2.5">
    <span class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Rekapitulasi Sensor:</span>
    {#each (['awas', 'siaga', 'waspada', 'normal'] as const) as s}
      <div class="flex items-center gap-1.5">
        <span class="h-2 w-2 shrink-0 rounded-full" style="background:{SIAGA_COLOR[s]}"></span>
        <span class="text-[11px] text-ink-muted">{siagaLabel(s)}</span>
        <span class="font-mono text-[11px] font-semibold text-ink-strong">{counts[s]}</span>
      </div>
    {/each}
    {#if highestRisk}
      <span class="ml-auto hidden text-[10px] text-ink-dim sm:block">
        Risiko tertinggi: <span class="font-semibold text-ink">{highestRisk.nama}</span>
        — {zoneLabel(highestRisk.status)}
      </span>
    {/if}
  </div>

  <!-- Sensor card grid -->
  <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-2">
    {#each sensors as sensor (sensor.id)}
      <button onclick={() => goto('/demo/ews/longsor/' + sensor.id)} class="text-left">
        <Panel
          title={sensor.nama}
          subtitle={sensor.lokasi}
          icon={Mountain}
          class="h-full transition-colors hover:border-accent/40"
        >
          {#snippet actions()}
            <StatusBadge status={sensor.status} size="xs" pulse={sensor.status !== 'normal'} />
          {/snippet}

          <!-- Zone label -->
          <div class="mb-3 flex items-center justify-between">
            <span
              class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style="background:{SIAGA_COLOR[sensor.status]}22;color:{SIAGA_COLOR[sensor.status]};border:1px solid {SIAGA_COLOR[sensor.status]}44"
            >
              {zoneLabel(sensor.status)}
            </span>
            <span class="text-[10px] text-ink-dim">
              Batas: {num(sensor.movementThreshold, 0)} mm / {num(sensor.rainThreshold, 0)} mm
            </span>
          </div>

          <!-- Gauges row -->
          <div class="flex items-start justify-around gap-3">
            <Gauge
              value={sensor.movementMm}
              max={Math.max(1, sensor.movementThreshold)}
              label="Pergerakan"
              sublabel="{num(sensor.movementMm, 1)} / {num(sensor.movementThreshold, 0)} mm"
              color={SIAGA_COLOR[sensor.status]}
              size={88}
              digits={1}
              unit=" mm"
            />
            <Gauge
              value={sensor.rainAccumMm}
              max={Math.max(1, sensor.rainThreshold)}
              label="Akumulasi Hujan"
              sublabel="{num(sensor.rainAccumMm, 0)} / {num(sensor.rainThreshold, 0)} mm"
              color={SIAGA_COLOR[sensor.status]}
              size={88}
              digits={0}
              unit=" mm"
            />
          </div>

          <!-- Level bars -->
          <div class="mt-3 space-y-2.5">
            <div>
              <div class="mb-1 flex items-center justify-between text-[11px]">
                <span class="text-ink-muted">Pergerakan tanah</span>
                <span class="font-mono font-semibold text-ink-strong">
                  {num(sensor.movementMm, 1)} mm / {num(sensor.movementThreshold, 0)} mm
                </span>
              </div>
              <LevelBar
                value={sensor.movementMm}
                min={0}
                max={sensor.movementThreshold * 1.1}
                color={SIAGA_COLOR[sensor.status]}
              />
            </div>

            <div>
              <div class="mb-1 flex items-center justify-between text-[11px]">
                <span class="text-ink-muted">Akumulasi hujan</span>
                <span class="font-mono font-semibold text-ink-strong">
                  {num(sensor.rainAccumMm, 0)} mm / {num(sensor.rainThreshold, 0)} mm
                </span>
              </div>
              <LevelBar
                value={sensor.rainAccumMm}
                min={0}
                max={sensor.rainThreshold * 1.1}
                color={SIAGA_COLOR[sensor.status]}
              />
            </div>
          </div>

          <!-- Sparkline -->
          <div class="mt-3 border-t border-line-soft pt-2.5">
            <div class="mb-1 flex items-center justify-between text-[10px] text-ink-dim">
              <span>Pergerakan 48 jam terakhir</span>
              <span>{num(sensor.movementMm, 1)} mm saat ini</span>
            </div>
            <Sparkline
              points={sensor.history.map((x) => x.v)}
              color={SIAGA_COLOR[sensor.status]}
              height={32}
            />
          </div>
        </Panel>
      </button>
    {/each}
  </div>

  <!-- Map -->
  <Panel title="Peta Sensor Longsor" subtitle="Sebaran sensor gerakan tanah di wilayah DIY · klik penanda untuk detail" icon={Map} flush>
    <div class="relative h-[380px] overflow-hidden rounded-b-xl">
      <BasinMap
        markers={longsorMarkers}
        center={[-7.82, 110.35]}
        zoom={10}
        onMarkerClick={(m) => goto('/demo/ews/longsor/' + m.id)}
      />
    </div>
  </Panel>
</div>
