import { ActionTargetItem } from "../../types";

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
