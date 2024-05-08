export interface FileUploadOptions {
	directory?: string,
	presignedUploadUrl: (path: string, name: string, mime?: string) => string;
	uploadCompletedUrl: (fileId: string) => string;
}

export interface UploadedFile {
	id: string,
	name: string,
	size: number,
	type: string,
	progress: number,
	location: string,
	blobUrl: string,
	url: string,
}

export interface OnCompleteCallbackParams {
	file?: UploadedFile | null;
	uploadedFile?: UploadedFile | null;
}

export type OnCompleteCallback = (params: OnCompleteCallbackParams) => void
export type OnFilesChangeCallback = (files: UploadedFile[]) => void;
export type VoidCallback = () => void;
