<template>
  <div
    v-if="files.length > 1"
    class="bg-slate-900 bg-opacity-90 p-3 flex-shrink-0"
  >
    <div
      ref="containerRef"
      class="flex items-center justify-start gap-2 overflow-x-auto overflow-y-hidden px-4"
    >
      <div
        v-for="(file, index) in files"
        :key="file.id"
        :class="[
          'thumbnail cursor-pointer rounded border-2 transition-all flex-shrink-0 relative',
          index === currentIndex ? 'border-blue-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
        ]"
        @click="onThumbnailClick(index)"
      >
        <img
          :src="getThumbUrl(file)"
          :alt="file.filename || file.name"
          class="w-16 h-16 object-cover rounded"
        >
        <div class="absolute bottom-0 left-0 bg-slate-900 bg-opacity-80 text-slate-200 text-xs px-1.5 py-0.5 rounded-br rounded-tl font-semibold">
          {{ index + 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue";
import { useThumbnailScroll } from "../../../composables/useThumbnailScroll";
import { getThumbUrl } from "../../../helpers/filePreviewHelpers";
import { UploadedFile } from "../../../types";

const emit = defineEmits<{
	'navigate': [index: number];
}>();

const props = defineProps<{
	files: UploadedFile[];
	currentIndex: number;
}>();

const containerRef = ref<HTMLElement | null>(null);

// Auto-scroll active thumbnail into view
useThumbnailScroll({
	containerRef,
	currentIndex: toRef(props, "currentIndex")
});

function onThumbnailClick(index: number) {
	emit("navigate", index);
}
</script>

<style scoped lang="scss">
.thumbnail {
	transition: all 0.2s ease;
}
</style>
