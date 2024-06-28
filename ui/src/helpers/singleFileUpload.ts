import { computed, Ref, ref } from "vue";
import { FileUploadOptions, UploadedFile } from "../types";
import { FileUpload } from "./FileUpload";
import { FlashMessages } from "./FlashMessages";

type FileUploadCallback = ((file: UploadedFile | null) => void) | null;

export function useSingleFileUpload(options: FileUploadOptions | null = null) {
	const uploadedFile: Ref<UploadedFile | null | undefined> = ref(null);
	const onCompleteCb: Ref<FileUploadCallback> = ref(null);
	const onFileChangeCb: Ref<FileUploadCallback> = ref(null);

	const onFileSelected = (e: any) => {
		uploadedFile.value = null;
		new FileUpload(e.target?.files[0], options)
				.prepare()
				.onProgress(({ file }) => {
					if (file) {
						uploadedFile.value = file;
						onFileChangeCb.value && onFileChangeCb.value(uploadedFile.value);
					}
				})
				.onComplete(({ uploadedFile: completedFile }) => {
					if (completedFile) {
						uploadedFile.value = completedFile;
						onCompleteCb.value && onCompleteCb.value(uploadedFile.value);
						onFileChangeCb.value && onFileChangeCb.value(uploadedFile.value);
					}
				})
				.onError(({ file, error }) => {
					console.error("Failed to upload", file, error);
					FlashMessages.error(`Failed to upload ${file.name}: ${error}`);
				})
				.upload();
	};

	const onDrop = (e: InputEvent) => {
		onFileSelected({ target: { files: e.dataTransfer?.files } });
	};

	const isFileUploaded = computed(() => {
		return uploadedFile.value && uploadedFile.value.url;
	});

	const onFileChange = (cb: FileUploadCallback) => {
		onFileChangeCb.value = cb;
	};

	const onComplete = (cb: FileUploadCallback) => {
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
