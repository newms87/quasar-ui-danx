<template>
  <div>
    <Component
        v-if="confirmDialog"
        :is="confirmDialog.is"
        v-bind="confirmDialog.props"
        :is-saving="isSaving"
        @confirm="onConfirmAction"
        @close="$emit('done')"
    />
  </div>
</template>
<script setup>
import { onMounted, ref, shallowRef } from 'vue';

const emit = defineEmits(['done']);
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
  // If there is no dialog, we auto-confirm the action
  if (!confirmDialog.value) {
    onConfirmAction();
  }
});

async function onConfirmAction(input) {
  if (!props.action.onAction) {
    throw new Error('No onAction handler found for the selected action:' + props.action.name);
  }

  isSaving.value = true;
  const result = await props.action.onAction(props.targets, input);
  isSaving.value = false;

  if (props.action.onFinish) {
    props.action.onFinish(result, props.targets, input);
  }

  emit('done');
}
</script>
