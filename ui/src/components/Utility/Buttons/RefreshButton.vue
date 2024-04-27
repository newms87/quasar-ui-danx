<template>
  <QBtn
    class="dx-refresh-button dx-action-button"
    :loading="loading"
  >
    <RefreshIcon class="w-5" />
  </QBtn>
</template>
<script setup lang="ts">
import { RefreshIcon } from "@heroicons/vue/solid";

defineEmits(["refresh"]);
defineProps<{
  loading?: boolean
}>();
</script>
