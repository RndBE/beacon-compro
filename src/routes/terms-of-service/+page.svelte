<script lang="ts">
	import { locale } from "$lib/i18n";

	const pageCopy = {
		ID: {
			metaTitle: "Ketentuan Layanan | Beacon Engineering",
			metaDesc: "Ketentuan penggunaan situs dan layanan informasi Beacon Engineering.",
			badge: "Legal",
			title: "Ketentuan Layanan",
			desc: "Ketentuan ini mengatur penggunaan situs Beacon Engineering dan informasi layanan yang tersedia di dalamnya.",
			updated: "Terakhir diperbarui: 6 Mei 2026",
			sections: [
				{
					title: "Penggunaan Situs",
					body: "Situs ini disediakan sebagai sumber informasi mengenai layanan, solusi, proyek, dan kanal komunikasi Beacon Engineering. Pengguna wajib menggunakan situs secara wajar dan tidak mengganggu keamanan, performa, atau akses pihak lain.",
				},
				{
					title: "Informasi Produk dan Layanan",
					body: "Konten situs bersifat informatif. Spesifikasi, cakupan layanan, jadwal implementasi, dan harga final mengikuti dokumen penawaran, kontrak, atau kesepakatan tertulis yang diterbitkan secara resmi.",
				},
				{
					title: "Permintaan Konsultasi",
					body: "Pengiriman formulir, email, atau pesan WhatsApp tidak otomatis membentuk hubungan kontraktual. Tim kami dapat meninjau kebutuhan, meminta informasi tambahan, dan memberikan tindak lanjut sesuai kapasitas operasional.",
				},
				{
					title: "Hak Kekayaan Intelektual",
					body: "Logo, teks, gambar, desain, dokumentasi, dan materi lain pada situs ini merupakan milik Beacon Engineering atau pihak pemberi lisensi. Penggunaan ulang untuk kepentingan komersial memerlukan persetujuan tertulis.",
				},
				{
					title: "Batasan Tanggung Jawab",
					body: "Kami berupaya menjaga informasi tetap akurat dan situs tetap tersedia, namun tidak menjamin situs selalu bebas gangguan. Beacon Engineering tidak bertanggung jawab atas kerugian tidak langsung akibat penggunaan informasi situs tanpa verifikasi lanjutan.",
				},
				{
					title: "Perubahan Ketentuan",
					body: "Ketentuan ini dapat diperbarui sewaktu-waktu. Penggunaan situs setelah pembaruan dianggap sebagai penerimaan atas versi terbaru yang dipublikasikan di halaman ini.",
				},
			],
			contactTitle: "Pertanyaan Ketentuan",
			contactPrefix: "Untuk klarifikasi penggunaan situs atau layanan, hubungi",
			contactMiddle: "atau telepon",
		},
		EN: {
			metaTitle: "Terms of Service | Beacon Engineering",
			metaDesc: "Terms for using the Beacon Engineering website and service information.",
			badge: "Legal",
			title: "Terms of Service",
			desc: "These terms govern the use of the Beacon Engineering website and the service information available on it.",
			updated: "Last updated: May 6, 2026",
			sections: [
				{
					title: "Website Use",
					body: "This website is provided as an information source about Beacon Engineering services, solutions, projects, and communication channels. Users must use the website reasonably and must not disrupt security, performance, or access for others.",
				},
				{
					title: "Product and Service Information",
					body: "Website content is informational. Final specifications, service scope, implementation schedules, and pricing follow official proposals, contracts, or written agreements issued by Beacon Engineering.",
				},
				{
					title: "Consultation Requests",
					body: "Submitting forms, emails, or WhatsApp messages does not automatically create a contractual relationship. Our team may review requirements, request additional information, and follow up according to operational capacity.",
				},
				{
					title: "Intellectual Property Rights",
					body: "Logos, text, images, designs, documentation, and other materials on this website are owned by Beacon Engineering or its licensors. Reuse for commercial purposes requires written approval.",
				},
				{
					title: "Limitation of Liability",
					body: "We strive to keep information accurate and the website available, but we do not guarantee the website will always be interruption-free. Beacon Engineering is not responsible for indirect losses arising from use of website information without further verification.",
				},
				{
					title: "Changes to Terms",
					body: "These terms may be updated from time to time. Continued use of the website after updates is considered acceptance of the latest version published on this page.",
				},
			],
			contactTitle: "Terms Questions",
			contactPrefix: "For clarification about website or service use, contact",
			contactMiddle: "or phone",
		},
	};

	const copy = $derived(pageCopy[$locale]);
</script>

<svelte:head>
	<title>{copy.metaTitle}</title>
	<meta
		name="description"
		content={copy.metaDesc}
	/>
</svelte:head>

<section class="bg-white">
	<div class="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-28">
		<div class="lg:col-span-4">
			<div class="sticky top-28 space-y-5">
				<div class="flex items-center gap-3">
					<div class="h-px w-8 bg-[#C8102E]"></div>
					<p class="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#C8102E]">
						{copy.badge}
					</p>
				</div>
				<h1 class="font-heading text-4xl font-bold leading-none tracking-tight text-zinc-950 sm:text-5xl">
					{copy.title}
				</h1>
				<p class="max-w-[34ch] text-sm font-medium leading-relaxed text-zinc-500 sm:text-base">
					{copy.desc}
				</p>
				<p class="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
					{copy.updated}
				</p>
			</div>
		</div>

		<div class="lg:col-span-7 lg:col-start-6">
			<div class="divide-y divide-zinc-200 border-y border-zinc-200">
				{#each copy.sections as section}
					<section class="py-7 sm:py-8">
						<h2 class="text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">{section.title}</h2>
						<p class="mt-3 max-w-[72ch] text-sm leading-relaxed text-zinc-600 sm:text-base">
							{section.body}
						</p>
					</section>
				{/each}
			</div>

			<div class="mt-10 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
				<h2 class="text-base font-bold text-zinc-950">{copy.contactTitle}</h2>
				<p class="mt-2 text-sm leading-relaxed text-zinc-600">
					{copy.contactPrefix}
					<a class="font-semibold text-[#C8102E] hover:text-zinc-950" href="mailto:info@bejogja.com">info@bejogja.com</a>
					{copy.contactMiddle}
					<a class="font-semibold text-[#C8102E] hover:text-zinc-950" href="tel:02744986899">(0274) 4986899</a>.
				</p>
			</div>
		</div>
	</div>
</section>
