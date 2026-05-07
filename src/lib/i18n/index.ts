export { locale, type Locale } from './store';
export { default as translations, type TranslationKey } from './translations';

import { get } from 'svelte/store';
import { locale } from './store';
import trans, { type TranslationKey } from './translations';

/**
 * Translate a key using the current locale (non-reactive, for scripts).
 * For reactive usage in templates, use `$locale` + `translations[key][$locale]`.
 */
export function t(key: TranslationKey): string {
	const lang = get(locale);
	return trans[key]?.[lang] ?? trans[key]?.['ID'] ?? key;
}
