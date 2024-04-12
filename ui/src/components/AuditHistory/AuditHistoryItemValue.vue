<template>
  <div class="flex space-x-2">
    <template v-if="type === 'SINGLE_FILE'">
      <FilePreview
          :image="value"
          class="w-24"
      />
    </template>
    <template v-else-if="type === 'MULTI_FILE'">
      <FilePreview
          v-for="file in value"
          :key="'file-' + file.id"
          :image="file"
          class="w-24 mb-2"
      />
    </template>
    <template v-else-if="type === 'WYSIWYG'">
      <div v-html="value" />
    </template>
    <template v-else>
      {{ format(value) }}
    </template>
  </div>
</template>
<script setup>
import { fCurrency, fDate, fLocalizedDateTime, fNumber } from "../../helpers";
import { FilePreview } from "../Utility";

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String, Array, Object, Boolean],
    default: null
  }
});

function format(value) {
  if (value === null || value === "" || value === undefined) {
    return "";
  }

  switch (props.type) {
    case "NUMBER":
      return fNumber(value);
    case "CURRENCY":
      return fCurrency(value);
    case "DATE":
      return fDate(value);
    case "DATETIME":
      return fLocalizedDateTime(value);
    case "BOOLEAN":
      return value ? "Yes" : "No";
  }

  return value;
}
</script>
