<template>
  <DialogLayout
    class="dx-confirm-dialog"
    v-bind="layoutProps"
    @close="onClose"
    @keyup.enter="onConfirm"
  >
    <template
      v-for="slotName in childSlots"
      #[slotName]
    >
      <slot :name="slotName" />
    </template>
    <slot />

    <template #actions>
      <div class="dx-dialog-button-cancel">
        <QBtn
          :label="cancelText"
          class="dx-dialog-button"
          @click="onClose"
        >
          <slot name="cancel-text" />
        </QBtn>
      </div>
      <slot name="actions" />
      <div
        v-if="!hideConfirm"
        class="dx-dialog-button-confirm"
      >
        <QBtn
          :label="$slots['confirm-text'] ? '' : confirmText"
          class="dx-dialog-button"
          :class="confirmClass"
          :loading="isSaving"
          :disable="disabled"
          data-testid="confirm-button"
          @click="onConfirm"
        >
          <slot name="confirm-text" />
        </QBtn>
      </div>
    </template>
  </DialogLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ConfirmDialogProps } from "../../../types";
import DialogLayout from "./DialogLayout";

const emit = defineEmits(["update:model-value", "confirm", "close"]);

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
	confirmText: "Confirm",
	cancelText: "Cancel",
	confirmClass: "",
	contentClass: ""
});

const layoutProps = computed(() => ({ ...props, disabled: undefined }));
const childSlots = computed(() => ["title", "subtitle", "toolbar"]);

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
