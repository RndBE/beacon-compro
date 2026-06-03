<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AiInsight from '$lib/components/demo-dashboard/AiInsight.svelte';
	import { AI_MESSAGES } from '$lib/components/demo-dashboard/data';
</script>

<svelte:head><title>ARGO AI · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="ARGO · AI Insight" sub="Rekomendasi prediktif · confidence 94%" />
	<AiInsight />
	<div style="display:flex;flex-direction:column;gap:12px;margin-top:4px">
		{#each AI_MESSAGES as m (m.title)}
			<div class="card">
				<div style="font-family:var(--font-sans);font-size:16px;font-weight:700;color:var(--ink);margin-bottom:4px">{m.title}</div>
				<div style="font-family:var(--font-mono);font-size:12px;color:var(--ink-soft)">{m.sub}<b style="color:var(--amber)">{m.bold}</b></div>
			</div>
		{/each}
	</div>
</div>
