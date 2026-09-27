<script lang="ts">
	import { onMount } from 'svelte';
	import { BellRing, CheckCheck, Mail, MessageCircle, Save, Search, Send, Siren, Timer, Users } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';
	import {
		ALERT_LOG,
		ASSETS,
		CHANNEL_STATS,
		DEVICES,
		HANDOVER,
		THRESHOLDS,
		ZONES,
		type Channel,
		type SiteStatus
	} from '$lib/components/demo-pdam/data';
	import { live, useLive } from '$lib/components/demo-pdam/live.svelte';
	import { BURST, EVENTS, fmtClock, fmtNum, mnf, readLive } from '$lib/components/demo-pdam/sim';
	import {
		LEVEL_COLOR,
		LEVEL_LABEL,
		LIMITS,
		levelAbove,
		levelBelow,
		type AlertLevel
	} from '$lib/components/demo-pdam/logger-health';

	onMount(() => useLive());

	type Level = Exclude<AlertLevel, 'normal'>;
	const LEVELS: Level[] = ['waspada', 'siaga', 'awas'];
	const CH_ICON = { WhatsApp: MessageCircle, Telegram: Send, Email: Mail } as const;
	const CHANNELS: Channel[] = ['WhatsApp', 'Telegram', 'Email'];

	/** "Jeda notifikasi" from minutes: 30 → 30 menit, 720 → 12 jam, 1440 → 1 hari. */
	const fmtCooldown = (m: number) => (m % 1440 === 0 ? `${m / 1440} hari` : m % 60 === 0 ? `${m / 60} jam` : `${m} menit`);
	const COOLDOWNS = [15, 30, 60, 180, 720, 1440];

	/* ---- who hears about what (per rule group, per level) ---- */
	type Audience = 'ops' | 'inst' | 'bulk';
	const AUDIENCE: Record<Audience, { name: string; ch: Record<Level, Channel[]>; n: Record<Level, number> }> = {
		ops: {
			name: 'Operator shift · supervisor distribusi · manajemen',
			ch: { waspada: ['Telegram'], siaga: ['WhatsApp', 'Telegram'], awas: ['WhatsApp', 'Telegram', 'Email'] },
			n: { waspada: 6, siaga: 8, awas: 18 }
		},
		inst: {
			name: 'Tim instrumentasi & telemetri',
			ch: { waspada: ['Email'], siaga: ['Email', 'Telegram'], awas: ['WhatsApp', 'Telegram', 'Email'] },
			n: { waspada: 3, siaga: 3, awas: 5 }
		},
		bulk: {
			name: 'Tim serah terima · PDAB Tirtatama',
			ch: { waspada: ['Email'], siaga: ['Email', 'WhatsApp'], awas: ['WhatsApp', 'Telegram', 'Email'] },
			n: { waspada: 4, siaga: 4, awas: 6 }
		}
	};
	const audienceOf = (param: string): Audience =>
		param === 'Baterai flowmeter' || param === 'Data tidak masuk' ? 'inst' : param === 'Deviasi air curah' ? 'bulk' : 'ops';

	let rules = $state(
		THRESHOLDS.map((t) => {
			const aud = AUDIENCE[audienceOf(t.param)];
			return {
				...t,
				ch: { waspada: [...aud.ch.waspada], siaga: [...aud.ch.siaga], awas: [...aud.ch.awas] } as Record<Level, Channel[]>
			};
		})
	);
	let selIdx = $state(0);
	let sel = $derived(rules[selIdx]);
	let dirty = $state(false);

	function toggleRule(i: number, on: boolean) {
		notify(`Aturan "${rules[i].param}" ${on ? 'diaktifkan' : 'dinonaktifkan'} (demo)`);
		dirty = true;
	}
	function toggleChannel(l: Level, c: Channel) {
		const list = rules[selIdx].ch[l];
		rules[selIdx].ch[l] = list.includes(c) ? list.filter((x) => x !== c) : [...list, c];
		dirty = true;
	}
	function save() {
		dirty = false;
		notify('Tingkat siaga & jeda notifikasi disimpan (demo, tidak dikirim ke logger)');
	}

	/* ---- live evaluation of each rule against the simulated network ---- */
	const PRESSURE_PTS = ASSETS.filter((a) => a.type === 'PT' || (a.type === 'DMA' && a.role === 'out'));
	const INLETS = ASSETS.filter((a) => a.type === 'DMA' && a.role === 'in');
	const RESERVOIRS = ASSETS.filter((a) => a.type === 'RES');
	// tonight's MNF (with LK-01 / LK-02) against each zone's 14-night baseline, same figure as Beranda
	const mnfRise = ZONES.map((z) => ({ z, rise: (mnf(z.id, true) / mnf(z.id, false) - 1) * 100 })).sort((a, b) => b.rise - a.rise);
	const lowBatt = DEVICES.filter((d) => d.fmBattery != null).sort((a, b) => (a.fmBattery ?? 0) - (b.fmBattery ?? 0))[0];
	const bulkDev = HANDOVER.map((h) => ({ id: h.id, d: ((h.supplierRead - h.month) / h.month) * 100 })).sort((a, b) => b.d - a.d)[0];

	function evaluate(param: string, h: number, tick: number): { level: AlertLevel; text: string } {
		switch (param) {
			case 'Tekanan minimum': {
				const pts = PRESSURE_PTS.map((a) => {
					const r = readLive(a, h, tick);
					return { a, p: (a.type === 'PT' ? r.p1 : r.p2) ?? 9 };
				}).sort((x, y) => x.p - y.p);
				const lv = levelBelow(pts[0].p, LIMITS.pMin);
				const n = pts.filter((x) => levelBelow(x.p, LIMITS.pMin) !== 'normal').length;
				return { level: lv, text: `${lv === 'normal' ? 'terendah ' : ''}${pts[0].a.id} ${fmtNum(pts[0].p, 2)} bar${n > 1 ? ` · +${n - 1} titik` : ''}` };
			}
			case 'Tekanan maksimum': {
				const top = INLETS.map((a) => ({ a, p: readLive(a, h, tick).p1 ?? 0 })).sort((x, y) => y.p - x.p)[0];
				const lv = levelAbove(top.p, LIMITS.pMax);
				return { level: lv, text: `${lv === 'normal' ? 'tertinggi ' : ''}${top.a.id} P1 ${fmtNum(top.p, 2)} bar` };
			}
			case 'Kenaikan MNF': {
				const top = mnfRise[0];
				return { level: levelAbove(top.rise, LIMITS.mnf), text: `${top.z.name} +${fmtNum(top.rise, 1)}% · tadi malam` };
			}
			case 'Residual debit (AI)':
				return { level: 'siaga', text: `${BURST.zone}-IN > 3σ sejak ${fmtClock(EVENTS[1].h)}` };
			case 'Deviasi air curah':
				return { level: 'normal', text: `selisih meter maks ${fmtNum(bulkDev.d, 2)}% (${bulkDev.id})` };
			case 'Level reservoir': {
				const low = RESERVOIRS.map((a) => ({ a, v: readLive(a, h, tick).level ?? 100 })).sort((x, y) => x.v - y.v)[0];
				const lv = levelBelow(low.v, LIMITS.level);
				return { level: lv, text: `${lv === 'normal' ? 'terendah ' : ''}${low.a.id} ${fmtNum(low.v, 0)}%` };
			}
			case 'Baterai flowmeter':
				return { level: levelBelow(lowBatt.fmBattery ?? 100, LIMITS.fmBattery), text: `${lowBatt.id} ${lowBatt.fmBattery}%` };
			case 'Data tidak masuk':
				return { level: 'normal', text: `${ASSETS.length}/${ASSETS.length} online · jeda < 1 menit` };
			default:
				return { level: 'normal', text: '—' };
		}
	}

	let states = $derived(rules.map((r) => evaluate(r.param, live.h, live.tick)));
	let activeCount = $derived(rules.filter((r) => r.on).length);
	let triggered = $derived(states.filter((s, i) => rules[i].on && s.level !== 'normal').length);

	/** Message for the detail panel: the live one when the rule is triggered, otherwise a Siaga example. */
	let preview = $derived.by(() => {
		const st = states[selIdx];
		const sign = `${fmtClock(live.h)} WIB — STESY Smart Water Tirtamarta`;
		if (st.level !== 'normal')
			return {
				live: true,
				text: `[${LEVEL_LABEL[st.level].toUpperCase()}] ${sel.param} · ${st.text} · ambang ${sel[st.level]} ${sel.unit} · ${sign}`
			};
		return { live: false, text: `[SIAGA] ${sel.param} ${sel.siaga} ${sel.unit} · ${sel.scope} · ${sign}` };
	});

	/* ---- notification log ---- */
	let log = $state(ALERT_LOG.map((a) => ({ ...a })));
	let sev = $state<SiteStatus | 'all'>('all');
	let channel = $state<Channel | 'all'>('all');
	let q = $state('');
	const SEV_LABEL: Record<SiteStatus, string> = { alarm: 'Awas', warn: 'Siaga', ok: 'Info' };
	const SEV_COLOR: Record<SiteStatus, string> = { alarm: LEVEL_COLOR.awas, warn: LEVEL_COLOR.siaga, ok: '#46D78F' };
	const SEVS: SiteStatus[] = ['alarm', 'warn', 'ok'];
	const countSev = (s: SiteStatus) => ALERT_LOG.filter((a) => a.sev === s).length;
	const total = CHANNEL_STATS.reduce((a, c) => a + c.sent, 0);
	const delivered = CHANNEL_STATS.reduce((a, c) => a + c.delivered, 0);
	const UNIT: Record<string, string> = { m: 'menit', h: 'jam', d: 'hari' };
	const ago = (t: string) => {
		const m = /^(\d+)([mhd])$/.exec(t);
		return m ? `${m[1]} ${UNIT[m[2]]} lalu` : t === 'now' ? 'baru saja' : t;
	};

	let rows = $derived(
		log.filter(
			(a) =>
				(sev === 'all' || a.sev === sev) &&
				(channel === 'all' || a.channels.includes(channel)) &&
				(a.msg + ' ' + a.code).toLowerCase().includes(q.trim().toLowerCase())
		)
	);
	let unread = $derived(log.filter((a) => !a.read).length);

	function markAll() {
		log = log.map((a) => ({ ...a, read: true }));
		notify('Semua notifikasi ditandai dibaca');
	}
