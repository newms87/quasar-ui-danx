<template>
  <div
    class="dx-code-viewer group flex flex-col"
    :class="{'dx-code-invalid': !isValid}"
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

      <!-- Code display with syntax highlighting (readonly or contenteditable) -->
      <pre
        ref="codeRef"
        class="code-content dx-scrollbar flex-1 min-h-0"
        :class="[editorClass, { 'is-editable': isEditing }]"
        :contenteditable="isEditing"
        @input="onContentEditableInput"
        @blur="onContentEditableBlur"
        @keydown="onKeyDown"
      ><code :class="'language-' + currentFormat" v-html="highlightedContent"></code></pre>

      <!-- Footer with char count, edit toggle, and format toggle -->
      <div class="code-footer flex items-center justify-between px-2 py-1 flex-shrink-0">
        <div class="text-xs text-gray-500">
          {{ charCount.toLocaleString() }} chars
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
import { computed, nextTick, ref, watch } from "vue";
import { useCodeFormat, CodeFormat } from "../../../composables/useCodeFormat";
import { highlightSyntax } from "../../../helpers/formats/highlightSyntax";
import FieldLabel from "../../ActionTable/Form/Fields/FieldLabel.vue";
import FormatToggle from "./FormatToggle.vue";

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
const isUserEditing = ref(false);

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
const highlightedContent = computed(() => {
	return highlightSyntax(displayContent.value, { format: currentFormat.value });
});

// Computed: is current content valid
const isValid = computed(() => {
	if (isUserEditing.value) {
		return codeFormat.validate(editingContent.value, currentFormat.value);
	}
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
		// Entering edit mode - initialize editing content
		editingContent.value = codeFormat.formattedContent.value;
		// Focus the contenteditable element
		nextTick(() => {
			if (codeRef.value) {
				codeRef.value.focus();
			}
		});
	}
}

// Handle contenteditable input
function onContentEditableInput(event: Event) {
	if (!isEditing.value) return;

	isUserEditing.value = true;
	const target = event.target as HTMLElement;
	// Get text content, preserving newlines
	editingContent.value = target.innerText || "";
}

// Handle blur - emit changes
function onContentEditableBlur() {
	if (!isEditing.value || !isUserEditing.value) return;

	isUserEditing.value = false;

	// Parse and emit the value
	const parsed = codeFormat.parse(editingContent.value);
	if (parsed) {
		emit("update:modelValue", parsed);
	} else {
		// Still emit the raw string if parsing fails
		emit("update:modelValue", editingContent.value);
	}
}

// Handle keyboard shortcuts in edit mode
function onKeyDown(event: KeyboardEvent) {
	if (!isEditing.value) return;

	// Tab key - insert tab character instead of moving focus
	if (event.key === "Tab") {
		event.preventDefault();
		document.execCommand("insertText", false, "\t");
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
