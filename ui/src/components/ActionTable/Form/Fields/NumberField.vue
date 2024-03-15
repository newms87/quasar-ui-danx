<template>
  <q-input
      :model-value="numberVal"
      :data-testid="'number-field-' + fieldOptions.id"
      :placeholder="fieldOptions.placeholder"
      outlined
      dense
      inputmode="numeric"
      :input-class="{[inputClass]: true, 'text-right bg-white': !hidePrependLabel, 'text-right !text-xs text-black font-normal': hidePrependLabel}"
      :class="{'no-prepend-icon w-32': hidePrependLabel, 'prepend-label': !hidePrependLabel}"
      @update:model-value="onInput"
  >
    <template #prepend>
      <FieldLabel
          :field="fieldOptions"
          :show-name="showName"
      />
    </template>
    </q-input>
</template>

<script setup>
import { fNumber } from '@ui/helpers/formats';
import { computed, nextTick, ref, watch } from 'vue';
import FieldLabel from './FieldLabel';

const emit = defineEmits(['update:model-value']);
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  precision: {
    type: Number,
    default: 2
  },
  label: {
    type: String,
    default: undefined
  },
  field: {
    type: Object,
    default: null
  },
  inputClass: {
    type: String,
    default: ''
  },
  hidePrependLabel: Boolean,
  currency: Boolean,
  showName: Boolean
});

const numberVal = ref(format(props.modelValue));
watch(() => props.modelValue, () => numberVal.value = format(props.modelValue));

const fieldOptions = computed(() => props.field || { label: props.label || '', placeholder: '', id: '' });

function format(number) {
  if (!number && number !== 0 && number !== '0') return number;

  const minimumFractionDigits = Math.min(props.precision, ('' + number).split('.')[1]?.length || 0);
  let options = {
    minimumFractionDigits
  };

  if (props.currency) {
    options = {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits
    };
  }
  return fNumber(number, options);
}
function onInput(value) {
  let number = '';

  // Prevent invalid characters
  if (value.match(/[^\d.,$]/)) {
    const oldVal = numberVal.value;
    // XXX: To get QInput to show only the value we want
    numberVal.value += ' ';
    return nextTick(() => numberVal.value = oldVal);
  }

  if (value !== '') {
    value = value.replace(/[^\d.]/g, '');
    number = Number(value);
    numberVal.value = format(number);
  }
  emit('update:model-value', number === '' ? undefined : number);
}
</script>
