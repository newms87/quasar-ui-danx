<template>
  <a
      class="p-3 actionable"
      :class="{'opacity-50 cursor-not-allowed': disabled}"
  >
    <Transition
        mode="out-in"
        :duration="150"
    >
      <q-spinner
          v-if="loading"
          class="w-4 h-4 text-black"
      />
      <MenuIcon
          v-else
          class="w-4 text-black"
      />
    </Transition>
    <q-menu
        v-if="!disabled"
        auto-close
    >
      <q-list>
        <template v-for="item in items">
          <a
              v-if="item.url"
              :key="item.url"
              class="q-item"
              target="_blank"
              :href="item.url"
              :class="item.class"
          >
            {{ item.label }}
          </a>
          <q-item
              v-else
              :key="item.action"
              clickable
              :class="item.class"
              @click="onAction(item)"
          >
            {{ item.label }}
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </a>
</template>
<script setup>
import { DotsVerticalIcon as MenuIcon } from '@heroicons/vue/outline';

const emit = defineEmits(['action', 'action-item']);
defineProps({
  items: {
    type: Array,
    required: true,
    validator(items) {
      return items.every((item) => item.label && (item.url || item.action));
    }
  },
  disabled: Boolean,
  loading: Boolean
});

function onAction(item) {
  emit('action', item.action);
  emit('action-item', item);
}
</script>
