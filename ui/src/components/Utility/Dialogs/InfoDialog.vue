<template>
  <QDialog
      :full-height="fullHeight"
      :full-width="fullWidth"
      :model-value="!!modelValue"
      :no-backdrop-dismiss="!backdropDismiss"
      :maximized="maximized"
      @update:model-value="onClose"
  >
    <QCard class="flex flex-col flex-nowrap">
      <QCardSection
          v-if="title || $slots.title"
          class="pl-6 pr-10 border-b border-gray-medium"
      >
        <h3
            class="font-normal flex items-center"
            :class="titleClass"
        >
          <slot name="title">{{ title }}</slot>
        </h3>
        <div
            v-if="subtitle"
            class="mt-1 text-sm"
        >{{ subtitle }}
        </div>
      </QCardSection>
      <QCardSection
          v-if="content || $slots.default"
          class="px-6 bg-neutral-plus-7 flex-grow max-h-full overflow-y-auto"
      >
        <slot>{{ content }}</slot>
      </QCardSection>
      <div
          class="flex items-center justify-center px-6 py-4 border-t border-gray-medium"
      >
        <div class="flex-grow text-right">
          <QBtn
              :label="doneText"
              class="action-btn btn-white-gray"
              @click="onClose"
          >
            <slot name="done-text" />
            </QBtn>
        </div>
      </div>
      <a
          class="absolute top-0 right-0 p-4 text-black"
          @click="onClose"
      >
        <CloseIcon class="w-5" />
      </a>
      </QCard>
      </QDialog>
</template>

<script setup>
import { XIcon as CloseIcon } from '@heroicons/vue/outline';

const emit = defineEmits(['update:model-value', 'close']);
defineProps({
  modelValue: { type: [Boolean, Object], default: true },
  title: {
    type: String,
    default: ''
  },
  titleClass: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  backdropDismiss: Boolean,
  maximized: Boolean,
  fullWidth: Boolean,
  fullHeight: Boolean,
  doneText: {
    type: String,
    default: 'Done'
  }
});

function onClose() {
  emit('update:model-value', false);
  emit('close');
}
</script>
