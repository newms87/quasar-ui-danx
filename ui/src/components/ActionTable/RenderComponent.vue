<template>
  <Component
    :is="component.is"
    v-bind="component.props"
    @action="$emit('action', $event)"
  >{{ component.value || component.props?.text || rowProps.value }}</Component>
</template>
<script setup>
import { computed } from "vue";

defineEmits(["action"]);
const props = defineProps({
  rowProps: {
    type: Object,
    required: true
  }
});

const component = computed(() => {
  return props.rowProps.col.component(props.rowProps.row);
});
</script>
