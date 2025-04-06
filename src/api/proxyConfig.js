import request from '@/utils/request'

export function createProxyConfig(data) {
    return request({
        url: '/proxyConfigs',
        method: 'post',
        data
    })
}

export function getActiveProxyConfigs() {
    return request({
        url: '/proxyConfigs/active',
        method: 'get'
    })
}

export function updateProxyConfig(data) {
    return request({
        url: `/proxyConfigs`,
        method: 'put',
        data
    })
}

export function deleteProxyConfig(id) {
    return request({
        url: `/proxyConfigs/${id}`,
        method: 'delete'
    })
}

export function getProxyConfigPage(params) {
    return request({
        url: '/proxyConfigs/page',
        method: 'get',
        params: {
            page: params.page,
            size: params.size,
            search: params.search
        }
    })
}
