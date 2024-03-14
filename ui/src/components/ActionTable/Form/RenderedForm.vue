<template>
  <div class="rendered-form">
    <div
        v-for="(field, index) in mappedFields"
        :key="field.id"
        :class="{ 'mt-4': index > 0 }"
    >
      <Component
          :is="field.component"
          v-model="fieldValues[field.name]"
          :field="field"
          :label="field.label || undefined"
          :no-label="noLabel"
          :show-name="showName"
          :disable="disable"
          :readonly="readonly"
          @update:model-value="onInput(field.name, $event)"
      />
    </div>
  </div>
</template>
<script setup>
import { reactive } from 'vue';
import {
  BooleanField,
  DateField,
  DateRangeField,
  IntegerField,
  MultiFileField,
  NumberField,
  SingleFileField,
  TextField,
  WysiwygField
} from './Fields';

const emit = defineEmits(['update:values']);
const props = defineProps({
  values: {
    type: Object,
    default: null
  },
  fields: {
    type: Array,
    required: true
  },
  noLabel: Boolean,
  showName: Boolean,
  disable: Boolean,
  readonly: Boolean
});

const FORM_FIELD_MAP = {
  BOOLEAN: BooleanField,
  DATE: DateField,
  DATE_RANGE: DateRangeField,
  INTEGER: IntegerField,
  NUMBER: NumberField,
  TEXT: TextField,
  SINGLE_FILE: SingleFileField,
  MULTI_FILE: MultiFileField,
  WYSIWYG: WysiwygField
};

const mappedFields = props.fields.map((field) => ({
  placeholder: `Enter ${field.label}`,
  ...field,
  component: FORM_FIELD_MAP[field.type],
  default: field.type === 'BOOLEAN' ? false : ''
}));

const fieldValues = reactive(props.values || {});

function onInput(key, value) {
  emit('update:values', { ...fieldValues, [key]: value });
}
</script>
