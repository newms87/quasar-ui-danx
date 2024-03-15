<template>
  <div>
    <q-list>
      <q-item
        v-for="item in items"
        :key="item.label"
        :to="item.path"
        @click="item.action"
      >
        <q-item-section avatar>
          <q-icon name="pdf" />
        </q-item-section>
        <q-item-section>
          {{ item.label }}
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    validator(items) {
      return items.every((item) => item.label && (item.path || item.url || item.action));
    }
  }
});
</script>
