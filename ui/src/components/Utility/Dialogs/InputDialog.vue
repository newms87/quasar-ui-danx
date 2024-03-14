<template>
  <ConfirmDialog
    v-bind="$props"
    @confirm="$emit('confirm', newInput)"
    @close="$emit('close', $event)"
  >
    <slot>
      <QInput
        v-model="newInput"
        type="number"
        class="w-full"
        @input="$emit('update:input', $event)"
      />
    </slot>
  </ConfirmDialog>
</template>
<script setup>
import ConfirmDialog from "src/components/Utility/Dialogs/ConfirmDialog";
import { ref } from "vue";

defineEmits(["confirm", "close", "update:input"]);
const props = defineProps({
  ...ConfirmDialog.props,
  title: {
    type: String,
    default: "Enter Value"
  },
  input: {
    type: [Number, String],
    default: ""
  }
});

const newInput = ref(props.input);
</script>
