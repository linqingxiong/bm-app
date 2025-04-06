import request from '@/utils/request'

export function getProductsPage(params) {
    return request({
        url: '/products/page',
        method: 'get',
        params: {
            page: params.page,
            size: params.size,
            name: params.name
        }
    })
}

/**
 * 创建新产品
 * @param {Object} productData 产品数据
 * @returns Promise
 */
export function createProduct(productData) {
    return request({
        url: '/products',
        method: 'post',
        data: productData
    })
}

/**
 * 更新产品信息
 * @param {Object} productData 包含id的产品数据
 * @returns Promise
 */
export function updateProduct(productData) {
    return request({
        url: `/products`,
        method: 'put',
        data: productData
    })
}

/**
 * 删除产品
 * @param {Number} id 产品ID
 * @returns Promise
 */
export function deleteProduct(id) {
    return request({
        url: `/products/${id}`,
        method: 'delete'
    })
}

/**
 * 获取所有产品（简易列表）
 * @returns Promise
 */
export function getAllProducts() {
    return request({
        url: '/products',
        method: 'get'
    })
}

export function putProductsOnline(productData) {
    return request({
        url: '/leboncoin/putProductsOnline',
        method: 'post',
        data: productData
    })
}
