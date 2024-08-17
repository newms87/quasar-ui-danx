<template>
  <div>
    <div class="text-xs font-bold">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div :class="valueClass">
      <template v-if="url">
        <a
          v-if="!isLargeContent"
          target="_blank"
          :href="url"
        >
          <slot>{{ formattedValue }}</slot>
        </a>
        <template v-else>
          <slot>{{ formattedValue }}</slot>
          <a
            target="_blank"
            :href="url"
            class="inline-block ml-2"
          >
            <LinkIcon class="w-4" />
          </a>
        </template>
      </template>
      <template v-else>
        <slot>{{ formattedValue }}</slot>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FaSolidLink as LinkIcon } from "danx-icon";
import { computed } from "vue";
import { fBoolean, fNumber } from "../../../../helpers";

export interface LabelValueBlockProps {
	label: string;
	value?: string | number | boolean;
	url?: string;
	dense?: boolean;
	nowrap?: boolean;
}

const props = withDefaults(defineProps<LabelValueBlockProps>(), {
	value: "",
	url: ""
});

const valueClass = computed(() => ({ "mt-2": !props.dense, "mt-1": props.dense, "text-no-wrap": props.nowrap }));
const isLargeContent = computed(() => typeof props.value === "string" && props.value.length > 30);
const formattedValue = computed(() => {
	switch (typeof props.value) {
		case "boolean":
			return fBoolean(props.value);

		case "number":
			return fNumber(props.value);

		default:
			return props.value || "-";
	}
});
</script>
