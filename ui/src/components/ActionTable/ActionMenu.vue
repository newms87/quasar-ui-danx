<template>
  <PopoverMenu
      class="px-2 flex action-button"
      :items="activeActions"
      :disabled="targets.length === 0"
      :tooltip="targets.length === 0 ? tooltip : null"
      :loading="loading || isSaving"
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
  actions: {
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
  loading: Boolean,
  loadingComponent: {
    type: [Function, Object],
    default: undefined
  }
});

const activeActions = computed(() => props.actions.filter(action => {
  if (action.enabled === undefined) return true;
  return typeof action.enabled === 'function' ? !!action.enabled(props.targets?.[0] ?? null, props.targets) : !!action.enabled;
}));

const isSaving = ref(false);
async function onAction(action) {
  emit('action', action);
  isSaving.value = true;
  await performAction(action, props.targets);
  isSaving.value = false;
}
</script>
