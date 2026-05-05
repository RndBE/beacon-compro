import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type MetaInstagramMedia = {
	id: string;
	caption?: string;
	media_type?: string;
	media_url?: string;
	thumbnail_url?: string;
	permalink?: string;
	timestamp?: string;
};

type MetaInstagramResponse = {
	data?: MetaInstagramMedia[];
	error?: {
		message?: string;
		type?: string;
		code?: number;
	};
};

const MEDIA_FIELDS = [
	'id',
	'caption',
	'media_type',
	'media_url',
	'thumbnail_url',
	'permalink',
	'timestamp'
].join(',');

function normalizeLimit(value: string | undefined) {
	const parsed = Number(value);

	if (!Number.isFinite(parsed)) return '4';

	return String(Math.min(Math.max(Math.floor(parsed), 1), 8));
}

function normalizeGraphVersion(value: string | undefined) {
	const version = value?.trim() || 'v24.0';

	return version.startsWith('v') ? version : `v${version}`;
}

function usesInstagramLoginToken(accessToken: string, mode: string | undefined) {
	const normalizedMode = mode?.trim().toLowerCase() || 'auto';

	if (normalizedMode === 'instagram-login') return true;
	if (normalizedMode === 'facebook-graph') return false;

	return accessToken.startsWith('IGA');
}

function mediaUrl({
	accessToken,
	graphVersion,
	limit,
	userId,
	useInstagramLogin
}: {
	accessToken: string;
	graphVersion: string;
	limit: string;
	userId: string | undefined;
	useInstagramLogin: boolean;
}) {
	const url = useInstagramLogin
		? new URL('https://graph.instagram.com/me/media')
		: new URL(`https://graph.facebook.com/${graphVersion}/${userId}/media`);

	url.searchParams.set('fields', MEDIA_FIELDS);
	url.searchParams.set('limit', limit);
	url.searchParams.set('access_token', accessToken);

	return url;
}

const SUCCESS_CACHE_HEADERS = {
	'cache-control': 'public, max-age=300, s-maxage=900'
};

const ERROR_CACHE_HEADERS = {
	'cache-control': 'no-store'
};

export const GET: RequestHandler = async ({ fetch }) => {
	const userId = env.META_INSTAGRAM_USER_ID;
	const accessToken = env.META_INSTAGRAM_ACCESS_TOKEN;
	const graphVersion = normalizeGraphVersion(env.META_GRAPH_API_VERSION);
	const limit = normalizeLimit(env.META_INSTAGRAM_POST_LIMIT);
	const useInstagramLogin = accessToken
		? usesInstagramLoginToken(accessToken, env.META_INSTAGRAM_API_MODE)
		: false;

	if (!accessToken || (!useInstagramLogin && !userId)) {
		return json(
			{
				configured: false,
				posts: []
			},
			{ headers: ERROR_CACHE_HEADERS }
		);
	}

	const url = mediaUrl({
		accessToken,
		graphVersion,
		limit,
		userId,
		useInstagramLogin
	});

	try {
		const response = await fetch(url);
		const payload = (await response.json()) as MetaInstagramResponse;

		if (!response.ok) {
			console.error('[Instagram Feed] Meta API error', {
				status: response.status,
				message: payload.error?.message,
				type: payload.error?.type,
				code: payload.error?.code,
				endpoint: useInstagramLogin ? 'instagram-login' : 'facebook-graph'
			});

			return json(
				{
					configured: true,
					posts: [],
					error: 'meta_api_error'
				},
				{ status: 502, headers: ERROR_CACHE_HEADERS }
			);
		}

		const posts = (payload.data ?? [])
			.filter((item) => item.id && item.permalink)
			.map((item) => ({
				id: item.id,
				caption: item.caption ?? '',
				mediaType: item.media_type ?? 'IMAGE',
				mediaUrl: item.media_url ?? '',
				thumbnailUrl: item.thumbnail_url ?? item.media_url ?? '',
				permalink: item.permalink,
				timestamp: item.timestamp ?? ''
			}));

		return json({
			configured: true,
			posts
		}, { headers: SUCCESS_CACHE_HEADERS });
	} catch (err) {
		console.error('[Instagram Feed] Request failed', err);

		return json(
			{
				configured: true,
				posts: [],
				error: 'request_failed'
			},
			{ status: 502, headers: ERROR_CACHE_HEADERS }
		);
	}
};
