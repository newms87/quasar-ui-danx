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
	showText?: boolean;
}>();

defineEmits<{
	change: [format: CodeFormat];
}>();

const formats = computed<CodeFormat[]>(() => {
	const base: CodeFormat[] = ["json", "yaml"];
	// Only show text option if explicitly enabled or if current format is text
	if (props.showText || props.format === "text") {
		base.push("text");
	}
	return base;
});
</script>
