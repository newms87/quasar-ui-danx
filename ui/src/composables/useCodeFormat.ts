import { computed, ref, Ref } from "vue";
import { parse as parseYAML, stringify as yamlStringify } from "yaml";
import { fJSON, parseMarkdownJSON, parseMarkdownYAML } from "../helpers/formats/parsers";

export type CodeFormat = "json" | "yaml" | "text";

export interface UseCodeFormatOptions {
	initialFormat?: CodeFormat;
	initialValue?: object | string | null;
}

export interface ValidationError {
	message: string;
	line?: number;
	column?: number;
}

export interface UseCodeFormatReturn {
	// State
	format: Ref<CodeFormat>;
	rawContent: Ref<string>;

	// Computed
	parsedValue: Ref<object | null>;
	formattedContent: Ref<string>;
	isValid: Ref<boolean>;

	// Methods
	setFormat: (format: CodeFormat) => void;
	setContent: (content: string) => void;
	setValue: (value: object | string | null) => void;
	parse: (content: string) => object | null;
	formatValue: (value: object | null, targetFormat?: CodeFormat) => string;
	validate: (content: string, targetFormat?: CodeFormat) => boolean;
	validateWithError: (content: string, targetFormat?: CodeFormat) => ValidationError | null;
}

export function useCodeFormat(options: UseCodeFormatOptions = {}): UseCodeFormatReturn {
	const format = ref<CodeFormat>(options.initialFormat ?? "yaml");
	const rawContent = ref("");

	// Parse any string (JSON or YAML) to object
	function parseContent(content: string): object | null {
		if (!content) return null;

		// Try JSON first
		const jsonResult = parseMarkdownJSON(content);
		if (jsonResult !== false && jsonResult !== null) return jsonResult;

		// Try YAML
		const yamlResult = parseMarkdownYAML(content);
		if (yamlResult !== false && yamlResult !== null) return yamlResult;

		return null;
	}

	// Format object to string in specified format
	function formatValueToString(value: object | string | null, targetFormat: CodeFormat = format.value): string {
		if (!value) return "";

		// Text format - just return as-is
		if (targetFormat === "text") {
			return typeof value === "string" ? value : JSON.stringify(value, null, 2);
		}

		try {
			const obj = typeof value === "string" ? parseContent(value) : value;
			if (!obj) return typeof value === "string" ? value : "";

			if (targetFormat === "json") {
				const formatted = fJSON(obj);
				return typeof formatted === "string" ? formatted : JSON.stringify(obj, null, 2);
			} else {
				return yamlStringify(obj as object);
			}
		} catch {
			return typeof value === "string" ? value : JSON.stringify(value, null, 2);
		}
	}

	// Validate string content for a format
	function validateContent(content: string, targetFormat: CodeFormat = format.value): boolean {
		if (!content) return true;

		// Text format is always valid
		if (targetFormat === "text") return true;

		try {
			if (targetFormat === "json") {
				JSON.parse(content);
			} else {
				parseYAML(content);
			}
			return true;
		} catch {
			return false;
		}
	}

	// Validate and return error details if invalid
	function validateContentWithError(content: string, targetFormat: CodeFormat = format.value): ValidationError | null {
		if (!content) return null;

		// Text format is always valid
		if (targetFormat === "text") return null;

		try {
			if (targetFormat === "json") {
				JSON.parse(content);
			} else {
				parseYAML(content);
			}
			return null;
		} catch (e: unknown) {
			const error = e as Error & { linePos?: { line: number; col: number }[] };
			let line: number | undefined;
			let column: number | undefined;

			// YAML errors from 'yaml' library have linePos
			if (error.linePos && error.linePos[0]) {
				line = error.linePos[0].line;
				column = error.linePos[0].col;
			}

			// JSON parse errors - try to extract position from message
			if (targetFormat === "json" && error.message) {
				const posMatch = error.message.match(/position\s+(\d+)/i);
				if (posMatch) {
					const pos = parseInt(posMatch[1], 10);
					// Convert position to line number
					const lines = content.substring(0, pos).split("\n");
					line = lines.length;
					column = lines[lines.length - 1].length + 1;
				}
			}

			return {
				message: error.message || "Invalid syntax",
				line,
				column
			};
		}
	}

	// Initialize with value if provided
	if (options.initialValue) {
		rawContent.value = formatValueToString(options.initialValue, format.value);
	}

	// Computed: parsed object from raw content
	const parsedValue = computed(() => parseContent(rawContent.value));

	// Computed: formatted string
	// For text format, return rawContent directly without parsing
	const formattedContent = computed(() => {
		if (format.value === "text") {
			return rawContent.value;
		}
		return formatValueToString(parsedValue.value, format.value);
	});

	// Computed: is current content valid
	const isValid = computed(() => validateContent(rawContent.value, format.value));

	// Methods
	function setFormat(newFormat: CodeFormat) {
		if (format.value === newFormat) return;

		// Convert content to new format
		const obj = parsedValue.value;
		format.value = newFormat;
		if (obj) {
			rawContent.value = formatValueToString(obj, newFormat);
		}
	}

	function setContent(content: string) {
		rawContent.value = content;
	}

	function setValue(value: object | string | null) {
		rawContent.value = formatValueToString(value, format.value);
	}

	return {
		format,
		rawContent,
		parsedValue,
		formattedContent,
		isValid,
		setFormat,
		setContent,
		setValue,
		parse: parseContent,
		formatValue: formatValueToString,
		validate: validateContent,
		validateWithError: validateContentWithError
	};
}
