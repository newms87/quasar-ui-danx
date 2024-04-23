import { uid } from "quasar";
import { danxOptions } from "../config";
import { resolveFileLocation } from "./files";
import { FlashMessages } from "./FlashMessages";

export type FileUploadOptions = {
    directory?: string,
    presignedUploadUrl?: Function | null;
    uploadCompletedUrl?: Function | null;
};

export type UploadedFile = {
    id: string,
    name: string,
    size: number,
    type: string,
    progress: number,
    location: string,
    blobUrl: string,
    url: string,
}

export class FileUpload {
    files: UploadedFile[] = [];
    fileUploads: UploadedFile[] = [];
    onErrorCb: Function | null = null;
    onProgressCb: Function | null = null;
    onCompleteCb: Function | null = null;
    onAllCompleteCb: Function | null = null;
    options: FileUploadOptions | null = {};

    constructor(files: UploadedFile[] | UploadedFile, options: FileUploadOptions | null = {}) {
        this.files = !Array.isArray(files) && !(files instanceof FileList) ? [files] : files;
        this.fileUploads = [];
        this.onErrorCb = null;
        this.onProgressCb = null;
        this.onCompleteCb = null;
        this.onAllCompleteCb = null;

        this.options = {
            ...danxOptions.value.fileUpload,
            ...options
        };

        if (!this.options.presignedUploadUrl) {
            throw new Error("Please configure the danxOptions: import { configure } from 'quasar-ui-danx';");
        }
        this.prepare();
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
    }

    /**
     * Callback for when all files have been uploaded
     */
    onAllComplete(cb: Function) {
        this.onAllCompleteCb = cb;
        return this;
    }

    /**
     * Callback fired once for each file upon successful completion of upload
     * @param cb
     * @returns {FileUpload}
     */
    onComplete(cb: Function) {
        this.onCompleteCb = cb;
        return this;
    }

    /**
     * Callback fired each time there is an upload progress update for a file
     * @param cb
     * @returns {FileUpload}
     */
    onProgress(cb: Function) {
        this.onProgressCb = cb;
        return this;
    }

    /**
     * Callback fired when an error occurs during upload
     * @param cb
     * @returns {FileUpload}
     */
    onError(cb: Function) {
        this.onErrorCb = cb;
        return this;
    }

    /**
     * Handles the error events / fires the callback if it is set
     * @param e
     * @param file
     * @param error
     */
    errorHandler(e: InputEvent, file: UploadedFile, error = null) {
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
    fireProgressCallback(fileUpload, progress) {
        fileUpload.file.progress = progress;
        this.onProgressCb && this.onProgressCb({ file: this.wrapFile(fileUpload.file), progress });
    }

    /**
     * Fires the complete callback
     * @param fileUpload
     * @param uploadedFile
     */
    fireCompleteCallback(fileUpload, uploadedFile) {
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
     * @param file
     * @returns {{size, name, progress, location, blobUrl: *, id, type}}
     */
    wrapFile(file) {
        return {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: file.progress,
            location: file.location,
            blobUrl: file.blobUrl
        };
    }

    /**
     * Registers all the callbacks requested for the XHR / post-processing of file uploads
     */
    setXhrCallbacks() {
        // Set the error callbacks
        for (const fileUpload of this.fileUploads) {
            fileUpload.xhr.addEventListener(
                "error",
                (e) => this.errorHandler(e, fileUpload.file),
                false
            );
        }

        // Set the progress callbacks
        if (this.onProgressCb) {
            for (const fileUpload of this.fileUploads) {
                fileUpload.xhr.upload.addEventListener(
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
            fileUpload.xhr.addEventListener(
                "load",
                async (e) => {
                    try {
                        // First complete the presigned upload to get the updated file resource data
                        const uploadedFile = await this.completePresignedUpload(fileUpload);

                        // Fire the file complete callbacks
                        this.fireCompleteCallback(fileUpload, uploadedFile);
                        this.checkAllComplete();
                    } catch (error) {
                        this.errorHandler(e, fileUpload.file, error);
                    }
                },
                false
            );
        }
    }

    /**
     * Mark the presigned upload as completed and return the file resource from the platform server
     * @param fileUpload
     * @returns {Promise<void>}
     */
    async completePresignedUpload(fileUpload) {
        // Show 95% as the last 5% will be to complete the presigned upload
        this.fireProgressCallback(fileUpload, .95);

        // Let the platform know the presigned upload is complete
        return await fetch(this.options.uploadCompletedUrl(fileUpload.file.resource_id), { method: "POST" }).then(r => r.json());
    }

    /**
     * Start uploading all files
     */
    async upload() {
        for (const fileUpload of this.fileUploads) {
            const mimeType = fileUpload.file.mimeType || fileUpload.file.type;
            const presignedUrl = this.options.presignedUploadUrl(this.options.directory, fileUpload.file.name, mimeType);

            // Fetch presigned upload URL
            const fileResource = await fetch(presignedUrl).then(r => r.json());

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
            fileUpload.xhr.send(fileUpload.body);
        }
    }
}
