<template>
  <div class="dx-slider-number-field">
    <FieldLabel
      :label="label"
      :field="field"
    />
    <QSlider
      v-bind="sliderProps"
      :min="min"
      :max="max"
      label
      label-always
      switch-label-side
      :price-label="priceLabel"
    />
  </div>
</template>

<script setup lang="ts">
import { QSliderProps } from "quasar";
import { computed } from "vue";
import { FormField } from "../../../../types";
import FieldLabel from "./FieldLabel";

export interface SliderFieldProps extends QSliderProps {
	modelValue?: number | null;
	field?: FormField;
	label?: string;
	currency?: boolean;
	percent?: boolean;
}

defineEmits(["update:model-value"]);
const props = defineProps<SliderFieldProps>();
const sliderProps = computed(() => ({ ...props, field: undefined, label: !!props.label }));
const priceLabel = computed(() => {
	if (props.currency) {
		return "$" + props.modelValue;
	} else if (props.percent) {
		return props.modelValue + "%";
	} else {
		return props.modelValue;
	}
});
</script>
