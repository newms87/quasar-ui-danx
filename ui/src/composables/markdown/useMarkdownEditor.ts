import { computed, nextTick, Ref, ref } from "vue";
import { HotkeyDefinition, useMarkdownHotkeys } from "./useMarkdownHotkeys";
import { useMarkdownSelection } from "./useMarkdownSelection";
import { useMarkdownSync } from "./useMarkdownSync";
import { useCodeBlocks } from "./features/useCodeBlocks";
import { useHeadings } from "./features/useHeadings";
import { useInlineFormatting } from "./features/useInlineFormatting";
import { useLists } from "./features/useLists";

/**
 * Options for useMarkdownEditor composable
 */
export interface UseMarkdownEditorOptions {
	contentRef: Ref<HTMLElement | null>;
	initialValue: string;
	onEmitValue: (markdown: string) => void;
}

/**
 * Return type for useMarkdownEditor composable
 */
export interface UseMarkdownEditorReturn {
	// From sync
	renderedHtml: Ref<string>;
	isInternalUpdate: Ref<boolean>;

	// State
	isShowingHotkeyHelp: Ref<boolean>;
	charCount: Ref<number>;

	// Event handlers
	onInput: () => void;
	onKeyDown: (event: KeyboardEvent) => void;
	onBlur: () => void;

	// For external value updates
	setMarkdown: (markdown: string) => void;

	// Hotkey help
	showHotkeyHelp: () => void;
	hideHotkeyHelp: () => void;
	hotkeyDefinitions: Ref<HotkeyDefinition[]>;

	// Feature access (for custom hotkey registration)
	headings: ReturnType<typeof useHeadings>;
	inlineFormatting: ReturnType<typeof useInlineFormatting>;
	lists: ReturnType<typeof useLists>;
	codeBlocks: ReturnType<typeof useCodeBlocks>;
}

/**
 * Main orchestrator composable for markdown editor
 * Composes selection, sync, hotkeys, and feature composables
 */
