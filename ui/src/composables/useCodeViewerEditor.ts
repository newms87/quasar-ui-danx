import { computed, nextTick, onUnmounted, Ref, ref } from "vue";
import { CodeFormat, UseCodeFormatReturn, ValidationError } from "./useCodeFormat";
import { highlightSyntax } from "../helpers/formats/highlightSyntax";

export interface UseCodeViewerEditorOptions {
	codeRef: Ref<HTMLPreElement | null>;
	codeFormat: UseCodeFormatReturn;
	currentFormat: Ref<CodeFormat>;
	canEdit: Ref<boolean>;
	editable: Ref<boolean>;
	onEmitModelValue: (value: object | string | null) => void;
	onEmitEditable: (editable: boolean) => void;
	/** Callback when format changes (e.g., cycling languages) */
	onEmitFormat?: (format: CodeFormat) => void;
	/** Callback when user wants to exit the code block (Ctrl+Enter) */
	onExit?: () => void;
	/** Callback when user wants to delete the code block (Backspace/Delete on empty) */
	onDelete?: () => void;
}

export interface UseCodeViewerEditorReturn {
	// State
	internalEditable: Ref<boolean>;
	editingContent: Ref<string>;
	cachedHighlightedContent: Ref<string>;
	isUserEditing: Ref<boolean>;
	validationError: Ref<ValidationError | null>;

	// Computed
	isEditing: Ref<boolean>;
	hasValidationError: Ref<boolean>;
	highlightedContent: Ref<string>;
	displayContent: Ref<string>;
	charCount: Ref<number>;
	isValid: Ref<boolean>;

	// Methods
	toggleEdit: () => void;
	onContentEditableInput: (event: Event) => void;
	onContentEditableBlur: () => void;
	onKeyDown: (event: KeyboardEvent) => void;
	syncEditableFromProp: (value: boolean) => void;
	syncEditingContentFromValue: () => void;
	updateEditingContentOnFormatChange: () => void;
}

/**
 * Get cursor offset in plain text within a contenteditable element
 */
function getCursorOffset(codeRef: HTMLPreElement | null): number {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount || !codeRef) return 0;

	const range = selection.getRangeAt(0);
	const preCaretRange = document.createRange();
	preCaretRange.selectNodeContents(codeRef);
	preCaretRange.setEnd(range.startContainer, range.startOffset);

	// Count characters by walking text nodes
	let offset = 0;
	const walker = document.createTreeWalker(preCaretRange.commonAncestorContainer, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();
	while (node) {
		if (preCaretRange.intersectsNode(node)) {
			const nodeRange = document.createRange();
			nodeRange.selectNodeContents(node);
			if (preCaretRange.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0) {
				offset += node.textContent?.length || 0;
			} else {
				// Partial node - cursor is in this node
				offset += range.startOffset;
				break;
			}
		}
		node = walker.nextNode();
	}
	return offset;
}

/**
 * Set cursor to offset in plain text within a contenteditable element
 */
function setCursorOffset(codeRef: HTMLPreElement | null, targetOffset: number): void {
	if (!codeRef) return;

	const selection = window.getSelection();
	if (!selection) return;

	let currentOffset = 0;
	const walker = document.createTreeWalker(codeRef, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();

	while (node) {
		const nodeLength = node.textContent?.length || 0;
		if (currentOffset + nodeLength >= targetOffset) {
			const range = document.createRange();
			range.setStart(node, targetOffset - currentOffset);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);
			return;
		}
		currentOffset += nodeLength;
		node = walker.nextNode();
	}

	// If offset not found, place at end
	const range = document.createRange();
	range.selectNodeContents(codeRef);
	range.collapse(false);
	selection.removeAllRanges();
	selection.addRange(range);
}

/**
 * Get current line info from cursor position
 */
function getCurrentLineInfo(editingContent: string, codeRef: HTMLPreElement | null): { indent: string; lineContent: string } | null {
	const text = editingContent;
	if (!text) return { indent: "", lineContent: "" };

	// Get cursor position in plain text
	const cursorOffset = getCursorOffset(codeRef);

	// Find the start of the current line (after the previous newline)
	const textBeforeCursor = text.substring(0, cursorOffset);
	const lastNewlineIndex = textBeforeCursor.lastIndexOf("\n");
	const lineStart = lastNewlineIndex + 1;

	// Get the content from line start to cursor
	const lineContent = textBeforeCursor.substring(lineStart);

	// Extract indentation (spaces/tabs at start of line)
	const indentMatch = lineContent.match(/^[\t ]*/);
	const indent = indentMatch ? indentMatch[0] : "";

	return { indent, lineContent };
}

