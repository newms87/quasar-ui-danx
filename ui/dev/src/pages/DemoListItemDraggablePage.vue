<template>
  <PageLayout title="List Item Draggable Demo">
    <div data-drop-zone="list-items">
      <ListItemDraggable
        v-for="item in listItems"
        drop-zone="list-items"
        v-model:list-items="listItems"
        :key="item.name"
        show-handle
      >
        {{ item.name }}
      </ListItemDraggable>
    </div>
  </PageLayout>
</template>
<script setup>
import PageLayout from '@/layouts/PageLayout';
import { ListItemDraggable } from 'ui';
import { ref } from 'vue';

const listItems = ref([{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]);
</script>
