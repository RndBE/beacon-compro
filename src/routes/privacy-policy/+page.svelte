<script lang="ts">
	import { locale } from "$lib/i18n";

	const pageCopy = {
		ID: {
			metaTitle: "Kebijakan Privasi | Beacon Engineering",
			metaDesc:
				"Kebijakan privasi Beacon Engineering terkait pengumpulan, penggunaan, penyimpanan, dan perlindungan data pengguna.",
			badge: "Legal",
			title: "Kebijakan Privasi",
			desc: "Kebijakan ini menjelaskan bagaimana PT Arta Teknologi Comunindo mengelola data yang diterima melalui situs dan kanal komunikasi Beacon Engineering.",
			updated: "Terakhir diperbarui: 6 Mei 2026",
			sections: [
				{
					title: "Data yang Kami Kumpulkan",
					body: "Kami dapat menerima nama, alamat email, nomor telepon, instansi, kebutuhan proyek, dan isi pesan yang dikirim melalui formulir kontak, WhatsApp, email, atau kanal komunikasi resmi Beacon Engineering.",
				},
				{
					title: "Cara Data Digunakan",
					body: "Data digunakan untuk menindaklanjuti permintaan konsultasi, menyiapkan penawaran teknis, mengelola komunikasi proyek, meningkatkan layanan, serta memenuhi kewajiban administratif dan hukum yang berlaku.",
				},
				{
					title: "Penyimpanan dan Keamanan",
					body: "Kami menerapkan pembatasan akses internal, pengamanan akun, dan praktik operasional yang wajar untuk melindungi data. Tidak ada metode transmisi atau penyimpanan digital yang sepenuhnya bebas risiko.",
				},
				{
					title: "Pembagian Data",
					body: "Kami tidak menjual data pribadi. Data hanya dibagikan kepada pihak pendukung operasional, mitra proyek, atau otoritas yang berwenang jika diperlukan untuk pelaksanaan layanan atau diwajibkan oleh hukum.",
				},
				{
					title: "Hak Pengguna",
					body: "Anda dapat meminta akses, koreksi, pembaruan, atau penghapusan data pribadi dengan menghubungi kanal resmi kami. Beberapa data mungkin tetap disimpan apabila dibutuhkan untuk arsip transaksi, keamanan, atau kewajiban hukum.",
				},
				{
					title: "Pembaruan Kebijakan",
					body: "Kebijakan ini dapat diperbarui sewaktu-waktu untuk menyesuaikan perubahan layanan, operasional, atau regulasi. Versi terbaru akan tersedia di halaman ini.",
				},
			],
			contactTitle: "Kontak Privasi",
			contactPrefix: "Untuk pertanyaan terkait kebijakan privasi, hubungi",
			contactMiddle: "atau WhatsApp",
		},
		EN: {
			metaTitle: "Privacy Policy | Beacon Engineering",
			metaDesc:
				"Beacon Engineering privacy policy regarding the collection, use, storage, and protection of user data.",
			badge: "Legal",
			title: "Privacy Policy",
			desc: "This policy explains how PT Arta Teknologi Comunindo manages data received through the Beacon Engineering website and official communication channels.",
			updated: "Last updated: May 6, 2026",
			sections: [
				{
					title: "Data We Collect",
					body: "We may receive names, email addresses, phone numbers, institutions, project requirements, and message contents submitted through contact forms, WhatsApp, email, or Beacon Engineering's official communication channels.",
				},
				{
					title: "How Data Is Used",
					body: "Data is used to follow up consultation requests, prepare technical proposals, manage project communications, improve services, and fulfill applicable administrative and legal obligations.",
				},
				{
					title: "Storage and Security",
					body: "We apply internal access controls, account safeguards, and reasonable operational practices to protect data. No digital transmission or storage method is completely risk-free.",
				},
				{
					title: "Data Sharing",
					body: "We do not sell personal data. Data is shared only with operational support parties, project partners, or authorized authorities when required to deliver services or comply with the law.",
				},
				{
					title: "User Rights",
					body: "You may request access, correction, updates, or deletion of personal data by contacting our official channels. Some data may remain stored when needed for transaction records, security, or legal obligations.",
				},
				{
					title: "Policy Updates",
					body: "This policy may be updated from time to time to reflect changes in services, operations, or regulations. The latest version will be available on this page.",
				},
			],
			contactTitle: "Privacy Contact",
			contactPrefix: "For questions about this privacy policy, contact",
			contactMiddle: "or WhatsApp",
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
					<a class="font-semibold text-[#C8102E] hover:text-zinc-950" href="https://wa.me/628112632151">+62 811 2632 151</a>.
				</p>
			</div>
		</div>
	</div>
</section>
