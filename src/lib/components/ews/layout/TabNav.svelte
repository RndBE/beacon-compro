<script lang="ts">
  import { page } from '$app/stores';
  import { NAV_ITEMS } from '$lib/ews/config/nav';
</script>

<nav class="border-b border-line bg-surface/60">
  <div
    class="mx-auto flex w-full max-w-[1700px] items-center gap-1 overflow-x-auto px-3 sm:px-4"
  >
    {#each NAV_ITEMS as item}
      {@const active = $page.url.pathname === item.href || $page.url.pathname.startsWith(item.href + '/')}
      <a
        href={item.href}
        class="group relative flex items-center gap-2 whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors {active
          ? 'text-accent-bright'
          : 'text-ink-muted hover:text-ink'}"
      >
        {item.label}
        {#if active}
          <span
            class="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
          ></span>
        {/if}
      </a>
    {/each}
  </div>
</nav>
