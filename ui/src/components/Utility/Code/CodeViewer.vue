<template>
  <div
    class="dx-code-viewer group flex flex-col"
  >
    <FieldLabel
      v-if="label"
      class="mb-2 text-sm flex-shrink-0"
      :label="label"
    />

    <div class="code-wrapper relative flex flex-col flex-1 min-h-0">
      <!-- Language badge -->
      <div class="language-badge absolute top-0 right-0 p-1 text-[.7em] rounded-bl z-10 uppercase">
        {{ currentFormat }}
      </div>

      <!-- Code display - readonly with syntax highlighting -->
      <pre
        v-if="!isEditing"
        class="code-content dx-scrollbar flex-1 min-h-0"
        :class="editorClass"
      ><code :class="'language-' + currentFormat" v-html="highlightedContent"></code></pre>

      <!-- Code editor - contenteditable, content set imperatively to avoid cursor reset -->
      <pre
        v-else
        ref="codeRef"
        class="code-content dx-scrollbar flex-1 min-h-0 is-editable"
        :class="[editorClass, 'language-' + currentFormat]"
        contenteditable="true"
        @input="onContentEditableInput"
        @blur="onContentEditableBlur"
        @keydown="onKeyDown"
      ></pre>

      <!-- Footer with char count, edit toggle, and format toggle -->
      <div
        class="code-footer flex items-center justify-between px-2 py-1 flex-shrink-0"
        :class="{ 'has-error': hasValidationError }"
      >
        <div class="text-xs flex-1 min-w-0" :class="hasValidationError ? 'text-red-400' : 'text-gray-500'">
          <template v-if="validationError">
            <span class="font-medium">
              Error<template v-if="validationError.line"> (line {{ validationError.line }})</template>:
            </span>
            <span class="truncate">{{ validationError.message }}</span>
          </template>
          <template v-else>
            {{ charCount.toLocaleString() }} chars
          </template>
        </div>
        <div class="flex items-center gap-2">
          <!-- Edit toggle button -->
          <QBtn
            v-if="canEdit"
            flat
            dense
            round
            size="sm"
            class="text-gray-500 hover:text-gray-700"
            :class="{ 'text-sky-500 hover:text-sky-600': isEditing }"
            @click="toggleEdit"
          >
            <EditIcon class="w-3.5 h-3.5" />
            <QTooltip>{{ isEditing ? 'Exit edit mode' : 'Edit content' }}</QTooltip>
          </QBtn>
          <FormatToggle
            v-if="!hideFormatToggle"
            :format="currentFormat"
            @change="onFormatChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FaSolidPencil as EditIcon } from "danx-icon";
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { useCodeFormat, CodeFormat, ValidationError } from "../../../composables/useCodeFormat";
import { highlightSyntax } from "../../../helpers/formats/highlightSyntax";
import FieldLabel from "../../ActionTable/Form/Fields/FieldLabel.vue";
import FormatToggle from "./FormatToggle.vue";

// Debounce timeout handles
let validationTimeout: ReturnType<typeof setTimeout> | null = null;
let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

export interface CodeViewerProps {
	modelValue?: object | string | null;
	format?: CodeFormat;
	label?: string;
	editorClass?: string;
	hideFormatToggle?: boolean;
	canEdit?: boolean;
	editable?: boolean;
}

const props = withDefaults(defineProps<CodeViewerProps>(), {
	modelValue: null,
	format: "yaml",
	label: "",
	editorClass: "",
	hideFormatToggle: false,
	canEdit: false,
	editable: false
});

const emit = defineEmits<{
	"update:modelValue": [value: object | string | null];
	"update:format": [format: CodeFormat];
	"update:editable": [editable: boolean];
}>();

// Initialize composable with current props
const codeFormat = useCodeFormat({
	initialFormat: props.format,
	initialValue: props.modelValue
});

// Local state
const currentFormat = ref<CodeFormat>(props.format);
const codeRef = ref<HTMLPreElement | null>(null);
const internalEditable = ref(props.editable);
const editingContent = ref("");
const cachedHighlightedContent = ref("");
const isUserEditing = ref(false);
const validationError = ref<ValidationError | null>(null);

// Computed: has validation error
const hasValidationError = computed(() => validationError.value !== null);

// Computed: is currently in edit mode
const isEditing = computed(() => props.canEdit && internalEditable.value);

// Sync internal editable state with prop
watch(() => props.editable, (newValue) => {
	internalEditable.value = newValue;
});

// Sync composable format with current format
watch(currentFormat, (newFormat) => {
	codeFormat.setFormat(newFormat);
});

// Watch for external format changes
watch(() => props.format, (newFormat) => {
	currentFormat.value = newFormat;
});

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
	codeFormat.setValue(newValue);
	// Only update editing content if user is not actively editing
	if (!isUserEditing.value) {
		editingContent.value = codeFormat.formattedContent.value;
	}
});

// Computed: display content
const displayContent = computed(() => {
	if (isUserEditing.value) {
		return editingContent.value;
	}
	return codeFormat.formattedContent.value;
});

// Computed: highlighted content with syntax highlighting
// While actively editing, return cached content to avoid cursor reset from DOM replacement
const highlightedContent = computed(() => {
	if (isUserEditing.value) {
		return cachedHighlightedContent.value;
	}
	const highlighted = highlightSyntax(displayContent.value, { format: currentFormat.value });
	cachedHighlightedContent.value = highlighted;
	return highlighted;
});

// Computed: is current content valid (used for external consumers, not for UI state)
const isValid = computed(() => {
	if (hasValidationError.value) return false;
	return codeFormat.isValid.value;
});

// Computed: character count
const charCount = computed(() => {
	return displayContent.value?.length || 0;
});

