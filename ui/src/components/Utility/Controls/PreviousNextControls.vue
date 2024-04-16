<template>
  <div class="previous-next-controls">
    <QBtn
        class="bg-slate-200 border-gray-300 border border-solid !rounded-r-none !p-2 !min-w-0"
        :disable="isLoading"
        :loading="isLoading"
        @click="$emit('next', -1)"
    >
      <SkipPreviousIcon class="w-6" />
    </QBtn>
    <QBtn
        class="bg-slate-200 border-gray-300 border border-solid border-l-0 !rounded-l-none !p-2 !min-w-0"
        :disable="isLoading"
        :loading="isLoading"
        @click="$emit('next', 1)"
    >
      <SkipNextIcon class="w-6" />
    </QBtn>
  </div>
</template>
<script setup>
import { SkipNextIcon, SkipPreviousIcon } from "../../../svg";

defineEmits(["next"]);
defineProps({
  isLoading: Boolean
});
</script>
