<script setup lang="ts">
import { ref } from "vue";
import { CodeViewer } from "quasar-ui-danx";

const cssCode = ref(`.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* Comment example */
.button {
  background-color: #3498db;
  color: white;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
}`);

const jsCode = ref(`// JavaScript example with various features
const greeting = "Hello, World!";
let count = 42;

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

/* Multi-line comment
   explaining the arrow function */
const double = (x) => x * 2;

const obj = {
  name: "test",
  value: true,
  items: [1, 2, 3]
};

// Template literal
const template = \`Count is: \${count}\`;

// Regex example
const pattern = /[a-z]+/gi;

async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}`);

const htmlCode = ref(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test Page</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 20px;
    }
    .highlight {
      color: #e74c3c;
    }
  </style>
</head>
<body>
  <!-- Main content -->
  <div class="container" id="app">
    <h1>Welcome</h1>
    <p class="highlight">This is a test.</p>
    <button onclick="alert('clicked')">Click me</button>
  </div>
  <script>
    const app = document.getElementById('app');
    console.log('App initialized:', app);

    function greet(name) {
      return \`Hello, \${name}!\`;
    }
  </script>
</body>
</html>`);

const cssFormat = ref("css");
const jsFormat = ref("javascript");
const htmlFormat = ref("html");
</script>

<template>
  <main class="p-8 space-y-8">
    <h1 class="text-2xl font-bold">CodeViewer Language Support Demo</h1>

    <section>
      <h2 class="text-xl font-semibold mb-2">CSS Highlighting</h2>
      <CodeViewer
        v-model="cssCode"
        v-model:format="cssFormat"
        :can-edit="true"
        class="h-64"
      />
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-2">JavaScript Highlighting</h2>
      <CodeViewer
        v-model="jsCode"
        v-model:format="jsFormat"
        :can-edit="true"
        class="h-80"
      />
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-2">HTML Highlighting (with embedded CSS/JS)</h2>
      <CodeViewer
        v-model="htmlCode"
        v-model:format="htmlFormat"
        :can-edit="true"
        class="h-96"
      />
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-2">Light Theme - HTML</h2>
      <CodeViewer
        v-model="htmlCode"
        v-model:format="htmlFormat"
        :can-edit="true"
        theme="light"
        class="h-96"
      />
    </section>
  </main>
</template>
