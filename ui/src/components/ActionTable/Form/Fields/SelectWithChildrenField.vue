<template>
  <div>
    <template v-if="!loading && !options.length">
      <div class="text-zinc-500">
        No options available
      </div>
    </template>
    <SelectField
      v-model="selectedOption"
      :options="options"
      :label="label"
      :placeholder="placeholder"
      :option-value="opt => opt"
      :loading="loading"
      @update:model-value="onSelectOption"
    />
    <div v-if="selectedOption">
      <QCheckbox
        v-for="child in selectedOption.children"
        :key="child.id"
        :model-value="selectedChildren.includes(child.id)"
        :field="child"
        class="mt-3"
        @update:model-value="onSelectChild(child)"
      >
        <div>{{ child.label }}</div>
        <div class="text-xs text-zinc-500">
          {{ child.name }}
        </div>
      </QCheckbox>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { remove } from "../../../../helpers";
import SelectField from "./SelectField";

export interface SelectWithChildrenFieldProps {
	modelValue?: string[];
	label?: string;
	placeholder?: string;
	options?: any[];
	loading?: boolean;
}

const emit = defineEmits(["update:model-value"]);
const props = withDefaults(defineProps<SelectWithChildrenFieldProps>(), {
	modelValue: () => [],
	label: "Selection",
	placeholder: "Select an option",
	options: () => []
});

function resolveSelectedOption() {
	if (props.modelValue?.length > 0) {
		return props.options.find((option) => option.children.find(child => props.modelValue.includes(child.id)));
	}

	return null;
}
const selectedOption = ref(resolveSelectedOption());
const selectedChildren = ref(props.modelValue || []);
function onSelectChild(child) {
	if (selectedChildren.value.includes(child.id)) {
		selectedChildren.value = remove(selectedChildren.value, child.id);
	} else {
		selectedChildren.value.push(child.id);
	}
	emit("update:model-value", selectedChildren.value.length > 0 ? selectedChildren.value : undefined);
}
function onSelectOption() {
	selectedChildren.value = [];
	emit("update:model-value", undefined);
}
watch(() => props.modelValue, (value) => {
	selectedOption.value = resolveSelectedOption();
	selectedChildren.value = value || [];
});
</script>
