import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
    mode: 'hash',
    routes: [
        { path: '/', redirect: '/product' },
        { path: '/login', component: () => import('@/views/Login.vue') },
        // { path: '/home', component: () => import('@//views/Home.vue')},
        { path: '/product', component: () => import('@/views/ProductSwitch.vue') },
        { path: '/bitBrowser', component: () => import('@/views/BitBrowser.vue') },
        { path: '/putOnlineTask', component: () => import('@/views/PutOnlineTask.vue') },
        { path: '/proxyConfigManagement', component: () => import('@/views/ProxyConfigManagement.vue') },
        // { path: '/localProduct', component: () => import('@/views/LocalProduct.vue') },
        // { path: '/roductSwitch', component: () => import('@/views/ProductSwitch.vue') },
    ]
})

export default router
