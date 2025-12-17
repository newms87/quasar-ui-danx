import { onMounted, Ref, ref, watch } from "vue";
import { danxOptions } from "../config";
import { UploadedFile } from "../types";

export interface UseTranscodeLoaderOptions {
	file: Ref<UploadedFile | null | undefined>;
}

export interface UseTranscodeLoaderReturn {
	isLoading: Ref<boolean>;
	loadTranscodes: () => Promise<void>;
}

/**
 * Composable for loading transcodes for a file
 * Automatically loads transcodes on mount and when the file changes
 */
export function useTranscodeLoader(options: UseTranscodeLoaderOptions): UseTranscodeLoaderReturn {
	const { file } = options;
	const isLoading = ref(false);

	function shouldLoadTranscodes(): boolean {
		if (!file.value?.id) return false;
		if (isLoading.value) return false;
		if (!danxOptions.value.fileUpload?.refreshFile) return false;

		// Only load if transcodes is explicitly null, undefined, or an empty array
		const transcodes = file.value.transcodes;
		return transcodes === null || transcodes === undefined || (Array.isArray(transcodes) && transcodes.length === 0);
	}

	async function loadTranscodes() {
		if (!shouldLoadTranscodes()) return;

		isLoading.value = true;

		try {
			const refreshFile = danxOptions.value.fileUpload?.refreshFile;
			if (refreshFile && file.value?.id) {
				const refreshedFile = await refreshFile(file.value.id);

				// Update the file object with the loaded transcodes
				if (refreshedFile.transcodes && file.value) {
					file.value.transcodes = refreshedFile.transcodes;
				}
			}
		} catch (error) {
			console.error("Failed to load transcodes:", error);
		} finally {
			isLoading.value = false;
		}
	}

	// Load transcodes when component mounts
	onMounted(() => {
		loadTranscodes();
	});

	// Watch for file changes and reload transcodes if needed
	watch(() => file.value?.id, () => {
		loadTranscodes();
	});

	return {
		isLoading,
		loadTranscodes
	};
}
