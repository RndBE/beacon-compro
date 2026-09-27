<script lang="ts">
	import { onMount } from 'svelte';
	import { Box, Check, ChevronRight, MapPin } from '@lucide/svelte';
	import { LEAKS, WATER_COST, ZONE_BY_ID } from './data';
	import { live, useLive } from './live.svelte';
	import { EVENTS, burstLoss, fmtClock, fmtNum } from './sim';

	let { compact = false }: { compact?: boolean } = $props();
	onMount(() => useLive());

	const lk = LEAKS[0];
	let lost = $derived(burstLoss(live.h, true));
</script>

<div class="card pdam-spot" class:pdam-spot--compact={compact}>
	<div class="card-h" style="margin-bottom:10px">
		<span class="label">DETEKSI KEBOCORAN · {lk.id}</span>
		<span class="pill pill--danger" style="font-size:11px"><span class="status-dot alarm" style="width:7px;height:7px"></span>AWAS · {lk.confidence}%</span>
	</div>
	<div class="pdam-spot__title">JDU Ø{lk.diameter}" {lk.material} · Zona {ZONE_BY_ID[lk.zone].name}</div>
	<div class="pdam-spot__sub"><MapPin size={12} /> {lk.at.lat.toFixed(5)}, {lk.at.lng.toFixed(5)} · radius ±{lk.radius} m</div>

	<div class="pdam-spot__stats">
		<div><span>Estimasi</span><b>{fmtNum(lk.est, 1)}<small>L/s</small></b></div>
		<div><span>Hilang sejak {lk.since}</span><b>{fmtNum(lost)}<small>m³</small></b></div>
		<div><span>Biaya air</span><b>{fmtNum((lost * WATER_COST) / 1e6, 1)}<small>jt Rp</small></b></div>
	</div>

	{#if !compact}
		<ul class="pdam-spot__signals">
			{#each lk.signals as s (s)}
				<li>{s}</li>
			{/each}
		</ul>
	{/if}

	<ol class="pdam-steps">
		{#each EVENTS.slice(1) as e, i (e.label)}
			{@const last = i === EVENTS.length - 2}
			<li class:is-now={last}>
				<span class="pdam-steps__dot">{#if !last}<Check size={10} strokeWidth={3} />{/if}</span>
				<span class="pdam-steps__t">{fmtClock(e.h)}</span>
				<span class="pdam-steps__l">{e.label}</span>
			</li>
		{/each}
	</ol>

	<div class="pdam-spot__actions">
		<a class="demo-btn demo-btn--sm" href="/demo/pdam/kebocoran">Analisis <ChevronRight size={13} /></a>
		<a class="demo-btn demo-btn--sm" href="/demo/pdam/digital-twin?focus={lk.id}"><Box size={13} /> Twin 3D</a>
	</div>
</div>
