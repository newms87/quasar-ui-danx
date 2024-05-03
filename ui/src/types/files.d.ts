export interface FileUploadOptions {
	directory?: string,
	presignedUploadUrl?: () => Promise<object> | null;
	uploadCompletedUrl?: Promise<void> | null;
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
