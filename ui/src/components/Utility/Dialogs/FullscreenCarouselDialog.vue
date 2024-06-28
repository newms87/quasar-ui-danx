<template>
  <QDialog
    :model-value="true"
    maximized
    @update:model-value="$emit('close')"
    @keyup.left="carousel.previous()"
    @keyup.right="carousel.next()"
  >
    <div class="absolute top-0 left-0 w-full h-full">
      <QCarousel
        ref="carousel"
        v-model="currentSlide"
        height="100%"
        swipeable
        animated
        :thumbnails="files.length > 1"
        infinite
        :class="cls['carousel']"
      >
        <QCarouselSlide
          v-for="file in files"
          :key="'file-' + file.id"
          :name="file.id"
          :img-src="getThumbUrl(file)"
          class="bg-black"
        >
          <div :class="cls['slide-image']">
            <template v-if="isVideo(file)">
              <video
                class="max-h-full w-full"
                controls
              >
                <source
                  :src="getPreviewUrl(file) + '#t=0.1'"
                  :type="file.mime"
                >
              </video>
            </template>
            <img
              v-else-if="getPreviewUrl(file)"
              :alt="file.filename"
              :src="getPreviewUrl(file)"
            >
            <div v-else>
              <h3 class="text-center mb-4">
                No Preview Available
              </h3>
              <a
                :href="file.url"
                target="_blank"
                class="text-base"
              >
                {{ file.url }}
              </a>
            </div>
          </div>

          <div class="text-base text-center py-5 bg-slate-800 opacity-70 text-slate-300 absolute-top hover:opacity-20 transition-all">
            {{ file.filename || file.name }}
          </div>
        </QCarouselSlide>
      </QCarousel>
      <a
        class="absolute top-0 right-0 text-white flex items-center justify-center w-16 h-16 hover:bg-slate-600 transition-all"
        @click="$emit('close')"
      >
        <CloseIcon
          class="w-8 h-8"
        />
      </a>
    </div>
  </QDialog>
</template>
<script setup>
import { ref } from "vue";
import { XIcon as CloseIcon } from "../../../svg";

defineEmits(["close"]);
const props = defineProps({
	files: {
		type: Array,
		default: () => []
	},
	defaultSlide: {
		type: String,
		default: ""
	}
});

const carousel = ref(null);
const currentSlide = ref(props.defaultSlide);
function isVideo(file) {
	return file.mime?.startsWith("video");
}

function isImage(file) {
	return file.mime?.startsWith("image");
}

function getPreviewUrl(file) {
	// Use the optimized URL first if available. If not, use the URL directly if its an image, otherwise use the thumb URL
	return file.optimized?.url || (isImage(file) ? (file.blobUrl || file.url) : file.thumb?.url);
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
		return getPreviewUrl(file);
	}
}
</script>
<style module="cls" lang="scss">
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
