<template>
  <q-page padding>


    <h1>Danx Examples</h1>

    <ListItemDraggable v-for="item in listItems">
      {{ item.name }}
    </ListItemDraggable>

  </q-page>
</template>
<script setup>
import { ref } from "vue";
import ListItemDraggable from "../../../src/components/DragAndDrop/ListItemDraggable";

const listItems = [{name: "item1"}, {name: "item2"}, {name: "item3"}];
</script>
<style lang="sass" scoped>
.directive-target
  width: 50px
  height: 50px
</style>
