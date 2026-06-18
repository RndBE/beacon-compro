<script lang="ts">
  import Monitor from '@lucide/svelte/icons/monitor';
  import UserRound from '@lucide/svelte/icons/user-round';
  import LogOut from '@lucide/svelte/icons/log-out';
  import Sun from '@lucide/svelte/icons/sun';
  import Moon from '@lucide/svelte/icons/moon';
  import { goto } from '$app/navigation';
  import Logo from './Logo.svelte';
  import Clock from '$lib/components/ews/ui/Clock.svelte';
  import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';
  import LogoutModal from '$lib/components/ews/ui/LogoutModal.svelte';
  import { overallStatus, activeAlerts } from '$lib/ews/stores';
  import { theme, toggleTheme } from '$lib/ews/theme';
  import { requestLogout } from '$lib/ews/auth';
</script>

<LogoutModal />

<header class="border-b border-line bg-surface/90 backdrop-blur">
  <div
    class="mx-auto flex w-full max-w-[1700px] items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4"
  >
    <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <Logo height={26} colored={$theme === 'light'} />
      <div class="min-w-0 leading-tight">
        <div class="hidden truncate text-[9px] font-semibold uppercase tracking-[0.26em] text-pu-bright sm:block">
          Pusat Kendali Operasi
        </div>
        <h1 class="truncate text-[13.5px] font-semibold tracking-tight text-ink-strong sm:text-[15px]">STESY Command Center</h1>
      </div>
    </div>

    <div class="ml-2 hidden items-center gap-2 md:flex">
      <StatusBadge status={$overallStatus} pulse={$overallStatus !== 'normal'} />
      <span class="text-[11px] text-ink-dim">
        {$activeAlerts.length} peringatan aktif
      </span>
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
      <span class="hidden items-center gap-1.5 lg:flex">
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-normal opacity-75"
          ></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-normal"></span>
        </span>
        <span class="text-[10px] font-semibold uppercase tracking-widest text-normal">Live</span>
      </span>

      <div class="hidden md:block">
        <Clock variant="full" />
      </div>

      <button
        onclick={toggleTheme}
        title={$theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
        class="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:bg-panel hover:text-ink-strong"
      >
        {#if $theme === 'dark'}<Sun size={14} />{:else}<Moon size={14} />{/if}
      </button>

      <button
        onclick={() => goto('/demo/ews/wall')}
        title="Mode Dinding"
        class="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:bg-panel hover:text-ink-strong"
      >
        <Monitor size={13} /> <span class="hidden sm:inline">Wall</span>
      </button>

      <div class="flex items-center gap-2 border-l border-line pl-3">
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-panel-2 text-ink-muted">
          <UserRound size={15} />
        </span>
        <button
          onclick={requestLogout}
          title="Keluar"
          class="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-awas/50 hover:bg-awas/10 hover:text-awas"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  </div>
</header>
