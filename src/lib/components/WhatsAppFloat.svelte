<script lang="ts">
	import { MessageCircle } from '@lucide/svelte';

	let { contextMessage = 'Halo Beacon, saya tertarik dengan solusi telemetri Anda.' } : { contextMessage?: string } = $props();

	const waUrl = `https://wa.me/628112850986?text=${encodeURIComponent(contextMessage)}`;
</script>

<!-- Mobile Sticky CTA Strip -->
<div class="fixed bottom-0 left-0 right-0 z-40 lg:hidden" style="backdrop-filter: blur(12px); background: rgba(255,255,255,0.95); border-top: 1px solid #E5E5E5;">
	<div class="flex h-[60px]">
		<a
			href={waUrl}
			target="_blank"
			rel="noopener"
			class="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white"
			style="background: #C8102E;"
		>
			<MessageCircle size={16} />
			WhatsApp
		</a>
		<a
			href="tel:02744986899"
			class="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-[#1A1A1A] border-l border-[#E5E5E5]"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
			Telepon
		</a>
	</div>
</div>
