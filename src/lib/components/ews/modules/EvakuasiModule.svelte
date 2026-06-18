<script lang="ts">
  import Users from '@lucide/svelte/icons/users';
  import Home from '@lucide/svelte/icons/home';
  import Tent from '@lucide/svelte/icons/tent';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Waves from '@lucide/svelte/icons/waves';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';

  import Panel from '$lib/components/ews/ui/Panel.svelte';
  import KpiCard from '$lib/components/ews/ui/KpiCard.svelte';
  import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';
  import LevelBar from '$lib/components/ews/ui/LevelBar.svelte';
  import Gauge from '$lib/components/ews/ui/Gauge.svelte';
  import BasinMap from '$lib/components/ews/map/BasinMap.svelte';

  import { data, markers } from '$lib/ews/stores';
  import { siagaRank } from '$lib/ews/status';
  import { num } from '$lib/ews/format';
  import { goto } from '$app/navigation';
  import type { Shelter } from '$lib/ews/types';

  const d = $derived($data);
  const m = $derived($markers);

  // ── Wilayah Terdampak ────────────────────────────────────────────
  const areas = $derived(
    [...d.areas].sort((a, b) => siagaRank(b.status) - siagaRank(a.status)),
  );
  const totalKK = $derived(d.areas.reduce((s, a) => s + a.terdampakKK, 0));
  const totalJiwa = $derived(d.areas.reduce((s, a) => s + a.jiwa, 0));

  // ── Tempat Pengungsian ────────────────────────────────────────────
  const fillRatio = (sh: Shelter) => (sh.kapasitas > 0 ? sh.terisi / sh.kapasitas : 0);
  const shelters = $derived([...d.shelters].sort((a, b) => fillRatio(b) - fillRatio(a)));
  const totalKapasitas = $derived(d.shelters.reduce((s, sh) => s + sh.kapasitas, 0));
  const totalTerisi = $derived(d.shelters.reduce((s, sh) => s + sh.terisi, 0));
  const nearFullCount = $derived(d.shelters.filter((sh) => fillRatio(sh) > 0.9).length);

  // ── Peta Evakuasi ─────────────────────────────────────────────────
  const evakMarkers = $derived(m.filter((mk) => mk.kind === 'shelter' || mk.kind === 'op'));

  // ── Aset O&P ──────────────────────────────────────────────────────
  const pompa = $derived(d.op.filter((a) => a.jenis === 'pompa'));
  const tanggul = $derived(d.op.filter((a) => a.jenis === 'tanggul'));
  const opTotal = $derived(d.op.length);
  const opAktif = $derived(d.op.filter((a) => a.operasional).length);
</script>

