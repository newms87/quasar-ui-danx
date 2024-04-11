import { fileURLToPath } from "node:url";
import { resolve } from "path";
import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default ({ mode }) => console.log("MODE", mode) || mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: "jsdom",
            exclude: [...configDefaults.exclude, "e2e/*"],
            root: fileURLToPath(new URL("./", import.meta.url))
        },
        resolve: {
            alias: {
                ...(mode === "development" ? { "quasar-ui-danx": resolve(__dirname, "../quasar-ui-danx/src") } : {})
            }
        }
    })
)
