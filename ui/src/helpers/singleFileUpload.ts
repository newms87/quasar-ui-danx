import { computed, Ref, ref } from "vue";
import { FileUpload, FileUploadOptions, UploadedFile } from "./FileUpload";

export function useSingleFileUpload(options: FileUploadOptions | null = null) {
    const uploadedFile: Ref<UploadedFile | null> = ref(null);
    const onCompleteCb: Ref<Function | null> = ref(null);
    const onFileChangeCb: Ref<Function | null> = ref(null);

    const onFileSelected = (e: InputEvent) => {
        uploadedFile.value = null;
        new FileUpload(e.target?.files[0], options)
            .onProgress(({ file }) => {
                uploadedFile.value = file;
                onFileChangeCb.value && onFileChangeCb.value(uploadedFile.value);
            })
            .onComplete(({ uploadedFile: completedFile }) => {
                uploadedFile.value = completedFile;
                onCompleteCb.value && onCompleteCb.value(uploadedFile.value);
                onFileChangeCb.value && onFileChangeCb.value(uploadedFile.value);
            })
            .upload();
    };

    const onDrop = (e: InputEvent) => {
        onFileSelected({ target: { files: e.dataTransfer?.files } });
    };

    const isFileUploaded = computed(() => {
        return uploadedFile.value && uploadedFile.value.url;
    });

    const onFileChange = (cb: Function) => {
        onFileChangeCb.value = cb;
    };

    const onComplete = (cb: Function) => {
        onCompleteCb.value = cb;
    };

    const clearUploadedFile = () => {
        uploadedFile.value = null;
        onFileChangeCb.value && onFileChangeCb.value(uploadedFile.value);
        onCompleteCb.value && onCompleteCb.value(uploadedFile.value);
    };

    return {
        isFileUploaded,
        clearUploadedFile,
        onComplete,
        onFileChange,
        onDrop,
        onFileSelected,
        uploadedFile
    };
}
