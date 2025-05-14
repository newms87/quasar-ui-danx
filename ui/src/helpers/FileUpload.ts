import { uid } from "quasar";
import { danxOptions } from "../config";
import { DateTime, parseDateTime } from "../helpers/formats";
import {
	FileUploadAllCompleteCallback,
	FileUploadCompleteCallback,
	FileUploadErrorCallback,
	FileUploadOptions,
	FileUploadProgressCallback,
	UploadedFile,
	XHRFileUpload
} from "../types";
import { resolveFileLocation } from "./files";
import { FlashMessages } from "./FlashMessages";
import { storeObject } from "./objectStore";


export class FileUpload {
	files: UploadedFile[] = [];
	fileUploads: XHRFileUpload[] = [];
	onErrorCb: FileUploadErrorCallback | null = null;
	onProgressCb: FileUploadProgressCallback | null = null;
	onCompleteCb: FileUploadCompleteCallback | null = null;
	onAllCompleteCb: FileUploadAllCompleteCallback | null = null;
	options: FileUploadOptions;

	constructor(files: UploadedFile[] | UploadedFile, options?: FileUploadOptions | null) {
		/* @ts-expect-error Files is an array */
		this.files = !Array.isArray(files) && !(files instanceof FileList) ? [files] : files;
		this.fileUploads = [];
		this.onErrorCb = null;
		this.onProgressCb = null;
		this.onCompleteCb = null;
		this.onAllCompleteCb = null;

		this.options = {
			createPresignedUpload: null,
			completePresignedUpload: null,
			refreshFile: null,
			...danxOptions.value.fileUpload,
			...options
		};

		if (!this.options.createPresignedUpload || !this.options.completePresignedUpload) {
			throw new Error("Please configure danxOptions.fileUpload: import { configure } from 'quasar-ui-danx';");
		}
	}

	/**
	 * Prepares all files for upload and provides an id and blobUrl for each file
	 */
	prepare() {
		// Prepare required attributes
		for (const file of this.files) {
			if (!(file instanceof File)) {
				throw Error(
						"FileUpload constructor requires a File object or a list of File objects"
				);
			}

			file.id = uid();
			file.blobUrl = URL.createObjectURL(file);

			// Prepare FormData
			const formData = new FormData();
			formData.append("file", file);

			this.fileUploads.push({
				file,
				xhr: null, // NOTE: The XHR will be setup asynchronously right before sending file uploads
				formData,
				isComplete: false
			});
		}

		return this;
	}

	/**
	 * Callback for when all files have been uploaded
	 */
	onAllComplete(cb: FileUploadAllCompleteCallback) {
		this.onAllCompleteCb = cb;
		return this;
	}

	/**
	 * Callback fired once for each file upon successful completion of upload
	 * @param cb
	 * @returns {FileUpload}
	 */
	onComplete(cb: FileUploadCompleteCallback) {
		this.onCompleteCb = cb;
		return this;
	}

	/**
	 * Callback fired each time there is an upload progress update for a file
	 * @param cb
	 * @returns {FileUpload}
	 */
	onProgress(cb: FileUploadProgressCallback) {
		this.onProgressCb = cb;
		return this;
	}

	/**
	 * Callback fired when an error occurs during upload
	 */
	onError(cb: FileUploadErrorCallback) {
		this.onErrorCb = cb;
		return this;
	}

	/**
	 * Handles the error events / fires the callback if it is set
	 */
	errorHandler(e: InputEvent | ProgressEvent, file: UploadedFile, error = null) {
		if (this.onErrorCb) {
			this.onErrorCb({ e, file, error });
		}
	}

	/**
	 * Resolve the locations of all the files
	 * @returns {Promise<FileUpload>}
	 */
	async resolveLocation(waitMessage = null) {
		for (const fileUpload of this.fileUploads) {
			fileUpload.file.location = await resolveFileLocation(
					fileUpload.file,
					waitMessage
			);
			fileUpload.formData.append(
					"meta",
					JSON.stringify(fileUpload.file.location)
			);
		}
		return this;
	}

	/**
	 * Fires the progress callback
	 * @param fileUpload
	 * @param progress
	 */
	fireProgressCallback(fileUpload: XHRFileUpload, progress: number) {
		fileUpload.file.progress = progress;
		this.onProgressCb && this.onProgressCb({ file: this.wrapFile(fileUpload.file), progress });
	}

	/**
	 * Fires the complete callback
	 * @param fileUpload
	 * @param uploadedFile
	 */
	fireCompleteCallback(fileUpload: XHRFileUpload, uploadedFile: UploadedFile) {
		fileUpload.isComplete = true;
		fileUpload.file.progress = 1;
		this.onCompleteCb && this.onCompleteCb({ file: this.wrapFile(fileUpload.file), uploadedFile });
	}

	/**
	 * Check if all files have been uploaded and call the callback if they have
	 */
	checkAllComplete() {
		if (this.onAllCompleteCb) {
			if (this.fileUploads.every((fileUpload) => fileUpload.isComplete)) {
				this.onAllCompleteCb({ files: this.fileUploads });
			}
		}
	}

