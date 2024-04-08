<template>
  <div>
    <RenderVnode
        v-if="activeActionVnode"
        :vnode="activeActionVnode.vnode"
        :is-saving="isSaving"
        @confirm="onConfirm"
        @close="activeActionVnode.cancel"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { activeActionVnode } from '../../../helpers';
import { RenderVnode } from './index';

const isSaving = ref(false);
async function onConfirm(input) {
  isSaving.value = true;
  await activeActionVnode.value.confirm(input);
  isSaving.value = false;
}
</script>
