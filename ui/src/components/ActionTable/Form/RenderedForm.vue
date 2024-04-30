<template>
  <div class="rendered-form">
    <div
      v-if="form.variations > 1"
      class="mb-4"
    >
      <QTabs
        v-model="currentVariation"
        class="text-xs"
      >
        <QTab
          v-for="(name, index) in variationNames"
          :key="name"
          :name="name"
          class="p-0"
          content-class="w-full"
        >
          <div class="flex flex-nowrap items-center text-sm w-full">
            <div
              v-if="!isVariationFormComplete(name)"
              class="variation-missing-icon pl-1"
            >
              <MissingIcon class="text-red-400 w-4" />
              <QTooltip>Creative Form Incomplete</QTooltip>
            </div>
            <div class="flex-grow">
              {{ name || "1" }}
            </div>
            <div
              v-if="!disable && !readonly && canModifyVariations"
              class="flex flex-nowrap items-center mr-2"
            >
              <a
                class="ml-1 p-1 hover:opacity-100 opacity-20 hover:bg-blue-200 rounded"
                @click="() => (variationToEdit = name) && (newVariationName = name)"
              >
                <EditIcon class="w-3 text-blue-900" />
              </a>
              <a
                v-if="index > 0"
                class="ml-1 p-1 hover:opacity-100 opacity-20 hover:bg-red-200 rounded"
                @click="variationToDelete = name"
              >
                <RemoveIcon class="w-3 text-red-900" />
              </a>
            </div>
          </div>
        </QTab>
        <QTab
          v-if="canAddVariation"
          key="add-new-variation"
          name="add"
          class="bg-blue-600 rounded-t-lg !text-white"
          @click="onAddVariation"
        >
          <template v-if="saving">
            <QSpinnerBall class="w-4" />
          </template>
          <template v-else>
            + Add Variation
          </template>
        </QTab>
      </QTabs>
    </div>
    <div
      v-for="(field, index) in mappedFields"
      :key="field.id"
      :class="{ 'mt-4': index > 0 }"
    >
      <RenderVnode
        v-if="field.vnode"
        :vnode="field.vnode"
        :props="{field, modelValue: getFieldValue(field.name), readonly, disable, showName, noLabel}"
        @update:model-value="onInput(field.name, $event)"
      />
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
<script setup lang="ts">
import { ExclamationCircleIcon as MissingIcon, PencilIcon as EditIcon } from "@heroicons/vue/solid";
import { computed, ref } from "vue";
import { FlashMessages, incrementName, replace } from "../../../helpers";
import { TrashIcon as RemoveIcon } from "../../../svg";
import { ConfirmDialog, RenderVnode } from "../../Utility";
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
import { Form, FormFieldValue } from "./form.d.ts";

export interface Props {
	values?: FormFieldValue[] | object;
	form: Form;
	noLabel?: boolean;
	showName?: boolean;
	disable?: boolean;
	readonly?: boolean;
	saving?: boolean;
	emptyValue?: string | number | boolean;
	canModifyVariations?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	values: null,
	emptyValue: undefined
});

const emit = defineEmits(["update:values"]);

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
	component: field.component || FORM_FIELD_MAP[field.type],
	default: field.type === "BOOLEAN" ? false : ""
}));

const fieldResponses = computed(() => {
	if (!props.values) return [];
	if (Array.isArray(props.values)) return props.values;
	return Object.entries(props.values).map(([name, value]) => ({ name, value, variation: "" }));
});
const variationNames = computed(() => {
	const names = [...new Set(fieldResponses.value.map(v => v.variation))].sort();
	// Always guarantee that we show the default variation
	if (names.length === 0) {
		names.push("");
	}
	return names;
});

const currentVariation = ref(variationNames.value[0] || "");
const newVariationName = ref("");
const variationToEdit = ref(false);
const variationToDelete = ref("");
const canAddVariation = computed(() => props.canModifyVariations && !props.readonly && !props.disable && variationNames.value.length < props.form.variations);

function getFieldResponse(name, variation: string = undefined) {
	if (!fieldResponses.value) return undefined;
	return fieldResponses.value.find((fr: FormFieldValue) => fr.variation === (variation !== undefined ? variation : currentVariation.value) && fr.name === name);
}
function getFieldValue(name) {
	return getFieldResponse(name)?.value;
}
function onInput(name, value) {
	const fieldResponse = getFieldResponse(name);
	const newFieldResponse = {
		name,
		variation: currentVariation.value || "",
		value: value === undefined ? props.emptyValue : value
	};
	const newValues = replace(fieldResponses.value, fieldResponse, newFieldResponse, true);
	updateValues(newValues);
}

function createVariation(variation) {
	return props.form.fields.map((field) => ({
		variation,
		name: field.name,
		value: field.type === "BOOLEAN" ? false : null
	}));
}

function onAddVariation() {
	if (props.saving) return;
	let newValues = [...fieldResponses.value];

	if (newValues.length === 0) {
		newValues = createVariation("");
	}
	const previousName = variationNames.value[variationNames.value.length - 1];
	const newName = incrementName(!previousName ? "1" : previousName);
	const newVariation = createVariation(newName);
	updateValues([...newValues, ...newVariation]);
	currentVariation.value = newName;
}

function onChangeVariationName() {
	if (!newVariationName.value) return;
	if (variationNames.value.includes(newVariationName.value)) {
		FlashMessages.error("Variation name already exists");
		return;
	}
	const newValues = fieldResponses.value.map((v) => {
		if (v.variation === variationToEdit.value) {
			return { ...v, variation: newVariationName.value };
		}
		return v;
	});
	updateValues(newValues);

	currentVariation.value = newVariationName.value;
	variationToEdit.value = false;
	newVariationName.value = "";
}

function updateValues(values: FormFieldValue[]) {
	let updatedValues: FormFieldValue[] | object = values;

	if (!Array.isArray(props.values)) {
		updatedValues = values.reduce((acc, v) => {
			acc[v.name] = v.value;
			return acc;
		}, {});
	}
	emit("update:values", updatedValues);
}

function onRemoveVariation(name: string) {
	if (!name) return;

	const newValues = fieldResponses.value.filter((v) => v.variation !== name);
	updateValues(newValues);

	if (currentVariation.value === name) {
		currentVariation.value = variationNames.value[0];
	}
	variationToDelete.value = "";
}

function isVariationFormComplete(variation) {
	const requiredGroups = {};
	return props.form.fields.filter(r => r.required || r.required_group).every((field) => {
		const fieldResponse = getFieldResponse(field.name, variation);
		const hasValue = !!fieldResponse && fieldResponse.value !== null;
		if (field.required_group) {
			// This required group has already been satisfied
			if (requiredGroups[field.required_group]) return true;
			return requiredGroups[field.required_group] = hasValue;
		} else {
			return hasValue;
		}
	});
}
</script>
