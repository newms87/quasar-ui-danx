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
        :available-formats="availableFormats"
        :toggleable="availableFormats.length > 1"
        @click.stop
        @change="(fmt) => $emit('format-change', fmt)"
      />
  </div>
</template>

<script setup lang="ts">
import { FaSolidChevronRight as CollapseExpandIcon } from "danx-icon";
import LanguageBadge from "./LanguageBadge.vue";

defineProps<{
	preview: string;
	format: string;
	availableFormats?: string[];
}>();

defineEmits<{
	expand: [];
	"format-change": [format: string];
}>();
</script>
