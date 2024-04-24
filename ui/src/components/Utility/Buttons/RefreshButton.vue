<template>
  <QBtn
    class="bg-slate-200"
    :loading="loading"
  >
    <RefreshIcon class="w-5" />
  </QBtn>
</template>
<script setup>
import { RefreshIcon } from "@heroicons/vue/solid";

defineEmits(["refresh"]);
defineProps({
  loading: Boolean
});
</script>
