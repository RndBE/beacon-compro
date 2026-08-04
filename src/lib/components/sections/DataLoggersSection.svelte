<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/i18n';
	import {
		dataLoggerBadgeSet,
		dataLoggerDescription,
		dataLoggerFeature,
		dataLoggerTagline
	} from '$lib/homepage-copy';
	import { LOGGER_MODELS, LoggerStage, type StageStatus } from '$lib/loggers/stage';
	import type { HomepageDataLogger } from '$lib/api';

	let { dataLoggers = undefined }: { dataLoggers?: HomepageDataLogger[] | null } = $props();

	let activeIndex = $state(0);
	let progress = $state(0);
	let status = $state<StageStatus>('loading');
	let statusLabel = $state('');
	let visible = $state(false);

	let stageHost: HTMLDivElement | undefined = $state();
	let stage: LoggerStage | null = null;

	// The 3D assemblies define the roster and its order; CMS rows only enrich the
	// copy for loggers we already ship geometry for.
	const bySlug = $derived(new Map((dataLoggers ?? []).map((row) => [row.id, row])));
	const products = $derived(
		LOGGER_MODELS.map(
			(model): HomepageDataLogger =>
				bySlug.get(model.id) ?? {
					id: model.id,
					name: model.label,
					tagline: null,
					desc: null,
					features: [],
					image: null,
					media_type: null
				}
		)
	);

	const active = $derived(products[activeIndex] ?? products[0]);

	/** BL-2000 → "BL 2000": a hair space reads better than a hyphen at badge size. */
	function displayName(name: string) {
		return name.replace(/-/g, ' ');
	}

	function selectLogger(index: number) {
		if (index === activeIndex) return;
		activeIndex = index;
		progress = 0;
		stage?.select(index);
	}

	function onTabKeydown(event: KeyboardEvent, index: number) {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		const next = (index + step + products.length) % products.length;
		selectLogger(next);
		document.getElementById(`logger-tab-${next}`)?.focus();
	}

	onMount(() => {
		const section = document.getElementById('data-loggers-section');
		if (!section) return;

		let booted = false;
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) visible = true;
				if (entry.isIntersecting && !booted && stageHost) {
					booted = true;
					stage = new LoggerStage({
						host: stageHost,
						onProgress: (u) => (progress = u),
						onCycle: (index) => {
							activeIndex = index;
							progress = 0;
						},
						onStatus: (next, label) => {
							status = next;
							statusLabel = label;
						}
					});
					stage.setPaused(false);
					void stage.boot();
				}
				stage?.setPaused(!entry.isIntersecting);
			},
			{ rootMargin: '240px 0px', threshold: 0 }
		);
		observer.observe(section);

		return () => {
			observer.disconnect();
			stage?.destroy();
			stage = null;
		};
	});
</script>

<section
	id="data-loggers-section"
	class="logger-section"
	class:is-visible={visible}
	aria-label={$locale === 'EN' ? 'Beacon Logger product family' : 'Keluarga produk Beacon Logger'}
