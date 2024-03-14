<template>
  <LabeledInput
    type="password"
    v-bind="props"
    :rules="rules"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script setup>
import LabeledInput from "danx/src/components/ActionTable/Form/Fields/LabeledInput";

defineEmits(["update:model-value"]);
const props = defineProps({
  name: {
    type: String,
    default: "password_confirmation"
  },
  label: {
    type: String,
    default: "Confirm Password"
  },
  placeholder: {
    type: String,
    default: "Confirm Password"
  },
  modelValue: {
    type: [String, Number],
    required: true
  },
  error: {
    type: String,
    default: null
  },
  password: {
    type: String,
    default: ""
  },
  disabled: Boolean
});

const rules = [
  (val) =>
    val === props.password || "The password and confirmation do not match"
];
</script>
