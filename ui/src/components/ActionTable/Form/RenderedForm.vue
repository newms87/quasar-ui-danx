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
			<Component
				:is="field.component"
				:key="field.name + '-' + currentVariation"
				:model-value="getFieldValue(field.name)"
				:field="field"
				:label="field.label || undefined"
				:no-label="noLabel"
				:show-name="showName"
				:clearable="field.clearable || clearable"
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
import { ExclamationCircleIcon as MissingIcon, PencilIcon as EditIcon } from "@heroicons/vue/solid";
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
	clearable: Boolean,
	readonly: Boolean,
	saving: Boolean,
	emptyValue: {
		type: [String, Number, Boolean],
		default: undefined
	},
	canModifyVariations: Boolean
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
	component: FORM_FIELD_MAP[field.type]
}));

const variationNames = computed(() => {
	const names = [...new Set(props.values.map(v => v.variation))].sort();
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

function getFieldResponse(name, variation) {
	if (!props.values) return undefined;
	return props.values.find((v) => v.variation === (variation !== undefined ? variation : currentVariation.value) && v.name === name);
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
	const newValues = replace(props.values, fieldResponse, newFieldResponse, true);
	emit("update:values", newValues);
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
	let newValues = [...props.values];

	if (newValues.length === 0) {
		newValues = createVariation("");
	}
	const previousName = variationNames.value[variationNames.value.length - 1];
	const newName = incrementName(!previousName ? "1" : previousName);
	const newVariation = createVariation(newName);
	emit("update:values", [...newValues, ...newVariation]);
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
