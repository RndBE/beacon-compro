<script lang="ts">
	import { EWS_LEVELS, EWS_ACTIVE, EWS_INFO } from './data';
</script>

<div class="card ews">
	<div class="card-h">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label">EARLY WARNING · BANJIR</span>
			<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)">ARGO · prediksi {EWS_INFO.eta}</span>
		</div>
		<span class="pill pill--amber">SIAGA</span>
	</div>

	<div class="ews-scale">
		{#each EWS_LEVELS as lvl, i (lvl)}
			<div
				class="ews-step"
				class:ews-step--reached={i <= EWS_ACTIVE}
				class:ews-step--active={i === EWS_ACTIVE}
				data-lvl={i}
			>
				<span class="ews-step__bar"></span>
				<span class="ews-step__label">{lvl}</span>
			</div>
		{/each}
	</div>

	<div class="ews-headline">{EWS_INFO.headline}</div>
	<div class="ews-meta">
		<div><span class="ews-meta__k">ETA</span><span class="ews-meta__v">{EWS_INFO.eta}</span></div>
		<div><span class="ews-meta__k">Terdampak</span><span class="ews-meta__v">{EWS_INFO.area}</span></div>
	</div>

	<div class="ews-conf">
		<div class="ews-conf__head">
			<span>Model confidence</span><span>{EWS_INFO.confidence}%</span>
		</div>
		<div class="ews-conf__bar"><span style="width:{EWS_INFO.confidence}%"></span></div>
	</div>
</div>
