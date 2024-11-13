<template>
  <div
    contenteditable
    class="inline-block transition duration-300 outline-none outline-offset-0"
    :class="contentClass"
    @input="onInput"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { ref } from "vue";

const emit = defineEmits(["update:model-value", "change"]);
const props = withDefaults(defineProps<{
	modelValue: string;
	contentClass?: string;
	debounceDelay?: number;
}>(), {
	contentClass: "hover:bg-blue-200 focus:bg-blue-200",
	debounceDelay: 1000
});

const text = ref(props.modelValue);

const debouncedChange = useDebounceFn(() => {
	emit("update:model-value", text.value);
	emit("change", text.value);
}, props.debounceDelay);

function onInput(e) {
	text.value = e.target.innerText;
	debouncedChange();
}

</script>