<div class="flex flex-col gap-3">

  <!-- ── KPI row ──────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <KpiCard label="KK terdampak" value={num(totalKK, 0)} unit="KK" icon={Home} accent />
    <KpiCard label="Jiwa terdampak" value={num(totalJiwa, 0)} unit="jiwa" icon={Users} />
    <KpiCard label="Kapasitas pengungsian" value="{num(totalTerisi, 0)} / {num(totalKapasitas, 0)}" unit="jiwa" icon={Tent} />
    <KpiCard label="Aset operasional" value="{opAktif} / {opTotal}" unit="unit" icon={Wrench} />
  </div>

  <!-- ── Wilayah Terdampak ─────────────────────────────────────────── -->
  <Panel title="Wilayah Terdampak" subtitle="{areas.length} wilayah — {num(totalJiwa, 0)} jiwa" icon={AlertTriangle} flush>
    <div class="divide-y divide-line-soft">
      {#each areas as area (area.id)}
        <div class="flex w-full items-center gap-4 px-3.5 py-2.5">
          <div class="min-w-0 flex-1">
            <div class="truncate text-[12.5px] font-medium text-ink-strong">{area.nama}</div>
            <div class="text-[10px] text-ink-dim">
              {num(area.terdampakKK, 0)} KK &middot; {num(area.jiwa, 0)} jiwa
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <div class="text-right">
              <div class="font-mono text-[13px] font-semibold text-ink-strong tnum">{num(area.jiwa, 0)}</div>
              <div class="text-[9px] text-ink-dim">jiwa</div>
            </div>
            <StatusBadge status={area.status} size="xs" />
          </div>
        </div>
      {/each}
    </div>
  </Panel>

  <!-- ── Tempat Pengungsian ─────────────────────────────────────────── -->
  <Panel
    title="Tempat Pengungsian"
    subtitle="{shelters.length} lokasi{nearFullCount > 0 ? ` — ${nearFullCount} hampir penuh` : ''}"
    icon={Tent}
    flush
  >
    <div class="divide-y divide-line-soft">
      {#each shelters as sh (sh.id)}
        {@const pct = sh.kapasitas > 0 ? (sh.terisi / sh.kapasitas) * 100 : 0}
        {@const nearFull = pct > 90}
        <div class="flex w-full items-center gap-4 px-3.5 py-2.5">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="truncate text-[12.5px] font-medium text-ink-strong">{sh.nama}</span>
              {#if nearFull}
                <span class="shrink-0 rounded-full bg-awas/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-awas">Hampir Penuh</span>
              {/if}
            </div>
            <div class="text-[10px] text-ink-dim">{sh.lokasi}</div>
            <div class="mt-1.5">
              <LevelBar
                value={sh.terisi}
                min={0}
                max={sh.kapasitas}
                color={nearFull ? '#B5322C' : '#1F8A5C'}
                height={6}
              />
            </div>
          </div>
          <div class="shrink-0 text-right">
            <div class="font-mono text-[13px] font-semibold text-ink-strong tnum">{num(Math.min(pct, 100), 0)}%</div>
            <div class="text-[9px] text-ink-dim">{num(sh.terisi, 0)} / {num(sh.kapasitas, 0)} jiwa</div>
          </div>
        </div>
      {/each}
    </div>
  </Panel>

  <!-- ── Peta Evakuasi ─────────────────────────────────────────────── -->
  <Panel title="Peta Evakuasi" subtitle="Shelter & aset O&P" icon={MapPin}>
    <div class="h-80 overflow-hidden rounded-lg">
      <BasinMap
        markers={evakMarkers}
        hiddenKinds={['pos', 'longsor', 'sirine']}
        onMarkerClick={(mk) => goto('/demo/ews/' + mk.kind + '/' + mk.id)}
      />
    </div>
  </Panel>

  <!-- ── Aset O&P ──────────────────────────────────────────────────── -->
  {#if pompa.length > 0}
    <Panel title="Aset Pompa" subtitle="{pompa.filter((a) => a.operasional).length} / {pompa.length} operasional" icon={Waves} flush>
      <div class="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
        {#each pompa as a (a.id)}
          {@const condColor = a.kondisi >= 70 ? '#1F8A5C' : a.kondisi >= 40 ? '#C77A1B' : '#B5322C'}
          <div class="flex flex-col gap-2 bg-panel p-3.5">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[12.5px] font-medium text-ink-strong">{a.nama}</div>
                <div class="text-[10px] text-ink-dim capitalize">{a.jenis}</div>
              </div>
              <span class="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide
                {a.operasional
                  ? 'bg-normal/12 text-normal border border-normal/30'
                  : 'bg-waspada/12 text-waspada border border-waspada/30'}">
                {a.operasional ? 'Operasional' : 'Nonaktif'}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <Gauge value={a.kondisi} label="Kondisi" size={74} color={condColor} />
              <div class="flex-1 space-y-1 text-[11px]">
                <div class="flex justify-between">
                  <span class="text-ink-dim">Kondisi</span>
                  <span class="font-mono text-ink-strong">{num(a.kondisi, 0)}%</span>
                </div>
                <LevelBar value={a.kondisi} min={0} max={100} color={condColor} height={6} />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </Panel>
  {/if}

  {#if tanggul.length > 0}
    <Panel title="Aset Tanggul" subtitle="{tanggul.filter((a) => a.operasional).length} / {tanggul.length} operasional" icon={Wrench} flush>
      <div class="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
        {#each tanggul as a (a.id)}
          {@const condColor = a.kondisi >= 70 ? '#1F8A5C' : a.kondisi >= 40 ? '#C77A1B' : '#B5322C'}
          <div class="flex flex-col gap-2 bg-panel p-3.5">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[12.5px] font-medium text-ink-strong">{a.nama}</div>
                <div class="text-[10px] text-ink-dim capitalize">{a.jenis}</div>
              </div>
              <span class="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide
                {a.operasional
                  ? 'bg-normal/12 text-normal border border-normal/30'
                  : 'bg-waspada/12 text-waspada border border-waspada/30'}">
                {a.operasional ? 'Operasional' : 'Nonaktif'}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <Gauge value={a.kondisi} label="Kondisi" size={74} color={condColor} />
              <div class="flex-1 space-y-1 text-[11px]">
                <div class="flex justify-between">
                  <span class="text-ink-dim">Kondisi</span>
                  <span class="font-mono text-ink-strong">{num(a.kondisi, 0)}%</span>
                </div>
                <LevelBar value={a.kondisi} min={0} max={100} color={condColor} height={6} />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </Panel>
  {/if}

</div>
