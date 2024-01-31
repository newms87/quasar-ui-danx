<template>
  <q-page padding>


    <h1 class="text-2xl mb-3">Danx Examples</h1>

    <div data-drop-zone="list-items">
      <ListItemDraggable
        v-for="item in listItems"
        drop-zone="list-items"
        v-model:list-items="listItems"
        :key="item.name"
        @position="onPosition"
        show-handle
      >
        {{ item.name }}
      </ListItemDraggable>
    </div>

  </q-page>
</template>
<script setup>
import { ref } from "vue";
import ListItemDraggable from "../../../src/components/DragAndDrop/ListItemDraggable";

const listItems = ref([{ name: "item1" }, { name: "item2" }, { name: "item3" }]);
function onPosition(newPosition) {
  console.log('position', newPosition, listItems.value);
}
</script>
<style lang="sass" scoped>
.directive-target
  width: 50px
  height: 50px
</style>
