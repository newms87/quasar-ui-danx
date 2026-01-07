import { computed, nextTick, Ref, ref } from "vue";
import { HotkeyDefinition, useMarkdownHotkeys } from "./useMarkdownHotkeys";
import { useMarkdownSelection } from "./useMarkdownSelection";
import { useMarkdownSync } from "./useMarkdownSync";
import { useHeadings } from "./features/useHeadings";
import { useInlineFormatting } from "./features/useInlineFormatting";

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

	// Register default hotkeys
	registerDefaultHotkeys();

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
		hotkeys.registerHotkey({
			key: "ctrl+0",
			action: () => headings.setHeadingLevel(0),
			description: "Convert to paragraph",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+1",
			action: () => headings.setHeadingLevel(1),
			description: "Convert to Heading 1",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+2",
			action: () => headings.setHeadingLevel(2),
			description: "Convert to Heading 2",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+3",
			action: () => headings.setHeadingLevel(3),
			description: "Convert to Heading 3",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+4",
			action: () => headings.setHeadingLevel(4),
			description: "Convert to Heading 4",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+5",
			action: () => headings.setHeadingLevel(5),
			description: "Convert to Heading 5",
			group: "headings"
		});

		hotkeys.registerHotkey({
			key: "ctrl+6",
			action: () => headings.setHeadingLevel(6),
			description: "Convert to Heading 6",
			group: "headings"
		});

		// Heading level cycling hotkeys
		// Ctrl+< decreases heading (H1 -> H2 -> ... -> H6 -> P)
		hotkeys.registerHotkey({
			key: "ctrl+<",
			action: () => headings.decreaseHeadingLevel(),
			description: "Decrease heading level",
			group: "headings"
		});

		// Ctrl+> increases heading (P -> H6 -> H5 -> ... -> H1)
		hotkeys.registerHotkey({
			key: "ctrl+>",
			action: () => headings.increaseHeadingLevel(),
			description: "Increase heading level",
			group: "headings"
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
	 * Handle input events from contenteditable
	 * Checks for markdown patterns (e.g., "# " for headings) and converts immediately
	 */
	function onInput(): void {
		// Check for heading pattern first (e.g., "# " -> H1)
		// This is called immediately (not debounced) for instant conversion
		const converted = headings.checkAndConvertHeadingPattern();

		// If a pattern was converted, the content change callback already triggers sync
		// Otherwise, sync as normal
		if (!converted) {
			sync.debouncedSyncFromHtml();
		}
	}

	/**
	 * Handle keydown events
	 * Let browser handle Enter natively (creates <div> elements) which heading pattern detection already supports
	 */
	function onKeyDown(event: KeyboardEvent): void {
		// Let hotkeys handle the event - if not handled, default browser behavior occurs
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
		inlineFormatting
	};
}
