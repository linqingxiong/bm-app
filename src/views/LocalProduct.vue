<template>
  <div class="local-product-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button
          type="text"
          icon="el-icon-refresh"
          @click="loadProducts"
          style="float: right;"
      ></el-button>
    </div>

    <!-- 产品列表 -->
    <el-table
        :data="productList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
    >
      <el-table-column prop="description" label="标题" width="200">
        <template slot-scope="{row}">
          <editable-cell
              :value="row.description"
              @update="handleUpdateDescription(row, $event)"
          />
        </template>
      </el-table-column>

      <el-table-column label="产品图片" width="400">
        <template slot-scope="{row}">
          <div class="image-preview">
            <el-image
                v-for="(img, index) in row.images"
                :key="index"
                :src="shouldLoad(row, index) ? getImageUrl(img) : ''"
                :preview-src-list="row.images.map(img => getImageUrl(img))"
                fit="cover"
                class="preview-image"
                @mouseenter.native="handleImageHover(row, index)">
              <div slot="error" class="image-error">
                <div class="tip-text" style="">悬停加载图片</div>
              </div>
            </el-image>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="详细描述">
        <template slot-scope="{row}">
          <div class="detail-container">
            <div v-if="row.detail" class="detail-content">
              {{ formatDetail(row.detail) }}
            </div>
            <el-button
                type="text"
                @click="showDetailDialog(row)"
                style="margin-left: 10px"
            >
              {{ row.detail ? '编辑' : '添加' }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="{row}">
          <el-button
              type="text"
              @click="$emit('import-product', formatProductData(row))">
            录入
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情编辑对话框 -->
    <el-dialog
        :title="currentProduct ? currentProduct.description : '产品详情'"
        :visible.sync="detailDialogVisible"
        :close-on-click-modal='false'
        width="50%"
    >
      <el-input
          type="textarea"
          :rows="10"
          v-model="currentDetail"
          placeholder="请输入详细描述"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">取 消</el-button>
        <el-button
            type="primary"
            @click="submitDetail"
            :loading="submitting"
        >确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getProducts, updateProductDescription, updateProductDetail} from '@/api/localproduct'
// import {getLocalImage} from '@/api/file'
// import {isValidImagePath} from "@/utils/imageUtils";
import EditableCell from '@/components/EditableCell'

export default {
  name: 'LocalProduct',
  components: {EditableCell},
  data() {
    return {
      productList: [],
      loading: false,
      detailDialogVisible: false,
      currentProduct: null,
      currentDetail: '',
      submitting: false
    }
  },
  methods: {
    formatProductData(row) {
      return {
        pics: JSON.parse(JSON.stringify(row.images)),
        title1: row.description,
        desc2: row.detail
      }
    },
    shouldLoad(row, index) {
      return index === 0 || row.loadedIndices?.includes(index)
    },
    handleImageHover(row, index) {
      if (index === 0 || row.loadedIndices?.includes(index)) return
      if (!row.loadedIndices) {
        this.$set(row, 'loadedIndices', [])
      }
      row.loadedIndices.push(index)
    },
    // 图片获取方法
    getImageUrl(filePath) {
      return process.env.VUE_APP_API_BASE_URL + '/file/localImg?filePath=' + encodeURIComponent(filePath)
    },
    async loadProducts() {
      try {
        this.loading = true
        const {data} = await getProducts()
        this.productList = data
      } catch (error) {
        // this.$message.error('加载产品失败')
      } finally {
        this.loading = false
      }
    },

    async handleUpdateDescription(row, newDesc) {
      try {
        const {data} = await updateProductDescription(row.description, newDesc)
        if (data) {
          // this.productList[row.id] = data
          this.$message.success('描述更新成功')
        } else {
          // const oldDesc = row.description
          // row.description = oldDesc
          this.$message.error('描述更新失败')
        }
      } catch (error) {
        this.$message.error('更新失败：' + (error.message || '服务异常'))
      }finally {
        this.loadProducts()
      }
    },

    showDetailDialog(row) {
      this.currentProduct = row
      this.currentDetail = row.detail || ''
      this.detailDialogVisible = true
    },

    async submitDetail() {
      if (!this.currentProduct) return
      try {
        this.submitting = true
        const {data} = await updateProductDetail(
            this.currentProduct.description,
            this.currentDetail
        )
        this.productList[this.currentProduct.id] = data
        this.detailDialogVisible = false
        this.$message.success('详情更新成功')
      } catch (error) {
        this.$message.error('更新失败：' + (error.message || '服务异常'))
      } finally {
        this.submitting = false
        this.loadProducts()
      }
    },

    formatDetail(detail) {
      try {
        const obj = JSON.parse(detail)
        return Object.entries(obj)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
      } catch {
        return detail
      }
    }
  },
  mounted() {
    this.loadProducts()
  }
}
</script>

<style scoped>
.local-product-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.product-image {
  width: 100%;
  height: 100px;
  object-fit: contain;
  background: #f5f7fa;
}

.detail-container {
  display: flex;
  align-items: center;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.6;
  flex: 1;
}

.text-muted {
  color: #909399;
  font-style: italic;
}

.operation-bar {
  margin-bottom: 20px;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;

  .preview-image {
    width: 50px;
    height: 50px;
    border-radius: 4px;
    cursor: pointer;

    .image-error {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f7fa;
      color: #909399;
    }
  }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  animation: fadeIn 0.5s;

  .el-icon-picture-outline {
    font-size: 20px;
    color: #adb5bd;
    margin-bottom: 5px;
  }

}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tip-text {
  color: #909399; /* 使用Element UI的次要文字颜色 */
  font-size: 12px;
  letter-spacing: 1px;
}

</style>
