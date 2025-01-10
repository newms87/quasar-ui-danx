<template>
  <div>
    <FieldLabel
      v-if="label"
      :label="label"
    />
    <QSelect
      ref="selectField"
      v-bind="$props"
      :model-value="selectedValue"
      outlined
      hide-dropdown-icon
      dense
      emit-value
      :use-input="filterable"
      :hide-selected="filterable && isShowing && !$props.multiple"
      :input-debounce="100"
      :options="filteredOptions"
      option-label="label"
      option-value="value"
      placeholder=""
      label=""
      :input-class="{'is-hidden': !isShowing, [inputClass]: true}"
      class="max-w-full dx-select-field"
      :class="selectClass"
      @filter="onFilter"
      @clear="onClear"
      @popup-show="onShow"
      @popup-hide="onHide"
      @update:model-value="onUpdate"
    >
      <template #append>
        <DropDownIcon
          class="w-4 transition"
          :class="isShowing ? 'rotate-180' : ''"
        />
      </template>
      <template #selected>
        <div
          v-if="$props.multiple"
          class="flex gap-y-1 overflow-hidden dx-selected-label"
          :class="{'flex-nowrap gap-y-0': chipLimit === 1, 'dx-selected-chips': chipOptions.length > 0, [selectionClass]: true}"
        >
          <template v-if="chipOptions.length > 0">
            <QChip
              v-for="chipOption in chipOptions"
              :key="'selected-' + chipOption.label"
              class="!mr-1"
            >
              {{ chipOption.label }}
            </QChip>
            <QChip
              v-if="selectedOptions.length > chipOptions.length"
              class="!mr-1"
            >
              +{{ selectedOptions.length - chipOptions.length }}
            </QChip>
          </template>
          <template v-else>
            {{ placeholder }}
          </template>
        </div>
        <div
          v-else
          :class="selectionClass"
          class="dx-selected-label"
        >
          {{ selectedLabel }}
        </div>
      </template>
    </QSelect>
  </div>
</template>
<script setup lang="ts">
import { ChevronDownIcon as DropDownIcon } from "@heroicons/vue/outline";
import { QSelect, QSelectProps } from "quasar";
import { computed, isRef, nextTick, ref } from "vue";
import FieldLabel from "./FieldLabel";

export interface Props extends QSelectProps {
	modelValue?: any;
	placeholder?: string;
	selectionLabel?: string | ((option) => string);
	chipLimit?: number;
	inputClass?: string;
	selectClass?: string;
	selectionClass?: string;
	options?: unknown[];
	filterable?: boolean;
	filterFn?: (val: string) => void;
	selectByObject?: boolean;
	optionLabel?: string | ((option) => string);
}

const emit = defineEmits(["update:model-value", "search", "update"]);
const props = withDefaults(defineProps<Props>(), {
	modelValue: undefined,
	placeholder: "",
	selectionLabel: null,
	chipLimit: 3,
	inputClass: "",
	selectClass: "",
	selectionClass: "",
	options: () => [],
	filterFn: null,
	optionLabel: "label"
});

const selectField = ref(null);

// The filter applied to the dropdown list of options
const filter = ref(null);
// Is showing the dropdown list
const isShowing = ref(false);

/**
 * The options formatted so each has a label, value and selectionLabel
 * @type {ComputedRef<{selectionLabel: string, label: string, value: string|*}[]>}
 */
const computedOptions = computed(() => {
	let options = props.options;
	if (props.placeholder && !props.multiple && !props.filterable) {
		options = [{ label: props.placeholder, value: null }, ...props.options];
	}
	options = options.map((o) => {
		let opt = isRef(o) ? o.value : o;
		return {
			label: resolveLabel(opt),
			value: resolveValue(opt),
			selectionLabel: resolveSelectionLabel(opt)
		};
	});
	return options;
});

const filteredOptions = computed(() => {
	if (filter.value && !props.filterFn) {
		return computedOptions.value.filter(o => o.label.toLocaleLowerCase().indexOf(filter.value?.toLowerCase()) > -1);
	} else {
		return computedOptions.value;
	}
});

/**
 * The value selected. Basically a wrapper to better handle null values (see onUpdate function for more details)
 * @type {ComputedRef<unknown>}
 */
const selectedValue = computed(() => {
	if (props.multiple) {
		const arrVal = Array.isArray(props.modelValue) ? props.modelValue : [];
		return arrVal.map((v) => {
			return v === null ? "__null__" : v;
		}) || [];
	} else {
		if (props.modelValue === null) return "__null__";

		if (props.selectByObject) return props.modelValue?.value || props.modelValue?.id;

		return props.modelValue;
	}
});

/**
 * The selected options. The list of options from the computedOptions list that are selected as defined by the modelValue
 * @type {ComputedRef<*>}
 */
