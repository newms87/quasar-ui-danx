import { Ref, ref } from "vue";
import { FlashMessages } from "../helpers";
import {
	FileUploadCompleteCallback,
	FileUploadOptions,
	OnFilesChangeCallback,
	UploadedFile,
	VoidCallback
} from "../types";
import { FileUpload } from "./FileUpload";

export function useMultiFileUpload(options?: FileUploadOptions) {
	const uploadedFiles: Ref<UploadedFile[]> = ref([]);
	const onCompleteCb: Ref<FileUploadCompleteCallback | null> = ref(null);
	const onFilesChangeCb: Ref<OnFilesChangeCallback | null> = ref(null);
	const onFilesSelected = (e: any) => {
		uploadedFiles.value = [...uploadedFiles.value, ...e.target.files];
		triggerFilesChange();

		new FileUpload(e.target.files, options)
			.prepare()
			.onProgress(({ file }) => {
				file && updateFileInList(file);
			})
			.onComplete(({ file, uploadedFile }) => {
				file && updateFileInList(file, uploadedFile);
			})
			.onError(({ file, error }) => {
				console.error("Failed to upload", file, error);
				FlashMessages.error(`Failed to upload ${file.name}: ${error}`);
			})
			.onAllComplete(() => {
				onCompleteCb.value && onCompleteCb.value({
					file: uploadedFiles.value[0],
					uploadedFile: uploadedFiles.value[0]
				});
				triggerFilesChange();
			})
			.upload();
	};

	function triggerFilesChange() {
		onFilesChangeCb.value && onFilesChangeCb.value(uploadedFiles.value);
	}

	function updateFileInList(file: UploadedFile, replace: UploadedFile | null = null) {
		const index = uploadedFiles.value.findIndex(f => f.id === file.id);
		if (index !== -1) {
			uploadedFiles.value.splice(index, 1, replace || file);
		}
		triggerFilesChange();
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
		triggerFilesChange();
		onCompleteCb.value && onCompleteCb.value({ file: null, uploadedFile: null });
	};

	const onRemove = (file: UploadedFile) => {
		const index = uploadedFiles.value.findIndex(f => f.id === file.id);
		if (index !== -1) {
			uploadedFiles.value.splice(index, 1);
		}
		triggerFilesChange();
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
