/**
 * Lightweight syntax highlighting for JSON and YAML
 * Returns HTML string with syntax highlighting spans
 */

export type HighlightFormat = "json" | "yaml";

export interface HighlightOptions {
	format: HighlightFormat;
}

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Highlight JSON syntax by tokenizing first, then applying highlights
 * This prevents issues with regex replacing content inside already-matched strings
 */
export function highlightJSON(code: string): string {
	if (!code) return "";

	const result: string[] = [];
	let i = 0;

	while (i < code.length) {
		const char = code[i];

		// String (starts with ")
		if (char === '"') {
			const startIndex = i;
			i++; // skip opening quote

			// Find the closing quote, handling escape sequences
			while (i < code.length) {
				if (code[i] === '\\' && i + 1 < code.length) {
					i += 2; // skip escaped character
				} else if (code[i] === '"') {
					i++; // include closing quote
					break;
				} else {
					i++;
				}
			}

			const str = code.slice(startIndex, i);
			const escapedStr = escapeHtml(str);

			// Check if this is a key (followed by colon)
			const afterString = code.slice(i).match(/^(\s*):/);
			if (afterString) {
				result.push(`<span class="syntax-key">${escapedStr}</span>`);
				// Add the whitespace and colon
				result.push(`<span class="syntax-punctuation">${escapeHtml(afterString[1])}:</span>`);
				i += afterString[0].length;
			} else {
				// It's a string value
				result.push(`<span class="syntax-string">${escapedStr}</span>`);
			}
			continue;
		}

		// Number (starts with digit or minus followed by digit)
		if (/[-\d]/.test(char)) {
			const numMatch = code.slice(i).match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/);
			if (numMatch) {
				result.push(`<span class="syntax-number">${escapeHtml(numMatch[0])}</span>`);
				i += numMatch[0].length;
				continue;
			}
		}

		// Boolean true
		if (code.slice(i, i + 4) === 'true') {
			result.push(`<span class="syntax-boolean">true</span>`);
			i += 4;
			continue;
		}

		// Boolean false
		if (code.slice(i, i + 5) === 'false') {
			result.push(`<span class="syntax-boolean">false</span>`);
			i += 5;
			continue;
		}

		// Null
		if (code.slice(i, i + 4) === 'null') {
			result.push(`<span class="syntax-null">null</span>`);
			i += 4;
			continue;
		}

		// Punctuation
		if (/[{}\[\],:]/.test(char)) {
			result.push(`<span class="syntax-punctuation">${escapeHtml(char)}</span>`);
			i++;
			continue;
		}

		// Whitespace and other characters
		result.push(escapeHtml(char));
		i++;
	}

	return result.join('');
}

/**
 * Highlight YAML syntax
 */
export function highlightYAML(code: string): string {
	if (!code) return "";

	const lines = code.split("\n");
	const highlightedLines = lines.map(line => {
		// Escape HTML first
		const escaped = escapeHtml(line);

		// Comments
		if (/^\s*#/.test(line)) {
			return `<span class="syntax-punctuation">${escaped}</span>`;
		}

		// Key-value pairs
		const keyValueMatch = escaped.match(/^(\s*)([^:]+?)(:)(\s*)(.*)$/);
		if (keyValueMatch) {
			const [, indent, key, colon, space, value] = keyValueMatch;
			let highlightedValue = value;

			// Highlight the value based on type
			if (/^(&quot;.*&quot;|&#039;.*&#039;)$/.test(value) || /^["'].*["']$/.test(value)) {
				// Quoted string
				highlightedValue = `<span class="syntax-string">${value}</span>`;
			} else if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value)) {
				// Number (strict format: integers, decimals, scientific notation)
				highlightedValue = `<span class="syntax-number">${value}</span>`;
			} else if (/^(true|false)$/i.test(value)) {
				// Boolean
				highlightedValue = `<span class="syntax-boolean">${value}</span>`;
			} else if (/^(null|~)$/i.test(value)) {
				// Null
				highlightedValue = `<span class="syntax-null">${value}</span>`;
			} else if (value && !value.startsWith("|") && !value.startsWith(">")) {
				// Unquoted string (but not multiline indicators)
				highlightedValue = `<span class="syntax-string">${value}</span>`;
			}

			return `${indent}<span class="syntax-key">${key}</span><span class="syntax-punctuation">${colon}</span>${space}${highlightedValue}`;
		}

		// Array items (lines starting with -)
		const arrayMatch = escaped.match(/^(\s*)(-)(\s*)(.*)$/);
		if (arrayMatch) {
			const [, indent, dash, space, value] = arrayMatch;
			let highlightedValue = value;

			if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value)) {
				// Number (strict format)
				highlightedValue = `<span class="syntax-number">${value}</span>`;
			} else if (/^(true|false)$/i.test(value)) {
				highlightedValue = `<span class="syntax-boolean">${value}</span>`;
			} else if (/^(null|~)$/i.test(value)) {
				highlightedValue = `<span class="syntax-null">${value}</span>`;
			} else if (value) {
				highlightedValue = `<span class="syntax-string">${value}</span>`;
			}

			return `${indent}<span class="syntax-punctuation">${dash}</span>${space}${highlightedValue}`;
		}

		return escaped;
	});

	return highlightedLines.join("\n");
}

/**
 * Highlight code based on format
 */
export function highlightSyntax(code: string, options: HighlightOptions): string {
	if (!code) return "";

	switch (options.format) {
		case "json":
			return highlightJSON(code);
		case "yaml":
			return highlightYAML(code);
		default:
			return escapeHtml(code);
	}
}
