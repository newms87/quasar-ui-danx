/**
 * Formats an amount into USD currency format
 */
export function fCurrency(amount: number, options?: object) {
	if (amount === null || amount === undefined || isNaN(amount)) {
		return "$-";
	}
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		...options
	}).format(amount);
}

/**
 * Formats an amount into USD currency format without cents
 */
export function fCurrencyNoCents(amount: number, options?: object) {
	return fCurrency(amount, {
		maximumFractionDigits: 0,
		...options
	});
}

/**
 * Formats a number into a human-readable format
 */
export function fNumber(number: number, options?: object) {
	return new Intl.NumberFormat("en-US", options).format(number);
}

/**
 * Formats a currency into a shorthand human-readable format (ie: $1.2M or $5K)
 */
export function fShortCurrency(value: string | number, options?: { round: boolean }) {
	return "$" + fShortNumber(value, options);
}

/**
 * Formats a number into a shorthand human-readable format (ie: 1.2M or 5K)
 */
export function fShortNumber(value: string | number, options?: { round: boolean }) {
	if (value === "" || value === null || value === undefined) {
		return "-";
	}
	const shorts = [
		{ pow: 3, unit: "K" },
		{ pow: 6, unit: "M" },
		{ pow: 9, unit: "B" },
		{ pow: 12, unit: "T" },
		{ pow: 15, unit: "Q" }
	];

	let n = Math.round(+value);

	const short = shorts.find(({ pow }) => Math.pow(10, pow) < n && Math.pow(10, pow + 3) > n) || null;

	if (short) {
		n = n / Math.pow(10, short.pow);
		return options?.round
			? n + short.unit
			: n.toFixed(n > 100 ? 0 : 1) + short.unit;
	}

	return n;
}

/**
 * Formats a number into a human-readable size format (ie: 1.2MB or 5KB)
 */
export function fShortSize(value: string | number) {
	const powers = [
		{ pow: 0, unit: "B" },
		{ pow: 10, unit: "KB" },
		{ pow: 20, unit: "MB" },
		{ pow: 30, unit: "GB" },
		{ pow: 40, unit: "TB" },
		{ pow: 50, unit: "PB" },
		{ pow: 60, unit: "EB" },
		{ pow: 70, unit: "ZB" },
		{ pow: 80, unit: "YB" }
	];

	const n = Math.round(+value);
	const power = powers.find((p, i) => {
		const nextPower = powers[i + 1];
		return !nextPower || n < Math.pow(2, nextPower.pow + 10);
	}) || powers[powers.length - 1];

	const div = Math.pow(2, power.pow);

	return Math.round(n / div) + " " + power.unit;
}

export function fBoolean(value?: boolean | string | any) {
	switch (value) {
		case "Yes":
		case "No":
			return value;
	}

	return (value === undefined || value === null) ? "-" : (value ? "Yes" : "No");
}

interface FPercentOptions {
	multiplier?: number,
	maximumFractionDigits?: number,
	NaN?: string
}

/**
 * Formats a number into a percentage
 * @param num
 * @param options
 * @returns {string}
 */
export function fPercent(num: string | number, options: FPercentOptions = {}) {
	options = { multiplier: 100, maximumFractionDigits: 1, NaN: "N/A", ...options };

	num = parseFloat("" + num);

	if (isNaN(num)) {
		return options.NaN;
	}

	return fNumber(num * (options.multiplier || 100), options) + "%";
}
