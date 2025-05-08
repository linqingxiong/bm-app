import request from '@/utils/request'

export const login = (data) => {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    })
}

export const getLicense = () => {
    return request({
        url: '/auth/license',
        method: 'get'
    })
}

export const setLicense = (key) => {
    return request({
        url: '/auth/license/'+key,
        method: 'put'
    })
}

export const getBoundDevices = () => {
    return request({
        url: '/auth/license/devices',
        method: 'get'
    })
}

export const bindDevice = () => {
    return request({
        url: '/auth/license/bind',
        method: 'post'
    })
}

export const getDeviceId = () => {
    return request({
        url: '/auth/deviceId',
        method: 'get'
    })
}

