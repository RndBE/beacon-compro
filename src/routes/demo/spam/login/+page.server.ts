import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hasSession, loginReady, noteFailure, passwordOk, startSession, tooManyAttempts } from '$lib/server/demo-spam-auth';

export const load: PageServerLoad = async ({ cookies }) => {
	if (await hasSession(cookies)) throw redirect(303, '/demo/spam');
	return { ready: loginReady() };
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		// behind Cloudflare every request arrives from the proxy, so key the throttle on the visitor
		const client = request.headers.get('cf-connecting-ip') ?? getClientAddress();
		if (tooManyAttempts(client)) return fail(429, { message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
		if (!loginReady()) return fail(503, { message: 'Login demo SPAM belum diaktifkan di server.' });

		const password = String((await request.formData()).get('password') ?? '');
		if (!(await passwordOk(password))) {
			noteFailure(client);
			return fail(401, { message: 'Password salah.' });
		}

		await startSession(cookies);
		throw redirect(303, '/demo/spam');
	}
};
