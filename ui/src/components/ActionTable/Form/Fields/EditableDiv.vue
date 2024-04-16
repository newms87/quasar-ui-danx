<template>
  <div
      contenteditable
      class="inline-block hover:bg-blue-200 focus:bg-blue-200 transition duration-300 outline-none"
      @input="onInput"
  >
    {{ text }}
  </div>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";
import { ref } from "vue";

const emit = defineEmits(["update:model-value", "change"]);
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  debounceDelay: {
    type: Number,
    default: 500
  }
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
