<script lang="ts">
	import { Settings, Save, MessageCircle, Smartphone, Send, Mail, UserPlus, Moon } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { DEMO_USERS, TB_SENSORS } from '$lib/components/demo-dashboard/data';
	import { GAUGES } from '$lib/components/demo-dashboard/twin/scenario';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';

	const nameOf = (id: string) => TB_SENSORS.find((s) => s.id === id)?.name ?? id;

	let thresholds = $state([
		...Object.values(GAUGES).map((g) => ({ id: g.id, param: 'TMA', unit: 'm', siaga: g.siaga, awas: g.awas, step: 0.1 })),
		{ id: 'ARR-01', param: 'Hujan', unit: 'mm/h', siaga: 20, awas: 50, step: 1 },
		{ id: 'ARR-02', param: 'Hujan', unit: 'mm/h', siaga: 20, awas: 50, step: 1 },
		{ id: 'WQ-03', param: 'pH min', unit: '', siaga: 6.5, awas: 6.0, step: 0.1 }
	]);
	let dirty = $state(false);

	let channels = $state([
		{ id: 'wa', label: 'WhatsApp', icon: MessageCircle, on: true, note: '14 grup · 32 nomor' },
		{ id: 'sms', label: 'SMS', icon: Smartphone, on: true, note: 'fallback bila WA gagal' },
		{ id: 'tg', label: 'Telegram', icon: Send, on: true, note: 'bot @beacon_tuba' },
		{ id: 'mail', label: 'Email', icon: Mail, on: false, note: 'ringkasan harian 07:00' }
	]);
	let quiet = $state(false);
	let users = $state(DEMO_USERS.map((u) => ({ ...u })));
	let sync = $state('2');

	function save() {
		dirty = false;
		notify('Pengaturan disimpan (demo, tidak dikirim ke server)');
	}
</script>

<svelte:head><title>Pengaturan · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Pengaturan" sub="Ambang batas, kanal notifikasi, pengguna & sistem" icon={Settings}>
		<button class="demo-btn demo-btn--primary" onclick={save}><Save size={15} /> Simpan{dirty ? ' perubahan' : ''}</button>
	</PageHead>

	<div class="settings-grid">
		<section class="card settings-wide">
			<div class="card-h">
				<span class="label">AMBANG BATAS PERINGATAN</span>
				<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)">dipakai EWS, alert & digital twin</span>
			</div>
			<table class="demo-table">
				<thead><tr><th>Stasiun</th><th>Parameter</th><th>Siaga</th><th>Awas</th></tr></thead>
				<tbody>
					{#each thresholds as t (t.id)}
						<tr>
							<td><b style="font-family:var(--font-mono)">{t.id}</b><div class="hydro-sub">{nameOf(t.id)}</div></td>
							<td>{t.param}</td>
							<td>
								<span class="set-num set-num--amber">
									<input type="number" step={t.step} bind:value={t.siaga} oninput={() => (dirty = true)} aria-label="Ambang siaga {t.id}" />
									<small>{t.unit}</small>
								</span>
							</td>
							<td>
								<span class="set-num set-num--danger">
									<input type="number" step={t.step} bind:value={t.awas} oninput={() => (dirty = true)} aria-label="Ambang awas {t.id}" />
									<small>{t.unit}</small>
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section class="card">
			<div class="card-h"><span class="label">KANAL NOTIFIKASI</span></div>
			<div class="set-list">
				{#each channels as c (c.id)}
					{@const Icon = c.icon}
					<label class="set-toggle">
						<span class="set-toggle__icon"><Icon size={16} /></span>
						<span class="set-toggle__body"><b>{c.label}</b><small>{c.note}</small></span>
						<input type="checkbox" bind:checked={c.on} onchange={() => (dirty = true)} />
						<span class="set-switch" aria-hidden="true"></span>
					</label>
				{/each}
				<label class="set-toggle">
					<span class="set-toggle__icon"><Moon size={16} /></span>
					<span class="set-toggle__body"><b>Jam tenang 22:00–05:00</b><small>alert Normal & Siaga ditunda, Awas tetap dikirim</small></span>
					<input type="checkbox" bind:checked={quiet} onchange={() => (dirty = true)} />
					<span class="set-switch" aria-hidden="true"></span>
				</label>
			</div>
		</section>

		<section class="card">
			<div class="card-h"><span class="label">SISTEM</span></div>
			<div class="set-fields">
				<label>
					<span>Interval sinkron telemetri</span>
					<select bind:value={sync} onchange={() => (dirty = true)}>
						<option value="2">2 detik</option>
						<option value="5">5 detik</option>
						<option value="10">10 detik</option>
					</select>
				</label>
				<label>
					<span>Zona waktu</span>
					<select disabled><option>WIB · UTC+7</option></select>
				</label>
				<label>
					<span>Horizon prakiraan ARGO</span>
					<select disabled><option>16 jam</option></select>
				</label>
				<div class="set-about">
					<span>Versi</span><b>Command Center 2.4 · pilot</b>
					<span>Gateway</span><b>4 aktif · LoRa + 4G</b>
				</div>
			</div>
		</section>

		<section class="card settings-wide">
			<div class="card-h">
				<span class="label">PENGGUNA & AKSES</span>
				<button class="demo-btn demo-btn--sm" onclick={() => notify('Undangan pengguna dikirim (demo)')}><UserPlus size={13} /> Undang</button>
			</div>
			<table class="demo-table">
				<thead><tr><th>Nama</th><th>Unit</th><th>Peran</th><th>Aktif</th></tr></thead>
				<tbody>
					{#each users as u (u.email)}
						<tr>
							<td><b>{u.name}</b><div class="hydro-sub">{u.email}</div></td>
							<td>{u.unit}</td>
							<td><span class="set-role set-role--{u.role.toLowerCase()}">{u.role}</span></td>
							<td>
								<label class="set-toggle set-toggle--bare">
									<input type="checkbox" bind:checked={u.active} onchange={() => (dirty = true)} aria-label="Aktifkan {u.name}" />
									<span class="set-switch" aria-hidden="true"></span>
								</label>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	</div>
</div>
