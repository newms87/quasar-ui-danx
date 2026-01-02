<template>
  <div
    class="dx-language-badge-container"
    :class="{ 'is-toggleable': toggleable && availableFormats.length > 1 }"
    @mouseenter="showOptions = true"
    @mouseleave="showOptions = false"
  >
    <!-- Other format options (slide out to the left) -->
    <transition name="slide-left">
      <div
        v-if="showOptions && toggleable && otherFormats.length > 0"
        class="dx-language-options"
      >
        <div
          v-for="fmt in otherFormats"
          :key="fmt"
          class="dx-language-option"
          @click.stop="$emit('change', fmt)"
        >
          {{ fmt.toUpperCase() }}
        </div>
      </div>
    </transition>

    <!-- Current format badge (stays in place) -->
    <div class="dx-language-badge" :class="{ 'is-active': showOptions && otherFormats.length > 0 }">
      {{ format.toUpperCase() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

export interface LanguageBadgeProps {
  format: string;
  availableFormats?: string[];
  toggleable?: boolean;
}

const props = withDefaults(defineProps<LanguageBadgeProps>(), {
  availableFormats: () => [],
  toggleable: true
});

defineEmits<{
  change: [format: string];
}>();

const showOptions = ref(false);

// Get formats other than the current one
const otherFormats = computed(() => {
  return props.availableFormats.filter(f => f !== props.format);
});
</script>

<style lang="scss">
.dx-language-badge-container {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  z-index: 10;

  &.is-toggleable {
    cursor: pointer;
  }
}

.dx-language-options {
  display: flex;
  align-items: center;
}

.dx-language-option {
  padding: 2px 8px;
  font-size: 0.7em;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    color: rgba(255, 255, 255, 0.95);
  }

  &:first-child {
    border-radius: 6px 0 0 6px;
  }
}

.dx-language-badge {
  padding: 2px 8px;
  font-size: 0.7em;
  border-radius: 0 6px 0 6px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  transition: all 0.2s;

  &.is-active {
    border-radius: 0 6px 0 0;
  }
}

// Slide animation for options
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
