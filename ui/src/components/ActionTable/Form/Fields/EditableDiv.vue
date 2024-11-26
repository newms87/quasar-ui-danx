<template>
  <div class="inline-block relative">
    <div
      contenteditable
      class="relative inline-block transition duration-300 outline-none outline-offset-0 border-none focus:outline-4 hover:outline-4 rounded-sm z-10"
      :style="{minWidth, minHeight}"
      :class="contentClass"
      @input="onInput"
      @focusin="hasFocus = true"
      @focusout="hasFocus = false"
    >
      {{ text }}
    </div>
    <div
      v-if="!text && placeholder"
      ref="placeholderDiv"
      class="text-gray-600 absolute-top-left whitespace-nowrap z-1"
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
	placeholder?: string;
}>(), {
	// NOTE: You must safe-list required colors in tailwind.config.js
	//       Add text-blue-900, hover:bg-blue-200, hover:outline-blue-200, focus:outline-blue-200 and focus:bg-blue-200 for the following config
	color: "blue-200",
	textColor: "blue-900",
	debounceDelay: 1000,
	placeholder: "Enter Text..."
});

const text = ref(props.modelValue);
const placeholderDiv = ref(null);
const minWidth = ref(0);
const minHeight = ref(0);
const hasFocus = ref(false);

onMounted(() => {
	// Set the min-width to the width of the placeholder
	if (placeholderDiv.value) {
		minWidth.value = placeholderDiv.value.offsetWidth + "px";
		minHeight.value = placeholderDiv.value.offsetHeight + "px";
	}
});

watch(() => props.modelValue, (value) => {
	if (!hasFocus.value)
		text.value = value;
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
	`hover:bg-${props.color} focus:bg-${props.color}`,
	`hover:text-${props.textColor} focus:text-${props.textColor}`,
	`hover:outline-${props.color} focus:outline-${props.color}`,
	text.value ? "" : "opacity-0"
]);
</script>
