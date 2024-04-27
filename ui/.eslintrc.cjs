module.exports = {
	root: true,

	parser: "vue-eslint-parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		parser: "@typescript-eslint/parser",
		project: "./tsconfig.json", // Specify it only for TypeScript files
		extraFileExtensions: [".vue"]
	},

	env: {
		node: true,
		browser: true,
		"vue/setup-compiler-macros": true
	},

	extends: [
		"eslint:recommended",
		"plugin:vue/vue3-recommended", // Priority C: Recommended
		"plugin:@typescript-eslint/recommended"
	],

	plugins: [
		"vue",
		"@typescript-eslint",
		"import"
	],

	rules: {
		"prefer-promise-reject-errors": "off",
		"no-debugger":
				process.env.NODE_ENV === "production" ? "error" : "off",
		"import/extensions": ["error", "never"],
		// allow any
		"@typescript-eslint/no-explicit-any": "off"
	}
};
