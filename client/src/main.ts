import './assets/main.css'
import { createApp } from "vue";
import App, { router } from "./App.vue";
import { pinia } from "./store/pinia"; 
import { VueQueryPlugin } from "@tanstack/vue-query";
import { queryClient } from "@/services/queryClient";


createApp(App)
  .use(pinia)
  .use(VueQueryPlugin, { queryClient })
  .use(router)
  .mount("#app");

