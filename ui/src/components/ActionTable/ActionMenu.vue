<template>
  <PopoverMenu
      class="px-4 h-full flex"
      :items="activeItems"
      @action-item="onAction"
  />
</template>
<script setup>
import { computed } from 'vue';
import { performAction } from '../../helpers';
import { PopoverMenu } from '../Utility';

const emit = defineEmits(['action']);
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  targets: {
    type: Array,
    required: true
  }
});

const activeItems = computed(() => props.items.filter(item => {
  if (item.enabled === undefined) return true;
  return typeof item.enabled === 'function' ? !!item.enabled(props.targets) : !!item.enabled;
}));

function onAction(item) {
  emit('action', item);
  performAction(item, props.targets);
}
</script>
