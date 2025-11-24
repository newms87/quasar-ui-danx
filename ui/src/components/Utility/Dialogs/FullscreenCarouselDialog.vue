<template>
  <QDialog
    :model-value="true"
    maximized
    @update:model-value="$emit('close')"
  >
    <div class="absolute inset-0 bg-black">
      <!-- Main Content Area -->
      <div class="w-full h-full flex flex-col">
        <!-- Header with filename and navigation -->
        <div
          v-if="currentFile"
          class="text-base text-center py-3 px-16 bg-slate-800 opacity-90 text-slate-300 hover:opacity-100 transition-all flex-shrink-0"
        >
          <div class="flex items-center justify-center gap-3">
            <!-- Back to Parent Button -->
            <QBtn
              v-if="hasParent"
              flat
              dense
              class="bg-slate-700 text-slate-300 hover:bg-slate-600"
              @click="navigateToParent"
            >
              <div class="flex items-center flex-nowrap gap-1">
                <ArrowLeftIcon class="w-4" />
                <span class="text-sm">Back to Parent</span>
              </div>
            </QBtn>

            <!-- Filename -->
            <div class="flex-grow">
              {{ currentFile.filename || currentFile.name }}
            </div>

            <!-- Transcodes Button -->
            <QBtn
              v-if="currentFile.transcodes && currentFile.transcodes.length > 0"
              flat
              dense
              class="bg-purple-700 text-purple-200 hover:bg-purple-600"
              @click="showTranscodeNav = true"
            >
              <div class="flex items-center flex-nowrap gap-1">
                <FilmIcon class="w-4" />
                <QBadge
                  class="bg-purple-900 text-purple-200"
                  :label="currentFile.transcodes.length"
                />
                <span class="text-sm ml-1">Transcodes</span>
              </div>
            </QBtn>
          </div>
        </div>

        <!-- Carousel -->
        <div class="flex-grow relative">
          <div class="absolute inset-0">
            <div
              v-for="(file, index) in visibleSlides"
              :key="file.file.id"
              :class="[
                'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
                file.isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              ]"
            >
              <!-- Video -->
              <template v-if="isVideo(file.file)">
                <video
                  class="max-h-full w-full"
                  controls
                  :autoplay="file.isActive"
                >
                  <source
                    :src="getPreviewUrl(file.file) + '#t=0.1'"
                    :type="file.file.mime"
                  >
                </video>
              </template>

              <!-- Image -->
              <img
                v-else-if="getPreviewUrl(file.file)"
                :alt="file.file.filename"
                :src="getPreviewUrl(file.file)"
                class="max-h-full max-w-full object-contain"
              >

              <!-- Text File (lazy loaded) -->
              <div
                v-else-if="isText(file.file)"
                class="w-[60vw] min-w-96 max-h-[80vh] bg-slate-800 rounded-lg overflow-auto"
              >
                <div class="whitespace-pre-wrap p-4 text-slate-200">
                  <template v-if="fileTexts[file.file.id]">
                    {{ fileTexts[file.file.id] }}
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
                  :href="file.file.url"
                  target="_blank"
                  class="text-blue-400 hover:text-blue-300"
                >
                  {{ file.file.url }}
                </a>
              </div>
            </div>
          </div>

          <!-- Navigation Arrows -->
          <div
            v-if="canNavigatePrevious"
            class="absolute left-4 top-1/2 -translate-y-1/2 z-20"
          >
            <QBtn
              round
              size="lg"
              class="bg-slate-800 text-white opacity-70 hover:opacity-100"
              @click="navigatePrevious"
            >
              <ChevronLeftIcon class="w-8" />
            </QBtn>
          </div>
          <div
            v-if="canNavigateNext"
            class="absolute right-4 top-1/2 -translate-y-1/2 z-20"
          >
            <QBtn
              round
              size="lg"
              class="bg-slate-800 text-white opacity-70 hover:opacity-100"
              @click="navigateNext"
            >
              <ChevronRightIcon class="w-8" />
            </QBtn>
          </div>
        </div>

        <!-- Thumbnails (if multiple files) -->
        <div
          v-if="relatedFiles.length > 1"
          class="bg-slate-900 bg-opacity-90 p-3 flex-shrink-0"
        >
          <div
            ref="thumbnailContainer"
            class="flex items-center justify-start gap-2 overflow-x-auto overflow-y-hidden px-4"
          >
            <div
              v-for="(file, index) in relatedFiles"
              :key="file.id"
              :class="[
                'thumbnail cursor-pointer rounded border-2 transition-all flex-shrink-0',
                index === currentIndex ? 'border-blue-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              ]"
              @click="navigateTo(index)"
            >
              <img
                :src="getThumbUrl(file)"
                :alt="file.filename || file.name"
                class="w-16 h-16 object-cover rounded"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Close Button -->
      <a
        class="absolute top-0 right-0 text-white flex items-center justify-center w-16 h-16 hover:bg-slate-600 transition-all cursor-pointer z-30"
        @click="$emit('close')"
      >
        <CloseIcon class="w-8 h-8" />
      </a>

      <!-- Transcode Navigator -->
      <TranscodeNavigator
        v-if="currentFile?.transcodes"
        v-model="showTranscodeNav"
        :transcodes="currentFile.transcodes"
        @select="onSelectTranscode"
      />
    </div>
  </QDialog>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, FilmIcon } from "@heroicons/vue/outline";
