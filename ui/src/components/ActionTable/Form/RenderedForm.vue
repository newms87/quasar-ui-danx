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
import BooleanField from "danx/src/components/ActionTable/Form/Fields/BooleanField";
import DateField from "danx/src/components/ActionTable/Form/Fields/DateField";
import DateRangeField from "danx/src/components/ActionTable/Form/Fields/DateRangeField";
import IntegerField from "danx/src/components/ActionTable/Form/Fields/IntegerField";
import MultiFileField from "danx/src/components/ActionTable/Form/Fields/MultiFileField";
import NumberField from "danx/src/components/ActionTable/Form/Fields/NumberField";
import SingleFileField from "danx/src/components/ActionTable/Form/Fields/SingleFileField";
import TextField from "danx/src/components/ActionTable/Form/Fields/TextField";
import WysiwygField from "danx/src/components/ActionTable/Form/Fields/WysiwygField";
import { reactive } from "vue";

const emit = defineEmits(["update:values"]);
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
  default: field.type === "BOOLEAN" ? false : ""
}));

const fieldValues = reactive(props.values || {});

function onInput(key, value) {
  emit("update:values", { ...fieldValues, [key]: value });
}
</script>
