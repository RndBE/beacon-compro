<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/i18n';
	import { analyticsConsent, cookieBannerVisible, initConsent, grantConsent, denyConsent } from '$lib/stores/consent';
	import { loadAnalytics } from '$lib/analytics';

	const copy = {
		ID: {
			text: 'Kami pakai cookie untuk analitik pengunjung (Google Analytics). Ini membantu kami memahami performa situs.',
			link: 'Kebijakan Privasi',
			decline: 'Tolak',
			accept: 'Terima'
		},
		EN: {
			text: 'We use cookies for visitor analytics (Google Analytics) to help us understand site performance.',
			link: 'Privacy Policy',
			decline: 'Decline',
			accept: 'Accept'
		}
	};

	const t = $derived(copy[$locale]);

	onMount(() => {
		initConsent();
		const unsub = analyticsConsent.subscribe((v) => {
			if (v === 'unset') {
				cookieBannerVisible.set(true);
			} else {
				cookieBannerVisible.set(false);
				if (v === 'granted') loadAnalytics();
			}
		});
		return unsub;
	});
</script>

{#if $cookieBannerVisible}
	<div
		class="fixed inset-x-0 bottom-0 z-[1000] border-t border-zinc-200 bg-white/97 px-4 py-4 shadow-[0_-12px_30px_-10px_rgba(0,0,0,0.15)] backdrop-blur-md sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-sm sm:rounded-2xl sm:border sm:px-5 sm:py-5"
	>
		<p class="text-xs leading-relaxed text-zinc-600 sm:text-sm">
			{t.text}
			<a href="/privacy-policy" class="font-semibold text-[#C8102E] underline underline-offset-2 hover:text-zinc-950">
				{t.link}
			</a>
		</p>
		<div class="mt-3 flex gap-2">
			<button
				type="button"
				onclick={denyConsent}
				class="btn-tactile flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 sm:flex-none"
			>
				{t.decline}
			</button>
			<button
				type="button"
				onclick={grantConsent}
				class="btn-tactile flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-white sm:flex-none"
				style="background: linear-gradient(135deg, #C8102E 0%, #910B20 100%);"
			>
				{t.accept}
			</button>
		</div>
	</div>
{/if}
