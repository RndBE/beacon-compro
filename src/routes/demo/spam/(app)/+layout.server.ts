import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasSession } from '$lib/server/demo-spam-auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
	if (!(await hasSession(cookies))) {
		throw redirect(303, '/demo/spam/login');
	}
	return {};
};
