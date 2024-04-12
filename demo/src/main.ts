import "./assets/main.css";
import "quasar/src/css/index.sass";
import "@quasar/extras/material-icons/material-icons.css";
import { Quasar } from "quasar";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);
app.use(Quasar, {
    plugins: {}
});

app.mount("#app");
