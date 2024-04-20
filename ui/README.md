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
yarn create vue # Follow instructions for settings up new Vue App
yarn add quasar-ui-danx quasar
yarn add -D sass vite-svg-loader tailwindcss eslint eslint-plugin-import autoprefixer
```

### Setup PHPStorm

* Disable Typescript language service
* Setup node_modules directory as a library
* Configure `tsconfig.json`

```json
{
  "include": [
    "node_modules/quasar-ui-danx/**/*"
  ]
}
```

* Configure `vite.config.ts`

```ts
export default ({ command }) => {
    // For development w/ HMR, load the danx library + styles directly from the directory
    // NOTE: These are the paths relative to the mounted quasar-ui-danx directory inside the mva docker container
    const danx = (command === "serve" ? {
        "quasar-ui-danx": resolve(__dirname, "../quasar-ui-danx/ui/src"),
        "quasar-ui-danx-styles": resolve(__dirname, "../quasar-ui-danx/src/styles/index.scss")
    } : {
        // Import from quasar-ui-danx module for production
        "quasar-ui-danx-styles": "quasar-ui-danx/dist/style.css"
    });

    return defineConfig({
        resolve: {
            alias: {
                ...danx
            }
        },
    });
}
```

* Add node_modules as a library in PHPStorm
    * Settings -> Directories -> Add
    * Create a new directory w/ name node_modules and set the directory to the node_modules directory in your project
* Symlink Danx UI library
    * FOR LOCAL DEVELOPMENT ONLY: if you plan on updating Danx UI
        * Symlinking the danx UI library allows for better integration w/ PHPStorm + tailwindcss + HMR w/ vite.
            * NOTE: Setting this up w/ `npm link` or trying to modify tsconfig.json / vite.config.ts only can be quite
              challenging to get everything configured correctly. I found this to be the best solution.
    * copy/paste and run `./danx-local.sh`
        * (recommended) Configure yarn / npm to always run this after updating packages
            * Add `{"scripts: {..., "postinstall": "./danx-local.sh"}}` to your package.json
    * (or manually symlink node_modules/quasar-ui-danx to ../../quasar-ui-danx/ui/src)
        * Directory structure of your project relative to quasar-ui-danx:

```
- parent-directory
  - your-app
    - tsconfig.json
    - vite.config.ts
    - src
    - node_modules
      - quasar-ui-danx -> (symlink) ../../quasar-ui-danx/ui/src
  - quasar-ui-danx
    - ui
      - src
      - tests
```

### Setup Tailwind

Initialize config files for tailwind
NOTE: vite will automatically pick up the postcss.config.js file, no need to manually configure anything

```
npx tailwindcss init -p
```

* Rename tailwind.config.js to tailwind.config.ts
* Setup your tailwind.config.ts:
    * Make any changes to the colors object

```ts
/** @type {import('tailwindcss').Config} */
export const colors = {}

export default {
    content: [],
    theme: {
        extend: {
            colors
        }
    },
    plugins: []
}
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
