<template>
  <div class="virtual-carousel relative w-full h-full">
    <!-- Carousel Container -->
    <div
      ref="carouselContainer"
      class="carousel-slides-container w-full h-full flex items-center justify-center relative overflow-hidden"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Render only visible slides -->
      <transition-group
        name="slide"
        tag="div"
        class="w-full h-full relative"
      >
        <div
          v-for="slide in visibleSlides"
          :key="slide.file.id"
          :class="[
            'carousel-slide absolute inset-0 flex items-center justify-center',
            { 'active': slide.isActive, 'inactive': !slide.isActive }
          ]"
        >
          <slot
            name="slide"
            :file="slide.file"
            :index="slide.index"
            :is-active="slide.isActive"
          >
            <!-- Default slide content -->
            <div class="flex items-center justify-center w-full h-full">
              <img
                v-if="isImage(slide.file)"
                :src="getPreviewUrl(slide.file)"
                :alt="slide.file.filename || slide.file.name"
                class="max-h-full max-w-full object-contain"
              >
              <video
                v-else-if="isVideo(slide.file)"
                class="max-h-full max-w-full"
                controls
              >
                <source
                  :src="getPreviewUrl(slide.file)"
                  :type="slide.file.mime"
                >
              </video>
              <div
                v-else
                class="text-slate-300"
              >
                No preview available
              </div>
            </div>
          </slot>
        </div>
      </transition-group>
    </div>

    <!-- Navigation Arrows -->
    <div
      v-if="canNavigatePrevious"
      class="absolute left-2 top-1/2 -translate-y-1/2 z-10"
    >
      <QBtn
        round
        size="lg"
        class="bg-slate-800 text-white opacity-70 hover:opacity-100"
        @click="onPrevious"
      >
        <ChevronLeftIcon class="w-6" />
      </QBtn>
    </div>
    <div
      v-if="canNavigateNext"
      class="absolute right-2 top-1/2 -translate-y-1/2 z-10"
    >
      <QBtn
        round
        size="lg"
        class="bg-slate-800 text-white opacity-70 hover:opacity-100"
        @click="onNext"
      >
        <ChevronRightIcon class="w-6" />
      </QBtn>
    </div>

    <!-- Thumbnail Navigation (if enabled and multiple files) -->
    <div
      v-if="showThumbnails && files.length > 1"
      class="absolute bottom-0 left-0 right-0 bg-slate-900 bg-opacity-80 p-2"
    >
      <div
        ref="thumbnailContainer"
        class="flex items-center justify-start gap-2 overflow-x-auto overflow-y-hidden px-4"
      >
        <div
          v-for="(file, index) in files"
          :key="file.id"
          :ref="el => setThumbnailRef(el, index)"
          :class="[
            'thumbnail cursor-pointer rounded border-2 transition-all',
            index === currentIndex ? 'border-blue-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
          ]"
          @click="onThumbnailClick(index)"
        >
          <img
            :src="getThumbUrl(file)"
            :alt="file.filename || file.name"
            class="w-16 h-16 object-cover rounded"
          >
        </div>
      </div>
    </div>

    <!-- Slide Counter -->
    <div
      v-if="showCounter && files.length > 1"
      class="absolute top-2 right-2 bg-slate-900 bg-opacity-70 text-slate-200 px-3 py-1 rounded-full text-sm"
    >
      {{ currentIndex + 1 }} / {{ files.length }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/outline";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useVirtualCarousel } from "../../../composables/useVirtualCarousel";
import { UploadedFile } from "../../../types";

interface VirtualCarouselProps {
	files: UploadedFile[];
	modelValue?: number;
	showThumbnails?: boolean;
	showCounter?: boolean;
	enableKeyboard?: boolean;
	enableSwipe?: boolean;
}

const emit = defineEmits<{
	'update:modelValue': [index: number];
	'change': [file: UploadedFile, index: number];
}>();

const props = withDefaults(defineProps<VirtualCarouselProps>(), {
	modelValue: 0,
	showThumbnails: true,
	showCounter: true,
	enableKeyboard: true,
	enableSwipe: true
});

const carouselContainer = ref<HTMLElement | null>(null);
const thumbnailContainer = ref<HTMLElement | null>(null);
const thumbnailRefs = ref<(HTMLElement | null)[]>([]);
const currentIndex = ref(props.modelValue);
const files = computed(() => props.files);

// Set thumbnail ref
function setThumbnailRef(el: HTMLElement | null, index: number) {
	if (el) {
		thumbnailRefs.value[index] = el;
	}
}

// Use virtual carousel composable
const {
	visibleSlides,
	isSlideVisible
} = useVirtualCarousel(files, currentIndex);

// Navigation
const canNavigatePrevious = computed(() => currentIndex.value > 0);
const canNavigateNext = computed(() => currentIndex.value < props.files.length - 1);

function navigateTo(index: number) {
	if (index >= 0 && index < props.files.length) {
		currentIndex.value = index;
		emit('update:modelValue', index);
		emit('change', props.files[index], index);
	}
}

function onPrevious() {
	if (canNavigatePrevious.value) {
		navigateTo(currentIndex.value - 1);
	}
}

function onNext() {
	if (canNavigateNext.value) {
		navigateTo(currentIndex.value + 1);
	}
}

function onThumbnailClick(index: number) {
	navigateTo(index);
}

// Keyboard navigation
function onKeydown(e: KeyboardEvent) {
	if (!props.enableKeyboard) return;

	if (e.key === 'ArrowLeft') {
		e.preventDefault();
		onPrevious();
	} else if (e.key === 'ArrowRight') {
		e.preventDefault();
		onNext();
	}
}

// Touch/swipe support
const touchStart = ref<{ x: number; y: number } | null>(null);
const SWIPE_THRESHOLD = 50;

function onTouchStart(e: TouchEvent) {
	if (!props.enableSwipe) return;
	touchStart.value = {
		x: e.touches[0].clientX,
		y: e.touches[0].clientY
	};
}

function onTouchMove(e: TouchEvent) {
	if (!props.enableSwipe || !touchStart.value) return;

	const deltaX = Math.abs(e.touches[0].clientX - touchStart.value.x);
	const deltaY = Math.abs(e.touches[0].clientY - touchStart.value.y);

	// Prevent vertical scroll if horizontal swipe detected
	if (deltaX > deltaY) {
		e.preventDefault();
	}
}

function onTouchEnd(e: TouchEvent) {
	if (!props.enableSwipe || !touchStart.value) return;

	const deltaX = e.changedTouches[0].clientX - touchStart.value.x;

	if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
		if (deltaX > 0) {
			onPrevious();
		} else {
			onNext();
		}
	}

	touchStart.value = null;
}

