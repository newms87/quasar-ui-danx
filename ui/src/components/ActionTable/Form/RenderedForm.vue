<template>
  <div class="dx-rendered-form">
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
              v-if="!disabled && !readonly && canModifyVariations"
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
    <template
      v-for="(field, index) in mappedFields"
      :key="field.id"
    >
      <div
        v-show="isFieldEnabled(field)"
        :class="{ 'mt-4': index > 0, [fieldClass]: true }"
      >
        <RenderVnode
          v-if="field.vnode"
          :vnode="field.vnode"
          :props="getVnodeProps(field)"
          :params="fieldInputs"
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
          :clearable="field.clearable || clearable"
          :disabled="disabled"
          :disable="disabled"
          :readonly="readonly"
          @update:model-value="onInput(field.name, $event)"
        />
      </div>
    </template>
    <slot />
    <SaveStateIndicator
      :saving="saving"
      :saved-at="savedAt"
      :saving-class="savingClass"
    />
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { FlashMessages, incrementName, replace } from "../../../helpers";
import { TrashIcon as RemoveIcon } from "../../../svg";
import { AnyObject, FormFieldValue, RenderedFormProps } from "../../../types";
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
import SaveStateIndicator from "./Utilities/SaveStateIndicator";

const props = withDefaults(defineProps<RenderedFormProps>(), {
	values: null,
	emptyValue: undefined,
	fieldClass: "",
	savingClass: "text-sm text-slate-500 justify-end mt-4",
	savedAt: undefined
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
	component: field.component || FORM_FIELD_MAP[field.type]
}));

const fieldResponses = computed(() => {
	const values = props.values;
	if (!values) return [];
	if (Array.isArray(values)) return values;

	return Object.entries(values).filter((entry) => mappedFields.find(mf => mf.name === entry[0])).map(([name, value]) => ({
		name,
		value,
		variation: ""
	}));
});

const fieldInputs = computed(() => {
	const inputs: AnyObject = {};
	for (const field of mappedFields) {
		inputs[field.name] = getFieldValue(field.name);
	}
	return inputs;
});

function isFieldEnabled(field) {
	if (field.enabled === undefined) return true;

	if (typeof field.enabled === "function") {
		return field.enabled(fieldInputs.value);
	}

	return field.enabled;
}

function getVnodeProps(field) {
	return {
		modelValue: getFieldValue(field.name),
		label: field.label,
		clearable: field.clearable || props.clearable,
		readonly: props.readonly,
		disabled: props.disabled,
		disable: props.disabled,
		showName: props.showName,
		noLabel: props.noLabel
	};
}

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
const variationToEdit = ref<boolean | string>(false);
const variationToDelete = ref("");
const canAddVariation = computed(() => props.canModifyVariations && !props.readonly && !props.disabled && variationNames.value.length < (props.form.variations || 0));

function getFieldResponse(name: string, variation?: string) {
	if (!fieldResponses.value) return undefined;
	return fieldResponses.value.find((fr: FormFieldValue) => fr.variation === (variation !== undefined ? variation : currentVariation.value) && fr.name === name);
}
function getFieldValue(name: string) {
	return getFieldResponse(name)?.value;
}
function onInput(name: string, value: any) {
	const fieldResponse = getFieldResponse(name);
	const newFieldResponse = {
		name,
		variation: currentVariation.value || "",
		value: value === undefined ? props.emptyValue : value
	};
	const newValues = replace(fieldResponses.value, fieldResponse, newFieldResponse, true);
	updateValues(newValues);
}

function updateValues(values: FormFieldValue[]) {
	let updatedValues: FormFieldValue[] | object = values;

	if (!Array.isArray(props.values)) {
		updatedValues = values.reduce((acc: AnyObject, v) => {
			acc[v.name] = v.value;
			return acc;
		}, {});
	}

	emit("update:values", updatedValues);
}

onMounted(() => {
	window.addEventListener("beforeunload", handleBeforeUnload);
});
onBeforeUnmount(() => {
	window.removeEventListener("beforeunload", handleBeforeUnload);
});


function handleBeforeUnload(event: BeforeUnloadEvent) {
	if (props.saving) {
		return event.returnValue = "Changes are currently being saved. If you leave now, you might lose unsaved changes.";
	}
}

function createVariation(variation) {
	return props.form.fields.map((field) => ({
		variation,
		name: field.name,
		value: field.default_value === undefined ? null : field.default_value
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

function onRemoveVariation(name: string) {
	if (!name) return;

	const newValues = fieldResponses.value.filter((v) => v.variation !== name);
	updateValues(newValues);

	if (currentVariation.value === name) {
		currentVariation.value = variationNames.value[0];
	}
	variationToDelete.value = "";
}

function isVariationFormComplete(variation: string) {
	const requiredGroups: AnyObject = {};
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
