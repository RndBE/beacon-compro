import { renderSVG } from 'uqr';
import { SITE_URL } from '$lib/seo';
import type { RequestHandler } from './$types';

/** QR yang membuka halaman kartu. Isinya hanya URL, jadi tidak perlu menanyakan CMS apakah slug-nya ada. */
export const GET: RequestHandler = ({ params }) =>
	new Response(
		renderSVG(`${SITE_URL}/kartu-nama/${encodeURIComponent(params.slug)}`, { ecc: 'M', border: 1 }),
		{
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=86400'
			}
		}
	);
