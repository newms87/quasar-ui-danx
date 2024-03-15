<template>
  <div>
    <template v-if="!loading && !options.length">
      <div class="text-gray-silver">No options available</div>
    </template>
    <SelectField
        v-model="selectedOption"
        :options="options"
        :label="label"
        :placeholder="placeholder"
        :option-value="opt => opt"
        :loading="loading"
        @update:model-value="onSelectOption"
    />
    <div v-if="selectedOption">
      <QCheckbox
          v-for="child in selectedOption.children"
          :key="child.id"
          :model-value="selectedChildren.includes(child.id)"
          :field="child"
          class="mt-3"
          @update:model-value="onSelectChild(child)"
      >
        <div>{{ child.label }}</div>
        <div class="text-xs text-gray-silver">{{ child.name }}</div>
      </QCheckbox>
    </div>
  </div>
</template>
<script setup>
import { remove } from '@ui/helpers/array';
import { ref, watch } from 'vue';
import SelectField from './SelectField';

const emit = defineEmits(['update:model-value']);
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ([])
  },
  label: {
    type: String,
    default: 'Selection'
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  options: {
    type: Array,
    default: () => []
  },
  loading: Boolean
});

function resolveSelectedOption() {
  if (props.modelValue?.length > 0) {
    return props.options.find((option) => option.children.find(child => props.modelValue.includes(child.id)));
  }

  return null;
}
const selectedOption = ref(resolveSelectedOption());
const selectedChildren = ref(props.modelValue || []);
function onSelectChild(child) {
  if (selectedChildren.value.includes(child.id)) {
    selectedChildren.value = remove(selectedChildren.value, child.id);
  } else {
    selectedChildren.value.push(child.id);
  }
  emit('update:model-value', selectedChildren.value.length > 0 ? selectedChildren.value : undefined);
}
function onSelectOption() {
  selectedChildren.value = [];
  emit('update:model-value', undefined);
}
watch(() => props.modelValue, (value) => {
  selectedOption.value = resolveSelectedOption();
  selectedChildren.value = value || [];
});
</script>
