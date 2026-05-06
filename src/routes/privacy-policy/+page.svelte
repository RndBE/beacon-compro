<script lang="ts">
	const sections = [
		{
			title: 'Data yang Kami Kumpulkan',
			body: 'Kami dapat menerima nama, alamat email, nomor telepon, instansi, kebutuhan proyek, dan isi pesan yang dikirim melalui formulir kontak, WhatsApp, email, atau kanal komunikasi resmi Beacon Engineering.'
		},
		{
			title: 'Cara Data Digunakan',
			body: 'Data digunakan untuk menindaklanjuti permintaan konsultasi, menyiapkan penawaran teknis, mengelola komunikasi proyek, meningkatkan layanan, serta memenuhi kewajiban administratif dan hukum yang berlaku.'
		},
		{
			title: 'Penyimpanan dan Keamanan',
			body: 'Kami menerapkan pembatasan akses internal, pengamanan akun, dan praktik operasional yang wajar untuk melindungi data. Tidak ada metode transmisi atau penyimpanan digital yang sepenuhnya bebas risiko.'
		},
		{
			title: 'Pembagian Data',
			body: 'Kami tidak menjual data pribadi. Data hanya dibagikan kepada pihak pendukung operasional, mitra proyek, atau otoritas yang berwenang jika diperlukan untuk pelaksanaan layanan atau diwajibkan oleh hukum.'
		},
		{
			title: 'Hak Pengguna',
			body: 'Anda dapat meminta akses, koreksi, pembaruan, atau penghapusan data pribadi dengan menghubungi kanal resmi kami. Beberapa data mungkin tetap disimpan apabila dibutuhkan untuk arsip transaksi, keamanan, atau kewajiban hukum.'
		},
		{
			title: 'Pembaruan Kebijakan',
			body: 'Kebijakan ini dapat diperbarui sewaktu-waktu untuk menyesuaikan perubahan layanan, operasional, atau regulasi. Versi terbaru akan tersedia di halaman ini.'
		}
	];
</script>

<svelte:head>
	<title>Privacy Policy | Beacon Engineering</title>
	<meta
		name="description"
		content="Kebijakan privasi Beacon Engineering terkait pengumpulan, penggunaan, penyimpanan, dan perlindungan data pengguna."
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
					Privacy Policy
				</h1>
				<p class="max-w-[34ch] text-sm font-medium leading-relaxed text-zinc-500 sm:text-base">
					Kebijakan ini menjelaskan bagaimana PT Arta Teknologi Comunindo mengelola data yang diterima melalui situs dan kanal komunikasi Beacon Engineering.
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
				<h2 class="text-base font-bold text-zinc-950">Kontak Privasi</h2>
				<p class="mt-2 text-sm leading-relaxed text-zinc-600">
					Untuk pertanyaan terkait kebijakan privasi, hubungi
					<a class="font-semibold text-[#C8102E] hover:text-zinc-950" href="mailto:info@bejogja.com">info@bejogja.com</a>
					atau WhatsApp
					<a class="font-semibold text-[#C8102E] hover:text-zinc-950" href="https://wa.me/628112850986">0811-2850-9986</a>.
				</p>
			</div>
		</div>
	</div>
</section>
