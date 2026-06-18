<script lang="ts">
  import { onMount } from 'svelte';
  import VideoOff from '@lucide/svelte/icons/video-off';
  import type { Camera } from '$lib/ews/data/cameras';

  interface Props {
    cam: Camera;
    /** ukuran ringkas untuk videowall */
    compact?: boolean;
    /** isi penuh sel induk (alih-alih memaksa rasio 16:9) — untuk grid wall */
    fill?: boolean;
  }
  let { cam, compact = false, fill = false }: Props = $props();

  let imgError = $state(false);

  // Jam live (diperbarui tiap detik, hanya di browser)
  let nowMs = $state(0);
  onMount(() => {
    nowMs = Date.now();
    const id = setInterval(() => { nowMs = Date.now(); }, 1000);
    return () => clearInterval(id);
  });

  const dtTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
  const clockLabel = $derived(dtTime.format(new Date(nowMs)));
</script>

<div class="group relative overflow-hidden rounded-lg border border-line bg-black {fill ? 'h-full w-full' : 'aspect-video'}">
  {#if !imgError}
    <img
      src={cam.src}
      alt={cam.nama}
      loading="lazy"
      class="h-full w-full object-cover"
      style="filter:contrast(1.06) saturate(0.9) brightness(0.95)"
      onerror={() => { imgError = true; }}
    />

    <!-- scanline + vignette -->
    <div
      class="pointer-events-none absolute inset-0"
      style="background:repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.07) 2px 3px); box-shadow:inset 0 0 60px rgba(0,0,0,0.55)"
    ></div>

    <!-- bar atas: nama + LIVE -->
    <div class="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/75 to-transparent px-2 {compact ? 'py-1' : 'py-1.5'}">
      <span class="truncate {compact ? 'text-[9.5px]' : 'text-[10.5px]'} font-medium text-white/90">{cam.nama}</span>
      <span class="flex shrink-0 items-center gap-1 text-[9px] font-semibold text-red-400">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></span>LIVE
      </span>
    </div>

    <!-- bar bawah: area + jam -->
    <div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-2 {compact ? 'py-1' : 'py-1.5'} font-mono text-[9px] text-white/80 tnum">
      <span class="truncate">{cam.area}</span>
      <span class="shrink-0">{clockLabel}</span>
    </div>
  {:else}
    <!-- fallback: gambar gagal dimuat -->
    <div
      class="flex h-full w-full flex-col items-center justify-center gap-1.5 text-ink-dim"
      style="background:#0b0f17; background-image:repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 6px, transparent 6px 12px)"
    >
      <VideoOff size={compact ? 16 : 22} strokeWidth={1.8} />
      <span class="text-[10px] font-semibold uppercase tracking-wide">Sinyal hilang</span>
      {#if !compact}<span class="px-2 text-center text-[9px] text-ink-dim/70">{cam.nama}</span>{/if}
    </div>
  {/if}
</div>
