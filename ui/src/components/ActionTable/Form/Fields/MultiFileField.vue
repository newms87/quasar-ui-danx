<template>
  <div
    class="max-w-full relative overflow-auto"
    :class="{'p-2': !readonly}"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <FieldLabel
      :field="field"
      :label="label"
      :show-name="showName"
      class="text-sm font-semibold"
    />

    <input
      v-if="!disable && !readonly"
      ref="file"
      class="hidden"
      type="file"
      multiple
      @change="onFilesSelected"
    >

    <div class="max-w-[50em] flex items-stretch justify-start">
      <FilePreview
        v-for="file in uploadedFiles"
        :key="'file-upload-' + file.id"
        class="w-32 h-32 m-2 cursor-pointer bg-gray-200"
        :class="{'border border-dashed border-blue-600': !uploadedFiles.length}"
        :file="file"
        :related-files="uploadedFiles"
        downloadable
        :removable="!readonly && !disable"
        @remove="onRemove(file)"
      />
      <div
        v-if="!disable && !readonly"
        class="dx-add-remove-files w-32 h-32 m-2 rounded-2xl flex flex-col flex-nowrap items-center overflow-hidden cursor-pointer"
      >
        <div
          class="dx-add-file flex-grow p-1 pt-3 flex justify-center items-center bg-green-200 text-green-700 w-full hover:bg-green-100"
          @click="$refs.file.click()"
        >
          <div>
            <AddFileIcon class="w-10 m-auto" />
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
import { onMounted } from "vue";
import { useMultiFileUpload } from "../../../../helpers";
import { ImageIcon as AddFileIcon, TrashIcon as RemoveFileIcon } from "../../../../svg";
import { FormField, UploadedFile } from "../../../../types";
import { FilePreview } from "../../../Utility";
import FieldLabel from "./FieldLabel";

const emit = defineEmits(["update:model-value"]);
const props = defineProps<{
	modelValue?: UploadedFile[];
	field?: FormField;
	label?: string;
	showName?: boolean;
	disable?: boolean;
	readonly?: boolean;
}>();

const { onComplete, onDrop, onFilesSelected, uploadedFiles, clearUploadedFiles, onRemove } = useMultiFileUpload();
onMounted(() => {
	if (props.modelValue) {
		uploadedFiles.value = props.modelValue;
	}
});
onComplete(() => emit("update:model-value", uploadedFiles.value));
</script>
