import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import VueGtag from 'vue-gtag';

createApp(App)
  .use(router)
  .use(VueGtag, {
    config: { id: 'G-8JYV600SF5' },
  })
  .mount('#app');
