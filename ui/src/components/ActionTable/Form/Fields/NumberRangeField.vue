<template>
  <div>
    <div
      v-if="label"
      class="font-bold text-xs mb-2"
    >
      {{ label }}
    </div>
    <div class="flex items-center flex-nowrap cursor-pointer">
      <component
        :is="previewIcon"
        class="w-5 text-blue-base"
      />
      <div class="text-sm ml-3 hover:text-blue-base whitespace-nowrap">
        <template v-if="range">
          {{ formatNum(range.from || 0) }} - {{ formatNum(range.to) }}
        </template>
        <template v-else>
          No Limit
        </template>
      </div>
    </div>
    <QPopupProxy>
      <NumberField
        v-model="range.from"
        :field="minField"
        @update:model-value="onSave"
      />
      <NumberField
        v-model="range.to"
        class="mt-2"
        :field="maxField"
        @update:model-value="onSave"
      />
    </QPopupProxy>
  </div>
</template>

<script setup>
import { PercentIcon } from "@/svg";
import { CurrencyDollarIcon as CurrencyIcon, HashtagIcon as NumberIcon } from "@heroicons/vue/outline";
import { useDebounceFn } from "@vueuse/core";
import NumberField from "danx/src/components/ActionTable/Form/Fields/NumberField";
import { fCurrency, fNumber, fPercent } from "danx/src/helpers/formats";
import { computed, ref, watch } from "vue";

const emit = defineEmits(["update:model-value"]);
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  label: {
    type: String,
    default: null
  },
  icon: {
    type: Object,
    default: null
  },
  currency: Boolean,
  percent: Boolean,
  debounce: {
    type: Number,
    default: 0
  }
});

const symbol = computed(() => {
  if (props.currency) {
    return "$";
  } else if (props.percent) {
    return "%";
  } else {
    return "";
  }
});
const minField = computed(() => {
  return {
    id: "min-field",
    name: "from",
    label: "Min" + symbol.value,
    placeholder: "0"
  };
});

const maxField = computed(() => {
  return {
    id: "max-field",
    name: "to",
    label: "Max" + symbol.value,
    placeholder: "No Limit"
  };
});

const previewIcon = computed(() => props.icon || (props.currency ? CurrencyIcon : (props.percent ? PercentIcon : NumberIcon)));

const range = ref({});
watch(() => props.modelValue, setRange);
function setRange(val) {
  const multiplier = props.percent ? 100 : 1;
  range.value = {
    from: (val?.from ? val.from * multiplier : undefined),
    to: (val?.to ? val.to * multiplier : undefined)
  };
}
setRange(props.modelValue || { from: undefined, to: undefined });

/**
 * Convert the number into a nicely formatted string
 * @param num
 * @returns {string}
 */
function formatNum(num) {
  if (num === undefined) return "No Limit";
  if (props.currency) {
    return fCurrency(num);
  }
  if (props.percent) {
    return fPercent(num, { multiplier: 1, maximumFractionDigits: 2 });
  }
  return fNumber(num);
}

/**
 * Update the modelValue only after the debounce timeout
 * Empty values are converted to undefined so they will not be filtered on
 * @type {(function(): void)|*}
 */
const onSave = useDebounceFn(() => {
  if (range.value && (range.value.from || range.value.to)) {
    const multiplier = props.percent ? .01 : 1;
    let newVal = {
      from: (range.value.from ? range.value.from * multiplier : undefined),
      to: (range.value.to ? range.value.to * multiplier : undefined)
    };
    emit("update:model-value", newVal);
  }
}, props.debounce);
</script>
