import { computed, ref } from "vue";
import { FileUpload, FileUploadOptions } from "./FileUpload";

export function useSingleFileUpload(options: FileUploadOptions = null) {
    const uploadedFile = ref(null);
    const onCompleteCb = ref(null);
    const onFileChangeCb = ref(null);

    const onFileSelected = (e) => {
        uploadedFile.value = null;
        new FileUpload(e.target.files[0], options)
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

    const onDrop = (e) => {
        onFileSelected({ target: { files: e.dataTransfer.files } });
    };

    const isFileUploaded = computed(() => {
        return uploadedFile.value && uploadedFile.value.url;
    });

    const onFileChange = (cb) => {
        onFileChangeCb.value = cb;
    };

    const onComplete = (cb) => {
        onCompleteCb.value = cb;
    };

    const onClear = () => {
        uploadedFile.value = null;
        onFileChangeCb.value && onFileChangeCb.value(uploadedFile.value);
    };

    return {
        isFileUploaded,
        onClear,
        onComplete,
        onFileChange,
        onDrop,
        onFileSelected,
        uploadedFile
    };
}
