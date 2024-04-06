<template>
  <Component
      :is="resolvedComponent.is"
      v-bind="{...resolvedComponent.props, ...overrideProps}"
      @action="$emit('action', $event)"
  >{{ resolvedComponent.value || resolvedComponent.props?.text || text }}</Component>
</template>
<script setup>
import { computed } from 'vue';

defineEmits(['action']);
const props = defineProps({
  component: {
    type: [Function, Object],
    required: true
  },
  params: {
    type: Array,
    default: () => []
  },
  text: {
    type: String,
    default: ''
  },
  overrideProps: {
    type: Object,
    default: () => ({})
  }
});

const resolvedComponent = computed(() => {
  if (typeof props.component === 'function') {
    return props.component(...props.params);
  }
  return props.component;
});
</script>
