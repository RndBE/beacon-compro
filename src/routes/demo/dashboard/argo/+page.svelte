<script lang="ts">
	import { Sparkles, Box, Ticket, Send, BrainCircuit } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AiInsight from '$lib/components/demo-dashboard/AiInsight.svelte';
	import { AI_MESSAGES } from '$lib/components/demo-dashboard/data';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';

	// per-recommendation context for the cards (same order as AI_MESSAGES)
	const EXTRA = [
		{ conf: 91, tone: 'danger', asset: 'P-04', eta: '11–14 hari', twin: '' },
		{ conf: 87, tone: 'amber', asset: 'AWLR-02', eta: '12–16 jam', twin: 'AWLR-02' },
		{ conf: 78, tone: 'danger', asset: 'WQ-03', eta: 'sedang terjadi', twin: 'WQ-03' }
	] as const;

	const MODELS = [
		{ name: 'Prakiraan banjir ensemble', ver: 'v2.3', acc: 87, note: 'hujan-limpasan + routing sungai' },
		{ name: 'Deteksi anomali kualitas air', ver: 'v1.8', acc: 92, note: 'pH, DO, TSS, konduktivitas' },
		{ name: 'Prediksi kegagalan pompa', ver: 'v1.4', acc: 89, note: 'getaran, arus, debit' }
	];
</script>

<svelte:head><title>ARGO AI · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="ARGO · AI Insight" sub="Rekomendasi prediktif · confidence 94%" icon={Sparkles} />
	<AiInsight />

	<div class="argo-grid">
		{#each AI_MESSAGES as m, i (m.title)}
			{@const x = EXTRA[i]}
			<article class="card argo-card argo-card--{x.tone}">
				<div class="argo-card__top">
					<span class="pill pill--{x.tone}" style="font-size:11px">{m.bold}</span>
					<span class="argo-card__asset">{x.asset}</span>
				</div>
				<h3 class="argo-card__title">{m.title}</h3>
				<p class="argo-card__sub">{m.sub.replace(/ · $/, '')}</p>
				<div class="argo-card__conf">
					<span>Confidence</span>
					<i class="twin-bar"><i style="width:{x.conf}%"></i></i>
					<b>{x.conf}%</b>
				</div>
				<div class="argo-card__eta">Perkiraan waktu: <b>{x.eta}</b></div>
				<div class="argo-card__actions">
					<button class="demo-btn demo-btn--sm" onclick={() => notify(`Tiket untuk ${x.asset} dibuat (demo)`)}><Ticket size={13} /> Buat tiket</button>
					<button class="demo-btn demo-btn--sm" onclick={() => notify('Rekomendasi dikirim ke grup WhatsApp BPBD (demo)')}><Send size={13} /> Kirim</button>
					{#if x.twin}
						<a class="demo-btn demo-btn--sm" href="/demo/dashboard/digital-twin?focus={x.twin}"><Box size={13} /> Twin 3D</a>
					{/if}
				</div>
			</article>
		{/each}
	</div>

	<div class="card">
		<div class="card-h">
			<span class="label"><BrainCircuit size={13} style="vertical-align:-2px" /> MODEL AKTIF</span>
			<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)">dilatih ulang tiap minggu · data 3 tahun</span>
		</div>
		<div class="argo-models">
			{#each MODELS as md (md.name)}
				<div class="argo-model">
					<div>
						<b>{md.name}</b> <span class="argo-model__ver">{md.ver}</span>
						<div class="argo-model__note">{md.note}</div>
					</div>
					<div class="argo-model__acc">
						<i class="twin-bar"><i style="width:{md.acc}%"></i></i>
						<span>akurasi {md.acc}%</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
