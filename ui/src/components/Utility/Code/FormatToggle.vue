<template>
  <div class="text-[.7rem] text-slate-400">
    <a
      v-if="format === 'yaml'"
      class="cursor-pointer hover:text-white"
      @click="$emit('change', 'json')"
    >JSON</a>
    <span
      v-else
      class="text-slate-300"
    >JSON</span>
    <span class="mx-1">|</span>
    <a
      v-if="format === 'json'"
      class="cursor-pointer hover:text-white"
      @click="$emit('change', 'yaml')"
    >YAML</a>
    <span
      v-else
      class="text-slate-300"
    >YAML</span>
  </div>
</template>

<script setup lang="ts">
import { CodeFormat } from "../../../composables/useCodeFormat";

defineProps<{
	format: CodeFormat;
}>();

defineEmits<{
	change: [format: CodeFormat];
}>();
</script>
