<template>
  <DialogLayout
    class="dx-confirm-dialog"
    v-bind="layoutProps"
    @close="onClose"
  >
    <template #actions>
      <div class="flex-grow">
        <QBtn
          :label="cancelText"
          class="dx-dialog-button dx-dialog-button-cancel"
          @click="onClose"
        >
          <slot name="cancel-text" />
        </QBtn>
      </div>
      <slot name="actions" />
      <div v-if="!hideConfirm">
        <QBtn
          :label="$slots['confirm-text'] ? '' : confirmText"
          class="dx-dialog-button dx-dialog-button-confirm"
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

<script setup>
import { computed } from "vue";
import DialogLayout from "./DialogLayout";

const emit = defineEmits(["update:model-value", "confirm", "close"]);
const props = defineProps({
	...DialogLayout.props,
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
		default: ""
	},
	contentClass: {
		type: String,
		default: ""
	}
});

const layoutProps = computed(() => ({ ...props, disabled: undefined }));

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
