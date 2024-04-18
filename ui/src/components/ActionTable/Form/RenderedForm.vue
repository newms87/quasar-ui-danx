<template>
  <div class="rendered-form">
    <div v-if="form.variations > 1" class="mb-4">
      <QTabs v-model="currentVariation" class="text-xs">
        <QTab
            v-for="(name, index) in variationNames"
            :key="name"
            :name="name"
            class="p-0"
        >
          <div class="flex flex-nowrap items-center text-sm">
            <div>{{ name }}</div>
            <a
                v-if="index > 0"
                @click="variationToDelete = name"
                class="ml-1 p-1 hover:opacity-100 opacity-20 hover:bg-red-200 rounded"
            >
              <RemoveIcon class="w-3 text-red-900" />
            </a>
          </div>
        </QTab>
        <QTab
            v-if="variationNames.length < form.variations"
            name="add"
            key="add-new-variation"
            @click="onAddVariation"
            class="bg-blue-600 rounded-t-lg !text-white"
        >
          <template v-if="saving">
            <QSpinnerBall class="w-4" />
          </template>
          <template v-else>+ Add Variation</template>
        </QTab>
      </QTabs>
    </div>
    <div
        v-for="(field, index) in mappedFields"
        :key="field.id"
        :class="{ 'mt-4': index > 0 }"
    >
      <Component
          :is="field.component"
          :key="field.name + '-' + currentVariation"
          :model-value="getFieldValue(field.name)"
          :field="field"
          :label="field.label || undefined"
          :no-label="noLabel"
          :show-name="showName"
          :disable="disable"
          :readonly="readonly"
          @update:model-value="onInput(field.name, $event)"
      />
    </div>
    <ConfirmDialog
        v-if="variationToDelete"
        :title="`Remove variation ${variationToDelete}?`"
        content="You cannot undo this action. If there was any analytics collected for this variation, it will still be attributed to the ad."
        confirm-class="bg-red-900 text-white"
        content-class="w-96"
        @confirm="onRemoveVariation(variationToDelete)"
        @close="variationToDelete = ''"
    />
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
import { incrementName, replace } from "../../../helpers";
import { TrashIcon as RemoveIcon } from "../../../svg";
import { ConfirmDialog } from "../../Utility";
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
} from "./Fields";

const emit = defineEmits(["update:values"]);
const props = defineProps({
  values: {
    type: Object,
    default: null
  },
  form: {
    type: Object,
    required: true
  },
  noLabel: Boolean,
  showName: Boolean,
  disable: Boolean,
  readonly: Boolean,
  saving: Boolean
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

const mappedFields = props.form.fields.map((field) => ({
  placeholder: `Enter ${field.label}`,
  ...field,
  component: FORM_FIELD_MAP[field.type],
  default: field.type === "BOOLEAN" ? false : ""
}));

const variationNames = computed(() => {
  return [...new Set(props.values.map(v => v.variation))];
});

const currentVariation = ref(variationNames.value[0] || "default");
const variationToDelete = ref("");

function getFieldResponse(name) {
  if (!props.values) return undefined;
  return props.values.find((v) => v.variation === currentVariation.value && v.name === name);
}
function getFieldValue(name) {
  return getFieldResponse(name)?.value;
}
function onInput(name, value) {
  const fieldResponse = getFieldResponse(name);
  const newFieldResponse = {
    name,
    variation: currentVariation.value,
    value
  };
  const newValues = replace(props.values, fieldResponse, newFieldResponse, true);
  emit("update:values", newValues);
}

function onAddVariation() {
  if (props.saving) return;

  const previousName = variationNames.value[variationNames.value.length - 1];
  const newName = incrementName(previousName === "default" ? "Variation" : previousName);

  const newVariation = props.form.fields.map((field) => ({
    variation: newName,
    name: field.name,
    value: field.type === "BOOLEAN" ? false : null
  }));
  const newValues = [...props.values, ...newVariation];
  emit("update:values", newValues);
  currentVariation.value = newName;
}

function onRemoveVariation(name) {
  const newValues = props.values.filter((v) => v.variation !== name);
  emit("update:values", newValues);

  if (currentVariation.value === name) {
    currentVariation.value = variationNames.value[0];
  }
  variationToDelete.value = "";
}
</script>
