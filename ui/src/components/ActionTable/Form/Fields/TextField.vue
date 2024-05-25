<template>
  <div>
    <FieldLabel
      :field="field"
      :label="label"
      :show-name="showName"
      :class="labelClass"
      :value="readonly ? modelValue : ''"
      class="mb-1 block"
    />
    <template v-if="!readonly">
      <QInput
        :placeholder="field?.placeholder"
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
        :maxlength="allowOverMax ? undefined : field?.maxLength"
        :debounce="debounce"
        @keydown.enter="$emit('submit')"
        @update:model-value="$emit('update:model-value', $event)"
      />
      <MaxLengthCounter
        :length="modelValue?.length || 0"
        :max-length="field?.maxLength"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { TextFieldProps } from "../../../../types";
import MaxLengthCounter from "../Utilities/MaxLengthCounter";
import FieldLabel from "./FieldLabel";

defineEmits(["update:model-value", "submit"]);
withDefaults(defineProps<TextFieldProps>(), {
	modelValue: "",
	field: null,
	type: "text",
	label: "",
	labelClass: "",
	parentClass: "",
	inputClass: "",
	maxLength: null,
	debounce: 0
});
</script>
