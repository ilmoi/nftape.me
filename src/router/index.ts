import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import ViewHome from '@/views/ViewHome.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'NFT APE',
    component: ViewHome,
  },
  {
    path: '/addr/:addr',
    name: 'NFT APE2',
    component: ViewHome,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
