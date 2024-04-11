<script setup lang="ts">
import { initialize, pagedItems, quasarPagination, selectedRows } from "@/components/DemoActionTable/demoTableActions";
import { columns } from "@/components/DemoActionTable/demoTableColumns";
import { ActionTable } from "quasar-ui-danx";

initialize();
</script>

<template>
  <main>
    <ActionTable
        :paged-items="pagedItems"
        :columns="columns"
        v-model:quasar-pagination="quasarPagination"
        v-model:selected-rows="selectedRows"
        label="Items"
        name="danx-action-table"
    />
  </main>
</template>
