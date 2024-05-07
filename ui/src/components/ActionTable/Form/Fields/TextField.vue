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

<script setup>
import MaxLengthCounter from "../Utilities/MaxLengthCounter";
import FieldLabel from "./FieldLabel";
import LabelValueBlock from "./LabelValueBlock";

defineEmits(["update:model-value", "submit"]);
defineProps({
	modelValue: {
		type: [String, Number],
		default: ""
	},
	field: {
		type: Object,
		default: null
	},
	type: {
		type: String,
		default: "text"
	},
	label: {
		type: String,
		default: null
	},
	labelClass: {
		type: String,
		default: ""
	},
	parentClass: {
		type: String,
		default: ""
	},
	inputClass: {
		type: String,
		default: ""
	},
	allowOverMax: Boolean,
	maxLength: {
		type: Number,
		default: null
	},
	autogrow: Boolean,
	noLabel: Boolean,
	showName: Boolean,
	disabled: Boolean,
	readonly: Boolean,
	debounce: {
		type: [String, Number],
		default: 0
	}
});
</script>
