<template>
  <div>
    <QInput
        v-if="!readonly"
        :data-dusk="'text-field-' + field?.id"
        :data-testid="'text-field-' + field?.id"
        :placeholder="field?.placeholder"
        outlined
        dense
        :disable="disabled"
        :label-slot="!noLabel"
        :input-class="inputClass"
        :class="parentClass"
        stack-label
        :type="type"
        :model-value="modelValue"
        :debounce="debounce"
        @keydown.enter="$emit('submit')"
        @update:model-value="$emit('update:model-value', $event)"
    >
      <template #label>
        <FieldLabel
            :field="field"
            :label="label"
            :show-name="showName"
            :class="labelClass"
        />
      </template>
    </QInput>
    <div v-if="readonly">
      <LabelValueBlock
          :label="label || field.label"
          :value="modelValue"
      />
    </div>
  </div>
</template>

<script setup>
import FieldLabel from "./FieldLabel";
import LabelValueBlock from "./LabelValueBlock";

defineEmits(["update:model-value", "submit"]);
defineProps({
  modelValue: {
    type: [String, Number],
    default: ""
  },
  field: {
    type: Object,
    default: null
  },
  type: {
    type: String,
    default: "text"
  },
  label: {
    type: String,
    default: null
  },
  labelClass: {
    type: String,
    default: "text-sm text-gray-700"
  },
  parentClass: {
    type: String,
    default: ""
  },
  inputClass: {
    type: String,
    default: ""
  },
  noLabel: Boolean,
  showName: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  debounce: {
    type: [String, Number],
    default: 0
  }
});
</script>
