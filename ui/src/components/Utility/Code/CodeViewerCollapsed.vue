<template>
  <div
    class="code-collapsed relative flex items-center cursor-pointer"
    @click="$emit('expand')"
  >
    <CollapseExpandIcon class="w-3 h-3 mr-2 flex-shrink-0 text-gray-500" />
    <code class="code-collapsed-preview flex-1 min-w-0 truncate" v-html="preview" />

    <!-- Language badge - stop propagation to prevent expand when clicking -->
    <LanguageBadge
      :format="format"
      :toggleable="true"
      class="relative ml-2"
      @click.stop
      @toggle="$emit('toggle-format')"
    />
  </div>
</template>

<script setup lang="ts">
import { FaSolidChevronRight as CollapseExpandIcon } from "danx-icon";
import LanguageBadge from "./LanguageBadge.vue";

defineProps<{
	preview: string;
	format: string;
}>();

defineEmits<{
	expand: [];
	"toggle-format": [];
}>();
</script>
