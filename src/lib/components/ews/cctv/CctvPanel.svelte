<script lang="ts">
  import { onMount } from 'svelte';
  import Cctv from '@lucide/svelte/icons/cctv';
  import Panel from '$lib/components/ews/ui/Panel.svelte';
  import CameraTile from './CameraTile.svelte';
  import { CAMERAS, type CameraGrup } from '$lib/ews/data/cameras';

  interface Props {
    /** filter kamera per grup; kosong = semua */
    grup?: CameraGrup;
    title?: string;
  }
  let { grup, title = 'CCTV' }: Props = $props();

  const PER_PAGE = 4;
  let idx = $state(0);

  const cams = $derived.by(() =>
    grup ? CAMERAS.filter((c) => c.grup === grup) : CAMERAS,
  );

  // Jendela 4 kamera, berputar tiap 8 detik
  const view = $derived(
    Array.from({ length: PER_PAGE }, (_, i) => cams[(idx + i) % cams.length]),
  );

  onMount(() => {
    const t = setInterval(() => {
      if (cams.length > 0) idx = (idx + PER_PAGE) % cams.length;
    }, 8000);
    return () => clearInterval(t);
  });
</script>

<Panel {title} subtitle="{cams.length} kamera" icon={Cctv} flush>
  <div class="grid grid-cols-2 gap-2 p-3">
    {#each view as cam (cam.id)}
      <CameraTile {cam} />
    {/each}
  </div>
</Panel>
