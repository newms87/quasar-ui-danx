<template>
  <div>
    <PopoverMenu
        class="px-4 h-full flex"
        :items="items"
        @action-item="onAction"
    />
    <Component
        v-if="confirmDialog"
        :is="confirmDialog.is"
        v-bind="confirmDialog.props"
        :is-saving="isSaving"
        @close="onCancel"
        @confirm="onConfirmAction"
    />
  </div>
</template>
<script setup>
import { ref, shallowRef } from 'vue';
import { FlashMessages } from '../../helpers';
import { PopoverMenu } from '../Utility';

const emit = defineEmits(['action']);
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  rows: {
    type: Array,
    required: true
  }
});


const activeAction = shallowRef(null);
const confirmDialog = shallowRef(null);
const isSaving = ref(false);

function onAction(item) {
  emit('action', item);

  activeAction.value = item;

  if (item.confirmDialog) {
    confirmDialog.value = typeof item.confirmDialog === 'function' ? item.confirmDialog(props.rows) : item.confirmDialog;
  } else {
    console.log('handle default action');
  }
}

function onCancel() {
  activeAction.value = null;
  confirmDialog.value = null;
}

async function onConfirmAction(input) {
  if (!activeAction.value.onAction) {
    throw new Error('No onAction handler found for the selected action:' + activeAction.value.action);
  }

  isSaving.value = true;
  const result = await activeAction.value.onAction(input, props.rows);
  isSaving.value = false;

  if (!result.success) {
    const errors = [];
    if (result.errors) {
      errors.push(...result.errors);
    } else if (result.error) {
      errors.push(result.error.message);
    } else {
      errors.push('An unknown error occurred. Please try again later.');
    }

    FlashMessages.combine('error', errors);

    if (activeAction.value.onError) {
      await activeAction.value.onError(result, input);
    }
  }

  FlashMessages.success(`The update was successful`);

  if (activeAction.value.onSuccess) {
    await activeAction.value.onSuccess(result, input);
  }

  if (activeAction.value.onFinish) {
    await activeAction.value.onFinish();
  }

  confirmDialog.value = null;
  activeAction.value = null;
}

</script>
