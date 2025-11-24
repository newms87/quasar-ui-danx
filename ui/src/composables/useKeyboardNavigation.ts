import { onMounted, onUnmounted } from "vue";

export interface KeyboardNavigationCallbacks {
	onPrevious: () => void;
	onNext: () => void;
	onEscape?: () => void;
}

export interface UseKeyboardNavigationOptions {
	enabled?: boolean;
}

/**
 * Composable for keyboard navigation (arrow keys + escape)
 * Handles left/right arrow keys for navigation and optional escape key
 */
export function useKeyboardNavigation(
	callbacks: KeyboardNavigationCallbacks,
	options: UseKeyboardNavigationOptions = {}
) {
	const { enabled = true } = options;

	function onKeydown(e: KeyboardEvent) {
		if (!enabled) return;

		switch (e.key) {
			case "ArrowLeft":
				e.preventDefault();
				callbacks.onPrevious();
				break;
			case "ArrowRight":
				e.preventDefault();
				callbacks.onNext();
				break;
			case "Escape":
				if (callbacks.onEscape) {
					callbacks.onEscape();
				}
				break;
		}
	}

	onMounted(() => {
		if (enabled) {
			window.addEventListener("keydown", onKeydown);
		}
	});

	onUnmounted(() => {
		if (enabled) {
			window.removeEventListener("keydown", onKeydown);
		}
	});

	return {
		onKeydown
	};
}
