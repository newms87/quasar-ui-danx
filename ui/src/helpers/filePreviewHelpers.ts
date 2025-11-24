import { UploadedFile } from "../types";

/**
 * Placeholder constants for file preview
 */
export const FILE_PLACEHOLDERS = {
	IMAGE: "https://placehold.co/64x64?text=?",
	VIDEO_SVG: `data:image/svg+xml;base64,${btoa(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>'
	)}`
};

/**
 * MIME type regex patterns for file type detection
 */
export const MIME_TYPES = {
	IMAGE: /^image\//,
	VIDEO: /^video\//,
	TEXT: /^text\//,
	PDF: /^application\/pdf/
};

/**
 * Check if file is an image
 */
export function isImage(file: UploadedFile): boolean {
	const mimeType = getMimeType(file);
	return MIME_TYPES.IMAGE.test(mimeType);
}

/**
 * Check if file is a video
 */
export function isVideo(file: UploadedFile): boolean {
	const mimeType = getMimeType(file);
	return MIME_TYPES.VIDEO.test(mimeType);
}

/**
 * Check if file is a text file
 */
export function isText(file: UploadedFile): boolean {
	const mimeType = getMimeType(file);
	return MIME_TYPES.TEXT.test(mimeType);
}

/**
 * Check if file is a PDF
 */
export function isPdf(file: UploadedFile): boolean {
	const mimeType = getMimeType(file);
	return MIME_TYPES.PDF.test(mimeType);
}

/**
 * Get the MIME type from a file
 */
export function getMimeType(file: UploadedFile): string {
	return file.mime || file.type || "";
}

/**
 * Get the file extension from a filename
 */
export function getFileExtension(filename: string): string {
	return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Get the preview URL for a file
 * Priority: optimized > blobUrl > url > thumb > empty string
 */
export function getPreviewUrl(file: UploadedFile): string {
	if (file.optimized?.url) {
		return file.optimized.url;
	}

	if (isImage(file)) {
		return file.blobUrl || file.url || "";
	}

	return file.thumb?.url || "";
}

/**
 * Get the thumbnail URL for a file
 * For videos without thumbs, returns a play icon SVG
 */
export function getThumbUrl(file: UploadedFile): string {
	if (file.thumb?.url) {
		return file.thumb.url;
	}

	if (isVideo(file)) {
		return FILE_PLACEHOLDERS.VIDEO_SVG;
	}

	return getPreviewUrl(file) || FILE_PLACEHOLDERS.IMAGE;
}

/**
 * Get the optimized URL for a file (used for preview)
 * Priority: optimized > blobUrl > url
 */
export function getOptimizedUrl(file: UploadedFile): string {
	return file.optimized?.url || file.blobUrl || file.url || "";
}
