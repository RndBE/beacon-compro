const ID = 'id-ID';

export function num(v: number, digits = 1): string {
	return new Intl.NumberFormat(ID, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(v);
}

export function fmtUnit(v: number, unit: string, digits = 1): string {
	return `${num(v, digits)} ${unit}`;
}

export function timeHM(t: number): string {
	return new Intl.DateTimeFormat(ID, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZone: 'Asia/Jakarta'
	}).format(new Date(t));
}

export function dateShort(t: number): string {
	return new Intl.DateTimeFormat(ID, {
		day: '2-digit',
		month: 'short',
		timeZone: 'Asia/Jakarta'
	}).format(new Date(t));
}

export function signed(value: number, digits = 1): string {
	const s = num(Math.abs(value), digits);
	if (value > 0) return `+${s}`;
	if (value < 0) return `−${s}`;
	return s;
}
