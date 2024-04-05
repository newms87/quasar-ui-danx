<template>
  <PopoverMenu
      class="px-2 flex action-button"
      :items="activeItems"
      :disabled="targets.length === 0"
      @action-item="onAction"
  >
    <q-tooltip v-if="targets.length === 0">{{ tooltip }}</q-tooltip>
  </PopoverMenu>
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
  },
  tooltip: {
    type: String,
    default: 'First select records to perform a batch action'
  }
});

const activeItems = computed(() => props.items.filter(item => {
  if (item.enabled === undefined) return true;
  return typeof item.enabled === 'function' ? !!item.enabled(props.targets?.[0] ?? null, props.targets) : !!item.enabled;
}));

function onAction(item) {
  emit('action', item);
  performAction(item, props.targets);
}
</script>
