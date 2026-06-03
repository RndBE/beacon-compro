import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = ({ cookies }) => {
	cookies.delete('demo_auth', { path: '/' });
	throw redirect(303, '/demo/login');
};
