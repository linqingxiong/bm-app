import request from '@/utils/request'

export const getLocalImage = (filePath) => {
    return request({
        url: `/file/localImg`,
        method: 'get',
        params: {
            filePath
        },
        responseType: 'blob' // 重要：声明响应类型为二进制流
    })
}
