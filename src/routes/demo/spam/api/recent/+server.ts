import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasSession } from '$lib/server/demo-spam-auth';
import { miniStesy, relay } from '$lib/server/mini-stesy';
import { LOGGER_IDS } from '$lib/components/demo-spam/wosusokas';

/** The last 300 raw records of one logger, newest first (mini-stesy /integrasi). */
export const GET: RequestHandler = async ({ cookies, url }) => {
	if (!(await hasSession(cookies))) error(401, 'Sesi demo SPAM berakhir.');
	const id = url.searchParams.get('id') ?? '';
	if (!LOGGER_IDS.has(id)) error(404, 'Logger tidak dikenal.');
	return relay(miniStesy('', { id_logger: id }, 30_000));
};
