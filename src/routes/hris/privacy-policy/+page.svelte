<script lang="ts">
	// Privacy Policy for the HRIS Beacon mobile app (employee-only HR app).
	// Distinct from the company-website policy at /privacy-policy.
	// English only; ported faithfully from PRIVACY_POLICY.md.

	const CONTACT_EMAIL = "support@bejogja.com";
	const LAST_UPDATED = "June 17, 2026";

	// Split a string into plain/bold/email segments based on **markdown bold**.
	// Emails inside bold are rendered as mailto links. No {@html}, so no XSS surface.
	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function parseRich(text: string): { text: string; bold: boolean; email: boolean }[] {
		const out: { text: string; bold: boolean; email: boolean }[] = [];
		const re = /\*\*([^*]+)\*\*/g;
		let last = 0;
		let m: RegExpExecArray | null;
		while ((m = re.exec(text)) !== null) {
			if (m.index > last) out.push({ text: text.slice(last, m.index), bold: false, email: false });
			out.push({ text: m[1], bold: true, email: EMAIL_RE.test(m[1]) });
			last = m.index + m[0].length;
		}
		if (last < text.length) out.push({ text: text.slice(last), bold: false, email: false });
		return out;
	}

	type Block =
		| { kind: "p"; text: string }
		| { kind: "sub"; heading: string; text: string; note?: string }
		| { kind: "labeled"; items: { label: string; text: string }[] }
		| { kind: "list"; items: string[] };

	type Section = { n: string; title: string; blocks: Block[] };

	const intro = [
		'This Privacy Policy explains how **PT Arta Teknologi Comunindo** ("we", "us", "the Company") collects, uses, stores, shares, and protects your information when you use the **HRIS Beacon** mobile application ("the App").',
		"HRIS Beacon is an **internal application for our employees only**. Accounts are created and provisioned by the Company's HR/administrator; there is no public sign-up. The App is used for workforce attendance, leave and overtime requests, daily and business-trip reports, payslips, and related HR self-service.",
		"We **do not** use your information for advertising or for tracking you across other apps or websites.",
	];

	const sections: Section[] = [
		{
			n: "1",
			title: "Information We Collect",
			blocks: [
				{
					kind: "sub",
					heading: "a. Account & Profile Information",
					text: "Provided by your employer as part of your HR record and shown in the App, including: full name, employee ID/code, email address, phone number, home address (ID card and residential), place and date of birth, gender, marital status, religion, blood type, national identity number (NIK), position, department, company, job level, employment status, and employment dates.",
					note: "Some of this information (e.g., religion, blood type, national ID) is considered sensitive. It originates from your employer's HR records and is shown to you for your reference and used solely for HR/administrative purposes.",
				},
				{
					kind: "sub",
					heading: "b. Attendance & Location Data",
					text: "When you clock in or clock out, we collect the **precise location (GPS coordinates)** of your device at that moment, along with the date and time, to verify that you are at an authorized workplace. Location is collected **only at the time of clock in/out**, not continuously in the background.",
				},
				{
					kind: "sub",
					heading: "c. Face Data (Biometric Verification)",
					text: "We capture a **photo (selfie) of your face** using the device camera (1) when you register/enroll your face in the App, and (2) each time you clock in or out. See **Section 3 — Face Data** below for full details.",
				},
				{
					kind: "sub",
					heading: "d. Photos & Documents",
					text: "Photos and files (e.g., attachments for business-trip reports, expense/budget requests) that you choose to upload.",
				},
				{
					kind: "sub",
					heading: "e. Requests & User Content",
					text: "Information you submit through the App, such as leave requests, overtime requests, expense/budget requests, daily work reports, business-trip reports, data-change requests, and any text, reasons, or notes you enter.",
				},
				{
					kind: "sub",
					heading: "f. Payroll & Financial Information",
					text: "Payslip details that the Company makes available to you (salary, allowances, deductions, tax, and any loan information), shown in the App for your reference.",
				},
				{
					kind: "sub",
					heading: "g. Device & Technical Information",
					text: "A device push notification token (Firebase Cloud Messaging) used to deliver notifications, plus basic technical information such as device/app version and IP address, used to operate and secure the App.",
				},
			],
		},
		{
			n: "2",
			title: "How We Use Your Information",
			blocks: [
				{
					kind: "p",
					text: "We use your information only to operate the App and run HR processes, specifically to:",
				},
				{
					kind: "list",
					items: [
						"Record and verify your attendance (clock in/out), including location and face verification;",
						"Process and route your requests (leave, overtime, expenses, reports, data changes) and enable managers to review and approve them;",
						"Display your profile, employment information, and payslips;",
						"Send you notifications (e.g., reminders and the status of your requests);",
						'Maintain security, prevent fraudulent or duplicate attendance ("buddy-punching"), and protect the App;',
						"Provide support and comply with legal and HR record-keeping obligations.",
					],
				},
				{
					kind: "p",
					text: "We **do not** sell your information and **do not** use it for advertising or cross-app tracking.",
				},
			],
		},
		{
			n: "3",
			title: "Face Data / Biometric Verification",
			blocks: [
				{
					kind: "p",
					text: "HRIS Beacon uses face verification **only** to confirm employee identity during attendance (clock in and clock out).",
				},
				{
					kind: "labeled",
					items: [
						{
							label: "What we collect.",
							text: "When you register your face in the App and each time you clock in or out, the App captures a photo (selfie) of your face using the device camera. The App does **not** use Apple Face ID / TrueDepth data or any 3D face map — it captures ordinary camera photos only.",
						},
						{
							label: "How we use it.",
							text: "Your face photo is used **solely** to verify that you are the employee clocking in/out and to prevent fraudulent attendance. At clock in/out, our own server computes a mathematical face descriptor (a numeric representation) from your selfie and compares it to your enrolled reference photo to confirm a match. We **do not** use face data for advertising, profiling, tracking, or any purpose other than attendance verification.",
						},
						{
							label: "Sharing.",
							text: "We **do not** share your face data with any third party. This face data is **excluded from any general data-sharing** described elsewhere in this Policy. All face detection and matching is performed **on our own private Company servers** using a self-hosted model; **no face image or face descriptor is ever sent to any external or third-party face-recognition service.**",
						},
						{
							label: "Storage & retention.",
							text: "Face photos are stored only on our own private, access-controlled servers. Your reference photo is retained while your employee account is active and is deleted when you are offboarded or upon your deletion request. Attendance selfies are retained with your attendance records for the duration of your employment and then deleted.",
						},
						{
							label: "Your choices.",
							text: "You can request deletion of your face data at any time by contacting **support@bejogja.com**.",
						},
					],
				},
			],
		},
		{
			n: "4",
			title: "Location Data",
			blocks: [
				{
					kind: "p",
					text: "We collect **precise location** only at the moment you clock in or out, to confirm you are at an authorized workplace. We do not track your location continuously or in the background. You can disable location access in your device settings, but attendance features that require location verification may not work as a result.",
				},
			],
		},
		{
			n: "5",
			title: "How We Share Information",
			blocks: [
				{ kind: "p", text: "We share information only as needed to operate the App:" },
				{
					kind: "list",
					items: [
						"**Within the Company.** Your information is accessible to authorized HR personnel and your approving managers, as part of normal HR operations.",
						"**Service providers (processors).** We use trusted infrastructure providers strictly to operate the App — for example, server/cloud hosting, and **Google Firebase Cloud Messaging** to deliver push notifications (your device push token is processed by Google solely to deliver notifications). These providers may only process data on our behalf and for these purposes.",
						"**Legal.** We may disclose information if required by law or to protect rights, safety, and security.",
					],
				},
				{
					kind: "p",
					text: "We **do not** sell your data, **do not** use it for advertising, and — as stated in Section 3 — **never** share your face/biometric data with any third party.",
				},
			],
		},
		{
			n: "6",
			title: "Data Retention",
			blocks: [
				{
					kind: "p",
					text: "We keep your information for as long as your employee account is active and as required to provide the App and meet legal/HR record-keeping obligations. When you are offboarded or upon a valid deletion request, we delete or anonymize your personal data, including your face reference photo and attendance selfies, except where we are legally required to retain certain records (e.g., payroll/tax records) for a defined period.",
				},
			],
		},
		{
			n: "7",
			title: "Data Security",
			blocks: [
				{
					kind: "p",
					text: "We protect your information using industry-standard measures, including encryption in transit (HTTPS), access controls, and restricting access to authorized personnel. No method of transmission or storage is 100% secure, but we work to protect your information and respond to incidents appropriately.",
				},
			],
		},
		{
			n: "8",
			title: "Your Rights & Choices",
			blocks: [
				{
					kind: "p",
					text: "Subject to applicable law, you may request to **access, correct, or delete** your personal data, and to withdraw consent for optional permissions (e.g., camera or location) via your device settings. Because the App is provided by your employer and accounts are managed by the Company, please submit such requests to your HR department or to **support@bejogja.com**.",
				},
			],
		},
		{
			n: "9",
			title: "Account & Data Deletion",
			blocks: [
				{
					kind: "p",
					text: "Accounts are created and managed by the Company; employees cannot self-register. To delete your account and associated personal data (including face data), contact **support@bejogja.com** or your HR department. We will process the request in accordance with this Policy and applicable law, subject to records we are legally required to retain.",
				},
			],
		},
		{
			n: "10",
			title: "Children's Privacy",
			blocks: [
				{
					kind: "p",
					text: "HRIS Beacon is intended for use by the Company's employees only and is **not directed to children**. We do not knowingly collect personal data from anyone under the legal working age.",
				},
			],
		},
		{
			n: "11",
			title: "Changes to This Privacy Policy",
			blocks: [
				{
					kind: "p",
					text: 'We may update this Privacy Policy from time to time. We will revise the "Last updated" date above and, where appropriate, notify you within the App or by other means. Continued use of the App after changes take effect constitutes acceptance of the updated Policy.',
				},
			],
		},
	];
