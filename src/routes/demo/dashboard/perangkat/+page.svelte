<script lang="ts">
	import { Cpu, Fan, DoorOpen, Wrench } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AlertFeed from '$lib/components/demo-dashboard/AlertFeed.svelte';
	import TelemetryHealth from '$lib/components/demo-dashboard/TelemetryHealth.svelte';
	import { PUMPS, PUMP_DETAILS } from '$lib/components/demo-dashboard/data';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';

	const flowLs = PUMPS.map((p) => Number(p.flow.match(/^(\d+) L\/s/)?.[1] ?? 0)).reduce((a, b) => a + b, 0);
	const pumps = PUMPS.filter((p) => PUMP_DETAILS[p.id].kind === 'Pompa');
	const avgLoad = Math.round(pumps.reduce((a, p) => a + PUMP_DETAILS[p.id].load, 0) / pumps.length);
	const label = (s: string) => (s === 'alarm' ? 'GANGGUAN' : s === 'warn' ? 'SIAGA' : 'OPERASIONAL');
	const nf = new Intl.NumberFormat('id-ID');
</script>

<svelte:head><title>Perangkat · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Perangkat" sub="Pompa, pintu air & status telemetri" icon={Cpu} />

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Unit operasional</span>
			<span class="demo-stat__v">5<small>/ 6</small></span>
			<span class="demo-stat__s" style="color:var(--amber)">1 lift pump siaga</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Total debit pompa</span>
			<span class="demo-stat__v">{nf.format(flowLs)}<small>L/s</small></span>
			<span class="demo-stat__s">4 pompa aktif</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Beban rata-rata</span>
			<span class="demo-stat__v">{avgLoad}<small>%</small></span>
			<span class="demo-stat__s">kapasitas terpasang</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">RTU online</span>
			<span class="demo-stat__v">42<small>/ 44</small></span>
			<span class="demo-stat__s">2 RTU dalam pemeliharaan</span>
		</div>
	</div>

	<div class="dev-grid">
		{#each PUMPS as p (p.id)}
			{@const d = PUMP_DETAILS[p.id]}
			<div class="card dev-card dev-card--{p.status}">
				<div class="dev-card__head">
					<span class="dev-card__icon" class:is-spin={d.kind === 'Pompa' && p.status === 'ok'}>
						{#if d.kind === 'Pompa'}<Fan size={20} />{:else}<DoorOpen size={20} />{/if}
					</span>
					<div class="dev-card__titles">
						<span class="dev-card__id">{p.id} · {d.kind}</span>
						<span class="dev-card__name">{p.name}</span>
					</div>
					<span class="pill pill--{p.status === 'warn' ? 'amber' : p.status === 'alarm' ? 'danger' : 'green'}" style="font-size:10px">{label(p.status)}</span>
				</div>
				<div class="dev-card__flow">
					{#if p.flow.startsWith('open')}
						<b>{p.flow.replace('open ', '')}</b><small>bukaan pintu</small>
					{:else}
						<b>{p.flow.split(' ')[0]}</b><small>L/s debit</small>
					{/if}
				</div>
				<div class="dev-card__load">
					<span>Beban</span>
					<i class="twin-bar" class:twin-bar--amber={d.load < 50 && d.kind === 'Pompa'}><i style="width:{d.load}%"></i></i>
					<b>{d.load}%</b>
				</div>
				<dl class="dev-card__meta">
					<div><dt>Daya</dt><dd>{d.power}</dd></div>
					<div><dt>Jam operasi</dt><dd>{d.hours ? nf.format(d.hours) + ' j' : '—'}</dd></div>
					<div><dt>Servis</dt><dd>{d.service}</dd></div>
				</dl>
				{#if p.status === 'warn'}
					<button class="demo-btn demo-btn--sm dev-card__cta" onclick={() => notify(`Tiket pemeliharaan ${p.id} dibuat (demo)`)}>
						<Wrench size={13} /> Buat tiket pemeliharaan
					</button>
				{/if}
			</div>
		{/each}
	</div>

	<div class="demo-grid-2" style="align-items:stretch">
		<TelemetryHealth />
		<AlertFeed />
	</div>
</div>
