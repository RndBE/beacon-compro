<script lang="ts">
  import { onMount } from 'svelte';
  import WallView from '$lib/components/ews/views/WallView.svelte';
  import WallUnavailable from '$lib/components/ews/views/WallUnavailable.svelte';

  // Three-state: null = SSR/unknown, true = wide enough, false = too narrow
  let isWide = $state<boolean | null>(null);

  onMount(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    isWide = mq.matches;

    function onMqChange(e: MediaQueryListEvent) {
      isWide = e.matches;
    }
    mq.addEventListener('change', onMqChange);
    return () => mq.removeEventListener('change', onMqChange);
  });
</script>

<svelte:head>
  <title>STESY — Pusat Komando</title>
</svelte:head>

{#if isWide === null}
  <!-- SSR / before mount: render neutral dark placeholder to avoid flash -->
  <div class="min-h-screen" style="background:#0a0e16;"></div>
{:else if isWide}
  <WallView />
{:else}
  <WallUnavailable />
{/if}
