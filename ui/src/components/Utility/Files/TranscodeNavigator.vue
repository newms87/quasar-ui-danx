<template>
  <div class="transcode-navigator">
    <!-- Desktop: Popover Menu -->
    <QMenu
      v-if="!isMobile"
      v-model="isOpen"
      anchor="top right"
      self="bottom right"
      :offset="[0, 8]"
    >
      <div class="bg-slate-800 rounded-lg shadow-xl p-3 min-w-[300px] max-w-[400px]">
        <div class="text-slate-200 font-semibold mb-2 px-2">
          Transcodes ({{ transcodes.length }})
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(transcode, index) in transcodes"
            :key="transcode.id"
            class="transcode-thumb cursor-pointer rounded border-2 transition-all hover:scale-105"
            :class="index === selectedIndex ? 'border-purple-500' : 'border-transparent opacity-70 hover:opacity-100'"
            @click="onSelectTranscode(transcode, index)"
          >
            <div class="relative">
              <img
                :src="getThumbUrl(transcode)"
                :alt="transcode.filename || transcode.name"
                class="w-20 h-20 object-cover rounded"
              >
              <div
                v-if="isTranscoding(transcode)"
                class="absolute inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center rounded"
              >
                <QSpinnerPie
                  class="text-purple-400"
                  size="24px"
                />
              </div>
            </div>
            <div class="text-xs text-slate-400 text-center mt-1 truncate w-20">
              {{ transcode.filename || transcode.name }}
            </div>
          </div>
        </div>
      </div>
    </QMenu>

    <!-- Mobile: Full Dialog -->
    <QDialog
      v-else
      v-model="isOpen"
      position="bottom"
    >
      <div class="bg-slate-800 rounded-t-2xl p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="text-slate-200 font-semibold text-lg">
            Transcodes ({{ transcodes.length }})
          </div>
          <QBtn
            flat
            round
            dense
            @click="isOpen = false"
          >
            <CloseIcon class="w-5 text-slate-400" />
          </QBtn>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="(transcode, index) in transcodes"
            :key="transcode.id"
            class="transcode-thumb cursor-pointer rounded border-2 transition-all"
            :class="index === selectedIndex ? 'border-purple-500' : 'border-transparent'"
            @click="onSelectTranscode(transcode, index)"
          >
            <div class="relative">
              <img
                :src="getThumbUrl(transcode)"
                :alt="transcode.filename || transcode.name"
                class="w-full aspect-square object-cover rounded"
              >
              <div
                v-if="isTranscoding(transcode)"
                class="absolute inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center rounded"
              >
                <QSpinnerPie
                  class="text-purple-400"
                  size="32px"
                />
              </div>
            </div>
            <div class="text-xs text-slate-400 text-center mt-1 truncate">
              {{ transcode.filename || transcode.name }}
            </div>
          </div>
        </div>
      </div>
    </QDialog>
  </div>
</template>

<script setup lang="ts">
import { XIcon as CloseIcon } from "@heroicons/vue/outline";
import { QSpinnerPie } from "quasar";
import { computed, ref } from "vue";
import { UploadedFile } from "../../../types";

interface TranscodeNavigatorProps {
	transcodes: UploadedFile[];
	modelValue?: boolean;
	selectedIndex?: number;
}

const emit = defineEmits<{
	'update:modelValue': [value: boolean];
	'select': [transcode: UploadedFile, index: number];
}>();

const props = withDefaults(defineProps<TranscodeNavigatorProps>(), {
	modelValue: false,
	selectedIndex: -1
});

const isOpen = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value)
});

// Detect mobile (simple breakpoint check)
const isMobile = computed(() => {
	if (typeof window === 'undefined') return false;
	return window.innerWidth < 768;
});

function onSelectTranscode(transcode: UploadedFile, index: number) {
	emit('select', transcode, index);
	isOpen.value = false;
}

function getThumbUrl(file: UploadedFile): string {
	if (file.thumb?.url) {
		return file.thumb.url;
	}
	if (isVideo(file)) {
		// Placeholder for video
		return `data:image/svg+xml;base64,${btoa(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>'
		)}`;
	}
	return file.optimized?.url || file.blobUrl || file.url || 'https://placehold.co/80x80?text=?';
}

function isVideo(file: UploadedFile): boolean {
	return !!file.mime?.startsWith('video') || !!file.type?.startsWith('video');
}

function isTranscoding(file: UploadedFile): boolean {
	// Check if file is still being transcoded based on meta
	const metaTranscodes = file.meta?.transcodes || {};
	for (const transcodeName of Object.keys(metaTranscodes)) {
		const transcode = metaTranscodes[transcodeName];
		if (transcode?.status && !['Complete', 'Timeout'].includes(transcode.status)) {
			return true;
		}
	}
	return false;
}
</script>

<style scoped lang="scss">
.transcode-navigator {
	.transcode-thumb {
		transition: all 0.2s ease;
	}
}
</style>
