<script lang="ts">
  import { num } from '$lib/ews/format';

  interface Props {
    /** raw reading */
    value: number;
    /** maximum value (default 100); value/max drives the fill */
    max?: number;
    label?: string;
    sublabel?: string;
    color?: string;
    size?: number;
    digits?: number;
    unit?: string;
  }
  let {
    value,
    max = 100,
    label,
    sublabel,
    color = '#4f9bee',
    size = 96,
    digits = 0,
    unit = '%',
  }: Props = $props();

  const sw = 7;
  const r = $derived((size - sw) / 2);
  const c = $derived(2 * Math.PI * r);
  const pct = $derived(Math.max(0, Math.min(100, (value / max) * 100)));
  const dash = $derived((pct / 100) * c);
</script>

<div class="flex flex-col items-center gap-1.5">
  <div class="relative" style="width:{size}px;height:{size}px">
    <svg width={size} height={size} class="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        {r}
        fill="none"
        style="stroke:var(--line)"
        stroke-width={sw}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        {r}
        fill="none"
        stroke={color}
        stroke-width={sw}
        stroke-linecap="round"
        stroke-dasharray="{dash} {c}"
        style="transition:stroke-dasharray 0.6s cubic-bezier(0.22,1,0.36,1)"
      />
    </svg>
    <div
      class="absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <span class="font-mono text-[17px] font-semibold leading-none text-ink-strong">
        {num(value, digits)}<span class="text-[10px] text-ink-muted">{unit}</span>
      </span>
      {#if sublabel}
        <span class="mt-0.5 text-[9px] text-ink-dim">{sublabel}</span>
      {/if}
    </div>
  </div>
  {#if label}
    <span class="text-[10px] uppercase tracking-wide text-ink-muted">{label}</span>
  {/if}
</div>
