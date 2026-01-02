<template>
  <div
    class="code-collapsed flex items-center cursor-pointer"
    @click="$emit('expand')"
  >
    <CollapseExpandIcon class="w-3 h-3 mr-2 flex-shrink-0 text-gray-500" />
    <code class="code-collapsed-preview flex-1 min-w-0 truncate" v-html="preview" />
  </div>
</template>

<script setup lang="ts">
import { FaSolidChevronRight as CollapseExpandIcon } from "danx-icon";

defineProps<{
	preview: string;
}>();

defineEmits<{
	expand: [];
}>();
</script>
