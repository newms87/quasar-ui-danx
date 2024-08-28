<template>
  <div>
    <div
      v-if="label"
      class="font-bold text-xs mb-2"
    >
      {{ label }}
    </div>
    <div class="flex items-center cursor-pointer">
      <DateIcon class="w-5" />
      <div class="flex-grow font-bold ml-3 hover:opacity-70">
        <template v-if="date">
          {{ formattedDate }}
        </template>
        <template v-else>
          -&nbsp;-
        </template>
      </div>
      <div v-if="clearable && date">
        <QBtn
          icon="close"
          size="sm"
          round
          flat
          @click.stop.prevent="(date = null) || onSave()"
        />
      </div>
    </div>
    <QPopupProxy>
      <QDate
        v-model="date"
        @update:model-value="onSave"
      />
    </QPopupProxy>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon as DateIcon } from "@heroicons/vue/outline";
import { computed, ref, watch } from "vue";
import { fDate, parseQDate } from "../../../../helpers";

const emit = defineEmits(["update:model-value"]);
const props = defineProps<{
	modelValue?: string | null;
	label: string | null;
	clearable: boolean;
}>();

const formattedDate = computed(() => {
	if (props.modelValue) {
		return fDate(parseQDate(props.modelValue || "0000-00-00"));
	}
	return null;
});

const date = ref(props.modelValue);
watch(() => props.modelValue, val => date.value = val);

function onSave() {
	emit("update:model-value", date.value);
}
</script>
