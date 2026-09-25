<script lang="ts">
	import { onMount } from 'svelte';
	import { Radio, CloudRain, Cpu, Siren, Sparkles } from '@lucide/svelte';
	let flickerOn = $state(true);
	onMount(() => {
		const id = setInterval(() => (flickerOn = !flickerOn), 1800);
		return () => clearInterval(id);
	});
</script>

<div class="cc-kpis">
	<div class="cc-kpi cc-kpi--ok">
		<span class="cc-kpi__icon"><Radio size={16} /></span>
		<span class="cc-kpi__label">Sites Online</span>
		<span class="cc-kpi__value">42<small>/44</small></span>
		<span class="cc-kpi__delta cc-kpi__delta--up">▲ 2 sites · 6 jam</span>
		<span class="cc-kpi__meter"><i style="width:95%"></i></span>
	</div>
	<div class="cc-kpi">
		<span class="cc-kpi__icon"><CloudRain size={16} /></span>
		<span class="cc-kpi__label">Curah Hujan · 24h</span>
		<span class="cc-kpi__value">421<small>mm</small></span>
		<span class="cc-kpi__delta">3 stasiun &gt; 30 mm/h</span>
		<span class="cc-kpi__meter"><i style="width:70%"></i></span>
	</div>
	<div class="cc-kpi cc-kpi--warn">
		<span class="cc-kpi__icon"><Cpu size={16} /></span>
		<span class="cc-kpi__label">Pompa Aktif</span>
		<span class="cc-kpi__value">5<small>/6</small></span>
		<span class="cc-kpi__delta cc-kpi__delta--down">▼ 1 lift pump siaga</span>
		<span class="cc-kpi__meter"><i style="width:83%"></i></span>
	</div>
	<div class="cc-kpi cc-kpi--danger">
		<span class="cc-kpi__icon"><Siren size={16} /></span>
		<span class="cc-kpi__label">Alarm Aktif</span>
		<span class="cc-kpi__value" style="opacity:{flickerOn ? 1 : 0.55};transition:opacity .2s">1</span>
		<span class="cc-kpi__delta cc-kpi__delta--down">WQ-03 · pH 5.1 Rawajitu</span>
		<span class="cc-kpi__meter"><i style="width:100%"></i></span>
	</div>
	<div class="cc-kpi cc-kpi--ai">
		<span class="cc-kpi__icon"><Sparkles size={16} /></span>
		<span class="cc-kpi__label">AI Confidence</span>
		<span class="cc-kpi__value">94<small>%</small></span>
		<span class="cc-kpi__delta">7 rekomendasi siap</span>
		<span class="cc-kpi__meter"><i style="width:94%"></i></span>
	</div>
</div>
