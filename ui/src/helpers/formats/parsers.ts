import { parse as parseYAML, stringify as stringifyYAML } from "yaml";
import { isJSON } from "../utils";

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

/**
 * Convert markdown formatted string into a valid JSON object
 */
export function parseMarkdownJSON(string: string | object): object | null | false {
	if (!string) return null;
	if (typeof string === "object") return string as object;

	try {
		return JSON.parse(parseMarkdownCode(string));
	} catch (e) {
		return false;
	}
}

export function parseMarkdownYAML(string: string): object | null | false {
	if (!string) return null;

	try {
		return parseYAML(parseMarkdownCode(string)) || (string ? undefined : null);
	} catch (e) {
		return false;
	}
}

/**
 * Parse a markdown formatted string and return the code block content
 */
export function parseMarkdownCode(string: string): string {
	return string.replace(/^```[a-z0-9]{0,6}\s/, "").replace(/```$/, "");
}

/**
 * Convert a JSON object or string of code into a markdown formatted JSON string
 * ie: a valid JSON string with a ```json prefix and ``` postfix
 */
export function fMarkdownCode(type: string, string: string | object): string {
	if (typeof string === "object" || isJSON(string)) {
		switch (type) {
			case "yaml":
				string = stringifyYAML(typeof string === "string" ? JSON.parse(string) : string);
				break;
			case "ts":
			default:
				string = fJSON(string);
		}
	}

	const regex = new RegExp(`\`\`\`${type}`, "g");
	string = (string || "") as string;
	if (!string.match(regex)) {
		string = parseMarkdownCode(string as string);
		return `\`\`\`${type}\n${string}\n\`\`\``;
	}

	return string as string;
}
