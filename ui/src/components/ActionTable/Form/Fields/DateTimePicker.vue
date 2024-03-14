<template>
  <QPopupProxy
    :model-value="true"
    cover
    transition-show="scale"
    transition-hide="scale"
    class="bg-transparent shadow-none flex items-stretch"
  >
    <QDate v-model="dateTime" :mask="mask" :color="color">
      <div class="flex items-center justify-center">
        <div v-if="nullable" class="flex-grow">
          <QBtn label="Clear" color="blue-base" flat @click="dateTime = null" />
        </div>
        <div>
          <QBtn
            label="Cancel"
            color="blue-base"
            flat
            @click="$emit('cancel')"
          />
          <QBtn label="Set" color="blue-base" flat @click="$emit('save')" />
        </div>
      </div>
    </QDate>
    <QTime v-model="dateTime" :mask="mask" :color="color" class="ml-3" />
  </QPopupProxy>
</template>
<script setup>
import { dbDateTime, localizedDateTime, remoteDateTime } from "../helpers/formats";
import { computed } from "vue";

const emit = defineEmits(["update:modelValue", "save", "cancel", "clear"]);
const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  mask: {
    type: String,
    default: "YYYY-MM-DD HH:mm"
  },
  color: {
    type: String,
    default: "blue-base"
  },
  nullable: Boolean
});

const dateTime = computed({
  get: () => dbDateTime(localizedDateTime(props.modelValue)),
  set(value) {
    const newValue = value ? dbDateTime(remoteDateTime(value)) : null;

    if (newValue || props.nullable) {
      emit("update:modelValue", newValue);
    }
  }
});
</script>