export function useMarkdownEditor(options: UseMarkdownEditorOptions): UseMarkdownEditorReturn {
	const { contentRef, initialValue, onEmitValue } = options;

	// State
	const isShowingHotkeyHelp = ref(false);

	// Initialize selection management
	const selection = useMarkdownSelection(contentRef);

	// Initialize sync
	const sync = useMarkdownSync({
		contentRef,
		onEmitValue,
		debounceMs: 300
	});

	// Initialize hotkeys
	const hotkeys = useMarkdownHotkeys({
		contentRef,
		onShowHotkeyHelp: () => {
			isShowingHotkeyHelp.value = true;
		}
	});

	// Initialize headings feature
	const headings = useHeadings({
		contentRef,
		selection,
		onContentChange: () => {
			sync.debouncedSyncFromHtml();
		}
	});

	// Initialize inline formatting feature
	const inlineFormatting = useInlineFormatting({
		contentRef,
		onContentChange: () => {
			sync.debouncedSyncFromHtml();
		}
	});

	// Initialize lists feature
	const lists = useLists({
		contentRef,
		selection,
		onContentChange: () => {
			sync.debouncedSyncFromHtml();
		}
	});

	// Initialize code blocks feature
	const codeBlocks = useCodeBlocks({
		contentRef,
		selection,
		onContentChange: () => {
			sync.debouncedSyncFromHtml();
		}
	});

	// Register default hotkeys
	registerDefaultHotkeys();

	/**
	 * Set heading level, handling list items by converting to paragraph first.
	 * This wrapper ensures Ctrl+0-6 hotkeys work even when cursor is in a list.
	 */
	function setHeadingLevelWithListHandling(level: 0 | 1 | 2 | 3 | 4 | 5 | 6): void {
		// Check if currently in a list
		const listType = lists.getCurrentListType();
		if (listType) {
			// Convert list item to paragraph first
			lists.convertCurrentListItemToParagraph();
		}

		// Now apply heading level (skip if level is 0 and we just converted from list,
		// because convertCurrentListItemToParagraph already creates a paragraph)
		if (level > 0 || !listType) {
			headings.setHeadingLevel(level);
		}
	}

	/**
	 * Increase heading level, handling list items by converting to paragraph first.
	 * This wrapper ensures Ctrl+> hotkey works even when cursor is in a list.
	 */
	function increaseHeadingLevelWithListHandling(): void {
		const listType = lists.getCurrentListType();
		if (listType) {
			// Convert list item to paragraph first, then apply H6 (since P -> H6 is first step)
			lists.convertCurrentListItemToParagraph();
			headings.setHeadingLevel(6);
		} else {
			headings.increaseHeadingLevel();
		}
	}

	/**
	 * Decrease heading level, handling list items by converting to paragraph first.
	 * This wrapper ensures Ctrl+< hotkey works even when cursor is in a list.
	 * For list items, just converts to paragraph (since that's the lowest level).
	 */
	function decreaseHeadingLevelWithListHandling(): void {
		const listType = lists.getCurrentListType();
		if (listType) {
			// Convert list item to paragraph (already at paragraph level after conversion)
			lists.convertCurrentListItemToParagraph();
		} else {
			headings.decreaseHeadingLevel();
		}
	}

	/**
	 * Toggle code block, handling list items by converting to paragraph first.
	 * This wrapper ensures Ctrl+Shift+K hotkey works even when cursor is in a list.
	 */
	function toggleCodeBlockWithListHandling(): void {
		// If already in a code block, just toggle off
		if (codeBlocks.isInCodeBlock()) {
			codeBlocks.toggleCodeBlock();
			return;
		}

		// Check if currently in a list
		const listType = lists.getCurrentListType();
		if (listType) {
			// Convert list item to paragraph first
			lists.convertCurrentListItemToParagraph();
		}

		// Now toggle to code block
		codeBlocks.toggleCodeBlock();
	}

	// Computed character count
	const charCount = computed(() => {
		return contentRef.value?.textContent?.length || 0;
	});

	// Reactive hotkey definitions for UI
	const hotkeyDefinitions = computed(() => {
		return hotkeys.getHotkeyDefinitions();
	});

	/**
	 * Register default hotkeys for all features
	 */
	function registerDefaultHotkeys(): void {
		// === Inline Formatting Hotkeys ===
		hotkeys.registerHotkey({
			key: "ctrl+b",
			action: () => inlineFormatting.toggleBold(),
			description: "Bold",
			group: "formatting"
		});

		hotkeys.registerHotkey({
			key: "ctrl+i",
			action: () => inlineFormatting.toggleItalic(),
			description: "Italic",
			group: "formatting"
		});

		hotkeys.registerHotkey({
			key: "ctrl+e",
			action: () => inlineFormatting.toggleInlineCode(),
			description: "Inline code",
			group: "formatting"
		});

		hotkeys.registerHotkey({
			key: "ctrl+shift+s",
			action: () => inlineFormatting.toggleStrikethrough(),
			description: "Strikethrough",
			group: "formatting"
		});

		// === Heading Hotkeys (Ctrl+0 through Ctrl+6) ===
		// These use wrapper functions that handle list items by converting to paragraph first
		hotkeys.registerHotkey({
			key: "ctrl+0",
			action: () => setHeadingLevelWithListHandling(0),
			description: "Convert to paragraph",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+1",
			action: () => setHeadingLevelWithListHandling(1),
			description: "Convert to Heading 1",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+2",
			action: () => setHeadingLevelWithListHandling(2),
			description: "Convert to Heading 2",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+3",
			action: () => setHeadingLevelWithListHandling(3),
			description: "Convert to Heading 3",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+4",
			action: () => setHeadingLevelWithListHandling(4),
			description: "Convert to Heading 4",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+5",
			action: () => setHeadingLevelWithListHandling(5),
			description: "Convert to Heading 5",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+6",
			action: () => setHeadingLevelWithListHandling(6),
			description: "Convert to Heading 6",
			group: "headings"
		});

		// Heading level cycling hotkeys (also handle list items)
		// Ctrl+< decreases heading (H1 -> H2 -> ... -> H6 -> P)
		hotkeys.registerHotkey({
			key: "ctrl+<",
			action: () => decreaseHeadingLevelWithListHandling(),
			description: "Decrease heading level",
			group: "headings"
		});

		// Ctrl+> increases heading (P -> H6 -> H5 -> ... -> H1)
		hotkeys.registerHotkey({
			key: "ctrl+>",
			action: () => increaseHeadingLevelWithListHandling(),
			description: "Increase heading level",
			group: "headings"
		});

		// === List Hotkeys ===
		hotkeys.registerHotkey({
			key: "ctrl+shift+[",
			action: () => lists.toggleUnorderedList(),
			description: "Toggle bullet list",
			group: "lists"
		});

		hotkeys.registerHotkey({
			key: "ctrl+shift+]",
			action: () => lists.toggleOrderedList(),
			description: "Toggle numbered list",
			group: "lists"
		});

		// === Code Block Hotkeys ===
		hotkeys.registerHotkey({
			key: "ctrl+shift+k",
			action: () => toggleCodeBlockWithListHandling(),
			description: "Toggle code block",
			group: "formatting"
		});

		// Help hotkey (Ctrl+? is handled specially in handleKeyDown)
		// This registration is for the help display list
		hotkeys.registerHotkey({
			key: "ctrl+?",
			action: () => {
				isShowingHotkeyHelp.value = true;
			},
			description: "Show keyboard shortcuts",
			group: "other"
		});
	}

	/**
	 * Insert a tab character at the current cursor position
	 */
	function insertTabCharacter(): void {
		if (!contentRef.value) return;

		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return;

		const range = sel.getRangeAt(0);
		range.deleteContents();

		const tabNode = document.createTextNode("\t");
		range.insertNode(tabNode);

		// Position cursor AFTER the tab node
		range.setStartAfter(tabNode);
		range.setEndAfter(tabNode);

		sel.removeAllRanges();
		sel.addRange(range);

		// Trigger content sync AFTER cursor is positioned
		sync.debouncedSyncFromHtml();
	}

	/**
	 * Handle input events from contenteditable
	 * Checks for markdown patterns (e.g., "# " for headings, "- " for lists, "```" for code blocks) and converts immediately
	 */
	function onInput(): void {
		// Check for code fence pattern first (e.g., "```" or "```javascript" -> code block)
		// This is called immediately (not debounced) for instant conversion
		let converted = codeBlocks.checkAndConvertCodeBlockPattern();

		// Check for heading pattern (e.g., "# " -> H1)
		if (!converted) {
			converted = headings.checkAndConvertHeadingPattern();
		}

		// Check for list pattern (e.g., "- " -> ul, "1. " -> ol)
		if (!converted) {
			converted = lists.checkAndConvertListPattern();
		}

		// If a pattern was converted, the content change callback already triggers sync
		// Otherwise, sync as normal
		if (!converted) {
			sync.debouncedSyncFromHtml();
		}
	}

	/**
	 * Handle keydown events
	 * Handles Enter for code block continuation/exit and list continuation, Tab/Shift+Tab for indentation
	 */
	function onKeyDown(event: KeyboardEvent): void {
		// Handle Enter key for code block and list continuation
		if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
			// Check code block first - Enter inserts newline, or exits after double-Enter at end
			const handledByCodeBlock = codeBlocks.handleCodeBlockEnter();
			if (handledByCodeBlock) {
				event.preventDefault();
				return;
			}

			// Then check lists
			const handled = lists.handleListEnter();
			if (handled) {
				event.preventDefault();
				return;
			}
		}

		// Handle Tab key - always prevent default to keep focus in editor
		if (event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey) {
			event.preventDefault();

			if (event.shiftKey) {
				// Shift+Tab - outdent if in list, otherwise do nothing
				lists.outdentListItem();
			} else {
				// Tab - indent if in list, otherwise insert tab character
				const handled = lists.indentListItem();
				if (!handled) {
					// Not in a list - insert a tab character at cursor position
					insertTabCharacter();
				}
			}
			return;
		}

		// Let hotkeys handle other keys - if not handled, default browser behavior occurs
		hotkeys.handleKeyDown(event);
	}

	/**
	 * Handle blur events - sync immediately
	 */
	function onBlur(): void {
		sync.syncFromHtml();
	}

	/**
	 * Set markdown content from external source
	 */
	function setMarkdown(markdown: string): void {
		sync.syncFromMarkdown(markdown);

		// Update the contenteditable element
		nextTick(() => {
			if (contentRef.value) {
				contentRef.value.innerHTML = sync.renderedHtml.value;
			}
		});
	}

	/**
	 * Show hotkey help popover
	 */
	function showHotkeyHelp(): void {
		isShowingHotkeyHelp.value = true;
	}

	/**
	 * Hide hotkey help popover
	 */
	function hideHotkeyHelp(): void {
		isShowingHotkeyHelp.value = false;
	}

	// Initialize with initial value
	if (initialValue) {
		sync.syncFromMarkdown(initialValue);
	}

	return {
		// From sync
		renderedHtml: sync.renderedHtml,
		isInternalUpdate: sync.isInternalUpdate,

		// State
		isShowingHotkeyHelp,
		charCount,

		// Event handlers
		onInput,
		onKeyDown,
		onBlur,

		// External value updates
		setMarkdown,

		// Hotkey help
		showHotkeyHelp,
		hideHotkeyHelp,
		hotkeyDefinitions,

		// Feature access
		headings,
		inlineFormatting,
		lists,
		codeBlocks
	};
}
