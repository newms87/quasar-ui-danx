export interface DanxFileUploadOptions {
    directory?: string;
    presignedUploadUrl?: string | null;
    uploadCompletedUrl?: string | null;
}

export interface DanxFlashMessageOptions {
    classes?: string;
    icon?: string | object;
    timeout?: number;
    position?: string;
    closeBtn?: string;
    html?: boolean;
    message?: string;
}

export interface DanxOptions {
    fileUpload: DanxFileUploadOptions;
    flashMessages: {
        default: DanxFlashMessageOptions;
        success: DanxFlashMessageOptions;
        warning: DanxFlashMessageOptions;
        error: DanxFlashMessageOptions;
    };
}

export let danxOptions: DanxOptions = {
    fileUpload: {
        directory: "file-upload",
        presignedUploadUrl: null,
        uploadCompletedUrl: null
    },
    flashMessages: {
        default: {},
        success: {},
        warning: {},
        error: {}
    }
};

export function configure(options: DanxOptions) {
    danxOptions = {
        ...danxOptions,
        ...options
    };
}
