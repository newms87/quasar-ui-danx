<template>
  <div class="text-[.7rem] text-slate-400 flex items-center">
    <template v-for="(fmt, index) in formats" :key="fmt">
      <span v-if="index > 0" class="mx-1">|</span>
      <a
        v-if="format !== fmt"
        class="cursor-pointer hover:text-white"
        @click="$emit('change', fmt)"
      >{{ fmt.toUpperCase() }}</a>
      <span
        v-else
        class="text-slate-300"
      >{{ fmt.toUpperCase() }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CodeFormat } from "../../../composables/useCodeFormat";

const props = defineProps<{
	format: CodeFormat;
}>();

defineEmits<{
	change: [format: CodeFormat];
}>();

const formats = computed<CodeFormat[]>(() => {
	// Structured data formats (JSON/YAML) are one group
	if (props.format === "json" || props.format === "yaml") {
		return ["json", "yaml"];
	}

	// Raw text formats (TEXT/MARKDOWN) are another group
	if (props.format === "text" || props.format === "markdown") {
		return ["text", "markdown"];
	}

	// Default fallback
	return ["json", "yaml"];
});
</script>
