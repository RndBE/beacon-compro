import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasSession } from '$lib/server/demo-spam-auth';
import { miniStesy, relay } from '$lib/server/mini-stesy';
import { LOGGER_IDS } from '$lib/components/demo-spam/wosusokas';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const INTERVALS = new Set(['5m', '15m', '1h', '1d']);

/** One logger's history summarised per bucket (mini-stesy /integrasi/agregat). */
export const GET: RequestHandler = async ({ cookies, url }) => {
	if (!(await hasSession(cookies))) error(401, 'Sesi demo SPAM berakhir.');
	const q = url.searchParams;
	const [id, awal, akhir, interval] = ['id', 'awal', 'akhir', 'interval'].map((k) => q.get(k) ?? '');
	if (!LOGGER_IDS.has(id)) error(404, 'Logger tidak dikenal.');
	if (!DATE.test(awal) || !DATE.test(akhir) || !INTERVALS.has(interval)) error(400, 'Parameter rentang tidak valid.');

	// past days do not change, so they can stay cached longer than a window that includes today
	const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
	return relay(miniStesy('/agregat', { id_logger: id, awal, akhir, interval }, akhir >= yesterday ? 60_000 : 3_600_000));
};
