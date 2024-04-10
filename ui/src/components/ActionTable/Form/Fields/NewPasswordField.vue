<template>
  <LabeledInput
      type="password"
      v-bind="props"
      :rules="rules"
      @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script setup>
import LabeledInput from './LabeledInput';

defineEmits(['update:model-value']);
const props = defineProps({
  name: {
    type: String,
    default: 'password'
  },
  label: {
    type: String,
    default: 'Password'
  },
  placeholder: {
    type: String,
    default: 'Enter Password'
  },
  modelValue: {
    type: [String, Number],
    required: true
  },
  error: {
    type: String,
    default: null
  },
  disabled: Boolean
});

const rules = [(val) => val.length >= 8 || 'Please use at least 8 characters'];
</script>
