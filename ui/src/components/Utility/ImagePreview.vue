<template>
  <div class="relative flex justify-center bg-neutral-plus-7" :class="{'rounded-2xl': !square}">
    <template v-if="computedImage">
      <div
          class="grow h-full overflow-hidden"
          :class="{'rounded-2xl': !square}"
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
            />
          </video>
          <button class="play-button text-blue-lighter">
            <PlayIcon class="w-16" />
          </button>
        </div>
        <div
            v-if="isPdf && !thumbUrl"
            class="flex items-center justify-center h-full"
        >
          <PdfIcon class="w-24" />
        </div>
        <q-img
            v-else
            fit="scale-down"
            class="non-selectable max-h-full max-w-full h-full"
            :src="(thumbUrl || previewUrl) + '#t=0.1'"
            preload="auto"
            data-testid="previewed-image"
            data-dusk="previewed-image"
        />
      </div>
      <div
          v-if="$slots['action-button']"
          class="action-button"
      >
        <slot name="action-button" />
      </div>
      <div
          v-if="image && image.progress !== undefined"
          class="absolute-bottom w-full"
      >
        <q-linear-progress
            :value="image.progress"
            size="15px"
            color="green-base"
            stripe
        />
      </div>
    </template>
    <template v-else>
      <slot name="missing">
        <component
            :is="missingIcon"
            class="w-full h-full p-2 text-gray-medium"
        />
      </slot>
    </template>

    <div class="absolute top-1 right-1 flex items-center justify-between space-x-1">
      <q-btn
          v-if="downloadable && computedImage?.url"
          size="sm"
          class="!p-1 opacity-70 hover:opacity-100"
          :class="downloadButtonClass"
          @click.stop="download(computedImage.url)"
      >
        <DownloadIcon class="w-4 h-5" />
        </q-btn>

        <q-btn
            v-if="removable"
            size="sm"
            class="bg-red-dark text-white !p-1 opacity-50 hover:opacity-100"
            @click.stop="onRemove"
        >
          <div v-if="isConfirmingRemove" class="font-bold text-[1rem] leading-[1.2rem]">?</div>
          <RemoveIcon v-else class="w-3" />
          </q-btn>
    </div>

    <FullScreenCarouselDialog
        v-if="showPreview && !disabled"
        :files="relatedFiles || [computedImage]"
        :default-slide="computedImage.id"
        @close="showPreview = false"
    />
  </div>
</template>

<script setup>
import { DownloadIcon, PlayIcon } from '@heroicons/vue/outline';
import { FullScreenCarouselDialog } from '@ui/components';
import { download } from '@ui/helpers';
import { ImageIcon, PdfIcon, TrashIcon as RemoveIcon } from '@ui/svg';
import { computed, ref } from 'vue';

const emit = defineEmits(['remove']);
const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  image: {
    type: Object,
    default: null
  },
  relatedFiles: {
    type: Array,
    default: null
  },
  missingIcon: {
    type: [Function, Object],
    default: ImageIcon
  },
  downloadButtonClass: {
    type: String,
    default: 'bg-blue-base text-white'
  },
  downloadable: Boolean,
  removable: Boolean,
  disabled: Boolean,
  square: Boolean
});

const showPreview = ref(false);
const computedImage = computed(() => {
  if (props.image) {
    return props.image;
  } else if (props.src) {
    return {
      id: props.src,
      url: props.src,
      type: 'image/' + props.src.split('.').pop().toLowerCase()
    };
  }
  return null;
});
const mimeType = computed(
    () => computedImage.value.type || computedImage.value.mime
);
const isVideo = computed(() => mimeType.value.match(/^video\//));
const isPdf = computed(() => mimeType.value.match(/^application\/pdf/));
const previewUrl = computed(
    () => computedImage.value.transcodes?.compress?.url || computedImage.value.blobUrl || computedImage.value.url
);
const thumbUrl = computed(() => {
  return computedImage.value.transcodes?.thumb?.url;
});

const isConfirmingRemove = ref(false);
function onRemove() {
  if (!isConfirmingRemove.value) {
    isConfirmingRemove.value = true;
    setTimeout(() => {
      isConfirmingRemove.value = false;
    }, 2000);
  } else {
    emit('remove');
  }
}
</script>

<style scoped lang="scss">
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
}
</style>
