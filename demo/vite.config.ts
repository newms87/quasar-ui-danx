import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";

import { defineConfig } from "vite";
import VueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default ({ mode }) => defineConfig({
    server: {
        port: 5887
    },
    plugins: [
        vue({
            template: { transformAssetUrls }
        }),
        VueDevTools(),
        quasar({
            sassVariables: "src/assets/quasar/variables.sass"
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            ...(mode === "development" ? { "quasar-ui-danx": resolve(__dirname, "../ui/src") } : {})
        },
        extensions: [".mjs", ".js", ".ts", ".mts", ".jsx", ".tsx", ".json", ".vue"]
    },
    optimizeDeps: {
        exclude: mode === "development" ? ["quasar-ui-danx"] : []
    }
});
