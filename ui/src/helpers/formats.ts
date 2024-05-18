import { DateTime, IANAZone } from "luxon";
import { ActionTargetItem, fDateOptions } from "../types";
import { isJSON } from "./utils";

const SERVER_TZ = new IANAZone("America/Chicago");

export { DateTime, SERVER_TZ };

/**
 * Converts a date string from the server's time zone to the user's time zone.
 * @param {String} dateTimeString
 * @returns {DateTime}
 */
export function localizedDateTime(dateTimeString: string) {
	dateTimeString = dateTimeString?.replace("T", " ");
	// noinspection JSCheckFunctionSignatures
	return DateTime.fromSQL(dateTimeString, { zone: SERVER_TZ }).setZone("local");
}

/**
 * Converts a date string from the user's time zone to the server's time zone.
 * @param dateTimeString
 * @returns {DateTime}
 */
export function remoteDateTime(dateTimeString: string) {
	dateTimeString = dateTimeString?.replace("T", " ");
	// noinspection JSCheckFunctionSignatures
	return DateTime.fromSQL(dateTimeString, { zone: "local" }).setZone(SERVER_TZ);
}

/**
 * @param {DateTime|String} dateTime
 * @returns {DateTime|*}
 */
export function parseDateTime(dateTime: string | DateTime) {
	if (typeof dateTime === "string") {
		dateTime = dateTime.replace("T", " ").replace(/\//g, "-");
		return DateTime.fromSQL(dateTime);
	}
	return dateTime || DateTime.fromSQL("0000-00-00 00:00:00");
}

/**
 * Parses a Quasar formatted date string into a Luxon DateTime object
 * @param date
 * @param format
 * @returns {DateTime}
 */
export function parseQDate(date: string, format = "yyyy/MM/dd") {
	return DateTime.fromFormat(date, format);
}

/**
 * Parses a Quasar formatted date/time string into a Luxon DateTime object
 * @param date
 * @param format
 * @returns {DateTime}
 */
export function parseQDateTime(date: string, format = "yyyy/MM/dd HH:mm:ss") {
	return DateTime.fromFormat(date, format);
}

/**
 * Formats a Luxon DateTime object into a Quasar formatted date string
 * @param date
 * @returns {string}
 */
export function fQDate(date: string) {
	return fDate(date, { format: "yyyy/MM/dd" });
}

/**
 *
 * @param {String} dateTimeString
 * @param options
 * @returns {string}
 */
export function fLocalizedDateTime(dateTimeString: string, options = {}) {
	return fDateTime(localizedDateTime(dateTimeString), options);
}

/**
 * Formats a date/time object or string into a human-readable format
 *
 * @param {String|Object} dateTime
 * @param format
 * @param {String|null} empty
 * @returns {string}
 */
export function fDateTime(
		dateTime: string | DateTime | null = null,
		{ format = "M/d/yy h:mma", empty = "- -" }: fDateOptions = {}
) {
	const formatted = (dateTime ? parseDateTime(dateTime) : DateTime.now()).toFormat(format).toLowerCase();
	return formatted === "invalid datetime" ? empty : formatted;
}

/**
 * Formats a date/time object or string into the best format for DB input
 * @param dateTime
 * @returns {string}
 */
export function dbDateTime(dateTime: string | DateTime | null = null) {
	return fDateTime(dateTime, { format: "yyyy-MM-dd HH:mm:ss", empty: undefined });
}

/**
 * Formats a date object or string into a human-readable format
 * @param {String|Object} dateTime
 * @param {String|null} empty
 * @param format
 * @returns {string}
 */
export function fDate(dateTime: string, { empty = "--", format = "M/d/yy" }: fDateOptions = {}) {
	const formatted = parseDateTime(dateTime).toFormat(format || "M/d/yy");
	return ["Invalid DateTime", "invalid datetime"].includes(formatted) ? empty : formatted;
}

/**
 * Formats a number of seconds into Hours / Minutes / Seconds or just Minutes and Seconds
 *
 * @param second
 * @returns {string}
 */
export function fSecondsToTime(second: number) {
	const time = DateTime.now().setZone("UTC").startOf("year").set({ second });
	const hours = Math.floor(second / 3600);
	return (hours ? hours + ":" : "") + time.toFormat("mm:ss");
}

export function fElapsedTime(start: string, end?: string) {
	const endDateTime = end ? parseDateTime(end) : DateTime.now();
	const diff = endDateTime.diff(parseDateTime(start), ["hours", "minutes", "seconds"]);
	if (!diff.isValid) {
		return "-";
	}
	const hours = Math.floor(diff.hours);
	const minutes = Math.floor(diff.minutes);
	const seconds = Math.floor(diff.seconds);
	return `${hours ? hours + "h " : ""}${minutes ? minutes + "m " : ""}${seconds}s`;
}

/**
 * Formats an amount into USD currency format
 * @param amount
 * @returns {string}
 */
export function fCurrency(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(amount);
}

/**
 * Formats a number into a human-readable format
 * @param number
 * @param options
 * @returns {string}
 */
export function fNumber(number: number, options = {}) {
	return new Intl.NumberFormat("en-US", options).format(number);
}

/**
 * Truncates the string by removing chars from the middle of the string
 * @param str
 * @param maxLength
 * @returns {string|*}
 */
export function centerTruncate(str: string, maxLength: number) {
	if (str.length > maxLength) {
		const frontCharCount = Math.floor((maxLength - 3) / 2);
		const backCharCount = maxLength - frontCharCount - 3;
		return (
				str.substring(0, frontCharCount) +
				"..." +
				str.substring(str.length - backCharCount)
		);
	} else {
		return str;
	}
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


export function fPhone(value: string | number) {
	if (!value || typeof value !== "string") {
		return value || "";
	}

	const input = value.replace(/\D/g, "").split("");
	let phone = "";

	const startsWithOne = input.length > 0 && input[0] === "1";
	const shift = startsWithOne ? 1 : 0;

	input.map((number, index) => {
		switch (index) {
			case shift:
				phone += "(";
				break;
			case shift + 3:
				phone += ") ";
				break;
			case shift + 6:
				phone += "-";
				break;
			case shift + 10:
				phone += " x";
				break;
		}
		if (index === 0 && number === "1") {
			phone += "+1 ";
		} else {
			phone += number;
		}
	});

	if (value === "+1 (") {
		return "";
	}

	return phone;
}

export function fNameOrCount(items: ActionTargetItem[] | ActionTargetItem, label: string) {
	return Array.isArray(items) ? `${items?.length} ${label}` : `${items ? items.title || items.name || items.id : ""}`;
}

export function fJSON(string: string | object) {
	if (!string) {
		return string;
	}

	try {
		if (typeof string === "object") {
			return JSON.stringify(string, null, 2);
		}
		return JSON.stringify(JSON.parse(string), null, 2);
	} catch (e) {
		return string;
	}
}

export function fMarkdownJSON(string: string | object): string {
	if (isJSON(string)) {
		return `\`\`\`json\n${fJSON(string)}\n\`\`\``;
	}
	// @ts-expect-error Guaranteed to only allow strings here using isJSON check
	return string;
}