// File type helpers
function isImage(file: UploadedFile): boolean {
	return !!file.mime?.startsWith('image') || !!file.type?.startsWith('image');
}

function isVideo(file: UploadedFile): boolean {
	return !!file.mime?.startsWith('video') || !!file.type?.startsWith('video');
}

function getPreviewUrl(file: UploadedFile): string {
	return file.optimized?.url || file.blobUrl || file.url || '';
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
	return getPreviewUrl(file) || 'https://placehold.co/64x64?text=?';
}

// Lifecycle
onMounted(() => {
	if (props.enableKeyboard) {
		window.addEventListener('keydown', onKeydown);
	}
});

onUnmounted(() => {
	if (props.enableKeyboard) {
		window.removeEventListener('keydown', onKeydown);
	}
});

// Watch for external changes to modelValue
watch(() => props.modelValue, (newIndex) => {
	if (newIndex !== currentIndex.value) {
		currentIndex.value = newIndex;
	}
});

// Watch currentIndex and scroll active thumbnail into view
watch(() => currentIndex.value, (newIndex) => {
	nextTick(() => {
		const activeThumbnail = thumbnailRefs.value[newIndex];
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
.virtual-carousel {
	.carousel-slide {
		transition: opacity 0.3s ease;

		&.inactive {
			opacity: 0;
			pointer-events: none;
		}

		&.active {
			opacity: 1;
			pointer-events: auto;
		}
	}

	.thumbnail {
		flex-shrink: 0;
	}
}

// Slide transitions
.slide-enter-active,
.slide-leave-active {
	transition: opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
	opacity: 0;
}
</style>
