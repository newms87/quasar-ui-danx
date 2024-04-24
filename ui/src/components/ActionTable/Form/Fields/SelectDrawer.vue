<template>
  <div>
    <ContentDrawer
      v-model:show="showDrawer"
      content-class=""
      position="bottom"
      :title="'Filter ' + label"
    >
      <div
        v-for="option in formattedOptions"
        :key="'select-drawer-' + option.value"
        :data-dusk="'drawer-opt-' + option.value"
        class="cursor-pointer hover:bg-slate-200 px-8 py-3 flex items-center border-b border-slate-200"
        @click="toggleSelect(option)"
      >
        <QCheckbox
          :model-value="isSelected(option)"
          class="mr-2"
          @click.stop="toggleSelect(option)"
        />
        <slot
          name="option"
          :opt="option"
        >
          {{ option.label }}
        </slot>
      </div>
    </ContentDrawer>

    <QChip
      ref="select"
      outline
      clickable
      size="16px"
      @click="showDrawer = true"
    >
      <slot name="selected">
        <slot name="label">
          {{ label }}:&nbsp;
        </slot>
        <template v-if="modelValue && modelValue.length > 0">
          <slot name="selection">
            <template v-if="multiple">
              {{ getOptionLabel(modelValue[0]) }}
              <template
                v-if="modelValue.length > 1"
              >
                + {{ modelValue.length - 1 }}
              </template>
            </template>
            <template v-else>
              {{ getOptionLabel(modelValue) }}
            </template>
          </slot>
        </template>
        <template v-else>
          <slot name="placeholder">
            {{ placeholder }}
          </slot>
        </template>
      </slot>
    </QChip>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { ContentDrawer } from "../../../Utility";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: [Object, String, Array, null],
    required: true
  },
  options: {
    type: Array,
    default: () => []
  },
  multiple: Boolean,
  label: {
    type: String,
    default: "Select"
  },
  placeholder: {
    type: String,
    default: "All"
  }
});

const showDrawer = ref(false);
const formattedOptions = computed(() =>
  props.options.map((opt) =>
    typeof opt === "string"
      ? {
        label: opt,
        value: opt
      }
      : opt
  )
);

function getOptionValue(option) {
  return option.value === undefined ? option : option.value;
}

function getOptionLabel(value) {
  return formattedOptions.value.find((opt) => opt.value === value).label;
}

function isSelected(option) {
  const optionValue = getOptionValue(option);

  if (props.multiple) {
    return props.modelValue.includes(optionValue);
  } else {
    return props.modelValue === optionValue;
  }
}

function toggleSelect(option) {
  let optionValue = getOptionValue(option);

  let selection = optionValue;

  if (props.multiple) {
    selection = [...props.modelValue];
    if (isSelected(optionValue)) {
      selection = selection.filter((opt) => opt !== optionValue);
    } else {
      selection.push(optionValue);
    }
  } else {
    // Allow deselection on single select
    if (selection === props.modelValue) {
      selection = null;
    }
  }

  emit("update:modelValue", selection);
}
</script>
