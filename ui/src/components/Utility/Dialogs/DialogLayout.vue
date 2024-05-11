<template>
  <QDialog
    class="dx-dialog"
    :full-height="fullHeight"
    :full-width="fullWidth"
    :model-value="true"
    :no-backdrop-dismiss="!backdropDismiss"
    :maximized="maximized"
    @update:model-value="onClose"
  >
    <QCard class="dx-dialog-card flex flex-col flex-nowrap">
      <QCardSection
        class="dx-dialog-header flex items-center"
      >
        <div class="flex-grow">
          <h3
            v-if="title || $slots.title"
            class="dx-dialog-title flex items-center"
            :class="titleClass"
          >
            <slot name="title">
              {{ title }}
            </slot>
          </h3>
          <div
            v-if="subtitle || $slots.subtitle"
            class="dx-dialog-subtitle"
          >
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </div>
        </div>
        <div>
          <div
            class="dx-close-button cursor-pointer"
            @click="onClose"
          >
            <CloseIcon class="w-5" />
          </div>
        </div>
      </QCardSection>
      <QCardSection v-if="$slots.toolbar">
        <slot name="toolbar" />
      </QCardSection>
      <QCardSection
        v-if="content || $slots.default"
        class="dx-dialog-content flex-grow max-h-full overflow-y-auto"
        :class="contentClass"
      >
        <slot>{{ content }}</slot>
      </QCardSection>
      <div class="flex dx-dialog-actions">
        <slot name="actions" />
      </div>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { XIcon as CloseIcon } from "@heroicons/vue/outline";
import { DialogLayoutProps } from "../../../types";

const emit = defineEmits(["close"]);

withDefaults(defineProps<DialogLayoutProps>(), {
	title: "",
	titleClass: "",
	subtitle: "",
	content: "",
	contentClass: ""
});

function onClose() {
	emit("close");
}
</script>
