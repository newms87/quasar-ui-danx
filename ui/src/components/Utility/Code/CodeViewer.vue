<template>
  <div
    class="dx-code-viewer group flex flex-col"
    :class="[{ 'is-collapsed': isCollapsed }, props.theme === 'light' ? 'theme-light' : '']"
  >
    <FieldLabel
      v-if="label"
      class="mb-2 text-sm flex-shrink-0"
      :label="label"
    />

    <!-- Collapsed view - inline preview -->
    <CodeViewerCollapsed
      v-if="collapsible && isCollapsed"
      :preview="collapsedPreview"
      :format="currentFormat"
      :available-formats="currentFormat === 'json' || currentFormat === 'yaml' ? ['json', 'yaml'] : currentFormat === 'text' || currentFormat === 'markdown' ? ['text', 'markdown'] : []"
      :allow-any-language="allowAnyLanguage"
      @expand="toggleCollapse"
      @format-change="onFormatChange"
    />

    <!-- Expanded view - full code viewer -->
    <template v-else>
      <div
        class="code-wrapper relative flex flex-col flex-1 min-h-0"
        tabindex="0"
        @keydown="editor.onKeyDown"
      >
        <!-- Language badge - shows popout format options on hover -->
        <LanguageBadge
          ref="languageBadgeRef"
          :format="currentFormat"
          :available-formats="currentFormat === 'json' || currentFormat === 'yaml' ? ['json', 'yaml'] : currentFormat === 'text' || currentFormat === 'markdown' ? ['text', 'markdown'] : []"
          :toggleable="true"
          :allow-any-language="allowAnyLanguage"
          @click.stop
          @change="onFormatChange"
        />

        <!-- Collapse button (when collapsible and expanded) -->
        <div
          v-if="collapsible"
          class="collapse-toggle absolute top-0 left-0 p-1 cursor-pointer z-10 text-gray-500 hover:text-gray-300"
          @click="toggleCollapse"
        >
          <CollapseIcon class="w-3 h-3" />
        </div>

        <!-- Clickable header to collapse when expanded -->
        <div
          v-if="collapsible"
          class="collapse-header"
          @click="toggleCollapse"
        />

        <!-- Code display - readonly with syntax highlighting (non-markdown formats) -->
        <pre
          v-if="!editor.isEditing.value && currentFormat !== 'markdown'"
          class="code-content dx-scrollbar flex-1 min-h-0"
          :class="[editorClass, { 'is-collapsible': collapsible }]"
        ><code :class="'language-' + currentFormat" v-html="editor.highlightedContent.value"></code></pre>

        <!-- Markdown display - rendered HTML -->
        <MarkdownContent
          v-else-if="currentFormat === 'markdown' && !editor.isEditing.value"
          :content="markdownSource"
          :default-code-format="defaultCodeFormat"
          class="code-content dx-scrollbar flex-1 min-h-0"
          :class="[editorClass, { 'is-collapsible': collapsible }]"
        />

        <!-- Code editor - contenteditable, content set imperatively to avoid cursor reset -->
        <pre
          v-else
          ref="codeRef"
          class="code-content dx-scrollbar flex-1 min-h-0 is-editable"
          :class="[editorClass, 'language-' + currentFormat, { 'is-collapsible': collapsible }]"
          contenteditable="true"
          @input="editor.onContentEditableInput"
          @blur="editor.onContentEditableBlur"
          @keydown="editor.onKeyDown"
        ></pre>

        <!-- Footer with char count and edit toggle -->
        <CodeViewerFooter
          :char-count="editor.charCount.value"
          :validation-error="editor.validationError.value"
          :can-edit="canEdit && currentFormat !== 'markdown'"
          :is-editing="editor.isEditing.value"
          :show-version="showVersion"
          @toggle-edit="editor.toggleEdit"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { FaSolidChevronDown as CollapseIcon } from "danx-icon";
