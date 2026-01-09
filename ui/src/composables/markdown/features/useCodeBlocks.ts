import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "../useMarkdownSelection";
import { detectCodeFenceStart } from "../../../helpers/formats/markdown/linePatterns";

/**
 * Options for useCodeBlocks composable
 */
export interface UseCodeBlocksOptions {
	contentRef: Ref<HTMLElement | null>;
	selection: UseMarkdownSelectionReturn;
	onContentChange: () => void;
}

/**
 * Return type for useCodeBlocks composable
 */
export interface UseCodeBlocksReturn {
	/** Toggle code block on current block (Ctrl+Shift+K) */
	toggleCodeBlock: () => void;
	/** Check for code fence pattern (```) and convert if matched */
	checkAndConvertCodeBlockPattern: () => boolean;
	/** Check if cursor is inside a code block */
	isInCodeBlock: () => boolean;
	/** Get current code block's language */
	getCurrentCodeBlockLanguage: () => string | null;
	/** Set language for current code block */
	setCodeBlockLanguage: (language: string) => void;
	/** Handle Enter key in code block - returns true if handled */
	handleCodeBlockEnter: () => boolean;
}

/**
 * Check if an element is a block type that can be converted to a code block
 * Includes paragraphs, divs, and headings (H1-H6)
 */
function isConvertibleBlock(element: Element): boolean {
	const tag = element.tagName;
	return tag === "P" || tag === "DIV" || /^H[1-6]$/.test(tag);
}

/**
 * Get the block-level parent element containing the cursor
 */
function getTargetBlock(contentRef: Ref<HTMLElement | null>, selection: UseMarkdownSelectionReturn): Element | null {
	const currentBlock = selection.getCurrentBlock();
	if (!currentBlock) return null;

	// For paragraphs, divs, headings, and PRE, return directly
	if (isConvertibleBlock(currentBlock) || currentBlock.tagName === "PRE") {
		return currentBlock;
	}

	// For list items, return the LI
	if (currentBlock.tagName === "LI") {
		return currentBlock;
	}

	// Walk up to find a convertible block or PRE
	if (!contentRef.value) return null;

	let current: Element | null = currentBlock;
	while (current && current.parentElement !== contentRef.value) {
		if (isConvertibleBlock(current) || current.tagName === "PRE" || current.tagName === "LI") {
			return current;
		}
		current = current.parentElement;
	}

	// Check if this direct child is a convertible block or PRE
	if (current && (isConvertibleBlock(current) || current.tagName === "PRE")) {
		return current;
	}

	return null;
}

/**
 * Get the PRE element containing the cursor (if in a code block)
 */
function getCodeBlockElement(selection: UseMarkdownSelectionReturn): HTMLPreElement | null {
	const currentBlock = selection.getCurrentBlock();
	if (!currentBlock) return null;

	// Walk up to find PRE
	let current: Element | null = currentBlock;
	while (current) {
		if (current.tagName === "PRE") {
			return current as HTMLPreElement;
		}
		current = current.parentElement;
	}

	return null;
}

/**
 * Position cursor at end of element
 */
function positionCursorAtEnd(element: Element): void {
	const sel = window.getSelection();
	if (!sel) return;

	const range = document.createRange();

	// Find last text node
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	let lastTextNode: Text | null = null;
	let node: Text | null;
	while ((node = walker.nextNode() as Text | null)) {
		lastTextNode = node;
	}

	if (lastTextNode) {
		range.setStart(lastTextNode, lastTextNode.length);
		range.collapse(true);
	} else {
		range.selectNodeContents(element);
		range.collapse(false);
	}

	sel.removeAllRanges();
	sel.addRange(range);
}

/**
 * Zero-width space character used as cursor anchor in empty elements.
 * This is necessary because contenteditable doesn't position the cursor
 * correctly in empty elements - subsequent typing ends up as sibling nodes.
 */
export const CURSOR_ANCHOR = "\u200B";

