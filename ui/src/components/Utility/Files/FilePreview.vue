<template>
  <div
    class="relative flex justify-center bg-gray-100 overflow-hidden"
    :class="{'rounded-2xl': !square}"
  >
    <template v-if="computedImage">
      <div
        class="grow h-full"
        @click="showPreview = true"
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
          <PdfIcon
            v-if="isPdf"
            class="w-24"
          />
          <TextFileIcon
            v-else
            class="w-24"
          />
        </div>
      </div>
      <div
        v-if="$slots['action-button']"
        :class="cls['action-button']"
      >
        <slot name="action-button" />
      </div>
      <div
        v-if="file && file.progress !== undefined"
        class="absolute-bottom w-full"
      >
        <QLinearProgress
          :value="file.progress"
          size="15px"
          color="green-600"
          stripe
        />
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

    <div class="absolute top-1 right-1 flex items-center justify-between space-x-1">
      <QBtn
        v-if="downloadable && computedImage?.url"
        size="sm"
        class="dx-file-preview-download py-1 px-2 opacity-70 hover:opacity-100"
        :class="downloadButtonClass"
        @click.stop="download(computedImage.url)"
      >
        <DownloadIcon class="w-4 h-5" />
      </QBtn>

      <QBtn
        v-if="removable"
        size="sm"
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

    <FullScreenCarouselDialog
      v-if="showPreview && !disabled"
      :files="relatedFiles || [computedImage]"
      :default-slide="relatedFiles ? relatedFiles[0].id : (computedImage?.id || '')"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { DocumentTextIcon as TextFileIcon, DownloadIcon, PlayIcon } from "@heroicons/vue/outline";
import { computed, ComputedRef, ref } from "vue";
import { download } from "../../../helpers";
import { ImageIcon, PdfIcon, TrashIcon as RemoveIcon } from "../../../svg";
import { UploadedFile } from "../../../types";
import { FullScreenCarouselDialog } from "../Dialogs";

export interface FilePreviewProps {
	src?: string;
	file?: UploadedFile;
	relatedFiles?: UploadedFile[];
	missingIcon?: any;
	downloadButtonClass?: string;
	imageFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
	downloadable?: boolean;
	removable?: boolean;
	disabled?: boolean;
	square?: boolean;
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
	square: false
});

const showPreview = ref(false);
const computedImage: ComputedRef<UploadedFile | null> = computed(() => {
	if (props.file) {
		return props.file;
	} else if (props.src) {
		return {
			id: props.src,
			url: props.src,
			type: "image/" + props.src.split(".").pop()?.toLowerCase(),
			name: "",
			size: 0
		};
	}
	return null;
});
const mimeType = computed(
	() => computedImage.value?.type || computedImage.value?.mime || ""
);
const isImage = computed(() => !!mimeType.value.match(/^image\//));
const isVideo = computed(() => !!mimeType.value.match(/^video\//));
const isPdf = computed(() => !!mimeType.value.match(/^application\/pdf/));
const previewUrl = computed(
	() => computedImage.value?.optimized?.url || computedImage.value?.blobUrl || computedImage.value?.url
);
const thumbUrl = computed(() => {
	return computedImage.value?.thumb?.url;
});
const isPreviewable = computed(() => {
	return !!thumbUrl.value || isVideo.value || isImage.value;
});
const isConfirmingRemove = ref(false);
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
