<script lang="ts">
  import Waves from '@lucide/svelte/icons/waves';
  import CloudRain from '@lucide/svelte/icons/cloud-rain';
  import Activity from '@lucide/svelte/icons/activity';
  import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

  import { goto } from '$app/navigation';
  import { data } from '$lib/ews/stores';
  import { SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
  import { num, fmtUnit } from '$lib/ews/format';
  import { riseRatePerHour } from '$lib/ews/series';
  import { etaToNextSiagaHours } from '$lib/ews/derive';
  import type { Pos, Siaga } from '$lib/ews/types';

  import Panel from '$lib/components/ews/ui/Panel.svelte';
  import KpiCard from '$lib/components/ews/ui/KpiCard.svelte';
  import InstrumentCard from '$lib/components/ews/panels/InstrumentCard.svelte';

  const d = $derived($data);

  // --- grouped stations ---
  const tmaPos = $derived(d.pos.filter((p) => p.kind === 'tma'));
  const arrPos = $derived(d.pos.filter((p) => p.kind === 'arr'));

  // --- KPI summary strip ---
  const siagaCounts = $derived.by(() => {
    const c: Record<Siaga, number> = { normal: 0, waspada: 0, siaga: 0, awas: 0 };
    for (const p of d.pos) c[p.status] += 1;
    return c;
  });

  const tmaMax = $derived(
    tmaPos.length
      ? [...tmaPos].sort((a, b) => b.value - a.value)[0]
      : null,
  );

  const arrMax = $derived(
    arrPos.length
      ? [...arrPos].sort((a, b) => b.value - a.value)[0]
      : null,
  );

  const aktif = $derived(d.pos.filter((p) => p.status !== 'normal').length);

  // --- per-card helpers ---
  function riseLabel(pos: Pos): string {
    const r = riseRatePerHour(pos.history);
    if (Math.abs(r) < 0.001) return 'stabil';
    const sign = r > 0 ? '+' : '−';
    return `${sign}${num(Math.abs(r), 2)} ${pos.unit}/jam`;
  }

  function etaInfo(pos: Pos): { label: string; level: Siaga | undefined } {
    const eta = etaToNextSiagaHours(pos.value, pos.thresholds, pos.history);
    if (eta === null) return { label: '—', level: undefined };
    const nextStatus: Siaga =
      pos.value < pos.thresholds.waspada
        ? 'waspada'
        : pos.value < pos.thresholds.siaga
          ? 'siaga'
          : 'awas';
    return { label: `≈ ${num(eta, 1)} jam menuju ${siagaLabel(nextStatus)}`, level: nextStatus };
  }

  const SIAGA_LEVELS: Siaga[] = ['awas', 'siaga', 'waspada', 'normal'];
  // Only awas/siaga/waspada count as critical — normal is excluded
  const CRITICAL_LEVELS: Siaga[] = ['awas', 'siaga', 'waspada'];
</script>

<div class="flex flex-col gap-3">
  <!-- KPI strip -->
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <KpiCard label="Pos dipantau" value={String(d.pos.length)} unit="pos" icon={Activity}>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">
          {#if aktif}
            <span style="color:{SIAGA_COLOR.waspada}">{aktif}</span> di atas normal
          {:else}
            semua normal
          {/if}
        </span>
      {/snippet}
    </KpiCard>

    <KpiCard
      label="TMA tertinggi"
      value={tmaMax ? num(tmaMax.value, 2) : '—'}
      unit={tmaMax?.unit ?? 'm'}
      icon={Waves}
      accent
    >
      {#snippet footer()}
        <span class="truncate text-[10px] text-ink-dim">
          {tmaMax ? tmaMax.nama : '—'} · {tmaPos.length} pos
        </span>
      {/snippet}
    </KpiCard>

    <KpiCard
      label="Curah hujan tertinggi"
      value={arrMax ? num(arrMax.value, 1) : '—'}
      unit={arrMax?.unit ?? 'mm'}
      icon={CloudRain}
    >
      {#snippet footer()}
        <span class="truncate text-[10px] text-ink-dim">
          {arrMax ? arrMax.nama : '—'} · {arrPos.length} pos
        </span>
      {/snippet}
    </KpiCard>

    <KpiCard label="Status kritis" value={String(siagaCounts.awas + siagaCounts.siaga)} unit="pos" icon={AlertTriangle}>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">
          {#each CRITICAL_LEVELS.filter((s) => siagaCounts[s] > 0) as s}
            <span style="color:{SIAGA_COLOR[s]}">{siagaLabel(s)}: {siagaCounts[s]}</span>
            {' '}
          {/each}
        </span>
      {/snippet}
    </KpiCard>
  </div>

  <!-- TMA section -->
  <Panel title="Tinggi Muka Air (TMA)" subtitle="{tmaPos.length} pos duga air · klik untuk detail" icon={Waves} flush>
    {#if tmaPos.length === 0}
      <p class="p-3.5 text-[11px] text-ink-dim">Tidak ada data pos TMA.</p>
    {:else}
      <div class="grid grid-cols-1 gap-2.5 p-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {#each [...tmaPos].sort((a, b) => {
          const order: Record<Siaga, number> = { awas: 3, siaga: 2, waspada: 1, normal: 0 };
          return order[b.status] - order[a.status];
        }) as pos (pos.id)}
          {@const ei = etaInfo(pos)}
          <InstrumentCard
            {pos}
            riseRateLabel={riseLabel(pos)}
            etaLabel={ei.label}
            etaLevel={ei.level}
            onclick={() => goto('/demo/ews/pos/' + pos.id)}
          />
        {/each}
      </div>
    {/if}
  </Panel>

  <!-- ARR / Curah Hujan section -->
  <Panel title="Curah Hujan (ARR)" subtitle="{arrPos.length} pos penakar hujan · klik untuk detail" icon={CloudRain} flush>
    {#if arrPos.length === 0}
      <p class="p-3.5 text-[11px] text-ink-dim">Tidak ada data pos curah hujan.</p>
    {:else}
      <div class="grid grid-cols-1 gap-2.5 p-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {#each [...arrPos].sort((a, b) => b.value - a.value) as pos (pos.id)}
          {@const ei = etaInfo(pos)}
          <InstrumentCard
            {pos}
            riseRateLabel={riseLabel(pos)}
            etaLabel={ei.label}
            etaLevel={ei.level}
            onclick={() => goto('/demo/ews/pos/' + pos.id)}
          />
        {/each}
      </div>
    {/if}
  </Panel>
</div>
