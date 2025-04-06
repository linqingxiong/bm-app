import request from '@/utils/request'

/**
 * 获取上线任务分页数据
 * @param {Object} params 分页参数
 * @returns Promise
 */
export function getPutOnlineTasksPage(params) {
    return request({
        url: '/putOnlineTasks/page',
        method: 'get',
        params: {
            page: params.page,
            size: params.size,
            productId: params.productId
        }
    })
}
