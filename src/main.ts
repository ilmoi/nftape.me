import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import VueHead from 'vue-head';
// import VueGtag from 'vue-gtag';

createApp(App)
  .use(router)
  .use(VueHead)
  // .use(VueGtag, {
  //   config: { id: 'G-6MN98MZZPL' },
  // })
  .mount('#app');
