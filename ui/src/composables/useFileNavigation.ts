import { computed, ref, Ref } from "vue";
import { FileNavigationParent, FileNavigationState, UploadedFile } from "../types";

/**
 * Composable for managing file navigation state with parent stack support
 * Enables diving into related files (like transcodes) and navigating back to parent
 */
export function useFileNavigation(initialFile: Ref<UploadedFile | null>, initialRelatedFiles: Ref<UploadedFile[]> = ref([])) {
	// Current navigation state
	const currentFile = ref<UploadedFile | null>(initialFile.value);
	const relatedFiles = ref<UploadedFile[]>(initialRelatedFiles.value);
	const parentStack = ref<FileNavigationParent[]>([]);
	const currentIndex = ref(
		initialFile.value
			? Math.max(0, initialRelatedFiles.value.findIndex(f => f.id === initialFile.value!.id))
			: 0
	);

	// Computed properties
	const hasParent = computed(() => parentStack.value.length > 0);
	const canNavigatePrevious = computed(() => currentIndex.value > 0);
	const canNavigateNext = computed(() => currentIndex.value < relatedFiles.value.length - 1);
	const totalFiles = computed(() => relatedFiles.value.length);

	/**
	 * Navigate to a specific file by index
	 */
	function navigateTo(index: number) {
		if (index >= 0 && index < relatedFiles.value.length) {
			currentIndex.value = index;
			currentFile.value = relatedFiles.value[index];
		}
	}

	/**
	 * Navigate to the next file
	 */
	function navigateNext() {
		if (canNavigateNext.value) {
			navigateTo(currentIndex.value + 1);
		}
	}

	/**
	 * Navigate to the previous file
	 */
	function navigatePrevious() {
		if (canNavigatePrevious.value) {
			navigateTo(currentIndex.value - 1);
		}
	}

	/**
	 * Dive into a related file (e.g., transcodes)
	 * Pushes current state onto parent stack
	 */
	function diveInto(file: UploadedFile, newRelatedFiles: UploadedFile[]) {
		// Push current state onto parent stack
		parentStack.value.push({
			file: currentFile.value!,
			relatedFiles: relatedFiles.value,
			index: currentIndex.value
		});

		// Update to new state
		currentFile.value = file;
		relatedFiles.value = newRelatedFiles;
		currentIndex.value = newRelatedFiles.findIndex(f => f.id === file.id);

		// Fallback to 0 if not found
		if (currentIndex.value === -1) {
			currentIndex.value = 0;
		}
	}

	/**
	 * Navigate back to parent file
	 * Pops state from parent stack
	 */
	function navigateToParent() {
		if (hasParent.value) {
			const parent = parentStack.value.pop()!;
			currentFile.value = parent.file;
			relatedFiles.value = parent.relatedFiles;
			currentIndex.value = parent.index;
		}
	}

	/**
	 * Reset navigation state
	 */
	function reset(file: UploadedFile | null = null, files: UploadedFile[] = []) {
		currentFile.value = file;
		relatedFiles.value = files;
		parentStack.value = [];
		currentIndex.value = 0;
	}

	/**
	 * Get navigation state snapshot
	 */
	function getState(): FileNavigationState {
		return {
			currentFile: currentFile.value,
			relatedFiles: relatedFiles.value,
			parentStack: [...parentStack.value],
			currentIndex: currentIndex.value
		};
	}

	return {
		// State
		currentFile,
		relatedFiles,
		parentStack,
		currentIndex,

		// Computed
		hasParent,
		canNavigatePrevious,
		canNavigateNext,
		totalFiles,

		// Methods
		navigateTo,
		navigateNext,
		navigatePrevious,
		diveInto,
		navigateToParent,
		reset,
		getState
	};
}
