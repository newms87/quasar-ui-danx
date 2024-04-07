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

const hasTarget = computed(() => !!props.target?.length);

const activeActions = computed(() => props.actions.filter(action => {
  if (action.enabled === undefined) return true;
  return typeof action.enabled === 'function' ? !!action.enabled(props.target) : !!action.enabled;
}));
</script>