import { computed, ref, toRef, watch } from "vue";
import { useCodeFormat, CodeFormat } from "../../../composables/useCodeFormat";
import { useCodeViewerCollapse } from "../../../composables/useCodeViewerCollapse";
import { useCodeViewerEditor } from "../../../composables/useCodeViewerEditor";
import FieldLabel from "../../ActionTable/Form/Fields/FieldLabel.vue";
import CodeViewerCollapsed from "./CodeViewerCollapsed.vue";
import CodeViewerFooter from "./CodeViewerFooter.vue";
import LanguageBadge from "./LanguageBadge.vue";
import MarkdownContent from "./MarkdownContent.vue";

export interface CodeViewerProps {
	modelValue?: object | string | null;
	format?: CodeFormat;
	label?: string;
	editorClass?: string;
	canEdit?: boolean;
	editable?: boolean;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
	defaultCodeFormat?: "json" | "yaml";
	allowAnyLanguage?: boolean;
	theme?: "dark" | "light";
	showVersion?: boolean;
}

const props = withDefaults(defineProps<CodeViewerProps>(), {
	modelValue: null,
	format: "yaml",
	label: "",
	editorClass: "",
	canEdit: false,
	editable: false,
	collapsible: false,
	defaultCollapsed: true,
	theme: "dark",
	showVersion: false
});

const emit = defineEmits<{
	"update:modelValue": [value: object | string | null];
	"update:format": [format: CodeFormat];
	"update:editable": [editable: boolean];
	"exit": [];
	"delete": [];
}>();

// Initialize composable with current props
const codeFormat = useCodeFormat({
	initialFormat: props.format,
	initialValue: props.modelValue
});

// Local state
const currentFormat = ref<CodeFormat>(props.format);
const codeRef = ref<HTMLPreElement | null>(null);
const languageBadgeRef = ref<InstanceType<typeof LanguageBadge> | null>(null);

// Collapsed state (for collapsible mode)
const isCollapsed = ref(props.collapsible && props.defaultCollapsed);

// Watch for changes to defaultCollapsed prop
watch(() => props.defaultCollapsed, (newValue) => {
	if (props.collapsible) {
		isCollapsed.value = newValue;
	}
});

// Toggle collapsed state
function toggleCollapse() {
	isCollapsed.value = !isCollapsed.value;
}

// Initialize editor composable
const editor = useCodeViewerEditor({
	codeRef,
	codeFormat,
	currentFormat,
	canEdit: toRef(props, "canEdit"),
	editable: toRef(props, "editable"),
	onEmitModelValue: (value) => emit("update:modelValue", value),
	onEmitEditable: (editable) => emit("update:editable", editable),
	onEmitFormat: (format) => onFormatChange(format),
	onExit: () => emit("exit"),
	onDelete: () => emit("delete"),
	onOpenLanguageSearch: () => languageBadgeRef.value?.openSearchPanel()
});

// Sync composable format with current format and update editor content
watch(currentFormat, (newFormat) => {
	codeFormat.setFormat(newFormat);
	// Update editor content when format changes (needed for syntax re-highlighting)
	editor.updateEditingContentOnFormatChange();
});

// Watch for external format changes
watch(() => props.format, (newFormat) => {
	currentFormat.value = newFormat;
});

// Watch for external value changes
watch(() => props.modelValue, () => {
	codeFormat.setValue(props.modelValue);
	editor.syncEditingContentFromValue();
});

// Sync internal editable state with prop
watch(() => props.editable, (newValue) => {
	editor.syncEditableFromProp(newValue);
});

// Initialize collapse composable
const { collapsedPreview } = useCodeViewerCollapse({
	modelValue: toRef(props, "modelValue"),
	format: currentFormat,
	displayContent: editor.displayContent,
	codeFormat
});

// Switch between JSON and YAML formats
function onFormatChange(newFormat: CodeFormat) {
	currentFormat.value = newFormat;
	emit("update:format", newFormat);
	// Note: editor.updateEditingContentOnFormatChange() is called by the currentFormat watcher
}

// Get the raw markdown content for MarkdownContent component
const markdownSource = computed(() => {
	if (typeof props.modelValue === "string") {
		return props.modelValue;
	}
	return editor.displayContent.value;
});

// Expose isValid for external consumers
const isValid = computed(() => editor.isValid.value);

// Expose for parent components that may need to check validity
defineExpose({ isValid });
</script>

<!-- Styles moved to global theme: src/styles/themes/danx/code.scss -->
