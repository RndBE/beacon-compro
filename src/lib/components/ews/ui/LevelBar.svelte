<script lang="ts">
  import type { Thresholds } from '$lib/ews/types';
  import { SIAGA_COLOR } from '$lib/ews/status';

  interface Props {
    value: number;
    min?: number;
    max?: number;
    /** optional siaga thresholds — generates waspada/siaga/awas markers */
    thresholds?: Thresholds;
    color?: string;
    height?: number;
  }
  let {
    value,
    min = 0,
    max,
    thresholds,
    color,
    height = 10,
  }: Props = $props();

  // Derive max from thresholds if not provided
  const effectiveMax = $derived(
    max != null
      ? max
      : thresholds
        ? thresholds.awas * 1.2
        : Math.max(value * 1.2, 1),
  );

  // Derive color from siaga status based on thresholds
  const effectiveColor = $derived.by(() => {
    if (color) return color;
    if (!thresholds) return SIAGA_COLOR.normal;
    if (value >= thresholds.awas) return SIAGA_COLOR.awas;
    if (value >= thresholds.siaga) return SIAGA_COLOR.siaga;
    if (value >= thresholds.waspada) return SIAGA_COLOR.waspada;
    return SIAGA_COLOR.normal;
  });

  // Build markers from thresholds
  const markers = $derived.by(() => {
    if (!thresholds) return [];
    return [
      { value: thresholds.waspada, color: SIAGA_COLOR.waspada, label: 'Waspada' },
      { value: thresholds.siaga, color: SIAGA_COLOR.siaga, label: 'Siaga' },
      { value: thresholds.awas, color: SIAGA_COLOR.awas, label: 'Awas' },
    ].filter((m) => m.value > 0);
  });

  const effectiveMin = $derived(min);

  const pos = (v: number) =>
    `${Math.max(0, Math.min(100, ((v - effectiveMin) / (effectiveMax - effectiveMin || 1)) * 100))}%`;
</script>

<div class="w-full">
  <div
    class="relative w-full overflow-visible rounded-full bg-panel-2 ring-1 ring-line"
    style="height:{height}px"
  >
    <div
      class="absolute inset-y-0 left-0 rounded-full"
      style="width:{pos(value)};background:linear-gradient(90deg,{effectiveColor}55,{effectiveColor});transition:width 0.6s cubic-bezier(0.22,1,0.36,1)"
    ></div>
    {#each markers as m}
      <div
        class="absolute top-1/2 -translate-y-1/2"
        style="left:{pos(m.value)}"
        title={m.label}
      >
        <div class="h-[14px] w-0.5 -translate-x-1/2" style="background:{m.color}"></div>
      </div>
    {/each}
  </div>
  {#if markers.length}
    <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
      {#each markers as m}
        <span class="flex items-center gap-1 text-[9px] text-ink-dim">
          <span class="h-2 w-0.5" style="background:{m.color}"></span>{m.label}
        </span>
      {/each}
    </div>
  {/if}
</div>
