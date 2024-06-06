<template>
  <div>
    <div class="text-xs font-bold">
      {{ label }}
    </div>
    <div :class="valueClass">
      <a
        v-if="url"
        target="_blank"
        :href="url"
        :class="valueClass"
      >
        <slot>{{ value || "-" }}</slot>
      </a>
      <template v-else>
        <slot>{{ value || "-" }}</slot>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";

export interface LabelValueBlockProps {
	label: string;
	value: string | number | boolean;
	url?: string;
	dense?: boolean;
	nowrap?: boolean;
}

const props = withDefaults(defineProps<LabelValueBlockProps>(), {
	value: "",
	url: ""
});

const valueClass = computed(() => ({ "mt-2": !props.dense, "mt-1": props.dense, "text-no-wrap": props.nowrap }));
</script>
