<template>
  <div
    class="code-footer flex items-center justify-between px-2 py-1 flex-shrink-0"
    :class="{ 'has-error': hasError }"
  >
    <div class="text-xs flex-1 min-w-0" :class="hasError ? 'text-red-400' : 'text-gray-500'">
      <template v-if="validationError">
        <span class="font-medium">
          Error<template v-if="validationError.line"> (line {{ validationError.line }})</template>:
        </span>
        <span class="truncate">{{ validationError.message }}</span>
      </template>
      <template v-else>
        {{ charCount.toLocaleString() }} chars
      </template>
    </div>
    <!-- Edit toggle button -->
    <QBtn
      v-if="canEdit"
      flat
      dense
      round
      size="sm"
      class="text-gray-500 hover:text-gray-700"
      :class="{ 'text-sky-500 hover:text-sky-600': isEditing }"
      @click="$emit('toggle-edit')"
    >
      <EditIcon class="w-3.5 h-3.5" />
    </QBtn>
  </div>
</template>

<script setup lang="ts">
import { FaSolidPencil as EditIcon } from "danx-icon";
import { QBtn } from "quasar";
import { computed } from "vue";
import { ValidationError } from "../../../composables/useCodeFormat";

export interface CodeViewerFooterProps {
	charCount: number;
	validationError: ValidationError | null;
	canEdit: boolean;
	isEditing: boolean;
}

const props = defineProps<CodeViewerFooterProps>();

defineEmits<{
	"toggle-edit": [];
}>();

const hasError = computed(() => props.validationError !== null);
</script>
