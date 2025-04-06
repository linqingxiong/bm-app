export function getFullImageUrl(path) {
    const baseUrl = process.env.VUE_APP_API_BASE_URL || ''
    return path ? `${baseUrl}${path}` : ''
}

export function isValidImagePath(path) {
    if (typeof path !== 'string') {
        return false;
    }
    // 1. 基础路径格式验证
    const isPath = /^(?:[a-zA-Z]:\\|\\\\)?[\w\s\-.\\/]+\.\w+$/.test(path) ||
        /^(\/|\.\/|\.\.\/)?[\w\s\-./]+\.\w+$/.test(path);

    console.log(isPath)

    if (!isPath) return false;

    // 2. 提取文件扩展名（不区分大小写）
    const extension = path
        .split(/[\\/]/)        // 分隔路径
        .pop()                 // 获取文件名
        .toLowerCase()         // 统一小写
        .split('.')
        .pop();                // 获取扩展名

    // 3. 常见图片扩展名列表
    const imageExtensions = new Set([
        'jpg', 'jpeg', 'png',
        'gif', 'webp', 'bmp',
        'svg', 'tiff', 'ico'
    ]);

    return imageExtensions.has(extension);
}
