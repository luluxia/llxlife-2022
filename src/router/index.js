import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/world/main/0,0",
      // name: "home",
      // component: HomeView,
    },
    {
      path: "/world/:world/:position?",
      name: "home",
      component: {template: ''}
    },
    {
      path: "/edit",
      name: "edit",
      component: {template: ''}
    }
  ],
});

export default router;
