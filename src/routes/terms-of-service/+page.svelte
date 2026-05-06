<script lang="ts">
	const sections = [
		{
			title: 'Penggunaan Situs',
			body: 'Situs ini disediakan sebagai sumber informasi mengenai layanan, solusi, proyek, dan kanal komunikasi Beacon Engineering. Pengguna wajib menggunakan situs secara wajar dan tidak mengganggu keamanan, performa, atau akses pihak lain.'
		},
		{
			title: 'Informasi Produk dan Layanan',
			body: 'Konten situs bersifat informatif. Spesifikasi, cakupan layanan, jadwal implementasi, dan harga final mengikuti dokumen penawaran, kontrak, atau kesepakatan tertulis yang diterbitkan secara resmi.'
		},
		{
			title: 'Permintaan Konsultasi',
			body: 'Pengiriman formulir, email, atau pesan WhatsApp tidak otomatis membentuk hubungan kontraktual. Tim kami dapat meninjau kebutuhan, meminta informasi tambahan, dan memberikan tindak lanjut sesuai kapasitas operasional.'
		},
		{
			title: 'Hak Kekayaan Intelektual',
			body: 'Logo, teks, gambar, desain, dokumentasi, dan materi lain pada situs ini merupakan milik Beacon Engineering atau pihak pemberi lisensi. Penggunaan ulang untuk kepentingan komersial memerlukan persetujuan tertulis.'
		},
		{
			title: 'Batasan Tanggung Jawab',
			body: 'Kami berupaya menjaga informasi tetap akurat dan situs tetap tersedia, namun tidak menjamin situs selalu bebas gangguan. Beacon Engineering tidak bertanggung jawab atas kerugian tidak langsung akibat penggunaan informasi situs tanpa verifikasi lanjutan.'
		},
		{
			title: 'Perubahan Ketentuan',
			body: 'Ketentuan ini dapat diperbarui sewaktu-waktu. Penggunaan situs setelah pembaruan dianggap sebagai penerimaan atas versi terbaru yang dipublikasikan di halaman ini.'
		}
	];
</script>

<svelte:head>
	<title>Terms of Service | Beacon Engineering</title>
	<meta
		name="description"
		content="Ketentuan penggunaan situs dan layanan informasi Beacon Engineering."
	/>
</svelte:head>

<section class="bg-white">
	<div class="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-28">
		<div class="lg:col-span-4">
			<div class="sticky top-28 space-y-5">
				<div class="flex items-center gap-3">
					<div class="h-px w-8 bg-[#C8102E]"></div>
					<p class="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#C8102E]">
						Legal
					</p>
				</div>
				<h1 class="font-heading text-4xl font-bold leading-none tracking-tight text-zinc-950 sm:text-5xl">
					Terms of Service
				</h1>
				<p class="max-w-[34ch] text-sm font-medium leading-relaxed text-zinc-500 sm:text-base">
					Ketentuan ini mengatur penggunaan situs Beacon Engineering dan informasi layanan yang tersedia di dalamnya.
				</p>
				<p class="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
					Terakhir diperbarui: 6 Mei 2026
				</p>
			</div>
		</div>

		<div class="lg:col-span-7 lg:col-start-6">
			<div class="divide-y divide-zinc-200 border-y border-zinc-200">
				{#each sections as section}
					<section class="py-7 sm:py-8">
						<h2 class="text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">{section.title}</h2>
						<p class="mt-3 max-w-[72ch] text-sm leading-relaxed text-zinc-600 sm:text-base">
							{section.body}
						</p>
					</section>
				{/each}
			</div>

			<div class="mt-10 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
				<h2 class="text-base font-bold text-zinc-950">Pertanyaan Ketentuan</h2>
				<p class="mt-2 text-sm leading-relaxed text-zinc-600">
					Untuk klarifikasi penggunaan situs atau layanan, hubungi
					<a class="font-semibold text-[#C8102E] hover:text-zinc-950" href="mailto:info@bejogja.com">info@bejogja.com</a>
					atau WhatsApp
					<a class="font-semibold text-[#C8102E] hover:text-zinc-950" href="https://wa.me/628112850986">0811-2850-9986</a>.
				</p>
			</div>
		</div>
	</div>
</section>
