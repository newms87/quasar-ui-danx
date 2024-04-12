<template>
  <PopoverMenu
      class="px-2 flex action-button"
      :items="activeActions"
      :disabled="!hasTarget"
      :tooltip="!hasTarget ? tooltip : null"
      :loading="isSaving || loading"
      :loading-component="loadingComponent"
      @action-item="onAction"
  />
</template>
<script setup>
import { computed, ref } from 'vue';
import { PopoverMenu } from '../Utility';

const props = defineProps({
  actions: {
    type: Array,
    required: true
  },
  target: {
    type: [Array, Object],
    default: () => []
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

const hasTarget = computed(() => Array.isArray(props.target) ? props.target.length > 0 : !!props.target);

const activeActions = computed(() => props.actions.filter(action => {
  if (Array.isArray(props.target)) {
    return action.batchEnabled ? action.batchEnabled(props.target) : true;
  }

  return action.enabled ? action.enabled(props.target) : true;
}));

const isSaving = ref(false);
async function onAction(action) {
  if (!action.trigger) {
    throw new Error('Action must have a trigger function! Make sure you are using useActions() or implement your own trigger function.');
  }
  isSaving.value = true;
  await action.trigger(props.target);
  isSaving.value = false;
}
</script>