const selectedOptions = computed(() => {
	let values = selectedValue.value;
	if (!props.multiple) {
		values = (values || values === 0) ? [values] : [];
	}

	const comparableValues = values.map((v) => {
		if (v === "__null__") return null;
		if (typeof v === "object") return v.value || v.id;
		return v;
	});
	return computedOptions.value.filter((o) => {
		return comparableValues.includes(o.value);
	});
});

/**
 * The label to display in the input field of the dropdown for a selected state, non-selected state or an active filtering state.
 * NOTE: Only applies to single select (not multiselect)
 * @type {ComputedRef<unknown>}
 */
const selectedLabel = computed(() => {
	if (props.filterable && isShowing.value) return "";

	if (!selectedOptions.value || selectedOptions.value.length === 0) {
		return props.placeholder || "(Select Option)";
	}

	return selectedOptions.value[0].selectionLabel;
});

/**
 * The options to display as chips (limited by chipLimit prop)
 * @type {ComputedRef<*>}
 */
const chipOptions = computed(() => {
	return selectedOptions.value.slice(0, props.chipLimit);
});

/**
 * Resolve the label of the option. This will display as the text in the dropdown list
 * @param option
 * @returns {*|string}
 */
function resolveLabel(option) {
	if (typeof option === "string") {
		return option;
	}
	if (typeof props.optionLabel === "string") {
		return option[props.optionLabel];
	}
	if (typeof props.optionLabel === "function") {
		return props.optionLabel(option);
	}
	return option?.label;
}

/**
 * Resolve the label to display in the input field of the dropdown when an option is selected
 * NOTE: Does not apply to multiselect, single select only
 * @param option
 * @returns {*|{default: null, type: String | StringConstructor}|string}
 */
function resolveSelectionLabel(option) {
	if (typeof option === "string") {
		return option;
	}
	if (typeof props.selectionLabel === "string") {
		return option[props.selectionLabel];
	}
	if (typeof props.selectionLabel === "function") {
		return props.selectionLabel(option);
	}
	return option?.selectionLabel || option?.label || (option && option[props.optionLabel]);
}

/**
 * Resolve the value of the option using either defaults or the provided optionValue prop
 * @param option
 * @returns {string|*|string}
 */
function resolveValue(option) {
	if (!option || typeof option === "string") {
		return option;
	}
	let value = option.value || option.id;
	if (typeof props.optionValue === "string") {
		value = option[props.optionValue];
	} else if (typeof props.optionValue === "function") {
		value = props.optionValue(option);
	}
	// Note the __null__ special case here. See the onUpdate function for more details
	return value === null ? "__null__" : value;
}

/**
 * Handle the update event from the QSelect
 * NOTE: casts all null values as a special __null__ string as the null character is handled the same as undefined by QSelect.
 * SelectField differentiates between these 2 to provide a null value selected state vs undefined is no value selected.
 * @param value
 */
function onUpdate(value) {
	if (Array.isArray(value)) {
		value = value.map((v) => v === "__null__" ? null : v);
	}

	value = value === "__null__" ? null : value;

	if (props.selectByObject && value !== null && value !== undefined && typeof value !== "object") {
		if (props.multiple) {
			value = props.options.filter((o) => value.includes(resolveValue(o)));
		} else {
			value = props.options.find((o) => resolveValue(o) === value);
		}
	}
	emit("update:model-value", value);
	emit("update", value);
}

/** XXX: This tells us when we should apply the filter. QSelect likes to trigger a new filter everytime you open the dropdown
 *       But most of the time when you open the dropdown it is already filtered and annoying to try and clear the previous filter
 **/
const shouldFilter = ref(false);

/**
 * Filter the options list. Do this asynchronously for the update so that the QSelect can update its internal state first, then update SelectField
 * @param val
 * @param update
 */
async function onFilter(val, update) {
	if (!props.filterFn) {
		filter.value = val;
		await nextTick(update);
	} else {
		update();
		if (!shouldFilter.value) return;
		if (val !== null && val !== filter.value) {
			filter.value = val;
			if (props.filterFn) {
				await props.filterFn(val);
			}
		}
	}
}

/**
 * Clear the selected value using undefined. SelectField differentiates between null and undefined.
 * See the onUpdate function for more details
 */
function onClear() {
	emit("update:model-value", undefined);
	emit("update", undefined);
}

/**
 * Handle behavior when showing the dropdown
 */
function onShow() {
	isShowing.value = true;

	// XXX: See description on shouldFilter declaration. Only allow filtering after dropdown is ALREADY opened
	shouldFilter.value = false;
	nextTick(() => {
		shouldFilter.value = true;
		selectField.value.focus();
	});
}

/**
 * Handle behavior when hiding the dropdown
 */
function onHide() {
	isShowing.value = false;
	shouldFilter.value = false;
}
</script>
