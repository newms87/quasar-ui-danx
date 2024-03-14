<template>
  <QBtn v-bind="$props" @click="$refs.fileUpload.click()">
    <slot>
      <PlusIcon class="w-5 mr-2" />
      {{ text }}
    </slot>

    <input
        ref="fileUpload"
        data-testid="file-upload"
        type="file"
        :accept="geolocation ? 'image/*;capture=camera' : undefined"
        :capture="geolocation ? 'environment' : undefined"
        class="hidden"
        multiple
        @change="onAttachFiles"
    />
  </QBtn>
</template>
<script setup>
import { FileUpload } from '@/helpers';
import { PlusIcon } from '@heroicons/vue/outline';
import { QBtn } from 'quasar';
import { ref } from 'vue';

defineExpose({ upload });
const emit = defineEmits([
  'uploading',
  'file-progress',
  'file-complete',
  'complete'
]);
const props = defineProps({
  ...QBtn.props,
  text: {
    type: String,
    default: 'Add File'
  },
  locationWaitMessage: {
    type: String,
    default: 'Waiting for location...'
  },
  geolocation: Boolean
});

const fileUpload = ref(null);

function upload() {
  fileUpload.value.click();
}

/**
 * Upload newly attached files and emit events for progress / completion
 *
 * @param files
 * @returns {Promise<void>}
 */
async function onAttachFiles({ target: { files } }) {
  emit('uploading', files);
  let fileUpload = new FileUpload(files)
      .onProgress(({ file, progress }) => {
        file.progress = progress;
        emit('file-progress', file);
      })
      .onComplete(({ file, uploadedFile }) => {
        emit('file-complete', { file, uploadedFile });
      })
      .onAllComplete(() => {
        emit('complete', fileUpload.files);
      });

  if (props.geolocation) {
    await fileUpload.resolveLocation(props.locationWaitMessage);
  }

  fileUpload.upload();
}
</script>
