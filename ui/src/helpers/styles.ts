export function applyCssVars(styles: object, prefix: string = "") {
    const cssVars = buildCssVars(styles, prefix);

    // Create a new <style> tag and inject the CSS Vars
    const style = document.createElement("style");
    style.innerHTML = `:root {${cssVars}}`;
    document.head.appendChild(style);
}

export function buildCssVars(styles: object, prefix: string = ""): string {
    // Convert the object into a CSS Vars string
    return Object.entries(styles).map(([key, value]) => {
        if (typeof value === "object") {
            return buildCssVars(value, `${prefix}${key}-`);
        }
        return `--${prefix}${key}: ${value}`;
    }).join(";");
}
