<template>
  <div class="file-renderer flex items-center justify-center w-full h-full">
    <!-- Video -->
    <template v-if="isVideo(file)">
      <video
        class="max-h-full w-full"
        controls
        :autoplay="autoplay"
      >
        <source
          :src="getPreviewUrl(file) + '#t=0.1'"
          :type="file.mime"
        >
      </video>
    </template>

    <!-- Image -->
    <img
      v-else-if="getPreviewUrl(file)"
      :alt="file.filename || file.name"
      :src="getPreviewUrl(file)"
      class="max-h-full max-w-full object-contain"
    >

    <!-- Text File (lazy loaded) -->
    <div
      v-else-if="isText(file)"
      class="w-[60vw] min-w-96 max-h-[80vh] bg-slate-800 rounded-lg overflow-auto"
    >
      <div class="whitespace-pre-wrap p-4 text-slate-200">
        <template v-if="textContent">
          {{ textContent }}
        </template>
        <div
          v-else
          class="flex items-center justify-center py-8"
        >
          <QSpinnerPie
            class="text-slate-400"
            size="48px"
          />
        </div>
      </div>
    </div>

    <!-- No Preview -->
    <div
      v-else
      class="text-center"
    >
      <h3 class="text-slate-300 mb-4">
        No Preview Available
      </h3>
      <a
        :href="file.url"
        target="_blank"
        class="text-blue-400 hover:text-blue-300"
      >
        {{ file.url }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QSpinnerPie } from "quasar";
import { onMounted, ref, watch } from "vue";
import { getPreviewUrl, isText, isVideo } from "../../../helpers/filePreviewHelpers";
import { UploadedFile } from "../../../types";

const props = withDefaults(defineProps<{
	file: UploadedFile;
	autoplay?: boolean;
	loadText?: boolean;
}>(), {
	autoplay: false,
	loadText: true
});

const textContent = ref<string>("");

/**
 * Load text file content from URL
 */
async function loadFileText() {
	if (!isText(props.file) || !props.loadText) {
		return;
	}

	if (textContent.value) {
		return; // Already loaded
	}

	try {
		const text = await fetch(props.file.url || "").then((res) => res.text());
		textContent.value = text;
	} catch (e) {
		textContent.value = "Error loading file content";
	}
}

// Load text content on mount and when file changes
onMounted(() => {
	loadFileText();
});

watch(() => props.file.id, () => {
	textContent.value = ""; // Reset
	loadFileText();
});
</script>
