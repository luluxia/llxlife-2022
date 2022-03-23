import { createRouter, createWebHistory } from "vue-router";

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
      path: "/:pathMatch(.*)*",
      redirect: "/world/main/404,404",
      component: {template: ''}
    }
  ],
});

export default router;
