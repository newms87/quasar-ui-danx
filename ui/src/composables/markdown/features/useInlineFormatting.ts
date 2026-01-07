import { Ref } from "vue";

/**
 * Options for useInlineFormatting composable
 */
export interface UseInlineFormattingOptions {
	contentRef: Ref<HTMLElement | null>;
	onContentChange: () => void;
}

/**
 * Return type for useInlineFormatting composable
 */
export interface UseInlineFormattingReturn {
	/** Toggle bold formatting on selection */
	toggleBold: () => void;
	/** Toggle italic formatting on selection */
	toggleItalic: () => void;
	/** Toggle strikethrough formatting on selection */
	toggleStrikethrough: () => void;
	/** Toggle inline code formatting on selection */
	toggleInlineCode: () => void;
}

/**
 * Inline formatting tag mappings
 */
const FORMAT_TAGS = {
	bold: { tag: "STRONG", fallback: "B" },
	italic: { tag: "EM", fallback: "I" },
	strikethrough: { tag: "DEL", fallback: "S" },
	code: { tag: "CODE", fallback: null }
} as const;

type FormatType = keyof typeof FORMAT_TAGS;

/**
 * Check if a node or its ancestors have a specific formatting tag
 */
function hasFormatting(node: Node | null, formatType: FormatType): Element | null {
	const { tag, fallback } = FORMAT_TAGS[formatType];

	let current: Node | null = node;
	while (current && current.nodeType !== Node.DOCUMENT_NODE) {
		if (current.nodeType === Node.ELEMENT_NODE) {
			const element = current as Element;
			const tagName = element.tagName.toUpperCase();
			if (tagName === tag || (fallback && tagName === fallback)) {
				return element;
			}
		}
		current = current.parentNode;
	}
	return null;
}

/**
 * Get the deepest common ancestor element of a range that's still within contentRef
 */
function getCommonAncestor(range: Range, contentRef: HTMLElement): Element | null {
	let ancestor = range.commonAncestorContainer;

	// If it's a text node, get its parent
	if (ancestor.nodeType === Node.TEXT_NODE) {
		ancestor = ancestor.parentNode as Node;
	}

	// Make sure we're within the content area
	if (!contentRef.contains(ancestor)) {
		return null;
	}

	return ancestor as Element;
}

/**
 * Composable for inline formatting operations in markdown editor
 */
export function useInlineFormatting(options: UseInlineFormattingOptions): UseInlineFormattingReturn {
	const { contentRef, onContentChange } = options;

	/**
	 * Apply or remove inline formatting to the current selection
	 */
	function toggleFormat(formatType: FormatType): void {
		if (!contentRef.value) return;

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);

		// Check if selection is within our content area
		if (!contentRef.value.contains(range.commonAncestorContainer)) return;

		const { tag } = FORMAT_TAGS[formatType];

		// Check if the selection is already formatted
		const existingFormat = hasFormatting(range.commonAncestorContainer, formatType);

		if (existingFormat && range.toString() === existingFormat.textContent) {
			// Selection matches the entire formatted element - remove formatting
			removeFormatting(existingFormat);
		} else if (existingFormat && range.collapsed) {
			// Cursor is inside formatted text with no selection - remove formatting
			removeFormatting(existingFormat);
		} else if (!range.collapsed) {
			// There's a selection - wrap it with formatting
			wrapSelection(range, tag.toLowerCase());
		} else {
			// No selection, cursor only - insert formatted placeholder
			insertFormattedPlaceholder(range, tag.toLowerCase(), formatType);
		}

		onContentChange();
	}

	/**
	 * Remove formatting from an element, keeping its content
	 */
	function removeFormatting(element: Element): void {
		const parent = element.parentNode;
		if (!parent) return;

		// Move all children out of the formatted element
		while (element.firstChild) {
			parent.insertBefore(element.firstChild, element);
		}

		// Remove the empty formatting element
		parent.removeChild(element);

		// Normalize to merge adjacent text nodes
		parent.normalize();
	}

	/**
	 * Wrap the current selection with a formatting tag
	 */
	function wrapSelection(range: Range, tagName: string): void {
		// Create the formatting element
		const formatElement = document.createElement(tagName);

		// Extract the selected content and wrap it
		const contents = range.extractContents();
		formatElement.appendChild(contents);

		// Insert the wrapped content
		range.insertNode(formatElement);

		// Select the newly formatted content
		const newRange = document.createRange();
		newRange.selectNodeContents(formatElement);

		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
			selection.addRange(newRange);
		}
	}

	/**
	 * Insert a formatted placeholder when there's no selection
	 */
	function insertFormattedPlaceholder(range: Range, tagName: string, formatType: FormatType): void {
		// Create the formatting element with placeholder text
		const formatElement = document.createElement(tagName);
		const placeholderText = getPlaceholderText(formatType);
		formatElement.textContent = placeholderText;

		// Insert at cursor position
		range.insertNode(formatElement);

		// Select the placeholder text so user can type over it
		const newRange = document.createRange();
		newRange.selectNodeContents(formatElement);

		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
			selection.addRange(newRange);
		}
	}

	/**
	 * Get placeholder text for a format type
	 */
	function getPlaceholderText(formatType: FormatType): string {
		switch (formatType) {
			case "bold":
				return "bold text";
			case "italic":
				return "italic text";
			case "strikethrough":
				return "strikethrough text";
			case "code":
				return "code";
			default:
				return "text";
		}
	}

	/**
	 * Toggle bold formatting (Ctrl+B)
	 */
	function toggleBold(): void {
		toggleFormat("bold");
	}

	/**
	 * Toggle italic formatting (Ctrl+I)
	 */
	function toggleItalic(): void {
		toggleFormat("italic");
	}

	/**
	 * Toggle strikethrough formatting (Ctrl+Shift+S)
	 */
	function toggleStrikethrough(): void {
		toggleFormat("strikethrough");
	}

	/**
	 * Toggle inline code formatting (Ctrl+E)
	 */
	function toggleInlineCode(): void {
		toggleFormat("code");
	}

	return {
		toggleBold,
		toggleItalic,
		toggleStrikethrough,
		toggleInlineCode
	};
}
