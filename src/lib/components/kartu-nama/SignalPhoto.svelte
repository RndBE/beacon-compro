<script lang="ts">
	/** Foto bulat dengan cincin sinyal beacon; cincin meluap keluar, jadi parent perlu `overflow-hidden`. */
	let {
		src,
		alt,
		size,
		border,
		dot,
		rings
	}: {
		src: string;
		alt: string;
		size: number;
		/** Tebal bingkai hitam di tepi foto (px). */
		border: number;
		/** Diameter titik emas di sudut kanan-bawah foto (px). */
		dot: number;
		/** Pasangan [diameter px, opasitas] dari cincin terdalam ke terluar. */
		rings: [number, number][];
	} = $props();

	const outer = $derived(rings.at(-1)?.[0] ?? size);
</script>

<div class="relative shrink-0" style="width:{size}px;height:{size}px">
	{#each rings as [d, a], i}
		<span
			class="ring absolute top-1/2 left-1/2 rounded-full border border-solid"
			style="width:{d}px;height:{d}px;margin:{-d / 2}px 0 0 {-d / 2}px;--a:{a};--i:{i}"
		></span>
	{/each}
	<!-- Gelombang sinyal yang merambat dari foto ke cincin terluar -->
	<span class="ping absolute top-1/2 left-1/2 rounded-full" style="--from:{size}px;--to:{outer}px"></span>
	<img
		{src}
		{alt}
		width="600"
		height="600"
		class="photo relative size-full rounded-full bg-[#E9E3DA] object-cover"
		style="outline:{border}px solid #151212;outline-offset:{-border / 2}px"
	/>
	<!-- Titik berada di 45° tepi foto: 50% + r·cos45° = 85.36% -->
	<span
		class="dot absolute rounded-full bg-[#FFD27A]"
		style="width:{dot}px;height:{dot}px;left:85.36%;top:85.36%;margin:{-dot / 2}px 0 0 {-dot / 2}px;outline:{dot > 16 ? 3 : 2.5}px solid #fff;--d:{dot}px"
	></span>
</div>

<style>
	/* Saat dimuat: foto muncul, cincin menyala dari dalam ke luar, titik beacon menyala.
	   Sesudahnya satu denyut sinyal tiap 5 detik (gelombang + ping + pendar titik). */
	.photo {
		animation: photo-in 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s backwards;
	}

	.ring {
		border-color: rgba(235, 212, 154, var(--a));
		animation:
			ring-on 0.9s cubic-bezier(0.22, 1, 0.36, 1) calc(0.35s + var(--i) * 0.09s) backwards,
			ring-wave 5s ease-out calc(1.9s + var(--i) * 0.17s) infinite;
	}

	.ping {
		width: var(--from);
		height: var(--from);
		translate: -50% -50%;
		border: 1.5px solid #f5d58a;
		opacity: 0;
		animation: ping 5s cubic-bezier(0.25, 0.6, 0.35, 1) 1.8s infinite;
	}

	.dot {
		box-shadow: 0 0 12px rgba(255, 210, 122, 0.65);
		animation:
			dot-on 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.15s backwards,
			dot-pulse 2.5s ease-out 1.8s infinite;
	}

	@keyframes photo-in {
		from {
			opacity: 0;
			scale: 0.92;
		}
	}

	@keyframes ring-on {
		from {
			opacity: 0;
			scale: 0.85;
		}
	}

	@keyframes ring-wave {
		0%,
		35%,
		100% {
			border-color: rgba(235, 212, 154, var(--a));
		}
		12% {
			border-color: rgba(255, 228, 165, min(1, calc(var(--a) * 2.6)));
		}
	}

	@keyframes ping {
		0% {
			width: var(--from);
			height: var(--from);
			opacity: 0.85;
		}
		70%,
		100% {
			width: var(--to);
			height: var(--to);
			opacity: 0;
		}
	}

	@keyframes dot-on {
		from {
			opacity: 0;
			scale: 0;
		}
	}

	@keyframes dot-pulse {
		0% {
			box-shadow:
				0 0 12px rgba(255, 210, 122, 0.65),
				0 0 0 0 rgba(255, 210, 122, 0.6);
		}
		70%,
		100% {
			box-shadow:
				0 0 12px rgba(255, 210, 122, 0.65),
				0 0 0 calc(var(--d) * 0.8) rgba(255, 210, 122, 0);
		}
	}
</style>
