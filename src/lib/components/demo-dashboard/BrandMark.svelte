<script lang="ts">
	let { eyebrow = 'BEACON · TULANG BAWANG', size = 40 }: { eyebrow?: string; size?: number } = $props();
</script>

<div class="brandmark">
	<span class="brandmark__badge" style="width:{size}px;height:{size}px">
		<svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
			<defs>
				<linearGradient id="bmHex" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#13316E" />
					<stop offset="100%" stop-color="#0A1730" />
				</linearGradient>
				<linearGradient id="bmEdge" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="#3CC3F2" />
					<stop offset="100%" stop-color="#2876E8" />
				</linearGradient>
			</defs>

			<!-- hex badge -->
			<path
				d="M24 3.5 L41.75 13.75 L41.75 34.25 L24 44.5 L6.25 34.25 L6.25 13.75 Z"
				fill="url(#bmHex)"
				stroke="url(#bmEdge)"
				stroke-width="1.6"
				stroke-linejoin="round"
			/>

			<!-- mesh links -->
			<g stroke="#3CC3F2" stroke-width="1.3" stroke-opacity="0.5" stroke-linecap="round">
				<line x1="24" y1="24" x2="24" y2="14" />
				<line x1="24" y1="24" x2="15" y2="31" />
				<line x1="24" y1="24" x2="33" y2="31" />
				<line x1="24" y1="14" x2="15" y2="31" />
				<line x1="24" y1="14" x2="33" y2="31" />
				<line x1="15" y1="31" x2="33" y2="31" />
			</g>

			<!-- outer nodes -->
			<g fill="#AFC6EC">
				<circle cx="24" cy="14" r="2.4" />
				<circle cx="15" cy="31" r="2.4" />
				<circle cx="33" cy="31" r="2.4" />
			</g>

			<!-- live center node -->
			<circle cx="24" cy="24" r="4" fill="none" stroke="#3CC3F2" stroke-opacity="0.5">
				<animate attributeName="r" values="3.5;8.5;3.5" dur="2.6s" repeatCount="indefinite" />
				<animate attributeName="stroke-opacity" values="0.55;0;0.55" dur="2.6s" repeatCount="indefinite" />
			</circle>
			<circle cx="24" cy="24" r="3.6" fill="#3CC3F2" />
			<circle cx="24" cy="24" r="3.6" fill="none" stroke="#0A1730" stroke-width="1" />
		</svg>
	</span>

	<span class="brandmark__text">
		<span class="brandmark__eyebrow">{eyebrow}</span>
		<span class="brandmark__title">Command Center</span>
	</span>
</div>

<style>
	.brandmark {
		display: flex;
		align-items: center;
		gap: 11px;
	}
	.brandmark__badge {
		flex: 0 0 auto;
		line-height: 0;
		filter: drop-shadow(0 4px 12px rgba(40, 118, 232, 0.35));
	}
	.brandmark__text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.brandmark__eyebrow {
		font-family: var(--font-mono);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-mute);
		white-space: nowrap;
	}
	.brandmark__title {
		font-family: var(--font-sans);
		font-size: 16px;
		font-weight: 800;
		letter-spacing: -0.01em;
		line-height: 1.05;
		color: var(--ink);
		white-space: nowrap;
	}
</style>
