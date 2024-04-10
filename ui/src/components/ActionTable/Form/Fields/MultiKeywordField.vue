<template>
  <div>
    <SelectField
        v-model="selectedFieldName"
        :label="undefined"
        :options="field.options"
        class="mb-2"
        @update:model-value="onChange"
    />
    <TextField
        v-model="textInput"
        :field="field"
        :no-label="!field.label"
        label-class="text-xs font-bold text-gray-dark"
        parent-class="tight-label"
        input-class="!py-0"
        dense
        type="textarea"
        :debounce="500"
        @update:model-value="onChange"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { SelectField, TextField } from './index';

const emit = defineEmits(['update:model-value']);
const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: ''
  },
  field: {
    type: Object,
    default: null
  }
});

const selectedFieldName = ref(props.field.defaultOption);
const searchList = computed(() => props.modelValue && props.modelValue[selectedFieldName.value]);
const textInput = ref(formatModelValue());
function onChange() {
  textInput.value = textInput.value?.replace(/\n/g, ',').replace(/,{2,}/g, ',') || '';
  emit('update:model-value', textInput.value ? { [selectedFieldName.value]: textInput.value.split(',') } : undefined);
}

function formatModelValue() {
  return Array.isArray(searchList.value) ? searchList.value?.join(',') : '';
}

watch(() => props.modelValue, () => {
  textInput.value = formatModelValue();
});
</script>
