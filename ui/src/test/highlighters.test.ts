import { describe, it, expect } from "vitest";
import { highlightCSS } from "../helpers/formats/highlightCSS";
import { highlightJavaScript } from "../helpers/formats/highlightJavaScript";
import { highlightHTML } from "../helpers/formats/highlightHTML";
import { highlightSyntax } from "../helpers/formats/highlightSyntax";

describe("CSS Highlighter", () => {
	it("highlights selectors", () => {
		const result = highlightCSS(".test { }");
		expect(result).toContain("syntax-selector");
		expect(result).toContain(".test");
	});

	it("highlights properties and values", () => {
		const result = highlightCSS(".test { color: red; }");
		expect(result).toContain("syntax-property");
		expect(result).toContain("syntax-value");
	});

	it("highlights comments", () => {
		const result = highlightCSS("/* comment */");
		expect(result).toContain("syntax-comment");
	});

	it("highlights at-rules", () => {
		const result = highlightCSS("@media screen { }");
		expect(result).toContain("syntax-at-rule");
		expect(result).toContain("@media");
	});

	it("highlights strings", () => {
		const result = highlightCSS('@import "file.css";');
		expect(result).toContain("syntax-string");
	});
});

describe("JavaScript Highlighter", () => {
	it("highlights keywords", () => {
		const result = highlightJavaScript("const x = 1;");
		expect(result).toContain("syntax-keyword");
		expect(result).toContain("const");
	});

	it("highlights strings", () => {
		const result = highlightJavaScript('const s = "hello";');
		expect(result).toContain("syntax-string");
	});

	it("highlights numbers", () => {
		const result = highlightJavaScript("const n = 42;");
		expect(result).toContain("syntax-number");
		expect(result).toContain("42");
	});

	it("highlights single-line comments", () => {
		const result = highlightJavaScript("// comment");
		expect(result).toContain("syntax-comment");
	});

	it("highlights multi-line comments", () => {
		const result = highlightJavaScript("/* comment */");
		expect(result).toContain("syntax-comment");
	});

	it("highlights template literals", () => {
		const result = highlightJavaScript("const t = `hello`;");
		expect(result).toContain("syntax-template");
	});

	it("highlights boolean values", () => {
		const result = highlightJavaScript("const b = true;");
		expect(result).toContain("syntax-boolean");
	});

	it("highlights null and undefined", () => {
		const result = highlightJavaScript("const n = null;");
		expect(result).toContain("syntax-null");
	});

	it("highlights operators", () => {
		const result = highlightJavaScript("x === y");
		expect(result).toContain("syntax-operator");
	});

	it("highlights regex", () => {
		const result = highlightJavaScript("const r = /test/gi;");
		expect(result).toContain("syntax-regex");
	});
});

describe("HTML Highlighter", () => {
	it("highlights tags", () => {
		const result = highlightHTML("<div></div>");
		expect(result).toContain("syntax-tag");
	});

	it("highlights attributes", () => {
		const result = highlightHTML('<div class="test"></div>');
		expect(result).toContain("syntax-attribute");
		expect(result).toContain("class");
	});

	it("highlights attribute values as strings", () => {
		const result = highlightHTML('<div class="test"></div>');
		expect(result).toContain("syntax-string");
	});

	it("highlights comments", () => {
		const result = highlightHTML("<!-- comment -->");
		expect(result).toContain("syntax-comment");
	});

	it("highlights doctype", () => {
		const result = highlightHTML("<!DOCTYPE html>");
		expect(result).toContain("syntax-doctype");
	});

	it("highlights embedded CSS in style tags", () => {
		const result = highlightHTML("<style>.test { color: red; }</style>");
		expect(result).toContain("syntax-selector");
		expect(result).toContain("syntax-property");
		expect(result).toContain("syntax-value");
	});

	it("highlights embedded JavaScript in script tags", () => {
		const result = highlightHTML("<script>const x = 42;</script>");
		expect(result).toContain("syntax-keyword");
		expect(result).toContain("syntax-number");
	});
});

describe("highlightSyntax dispatcher", () => {
	it("dispatches to CSS highlighter", () => {
		const result = highlightSyntax(".test { }", { format: "css" });
		expect(result).toContain("syntax-selector");
	});

	it("dispatches to JavaScript highlighter", () => {
		const result = highlightSyntax("const x = 1;", { format: "javascript" });
		expect(result).toContain("syntax-keyword");
	});

	it("dispatches to HTML highlighter", () => {
		const result = highlightSyntax("<div></div>", { format: "html" });
		expect(result).toContain("syntax-tag");
	});

	it("escapes HTML for text format", () => {
		const result = highlightSyntax("<script>alert(1)</script>", { format: "text" });
		expect(result).toContain("&lt;script&gt;");
		expect(result).not.toContain("<script>");
	});
});
