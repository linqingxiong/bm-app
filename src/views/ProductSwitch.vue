<template>
  <div class="product-switch-container">
    <el-tabs
        v-model="activeTab"
        type="border-card"
        @tab-click="handleTabClick"
    >
      <el-tab-pane label="系统产品" name="online">
        <div class="tab-header">
          <h3 class="tab-title">软件保存可上架产品</h3>
<!--          <span class="tab-subtitle">（已同步至服务器）</span>-->
        </div>
        <Product ref="productRef" class="tab-content"/>
      </el-tab-pane>

      <el-tab-pane label="本地文件夹" name="local">
        <div class="tab-header">
          <h3 class="tab-title">产品库文件夹 读取</h3>
<!--          <span class="tab-subtitle">（仅存储在本机）</span>-->
        </div>

        <LocalProduct @import-product="handleImportProduct" class="tab-content"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>


<script>
import Product from "@/views/Product.vue";
import LocalProduct from "@/views/LocalProduct.vue";

export default {
  name: 'ProductSwitch',
  components: {
    Product,
    LocalProduct
  },
  data() {
    return {
      activeTab: 'online'
    }
  },
  methods: {
    async handleDroppedFiles(data) {
      this.activeTab = 'online'
      await this.$nextTick()
      // 确保产品组件已加载
      if (this.$refs.productRef) {
        await this.$refs.productRef.handleFileDrop(data)
      }
    },
    handleImportProduct(productData) {
      this.activeTab = 'online' // 切换到产品管理tab
      this.$nextTick(() => {
        this.$refs.productRef.openDialogWithData(productData)
      })
    },
    handleTabClick(tab) {
      this.$notify({
        title: '页面切换',
        message: `已切换到${tab.label}管理界面`,
        type: 'info',
        duration: 1500
      });
    }
  },
  created() {
  },
  mounted() {
    this.$bus.$on('handle-dropped-files', this.handleDroppedFiles)
  },
  beforeDestroy() {
    this.$bus.$off('handle-dropped-files')
  },
}
</script>

<style scoped>
.product-switch-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 84px);
}

::v-deep .el-tabs__header {
  margin: 0 0 20px 0;
}

/* 增强标签样式 */
::v-deep .el-tabs__item {
  font-size: 16px;
  height: 40px;
  line-height: 40px;
  padding: 0 25px !important;
  transition: all 0.3s;
}

::v-deep .el-tabs__item.is-active {
  color: #409EFF;
  font-weight: bold;
  background: linear-gradient(to bottom, #f0faff, #e6f7ff);
  border-bottom-color: #409EFF !important;
}

::v-deep .el-tabs__item:hover {
  color: #409EFF;
  background-color: #f5f7fa;
}

/* 添加图标区分 */
::v-deep .el-tabs__item[data-name="online"]::before {
  content: "\E785";
  font-family: element-icons;
  margin-right: 8px;
}

::v-deep .el-tabs__item[data-name="local"]::before {
  content: "\E789";
  font-family: element-icons;
  margin-right: 8px;
}

/* 添加切换动画 */
.tab-content {
  position: relative;
  min-height: 500px;
}

.tab-pane {
  transition: all 0.3s ease;
}
.tab-header {
  padding: 15px 20px;
  background: #f8f9fa;
  margin: -20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.tab-title {
  display: inline-block;
  color: #303133;
  margin-right: 10px;
}

.tab-subtitle {
  color: #909399;
  font-size: 0.9em;
}

/* 不同标签页的背景色区分 */
::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 20px;
}

::v-deep [name="online"] .el-tabs__content {
  background: #f0faff;
}

::v-deep [name="local"] .el-tabs__content {
  background: #fff6f6;
}
</style>
