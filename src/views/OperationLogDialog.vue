<template>
  <el-dialog
      title="操作日志"
      :visible.sync="dialogVisible"
      width="80%"
  >
    <div class="operation-log-management">
      <!-- 操作日志表格 -->
      <el-table
          :data="operationLogs"
          v-loading="loading"
          border
          style="width: 100%"
          row-key="id"
      >
        <el-table-column prop="operationTime" label="操作时间" width="180"/>
        <el-table-column prop="operationType" label="操作类型" min-width="80"/>
        <el-table-column prop="operationParam" label="操作参数" min-width="200" show-overflow-tooltip/>
        <el-table-column prop="operationResult" label="操作结果" min-width="50"/>
        <el-table-column prop="browserId" label="浏览器" min-width="50" show-overflow-tooltip/>
        <el-table-column label="结果截图" min-width="200">
          <template slot-scope="{row}">
            <div class="image-preview">
              <el-image
                  :src="getFullImageUrl(row.screenShotUrl)"
                  :preview-src-list="[getFullImageUrl(row.screenShotUrl)]"
                  fit="cover"
                  class="preview-image"
              >
                <div slot="error" class="image-error">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" show-overflow-tooltip label="错误信息" min-width="200"/>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
            :current-page="pagination.currPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            :total="pagination.totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import {getOperationLogsPage} from '@/api/operationLog'
import {getFullImageUrl} from '@/utils/imageUtils'

export default {
  name: 'OperationLogDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    pdId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loading: false,
      operationLogs: [],
      pagination: {
        currPage: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  watch: {
    dialogVisible(visible) {
      if (visible) {
        this.fetchOperationLogs()
      }
    }
  },
  methods: {
    getFullImageUrl,
    // 获取操作日志数据
    async fetchOperationLogs() {
      this.loading = true
      try {
        const {data} = await getOperationLogsPage({
          page: this.pagination.currPage,
          size: this.pagination.pageSize,
          productId: this.pdId
        })

        this.pagination = {
          currPage: data.currPage,
          pageSize: data.pageSize,
          totalCount: data.totalCount,
          totalPage: data.totalPage
        }

        this.operationLogs = data.list
      } catch (error) {
        this.$message.error('获取操作日志列表失败')
      } finally {
        this.loading = false
      }
    },
    // 分页处理
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currPage = 1
      this.fetchOperationLogs()
    },

    handleCurrentChange(page) {
      this.pagination.currPage = page
      this.fetchOperationLogs()
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-log-management {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
