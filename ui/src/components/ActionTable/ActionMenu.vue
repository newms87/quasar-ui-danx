<template>
  <PopoverMenu
      class="px-4 h-full flex"
      :items="items"
      @action-item="onAction"
  />
</template>
<script setup>
import { performAction } from '../../helpers';
import { PopoverMenu } from '../Utility';

const emit = defineEmits(['action']);
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  rows: {
    type: Array,
    required: true
  }
});


function onAction(item) {
  emit('action', item);
  performAction(item, props.rows);
}
</script>
