import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import ViewHome from '@/views/ViewHome.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: ViewHome,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
