<template>
  <div>
    <RenderComponent
        v-if="activeActionInput"
        :component="activeActionInput.component"
        :is-saving="isSaving"
        @confirm="onConfirm"
        @close="activeActionInput.cancel"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { activeActionInput } from '../../../helpers';
import RenderComponent from './RenderComponent';

const isSaving = ref(false);
async function onConfirm(input) {
  isSaving.value = true;
  await activeActionInput.value.confirm(input);
  isSaving.value = false;
}
</script>
