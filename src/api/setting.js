import request from '@/utils/request'

export const getSettings = () => {
    return request({
        url: '/setting/list',
        method: 'get'
    })
}

export const updateSetting = (data) => {
    return request({
        url: '/setting/update',
        method: 'post',
        data
    })
}