import { QSpinnerPie } from "quasar";
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { useFileNavigation } from "../../../composables/useFileNavigation";
import { useVirtualCarousel } from "../../../composables/useVirtualCarousel";
import { XIcon as CloseIcon } from "../../../svg";
import { UploadedFile } from "../../../types";
import TranscodeNavigator from "../Files/TranscodeNavigator.vue";

defineEmits(["close"]);

const props = defineProps<{
	files: UploadedFile[];
	defaultSlide?: string;
}>();

// Initialize with first file or file matching defaultSlide
const initialIndex = props.defaultSlide
	? props.files.findIndex(f => f.id === props.defaultSlide)
	: 0;
const initialFile = props.files[initialIndex >= 0 ? initialIndex : 0];

// Thumbnail container ref
const thumbnailContainer = ref<HTMLElement | null>(null);

// Use navigation composable
const navigation = useFileNavigation(
	ref(initialFile),
	ref(props.files)
);

const {
	currentFile,
	relatedFiles,
	currentIndex,
	hasParent,
	canNavigatePrevious,
	canNavigateNext,
	navigateTo,
	navigateNext,
	navigatePrevious,
	diveInto,
	navigateToParent
} = navigation;

// Use virtual carousel composable
const { visibleSlides } = useVirtualCarousel(relatedFiles, currentIndex);

// Transcode navigation
const showTranscodeNav = ref(false);

function onSelectTranscode(transcode: UploadedFile, index: number) {
	if (currentFile.value && currentFile.value.transcodes) {
		diveInto(transcode, currentFile.value.transcodes);
	}
}

// File type helpers
function isVideo(file: UploadedFile): boolean {
	return !!file.mime?.startsWith("video");
}

function isImage(file: UploadedFile): boolean {
	return !!file.mime?.startsWith("image");
}

function isText(file: UploadedFile): boolean {
	return !!file.mime?.startsWith("text");
}

function getPreviewUrl(file: UploadedFile): string {
	return file.optimized?.url || (isImage(file) ? (file.blobUrl || file.url) : file.thumb?.url) || "";
}

function getThumbUrl(file: UploadedFile): string {
	if (file.thumb) {
		return file.thumb.url;
	} else if (isVideo(file)) {
		return `data:image/svg+xml;base64,${btoa(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>'
		)}`;
	} else {
		return getPreviewUrl(file) || "https://placehold.co/64x64?text=?";
	}
}

// Text file loading (lazy)
const fileTexts = shallowRef<{ [key: string]: string }>({});

async function loadFileText(file: UploadedFile) {
	if (fileTexts.value[file.id]) {
		return fileTexts.value[file.id];
	}

	try {
		const text = await fetch(file.url || "").then((res) => res.text());
		fileTexts.value = { ...fileTexts.value, [file.id]: text };
	} catch (e) {
		fileTexts.value = { ...fileTexts.value, [file.id]: "Error loading file content" };
	}
}

// Watch for text files in visible slides and load them
watch(
	visibleSlides,
	(slides) => {
		for (const slide of slides) {
			if (isText(slide.file) && !fileTexts.value[slide.file.id]) {
				loadFileText(slide.file);
			}
		}
	},
	{ immediate: true }
);

// Keyboard navigation
function onKeydown(e: KeyboardEvent) {
	if (e.key === "ArrowLeft") {
		e.preventDefault();
		navigatePrevious();
	} else if (e.key === "ArrowRight") {
		e.preventDefault();
		navigateNext();
	} else if (e.key === "Escape") {
		// Close is handled by QDialog
	}
}

onMounted(() => {
	window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
	window.removeEventListener("keydown", onKeydown);
});

// Watch currentIndex and scroll active thumbnail into view
watch(() => currentIndex.value, (newIndex) => {
	nextTick(() => {
		const thumbnails = thumbnailContainer.value?.querySelectorAll('.thumbnail');
		const activeThumbnail = thumbnails?.[newIndex] as HTMLElement;
		if (activeThumbnail && thumbnailContainer.value) {
			activeThumbnail.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'center'
			});
		}
	});
});
</script>

<style scoped lang="scss">
.thumbnail {
	transition: all 0.2s ease;
}
</style>
