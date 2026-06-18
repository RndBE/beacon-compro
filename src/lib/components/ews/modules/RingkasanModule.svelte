<script lang="ts">
  import Map from '@lucide/svelte/icons/map';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import Activity from '@lucide/svelte/icons/activity';
  import Siren from '@lucide/svelte/icons/siren';
  import Users from '@lucide/svelte/icons/users';
  import ShieldAlert from '@lucide/svelte/icons/shield-alert';
  import Waves from '@lucide/svelte/icons/waves';

  import Panel from '$lib/components/ews/ui/Panel.svelte';
  import KpiCard from '$lib/components/ews/ui/KpiCard.svelte';
  import WallDonut from '$lib/components/ews/ui/WallDonut.svelte';
  import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';
  import BasinMap from '$lib/components/ews/map/BasinMap.svelte';
  import AlertPanel from '$lib/components/ews/panels/AlertPanel.svelte';

  import { data, markers, statusCounts, overallStatus, activeAlerts } from '$lib/ews/stores';
  import { SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
  import { num, timeHM, dateShort } from '$lib/ews/format';
  import { goto } from '$app/navigation';

  // KPI derivations
  const kpi = $derived.by(() => {
    const d = $data;
    const posAktif = d.pos.length;
    const populasi = d.areas.reduce((s, a) => s + a.jiwa, 0);
    const sireneAman = d.sirens.filter((s) => s.armed).length;
    return { posAktif, populasi, sireneAman };
  });

  // Earthquake feed — most-recent first
  const quakes = $derived([...$data.quakes].sort((a, b) => b.t - a.t));

  // Total markers for donut center
  const totalMarkers = $derived(
    ($statusCounts.normal ?? 0) +
      ($statusCounts.waspada ?? 0) +
      ($statusCounts.siaga ?? 0) +
      ($statusCounts.awas ?? 0)
  );
</script>

<div class="flex flex-col gap-3">
  <!-- KPI strip -->
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <KpiCard label="Pos Aktif" value={num(kpi.posAktif, 0)} unit="pos" icon={Activity}>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">{$data.pos.length} titik pemantauan</span>
      {/snippet}
    </KpiCard>

    <KpiCard label="Status Tertinggi" value={siagaLabel($overallStatus)} icon={ShieldAlert} accent>
      {#snippet footer()}
        <StatusBadge status={$overallStatus} size="xs" pulse={$overallStatus !== 'normal'} />
      {/snippet}
    </KpiCard>

    <KpiCard label="Populasi Terdampak" value={num(kpi.populasi, 0)} unit="jiwa" icon={Users}>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">{$data.areas.length} wilayah</span>
      {/snippet}
    </KpiCard>

    <KpiCard label="Sirine Siap" value={num(kpi.sireneAman, 0)} unit={`/ ${$data.sirens.length}`} icon={Siren}>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">{$data.sirens.length - kpi.sireneAman} tidak aktif</span>
      {/snippet}
    </KpiCard>
  </div>

  <!-- Map + alerts -->
  <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
    <!-- Map: 2/3 width -->
    <div class="lg:col-span-2">
      <Panel title="Peta Operasional" subtitle="Status pos pemantauan · klik penanda untuk detail" icon={Map} flush>
        <div class="relative h-[420px] overflow-hidden rounded-b-xl">
          <BasinMap
            markers={$markers}
            onMarkerClick={(m) => goto('/demo/ews/' + m.kind + '/' + m.id)}
          />
        </div>
      </Panel>
    </div>

    <!-- Right column: donut + alerts -->
    <div class="flex flex-col gap-3">
      <!-- Status distribution donut -->
      <Panel title="Distribusi Status">
        <div class="flex items-center gap-4">
          <WallDonut
            counts={$statusCounts}
            size={120}
            centerValue={String(totalMarkers)}
            centerLabel="Total"
            centerStatus={$overallStatus}
          />
          <div class="flex flex-col gap-1.5">
            {#each (['awas', 'siaga', 'waspada', 'normal'] as const) as s}
              <div class="flex items-center gap-2">
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  style="background:{SIAGA_COLOR[s]}"
                ></span>
                <span class="text-[11px] text-ink-muted">{siagaLabel(s)}</span>
                <span class="ml-auto font-mono text-[11px] font-semibold text-ink-strong">
                  {$statusCounts[s] ?? 0}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </Panel>

      <!-- Active alerts -->
      <Panel
        title="Peringatan Aktif"
        subtitle="{$activeAlerts.length} kejadian"
        icon={TriangleAlert}
        accent
        bodyClass="overflow-hidden"
      >
        <div class="h-[240px]">
          <AlertPanel max={8} />
        </div>
      </Panel>
    </div>
  </div>

  <!-- Earthquake feed -->
  <Panel title="Info Gempa (BMKG)" subtitle="Gempa terkini di wilayah DIY dan sekitarnya" icon={Waves}>
    {#if quakes.length === 0}
      <p class="py-3 text-center text-[11px] text-ink-dim">Tidak ada data gempa.</p>
    {:else}
      <div class="flex flex-col divide-y divide-line">
        {#each quakes as q (q.id)}
          <div class="flex items-center gap-3 py-2.5">
            <!-- Magnitude badge -->
            <div
              class="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg text-center"
              style="background:{q.mag >= 5 ? SIAGA_COLOR.awas : q.mag >= 4 ? SIAGA_COLOR.siaga : q.mag >= 3 ? SIAGA_COLOR.waspada : SIAGA_COLOR.normal}22;border:1px solid {q.mag >= 5 ? SIAGA_COLOR.awas : q.mag >= 4 ? SIAGA_COLOR.siaga : q.mag >= 3 ? SIAGA_COLOR.waspada : SIAGA_COLOR.normal}55"
            >
              <span
                class="font-mono text-[13px] font-bold leading-none"
                style="color:{q.mag >= 5 ? SIAGA_COLOR.awas : q.mag >= 4 ? SIAGA_COLOR.siaga : q.mag >= 3 ? SIAGA_COLOR.waspada : SIAGA_COLOR.normal}"
              >
                M{num(q.mag, 1)}
              </span>
              <span class="mt-0.5 text-[8.5px] text-ink-dim">{q.depthKm} km</span>
            </div>

            <!-- Location + time -->
            <div class="min-w-0 flex-1">
              <p class="truncate text-[12px] font-medium text-ink-strong">{q.lokasi}</p>
              <p class="text-[10.5px] text-ink-dim">Kedalaman {q.depthKm} km</p>
            </div>

            <!-- Time -->
            <div class="shrink-0 text-right">
              <p class="font-mono text-[11px] text-ink">{timeHM(q.t)}</p>
              <p class="text-[10px] text-ink-dim">{dateShort(q.t)}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Panel>
</div>