	/**
	 * Returns a native JS object that is easier to work with than the File objects (no weird behavior of missing
	 * properties, easily printable, etc.)
	 */
	wrapFile(file: UploadedFile) {
		return {
			id: file.id,
			name: file.name,
			size: file.size,
			type: file.type,
			progress: file.progress,
			location: file.location,
			blobUrl: file.blobUrl,
			url: "",
			__type: "BrowserFile"
		};
	}

	/**
	 * Registers all the callbacks requested for the XHR / post-processing of file uploads
	 */
	setXhrCallbacks() {
		// Set the error callbacks
		for (const fileUpload of this.fileUploads) {
			fileUpload.xhr?.addEventListener(
					"error",
					(e) => this.errorHandler(e, fileUpload.file),
					false
			);
		}

		// Set the progress callbacks
		if (this.onProgressCb) {
			for (const fileUpload of this.fileUploads) {
				fileUpload.xhr?.upload.addEventListener(
						"progress",
						(e) => {
							// Max of 95%, so we can indicate we are completing the signed URL process
							const progress = Math.min(.95, e.loaded / e.total);
							this.fireProgressCallback(fileUpload, progress);
						},
						false
				);
			}
		}

		// Set the load callbacks which registers the Complete / All Complete callbacks and handles non-xhr related
		// errors
		for (const fileUpload of this.fileUploads) {
			fileUpload.xhr?.addEventListener(
					"load",
					async (e) => {
						try {
							// First complete the presigned upload to get the updated file resource data
							let storedFile = await this.completePresignedUpload(fileUpload);
							storedFile = storeObject(storedFile);
							// Fire the file complete callbacks
							this.fireCompleteCallback(fileUpload, storedFile);
							this.checkAllComplete();
						} catch (error: any) {
							this.errorHandler(e, fileUpload.file, error);
						}
					},
					false
			);
		}
	}

	/**
	 * Mark the presigned upload as completed and return the file resource from the platform server
	 */
	async completePresignedUpload(xhrFile: XHRFileUpload) {
		// Show 95% as the last 5% will be to complete the presigned upload
		this.fireProgressCallback(xhrFile, .95);

		if (!xhrFile.file.resource_id) {
			throw new Error("File resource ID is required to complete presigned upload");
		}

		if (!this.options.completePresignedUpload) {
			throw new Error("Please configure danxOptions.fileUpload.completePresignedUpload");
		}

		// Let the platform know the presigned upload is complete
		return await this.options.completePresignedUpload(xhrFile.file.resource_id, xhrFile);
	}

	/**
	 * Refresh the file data, in case transcoding or some transient state is needed to be refreshed on the file
	 */
	async refreshFile(file: UploadedFile): Promise<UploadedFile | null> {
		if (!this.options.refreshFile) return null;

		const storedFile = await this.options.refreshFile(file.id);

		if (storedFile) {
			return storeObject(storedFile);
		}
		return storedFile;
	}

	/**
	 * Checks if the file has a transcode in progress or pending
	 */
	isTranscoding(file: UploadedFile) {
		const metaTranscodes = file?.meta?.transcodes || [];
		for (const transcodeName of Object.keys(metaTranscodes)) {
			const transcode = metaTranscodes[transcodeName];

			if (transcode.status === "Pending" || transcode.status === "In Progress") {
				const startedAt = parseDateTime(transcode.started_at);
				const duration = startedAt && DateTime.now().diff(startedAt, "minutes");
				if (!duration?.minutes || duration.minutes < 30) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Start uploading all files
	 */
	async upload() {
		for (const fileUpload of this.fileUploads) {
			const mimeType = fileUpload.file.mimeType || fileUpload.file.type;

			if (!this.options.createPresignedUpload) {
				throw new Error("Please configure danxOptions.fileUpload.createPresignedUpload");
			}

			// Fetch presigned upload URL
			const fileResource = await this.options.createPresignedUpload(this.options.directory || "", fileUpload.file.name, mimeType);

			if (!fileResource.url) {
				FlashMessages.error("Could not fetch presigned upload URL for file " + fileUpload.file.name);
				continue;
			}

			const isS3Upload = !fileResource.url.match("upload-presigned-url-contents");

			// We need the file resource ID to complete the presigned upload
			fileUpload.file.resource_id = fileResource.id;

			// Prepare XHR request
			const xhr = new XMLHttpRequest();

			// The XHR request is different based on weather we're sending to S3 or the platform server
			if (isS3Upload) {
				xhr.open("PUT", fileResource.url);
				xhr.setRequestHeader("Content-Type", mimeType);
				fileUpload.body = fileUpload.file;
			} else {
				xhr.open("POST", fileResource.url);
				fileUpload.body = fileUpload.formData;
			}

			fileUpload.xhr = xhr;
		}

		// Set all the callbacks on the XHR requests
		this.setXhrCallbacks();

		// Send all the XHR file uploads
		for (const fileUpload of this.fileUploads) {
			// @ts-expect-error XHRFileUpload has a xhr property
			fileUpload.xhr?.send(fileUpload.body);
		}
	}
}
