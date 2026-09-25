<script lang="ts">
	import { Bell, CheckCheck, MessageCircle, Send, Smartphone, Search, Users } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { ALERT_LOG, CHANNEL_STATS, type Channel, type SiteStatus } from '$lib/components/demo-dashboard/data';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';

	let log = $state(ALERT_LOG.map((a) => ({ ...a })));
	let sev = $state<SiteStatus | 'all'>('all');
	let channel = $state<Channel | 'all'>('all');
	let q = $state('');

	const CH_ICON = { WhatsApp: MessageCircle, SMS: Smartphone, Telegram: Send } as const;
	const SEV_LABEL: Record<SiteStatus, string> = { alarm: 'Awas', warn: 'Siaga', ok: 'Normal' };
	const SEVS: SiteStatus[] = ['alarm', 'warn', 'ok'];
	const total = CHANNEL_STATS.reduce((a, c) => a + c.sent, 0);

	let rows = $derived(
		log.filter(
			(a) =>
				(sev === 'all' || a.sev === sev) &&
				(channel === 'all' || a.channels.includes(channel)) &&
				(a.msg + a.code).toLowerCase().includes(q.toLowerCase())
		)
	);
	let unread = $derived(log.filter((a) => !a.read).length);
	const countSev = (s: SiteStatus) => ALERT_LOG.filter((a) => a.sev === s).length;

	function markAll() {
		log = log.map((a) => ({ ...a, read: true }));
		notify('Semua notifikasi ditandai dibaca');
	}
</script>

<svelte:head><title>Notifikasi · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Notifikasi" sub="Riwayat alert · WhatsApp · SMS · Telegram" icon={Bell}>
		<button class="demo-btn" onclick={markAll} disabled={!unread}><CheckCheck size={15} /> Tandai dibaca{unread ? ` (${unread})` : ''}</button>
	</PageHead>

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Terkirim · 24 jam</span>
			<span class="demo-stat__v">{total}<small>pesan</small></span>
			<span class="demo-stat__s">{CHANNEL_STATS.reduce((a, c) => a + c.delivered, 0)} diterima · 99%</span>
		</div>
		{#each CHANNEL_STATS as c (c.ch)}
			{@const Icon = CH_ICON[c.ch]}
			<div class="card demo-stat notif-ch notif-ch--{c.ch.toLowerCase()}">
				<span class="demo-stat__k"><Icon size={13} /> {c.ch}</span>
				<span class="demo-stat__v">{c.sent}</span>
				<span class="twin-bar"><i style="width:{(c.sent / total) * 100}%"></i></span>
				<span class="demo-stat__s">{c.delivered} diterima</span>
			</div>
		{/each}
	</div>

	<div class="card notif-card">
		<div class="notif-tools">
			<div class="demo-chips" role="group" aria-label="Filter tingkat">
				<button class="demo-chip" class:is-on={sev === 'all'} onclick={() => (sev = 'all')}>Semua<small>{ALERT_LOG.length}</small></button>
				{#each SEVS as s (s)}
					<button
						class="demo-chip"
						class:is-on={sev === s}
						style="--c:{s === 'alarm' ? '#ff7a66' : s === 'warn' ? '#ffb454' : '#46d78f'}"
						onclick={() => (sev = s)}
					>
						<i></i>{SEV_LABEL[s]}<small>{countSev(s)}</small>
					</button>
				{/each}
			</div>
			<div class="demo-seg" role="group" aria-label="Filter kanal">
				<button class:is-on={channel === 'all'} onclick={() => (channel = 'all')}>Semua kanal</button>
				{#each CHANNEL_STATS as c (c.ch)}
					<button class:is-on={channel === c.ch} onclick={() => (channel = c.ch)}>{c.ch}</button>
				{/each}
			</div>
			<label class="demo-search notif-search">
				<Search size={15} />
				<input placeholder="Cari kode / pesan…" aria-label="Cari notifikasi" bind:value={q} />
			</label>
		</div>

		<ul class="notif-list">
			{#each rows as a (a.code + a.t)}
				<li class="notif-item notif-item--{a.sev}" class:is-unread={!a.read}>
					<span class="status-dot {a.sev}" style="width:9px;height:9px;margin-top:6px"></span>
					<div class="notif-item__body">
						<div class="notif-item__top">
							<b>{a.code}</b>
							<span class="notif-item__sev">{SEV_LABEL[a.sev]}</span>
							{#if !a.read}<span class="notif-item__new">BARU</span>{/if}
							<span class="notif-item__t">{a.t === 'now' ? 'baru saja' : `${a.t} lalu`}</span>
						</div>
						<div class="notif-item__msg">{a.msg}</div>
						<div class="notif-item__meta">
							{#each a.channels as ch (ch)}
								{@const Icon = CH_ICON[ch]}
								<span class="notif-item__ch"><Icon size={12} /> {ch}</span>
							{/each}
							<span class="notif-item__ch"><Users size={12} /> {a.recipients} penerima</span>
						</div>
					</div>
				</li>
			{:else}
				<li class="notif-empty">Tidak ada notifikasi untuk filter ini.</li>
			{/each}
		</ul>
	</div>
</div>