/**
 * Position cursor at start of element.
 * If the element contains a zero-width space cursor anchor, positions after it
 * so typing replaces/follows the anchor rather than creating sibling nodes.
 */
function positionCursorAtStart(element: Element): void {
	const sel = window.getSelection();
	if (!sel) return;

	const range = document.createRange();

	// Find first text node
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	const firstTextNode = walker.nextNode() as Text | null;

	if (firstTextNode) {
		// If there's a cursor anchor (zero-width space), position after it
		// so typing goes into the element rather than creating siblings
		if (firstTextNode.textContent === CURSOR_ANCHOR) {
			range.setStart(firstTextNode, firstTextNode.length);
		} else {
			range.setStart(firstTextNode, 0);
		}
		range.collapse(true);
	} else {
		range.selectNodeContents(element);
		range.collapse(true);
	}

	sel.removeAllRanges();
	sel.addRange(range);
}

/**
 * Convert a paragraph/div/heading to a code block
 */
function convertToCodeBlock(block: Element, language: string = ""): HTMLPreElement {
	const pre = document.createElement("pre");
	const code = document.createElement("code");

	if (language) {
		code.className = `language-${language}`;
	}

	// Move content from block to code element
	code.textContent = block.textContent || "";

	pre.appendChild(code);

	// Replace block with code block
	block.parentNode?.replaceChild(pre, block);

	return pre;
}

/**
 * Convert a code block back to a paragraph
 */
function convertCodeBlockToParagraph(pre: HTMLPreElement): HTMLParagraphElement {
	const p = document.createElement("p");

	// Get text content from code element or directly from pre
	const codeElement = pre.querySelector("code");
	p.textContent = codeElement?.textContent || pre.textContent || "";

	// Replace pre with paragraph
	pre.parentNode?.replaceChild(p, pre);

	return p;
}

/**
 * Composable for code block operations in markdown editor
 */
