<template>
  <Component
      v-if="content"
      :is="resolvedComponent.is"
      v-bind="{...resolvedComponent.props, ...overrideProps}"
      @action="$emit('action', $event)"
  >{{ content }}</Component>
  <Component
      v-else
      :is="resolvedComponent.is"
      v-bind="{...resolvedComponent.props, ...overrideProps}"
      @action="$emit('action', $event)"
  />
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
    default: undefined
  },
  overrideProps: {
    type: Object,
    default: () => ({})
  }
});

const content = computed(() => resolvedComponent.value?.value || resolvedComponent.value?.props?.text || props.text);
const resolvedComponent = computed(() => {
  if (typeof props.component === 'function') {
    return props.component(...props.params);
  }
  return props.component;
});
</script>
