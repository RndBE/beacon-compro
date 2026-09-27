<script lang="ts">
	import { onMount } from 'svelte';
	import { Droplets, Scale, Radar, Gauge, Radio } from '@lucide/svelte';
	import { ASSETS, COMPLETENESS_AVG, LEAKS, UARL, WATER_COST } from './data';
	import { live, useLive } from './live.svelte';
	import { burstLoss, fmtNum, noise, readAsset, systemBalance, systemFlow } from './sim';

	let flickerOn = $state(true);
	onMount(() => {
		const stop = useLive();
		const id = setInterval(() => (flickerOn = !flickerOn), 1800);
		return () => (stop(), clearInterval(id));
	});

	const CAPACITY = 1050; // installed production + bulk contract, L/s
	const bal = systemBalance();
	const ili = bal.real / UARL;
	const watch = LEAKS.filter((l) => l.status !== 'verifikasi' && l.status !== 'selesai').length;

	let flow = $derived(systemFlow(live.h, true) * (1 + 0.004 * noise('sys', live.tick)));
	let critical = $derived(
		ASSETS.filter((a) => a.type === 'PT')
			.map((a) => ({ a, p: readAsset(a, live.h, true).p1! }))
			.sort((x, y) => x.p - y.p)[0]
	);
	let lost = $derived(burstLoss(live.h, true));
</script>

<div class="cc-kpis">
	<div class="cc-kpi">
		<span class="cc-kpi__icon"><Droplets size={16} /></span>
		<span class="cc-kpi__label">Debit Masuk Sistem</span>
		<span class="cc-kpi__value">{fmtNum(flow)}<small>L/s</small></span>
		<span class="cc-kpi__delta">≈ {fmtNum((flow * 86.4) / 1000, 1)} rb m³/hari · 7 zona</span>
		<span class="cc-kpi__meter"><i style="width:{Math.min(100, (flow / CAPACITY) * 100)}%"></i></span>
	</div>
	<div class="cc-kpi cc-kpi--warn">
		<span class="cc-kpi__icon"><Scale size={16} /></span>
		<span class="cc-kpi__label">NRW · 30 Hari</span>
		<span class="cc-kpi__value">{fmtNum(bal.pct * 100, 1)}<small>%</small></span>
		<span class="cc-kpi__delta cc-kpi__delta--up">▼ 1,8 poin vs bulan lalu · ILI {fmtNum(ili, 1)}</span>
		<span class="cc-kpi__meter"><i style="width:{bal.pct * 100 * 2}%"></i></span>
	</div>
	<div class="cc-kpi cc-kpi--danger">
		<span class="cc-kpi__icon"><Radar size={16} /></span>
		<span class="cc-kpi__label">Kebocoran Aktif</span>
		<span class="cc-kpi__value"
			><span style="opacity:{flickerOn ? 1 : 0.55};transition:opacity .2s">1</span><small>+{watch} dipantau</small></span
		>
		<span class="cc-kpi__delta cc-kpi__delta--down">LK-01 · {fmtNum(lost)} m³ · Rp {fmtNum((lost * WATER_COST) / 1e6, 1)} jt</span>
		<span class="cc-kpi__meter"><i style="width:100%"></i></span>
	</div>
	<div class="cc-kpi" class:cc-kpi--warn={critical.p < 0.7} class:cc-kpi--ok={critical.p >= 0.7}>
		<span class="cc-kpi__icon"><Gauge size={16} /></span>
		<span class="cc-kpi__label">Tekanan Kritis Terendah</span>
		<span class="cc-kpi__value">{fmtNum(critical.p, 2)}<small>bar</small></span>
		<span class="cc-kpi__delta" class:cc-kpi__delta--down={critical.p < 0.7}>{critical.a.id} · batas layanan 0,7 bar</span>
		<span class="cc-kpi__meter"><i style="width:{Math.min(100, (critical.p / 2) * 100)}%"></i></span>
	</div>
	<div class="cc-kpi cc-kpi--ok">
		<span class="cc-kpi__icon"><Radio size={16} /></span>
		<span class="cc-kpi__label">Logger Online</span>
		<span class="cc-kpi__value">{ASSETS.length}<small>/{ASSETS.length}</small></span>
		<span class="cc-kpi__delta cc-kpi__delta--up">kelengkapan {fmtNum(COMPLETENESS_AVG, 1)}% · rekam 1 menit</span>
		<span class="cc-kpi__meter"><i style="width:100%"></i></span>
	</div>
</div>
