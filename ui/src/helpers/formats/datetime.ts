import { DateTime, IANAZone } from "luxon";
import { fDateOptions } from "../../types";

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
	const formatted = parseDateTime(dateTime)?.toFormat(format).toLowerCase();
	return formatted || empty;
}

export function fDateTimeMs(
	dateTime: string | DateTime | null = null,
	{ empty = "- -" }: fDateOptions = {}
) {
	const formatted = parseDateTime(dateTime)?.toFormat("M/d/yy H:mm:ss.SSS").toLowerCase();
	return formatted || empty;
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
export function fDate(dateTime: string | DateTime | null, { empty = "--", format = "M/d/yy" }: fDateOptions = {}) {
	const formatted = parseDateTime(dateTime)?.toFormat(format || "M/d/yy");
	return formatted || empty;
}


/**
 * Parses a date string into a Luxon DateTime object
 */
export function parseDateTime(dateTime: string | DateTime | number | null): DateTime<boolean> | null {
	if (typeof dateTime === "number") {
		return DateTime.fromMillis(dateTime as number);
	}
	if (typeof dateTime === "string") {
		return parseGenericDateTime(dateTime);
	}
	return dateTime as DateTime<boolean> || DateTime.fromSQL("0000-00-00 00:00:00");
}

/**
 *  Parses a SQL formatted date string into a Luxon DateTime object
 */
export function parseSqlDateTime(dateTime: string) {
	const parsed = DateTime.fromSQL(dateTime.replace("T", " ").replace(/\//g, "-"));
	return parsed.isValid ? parsed : null;
}

/**
 * Parses a Quasar formatted date string into a Luxon DateTime object
 */
export function parseQDate(date: string, format = "yyyy/MM/dd"): DateTime<boolean> | null {
	const parsed = DateTime.fromFormat(date, format);
	return parsed.isValid ? parsed : null;
}

/**
 * Parses a Quasar formatted date/time string into a Luxon DateTime object
 */
export function parseQDateTime(date: string, format = "yyyy/MM/dd HH:mm:ss"): DateTime<boolean> | null {
	const parsed = DateTime.fromFormat(date, format);
	return parsed.isValid ? parsed : null;
}

/**
 * Parses a date string in various formats into a Luxon DateTime object.
 * Tries a list of common formats until one works.
 *
 * @param {string} dateTimeString - The date string to parse.
 * @param {string} [defaultZone="local"] - The default time zone to use if not specified.
 * @returns {DateTime | null} - A Luxon DateTime object if parsing succeeds, otherwise null.
 */
export function parseGenericDateTime(dateTimeString: string, defaultZone = "local"): DateTime | null {
	if (!dateTimeString) return null;

	const formats = [
		"yyyy-MM-dd",            // ISO date
		"yyyy-MM-dd HH:mm:ss",   // ISO date with time
		"MM/dd/yyyy",            // US-style date
		"dd/MM/yyyy",            // European-style date
		"MM/dd/yy",              // US short date
		"dd/MM/yy",              // European short date
		"yyyy/MM/dd",            // Alternative ISO
		"MM-dd-yyyy",            // US with dashes
		"dd-MM-yyyy",            // European with dashes
		"M/d/yyyy",              // US date without leading zeros
		"d/M/yyyy",              // European date without leading zeros
		"yyyyMMdd"              // Compact ISO
	];

	for (const format of formats) {
		const parsed = DateTime.fromFormat(dateTimeString, format, { zone: defaultZone });
		if (parsed.isValid) {
			return parsed;
		}
	}

	// Fallback to ISO parsing for strings like "2022-11-18T10:10:10Z"
	const isoParsed = DateTime.fromISO(dateTimeString, { zone: defaultZone });
	if (isoParsed.isValid) {
		return isoParsed;
	}

	// Fallback to SQL parsing for strings like "2022-11-18 10:10:10"
	const sqlParsed = DateTime.fromSQL(dateTimeString, { zone: defaultZone });
	if (sqlParsed.isValid) {
		return sqlParsed;
	}

	return null;
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

/**
 *  Formats a number of seconds into a duration string in 00h 00m 00s format
 */
export function fSecondsToDuration(seconds: number) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);
	return `${hours ? hours + "h " : ""}${minutes ? minutes + "m " : ""}${secs}s`;
}

/**
 *  Formats a number of milliseconds into a duration string in 00h 00m 00s 000ms format
 */
export function fMillisecondsToDuration(milliseconds: number) {
	const durStr = fSecondsToDuration(Math.floor(milliseconds / 1000));
	return (durStr === "0s" ? "" : durStr) + ` ${Math.floor(milliseconds % 1000)}ms`;
}


/**
 *  Formats a duration between two date strings in 00h 00m 00s format
 */
export function fDuration(start: string | number, end?: string | number) {
	const endDateTime = end ? parseDateTime(end) : DateTime.now();
	const diff = endDateTime?.diff(parseDateTime(start) || DateTime.now(), ["hours", "minutes", "seconds"]);
	if (!diff?.isValid) {
		return "-";
	}
	const totalSeconds = diff.as("seconds");
	return fSecondsToDuration(totalSeconds);
}

/**
 * Formats a date/time as a relative time string (e.g., "5 minutes ago", "yesterday")
 * @param {String|DateTime|number} dateTime - The date/time to format
 * @returns {string} - A human-readable relative time string
 */
export function fTimeAgo(dateTime: string | DateTime | number | null): string {
	if (!dateTime) return "";

	const date = parseDateTime(dateTime);
	if (!date) return "";

	const now = DateTime.now();
	const diffTime = Math.abs(now.toMillis() - date.toMillis());

	// Convert to different units
	const diffSeconds = Math.floor(diffTime / 1000);
	const diffMinutes = Math.floor(diffTime / (1000 * 60));
	const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

	// Seconds
	if (diffSeconds < 10) {
		return "a few seconds ago";
	} else if (diffSeconds < 60) {
		return `${diffSeconds} seconds ago`;
	}

	// Minutes
	if (diffMinutes === 1) {
		return "a minute ago";
	} else if (diffMinutes < 60) {
		return `${diffMinutes} minutes ago`;
	}

	// Hours
	if (diffHours === 1) {
		return "an hour ago";
	} else if (diffHours < 24) {
		return `${diffHours} hours ago`;
	}

	// Calendar-based day logic
	const today = now.startOf("day");
	const authDay = date.startOf("day");
	const daysDiff = Math.floor(today.diff(authDay, "days").days);

	if (daysDiff === 0) {
		return "today";
	} else if (daysDiff === 1) {
		return "yesterday";
	} else if (daysDiff < 7) {
		return `${daysDiff} days ago`;
	}

	// Weeks
	if (daysDiff < 30) {
		const weeks = Math.floor(daysDiff / 7);
		return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;
	}

	// 30+ days: show full date
	return date.toLocaleString({ year: "numeric", month: "short", day: "numeric" });
}
