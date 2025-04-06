import axios from 'axios'
import router from "@///router/router";
import {Message} from 'element-ui'

const service = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
    timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(config => {
    if (config.responseType === 'blob') {
        config.headers['Accept'] = 'application/octet-stream'
    }
    return config
})

// 响应拦截器
service.interceptors.response.use(
    response => {
        if (response.config.responseType === 'blob') {
            return {
                data: response.data,
                type: response.headers['content-type']
            }
        }
        if (response.data.code !== 200) {
            Message.error(response.data.message)
            return Promise.reject(response.data)
        }
        return response.data
    },
    error => {
        if (error.response?.status === 401) {
            if (router.currentRoute.path !== '/login'){
                router.push('/login') // 跳转登录页
            }
        }

        Message.error(error.response.data?.message || '请求失败')
        return Promise.reject(error)
    }
)

// utils/request.js
// service.interceptors.response.use(null, async (error) => {
//     if (error.config && error.response?.status >= 500) {
//         if (!error.config.__retryCount) {
//             error.config.__retryCount = 0
//         }
//
//         if (error.config.__retryCount < 3) {
//             error.config.__retryCount++
//             await new Promise(resolve => setTimeout(resolve, 1000))
//             return service(error.config)
//         }
//     }
//     return Promise.reject(error)
// })

export default service
