<script lang="ts">
	import { onMount } from 'svelte';
	import { AI_MESSAGES } from './data';

	let idx = $state(0);
	onMount(() => {
		const id = setInterval(() => (idx = (idx + 1) % AI_MESSAGES.length), 5200);
		return () => clearInterval(id);
	});
	let m = $derived(AI_MESSAGES[idx]);
</script>

<div class="cc-ai">
	<span class="cc-ai__badge"><span class="cc-ai__icon"></span> ARGO · AI INSIGHT</span>
	<div class="cc-ai__body">
		<span class="cc-ai__title">{m.title}</span>
		<span class="cc-ai__sub">{m.sub}<b>{m.bold}</b></span>
	</div>
	<div class="cc-ai__conf">
		<span class="cc-ai__conf-v">94%</span>
		<span class="cc-ai__conf-l">Confidence</span>
	</div>
</div>
