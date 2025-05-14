<template>
  <div
    class="max-w-full relative overflow-auto"
    :class="{'p-2': !readonly}"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <FieldLabel
      v-if="label"
      :label="label"
    />

    <input
      v-if="!disabled && !readonly"
      ref="file"
      class="hidden"
      type="file"
      multiple
      @change="onFilesSelected"
    >

    <div class="flex items-stretch justify-start">
      <FilePreview
        v-for="file in uploadedFiles"
        :key="'file-upload-' + file.id"
        class="m-2 cursor-pointer bg-gray-200"
        :class="filePreviewClass"
        :style="styleSize"
        :file="file"
        :show-transcodes="showTranscodes"
        :related-files="uploadedFiles"
        downloadable
        :removable="!readonly && !disabled"
        @remove="onRemove(file)"
      />
      <div
        v-if="!disabled && !readonly"
        class="dx-add-remove-files m-2 flex flex-col flex-nowrap items-center overflow-hidden cursor-pointer"
        :class="filePreviewClass"
        :style="styleSize"
      >
        <div
          class="dx-add-file flex-grow p-1 pt-3 flex justify-center items-center bg-green-200 text-green-700 w-full hover:bg-green-100"
          @click="$refs.file.click()"
        >
          <div>
            <AddFileIcon
              class="m-auto"
              :class="addIconClass"
            />
            <div class="mt-1 text-center">
              Add
            </div>
          </div>
        </div>
        <div
          v-if="uploadedFiles.length > 0"
          class="dx-remove-file flex items-center flex-nowrap p-2 bg-red-200 text-red-800 hover:bg-red-100 w-full justify-center text-xs"
          @click="clearUploadedFiles"
        >
          <RemoveFileIcon class="mr-2 w-3" />
          Remove All
        </div>
      </div>
      <div
        v-if="readonly && uploadedFiles.length === 0"
        class="p-1"
      >
        --
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useMultiFileUpload } from "../../../../helpers";
import { ImageIcon as AddFileIcon, TrashIcon as RemoveFileIcon } from "../../../../svg";
import { FormField, UploadedFile } from "../../../../types";
import { FilePreview } from "../../../Utility";
import FieldLabel from "./FieldLabel";

const emit = defineEmits(["update:model-value"]);
const props = withDefaults(defineProps<{
	modelValue?: UploadedFile[];
	field?: FormField;
	label?: string;
	showName?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	width?: number | string;
	height?: number | string;
	addIconClass?: string;
	filePreviewClass?: string;
	filePreviewBtnSize?: string;
	showTranscodes?: boolean;
}>(), {
	modelValue: null,
	field: null,
	label: "",
	width: 128,
	height: 128,
	addIconClass: "w-10",
	filePreviewClass: "rounded-2xl",
	filePreviewBtnSize: "sm"
});

const { onComplete, onDrop, onFilesSelected, uploadedFiles, clearUploadedFiles, onRemove } = useMultiFileUpload();
onMounted(() => {
	if (props.modelValue) {
		uploadedFiles.value = props.modelValue;
	}
});
onComplete(() => emit("update:model-value", uploadedFiles.value));

const styleSize = computed(() => {
	return {
		width: typeof props.width === "number" ? `${props.width}px` : props.width,
		height: typeof props.height === "number" ? `${props.height}px` : props.height
	};
});
</script>
