<script lang="ts">
  import Monitor from '@lucide/svelte/icons/monitor';
  import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
  import { goto } from '$app/navigation';
</script>

<div class="relative flex h-screen flex-col items-center justify-center overflow-hidden p-6 text-center">
  <div
    class="pointer-events-none absolute inset-0 opacity-50"
    style="background: radial-gradient(60% 50% at 50% -10%, color-mix(in oklab, var(--stesy-accent, #4a90c4) 18%, transparent), transparent 70%);"
  ></div>

  <div class="relative z-10 flex flex-col items-center gap-5">
    <span
      class="grid h-16 w-16 place-items-center rounded-2xl"
      style="border:1px solid rgba(74,144,196,0.3);background:rgba(10,14,22,0.6);color:#4a90c4;"
    >
      <Monitor size={30} />
    </span>
    <div class="max-w-[360px]">
      <h1 class="text-[17px] font-semibold tracking-tight text-ink-strong">Mode Layar Dinding</h1>
      <p class="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
        Mode Dinding memerlukan layar besar (≥ 1024px). Tampilan ini dirancang untuk monitor
        atau display besar dan tidak tersedia di perangkat mobile atau layar sempit.
      </p>
    </div>
    <button
      onclick={() => goto('/demo/ews/ringkasan')}
      class="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12.5px] font-semibold transition-colors"
      style="border-color:rgba(74,144,196,0.4);background:rgba(74,144,196,0.15);color:#4a90c4;"
    >
      <LayoutDashboard size={15} /> Buka Mode Interaktif
    </button>
  </div>
</div>
