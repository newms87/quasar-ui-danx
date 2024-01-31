<template>
  <q-page padding>


    <h1 class="text-2xl mb-3">Danx Examples</h1>

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

  </q-page>
</template>
<script setup>
import { ListItemDraggable } from "ui";
import { ref } from "vue";

const listItems = ref([{ name: "item1" }, { name: "item2" }, { name: "item3" }]);
</script>
