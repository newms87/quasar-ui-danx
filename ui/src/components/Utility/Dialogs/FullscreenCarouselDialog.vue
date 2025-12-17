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
        <CarouselHeader
          v-if="currentFile"
          :filename="filename"
          :show-back-button="hasParent"
          :show-metadata-button="hasMetadata"
          :metadata-count="metadataKeyCount"
          :show-transcodes-button="!!(currentFile.transcodes && currentFile.transcodes.length > 0)"
          :transcodes-count="currentFile.transcodes?.length || 0"
          @back="navigateToParent"
          @metadata="showMetadataDialog = true"
          @transcodes="showTranscodeNav = true"
        />

        <!-- Carousel -->
        <div class="flex-grow relative">
          <div class="absolute inset-0">
            <div
              v-for="slide in visibleSlides"
              :key="slide.file.id"
              :class="[
                'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
                slide.isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              ]"
            >
              <FileRenderer
                :file="slide.file"
                :autoplay="slide.isActive"
              />
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

        <!-- Thumbnails -->
        <ThumbnailStrip
          :files="relatedFiles"
          :current-index="currentIndex"
          @navigate="navigateTo"
        />
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

      <!-- Metadata Dialog -->
      <FileMetadataDialog
        v-if="showMetadataDialog"
        :filename="filename"
        :mime-type="mimeType"
        :metadata="filteredMetadata"
        @close="showMetadataDialog = false"
      />
    </div>
  </QDialog>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/outline";
import { ref } from "vue";
import { useFileNavigation } from "../../../composables/useFileNavigation";
import { useFilePreview } from "../../../composables/useFilePreview";
import { useKeyboardNavigation } from "../../../composables/useKeyboardNavigation";
import { useVirtualCarousel } from "../../../composables/useVirtualCarousel";
import { XIcon as CloseIcon } from "../../../svg";
import { UploadedFile } from "../../../types";
import CarouselHeader from "../Files/CarouselHeader.vue";
import FileMetadataDialog from "../Files/FileMetadataDialog.vue";
import FileRenderer from "../Files/FileRenderer.vue";
import ThumbnailStrip from "../Files/ThumbnailStrip.vue";
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

// Keyboard navigation
useKeyboardNavigation({
	onPrevious: navigatePrevious,
	onNext: navigateNext
});

// Transcode navigation
const showTranscodeNav = ref(false);

function onSelectTranscode(transcode: UploadedFile, index: number) {
	if (currentFile.value && currentFile.value.transcodes) {
		diveInto(transcode, currentFile.value.transcodes);
	}
}

// Metadata navigation
const showMetadataDialog = ref(false);

// Use file preview composable for metadata
const {
	filename,
	mimeType,
	hasMetadata,
	metadataKeyCount,
	filteredMetadata
} = useFilePreview({ file: currentFile });
</script>
