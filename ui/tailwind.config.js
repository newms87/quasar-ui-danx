/** @type {import("tailwindcss").Config} */
import twColors from "tailwindcss/colors";

const ignore = ["lightBlue", "warmGray", "trueGray", "coolGray", "blueGray"];

// Convert all TW colors to CSS Variables
const colorKeys = Object.keys(twColors).filter(c => !ignore.includes(c) && twColors[c].hasOwnProperty("500"));
const colors = {};

for (const name of colorKeys) {
    const twColor = twColors[name];
    for (const offset of Object.keys(twColor)) {
        colors[name] = colors[name] || {};
        colors[name][offset] = `var(--tw-${name}-${offset}, ${twColor[offset]})`;
    }
}

export default {
    content: ["./*.html", "./src/**/*.{vue,ts}"],
    theme: {
        extend: {
            colors
        }
    },
    plugins: []
};

