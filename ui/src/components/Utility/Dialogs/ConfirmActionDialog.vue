<template>
  <ConfirmDialog
    class="dx-confirm-action-dialog"
    v-bind="props"
    :confirm-text="confirmText || computedConfirmText"
    :title="title || computedTitle"
    :content="content || computedContentText"
    @confirm="$emit('confirm')"
    @close="$emit('close')"
  >
    <template
      v-for="slotName in childSlots"
      #[slotName]
    >
      <slot :name="slotName" />
    </template>
    <slot />
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { fNameOrCount } from "../../../helpers";
import { default as ConfirmDialog } from "./ConfirmDialog";
import { ConfirmActionDialogProps } from "./dialogs";

defineEmits(["confirm", "close"]);

const props = withDefaults(defineProps<ConfirmActionDialogProps>(), {
	message: "Are you sure you want to",
	modelValue: true
});

const nameLabel = computed(() => fNameOrCount(props.target, props.label));
const computedTitle = computed(() => `Confirm ${props.action} ${nameLabel.value}`);
const computedConfirmText = computed(() => `${props.action} ${nameLabel.value}`);
const computedContentText = computed(() => `${props.message} ${props.action.toLowerCase()} ${nameLabel.value}?`);

const childSlots = computed(() => ["title", "subtitle", "default", "toolbar", "actions"]);
</script>