</script>

<svelte:head>
	<title>Privacy Policy — HRIS Beacon | Beacon Engineering</title>
	<meta
		name="description"
		content="Privacy Policy for the HRIS Beacon employee mobile application by PT Arta Teknologi Comunindo, covering attendance, face verification, location, payroll, and related HR data."
	/>
</svelte:head>

{#snippet rich(text: string)}
	{#each parseRich(text) as part}{#if part.email}<a
				class="font-semibold text-[#C8102E] hover:text-zinc-950"
				href={`mailto:${part.text}`}>{part.text}</a
			>{:else if part.bold}<strong class="font-semibold text-zinc-900">{part.text}</strong
			>{:else}{part.text}{/if}{/each}
{/snippet}

<section class="bg-white">
	<div
		class="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-28"
	>
		<div class="lg:col-span-4">
			<div class="sticky top-28 space-y-5">
				<div class="flex items-center gap-3">
					<div class="h-px w-8 bg-[#C8102E]"></div>
					<p class="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#C8102E]">
						Legal
					</p>
				</div>
				<h1
					class="font-heading text-4xl font-bold leading-none tracking-tight text-zinc-950 sm:text-5xl"
				>
					Privacy Policy
				</h1>
				<p class="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
					HRIS Beacon
				</p>
				<p class="max-w-[34ch] text-sm font-medium leading-relaxed text-zinc-500 sm:text-base">
					How PT Arta Teknologi Comunindo collects, uses, stores, shares, and protects your
					information in the HRIS Beacon employee application.
				</p>
				<p class="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
					Last updated: {LAST_UPDATED}
				</p>
			</div>
		</div>

		<div class="lg:col-span-7 lg:col-start-6">
			<div class="space-y-4">
				{#each intro as para}
					<p class="max-w-[72ch] text-sm leading-relaxed text-zinc-600 sm:text-base">
						{@render rich(para)}
					</p>
				{/each}
				<p class="max-w-[72ch] text-sm leading-relaxed text-zinc-600 sm:text-base">
					If you have any questions, contact us at
					<a
						class="font-semibold text-[#C8102E] hover:text-zinc-950"
						href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a
					>.
				</p>
			</div>

			<div class="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
				{#each sections as section}
					<section class="py-7 sm:py-8">
						<div class="flex items-baseline gap-3">
							<span class="font-mono text-xs font-semibold text-[#C8102E]">{section.n}</span>
							<h2 class="text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">
								{section.title}
							</h2>
						</div>
						<div class="mt-4 space-y-4">
							{#each section.blocks as block}
								{#if block.kind === "p"}
									<p class="max-w-[72ch] text-sm leading-relaxed text-zinc-600 sm:text-base">
										{@render rich(block.text)}
									</p>
								{:else if block.kind === "sub"}
									<div>
										<h3 class="text-sm font-bold text-zinc-900 sm:text-base">{block.heading}</h3>
										<p
											class="mt-1.5 max-w-[72ch] text-sm leading-relaxed text-zinc-600 sm:text-base"
										>
											{@render rich(block.text)}
										</p>
										{#if block.note}
											<p
												class="mt-3 border-l-2 border-[#C8102E]/40 bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-500 sm:text-sm"
											>
												{@render rich(block.note)}
											</p>
										{/if}
									</div>
								{:else if block.kind === "labeled"}
									<div class="space-y-3">
										{#each block.items as item}
											<p
												class="max-w-[72ch] text-sm leading-relaxed text-zinc-600 sm:text-base"
											>
												<span class="font-bold text-zinc-900">{item.label}</span>
												{@render rich(item.text)}
											</p>
										{/each}
									</div>
								{:else if block.kind === "list"}
									<ul class="space-y-2.5">
										{#each block.items as item}
											<li
												class="flex max-w-[72ch] gap-3 text-sm leading-relaxed text-zinc-600 sm:text-base"
											>
												<span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8102E]"></span>
												<span>{@render rich(item)}</span>
											</li>
										{/each}
									</ul>
								{/if}
							{/each}
						</div>
					</section>
				{/each}
			</div>

			<div class="mt-10 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
				<div class="flex items-baseline gap-3">
					<span class="font-mono text-xs font-semibold text-[#C8102E]">12</span>
					<h2 class="text-base font-bold text-zinc-950">Contact Us</h2>
				</div>
				<p class="mt-3 text-sm leading-relaxed text-zinc-600">
					If you have any questions about this Privacy Policy or your data, contact us:
				</p>
				<div class="mt-4 space-y-1.5 text-sm text-zinc-600">
					<p class="font-semibold text-zinc-900">PT Arta Teknologi Comunindo</p>
					<p>
						Email:
						<a
							class="font-semibold text-[#C8102E] hover:text-zinc-950"
							href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a
						>
					</p>
					<p>
						Website:
						<a
							class="font-semibold text-[#C8102E] hover:text-zinc-950"
							href="https://be-jogja.com"
							target="_blank"
							rel="noopener noreferrer">be-jogja.com</a
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