/**
 * Calculate smart indentation based on context
 */
function getSmartIndent(lineInfo: { indent: string; lineContent: string }, format: CodeFormat): string {
	const { indent, lineContent } = lineInfo;
	const trimmedLine = lineContent.trim();
	const indentUnit = "  "; // 2 spaces

	if (format === "yaml") {
		// After a key with colon (e.g., "key:" or "key: |" or "key: >")
		if (trimmedLine.endsWith(":") || trimmedLine.match(/:\s*[|>][-+]?\s*$/)) {
			return indent + indentUnit;
		}
		// After array item start (e.g., "- item" or "- key: value")
		if (trimmedLine.startsWith("- ")) {
			return indent + indentUnit;
		}
		// Just "- " alone means we want to continue with same array indentation
		if (trimmedLine === "-") {
			return indent;
		}
	} else if (format === "json") {
		// After opening brace/bracket
		if (trimmedLine.endsWith("{") || trimmedLine.endsWith("[")) {
			return indent + indentUnit;
		}
		// After comma, maintain indentation
		if (trimmedLine.endsWith(",")) {
			return indent;
		}
	}

	// Default: maintain current indentation
	return indent;
}

/**
 * Get available formats that can be cycled through based on current format.
 * YAML/JSON formats cycle between each other only.
 * Text/Markdown formats cycle between each other only.
 * Other formats don't cycle.
 */
function getAvailableFormats(format: CodeFormat): CodeFormat[] {
	if (format === "json" || format === "yaml") {
		return ["yaml", "json"];
	}
	if (format === "text" || format === "markdown") {
		return ["text", "markdown"];
	}
	return [format];
}

/**
 * Composable for CodeViewer editor functionality
 */
