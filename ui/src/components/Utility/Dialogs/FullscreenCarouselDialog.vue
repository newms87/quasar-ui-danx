<template>
  <q-dialog
      :model-value="true"
      maximized
      @update:model-value="$emit('close')"
      @keyup.left="carousel.previous()"
      @keyup.right="carousel.next()"
  >
    <div class="absolute top-0 left-0 w-full h-full">
      <q-carousel
          ref="carousel"
          v-model="currentSlide"
          height="100%"
          swipeable
          animated
          :thumbnails="files.length > 1"
          infinite
          class="carousel"
      >
        <q-carousel-slide
            v-for="file in files"
            :key="'file-' + file.id"
            :name="file.id"
            :img-src="getThumbUrl(file)"
        >
          <div class="slide-image">
            <template v-if="isVideo(file)">
              <video
                  class="max-h-full w-full"
                  controls
              >
                <source
                    :src="file.url + '#t=0.1'"
                    :type="file.mime"
                />
              </video>
            </template>
            <img v-else :alt="file.filename" :src="file.url" />
          </div>
        </q-carousel-slide>
      </q-carousel>
      <CloseIcon
          class="absolute top-4 right-4 cursor-pointer text-white w-8 h-8"
          @click="$emit('close')"
      />
    </div>
  </q-dialog>
</template>
<script setup>
import { ref } from 'vue';
import { XIcon as CloseIcon } from '../../../svg';

defineEmits(['close']);
const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  defaultSlide: {
    type: String,
    default: ''
  }
});

const carousel = ref(null);
const currentSlide = ref(props.defaultSlide);
function isVideo(file) {
  return file.mime?.startsWith('video');
}
function getThumbUrl(file) {
  if (file.thumb) {
    return file.thumb.url;
  } else if (isVideo(file)) {
    // Base64 encode a PlayIcon for the placeholder image
    return `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M0 0h24v24H0z" fill="none"/><path d="M8 5v14l11-7z"/></svg>`
    )}`;
  } else {
    return file.url;
  }
}
</script>
<style scoped lang="scss">
.slide-image {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }
}

.carousel {
  :deep(.q-carousel__navigation--bottom) {
    position: relative;
    bottom: 8em;
  }
}
</style>
