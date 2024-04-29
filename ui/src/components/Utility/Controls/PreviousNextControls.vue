<template>
  <div class="dx-previous-next-controls">
    <QBtn
      class="dx-control dx-control-previous border border-solid !rounded-r-none !p-2 !min-w-0"
      :disable="isLoading"
      :loading="isLoading"
      @click="$emit('next', -1)"
    >
      <SkipPreviousIcon class="w-6" />
    </QBtn>
    <QBtn
      class="dx-control dx-control-next border border-solid border-l-0 !rounded-l-none !p-2 !min-w-0"
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
