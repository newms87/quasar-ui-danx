<template>
  <div>
    <div v-if="readonly">
      <LabelValueBlock
        :label="label || field.label"
        :value="modelValue"
      />
    </div>
    <template v-else>
      <QInput
        :data-dusk="'text-field-' + field?.id"
        :data-testid="'text-field-' + field?.id"
        :placeholder="field?.placeholder"
        outlined
        dense
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
      >
        <template #label>
          <FieldLabel
            :field="field"
            :label="label"
            :show-name="showName"
            :class="labelClass"
          />
        </template>
      </QInput>
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
import LabelValueBlock from "./LabelValueBlock";

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
