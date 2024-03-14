<template>
  <div class="inline-block">
    <div
      class="cursor-pointer py-2 hover:bg-blue-light flex items-center justify-end"
    >
      {{ fLocalizedDateTime(modelValue, { empty: "Never" }) }}
      <EditIcon class="w-4 font-bold ml-2 text-gray-base" />
      <QPopupEdit
        v-slot="scope"
        :model-value="modelValue"
        touch-position
        :offset="[0, 20]"
        class="bg-blue-base text-white !min-w-0"
      >
        <DateTimePicker
          v-model="scope.value"
          :nullable="nullable"
          @save="onSave(scope)"
          @cancel="scope.cancel"
        />
      </QPopupEdit>
    </div>
  </div>
</template>
<script setup>
import { PencilIcon as EditIcon } from "@heroicons/vue/solid";
import DateTimePicker from "danx/src/components/ActionTable/Form/Fields/DateTimePicker";
import { fLocalizedDateTime } from "danx/src/helpers/formats";

const emit = defineEmits(["close", "save", "update:model-value"]);
defineProps({
  modelValue: {
    type: String,
    default: null
  },
  nullable: Boolean
});

function onSave(scope) {
  emit("update:model-value", scope.value);
  emit("save", scope.value);
  scope.set();
}
</script>
