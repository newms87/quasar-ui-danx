<template>
  <div
    class="group relative flex justify-center bg-gray-100 overflow-hidden"
    :class="{'rounded-2xl': !square}"
  >
    <template v-if="computedImage">
      <div
        class="grow h-full"
        @click="onShowPreview"
      >
        <div
          v-if="isVideo"
          class="relative max-h-full max-w-full w-full flex justify-center"
        >
          <video
            class="max-h-full"
            preload="auto"
          >
            <source
              :src="previewUrl + '#t=0.1'"
              :type="mimeType"
            >
          </video>
          <button :class="cls['play-button']">
            <PlayIcon class="w-16" />
          </button>
        </div>
        <QImg
          v-if="thumbUrl || isPreviewable"
          :fit="imageFit"
          class="non-selectable max-h-full max-w-full h-full"
          :src="(thumbUrl || previewUrl) + '#t=0.1'"
          preload="auto"
          data-testid="previewed-image"
        />
        <div
          v-else
          class="flex items-center justify-center h-full"
        >
          <GoogleDocsIcon
            v-if="isExternalLink"
            class="h-3/4"
          />
          <PdfIcon
            v-else-if="isPdf"
            class="w-3/4"
          />
          <TextFileIcon
            v-else
            class="w-3/4"
          />
          <template v-if="filename">
            <div
              v-if="showFilename"
              class="text-[.7rem] bg-slate-900 text-slate-300 opacity-80 h-[2.25rem] py-.5 px-1 absolute-bottom"
            >
              {{ filename }}
            </div>
            <QTooltip v-else>
              {{ filename }}
            </QTooltip>
          </template>
        </div>
      </div>
      <div
        v-if="$slots['action-button']"
        :class="cls['action-button']"
      >
        <slot name="action-button" />
      </div>
      <div
        v-if="isUploading || transcodingStatus"
        class="absolute-bottom w-full bg-slate-800"
      >
        <QLinearProgress
          :key="'progress-' + isUploading ? 'uploading' : 'transcoding'"
          :value="isUploading ? (file?.progress || 0) : ((transcodingStatus?.progress || 0) / 100)"
          size="36px"
          :color="isUploading ? 'green-800' : 'blue-800'"
          :animation-speed="transcodingStatus?.estimate_ms || 3000"
          stripe
        >
          <div class="absolute-full flex items-center flex-nowrap text-[.7rem] text-slate-200 justify-start px-1">
            <QSpinnerPie
              class="mr-2 text-slate-50 ml-1 flex-shrink-0"
              :size="btnSize === 'xs' ? 10 : 20"
            />
            <template v-if="statusMessage">
              <div class="whitespace-nowrap overflow-hidden ellipsis">
                {{ statusMessage }}
              </div>
              <QTooltip class="text-sm">
                {{ statusMessage }}
              </QTooltip>
            </template>
          </div>
        </QLinearProgress>
      </div>
    </template>
    <template v-else>
      <slot name="missing">
        <component
          :is="missingIcon"
          class="w-full h-full p-2 text-gray-300"
        />
      </slot>
    </template>

    <div class="absolute top-1 right-1 flex items-center flex-nowrap justify-between space-x-1 transition-all opacity-0 group-hover:opacity-100">
      <QBtn
        v-if="hasMetadata"
        :size="btnSize"
        class="dx-file-preview-metadata bg-purple-700 text-white opacity-70 hover:opacity-100 py-1 px-2 relative"
        @click.stop="showMetadataDialog = true"
      >
        <div class="flex items-center flex-nowrap gap-1">
          <MetaIcon class="w-4 h-4" />
          <QBadge
            class="bg-purple-900 text-purple-200"
            :label="metadataKeyCount"
          />
        </div>
        <QTooltip>View Metadata</QTooltip>
      </QBtn>

      <QBtn
        v-if="hasTranscodes"
        :size="btnSize"
        class="dx-file-preview-transcodes bg-purple-700 text-white opacity-70 hover:opacity-100 py-1 px-2 relative"
        @click.stop="showPreview = true"
      >
        <div class="flex items-center flex-nowrap gap-1">
          <FilmIcon class="w-4 h-5" />
          <QBadge
            class="bg-purple-900 text-purple-200"
            :label="file?.transcodes?.length || 0"
          />
        </div>
        <QTooltip>View Transcodes</QTooltip>
      </QBtn>

      <QBtn
        v-if="downloadable && computedImage?.url"
        :size="btnSize"
        class="dx-file-preview-download py-1 px-2 opacity-70 hover:opacity-100"
        :class="downloadButtonClass"
        @click.stop="download(computedImage.url)"
      >
        <DownloadIcon class="w-4 h-5" />
      </QBtn>

      <QBtn
        v-if="removable"
        :size="btnSize"
        class="dx-file-preview-remove bg-red-900 text-white opacity-50 hover:opacity-100 py-1 px-2"
        @click.stop="onRemove"
      >
        <div
          v-if="isConfirmingRemove"
          class="font-bold text-[1rem] leading-[1.2rem]"
        >
          ?
        </div>
        <RemoveIcon
          v-else
          class="w-3"
        />
      </QBtn>
    </div>

    <FileMetadataDialog
      v-if="showMetadataDialog"
      :filename="filename"
      :mime-type="mimeType"
      :metadata="filteredMetadata"
      @close="showMetadataDialog = false"
    />

    <FullScreenCarouselDialog
      v-if="showPreview && !disabled && previewableFiles"
      :files="previewableFiles"
      :default-slide="previewableFiles[0]?.id || ''"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { DocumentTextIcon as TextFileIcon, DownloadIcon, FilmIcon, PlayIcon } from "@heroicons/vue/outline";
