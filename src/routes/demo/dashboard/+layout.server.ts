import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = ({ cookies }) => {
	if (!cookies.get('demo_auth')) {
		throw redirect(303, '/demo/login');
	}
	return {};
};
