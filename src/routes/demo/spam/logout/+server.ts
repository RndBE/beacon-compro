import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { endSession } from '$lib/server/demo-spam-auth';

export const POST: RequestHandler = ({ cookies }) => {
	endSession(cookies);
	throw redirect(303, '/demo/spam/login');
};
