<template>
  <PopoverMenu
      class="px-2 flex action-button"
      :items="activeItems"
      :disabled="targets.length === 0"
      :tooltip="targets.length === 0 ? tooltip : null"
      :loading="isSaving"
      :loading-component="loadingComponent"
      @action-item="onAction"
  />
</template>
<script setup>
import { computed, ref } from 'vue';
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
  },
  loadingComponent: {
    type: [Function, Object],
    default: undefined
  }
});

const activeItems = computed(() => props.items.filter(item => {
  if (item.enabled === undefined) return true;
  return typeof item.enabled === 'function' ? !!item.enabled(props.targets?.[0] ?? null, props.targets) : !!item.enabled;
}));

const isSaving = ref(false);
async function onAction(item) {
  emit('action', item);
  isSaving.value = true;
  await performAction(item, props.targets);
  isSaving.value = false;
}
</script>
