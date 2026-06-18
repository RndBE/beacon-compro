<script lang="ts">
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';

  import { activeAlerts } from '$lib/ews/stores';
  import { SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
  import { timeHM } from '$lib/ews/format';
  import type { AlertItem } from '$lib/ews/types';

  interface Props {
    max?: number;
    /** Opsional: umpan alert dari luar (default: $activeAlerts) */
    items?: AlertItem[];
  }
  let { max = 12, items }: Props = $props();

  const feed = $derived((items ?? $activeAlerts).slice(0, max));
</script>

<div class="flex h-full flex-col gap-1.5 overflow-y-auto pr-0.5">
  {#if feed.length === 0}
    <div class="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
      <ShieldCheck size={28} class="text-normal" strokeWidth={1.6} />
      <p class="text-[12px] text-ink-muted">Tidak ada peringatan aktif</p>
      <p class="text-[10.5px] text-ink-dim">Seluruh pos dalam kondisi normal</p>
    </div>
  {:else}
    {#each feed as a (a.id)}
      {@const color = SIAGA_COLOR[a.to]}
      <div
        class="flex items-start gap-2.5 rounded-lg border px-2.5 py-2"
        style="border-color:{color}44;background:{color}0f"
      >
        <TriangleAlert
          size={15}
          strokeWidth={2}
          style="color:{color}"
          class="mt-0.5 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span
              class="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style="background:{color};color:#0a0f1c"
            >
              {siagaLabel(a.to)}
            </span>
            <span class="truncate text-[11.5px] font-medium text-ink-strong">{a.nama}</span>
          </div>
          <p class="mt-0.5 text-[11px] leading-snug text-ink">{a.pesan}</p>
          <p class="mt-0.5 text-[10px] text-ink-dim">{timeHM(a.t)}</p>
        </div>
      </div>
    {/each}
  {/if}
</div>
