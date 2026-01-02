<template>
  <div
    class="dx-language-badge"
    :class="{ 'is-toggleable': toggleable }"
    @click="toggleable && $emit('toggle')"
  >
    {{ format.toUpperCase() }}
  </div>
</template>

<script setup lang="ts">
export interface LanguageBadgeProps {
  format: string;
  toggleable?: boolean;
}

withDefaults(defineProps<LanguageBadgeProps>(), {
  toggleable: true
});

defineEmits<{
  toggle: [];
}>();
</script>

<style lang="scss">
.dx-language-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px 8px;
  font-size: 0.7em;
  border-radius: 0 6px 0 6px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  z-index: 10;
  transition: all 0.2s;

  &.is-toggleable {
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
    }
  }
}
</style>
