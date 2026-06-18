<script lang="ts">
  import Siren from '@lucide/svelte/icons/siren';
  import MessageSquare from '@lucide/svelte/icons/message-square';
  import Send from '@lucide/svelte/icons/send';
  import Bell from '@lucide/svelte/icons/bell';
  import Radio from '@lucide/svelte/icons/radio';
  import Users from '@lucide/svelte/icons/users';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Activity from '@lucide/svelte/icons/activity';

  import { data, activeAlerts } from '$lib/ews/stores';
  import { SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
  import { num, timeHM, dateShort } from '$lib/ews/format';
  import type { ChannelKind } from '$lib/ews/types';

  import Panel from '$lib/components/ews/ui/Panel.svelte';
  import KpiCard from '$lib/components/ews/ui/KpiCard.svelte';
  import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';

  const d = $derived($data);
  const alerts = $derived($activeAlerts);

  // --- KPI derived ---
  const totalSirens = $derived(d.sirens.length);
  const armedSirens = $derived(d.sirens.filter((s) => s.armed).length);
  const onlineChannels = $derived(d.channels.filter((c) => c.online).length);
  const totalReach = $derived(d.channels.filter((c) => c.online).reduce((s, c) => s + c.reach, 0));

  // --- channel icon map ---
  const CHANNEL_ICON: Record<ChannelKind, any> = {
    sirine: Siren,
    wa: MessageSquare,
    sms: Send,
    push: Bell,
    telegram: Radio,
  };

  const CHANNEL_COLOR: Record<ChannelKind, string> = {
    sirine: '#E08A3C',
    wa: '#25D366',
    sms: '#6B7DB3',
    push: '#A78BFA',
    telegram: '#29B6F6',
  };

  // --- broadcast log: derive channels per alert ---
  // For siaga/awas alerts: all online channels. For waspada: push+wa+telegram. For normal: none shown.
  function alertChannels(toLevel: string): string[] {
    const online = d.channels.filter((c) => c.online).map((c) => c.label);
    if (toLevel === 'awas' || toLevel === 'siaga') return online;
    if (toLevel === 'waspada') return d.channels.filter((c) => c.online && c.kind !== 'sirine').map((c) => c.label);
    return d.channels.filter((c) => c.online && (c.kind === 'push' || c.kind === 'wa')).map((c) => c.label);
  }

  // only show alerts with a meaningful dissemination (to != normal, or explicitly flagged)
  const logAlerts = $derived(alerts.filter((a) => a.to !== 'normal').slice(0, 20));
</script>

<div class="flex flex-col gap-3">
  <!-- KPI strip -->
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <KpiCard label="Sirine siap" value={String(armedSirens)} unit="dari {totalSirens}" icon={Siren} accent>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">
          {#if armedSirens < totalSirens}
            <span style="color:{SIAGA_COLOR.waspada}">{totalSirens - armedSirens} nonaktif</span>
          {:else}
            semua siap
          {/if}
        </span>
      {/snippet}
    </KpiCard>

    <KpiCard label="Kanal online" value={String(onlineChannels)} unit="dari {d.channels.length}" icon={Activity}>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">
          {#if onlineChannels < d.channels.length}
            <span style="color:{SIAGA_COLOR.waspada}">{d.channels.length - onlineChannels} offline</span>
          {:else}
            semua terhubung
          {/if}
        </span>
      {/snippet}
    </KpiCard>

    <KpiCard label="Total jangkauan" value={num(totalReach, 0)} unit="penerima" icon={Users} />

    <KpiCard label="Log diseminasi" value={String(logAlerts.length)} unit="notifikasi" icon={ShieldCheck}>
      {#snippet footer()}
        <span class="text-[10px] text-ink-dim">sejak jam terakhir</span>
      {/snippet}
    </KpiCard>
  </div>

  <!-- Siren Network -->
  <Panel title="Jaringan Sirine" subtitle="{totalSirens} node · {armedSirens} siap" icon={Siren} flush>
    {#if d.sirens.length === 0}
      <p class="p-3.5 text-[11px] text-ink-dim">Tidak ada data sirine.</p>
    {:else}
      <div class="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 xl:grid-cols-3">
        {#each d.sirens as siren (siren.id)}
          <div class="bg-panel p-3.5">
            <div class="mb-2 flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-[12px] font-semibold text-ink-strong">{siren.nama}</p>
                <p class="truncate text-[10.5px] text-ink-dim">{siren.sungai}</p>
              </div>
              <StatusBadge status={siren.status} size="xs" />
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
                style="background:{siren.armed ? 'rgba(31,138,92,0.12)' : 'rgba(107,119,179,0.12)'}; color:{siren.armed ? '#1F8A5C' : '#6B7DB3'}"
              >
                <span class="h-1.5 w-1.5 rounded-full" style="background:currentColor"></span>
                {siren.armed ? 'Siap' : 'Nonaktif'}
              </span>
              <span class="text-[10px] text-ink-dim font-mono">
                Uji: {timeHM(siren.lastTest)} · {dateShort(siren.lastTest)}
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Panel>

  <!-- Notification Channels -->
  <Panel title="Kanal Notifikasi" subtitle="{d.channels.length} kanal · {onlineChannels} online" icon={Activity}>
    {#if d.channels.length === 0}
      <p class="text-[11px] text-ink-dim">Tidak ada data kanal.</p>
    {:else}
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {#each d.channels as ch (ch.kind)}
          {@const ChanIcon = CHANNEL_ICON[ch.kind]}
          {@const iconColor = CHANNEL_COLOR[ch.kind]}
          <div
            class="flex flex-col gap-2 rounded-lg border p-3 {ch.online
              ? 'border-line bg-surface'
              : 'border-line-soft bg-panel opacity-60'}"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-md"
                  style="background:{iconColor}18"
                >
                  <ChanIcon size={15} style="color:{iconColor}" strokeWidth={2} />
                </span>
                <span class="text-[12px] font-semibold text-ink-strong">{ch.label}</span>
              </div>
              <span
                class="inline-flex h-2 w-2 rounded-full"
                style="background:{ch.online ? '#1F8A5C' : '#6B7DB3'}"
                title={ch.online ? 'Online' : 'Offline'}
              ></span>
            </div>
            <div class="flex items-center justify-between text-[10.5px]">
              <span class="text-ink-dim">{ch.online ? 'Online' : 'Offline'}</span>
              <span class="font-mono font-semibold text-ink-strong">{num(ch.reach, 0)}</span>
            </div>
            <div class="text-[10px] text-ink-dim">penerima terdaftar</div>
          </div>
        {/each}
      </div>
    {/if}
  </Panel>

  <!-- Broadcast Log -->
  <Panel title="Log Diseminasi" subtitle="notifikasi terkirim · terbaru di atas" icon={ShieldCheck} flush>
    {#if logAlerts.length === 0}
      <p class="p-3.5 text-[11px] text-ink-dim">Belum ada notifikasi diseminasi.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-[12px]">
          <thead>
            <tr class="border-b border-line text-[10px] uppercase tracking-wide text-ink-dim">
              <th class="px-3.5 py-2 font-medium">Nama / Pesan</th>
              <th class="px-2 py-2 font-medium">Level</th>
              <th class="hidden px-2 py-2 font-medium sm:table-cell">Waktu</th>
              <th class="px-2 py-2 font-medium">Kanal</th>
            </tr>
          </thead>
          <tbody>
            {#each logAlerts as alert (alert.id)}
              {@const chans = alertChannels(alert.to)}
              <tr class="border-b border-line-soft transition-colors hover:bg-[var(--surface-hover)]">
                <td class="px-3.5 py-2.5">
                  <p class="font-medium text-ink-strong">{alert.nama}</p>
                  <p class="text-[10.5px] text-ink-dim leading-snug">{alert.pesan}</p>
                </td>
                <td class="px-2 py-2.5">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style="background:{SIAGA_COLOR[alert.to]}20; color:{SIAGA_COLOR[alert.to]}"
                  >
                    {siagaLabel(alert.to)}
                  </span>
                </td>
                <td class="hidden px-2 py-2.5 sm:table-cell">
                  <span class="font-mono text-ink-muted">{timeHM(alert.t)}</span>
                  <span class="text-[10px] text-ink-dim"> · {dateShort(alert.t)}</span>
                </td>
                <td class="px-2 py-2.5">
                  <div class="flex flex-wrap gap-1">
                    {#each chans as chanLabel (chanLabel)}
                      <span class="rounded bg-surface px-1.5 py-0.5 text-[9px] font-medium text-ink-muted border border-line">
                        {chanLabel}
                      </span>
                    {/each}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Panel>
</div>
