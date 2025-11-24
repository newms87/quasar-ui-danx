import { computed, Ref, shallowRef, watch } from "vue";
import { UploadedFile, VirtualCarouselSlide } from "../types";

const BUFFER_SIZE = 2; // Render current slide ± 2 slides

/**
 * Composable for managing virtual carousel rendering
 * Only renders slides within buffer window for performance with large file sets
 */
export function useVirtualCarousel(
	files: Ref<UploadedFile[]>,
	currentIndex: Ref<number>
) {
	// Shallow ref to avoid deep reactivity for performance
	const visibleSlides = shallowRef<VirtualCarouselSlide[]>([]);

	/**
	 * Calculate which slides should be visible based on current index
	 */
	const visibleIndices = computed(() => {
		const start = Math.max(0, currentIndex.value - BUFFER_SIZE);
		const end = Math.min(files.value.length - 1, currentIndex.value + BUFFER_SIZE);
		const indices: number[] = [];

		for (let i = start; i <= end; i++) {
			indices.push(i);
		}

		return indices;
	});

	/**
	 * Update visible slides based on current index
	 */
	function updateVisibleSlides() {
		const indices = visibleIndices.value;
		const newSlides: VirtualCarouselSlide[] = [];

		for (const index of indices) {
			if (index >= 0 && index < files.value.length) {
				newSlides.push({
					file: files.value[index],
					index,
					isActive: index === currentIndex.value,
					isVisible: true
				});
			}
		}

		visibleSlides.value = newSlides;
	}

	/**
	 * Check if a slide at given index is visible
	 */
	function isSlideVisible(index: number): boolean {
		return visibleIndices.value.includes(index);
	}

	/**
	 * Get slide by index (returns null if not visible)
	 */
	function getSlide(index: number): VirtualCarouselSlide | null {
		return visibleSlides.value.find(s => s.index === index) || null;
	}

	/**
	 * Get slides that should be preloaded (visible + buffer)
	 */
	const preloadIndices = computed(() => {
		const start = Math.max(0, currentIndex.value - BUFFER_SIZE - 1);
		const end = Math.min(files.value.length - 1, currentIndex.value + BUFFER_SIZE + 1);
		const indices: number[] = [];

		for (let i = start; i <= end; i++) {
			indices.push(i);
		}

		return indices;
	});

	// Watch for changes to update visible slides
	watch([currentIndex, files], updateVisibleSlides, { immediate: true });

	return {
		visibleSlides,
		visibleIndices,
		preloadIndices,
		isSlideVisible,
		getSlide,
		updateVisibleSlides
	};
}