>
	<!-- ambient colour wash behind the stage -->
	<div class="logger-blobs" aria-hidden="true">
		<div class="logger-blob logger-blob-a"></div>
		<div class="logger-blob logger-blob-b"></div>
		<div class="logger-blob logger-blob-c"></div>
	</div>

	<div class="logger-ghost" aria-hidden="true">
		{#key activeIndex}
			<span class="logger-ghost-word">{active.name}</span>
		{/key}
	</div>

	<!-- WebGL canvas is mounted here by LoggerStage -->
	<div bind:this={stageHost} class="logger-stage"></div>

	<div class="logger-vignette" aria-hidden="true"></div>
	<div class="logger-scrim" aria-hidden="true"></div>

	<div class="logger-content">
		<div class="logger-top">
			<div class="logger-pill logger-rise" style="--rise-delay: 90ms;">
				<span class="logger-pill-dot"></span>
				<span class="logger-pill-text">
					{$locale === 'EN' ? 'PRODUCT FAMILY — BEACON LOGGER' : 'KELUARGA PRODUK — BEACON LOGGER'}
				</span>
			</div>
			<div class="logger-pill logger-pill-muted logger-rise" style="--rise-delay: 200ms;">
				<span class="logger-pill-text">
					{$locale === 'EN' ? 'ASSEMBLED IN INDONESIA' : 'DIRAKIT DI INDONESIA'}
				</span>
			</div>
		</div>

		<div class="logger-headline logger-rise" style="--rise-delay: 310ms;">
			<h2>
				Data Logger<br /><span class="logger-accent-word">Series.</span>
			</h2>
			<p>
				{$locale === 'EN'
					? 'From a high-end multisensor logger down to the most compact single-sensor unit — designed, assembled, and tested in Indonesia.'
					: 'Dari logger high-end multisensor sampai unit paling ringkas untuk satu sensor — dirancang, dirakit, dan diuji di Indonesia.'}
			</p>
		</div>

		<div class="logger-spacer"></div>

		<div class="logger-panel-group">
			<div
				class="logger-card logger-rise"
				style="--rise-delay: 420ms;"
				id="logger-panel"
				role="tabpanel"
				aria-labelledby="logger-tab-{activeIndex}"
				aria-live="polite"
			>
				<div class="logger-card-sheen" aria-hidden="true"></div>

				<div class="logger-card-head">
					<span class="logger-card-badge">{active.name}</span>
					<span class="logger-card-rule"></span>
				</div>

				<div class="logger-card-body">
					{#each products as product, index (product.id)}
						{@const badges = dataLoggerBadgeSet(product)}
						<div class="logger-detail" class:is-active={index === activeIndex} aria-hidden={index !== activeIndex}>
							<div class="logger-detail-title">{dataLoggerTagline(product, $locale)}</div>
							<p class="logger-detail-desc">{dataLoggerDescription(product, $locale)}</p>
							<div class="logger-detail-badges">
								{#each badges.features as feature}
									<span class="logger-badge">{dataLoggerFeature(feature, $locale)}</span>
								{/each}
								{#if badges.comms}
									<span class="logger-badge logger-badge-comms">
										{dataLoggerFeature(badges.comms, $locale)}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div
				class="logger-tabs logger-rise"
				style="--rise-delay: 530ms;"
				role="tablist"
				aria-label={$locale === 'EN' ? 'Choose a logger' : 'Pilih logger'}
			>
				{#each products as product, index (product.id)}
					<button
						id="logger-tab-{index}"
						type="button"
						role="tab"
						class="logger-tab"
						class:is-active={index === activeIndex}
						aria-selected={index === activeIndex}
						aria-controls="logger-panel"
						tabindex={index === activeIndex ? 0 : -1}
						onclick={() => selectLogger(index)}
						onkeydown={(event) => onTabKeydown(event, index)}
					>
						<span class="logger-tab-index">{String(index + 1).padStart(2, '0')}</span>
						<span class="logger-tab-name">{displayName(product.name)}</span>
						<span class="logger-tab-glow" aria-hidden="true"></span>
						<span class="logger-tab-track" aria-hidden="true">
							<span
								class="logger-tab-progress"
								style="width: {index === activeIndex ? progress * 100 : 0}%;"
							></span>
						</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if status !== 'ready'}
		<div class="logger-status" role="status">
			{#if status === 'error'}
				{$locale === 'EN' ? 'UNABLE TO LOAD 3D VIEW' : 'GAGAL MEMUAT TAMPILAN 3D'}
			{:else}
				{$locale === 'EN' ? 'LOADING' : 'MEMUAT'}{statusLabel ? ` ${statusLabel}` : ''}…
			{/if}
		</div>
	{/if}
</section>

<style>
	.logger-section {
		--logger-accent: #c8102e;
		--logger-ink: #f4f3f0;
		position: relative;
		box-sizing: border-box;
		width: 100%;
		min-height: 860px;
		color: var(--logger-ink);
		background: #07080b;
		overflow: hidden;
		isolation: isolate;
	}

	@media (min-width: 1024px) {
		.logger-section {
			min-height: clamp(700px, 100vh, 980px);
		}
	}

	/* ---- ambient background ---- */
	.logger-blobs {
		position: absolute;
		inset: -8%;
		pointer-events: none;
		filter: blur(44px);
		opacity: 0.85;
	}

	.logger-blob {
		position: absolute;
		border-radius: 50%;
	}

	.logger-blob-a {
		left: 38%;
		top: 6%;
		width: 52%;
		height: 62%;
		background: radial-gradient(circle at 50% 50%, rgba(200, 16, 46, 0.34) 0%, rgba(200, 16, 46, 0) 68%);
		animation: logger-blob-a 24s ease-in-out infinite;
	}

	.logger-blob-b {
		left: -6%;
		top: 34%;
		width: 48%;
		height: 58%;
		background: radial-gradient(circle at 50% 50%, rgba(72, 110, 168, 0.24) 0%, rgba(72, 110, 168, 0) 68%);
		animation: logger-blob-b 31s ease-in-out infinite;
	}

	.logger-blob-c {
		left: 22%;
		top: 52%;
		width: 56%;
		height: 52%;
		background: radial-gradient(circle at 50% 50%, rgba(255, 214, 170, 0.14) 0%, rgba(255, 214, 170, 0) 70%);
		animation: logger-blob-c 27s ease-in-out infinite;
	}

	@keyframes logger-blob-a {
		0%, 100% { transform: translate3d(-4%, 0, 0) scale(1); }
		50% { transform: translate3d(9%, -7%, 0) scale(1.14); }
	}
	@keyframes logger-blob-b {
		0%, 100% { transform: translate3d(6%, 4%, 0) scale(1.08); }
		50% { transform: translate3d(-8%, -5%, 0) scale(0.94); }
	}
	@keyframes logger-blob-c {
		0%, 100% { transform: translate3d(0, 6%, 0) scale(0.96); }
		50% { transform: translate3d(-6%, -4%, 0) scale(1.16); }
	}

	/* ---- oversized model name watermark ---- */
	.logger-ghost {
		position: absolute;
		inset: 0;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: clamp(20px, 3vw, 56px);
	}

	.logger-ghost-word {
		font-size: clamp(56px, 10vw, 168px);
		font-weight: 800;
		letter-spacing: -0.05em;
		line-height: 1;
		color: rgba(244, 243, 240, 0.045);
		white-space: nowrap;
		animation: logger-ghost-in 620ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	@media (max-width: 1023px) {
		/* narrow screens put the model in a mid-section band, so the watermark
		   centres with it instead of hugging the right edge behind the headline */
		.logger-ghost {
			justify-content: center;
			padding-right: 0;
		}
		.logger-ghost-word {
			color: rgba(244, 243, 240, 0.03);
		}
	}

	@keyframes logger-ghost-in {
		from { opacity: 0; transform: translateY(-4%) scale(1.06); }
		to { opacity: 1; transform: translateY(-4%) scale(1); }
	}

	/* ---- stage + overlays ---- */
	.logger-stage {
		position: absolute;
		inset: 0;
		cursor: grab;
		touch-action: pan-y;
	}

	.logger-vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(115% 88% at 60% 46%, rgba(7, 8, 11, 0) 42%, rgba(5, 6, 9, 0.72) 100%);
	}

	/* keeps the copy legible over the model: horizontal on wide screens where the
	   model sits to the right, vertical on narrow ones where it sits mid-band */
	.logger-scrim {
		position: absolute;
		inset: 0;
		pointer-events: none;
		/* the clear window is a plateau, not a single stop, and it spans the band
		   the model actually occupies on a phone (~44-60% of the section) — the
		   old single 40% stop put the model on the ramp down into the 0.42 shelf */
		background: linear-gradient(
			180deg,
			rgba(7, 8, 11, 0.94) 0%,
			rgba(7, 8, 11, 0.7) 20%,
			rgba(7, 8, 11, 0.08) 44%,
			rgba(7, 8, 11, 0.1) 60%,
			rgba(7, 8, 11, 0.55) 74%,
			rgba(7, 8, 11, 0.93) 100%
		);
	}

	@media (min-width: 1024px) {
		.logger-scrim {
			background: linear-gradient(
				90deg,
				rgba(7, 8, 11, 0.92) 0%,
				rgba(7, 8, 11, 0.8) 30%,
				rgba(7, 8, 11, 0.5) 52%,
				rgba(7, 8, 11, 0.16) 68%,
				rgba(7, 8, 11, 0) 80%
			);
		}
	}

	/* ---- content ---- */
	.logger-content {
		position: relative;
		box-sizing: border-box;
		min-height: inherit;
		height: 100%;
		/* top clears the fixed header (condensed pill sits ~78px tall, but stays
		   generous in case it renders expanded); bottom keeps the spec card
		   from sitting flush against the section edge */
		padding: clamp(144px, 8vw, 168px) clamp(26px, 3.4vw, 54px) clamp(40px, 5vw, 72px);
		display: flex;
		flex-direction: column;
		gap: clamp(24px, 5vh, 64px);
		pointer-events: none;
	}

	.logger-top {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 12px;
		flex-wrap: wrap;
	}

	@media (min-width: 640px) {
		.logger-top {
			justify-content: space-between;
			gap: 20px;
		}
	}

	.logger-pill {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 9px 15px 9px 12px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.035));
		backdrop-filter: blur(18px) saturate(1.6);
		-webkit-backdrop-filter: blur(18px) saturate(1.6);
		box-shadow:
			0 12px 34px -18px rgba(0, 0, 0, 0.9),
			inset 0 1px 0 rgba(255, 255, 255, 0.24);
	}

	.logger-pill-muted {
		padding: 9px 15px;
		border-color: rgba(255, 255, 255, 0.1);
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
	}

	.logger-pill-dot {
		flex: none;
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: var(--logger-accent);
		box-shadow: 0 0 14px var(--logger-accent);
		animation: logger-breathe 3.4s ease-in-out infinite;
	}

	@keyframes logger-breathe {
		0%, 100% { opacity: 0.55; }
		50% { opacity: 1; }
	}

	.logger-pill-text {
		font-family: var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace);
		font-size: 10px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.2em;
		color: #d6d9de;
	}

	.logger-pill-muted .logger-pill-text {
		letter-spacing: 0.16em;
		color: #9ba0a8;
	}

	.logger-headline {
		max-width: 660px;
	}

	.logger-headline h2 {
		margin: 0;
		font-size: clamp(34px, 4.4vw, 64px);
		font-weight: 700;
		letter-spacing: -0.035em;
		line-height: 1.02;
		text-wrap: balance;
	}

	.logger-accent-word {
		color: var(--logger-accent);
	}

	.logger-headline p {
		margin: 16px 0 0;
		max-width: 470px;
		font-size: 14.5px;
		line-height: 1.65;
		color: #a4a9b1;
		text-wrap: pretty;
	}

	.logger-spacer {
		flex: 1 1 auto;
		min-height: clamp(120px, 22vh, 200px);
	}

	@media (min-width: 1024px) {
		.logger-spacer {
			min-height: clamp(8px, 2vh, 56px);
		}
	}

	.logger-panel-group {
		display: flex;
		flex-direction: column-reverse;
		align-items: flex-start;
		gap: 16px;
	}

	/* ---- spec card ---- */
	.logger-card {
		pointer-events: auto;
		position: relative;
		width: 100%;
		max-width: 520px;
		box-sizing: border-box;
		padding: 22px 26px 24px;
		border-radius: 22px;
		border: 1px solid rgba(255, 255, 255, 0.13);
		background: linear-gradient(
			150deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.045) 42%,
			rgba(255, 255, 255, 0.022) 100%
		);
		backdrop-filter: blur(30px) saturate(1.7);
		-webkit-backdrop-filter: blur(30px) saturate(1.7);
		box-shadow:
			0 34px 80px -28px rgba(0, 0, 0, 0.92),
			inset 0 1px 0 rgba(255, 255, 255, 0.26),
			inset 0 -1px 0 rgba(255, 255, 255, 0.06);
		overflow: hidden;
	}

	.logger-card-sheen {
		position: absolute;
		left: -14%;
		top: -60%;
		width: 38%;
		height: 170%;
		pointer-events: none;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0) 0%,
			rgba(255, 255, 255, 0.075) 50%,
			rgba(255, 255, 255, 0) 100%
		);
		filter: blur(8px);
		animation: logger-sheen 9s ease-in-out infinite;
	}

	@keyframes logger-sheen {
		0% { transform: translateX(-130%) skewX(-12deg); }
		55%, 100% { transform: translateX(240%) skewX(-12deg); }
	}

	.logger-card-head {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.logger-card-badge {
		font-family: var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace);
		font-size: 11px;
		font-weight: 800;
		line-height: 1;
		letter-spacing: 0.08em;
		color: var(--logger-accent);
	}

	.logger-card-rule {
		flex: 1 1 auto;
		height: 1px;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0));
	}

	.logger-card-body {
		position: relative;
		margin-top: 14px;
		min-height: 196px;
	}

	@media (min-width: 640px) {
		.logger-card-body {
			min-height: 168px;
		}
	}

	.logger-detail {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		opacity: 0;
		transform: translateY(14px);
		filter: blur(7px);
		pointer-events: none;
		transition:
			opacity 420ms ease,
			transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1),
			filter 420ms ease;
	}

	.logger-detail.is-active {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
		pointer-events: auto;
	}

	.logger-detail-title {
		font-size: 24px;
		font-weight: 700;
		letter-spacing: -0.022em;
		line-height: 1.14;
	}

	.logger-detail-desc {
		margin: 11px 0 0;
		font-size: 13.5px;
		line-height: 1.62;
		color: #a4a9b1;
		text-wrap: pretty;
	}

	.logger-detail-badges {
		margin-top: 16px;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.logger-badge {
		padding: 6px 11px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(255, 255, 255, 0.05);
		font-family: var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace);
		font-size: 9.5px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.12em;
		color: #d0d3d9;
	}

	.logger-badge-comms {
		border-color: rgba(227, 52, 63, 0.36);
		background: rgba(200, 16, 46, 0.14);
		color: #f08a90;
	}

	/* ---- tabs ---- */
	.logger-tabs {
		pointer-events: auto;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 7px;
	}

	.logger-tab {
		appearance: none;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		text-align: left;
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 9px 14px 10px;
		border-radius: 11px;
		border: 1px solid rgba(255, 255, 255, 0.11);
		background: linear-gradient(140deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.022));
		backdrop-filter: blur(22px) saturate(1.5);
		-webkit-backdrop-filter: blur(22px) saturate(1.5);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
		color: var(--logger-ink);
		transition:
			transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1),
			background 320ms ease,
			border-color 320ms ease,
			box-shadow 320ms ease;
	}

	.logger-tab:hover:not(.is-active),
	.logger-tab:focus-visible:not(.is-active) {
		transform: translateY(-3px);
		border-color: rgba(255, 255, 255, 0.24);
		background: linear-gradient(140deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
	}

	.logger-tab.is-active {
		transform: translateY(-4px);
		border-color: rgba(255, 255, 255, 0.26);
		background: linear-gradient(140deg, rgba(200, 16, 46, 0.2), rgba(255, 255, 255, 0.05));
		box-shadow:
			0 22px 54px -26px rgba(0, 0, 0, 0.95),
			0 0 0 1px rgba(200, 16, 46, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.logger-tab-index {
		flex: none;
		font-family: var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace);
		font-size: 9.5px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.1em;
		color: #71767e;
	}

	.logger-tab-name {
		font-size: 15px;
		font-weight: 800;
		letter-spacing: -0.015em;
		line-height: 1;
	}

	.logger-tab-glow {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		border-radius: 2px;
		background: var(--logger-accent);
		box-shadow: 0 0 16px var(--logger-accent);
		opacity: 0;
		transition: opacity 320ms ease;
	}

	.logger-tab.is-active .logger-tab-glow {
		opacity: 1;
	}

	.logger-tab-track {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: rgba(255, 255, 255, 0.07);
	}

	.logger-tab-progress {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, rgba(200, 16, 46, 0.2), var(--logger-accent));
		transition: width 140ms linear;
	}

	/* ---- status + reveal ---- */
	.logger-status {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		text-align: center;
		pointer-events: none;
		font-family: var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace);
		font-size: 10px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.2em;
		color: #71767e;
	}

	.logger-rise {
		opacity: 0;
		transform: translateY(22px);
		filter: blur(10px);
		transition:
			opacity 760ms cubic-bezier(0.2, 0.8, 0.2, 1) var(--rise-delay, 0ms),
			transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1) var(--rise-delay, 0ms),
			filter 760ms ease var(--rise-delay, 0ms);
	}

	.logger-section.is-visible .logger-rise {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.logger-blob,
		.logger-pill-dot,
		.logger-card-sheen,
		.logger-ghost-word {
			animation: none;
		}

		.logger-rise,
		.logger-detail,
		.logger-tab,
		.logger-tab-progress {
			transition: none;
		}

		.logger-rise {
			opacity: 1;
			transform: none;
			filter: none;
		}
	}
</style>
