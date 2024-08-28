<template>
  <div>
    <div class="mb-2">
      <FieldLabel :label="label" />
    </div>
    <template v-if="inline">
      <QDate
        v-model="dateRange"
        range
        class="reactive"
        @update:model-value="onSave"
      />
    </template>
    <template v-else>
      <div class="flex items-center cursor-pointer">
        <DateIcon class="w-5 py-2" />
        <div class="flex-grow font-bold ml-3 hover:opacity-70">
          <template v-if="dateRangeValue">
            {{ formattedDates.from }} - {{ formattedDates.to }}
          </template>
          <template v-else>
            -&nbsp;-
          </template>
        </div>
        <div v-if="clearable && dateRange">
          <QBtn
            icon="close"
            size="sm"
            round
            flat
            @click.stop.prevent="(dateRange = null) || onSave()"
          />
        </div>
      </div>
      <QPopupProxy>
        <QDate
          v-model="dateRange"
          range
          @update:model-value="onSave"
        />
      </QPopupProxy>
    </template>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon as DateIcon } from "@heroicons/vue/outline";
import { computed, ref, watch } from "vue";
import { fDate, parseQDate, parseQDateTime } from "../../../../helpers";
import FieldLabel from "./FieldLabel";

const emit = defineEmits(["update:model-value"]);
const props = defineProps<{
	modelValue?: { from: string; to: string } | null;
	label: string | null;
	inline: boolean;
	clearable: boolean;
	withTime: boolean;
}>();

const formattedDates = computed(() => {
	if (dateRangeValue.value) {
		if (props.withTime) {
			return {
				from: fDate(parseQDateTime(dateRangeValue.value.from || "0000-00-00")),
				to: fDate(parseQDateTime(dateRangeValue.value.to || "9999-12-31"))
			};
		}

		return {
			from: fDate(parseQDate(dateRangeValue.value.from || "0000-00-00")),
			to: fDate(parseQDate(dateRangeValue.value.to || "9999-12-31"))
		};
	}
	return {
		from: null,
		to: null
	};
});

const dateRange = ref(toQDateValue(props.modelValue));
watch(() => props.modelValue, val => dateRange.value = toQDateValue(val));

function toQDateValue(val) {
	if (val?.from && val?.to) {
		return fDate(val.from) === fDate(val.to) ? val.from : val;
	}
	return null;
}

const dateRangeValue = computed(() => {
	let range;

	if (typeof dateRange.value === "string") {
		range = {
			from: dateRange.value,
			to: dateRange.value
		};
	} else if (dateRange.value) {
		range = {
			from: dateRange.value.from,
			to: dateRange.value.to
		};
	}

	if (range?.from && range?.to && props.withTime && !range.from.includes("00:00:00")) {
		range.from += " 00:00:00";
		range.to += " 23:59:59";
	}

	return range;
});

function onSave() {
	emit("update:model-value", dateRangeValue.value);
}
</script>
