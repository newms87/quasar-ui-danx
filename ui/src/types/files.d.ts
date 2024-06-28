export interface FileUploadOptions {
	directory?: string,
	createPresignedUpload?: ((path: string, name: string, mime?: string) => Promise<UploadedFile>) | null;
	completePresignedUpload?: ((fileId: string) => Promise<UploadedFile>) | null;
}

export interface XHRFileUpload {
	file: UploadedFile;
	xhr?: XMLHttpRequest | null;
	formData: FormData;
	isComplete: boolean;
	body?: FormData | UploadedFile | string;
}

export interface UploadedFile {
	id: string;
	resource_id?: string;
	name: string;
	filename?: string;
	size: number;
	type: string;
	mimeType?: string;
	mime?: string;
	progress?: number;
	location?: string;
	blobUrl?: string;
	url?: string;
	thumb?: UploadedFile;
	optimized?: UploadedFile;
	transcodes?: UploadedFile[];
}

export interface FileUploadCompleteCallbackParams {
	file?: UploadedFile | null;
	uploadedFile?: UploadedFile | null;
}

export interface FileUploadAllCompleteCallbackParams {
	files: XHRFileUpload[];
}

export interface FileUploadProgressCallbackParams {
	file?: UploadedFile | null;
	progress: number;
}

export interface FileUploadErrorCallbackParams {
	e: InputEvent;
	file: UploadedFile;
	error: any;
}

export type FileUploadCompleteCallback = (params: FileUploadCompleteCallbackParams) => void
export type FileUploadAllCompleteCallback = (params: FileUploadAllCompleteCallbackParams) => void
export type FileUploadProgressCallback = (params: FileUploadProgressCallbackParams) => void
export type FileUploadErrorCallback = (params: FileUploadErrorCallbackParams) => void
export type OnFilesChangeCallback = (files: UploadedFile[]) => void;
export type VoidCallback = () => void;
