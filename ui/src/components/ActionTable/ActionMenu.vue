<template>
  <PopoverMenu
      class="px-2 flex action-button"
      :items="activeActions"
      :disabled="!hasTarget"
      :tooltip="!hasTarget ? tooltip : null"
      :loading="loading"
      :loading-component="loadingComponent"
      @action-item="$emit('action', $event)"
  />
</template>
<script setup>
import { computed } from 'vue';
import { PopoverMenu } from '../Utility';

const emit = defineEmits(['action']);
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
</script>
