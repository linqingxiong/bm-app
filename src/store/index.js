import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import product from './modules/product'
import app from './modules/app'

Vue.use(Vuex)

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    modules: {
        auth,
        product,
        app
    },
    plugins: [
        // 持久化插件示例
        store => {
            const savedState = localStorage.getItem('vuex_state')
            if (savedState) {
                store.replaceState(JSON.parse(savedState))
            }

            // 订阅状态变化保存
            store.subscribe((mutation, state) => {
                localStorage.setItem('vuex_state', JSON.stringify(state))
            })
        }
    ]
})
