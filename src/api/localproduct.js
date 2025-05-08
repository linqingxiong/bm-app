import request from '@/utils/request'

export function getProducts() {
    return request({
        url: '/local/products',
        method: 'get'
    })
}

export function updateProductDescription(oldDesc, newDesc) {
    return request({
        url: '/local/products/description',
        method: 'put',
        params: {
            oldDescription: oldDesc,
            newDescription: newDesc
        }
    })
}

export function updateProductDetail(productPath, detail) {
    return request({
        url: '/local/products/detail',
        method: 'post',
        params: {
            productPath: productPath,
            detail: detail
        }
    })
}
