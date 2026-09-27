<script lang="ts">
	import { onMount } from 'svelte';
	import { AI_MESSAGES, type AiMessage } from './data';

	let {
		messages = AI_MESSAGES,
		badge = 'ARGO · AI INSIGHT',
		conf = 94
	}: { messages?: AiMessage[]; badge?: string; conf?: number } = $props();

	let idx = $state(0);
	onMount(() => {
		const id = setInterval(() => (idx = (idx + 1) % messages.length), 5200);
		return () => clearInterval(id);
	});
	let m = $derived(messages[idx % messages.length]);
</script>

<div class="cc-ai">
	<span class="cc-ai__badge"><span class="cc-ai__icon"></span> {badge}</span>
	<div class="cc-ai__body">
		<span class="cc-ai__title">{m.title}</span>
		<span class="cc-ai__sub">{m.sub}<b>{m.bold}</b></span>
	</div>
	<div class="cc-ai__conf">
		<span class="cc-ai__conf-v">{conf}%</span>
		<span class="cc-ai__conf-l">Confidence</span>
	</div>
</div>
