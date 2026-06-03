<script lang="ts">
	import { ALERTS_SEED } from './data';
	let { compact = false }: { compact?: boolean } = $props();
	let visible = $derived(compact ? ALERTS_SEED.slice(0, 3) : ALERTS_SEED);
	const bgFor = (sev: string, first: boolean) =>
		first ? (sev === 'alarm' ? 'var(--danger-soft)' : 'var(--amber-soft)') : 'var(--surface-2)';
</script>

<div class="card" style="height:100%;overflow:hidden;padding:{compact ? 14 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 10 : 14}px">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label" style="font-size:{compact ? 10 : 11}px">ALERT FEED · 30 MIN</span>
			<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 14}px;color:var(--ink-mute)">WhatsApp · SMS · Telegram</span>
		</div>
		<span style="font-family:var(--font-mono);font-size:{compact ? 10 : 12}px;color:var(--green);font-weight:700">● LIVE</span>
	</div>
	<div style="display:flex;flex-direction:column;gap:{compact ? 7 : 10}px">
		{#each visible as a, i (a.code + a.t)}
			<div style="display:flex;gap:{compact ? 9 : 12}px;padding:{compact ? '8px 10px' : '10px 14px'};border:1px solid var(--line);border-radius:8px;background:{bgFor(a.sev, i === 0)}">
				<span class="status-dot {a.sev}" style="margin-top:5px;width:8px;height:8px"></span>
				<div style="flex:1;min-width:0">
					<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
						<span style="font-family:var(--font-mono);font-size:{compact ? 10 : 11}px;font-weight:700;color:var(--ink-mute);letter-spacing:.08em">{a.code}</span>
						<span style="margin-left:auto;font-family:var(--font-mono);font-size:{compact ? 10 : 11}px;color:var(--ink-mute)">{a.t}</span>
					</div>
					<div style="font-size:{compact ? 12 : 14}px;color:var(--ink-2);line-height:{compact ? 1.25 : 1.35}">{a.msg}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
