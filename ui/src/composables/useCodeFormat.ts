import { computed, ref, Ref } from "vue";
import { parse as parseYAML, stringify as yamlStringify } from "yaml";
import { fJSON, parseMarkdownJSON, parseMarkdownYAML } from "../helpers/formats/parsers";

export type CodeFormat = "json" | "yaml" | "text";

export interface UseCodeFormatOptions {
	initialFormat?: CodeFormat;
	initialValue?: object | string | null;
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

	// Initialize with value if provided
	if (options.initialValue) {
		rawContent.value = formatValueToString(options.initialValue, format.value);
	}

	// Computed: parsed object from raw content
	const parsedValue = computed(() => parseContent(rawContent.value));

	// Computed: formatted string
	const formattedContent = computed(() => formatValueToString(parsedValue.value, format.value));

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
		validate: validateContent
	};
}
