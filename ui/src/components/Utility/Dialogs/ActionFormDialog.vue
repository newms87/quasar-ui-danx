<template>
  <ConfirmDialog
    :title="title"
    :confirm-text="confirmText || title"
    @confirm="$emit('confirm', {name})"
    @close="$emit('close')"
  >
    <ActionForm
      :form="form"
      :action="action"
      :target="target"
    />
  </ConfirmDialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { ActionTargetItem, Form, ResourceAction } from "../../../types";
import { ActionForm } from "../../ActionTable";
import ConfirmDialog from "./ConfirmDialog";

defineEmits(["confirm", "close"]);
defineProps<{
	title: string;
	confirmText?: string;
	form: Form;
	action: ResourceAction;
	target: ActionTargetItem;
}>();
const name = ref("");
</script>
