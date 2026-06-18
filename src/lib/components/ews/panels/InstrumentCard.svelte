<script lang="ts">
  import type { Pos, Siaga } from '$lib/ews/types';
  import { SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
  import { fmtUnit } from '$lib/ews/format';
  import Sparkline from '$lib/components/ews/ui/Sparkline.svelte';
  import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';
  import LevelBar from '$lib/components/ews/ui/LevelBar.svelte';

  interface Props {
    pos: Pos;
    /** rise rate string already formatted, e.g. "+0,18 m/jam" */
    riseRateLabel?: string;
    /** ETA label, e.g. "≈ 2,0 jam menuju Siaga" or "—" */
    etaLabel?: string;
    /** The Siaga level the station is approaching (for ETA pill color) */
    etaLevel?: Siaga;
    onclick?: () => void;
  }
  let { pos, riseRateLabel, etaLabel, etaLevel, onclick }: Props = $props();

  const color = $derived(SIAGA_COLOR[pos.status]);
  const sparkPoints = $derived(pos.history.map((p) => p.v));
  const isBars = $derived(pos.kind === 'arr');

  // Safe ETA label — undefined behaves like '—' so the stabil fallback always renders
  const eta = $derived(etaLabel ?? '—');
  // ETA pill color: use approaching level when provided, else fall back to waspada/accent
  const etaPillColor = $derived(etaLevel ? SIAGA_COLOR[etaLevel] : SIAGA_COLOR.waspada);
</script>

<svelte:element
  this={onclick ? 'button' : 'div'}
  {onclick}
  role={onclick ? 'button' : undefined}
  class="flex w-full flex-col gap-2.5 rounded-xl border border-line bg-panel p-3 text-left transition-colors
    {onclick ? 'cursor-pointer hover:border-accent/40 hover:bg-surface' : ''}"
>
  <!-- Header row: name + badge -->
  <div class="flex items-start justify-between gap-2">
    <div class="min-w-0">
      <div class="truncate text-[12.5px] font-semibold text-ink-strong">{pos.nama}</div>
      <div class="truncate text-[10px] text-ink-dim">{pos.sungai}</div>
    </div>
    <StatusBadge status={pos.status} size="xs" />
  </div>

  <!-- Value + sparkline row -->
  <div class="flex items-end justify-between gap-2">
    <div>
      <div
        class="font-mono text-[20px] font-semibold leading-none tnum"
        style="color:{color}"
      >
        {fmtUnit(pos.value, pos.unit)}
      </div>
      {#if riseRateLabel}
        <div class="mt-0.5 text-[10px] text-ink-dim">{riseRateLabel}</div>
      {/if}
    </div>
    <div class="h-10 w-24 shrink-0">
      <Sparkline points={sparkPoints} {color} height={40} bars={isBars} dot={!isBars} />
    </div>
  </div>

  <!-- Level bar (Siaga ladder) -->
  <LevelBar value={pos.value} thresholds={pos.thresholds} height={8} />

  <!-- ETA to next Siaga — headline feature -->
  {#if eta !== '—'}
    <div
      class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10.5px] font-medium"
      style="border: 1px solid {etaPillColor}4d; background: {etaPillColor}14; color: {etaPillColor};"
    >
      <span class="h-1.5 w-1.5 shrink-0 rounded-full" style="background: {etaPillColor};"></span>
      {eta}
    </div>
  {:else}
    <div class="text-[10px] text-ink-dim">stabil</div>
  {/if}
</svelte:element>
