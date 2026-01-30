import { createRouter, createWebHistory } from "vue-router";

import SharedPage from "@/components/SharedPage.vue";
import StarredPage from "@/components/StarredPage.vue";
import HomeView from "@/components/HomeView.vue";

const routes = [
    { path: "/", component: HomeView },

    { path: "/my-files", component: HomeView },
    { path: "/shared", component: SharedPage },
    { path: "/starred", component: StarredPage },

    {
        path: "/is-gorevleri",
        component: HomeView,
        props: { api: "tasks" },
    },
    {
        path: "/gunluk-hayat",
        component: HomeView,
        props: { api: "gunlukHayat" },
    },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});