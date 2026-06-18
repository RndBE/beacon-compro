<script lang="ts">
  import { onMount } from 'svelte';
  import Cctv from '@lucide/svelte/icons/cctv';
  import CameraTile from './CameraTile.svelte';
  import { CAMERAS } from '$lib/ews/data/cameras';

  const PER_PAGE = 4;
  let idx = $state(0);

  // Jendela 4 kamera, berputar (wrap-around) tiap 8 detik
  const view = $derived(
    Array.from({ length: PER_PAGE }, (_, i) => CAMERAS[(idx + i) % CAMERAS.length]),
  );

  onMount(() => {
    const t = setInterval(() => {
      idx = (idx + PER_PAGE) % CAMERAS.length;
    }, 8000);
    return () => clearInterval(t);
  });
</script>

<section class="glass hud-bracket flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
  <!-- Header -->
  <div class="flex items-center gap-2 border-b border-line/50 px-3 py-2">
    <Cctv size={13} class="text-accent" strokeWidth={2} />
    <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">CCTV</span>
    <span class="ml-auto flex items-center gap-1.5 text-[9.5px] font-medium text-ink-muted">
      <span class="h-1.5 w-1.5 rounded-full bg-normal"></span>
      {CAMERAS.length} kamera
    </span>
  </div>

  <!-- Grid 2×2 -->
  <div class="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5 p-2">
    {#each view as cam (cam.id)}
      <CameraTile {cam} compact fill />
    {/each}
  </div>
</section>
