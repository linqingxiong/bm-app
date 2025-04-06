import request from '@/utils/request'

export const login = (data) => {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    })
}

export const heartbeat = () => {
    return request({
        url: '/auth/heartbeat',
        method: 'get'
    })
}

export const logout = () => {
    return request({
        url: '/auth/logout',
        method: 'post'
    })
}
