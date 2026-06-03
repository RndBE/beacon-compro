import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: ({ cookies }) => {
		// Cosmetic only — no credential validation.
		cookies.set('demo_auth', '1', {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 8
		});
		throw redirect(303, '/demo/dashboard');
	}
};
