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
      <QCardSection v-if="$slots.toolbar">
        <slot name="toolbar" />
      </QCardSection>
      <QCardSection
          v-if="content || $slots.default"
          class="px-6 bg-neutral-plus-7 flex-grow max-h-full overflow-y-auto"
          :class="contentClass"
      >
        <slot>{{ content }}</slot>
      </QCardSection>
      <div class="flex px-6 py-4 border-t border-gray-medium">
        <div class="flex-grow">
          <QBtn
              :label="cancelText"
              class="action-btn btn-white-gray"
              @click="onClose"
          >
            <slot name="cancel-text" />
          </QBtn>
        </div>
        <slot name="actions" />
        <div v-if="!hideConfirm">
          <QBtn
              :label="$slots['confirm-text'] ? '' : confirmText"
              class="action-btn ml-4"
              :class="confirmClass"
              :loading="isSaving"
              :disable="disabled"
              data-testid="confirm-button"
              @click="onConfirm"
          >
            <slot name="confirm-text" />
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
import { XIcon as CloseIcon } from "@heroicons/vue/outline";

const emit = defineEmits(["update:model-value", "confirm", "close"]);
const props = defineProps({
  modelValue: { type: [String, Boolean, Object], default: true },
  title: {
    type: String,
    default: ""
  },
  titleClass: {
    type: String,
    default: ""
  },
  subtitle: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    default: ""
  },
  backdropDismiss: Boolean,
  maximized: Boolean,
  fullWidth: Boolean,
  fullHeight: Boolean,
  disabled: Boolean,
  isSaving: Boolean,
  closeOnConfirm: Boolean,
  hideConfirm: Boolean,
  confirmText: {
    type: String,
    default: "Confirm"
  },
  cancelText: {
    type: String,
    default: "Cancel"
  },
  confirmClass: {
    type: String,
    default: "bg-blue-600 text-white"
  },
  contentClass: {
    type: String,
    default: ""
  }
});

function onConfirm() {
  emit("confirm");

  if (props.closeOnConfirm) {
    emit("close");
  }
}

function onClose() {
  emit("update:model-value", false);
  emit("close");
}
</script>
