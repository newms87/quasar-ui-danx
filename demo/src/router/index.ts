import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView
        },
        {
            path: "/about",
            name: "about",
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("../views/AboutView.vue")
        },
        // Temporarily disabled - esbuild has issues with template literals in this file
        // {
        //     path: "/demo",
        //     name: "demo",
        //     component: () => import("../views/DemoView.vue")
        // },
        {
            path: "/markdown",
            name: "markdown",
            component: () => import("../views/MarkdownPlayground.vue")
        }
    ]
});

export default router;
