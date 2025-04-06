// 在api目录新建ai.js
import request from '@/utils/request'

export const img2detail = (data) => {
    return request({
        url: '/ai/img2detail',
        method: 'post',
        data
    })
}

export const kw2detail = (data) => {
    return request({
        url: '/ai/kw2detail',
        method: 'post',
        data
    })
}