// Toggle edit mode
function toggleEdit() {
	internalEditable.value = !internalEditable.value;
	emit("update:editable", internalEditable.value);

	if (internalEditable.value) {
		// Entering edit mode - initialize editing content and clear any previous error
		editingContent.value = codeFormat.formattedContent.value;
		validationError.value = null;
		// Set content imperatively with syntax highlighting and focus
		nextTick(() => {
			if (codeRef.value) {
				// Set highlighted HTML content directly to avoid reactive binding issues
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

// Debounced validation - validates content after 300ms of no input
function debouncedValidate() {
	if (validationTimeout) {
		clearTimeout(validationTimeout);
	}
	validationTimeout = setTimeout(() => {
		validationError.value = codeFormat.validateWithError(editingContent.value, currentFormat.value);
	}, 300);
}

// Get cursor offset in plain text
function getCursorOffset(): number {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount || !codeRef.value) return 0;

	const range = selection.getRangeAt(0);
	const preCaretRange = document.createRange();
	preCaretRange.selectNodeContents(codeRef.value);
	preCaretRange.setEnd(range.startContainer, range.startOffset);

	// Count characters by walking text nodes (faster than toString for getting length)
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

// Set cursor to offset in plain text
function setCursorOffset(targetOffset: number) {
	if (!codeRef.value) return;

	const selection = window.getSelection();
	if (!selection) return;

	let currentOffset = 0;
	const walker = document.createTreeWalker(codeRef.value, NodeFilter.SHOW_TEXT);
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
	range.selectNodeContents(codeRef.value);
	range.collapse(false);
	selection.removeAllRanges();
	selection.addRange(range);
}

// Debounced highlighting - re-applies syntax highlighting after 300ms of no input
function debouncedHighlight() {
	if (highlightTimeout) {
		clearTimeout(highlightTimeout);
	}
	highlightTimeout = setTimeout(() => {
		if (!codeRef.value || !isEditing.value) return;

		// Save cursor position
		const cursorOffset = getCursorOffset();

		// Re-apply highlighting
		codeRef.value.innerHTML = highlightSyntax(editingContent.value, { format: currentFormat.value });

		// Restore cursor position
		setCursorOffset(cursorOffset);
	}, 300);
}

// Handle contenteditable input
function onContentEditableInput(event: Event) {
	if (!isEditing.value) return;

	isUserEditing.value = true;
	const target = event.target as HTMLElement;
	// Get text content, preserving newlines
	editingContent.value = target.innerText || "";

	// Trigger debounced validation and highlighting
	debouncedValidate();
	debouncedHighlight();
}

// Handle blur - emit changes and re-apply highlighting
function onContentEditableBlur() {
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
		emit("update:modelValue", parsed);
	} else {
		// Still emit the raw string if parsing fails
		emit("update:modelValue", editingContent.value);
	}

	// Re-apply syntax highlighting after editing
	if (codeRef.value) {
		codeRef.value.innerHTML = highlightSyntax(editingContent.value, { format: currentFormat.value });
	}
}

// Cleanup timeouts on unmount
onUnmounted(() => {
	if (validationTimeout) clearTimeout(validationTimeout);
	if (highlightTimeout) clearTimeout(highlightTimeout);
});

// Get current line info from cursor position
function getCurrentLineInfo(): { indent: string; lineContent: string } | null {
	// Use editingContent (plain text) and cursor offset for reliable line detection
	const text = editingContent.value;
	if (!text) return { indent: "", lineContent: "" };

	// Get cursor position in plain text
	const cursorOffset = getCursorOffset();

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

// Calculate smart indentation based on context
function getSmartIndent(lineInfo: { indent: string; lineContent: string }): string {
	const { indent, lineContent } = lineInfo;
	const trimmedLine = lineContent.trim();
	const indentUnit = "  "; // 2 spaces

	if (currentFormat.value === "yaml") {
		// After a key with colon (e.g., "key:" or "key: |" or "key: >")
		if (trimmedLine.endsWith(":") || trimmedLine.match(/:\s*[|>][-+]?\s*$/)) {
			return indent + indentUnit;
		}
		// After array item start (e.g., "- item" or "- key: value")
		if (trimmedLine.startsWith("- ")) {
			// Indent to align with content after "- "
			return indent + indentUnit;
		}
		// Just "- " alone means we want to continue with same array indentation
		if (trimmedLine === "-") {
			return indent;
		}
	} else if (currentFormat.value === "json") {
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

// Handle keyboard shortcuts in edit mode
function onKeyDown(event: KeyboardEvent) {
	if (!isEditing.value) return;

	// Enter key - smart indentation
	if (event.key === "Enter") {
		const lineInfo = getCurrentLineInfo();
		if (lineInfo) {
			event.preventDefault();
			const smartIndent = getSmartIndent(lineInfo);

			// Insert directly via Selection API (faster than execCommand for newlines)
			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				range.deleteContents();
				const textNode = document.createTextNode("\n" + smartIndent);
				range.insertNode(textNode);
				range.setStartAfter(textNode);
				range.setEndAfter(textNode);
				selection.removeAllRanges();
				selection.addRange(range);

				// Trigger input event manually to update editingContent
				codeRef.value?.dispatchEvent(new Event("input", { bubbles: true }));
			}
		}
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
}

// Switch between JSON and YAML formats
function onFormatChange(newFormat: CodeFormat) {
	currentFormat.value = newFormat;
	emit("update:format", newFormat);

	// Update editing content if in edit mode
	if (isEditing.value) {
		editingContent.value = codeFormat.formattedContent.value;
	}
}
</script>

<!-- Styles moved to global theme: src/styles/themes/danx/code.scss -->
