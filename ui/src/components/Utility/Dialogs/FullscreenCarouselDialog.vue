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
          @metadata="onMetadataClick"
          @transcodes="showTranscodeNav = true"
        />

        <!-- Content Area with optional split panel -->
        <div class="flex-grow flex relative min-h-0">
          <!-- Carousel Section -->
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

          <!-- Split Metadata Panel -->
          <div
            v-if="metadataSplitMode && showMetadataDialog && hasMetadata"
            class="w-[40%] max-w-[600px] min-w-[300px] bg-slate-900 border-l border-slate-700 flex flex-col"
          >
            <div class="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
              <h3 class="text-slate-200 font-medium">Metadata</h3>
              <div class="flex items-center gap-1">
                <QBtn
                  flat
                  dense
                  round
                  size="sm"
                  class="text-slate-400 hover:text-white hover:bg-slate-700"
                  @click="undockToModal"
                >
                  <UndockIcon class="w-4 h-4" />
                  <QTooltip>Undock to modal</QTooltip>
                </QBtn>
                <QBtn
                  flat
                  dense
                  round
                  size="sm"
                  class="text-slate-400 hover:text-white hover:bg-slate-700"
                  @click="showMetadataDialog = false"
                >
                  <CloseIcon class="w-4 h-4" />
                  <QTooltip>Close</QTooltip>
                </QBtn>
              </div>
            </div>
            <div class="flex-1 min-h-0 p-4">
              <CodeViewer
                :model-value="filteredMetadata"
                :readonly="true"
                format="yaml"
                :show-format-toggle="true"
              />
            </div>
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

      <!-- Metadata Dialog (only in modal mode) -->
      <FileMetadataDialog
        v-if="showMetadataDialog && !metadataSplitMode"
        :filename="filename"
        :mime-type="mimeType"
        :metadata="filteredMetadata"
        :show-dock-button="true"
        @close="showMetadataDialog = false"
        @dock="dockToSplit"
      />
    </div>
  </QDialog>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/outline";
import { FaSolidWindowMaximize as UndockIcon } from "danx-icon";
import { ref } from "vue";
import { useFileNavigation } from "../../../composables/useFileNavigation";
import { useFilePreview } from "../../../composables/useFilePreview";
import { useKeyboardNavigation } from "../../../composables/useKeyboardNavigation";
import { useVirtualCarousel } from "../../../composables/useVirtualCarousel";
import { getItem, setItem } from "../../../helpers";
import { XIcon as CloseIcon } from "../../../svg";
import { UploadedFile } from "../../../types";
import { CodeViewer } from "../Code";
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
const METADATA_MODE_KEY = "danx-file-preview-metadata-mode";
const metadataSplitMode = ref(getItem(METADATA_MODE_KEY, false));

function onMetadataClick() {
	// Toggle metadata visibility - mode determines whether it shows as split or modal
	showMetadataDialog.value = !showMetadataDialog.value;
}

function dockToSplit() {
	// Switch from modal to split view
	metadataSplitMode.value = true;
	setItem(METADATA_MODE_KEY, true);
	// Keep showMetadataDialog true so it shows in split mode
}

function undockToModal() {
	// Switch from split to modal view
	metadataSplitMode.value = false;
	setItem(METADATA_MODE_KEY, false);
	// Keep showMetadataDialog true so it shows as modal
}

// Use file preview composable for metadata
const {
	filename,
	mimeType,
	hasMetadata,
	metadataKeyCount,
	filteredMetadata
} = useFilePreview({ file: currentFile });
</script>
