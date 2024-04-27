<template>
  <QBtn
    class="dx-export-button dx-action-button"
    :loading="isExporting"
    @click="onExport"
  >
    <ExportIcon class="w-5" />
  </QBtn>
</template>
<script setup>
import { DownloadIcon as ExportIcon } from "@heroicons/vue/solid";
import { ref } from "vue";
import { FlashMessages } from "../../../helpers";

const props = defineProps({
  exporter: {
    type: Function,
    required: true
  }
});
const isExporting = ref(false);
async function onExport() {
  isExporting.value = true;
  try {
    await props.exporter();
  } catch (error) {
    console.error(error);
    FlashMessages.error("Failed to export data");
  }
  isExporting.value = false;
}
</script>
