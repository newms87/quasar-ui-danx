<template>
  <div>
    <template v-if="field.type === 'multi-select'">
      <SelectField
        v-if="field.options?.length > 0 || loading"
        :model-value="modelValue"
        :options="field.options"
        multiple
        :loading="loading"
        :chip-limit="1"
        filterable
        :placeholder="field.placeholder"
        :label="field.label"
        @update:model-value="onUpdate"
      />
      <div
        v-else
        class="mt-2"
      >
        <div class="text-xs font-bold">{{ field.label }}</div>
        <div class="text-sm ml-3 py-2">No Available Options</div>
      </div>
    </template>

    <SelectField
      v-else-if="field.type === 'single-select'"
      :model-value="modelValue"
      :options="field.options"
      :placeholder="field.placeholder"
      :loading="loading"
      :label="field.label"
      @update:model-value="onUpdate"
    />
    <DateField
      v-else-if="field.type === 'date'"
      :model-value="modelValue"
      :label="field.label"
      class="mt-2"
      @update:model-value="onUpdate"
    />
    <DateRangeField
      v-else-if="field.type === 'date-range'"
      :model-value="modelValue"
      :label="field.label"
      :inline="field.inline"
      with-time
      class="mt-2 reactive"
      @update:model-value="onUpdate"
    />
    <NumberRangeField
      v-else-if="field.type === 'number-range'"
      :model-value="modelValue"
      :label="field.label"
      class="mt-2"
      :debounce="1000"
      @update:model-value="onUpdate"
    />
    <NumberRangeField
      v-else-if="field.type === 'currency-range'"
      :model-value="modelValue"
      :label="field.label"
      class="mt-2"
      :debounce="1000"
      currency
      @update:model-value="onUpdate"
    />
    <NumberRangeField
      v-else-if="field.type === 'percent-range'"
      :model-value="modelValue"
      :label="field.label"
      class="mt-2"
      :debounce="1000"
      percent
      @update:model-value="onUpdate"
    />
    <BooleanField
      v-else-if="field.type === 'boolean'"
      :field="field"
      :model-value="modelValue"
      class="mt-2"
      label-class="text-xs font-bold"
      @update:model-value="onUpdate"
    />
    <MultiKeywordField
      v-else-if="field.type === 'multi-keywords'"
      :model-value="modelValue"
      :field="field"
      @update:model-value="onUpdate"
    />
    <SelectWithChildrenField
      v-else-if="field.type === 'select-with-children'"
      :model-value="modelValue"
      :options="field.options"
      :loading="loading"
      :label="field.label"
      :placeholder="field.placeholder"
      @update:model-value="onUpdate"
    />
    <template v-else>
      Field &quot;{{ field.name }}&quot;: Unknown filter type {{ field.type }}
    </template>
  </div>
</template>
<script setup>
import BooleanField from "src/components/ActionTable/Form/Fields/BooleanField";
import DateField from "src/components/ActionTable/Form/Fields/DateField";
import DateRangeField from "src/components/ActionTable/Form/Fields/DateRangeField";
import MultiKeywordField from "src/components/ActionTable/Form/Fields/MultiKeywordField";
import NumberRangeField from "src/components/ActionTable/Form/Fields/NumberRangeField";
import SelectField from "src/components/ActionTable/Form/Fields/SelectField";
import SelectWithChildrenField from "src/components/ActionTable/Form/Fields/SelectWithChildrenField";

const emit = defineEmits(["update:model-value"]);
const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Array, Number, Object, Boolean],
    default: undefined
  },
  loading: Boolean
});

function onUpdate(val) {
  let newVal = val || undefined;

  switch (props.field.type) {
    case "multi-select":
      newVal = val.length > 0 ? val : undefined;
      break;
    case "single-select":
    case "boolean":
      newVal = val === null ? undefined : val;
      break;
  }

  emit("update:model-value", newVal);
}
</script>
