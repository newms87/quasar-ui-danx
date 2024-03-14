import { FileUpload, FileUploadOptions } from "@/helpers/FileUpload";
import { ref } from "vue";

export function useMultiFileUpload(options: FileUploadOptions) {
    const uploadedFiles = ref([]);
    const onCompleteCb = ref(null);
    const onFilesChangeCb = ref(null);
    const onFilesSelected = (e) => {
        uploadedFiles.value = [...uploadedFiles.value, ...e.target.files];
        new FileUpload(e.target.files, options)
            .onProgress(({ file }) => {
                updateFileInList(file);
            })
            .onComplete(({ file, uploadedFile }) => {
                updateFileInList(file, uploadedFile);
            })
            .onAllComplete(() => {
                onCompleteCb.value && onCompleteCb.value();
                onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
            })
            .upload();
    };

    function updateFileInList(file, replace = null) {
        const index = uploadedFiles.value.findIndex(f => f.id === file.id);
        if (index !== -1) {
            uploadedFiles.value.splice(index, 1, replace || file);
        }
        onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
    }

    const onDrop = (e) => {
        onFilesSelected({ target: { files: e.dataTransfer.files } });
    };

    const onFilesChange = (cb) => {
        onFilesChangeCb.value = cb;
    };

    const onComplete = (cb) => {
        onCompleteCb.value = cb;
    };

    const onClear = () => {
        uploadedFiles.value = [];
        onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
        onCompleteCb.value && onCompleteCb.value();
    };

    const onRemove = (file) => {
        const index = uploadedFiles.value.findIndex(f => f.id === file.id);
        if (index !== -1) {
            uploadedFiles.value.splice(index, 1);
        }
        onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
        onCompleteCb.value && onCompleteCb.value();
    };

    return {
        onClear,
        onRemove,
        onComplete,
        onFilesChange,
        onDrop,
        onFilesSelected,
        uploadedFiles
    };
}
