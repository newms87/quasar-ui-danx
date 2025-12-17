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

      <!-- Code display (readonly) with syntax highlighting -->
      <pre
        v-if="readonly"
        class="code-content dx-scrollbar flex-1 min-h-0"
        :class="editorClass"
      ><code :class="'language-' + currentFormat" v-html="highlightedContent"></code></pre>

      <!-- Textarea (editable) - no highlighting in edit mode -->
      <textarea
        v-else
        v-model="editableContent"
        class="code-content dx-scrollbar flex-1 min-h-0"
        :class="editorClass"
        @input="onInput"
      />

      <!-- Footer with char count and format toggle -->
      <div class="code-footer flex items-center justify-between px-2 py-1 flex-shrink-0">
        <div class="text-xs text-gray-500">
          {{ charCount.toLocaleString() }} chars
        </div>
        <FormatToggle
          v-if="showFormatToggle"
          :format="currentFormat"
          @change="onFormatChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useCodeFormat, CodeFormat } from "../../../composables/useCodeFormat";
import { highlightSyntax } from "../../../helpers/formats/highlightSyntax";
import FieldLabel from "../../ActionTable/Form/Fields/FieldLabel.vue";
import FormatToggle from "./FormatToggle.vue";

export interface CodeViewerProps {
	modelValue?: object | string | null;
	format?: CodeFormat;
	readonly?: boolean;
	label?: string;
	editorClass?: string;
	showFormatToggle?: boolean;
}

const props = withDefaults(defineProps<CodeViewerProps>(), {
	modelValue: null,
	format: "yaml",
	readonly: true,
	label: "",
	editorClass: "",
	showFormatToggle: true
});

const emit = defineEmits<{
	"update:modelValue": [value: object | string | null];
	"update:format": [format: CodeFormat];
}>();

// Initialize composable with current props
const codeFormat = useCodeFormat({
	initialFormat: props.format,
	initialValue: props.modelValue
});

// Local state for editable mode
const editableContent = ref("");
const currentFormat = ref<CodeFormat>(props.format);

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
	if (!props.readonly) {
		editableContent.value = codeFormat.formattedContent.value;
	}
});

// Initialize editable content when entering edit mode
watch(() => props.readonly, (isReadonly) => {
	if (!isReadonly) {
		editableContent.value = codeFormat.formattedContent.value;
	}
});

// Computed: display content for readonly mode
const displayContent = computed(() => {
	return props.readonly ? codeFormat.formattedContent.value : editableContent.value;
});

// Computed: highlighted content with syntax highlighting
const highlightedContent = computed(() => {
	return highlightSyntax(displayContent.value, { format: currentFormat.value });
});

// Computed: is current content valid
const isValid = computed(() => {
	if (props.readonly) {
		return codeFormat.isValid.value;
	}
	return codeFormat.validate(editableContent.value, currentFormat.value);
});

// Computed: character count
const charCount = computed(() => {
	return displayContent.value?.length || 0;
});

// Handle input changes in edit mode
function onInput() {
	const parsed = codeFormat.parse(editableContent.value);
	if (parsed) {
		emit("update:modelValue", parsed);
	} else {
		// Still emit the raw string if parsing fails so parent can handle validation
		emit("update:modelValue", editableContent.value);
	}
}

// Switch between JSON and YAML formats
function onFormatChange(newFormat: CodeFormat) {
	currentFormat.value = newFormat;
	emit("update:format", newFormat);

	// Update editable content if in edit mode
	if (!props.readonly) {
		editableContent.value = codeFormat.formattedContent.value;
	}
}
</script>

<!-- Styles moved to global theme: src/styles/themes/danx/code.scss -->