</script>

<svelte:head><title>Tingkat Siaga · STESY Smart Water</title></svelte:head>

<div class="demo-page">
	<PageHead title="Tingkat Siaga & Notifikasi" sub="Ambang batas · jeda notifikasi per perangkat · WhatsApp · Telegram · Email" icon={Siren}>
		<button class="demo-btn" onclick={markAll} disabled={!unread}><CheckCheck size={15} /> Tandai dibaca{unread ? ` (${unread})` : ''}</button>
		<button class="demo-btn demo-btn--primary" onclick={save}><Save size={15} /> Simpan{dirty ? ' perubahan' : ''}</button>
	</PageHead>

	<div class="sites-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Terkirim · 24 jam</span>
			<span class="demo-stat__v">{total}<small>pesan</small></span>
			<span class="demo-stat__s">{delivered} diterima · {fmtNum((delivered / total) * 100, 1)}% · {triggered} aturan terpicu kini</span>
		</div>
		{#each CHANNEL_STATS as c (c.ch)}
			{@const Icon = CH_ICON[c.ch]}
			<div class="card demo-stat notif-ch notif-ch--{c.ch.toLowerCase()} siaga-ch--{c.ch.toLowerCase()}">
				<span class="demo-stat__k"><Icon size={13} /> {c.ch}</span>
				<span class="demo-stat__v">{c.sent}<small>pesan</small></span>
				<span class="twin-bar"><i style="width:{(c.sent / total) * 100}%"></i></span>
				<span class="demo-stat__s">{c.delivered} diterima{c.sent > c.delivered ? ` · ${c.sent - c.delivered} gagal, dikirim ulang` : ' · 100%'}</span>
			</div>
		{/each}
	</div>

	<section class="card siaga-rules">
		<div class="card-h">
			<div style="display:flex;flex-direction:column;gap:3px">
				<span class="label">Ambang tingkat siaga · {activeCount}/{rules.length} aktif</span>
				<span class="pdam-muted">dievaluasi tiap rekaman 1 menit · jeda berlaku per perangkat</span>
			</div>
			<span class="siaga-levels">
				{#each LEVELS as l (l)}<span class="siaga-lv siaga-lv--{l}">{LEVEL_LABEL[l]}</span>{/each}
			</span>
		</div>
		<div class="siaga-scroll">
			<table class="demo-table siaga-table">
				<thead>
					<tr>
						<th>Parameter</th>
						<th>Cakupan</th>
						<th>Waspada</th>
						<th>Siaga</th>
						<th>Awas</th>
						<th>Jeda notifikasi</th>
						<th>Kondisi kini</th>
						<th>Aktif</th>
					</tr>
				</thead>
				<tbody>
					{#each rules as r, i (r.param)}
						{@const st = states[i]}
						<tr class:is-focus={i === selIdx} class:is-off={!r.on}>
							<td>
								<button class="siaga-param" onclick={() => (selIdx = i)}>
									<b>{r.param}</b><small>{r.unit}</small>
								</button>
							</td>
							<td class="siaga-scope">{r.scope}</td>
							{#each LEVELS as l (l)}
								<td><span class="siaga-lv siaga-lv--{l} siaga-lv--val">{r[l]}</span></td>
							{/each}
							<td class="mono"><Timer size={12} style="vertical-align:-2px;color:var(--ink-mute)" /> {fmtCooldown(r.cooldown)}</td>
							<td>
								{#if r.on}
									<span class="siaga-now" style="--c:{LEVEL_COLOR[st.level]}"><i></i><b>{LEVEL_LABEL[st.level]}</b><small>{st.text}</small></span>
								{:else}
									<span class="siaga-now siaga-now--off">nonaktif</span>
								{/if}
							</td>
							<td>
								<label class="set-toggle set-toggle--bare">
									<input
										type="checkbox"
										bind:checked={r.on}
										onchange={(e) => toggleRule(i, e.currentTarget.checked)}
										aria-label="Aktifkan aturan {r.param}"
									/>
									<span class="set-switch" aria-hidden="true"></span>
								</label>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="card siaga-detail" aria-label="Atur aturan {sel.param}">
		<div class="siaga-detail__head">
			<div style="display:flex;flex-direction:column;gap:3px;min-width:0">
				<span class="label">Atur aturan · klik parameter di tabel</span>
				<div class="siaga-detail__title">{sel.param} <small>{sel.unit}</small></div>
				<div class="siaga-detail__scope">{sel.scope} · {AUDIENCE[audienceOf(sel.param)].name}</div>
			</div>
			<span class="siaga-now" style="--c:{LEVEL_COLOR[states[selIdx].level]}"><i></i><b>{LEVEL_LABEL[states[selIdx].level]}</b><small>{states[selIdx].text}</small></span>
		</div>

		<div class="siaga-detail__levels">
			{#each LEVELS as l (l)}
				<div class="siaga-lvbox siaga-lvbox--{l}">
					<div class="siaga-lvbox__h">
						<b>{LEVEL_LABEL[l]}</b>
						<span class="set-num siaga-lvbox__num">
							<input bind:value={rules[selIdx][l]} oninput={() => (dirty = true)} aria-label="Ambang {LEVEL_LABEL[l]} {sel.param}" />
							<small>{sel.unit}</small>
						</span>
					</div>
					<div class="siaga-lvbox__ch">
						{#each CHANNELS as c (c)}
							{@const Icon = CH_ICON[c]}
							<button class="siaga-chbtn" class:is-on={sel.ch[l].includes(c)} onclick={() => toggleChannel(l, c)} aria-pressed={sel.ch[l].includes(c)}>
								<Icon size={12} />
								{c}
							</button>
						{/each}
						<span class="siaga-lvbox__n"><Users size={12} /> {AUDIENCE[audienceOf(sel.param)].n[l]}</span>
					</div>
				</div>
			{/each}
		</div>

		<div class="siaga-detail__foot">
			<div class="set-fields siaga-detail__fields">
				<label>
					<span>Jeda notifikasi per perangkat</span>
					<select bind:value={rules[selIdx].cooldown} onchange={() => (dirty = true)}>
						{#each [...new Set([...COOLDOWNS, sel.cooldown])].sort((a, b) => a - b) as m (m)}
							<option value={m}>{fmtCooldown(m)}</option>
						{/each}
					</select>
				</label>
				<p class="siaga-detail__hint">
					Selama jeda, notifikasi ulang untuk perangkat yang sama ditahan. Kenaikan tingkat (mis. Siaga → Awas) selalu dikirim segera.
				</p>
			</div>

			<div class="siaga-preview" class:is-live={preview.live}>
				<span class="siaga-preview__h"><BellRing size={12} /> {preview.live ? 'Pesan terkirim saat ini' : 'Contoh pesan · belum terpicu'}</span>
				<p>{preview.text}</p>
			</div>
		</div>
	</section>

	<div class="card notif-card">
		<div class="card-h" style="margin-bottom:0">
			<div style="display:flex;flex-direction:column;gap:3px">
				<span class="label">Log notifikasi</span>
				<span class="pdam-muted">{ALERT_LOG.length} kejadian terakhir · {unread} belum dibaca</span>
			</div>
		</div>
		<div class="notif-tools">
			<div class="demo-chips" role="group" aria-label="Filter tingkat">
				<button class="demo-chip" class:is-on={sev === 'all'} onclick={() => (sev = 'all')}>Semua<small>{ALERT_LOG.length}</small></button>
				{#each SEVS as s (s)}
					<button class="demo-chip" class:is-on={sev === s} style="--c:{SEV_COLOR[s]}" onclick={() => (sev = s)}>
						<i></i>{SEV_LABEL[s]}<small>{countSev(s)}</small>
					</button>
				{/each}
			</div>
			<div class="demo-seg siaga-seg" role="group" aria-label="Filter kanal">
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
			{#each rows as a (a.code + a.t + a.msg)}
				<li class="notif-item notif-item--{a.sev}" class:is-unread={!a.read}>
					<span class="status-dot {a.sev}" style="width:9px;height:9px;margin-top:6px"></span>
					<div class="notif-item__body">
						<div class="notif-item__top">
							<b>{a.code}</b>
							<span class="notif-item__sev">{SEV_LABEL[a.sev]}</span>
							{#if !a.read}<span class="notif-item__new">BARU</span>{/if}
							<span class="notif-item__t">{ago(a.t)}</span>
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
