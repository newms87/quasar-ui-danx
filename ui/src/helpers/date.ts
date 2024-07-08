import { parseDateTime } from "./formats";

export function diffInDays(date1: string, date2: string) {
	return parseDateTime(date2).diff(parseDateTime(date1), ["days"]).days;
}
