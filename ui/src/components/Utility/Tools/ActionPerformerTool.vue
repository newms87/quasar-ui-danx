<template>
  <div>
    <Component v-if="confirmDialog" :is="confirmDialog" :is-saving="isSaving" @confirm="onConfirmAction" />
  </div>
</template>
<script setup>
import { onMounted, ref, shallowRef } from 'vue';

const props = defineProps({
  action: {
    type: Object,
    required: true
  },
  targets: {
    type: Array,
    required: true
  }
});

const confirmDialog = shallowRef(props.action.confirmDialog ? props.action.confirmDialog(props.targets) : null);
const isSaving = ref(null);

onMounted(async () => {
  console.log('mounting action', props.action, props.targets);
  // If there is no dialog, we auto-confirm the action
  if (!confirmDialog.value) {
    onConfirmAction();
  }
});

function onConfirmAction(input) {
  console.log('action confirmed', input);
  if (!props.action.onAction) {
    throw new Error('No onAction handler found for the selected action:' + props.action.name);
  }

  isSaving.value = true;
  props.action.onAction().then(() => {
    isSaving.value = false;
  });
}
</script>
