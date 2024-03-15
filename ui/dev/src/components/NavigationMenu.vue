<template>
  <div>
    <q-list>
      <q-item
        v-for="item in items"
        :key="item.label"
        :to="item.path"
        v-ripple
        @click="item.action"
      >
        <q-item-section avatar>
          <div class="text-center w-full">
            <img :src="item.icon" alt="" class="w-6 inline-block" />
          </div>
        </q-item-section>
        <template v-if="!hideLabel">
          <q-item-section class="whitespace-nowrap overflow-hidden">
            {{ item.label }}
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </template>
      </q-item>
    </q-list>
  </div>
</template>
<script setup>
defineProps({
  hideLabel: Boolean,
  items: {
    type: Array,
    required: true,
    validator(items) {
      return items.every((item) => item.label && (item.path || item.url || item.action));
    }
  }
});
</script>
