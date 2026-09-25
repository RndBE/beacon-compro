<script lang="ts">
	import { FileText, FileDown, Send, Plus, CalendarDays, Printer } from '@lucide/svelte';
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import { REPORTS, type ReportItem } from '$lib/components/demo-dashboard/data';
	import { notify } from '$lib/components/demo-dashboard/ui.svelte';

	const KINDS = ['Semua', 'Harian', 'Mingguan', 'Bulanan', 'Insiden'] as const;
	let kind = $state<(typeof KINDS)[number]>('Semua');
	let selId = $state(REPORTS[0].id);

	const day = 86_400_000;
	const fmt = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	function period(r: ReportItem) {
		const end = new Date(Date.now() - r.ago * day);
		if (r.span === 1) return fmt(end);
		const start = new Date(end.getTime() - (r.span - 1) * day);
		return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – ${fmt(end)}`;
	}

	let list = $derived(REPORTS.filter((r) => kind === 'Semua' || r.kind === kind));
	let sel = $derived(REPORTS.find((r) => r.id === selId) ?? REPORTS[0]);

	// headline numbers per report kind for the preview
	const SUMMARY: Record<ReportItem['kind'], { k: string; v: string }[]> = {
		Harian: [
			{ k: 'Uptime node', v: '99.6%' },
			{ k: 'Alert terkirim', v: '186' },
			{ k: 'TMA maks AWLR-02', v: '3.42 m' },
			{ k: 'Hujan maks', v: '32.1 mm/h' }
		],
		Mingguan: [
			{ k: 'Curah hujan 7 hari', v: '512 mm' },
			{ k: 'Hari status Siaga', v: '3' },
			{ k: 'Debit rata-rata', v: '128 m³/s' },
			{ k: 'Jam operasi pompa', v: '1.284 j' }
		],
		Bulanan: [
			{ k: 'Ketersediaan sistem', v: '99.4%' },
			{ k: 'Insiden ditangani', v: '14' },
			{ k: 'Rata-rata respons', v: '6 menit' },
			{ k: 'Rekomendasi ARGO', v: '31' }
		],
		Insiden: [
			{ k: 'Tingkat', v: 'Awas' },
			{ k: 'Durasi', v: '42 menit' },
			{ k: 'Penerima alert', v: '18' },
			{ k: 'Status', v: 'Tindak lanjut' }
		]
	};
</script>

<svelte:head><title>Laporan · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Laporan" sub="Laporan otomatis harian, mingguan, bulanan & insiden" icon={FileText}>
		<button class="demo-btn demo-btn--primary" onclick={() => notify('Laporan baru sedang disusun (demo)')}><Plus size={15} /> Buat laporan</button>
	</PageHead>

	<div class="report-layout">
		<div class="card report-list">
			<div class="demo-chips" role="group" aria-label="Jenis laporan" style="margin-bottom:12px">
				{#each KINDS as k (k)}
					<button class="demo-chip" class:is-on={kind === k} onclick={() => (kind = k)}>
						{k}<small>{k === 'Semua' ? REPORTS.length : REPORTS.filter((r) => r.kind === k).length}</small>
					</button>
				{/each}
			</div>
			<ul>
				{#each list as r (r.id)}
					<li>
						<button class="report-row" class:is-on={r.id === selId} onclick={() => (selId = r.id)}>
							<span class="report-row__icon report-row__icon--{r.kind.toLowerCase()}"><FileText size={16} /></span>
							<span class="report-row__body">
								<b>{r.title}</b>
								<span><CalendarDays size={11} /> {period(r)} · {r.pages} hal · {r.size}</span>
							</span>
							<span class="report-row__kind">{r.kind}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<div class="card report-preview">
			<div class="report-paper">
				<div class="report-paper__head">
					<div>
						<span class="report-paper__eyebrow">{sel.id} · Laporan {sel.kind}</span>
						<h2>{sel.title}</h2>
						<span class="report-paper__period">Periode {period(sel)} · Kabupaten Tulang Bawang</span>
					</div>
					<span class="report-paper__logo">BEACON</span>
				</div>
				<div class="report-paper__kpis">
					{#each SUMMARY[sel.kind] as s (s.k)}
						<div><span>{s.k}</span><b>{s.v}</b></div>
					{/each}
				</div>
				<div class="report-paper__chart" aria-hidden="true">
					{#each Array.from({ length: 14 }, (_, i) => 30 + 55 * Math.abs(Math.sin(i * 0.9 + sel.pages))) as h, i (i)}
						<i style="height:{h}%"></i>
					{/each}
				</div>
				<div class="report-paper__lines" aria-hidden="true"><i></i><i></i><i style="width:72%"></i><i></i><i style="width:54%"></i></div>
			</div>
			<div class="report-actions">
				<button class="demo-btn demo-btn--primary" onclick={() => notify(`${sel.id}.pdf siap diunduh (demo)`)}><FileDown size={15} /> Unduh PDF</button>
				<button class="demo-btn" onclick={() => notify('Laporan dikirim ke 14 penerima WhatsApp (demo)')}><Send size={15} /> Kirim</button>
				<button class="demo-btn" onclick={() => notify('Dikirim ke printer Command Center (demo)')}><Printer size={15} /> Cetak</button>
			</div>
		</div>
	</div>
</div>
