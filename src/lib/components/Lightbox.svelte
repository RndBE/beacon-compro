<script lang="ts">
	import { X } from '@lucide/svelte';

	let {
		src = '',
		alt = '',
		open = $bindable(false)
	}: {
		src: string;
		alt?: string;
		open: boolean;
	} = $props();

	function close() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && src}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="lightbox-overlay"
		onclick={handleBackdropClick}
	>
		<!-- Close Button -->
		<button
			class="lightbox-close"
			onclick={close}
			aria-label="Tutup gambar"
		>
			<X size={20} />
		</button>

		<!-- Image Container -->
		<div class="lightbox-image-wrap">
			<img
				src={src}
				alt={alt || 'Project image'}
				class="lightbox-image"
			/>
			{#if alt}
				<p class="lightbox-caption">{alt}</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Overlay — SKILL: Lens Blur Depth */
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: rgba(10, 10, 10, 0.88);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		cursor: zoom-out;
		animation: overlayFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	/* Close button — top-right, subtle glass pill */
	.lightbox-close {
		position: absolute;
		top: 1.25rem;
		right: 1.25rem;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.lightbox-close:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.25);
		color: white;
		transform: scale(1.08);
	}

	.lightbox-close:active {
		transform: scale(0.95);
	}

	/* Image wrapper — centers the image and caption */
	.lightbox-image-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 90vw;
		max-height: 85vh;
		cursor: default;
		animation: imageReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.lightbox-image {
		max-width: 100%;
		max-height: 80vh;
		object-fit: contain;
		border-radius: 1rem;
		box-shadow:
			0 24px 80px -12px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.06);
	}

	/* Caption below image */
	.lightbox-caption {
		margin-top: 1rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.5);
		text-align: center;
		max-width: 60ch;
		letter-spacing: 0.01em;
	}

	/* Animations — SKILL: Hardware acceleration only (transform + opacity) */
	@keyframes overlayFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes imageReveal {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lightbox-overlay,
		.lightbox-image-wrap {
			animation: none !important;
			opacity: 1;
		}
	}
</style>
