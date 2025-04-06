import request from '@/utils/request'

/**
 * 获取操作日志分页数据
 * @param {Object} params 分页参数
 * @returns Promise
 */
export function getOperationLogsPage(params) {
    return request({
        url: '/operationLogs/page',
        method: 'get',
        params: {
            page: params.page,
            size: params.size,
            productId: params.productId
        }
    })
}
