<template>
  <div>
    <q-input
        :model-value="fLocalizedDateTime(modelValue)"
        :color="color"
        class="bg-white rounded overflow-hidden px-2 w-48"
        dense
        readonly
        @click="isShowing = true"
    >
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy v-model="isShowing">
            <DateTimePicker
                v-model="dateTime"
                @cancel="isShowing = false"
                @save="onSave"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { fLocalizedDateTime } from '../../../../helpers';
import DateTimePicker from './DateTimePicker';

const emit = defineEmits(['update:model-value']);
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue-base'
  }
});

const isShowing = ref(false);
const dateTime = ref(props.modelValue);

function onSave() {
  emit('update:model-value', dateTime.value);
  isShowing.value = false;
}
</script>
