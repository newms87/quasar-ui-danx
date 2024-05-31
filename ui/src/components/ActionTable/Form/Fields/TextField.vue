<template>
  <div>
    <FieldLabel
      :field="field"
      :label="label"
      :required="required || field?.required"
      :show-name="showName"
      :class="labelClass"
      :value="readonly ? modelValue : ''"
    />
    <template v-if="!readonly">
      <QInput
        :placeholder="placeholder || field?.placeholder || (placeholder === '' ? '' : `Enter ${label}`)"
        outlined
        dense
        :readonly="readonly"
        :autogrow="autogrow"
        :disable="disabled"
        :label-slot="!noLabel"
        :input-class="inputClass"
        :class="parentClass"
        stack-label
        :type="type"
        :model-value="modelValue"
        :maxlength="allowOverMax ? undefined : (maxLength || field?.maxLength)"
        :debounce="debounce"
        @keydown.enter="$emit('submit')"
        @update:model-value="onUpdate"
      />
      <MaxLengthCounter
        :length="(modelValue + '').length || 0"
        :max-length="(maxLength || field?.maxLength)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { TextFieldProps } from "../../../../types";
import MaxLengthCounter from "../Utilities/MaxLengthCounter";
import FieldLabel from "./FieldLabel";

const emit = defineEmits(["update:model-value", "submit"]);
const props = withDefaults(defineProps<TextFieldProps>(), {
	modelValue: "",
	field: null,
	type: "text",
	label: "",
	labelClass: "",
	parentClass: "",
	inputClass: "",
	maxLength: null,
	debounce: 0,
	placeholder: null
});

function onUpdate(value) {
	if (props.min || props.max) {
		const numValue = +value;
		if (numValue < props.min) {
			value = props.min;
		} else if (numValue > props.max) {
			value = props.max;
		}
	}

	emit("update:model-value", value);
}
</script>
