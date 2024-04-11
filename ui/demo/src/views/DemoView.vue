<script setup lang="ts">
import { quasarPagination, selectedRows } from "@/components/DemoActionTable/demoTableActions";
import { columns } from "@/components/DemoActionTable/demoTableColumns";
import { ActionTable } from "quasar-ui-danx";
</script>

<template>
  <main>
    <ActionTable
        :columns="columns"
        v-model:quasar-pagination="quasarPagination"
        v-model:selected-rows="selectedRows"
        label="Items"
        name="danx-action-table"
    />
  </main>
</template>
