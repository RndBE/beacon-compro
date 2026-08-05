const GA_MEASUREMENT_ID = 'G-QVY6EE8QQQ';

let loaded = false;

/** Injects gtag.js. Call only after consent is granted — never on page load. */
export function loadAnalytics() {
	if (loaded || typeof document === 'undefined') return;
	loaded = true;

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
	document.head.appendChild(script);

	(window as any).dataLayer = (window as any).dataLayer || [];
	function gtag(...args: unknown[]) {
		(window as any).dataLayer.push(args);
	}
	(window as any).gtag = gtag;
	gtag('js', new Date());
	gtag('config', GA_MEASUREMENT_ID);
}
