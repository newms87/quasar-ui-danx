<template>
  <div class="flex items-stretch flex-nowrap">
    <SelectField
      v-model="selected"
      class="flex-grow"
      :options="options"
    />
    <ShowHideButton
      v-if="showEdit"
      v-model="editing"
      label="Edit"
      class="bg-sky-800 w-1/5 ml-4"
    />
    <QBtn
      class="bg-green-900 ml-4 w-1/5"
      :loading="loading"
      @click="$emit('create')"
    >
      Create Schema
    </QBtn>
  </div>
</template>
<script setup lang="ts">
import { QSelectOption } from "quasar";
import { ShowHideButton } from "../../../Utility/Buttons";
import SelectField from "./SelectField";

defineEmits(["create"]);
const selected = defineModel<string>("selected");
const editing = defineModel<boolean>("editing");
defineProps<{
	options: QSelectOption[],
	showEdit?: boolean,
	loading?: boolean
}>();
</script>
