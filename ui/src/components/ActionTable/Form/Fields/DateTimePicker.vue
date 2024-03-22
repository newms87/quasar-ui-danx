<template>
  <q-popup-proxy
      :model-value="true"
      cover
      transition-show="scale"
      transition-hide="scale"
      class="bg-transparent shadow-none flex items-stretch"
  >
    <q-date v-model="dateTime" :mask="mask" :color="color">
      <div class="flex items-center justify-center">
        <div v-if="nullable" class="flex-grow">
          <q-btn label="Clear" color="blue-base" flat @click="dateTime = null" />
        </div>
        <div>
          <q-btn
              label="Cancel"
              color="blue-base"
              flat
              @click="$emit('cancel')"
          />
          <q-btn label="Set" color="blue-base" flat @click="$emit('save')" />
        </div>
      </div>
    </q-date>
    <q-time v-model="dateTime" :mask="mask" :color="color" class="ml-3" />
  </q-popup-proxy>
</template>
<script setup>
import { computed } from 'vue';
import { dbDateTime, localizedDateTime, remoteDateTime } from '../../../../helpers';

const emit = defineEmits(['update:modelValue', 'save', 'cancel', 'clear']);
const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  mask: {
    type: String,
    default: 'YYYY-MM-DD HH:mm'
  },
  color: {
    type: String,
    default: 'blue-base'
  },
  nullable: Boolean
});

const dateTime = computed({
  get: () => dbDateTime(localizedDateTime(props.modelValue)),
  set(value) {
    const newValue = value ? dbDateTime(remoteDateTime(value)) : null;

    if (newValue || props.nullable) {
      emit('update:modelValue', newValue);
    }
  }
});
</script>