import { FaSolidBarcode as MetaIcon } from "danx-icon";
import { computed, ref, toRef } from "vue";
import { useFilePreview } from "../../../composables/useFilePreview";
import { useTranscodeLoader } from "../../../composables/useTranscodeLoader";
import { download, uniqueBy } from "../../../helpers";
import { isExternalLinkFile } from "../../../helpers/filePreviewHelpers";
import { GoogleDocsIcon, ImageIcon, PdfIcon, TrashIcon as RemoveIcon } from "../../../svg";
import { UploadedFile } from "../../../types";
import { FullScreenCarouselDialog } from "../Dialogs";
import FileMetadataDialog from "./FileMetadataDialog.vue";

export interface FilePreviewProps {
  src?: string;
  file?: UploadedFile;
  relatedFiles?: UploadedFile[];
  missingIcon?: any;
  showFilename?: boolean;
  downloadButtonClass?: string;
  imageFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  downloadable?: boolean;
  removable?: boolean;
  disabled?: boolean;
  square?: boolean;
  btnSize?: "xs" | "sm" | "md" | "lg";
}

const emit = defineEmits(["remove"]);

const props = withDefaults(defineProps<FilePreviewProps>(), {
  src: "",
  file: null,
  relatedFiles: null,
  missingIcon: ImageIcon,
  downloadButtonClass: "bg-blue-600 text-white",
  imageFit: "cover",
  downloadable: false,
  removable: false,
  disabled: false,
  square: false,
  btnSize: "sm"
});

// Use composables for file preview logic
const fileRef = toRef(props, "file");
const srcRef = toRef(props, "src");

const {
  computedImage,
  filename,
  mimeType,
  isVideo,
  isPdf,
  isExternalLink,
  previewUrl,
  thumbUrl,
  isPreviewable,
  hasMetadata,
  metadataKeyCount,
  filteredMetadata,
  hasTranscodes,
  transcodingStatus
} = useFilePreview({ file: fileRef, src: srcRef });

// Load transcodes automatically
useTranscodeLoader({ file: fileRef });

// Local state
const showPreview = ref(false);
const showMetadataDialog = ref(false);
const isConfirmingRemove = ref(false);

// Computed
const isUploading = computed(() => props.file && props.file?.progress !== undefined);
const statusMessage = computed(() => isUploading.value ? "Uploading..." : transcodingStatus.value?.message);

const previewableFiles = computed(() => {
  return props.relatedFiles?.length > 0
    ? uniqueBy([computedImage.value, ...props.relatedFiles], filesHaveSameUrl)
    : [computedImage.value];
});

// Helpers
function filesHaveSameUrl(a: UploadedFile, b: UploadedFile) {
  return a.id === b.id ||
    [b.url, b.optimized?.url, b.thumb?.url].includes(a.url) ||
    [a.url, a.optimized?.url, a.thumb?.url].includes(b.url);
}

function onRemove() {
  if (!isConfirmingRemove.value) {
    isConfirmingRemove.value = true;
    setTimeout(() => {
      isConfirmingRemove.value = false;
    }, 2000);
  } else {
    emit("remove");
  }
}

function onShowPreview() {
  if (computedImage.value && isExternalLinkFile(computedImage.value)) {
    window.open(computedImage.value.url, "_blank");
    return;
  }
  showPreview.value = true;
}
</script>

<style module="cls" lang="scss">
.action-button {
  position: absolute;
  bottom: 1.5em;
  right: 1em;
  z-index: 1;
}

.play-button {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
  @apply text-blue-200;
}
</style>
