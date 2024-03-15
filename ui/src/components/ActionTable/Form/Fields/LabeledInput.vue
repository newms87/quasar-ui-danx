<template>
  <div>
    <label for="first_name" class="form-label">
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="mt-1">
      <q-input
          :model-value="modelValue"
          :error-message="error"
          :error="!!error"
          no-error-icon
          outlined
          dense
          :disable="disabled"
          :readonly="disabled"
          :type="type"
          :name="name"
          :placeholder="placeholder || label"
          :required="required"
          :rules="rules"
          :lazy-rules="!!rules"
          class="w-full"
          @update:model-value="$emit('update:model-value', $event)"
      />
    </div>
  </div>
</template>

<script setup>
defineEmits(['update:model-value']);
defineProps({
  type: {
    type: String,
    default: 'text'
  },
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  modelValue: {
    type: [String, Number],
    required: true
  },
  error: {
    type: String,
    default: null
  },
  required: Boolean,
  disabled: Boolean,
  rules: {
    type: Array,
    default: null
  }
});
</script>