export function useCodeViewerEditor(options: UseCodeViewerEditorOptions): UseCodeViewerEditorReturn {
	const { codeRef, codeFormat, currentFormat, canEdit, editable, onEmitModelValue, onEmitEditable, onEmitFormat, onExit, onDelete } = options;

	// Debounce timeout handles
	let validationTimeout: ReturnType<typeof setTimeout> | null = null;
	let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

	// Local state
	const internalEditable = ref(editable.value);
	const editingContent = ref("");
	const cachedHighlightedContent = ref("");
	const isUserEditing = ref(false);
	const validationError = ref<ValidationError | null>(null);

	// Computed: has validation error
	const hasValidationError = computed(() => validationError.value !== null);

	// Computed: is currently in edit mode
	const isEditing = computed(() => canEdit.value && internalEditable.value);

	// Computed: display content
	const displayContent = computed(() => {
		if (isUserEditing.value) {
			return editingContent.value;
		}
		return codeFormat.formattedContent.value;
	});

	// Computed: highlighted content with syntax highlighting
	const highlightedContent = computed(() => {
		if (isUserEditing.value) {
			return cachedHighlightedContent.value;
		}
		const highlighted = highlightSyntax(displayContent.value, { format: currentFormat.value });
		cachedHighlightedContent.value = highlighted;
		return highlighted;
	});

	// Computed: is current content valid
	const isValid = computed(() => {
		if (hasValidationError.value) return false;
		return codeFormat.isValid.value;
	});

	// Computed: character count
	const charCount = computed(() => {
		return displayContent.value?.length || 0;
	});

	// Sync internal editable state with prop
	function syncEditableFromProp(value: boolean): void {
		internalEditable.value = value;
	}

	// Sync editing content when external value changes
	function syncEditingContentFromValue(): void {
		if (!isUserEditing.value) {
			editingContent.value = codeFormat.formattedContent.value;
		}
	}

	// Update editing content when format changes and re-apply syntax highlighting
	function updateEditingContentOnFormatChange(): void {
		if (isEditing.value) {
			editingContent.value = codeFormat.formattedContent.value;
			// Update the cached highlighted content with new format
			cachedHighlightedContent.value = highlightSyntax(editingContent.value, { format: currentFormat.value });
			// Re-apply syntax highlighting with new format in the DOM
			nextTick(() => {
				if (codeRef.value) {
					codeRef.value.innerHTML = cachedHighlightedContent.value;
				}
			});
		}
	}

	// Debounced validation
	function debouncedValidate(): void {
		if (validationTimeout) {
			clearTimeout(validationTimeout);
		}
		validationTimeout = setTimeout(() => {
			validationError.value = codeFormat.validateWithError(editingContent.value, currentFormat.value);
		}, 300);
	}

	// Debounced highlighting
	function debouncedHighlight(): void {
		if (highlightTimeout) {
			clearTimeout(highlightTimeout);
		}
		highlightTimeout = setTimeout(() => {
			if (!codeRef.value || !isEditing.value) return;

			// Check if document has active focus on the codeRef before replacing innerHTML
			const activeElement = document.activeElement;
			const hasFocus = activeElement === codeRef.value || codeRef.value.contains(activeElement);

			// Save cursor position
			const cursorOffset = getCursorOffset(codeRef.value);

			// Re-apply highlighting
			codeRef.value.innerHTML = highlightSyntax(editingContent.value, { format: currentFormat.value });

			// Restore cursor position
			setCursorOffset(codeRef.value, cursorOffset);

			// Ensure the element maintains focus after innerHTML replacement
			// This is important because innerHTML replacement can cause focus loss
			if (hasFocus && document.activeElement !== codeRef.value) {
				codeRef.value.focus();
			}
		}, 300);
	}

	// Toggle edit mode
	function toggleEdit(): void {
		internalEditable.value = !internalEditable.value;
		onEmitEditable(internalEditable.value);

		if (internalEditable.value) {
			// Entering edit mode - initialize editing content and clear any previous error
			editingContent.value = codeFormat.formattedContent.value;
			validationError.value = null;
			// Set content imperatively with syntax highlighting and focus
			nextTick(() => {
				if (codeRef.value) {
					codeRef.value.innerHTML = highlightSyntax(editingContent.value, { format: currentFormat.value });
					codeRef.value.focus();
					// Move cursor to end
					const selection = window.getSelection();
					const range = document.createRange();
					range.selectNodeContents(codeRef.value);
					range.collapse(false);
					selection?.removeAllRanges();
					selection?.addRange(range);
				}
			});
		} else {
			// Exiting edit mode - clear validation error
			validationError.value = null;
		}
	}

	// Handle contenteditable input
	function onContentEditableInput(event: Event): void {
		if (!isEditing.value) return;

		isUserEditing.value = true;
		const target = event.target as HTMLElement;
		editingContent.value = target.innerText || "";

		debouncedValidate();
		debouncedHighlight();
	}

	// Handle blur - emit changes and re-apply highlighting
	function onContentEditableBlur(): void {
		if (!isEditing.value || !isUserEditing.value) return;

		isUserEditing.value = false;

		// Clear pending timeouts and process immediately
		if (validationTimeout) {
			clearTimeout(validationTimeout);
			validationTimeout = null;
		}
		if (highlightTimeout) {
			clearTimeout(highlightTimeout);
			highlightTimeout = null;
		}
		validationError.value = codeFormat.validateWithError(editingContent.value, currentFormat.value);

		// Parse and emit the value
		const parsed = codeFormat.parse(editingContent.value);
		if (parsed) {
			onEmitModelValue(parsed);
		} else {
			onEmitModelValue(editingContent.value);
		}

		// Re-apply syntax highlighting after editing
		if (codeRef.value) {
			codeRef.value.innerHTML = highlightSyntax(editingContent.value, { format: currentFormat.value });
		}
	}

	// Handle keyboard shortcuts (some work in any mode, some only in edit mode)
	function onKeyDown(event: KeyboardEvent): void {
		// Ctrl/Cmd + Alt + L - cycle through available formats/languages
		// This should work even when not in edit mode
		const isCtrlAltL = (event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === "l";

		if (isCtrlAltL) {
			event.preventDefault();
			event.stopPropagation();

			if (onEmitFormat) {
				const availableFormats = getAvailableFormats(currentFormat.value);
				if (availableFormats.length > 1) {
					const currentIndex = availableFormats.indexOf(currentFormat.value);
					const nextIndex = (currentIndex + 1) % availableFormats.length;
					const nextFormat = availableFormats[nextIndex];
					onEmitFormat(nextFormat);
				}
			}
			return;
		}

		// All other shortcuts require edit mode
		if (!isEditing.value) return;

		// Backspace/Delete on empty content - delete the code block
		if ((event.key === "Backspace" || event.key === "Delete") && onDelete) {
			const content = editingContent.value.trim();
			if (content === "") {
				event.preventDefault();
				onDelete();
				return;
			}
		}

		// Ctrl/Cmd + Enter - exit the code block immediately
		if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			if (onExit) {
				// Emit the current value before exiting
				const parsed = codeFormat.parse(editingContent.value);
				if (parsed) {
					onEmitModelValue(parsed);
				} else {
					onEmitModelValue(editingContent.value);
				}
				onExit();
			}
			return;
		}

		// Enter key - smart indentation
		if (event.key === "Enter") {
			const selection = window.getSelection();

			// If no selection, try to ensure we have one by focusing the element
			if (!selection || selection.rangeCount === 0) {
				// Fallback: position cursor at end of content
				if (codeRef.value) {
					const range = document.createRange();
					range.selectNodeContents(codeRef.value);
					range.collapse(false);
					selection?.removeAllRanges();
					selection?.addRange(range);
				}
			}

			// Re-check selection - if still none, let browser handle it
			if (!selection || selection.rangeCount === 0) {
				return;
			}

			event.preventDefault();

			// Check if the range is actually valid and positioned within our codeRef
			let range = selection.getRangeAt(0);
			const isWithinCodeRef = codeRef.value?.contains(range.startContainer);

			// If selection is not within codeRef, re-create it at the end of content
			// This can happen after innerHTML replacement in debouncedHighlight
			if (!isWithinCodeRef && codeRef.value) {
				range = document.createRange();
				range.selectNodeContents(codeRef.value);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			}

			// IMPORTANT: Always use the DOM's actual content, not editingContent.value
			// editingContent.value may be stale if isUserEditing is false (e.g., after debounced highlight)
			const domTextContent = codeRef.value?.innerText || "";
			const lineInfo = getCurrentLineInfo(domTextContent, codeRef.value);
			const smartIndent = lineInfo ? getSmartIndent(lineInfo, currentFormat.value) : "";

			range.deleteContents();
			const textNode = document.createTextNode("\n" + smartIndent);
			range.insertNode(textNode);
			range.setStartAfter(textNode);
			range.setEndAfter(textNode);
			selection.removeAllRanges();
			selection.addRange(range);

			codeRef.value?.dispatchEvent(new Event("input", { bubbles: true }));
		}

		// Tab key - insert spaces instead of moving focus
		if (event.key === "Tab") {
			event.preventDefault();
			document.execCommand("insertText", false, "  ");
		}

		// Escape - exit edit mode
		if (event.key === "Escape") {
			event.preventDefault();
			onContentEditableBlur();
			toggleEdit();
		}

		// Ctrl/Cmd + S - save without exiting
		if ((event.ctrlKey || event.metaKey) && event.key === "s") {
			event.preventDefault();
			onContentEditableBlur();
		}

		// Ctrl/Cmd + A - select all content within this CodeViewer only
		if ((event.ctrlKey || event.metaKey) && event.key === "a") {
			event.preventDefault();
			event.stopPropagation();

			// Select all content in the current contenteditable element
			const selection = window.getSelection();
			if (selection && codeRef.value) {
				const range = document.createRange();
				range.selectNodeContents(codeRef.value);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
	}

	// Initialize editing content when starting in edit mode
	// This handles the case where editable=true is passed as initial prop
	if (isEditing.value) {
		editingContent.value = codeFormat.formattedContent.value;
		// Set the pre element content after it mounts
		nextTick(() => {
			if (codeRef.value) {
				codeRef.value.innerHTML = highlightSyntax(editingContent.value, { format: currentFormat.value });
			}
		});
	}

	// Cleanup timeouts on unmount
	onUnmounted(() => {
		if (validationTimeout) clearTimeout(validationTimeout);
		if (highlightTimeout) clearTimeout(highlightTimeout);
	});

	return {
		// State
		internalEditable,
		editingContent,
		cachedHighlightedContent,
		isUserEditing,
		validationError,

		// Computed
		isEditing,
		hasValidationError,
		highlightedContent,
		displayContent,
		charCount,
		isValid,

		// Methods
		toggleEdit,
		onContentEditableInput,
		onContentEditableBlur,
		onKeyDown,
		syncEditableFromProp,
		syncEditingContentFromValue,
		updateEditingContentOnFormatChange
	};
}
