export let danxOptions = {
    fileUpload: {
        directory: "file-upload",
        presignedUploadUrl: null,
        uploadCompletedUrl: null
    }
};

export function configure(options) {
    danxOptions = {
        ...danxOptions,
        ...options
    };
}
