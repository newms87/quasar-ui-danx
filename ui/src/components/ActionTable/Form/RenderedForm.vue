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
            <div>{{ name || "(Default)" }}</div>
            <template v-if="!disable && !readonly">
              <a
                  @click="() => (variationToEdit = name) && (newVariationName = name)"
                  class="ml-1 p-1 hover:opacity-100 opacity-20 hover:bg-blue-200 rounded"
              >
                <EditIcon class="w-3 text-blue-900" />
              </a>
              <a
                  v-if="index > 0"
                  @click="variationToDelete = name"
                  class="ml-1 p-1 hover:opacity-100 opacity-20 hover:bg-red-200 rounded"
              >
                <RemoveIcon class="w-3 text-red-900" />
              </a>
            </template>
          </div>
        </QTab>
        <QTab
            v-if="canAddVariation"
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
        v-if="variationToEdit !== false"
        title="Change variation name"
        @confirm="onChangeVariationName"
        @close="variationToEdit = false"
    >
      <TextField
          v-model="newVariationName"
          label="Enter name"
          placeholder="Variation Name"
          input-class="bg-white"
      />
    </ConfirmDialog>
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
import { PencilIcon as EditIcon } from "@heroicons/vue/solid";
import { computed, ref } from "vue";
import { FlashMessages, incrementName, replace } from "../../../helpers";
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
    type: Array,
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
  return [...new Set(props.values.map(v => v.variation))].sort();
});

const currentVariation = ref(variationNames.value[0] || "");
const newVariationName = ref("");
const variationToEdit = ref(false);
const variationToDelete = ref("");
const canAddVariation = computed(() => variationNames.value.length < props.form.variations && !props.readonly && !props.disable);

function getFieldResponse(name) {
  if (!props.values) return undefined;
  return props.values.find((v) => (!v.variation || v.variation === currentVariation.value) && v.name === name);
}
function getFieldValue(name) {
  return getFieldResponse(name)?.value;
}
function onInput(name, value) {
  const fieldResponse = getFieldResponse(name);
  const newFieldResponse = {
    name,
    variation: currentVariation.value || null,
    value
  };
  const newValues = replace(props.values, fieldResponse, newFieldResponse, true);
  emit("update:values", newValues);
}

function onAddVariation() {
  if (props.saving) return;

  const previousName = variationNames.value[variationNames.value.length - 1];
  const newName = incrementName(!previousName ? "Variation 1" : previousName);

  const newVariation = props.form.fields.map((field) => ({
    variation: newName,
    name: field.name,
    value: field.type === "BOOLEAN" ? false : null
  }));
  const newValues = [...props.values, ...newVariation];
  emit("update:values", newValues);
  currentVariation.value = newName;
}

function onChangeVariationName() {
  if (!newVariationName.value) return;
  if (variationNames.value.includes(newVariationName.value)) {
    FlashMessages.error("Variation name already exists");
    return;
  }
  const newValues = props.values.map((v) => {
    if (v.variation === variationToEdit.value) {
      return { ...v, variation: newVariationName.value };
    }
    return v;
  });
  emit("update:values", newValues);

  currentVariation.value = newVariationName.value;
  variationToEdit.value = false;
  newVariationName.value = "";
}

function onRemoveVariation(name) {
  if (!name) return;

  const newValues = props.values.filter((v) => v.variation !== name);
  emit("update:values", newValues);

  if (currentVariation.value === name) {
    currentVariation.value = variationNames.value[0];
  }
  variationToDelete.value = "";
}
</script>
