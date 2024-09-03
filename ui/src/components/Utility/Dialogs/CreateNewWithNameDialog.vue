<template>
  <ConfirmDialog
    :title="title"
    :confirm-text="confirmText || title"
    @confirm="$emit('confirm', {name})"
    @close="$emit('close')"
  >
    <TextField
      v-model="name"
      label="Name"
    />
    <slot />
  </ConfirmDialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { TextField } from "../../ActionTable";
import ConfirmDialog from "./ConfirmDialog";

defineEmits(["confirm", "close"]);
defineProps<{
	title: string;
	confirmText?: string;
}>();
const name = ref("");
</script>
