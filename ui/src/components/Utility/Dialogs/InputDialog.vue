<template>
  <ConfirmDialog
      v-bind="$props"
      @confirm="$emit('confirm', newInput)"
      @close="$emit('close', $event)"
  >
    <slot>
      <q-input
          v-model="newInput"
          type="number"
          class="w-full"
          @input="$emit('update:input', $event)"
      />
    </slot>
  </ConfirmDialog>
</template>
<script setup>
import { ref } from 'vue';
import ConfirmDialog from './ConfirmDialog';

defineEmits(['confirm', 'close', 'update:input']);
const props = defineProps({
  ...ConfirmDialog.props,
  title: {
    type: String,
    default: 'Enter Value'
  },
  input: {
    type: [Number, String],
    default: ''
  }
});

const newInput = ref(props.input);
</script>
