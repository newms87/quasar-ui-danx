# Component Danx

[![npm](https://img.shields.io/npm/v/quasar-ui-danx.svg?label=quasar-ui-danx)](https://www.npmjs.com/package/quasar-ui-danx)
[![npm](https://img.shields.io/npm/dt/quasar-ui-danx.svg)](https://www.npmjs.com/package/quasar-ui-danx)

**Compatible with Quasar UI v2 and Vue 3**.

# Component Danx

> Component and function library built on Quasar + Vue 3

# Usage

```vue

<template>
  <ActionTable
      label="Danx"
      name="danx"
      v-model:quasar-pagination="quasarPagination"
      v-model:selected-rows="selectedRows"
      :columns="columns"
  />
</template>
<script setup>
  import 'quasar-ui-danx/dist/index.css';
  import { ActionTable, useTableColumns, useListControls } from 'quasar-ui-danx';

  const { columns } = useTableColumns([{ name: 'name', label: 'Name' }, { name: 'age', label: 'Age' }]);
  const { quasarPagination, selectedRows } = useListControls({});
</script>
```

# Setup

```bash
$ yarn
```

# Developing

```bash
# start dev in SPA mode
$ yarn dev
```

# Building package

```bash
$ yarn build
```

# Adding Testing Components

in the `ui/dev/src/pages` you can add Vue files to test your component/directive. When using `yarn dev` to build the UI,
any pages in that location will automatically be picked up by dynamic routing and added to the test page.

# License

MIT (c) Dan <dan@flytedesk.com>
