import request from '@/utils/request'

export const start = () => {
    return request({
        url: '/bitBrowser/start',
        method: 'get'
    })
}

