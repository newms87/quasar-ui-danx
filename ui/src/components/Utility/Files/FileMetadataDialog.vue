<template>
  <InfoDialog
    title="File Metadata"
    :hide-done="true"
    done-text="Close"
    content-class="w-[80vw] h-[80vh] max-w-none"
    @close="$emit('close')"
  >
    <div class="file-metadata-container h-full flex flex-col">
      <!-- File info header -->
      <div class="bg-sky-50 rounded-lg p-4 mb-4 flex-shrink-0">
        <h4 class="text-lg font-semibold text-gray-900 mb-2">
          {{ filename || 'Unnamed File' }}
        </h4>
        <div v-if="mimeType" class="text-sm text-gray-600">
          Type: {{ mimeType }}
        </div>
      </div>

      <!-- Metadata section -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h4 class="text-base font-medium text-gray-900">
            Metadata
          </h4>
        </div>
        <div class="p-4 flex-1 min-h-0 flex flex-col">
          <CodeViewer
            :model-value="metadata"
            :readonly="true"
            format="yaml"
            :show-format-toggle="true"
          />
        </div>
      </div>
    </div>
  </InfoDialog>
</template>

<script setup lang="ts">
import { CodeViewer } from "../Code";
import { InfoDialog } from "../Dialogs";

defineProps<{
	filename: string;
	mimeType?: string;
	metadata: Record<string, unknown>;
}>();

defineEmits<{
	close: [];
}>();
</script>
