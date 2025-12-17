import { computed, ComputedRef, Ref } from "vue";
import * as fileHelpers from "../helpers/filePreviewHelpers";
import { getMimeType, getOptimizedUrl, isExternalLinkFile } from "../helpers/filePreviewHelpers";
import { UploadedFile } from "../types";

export interface FileTranscode {
	status: "Complete" | "Pending" | "In Progress" | "Timeout";
	progress: number;
	estimate_ms: number;
	started_at: string;
	completed_at: string;
	message?: string;
}

export interface UseFilePreviewOptions {
	file: Ref<UploadedFile | null | undefined>;
	src?: Ref<string>;
}

export interface UseFilePreviewReturn {
	computedImage: ComputedRef<UploadedFile | null>;
	filename: ComputedRef<string>;
	mimeType: ComputedRef<string>;
	isImage: ComputedRef<boolean>;
	isVideo: ComputedRef<boolean>;
	isPdf: ComputedRef<boolean>;
	isExternalLink: ComputedRef<boolean>;
	previewUrl: ComputedRef<string>;
	thumbUrl: ComputedRef<string>;
	isPreviewable: ComputedRef<boolean>;
	hasMetadata: ComputedRef<boolean>;
	metadataKeyCount: ComputedRef<number>;
	filteredMetadata: ComputedRef<Record<string, unknown>>;
	hasTranscodes: ComputedRef<boolean>;
	transcodingStatus: ComputedRef<(FileTranscode & { message: string }) | null>;
}

/**
 * Composable for file preview computed properties
 */
export function useFilePreview(options: UseFilePreviewOptions): UseFilePreviewReturn {
	const { file, src } = options;

	const computedImage: ComputedRef<UploadedFile | null> = computed(() => {
		if (file.value) {
			return file.value;
		} else if (src?.value) {
			return {
				id: src.value,
				url: src.value,
				type: "image/" + src.value.split(".").pop()?.toLowerCase(),
				name: "",
				size: 0,
				__type: "BrowserFile"
			};
		}
		return null;
	});

	const filename = computed(() => computedImage.value?.name || computedImage.value?.filename || "");
	const mimeType = computed(() => computedImage.value ? getMimeType(computedImage.value) : "");
	const isImage = computed(() => computedImage.value ? fileHelpers.isImage(computedImage.value) : false);
	const isVideo = computed(() => computedImage.value ? fileHelpers.isVideo(computedImage.value) : false);
	const isPdf = computed(() => computedImage.value ? fileHelpers.isPdf(computedImage.value) : false);
	const isExternalLink = computed(() => computedImage.value ? isExternalLinkFile(computedImage.value) : false);
	const previewUrl = computed(() => computedImage.value ? getOptimizedUrl(computedImage.value) : "");
	const thumbUrl = computed(() => computedImage.value?.thumb?.url || "");
	const isPreviewable = computed(() => !!thumbUrl.value || isVideo.value || isImage.value);

	const hasMetadata = computed(() => {
		if (!file.value?.meta) return false;
		const metaKeys = Object.keys(file.value.meta).filter(k => k !== "transcodes");
		return metaKeys.length > 0;
	});

	const metadataKeyCount = computed(() => {
		if (!file.value?.meta) return 0;
		return Object.keys(file.value.meta).filter(k => k !== "transcodes").length;
	});

	const filteredMetadata = computed(() => {
		if (!file.value?.meta) return {};
		const { transcodes, ...rest } = file.value.meta;
		return rest;
	});

	const hasTranscodes = computed(() => (file.value?.transcodes?.length || 0) > 0);

	const transcodingStatus = computed(() => {
		const metaTranscodes: Record<string, FileTranscode> = file.value?.meta?.transcodes || {};

		for (const transcodeName of Object.keys(metaTranscodes)) {
			const transcode = metaTranscodes[transcodeName];
			if (!["Complete", "Timeout"].includes(transcode?.status)) {
				return { ...transcode, message: `${transcodeName} ${transcode.status}` };
			}
		}

		return null;
	});

	return {
		computedImage,
		filename,
		mimeType,
		isImage,
		isVideo,
		isPdf,
		isExternalLink,
		previewUrl,
		thumbUrl,
		isPreviewable,
		hasMetadata,
		metadataKeyCount,
		filteredMetadata,
		hasTranscodes,
		transcodingStatus
	};
}
