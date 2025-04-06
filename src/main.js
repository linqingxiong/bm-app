import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router/router'
import store from "@/store";

Vue.prototype.$store = store
Vue.prototype.$bus = new Vue()
Vue.use(ElementUI)
new Vue({
  router,
  store,
  created() {
  },
  render: h => h(App)
}).$mount('#app')
