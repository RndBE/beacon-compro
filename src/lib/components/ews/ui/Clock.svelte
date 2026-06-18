<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    variant?: 'full' | 'big';
  }
  let { variant = 'full' }: Props = $props();

  let now = $state(Date.now());

  onMount(() => {
    const id = setInterval(() => { now = Date.now(); }, 1000);
    return () => clearInterval(id);
  });

  const dtWeekday = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
  const dtTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });

  const clockTime = $derived(dtTime.format(new Date(now)));
  const fullDate = $derived(dtWeekday.format(new Date(now)));
</script>

{#if variant === 'big'}
  <div class="text-right">
    <div class="font-mono text-2xl font-semibold leading-none text-ink-strong tnum">
      {clockTime}
    </div>
    <div class="mt-1 text-[11px] text-ink-muted">{fullDate}</div>
  </div>
{:else}
  <div class="flex items-center gap-2 text-[12px] text-ink-muted">
    <span class="text-ink-dim">⏱</span>
    <span>{fullDate}</span>
    <span class="text-ink-dim">·</span>
    <span class="font-mono font-medium text-ink tnum">{clockTime}</span>
  </div>
{/if}
