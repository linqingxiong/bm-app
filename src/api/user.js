import request from '@/utils/request'

export const getCurrentUser = () => {
    return request({
        url: '/user/me',
        method: 'get'
    })
}

export const updateUserProfile = (data) => {
    return request({
        url: '/user/profile',
        method: 'put',
        data
    })
}
