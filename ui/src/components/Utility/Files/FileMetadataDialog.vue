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
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
          <h4 class="text-base font-medium text-gray-900">
            Metadata
          </h4>
          <QBtn
            v-if="showDockButton"
            flat
            dense
            round
            size="sm"
            class="text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            @click="$emit('dock')"
          >
            <DockSideIcon class="w-4 h-4" />
            <QTooltip>Dock to side</QTooltip>
          </QBtn>
        </div>
        <div class="p-4 flex-1 min-h-0 flex flex-col">
          <CodeViewer
            :model-value="metadata"
            :readonly="true"
            format="yaml"
          />
        </div>
      </div>
    </div>
  </InfoDialog>
</template>

<script setup lang="ts">
import { FaSolidTableColumns as DockSideIcon } from "danx-icon";
import { CodeViewer } from "../Code";
import { InfoDialog } from "../Dialogs";

withDefaults(defineProps<{
	filename: string;
	mimeType?: string;
	metadata: Record<string, unknown>;
	showDockButton?: boolean;
}>(), {
	showDockButton: false
});

defineEmits<{
	close: [];
	dock: [];
}>();
</script>
