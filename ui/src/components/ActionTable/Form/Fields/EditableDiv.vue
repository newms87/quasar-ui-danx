<template>
  <div class="inline-block relative">
    <div
      ref="textDiv"
      :contenteditable="readonly ? 'false' : 'true'"
      class="relative inline-block transition duration-300 outline-none outline-offset-0 border-none rounded-sm z-10 min-w-10 min-h-10"
      :style="{minWidth, minHeight}"
      :class="contentClass"
      @input="onInput"
      @focusin="hasFocus = true"
      @focusout="hasFocus = false"
    />
    <div
      v-if="!text && placeholder && !hasFocus && !readonly"
      ref="placeholderDiv"
      class="text-gray-600 absolute-top-left whitespace-nowrap z-1 pointer-events-none"
    >
      {{ placeholder }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";

const emit = defineEmits(["update:model-value", "change"]);
const props = withDefaults(defineProps<{
	modelValue?: string;
	color?: string;
	textColor?: string;
	debounceDelay?: number;
	readonly?: boolean;
	placeholder?: string;
}>(), {
	modelValue: "",
	// NOTE: You must safe-list required colors in tailwind.config.js
	//       Add text-blue-900, hover:bg-blue-200, hover:outline-blue-200, focus:outline-blue-200 and focus:bg-blue-200 for the following config
	color: "blue-200",
	textColor: "blue-900",
	debounceDelay: 1000,
	placeholder: "Enter Text..."
});

const text = ref(props.modelValue);
const textDiv = ref();
const placeholderDiv = ref<Element | null>(null);
const minWidth = ref<string>("0");
const minHeight = ref<string>("0");
const hasFocus = ref(false);

onMounted(() => {
	// Set the min-width to the width of the placeholder
	if (placeholderDiv.value) {
		minWidth.value = placeholderDiv.value?.offsetWidth + "px";
		minHeight.value = placeholderDiv.value?.offsetHeight + "px";
	}
});

// Watch external modelValue and update the contenteditable div directly
watch(() => props.modelValue, (value) => {
	if (!hasFocus.value && textDiv.value) {
		textDiv.value.innerText = value;
		text.value = value;
	}
});

onMounted(() => {
	// Set the initial value of the contenteditable div
	textDiv.value.innerText = text.value;
});

const debouncedChange = useDebounceFn(() => {
	emit("update:model-value", text.value);
	emit("change", text.value);
}, props.debounceDelay);

function onInput(e) {
	text.value = e.target.innerText;
	debouncedChange();
}

const contentClass = computed(() => [
	...(props.readonly ? [] : [
		`hover:bg-${props.color} focus:bg-${props.color}`,
		`hover:text-${props.textColor} focus:text-${props.textColor}`,
		`hover:outline-${props.color} focus:outline-${props.color}`,
		"focus:outline-4 hover:outline-4"
	]),
	text.value ? "" : "!bg-none"
]);
</script>