export function useCodeBlocks(options: UseCodeBlocksOptions): UseCodeBlocksReturn {
	const { contentRef, selection, onContentChange } = options;

	/**
	 * Check if cursor is inside a code block
	 */
	function isInCodeBlock(): boolean {
		return getCodeBlockElement(selection) !== null;
	}

	/**
	 * Get current code block's language
	 */
	function getCurrentCodeBlockLanguage(): string | null {
		const pre = getCodeBlockElement(selection);
		if (!pre) return null;

		const codeElement = pre.querySelector("code");
		if (!codeElement) return null;

		const match = codeElement.className.match(/language-(\w+)/);
		return match ? match[1] : "";
	}

	/**
	 * Set language for current code block
	 */
	function setCodeBlockLanguage(language: string): void {
		const pre = getCodeBlockElement(selection);
		if (!pre) return;

		const codeElement = pre.querySelector("code");
		if (!codeElement) return;

		// Remove existing language classes
		let newClassName = codeElement.className.replace(/language-\w+/g, "").trim();

		if (language) {
			newClassName = (newClassName + ` language-${language}`).trim();
		}

		// Only set className if it has content, otherwise remove the attribute entirely
		if (newClassName) {
			codeElement.className = newClassName;
		} else {
			codeElement.removeAttribute("class");
		}

		onContentChange();
	}

	/**
	 * Handle Enter key press when in a code block
	 * - Normal Enter: insert a newline inside the code block
	 * - If content ends with two consecutive newlines (user pressed Enter twice at end):
	 *   exit the code block and create a new paragraph below
	 * @returns true if the Enter was handled, false to let browser handle it
	 */
	function handleCodeBlockEnter(): boolean {
		if (!contentRef.value) return false;

		// Check if we're in a code block
		const pre = getCodeBlockElement(selection);
		if (!pre) return false;

		const codeElement = pre.querySelector("code");
		if (!codeElement) return false;

		// Get cursor position information
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return false;

		const range = sel.getRangeAt(0);

		// Get the current text content (strip cursor anchor zero-width spaces)
		const content = (codeElement.textContent || "").replace(/\u200B/g, "");

		// Check if cursor is at the end of the code content
		const cursorAtEnd = isCursorAtEndOfCode(codeElement, range);

		// Check if content ends with two newlines (user pressed Enter twice already at the end)
		if (cursorAtEnd && content.endsWith("\n\n")) {
			// Exit code block: remove the trailing newlines, create paragraph after
			// Update the code content by removing the trailing newlines
			const newContent = content.slice(0, -2);
			codeElement.textContent = newContent || CURSOR_ANCHOR;

			// Create new paragraph after the code block
			const p = document.createElement("p");
			// Use a <br> to make the empty paragraph editable
			p.appendChild(document.createElement("br"));
			pre.parentNode?.insertBefore(p, pre.nextSibling);

			// Position cursor in the new paragraph
			positionCursorAtStart(p);

			onContentChange();
			return true;
		}

		// Insert a newline at cursor position
		// When inserting at the end, we need to add a cursor anchor (zero-width space)
		// after the newline to make the trailing newline visible in contenteditable.
		// Browsers collapse trailing whitespace, so the anchor gives the cursor something
		// to position on. The anchor is stripped during HTML-to-markdown conversion.
		if (cursorAtEnd) {
			insertTextAtCursorWithAnchor("\n", codeElement);
		} else {
			insertTextAtCursor("\n");
		}

		onContentChange();
		return true;
	}

	/**
	 * Insert text at the current cursor position
	 */
	function insertTextAtCursor(text: string): void {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return;

		const range = sel.getRangeAt(0);
		range.deleteContents();

		const textNode = document.createTextNode(text);
		range.insertNode(textNode);

		// Position cursor after the inserted text
		range.setStartAfter(textNode);
		range.setEndAfter(textNode);
		sel.removeAllRanges();
		sel.addRange(range);
	}

	/**
	 * Insert text at cursor position with a cursor anchor at the end.
	 * This is used when inserting newlines at the end of code blocks to ensure
	 * the trailing newline is visible (browsers collapse trailing whitespace).
	 *
	 * First removes any existing cursor anchors from the code element to avoid
	 * accumulating multiple anchors, then inserts the text followed by a new anchor.
	 */
	function insertTextAtCursorWithAnchor(text: string, codeElement: Element): void {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return;

		// First, remove any existing cursor anchors from the code element
		// to avoid accumulating multiple anchors
		const currentContent = codeElement.textContent || "";
		const cleanContent = currentContent.replace(/\u200B/g, "");

		// Get cursor position relative to clean content
		const range = sel.getRangeAt(0);

		// Calculate the offset in the clean content
		// We need to count how many characters come before the cursor, excluding cursor anchors
		let cursorOffset = 0;
		const walker = document.createTreeWalker(codeElement, NodeFilter.SHOW_TEXT);
		let node: Text | null;
		while ((node = walker.nextNode() as Text | null)) {
			if (node === range.startContainer) {
				// Count characters up to cursor position, excluding cursor anchors
				const textBeforeCursor = node.textContent?.slice(0, range.startOffset) || "";
				cursorOffset += textBeforeCursor.replace(/\u200B/g, "").length;
				break;
			} else {
				cursorOffset += (node.textContent || "").replace(/\u200B/g, "").length;
			}
		}

		// Build new content: content before cursor + new text + cursor anchor
		const newContent = cleanContent.slice(0, cursorOffset) + text + CURSOR_ANCHOR + cleanContent.slice(cursorOffset);

		// Set the new content
		codeElement.textContent = newContent;

		// Position cursor after the inserted text (before the cursor anchor)
		const newCursorOffset = cursorOffset + text.length;
		const newTextNode = codeElement.firstChild as Text;
		if (newTextNode) {
			const newRange = document.createRange();
			newRange.setStart(newTextNode, newCursorOffset);
			newRange.collapse(true);
			sel.removeAllRanges();
			sel.addRange(newRange);
		}
	}

	/**
	 * Check if cursor is at the end of a code element's content.
	 * Considers cursor anchors (zero-width spaces) as "not content" - if the only
	 * thing after the cursor is a cursor anchor, it's still considered at the end.
	 */
	function isCursorAtEndOfCode(codeElement: Element, range: Range): boolean {
		// Create a range from cursor to end of code element
		const testRange = document.createRange();
		testRange.setStart(range.endContainer, range.endOffset);

		// Find the last text node or the element itself if empty
		const lastChild = codeElement.lastChild;
		if (lastChild) {
			if (lastChild.nodeType === Node.TEXT_NODE) {
				testRange.setEnd(lastChild, (lastChild as Text).length);
			} else {
				testRange.setEndAfter(lastChild);
			}
		} else {
			testRange.setEndAfter(codeElement);
		}

		// Get the text after the cursor, stripping cursor anchors
		const textAfterCursor = testRange.toString().replace(/\u200B/g, "");

		// If no real content after cursor (ignoring cursor anchors), cursor is at end
		return textAfterCursor === "";
	}

	/**
	 * Toggle code block on the current block
	 * - If paragraph/div/heading: convert to <pre><code>
	 * - If already in code block: convert back to paragraph
	 * - If in a list: convert list item to paragraph first, then to code block
	 */
	function toggleCodeBlock(): void {
		if (!contentRef.value) return;

		// Check if already in code block
		const pre = getCodeBlockElement(selection);
		if (pre) {
			// Already in code block - convert to paragraph
			const p = convertCodeBlockToParagraph(pre);
			positionCursorAtEnd(p);
			onContentChange();
			return;
		}

		// Get the target block
		const block = getTargetBlock(contentRef, selection);
		if (!block) return;

		// If in a list item, we can't directly convert to code block
		// The caller (MarkdownEditor) should handle this by first converting to paragraph
		if (block.tagName === "LI") {
			// For now, just return - the menu handler will deal with this
			return;
		}

		// Convert to code block
		if (isConvertibleBlock(block)) {
			const pre = convertToCodeBlock(block, "");
			const code = pre.querySelector("code");
			if (code) {
				positionCursorAtEnd(code);
			} else {
				positionCursorAtEnd(pre);
			}
			onContentChange();
		}
	}

	/**
	 * Check if the current block contains a code fence pattern (``` or ```language)
	 * and convert it to the appropriate code block if detected.
	 * Only converts paragraphs/divs/headings, not existing code blocks.
	 * @returns true if a pattern was detected and converted, false otherwise
	 */
	function checkAndConvertCodeBlockPattern(): boolean {
		if (!contentRef.value) return false;

		const block = getTargetBlock(contentRef, selection);
		if (!block) return false;

		// Only convert paragraphs, divs, or headings - not existing code blocks or list items
		if (!isConvertibleBlock(block)) return false;

		// Get the text content of the block
		const textContent = block.textContent || "";

		// Check for code fence pattern
		const pattern = detectCodeFenceStart(textContent);
		if (!pattern) return false;

		// Pattern detected - convert to code block
		const language = pattern.language || "";

		// Create the new code block structure
		const pre = document.createElement("pre");
		const code = document.createElement("code");

		if (language) {
			code.className = `language-${language}`;
		}

		// Code block starts with a zero-width space as cursor anchor.
		// This is necessary because contenteditable doesn't position the cursor
		// correctly in empty elements - the anchor gives the cursor something to hold onto.
		// The zero-width space is stripped during htmlToMarkdown conversion.
		code.textContent = CURSOR_ANCHOR;

		pre.appendChild(code);

		// Replace block with code block
		block.parentNode?.replaceChild(pre, block);

		// Position cursor at the start of the code element (which is empty)
		positionCursorAtStart(code);

		// Notify of content change
		onContentChange();

		return true;
	}

	return {
		toggleCodeBlock,
		checkAndConvertCodeBlockPattern,
		isInCodeBlock,
		getCurrentCodeBlockLanguage,
		setCodeBlockLanguage,
		handleCodeBlockEnter
	};
}
