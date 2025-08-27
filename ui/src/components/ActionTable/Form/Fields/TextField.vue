<template>
  <div class="dx-text-field">
    <FieldLabel
      v-if="!prependLabel && label"
      :label="label"
      :required="required"
      :required-label="requiredLabel"
      :class="labelClass"
    />
    <div
      v-if="readonly"
      class="dx-text-field-readonly-value"
    >
      {{ modelValue }}
    </div>
    <template v-else>
      <QInput
        :placeholder="placeholder || (placeholder === '' ? '' : `Enter ${label}`)"
        outlined
        dense
        name=""
        :readonly="readonly"
        :autogrow="autogrow"
        :disable="disabled"
        :label-slot="!noLabel"
        :input-class="inputClass"
        :rows="rows"
        :class="{'dx-input-prepend-label': prependLabel}"
        stack-label
        :type="type"
        :model-value="modelValue"
        :maxlength="allowOverMax ? undefined : maxLength"
        :debounce="debounce"
        :loading="loading"
        @keydown.enter="$emit('submit')"
        @update:model-value="$emit('update:model-value', $event)"
      >
        <template
          v-if="prependLabel || $slots.prepend"
          #prepend
        >
          <FieldLabel
            class="dx-prepended-label"
            :label="label"
            :required="required"
            :required-label="requiredLabel"
            :class="labelClass"
          />
          <slot name="prepend" />
        </template>
        <template #append>
          <slot name="append" />
        </template>
      </QInput>
      <MaxLengthCounter
        :length="(modelValue + '').length || 0"
        :max-length="maxLength"
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
  inputClass: "",
  maxLength: null,
  rows: 3,
  debounce: 0,
  placeholder: null
});
</script>
