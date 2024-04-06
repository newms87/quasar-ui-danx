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
import { FlashMessages } from '../../../helpers';

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
    await onConfirmAction();
  }
});

async function onConfirmAction(input) {
  if (!props.action.onAction) {
    throw new Error('No onAction handler found for the selected action:' + props.action.name);
  }

  isSaving.value = true;
  let result;
  try {
    result = await props.action.onAction(props.targets, input);
  } catch (e) {
    console.error(e);
    result = { error: `An error occurred while performing the action ${props.action.label}. Please try again later.` };
  }

  isSaving.value = false;

  // If there is no return value or the result marks it as successful, we show a success message
  if (result === undefined || result?.success) {

    if (result?.success) {
      FlashMessages.success(`The update was successful`);
    }

    if (props.action.onSuccess) {
      await props.action.onSuccess(result, props.targets, input);
    }

    emit('done');
  } else {
    const errors = [];
    if (result.errors) {
      errors.push(...result.errors);
    } else if (result.error) {
      errors.push(typeof result.error === 'string' ? result.error : result.error.message);
    } else {
      errors.push('An unknown error occurred. Please try again later.');
    }

    FlashMessages.combine('error', errors);

    if (props.action.onError) {
      await props.action.onError(result, props.targets, input);
    }
  }

  if (props.action.onFinish) {
    await props.action.onFinish(result, props.targets, input);
  }
}
</script>
