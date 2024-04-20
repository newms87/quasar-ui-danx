<template>
  <div
      class="p-4"
      :class="{ 'is-collapsed': collapsed }"
  >
    <div
        v-for="item in allowedItems"
        :key="'nav-item-' + item.label"
    >
      <a class="nav-link" @click="item.onClick">
        <component
            :is="item.icon"
            class="nav-icon"
        />
        <div class="label ml-2">{{ item.label }}</div>
        <QTooltip v-if="collapsed">{{ item.label }}</QTooltip>
      </a>
      <QSeparator
          v-if="item.separator"
          :key="'separator-' + item.label"
          class="my-2"
      />
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  collapsed: Boolean,
  items: {
    type: Array,
    required: true
  }
});

const allowedItems = computed(() => props.items.filter((item) => !item.hidden));
</script>

<style lang="scss">
.nav-link {
  display: block !important;
  padding: 1.2em;
  border-radius: 0.5em;
  font-weight: bold;
  font-size: 14px;
  color: black;
  height: 3.8em;
  width: 13em;
  transition: all 150ms;

  &:hover {
    @apply bg-gray-200;
    .nav-icon {
      @apply text-gray-700;
    }
  }

  &.is-active {
    @apply bg-blue-100;
  }

  &.is-disabled {
    @apply bg-inherit;
  }

  .label {
    @apply transition-all;
  }

  .nav-icon {
    @apply w-5 h-5 flex-shrink-0 text-black;
  }
}

.is-collapsed {
  .nav-link {
    width: 3.8em;
  }

  .label {
    @apply opacity-0;
  }
}
</style>
