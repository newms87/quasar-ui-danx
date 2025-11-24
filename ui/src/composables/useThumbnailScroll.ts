import { nextTick, Ref, watch } from "vue";

export interface UseThumbnailScrollOptions {
	/**
	 * Container element that holds the thumbnails
	 */
	containerRef: Ref<HTMLElement | null>;

	/**
	 * Current active index
	 */
	currentIndex: Ref<number>;

	/**
	 * Optional CSS selector for thumbnail elements (defaults to '.thumbnail')
	 */
	thumbnailSelector?: string;
}

/**
 * Composable for auto-scrolling thumbnails into view
 * Watches the current index and scrolls the active thumbnail into the visible area
 */
export function useThumbnailScroll(options: UseThumbnailScrollOptions) {
	const { containerRef, currentIndex, thumbnailSelector = ".thumbnail" } = options;

	watch(currentIndex, (newIndex) => {
		nextTick(() => {
			const thumbnails = containerRef.value?.querySelectorAll(thumbnailSelector);
			const activeThumbnail = thumbnails?.[newIndex] as HTMLElement;

			if (activeThumbnail && containerRef.value) {
				activeThumbnail.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "center"
				});
			}
		});
	});

	return {};
}
