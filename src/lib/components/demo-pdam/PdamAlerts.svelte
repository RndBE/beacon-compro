<script lang="ts">
	import { ALERT_LOG } from './data';
	let { n = 4 }: { n?: number } = $props();
	let rows = $derived(ALERT_LOG.slice(0, n));
</script>

<div class="card pdam-alerts">
	<div class="card-h">
		<div style="display:flex;flex-direction:column;gap:3px">
			<span class="label">TINGKAT SIAGA · NOTIFIKASI</span>
			<span class="pdam-muted">WhatsApp · Telegram · Email</span>
		</div>
		<span style="font-family:var(--font-mono);font-size:11px;color:var(--green);font-weight:700">● LIVE</span>
	</div>
	<div class="pdam-alerts__list">
		{#each rows as a, i (a.code + a.t + i)}
			<a class="pdam-alerts__item pdam-alerts__item--{a.sev}" class:is-first={i === 0} href="/demo/pdam/siaga">
				<span class="status-dot {a.sev}" style="margin-top:5px;width:8px;height:8px"></span>
				<span class="pdam-alerts__body">
					<span class="pdam-alerts__top"><b>{a.code}</b><em>{a.t === 'now' ? 'baru saja' : `${a.t} lalu`}</em></span>
					<span class="pdam-alerts__msg">{a.msg}</span>
				</span>
			</a>
		{/each}
	</div>
</div>
