import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";

export default defineConfig({
	plugins: [vue(), svgLoader()],
	resolve: {
		extensions: [".mjs", ".js", ".ts", ".mts", ".jsx", ".tsx", ".json", ".vue", ".svg"]
	},
	build: {
		sourcemap: true,
		lib: {
			entry: resolve(__dirname, "./src/index.esm.js"),
			name: "Danx",
			// the proper extensions will be added
			fileName: (format) => `danx.${format}.js`
		},
		// Add rollupOptions only if you need to customize the build further
		rollupOptions: {
			// Externalize deps that shouldn't be bundled into your library
			external: ["vue", "quasar"],
			output: {
				// Provide globals here
				globals: {
					vue: "Vue",
					quasar: "Quasar"
				}
			}
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import "./src/styles/index.scss";`
			}
		}
	}
});
