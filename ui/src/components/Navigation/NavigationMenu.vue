<template>
  <div
    class="p-4"
    :class="{ 'is-collapsed': collapsed }"
  >
    <div
      v-for="item in allowedItems"
      :key="'nav-item-' + item.label"
      class="nav-menu-item-box"
    >
      <div
        class="nav-menu-item flex flex-nowrap"
        :class="item.class || itemClass"
        @click="item.onClick"
      >
        <div
          v-if="item.icon"
          class="flex-shrink-0"
        >
          <component
            :is="item.icon"
            class="nav-icon"
            :class="item.iconClass"
          />
        </div>
        <div
          v-if="!collapsed"
          class="label ml-2"
          :class="item.labelClass"
        >
          {{ item.label }}
        </div>
        <QTooltip
          v-if="collapsed"
          v-bind="item.tooltip"
        >
          {{ item.tooltip?.text || item.label }}
        </QTooltip>
      </div>
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
  itemClass: {
    type: String,
    default: "hover:bg-gray-200"
  },
  activeClass: {
    type: String,
    default: "bg-blue-200"
  },
  items: {
    type: Array,
    required: true
  }
});

const allowedItems = computed(() => props.items.filter((item) => !item.hidden));
</script>

<style lang="scss">
.nav-menu-item {
  padding: 1em;
  border-radius: 0.5em;
  font-weight: bold;
  font-size: 14px;
  transition: all 150ms, color 0ms;
  cursor: pointer;

  &.is-disabled {
    @apply bg-inherit;
  }

  .label {
    @apply transition-all;
  }

  .nav-icon {
    @apply w-5 h-5 flex-shrink-0;
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
