<template>
  <div
    class="max-w-full relative overflow-auto"
    :class="{'p-4 border rounded border-gray-300 text-center': !readonly}"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <FieldLabel
      :field="field"
      :show-name="showName"
      class="text-sm font-semibold"
    />
    <div
      v-if="!disable && !readonly"
      class="text-sm mt-2"
    >
      <a
        class="text-blue-600"
        @click="$refs.file.click()"
      >Upload</a>
      <a
        v-if="uploadedFile"
        class="ml-3 text-red-900"
        @click="clearUploadedFile"
      >Clear</a>
      <input
        ref="file"
        class="hidden"
        type="file"
        @change="onFileSelected"
      >
    </div>

    <FilePreview
      v-if="!readonly || uploadedFile"
      class="w-32 cursor-pointer mt-2"
      :class="{'border border-dashed border-blue-600': !uploadedFile, 'mx-auto': !readonly}"
      :image="uploadedFile"
      downloadable
      @click="!disable && $refs.file.click()"
    />
    <div
      v-else-if="readonly"
      class="py-1"
    >
      --
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useSingleFileUpload } from "../../../../helpers";
import { FilePreview } from "../../../Utility";
import FieldLabel from "./FieldLabel";

const emit = defineEmits(["update:model-value"]);
const props = defineProps({
  modelValue: {
    type: [Object, String],
    default: null
  },
  field: {
    type: Object,
    required: true
  },
  showName: Boolean,
  disable: Boolean,
  readonly: Boolean
});
const { onComplete, onDrop, onFileSelected, uploadedFile, clearUploadedFile } = useSingleFileUpload();
onComplete(() => emit("update:model-value", uploadedFile.value));

onMounted(() => {
  if (props.modelValue) {
    uploadedFile.value = props.modelValue;
  }
});
</script>
