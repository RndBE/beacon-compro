// Shared live clock for the PDAM demo: every widget reads the same hour, and
// `tick` drives the small sample-to-sample jitter so values never look frozen.
import { nowHour } from './sim';

export const live = $state({ h: nowHour(), tick: 0 });

let timer: ReturnType<typeof setInterval> | undefined;
let users = 0;

/** Starts the clock (ref-counted); returns the stop function for onMount. */
export function useLive(periodMs = 4000) {
	users++;
	if (!timer)
		timer = setInterval(() => {
			live.h = nowHour();
			live.tick++;
		}, periodMs);
	return () => {
		users--;
		if (users <= 0 && timer) {
			clearInterval(timer);
			timer = undefined;
			users = 0;
		}
	};
}
