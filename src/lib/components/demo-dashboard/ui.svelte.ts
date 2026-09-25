// Shared shell state for the demo dashboard: mobile nav drawer and a one-line toast.
export const shell = $state({ navOpen: false, toast: '', toastId: 0 });

let timer: ReturnType<typeof setTimeout> | undefined;

/** Shows a short confirmation for demo-only actions (export, save, send…). */
export function notify(msg: string) {
	shell.toast = msg;
	shell.toastId += 1;
	clearTimeout(timer);
	timer = setTimeout(() => (shell.toast = ''), 2600);
}
