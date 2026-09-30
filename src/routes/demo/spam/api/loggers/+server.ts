import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasSession } from '$lib/server/demo-spam-auth';
import { miniStesy, relay } from '$lib/server/mini-stesy';

/** Latest snapshot of every Wosusokas logger (mini-stesy /all_logger). */
export const GET: RequestHandler = async ({ cookies }) => {
	if (!(await hasSession(cookies))) error(401, 'Sesi demo SPAM berakhir.');
	return relay(miniStesy('/all_logger', {}, 30_000));
};
