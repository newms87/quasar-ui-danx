<template>
  <TextField
    class="dx-number-field"
    v-bind="$props"
    :model-value="numberVal"
    @update:model-value="onInput"
  />
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { nextTick, ref, watch } from "vue";
import { fNumber } from "../../../../helpers";
import { AnyObject, NumberFieldProps } from "../../../../types";
import TextField from "./TextField";

const emit = defineEmits(["update:model-value", "update"]);


const props = withDefaults(defineProps<NumberFieldProps>(), {
	modelValue: "",
	precision: 2,
	label: undefined,
	delay: 1000,
	min: undefined,
	max: undefined
});

const numberVal = ref(format(props.modelValue));

watch(() => props.modelValue, () => numberVal.value = format(props.modelValue));

function format(number) {
	if (!number && number !== 0 && number !== "0") return number;

	if (props.type === "number") return number;

	const minimumFractionDigits = Math.min(props.precision, ("" + number).split(".")[1]?.length || 0);
	let options: AnyObject = {
		minimumFractionDigits
	};

	if (props.currency) {
		options = {
			style: "currency",
			currency: "USD",
			minimumFractionDigits
		};
	}
	return fNumber(number, options);
}

const onUpdateDebounced = useDebounceFn((val: number | string | undefined) => emit("update", val), props.delay);

function onInput(value) {
	let number: number | undefined = undefined;

	// Prevent invalid characters
	if (value.match(/[^\d.,$]/)) {
		const oldVal = numberVal.value;

		// XXX: To get QInput to show only the value we want
		numberVal.value += " ";
		return nextTick(() => numberVal.value = oldVal);
	}

	if (value !== "") {
		value = value.replace(/[^\d.]/g, "");
		number = +value;

		if (props.min) {
			number = Math.max(number, props.min);
		}
		if (props.max) {
			number = Math.min(number, props.max);
		}

		numberVal.value = format(number);
	}

	emit("update:model-value", number);

	// Delay the change event, so we only see the value after the user has finished
	onUpdateDebounced(number);
}
</script>
