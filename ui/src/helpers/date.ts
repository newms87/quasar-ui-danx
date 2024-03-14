import { parseDateTime } from "danx/src/helpers/formats";

export function diffInDays(date1, date2) {
  return parseDateTime(date2).diff(parseDateTime(date1), ["days"]).days;
}
