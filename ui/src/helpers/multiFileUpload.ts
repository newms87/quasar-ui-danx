import { Ref, ref } from "vue";
import { FlashMessages } from "../helpers";
import { FileUploadOptions, OnCompleteCallback, OnFilesChangeCallback, UploadedFile, VoidCallback } from "../types";
import { FileUpload } from "./FileUpload";

export function useMultiFileUpload(options?: FileUploadOptions) {
	const uploadedFiles: Ref<UploadedFile[]> = ref([]);
	const onCompleteCb: Ref<OnCompleteCallback | null> = ref(null);
	const onFilesChangeCb: Ref<OnFilesChangeCallback | null> = ref(null);
	const onFilesSelected = (e: any) => {
		uploadedFiles.value = [...uploadedFiles.value, ...e.target.files];
		new FileUpload(e.target.files, options)
				.onProgress(({ file }: { file: UploadedFile }) => {
					updateFileInList(file);
				})
				.onComplete(({ file, uploadedFile }) => {
					file && updateFileInList(file, uploadedFile);
				})
				.onError(({ file }: { file: UploadedFile }) => {
					FlashMessages.error(`Failed to upload ${file.name}`);
				})
				.onAllComplete(() => {
					onCompleteCb.value && onCompleteCb.value({
						file: uploadedFiles.value[0],
						uploadedFile: uploadedFiles.value[0]
					});
					onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
				})
				.upload();
	};

	function updateFileInList(file: UploadedFile, replace: UploadedFile | null = null) {
		const index = uploadedFiles.value.findIndex(f => f.id === file.id);
		if (index !== -1) {
			uploadedFiles.value.splice(index, 1, replace || file);
		}
		onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
	}

	const onDrop = (e: InputEvent) => {
		onFilesSelected({ target: { files: e.dataTransfer?.files } });
	};

	const onFilesChange = (cb: OnFilesChangeCallback) => {
		onFilesChangeCb.value = cb;
	};

	const onComplete = (cb: VoidCallback) => {
		onCompleteCb.value = cb;
	};

	const clearUploadedFiles = () => {
		uploadedFiles.value = [];
		onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
		onCompleteCb.value && onCompleteCb.value({ file: null, uploadedFile: null });
	};

	const onRemove = (file: UploadedFile) => {
		const index = uploadedFiles.value.findIndex(f => f.id === file.id);
		if (index !== -1) {
			uploadedFiles.value.splice(index, 1);
		}
		onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
		onCompleteCb.value && onCompleteCb.value({ file, uploadedFile: file });
	};

	return {
		clearUploadedFiles,
		onRemove,
		onComplete,
		onFilesChange,
		onDrop,
		onFilesSelected,
		uploadedFiles
	};
}
