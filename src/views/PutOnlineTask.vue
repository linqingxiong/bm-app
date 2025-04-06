<template>
  <div class="put-online-task-management">
    <el-button
        type="text"
        icon="el-icon-refresh"
        @click="fetchTasks"
        style="float: right;"
    ></el-button>
    <!-- 任务表格 -->
    <el-table
        :data="taskList"
        v-loading="loading"
        border
        style="width: 100%"
        row-key="id"
    >
      <el-table-column prop="id" label="ID" width="100"/>
      <el-table-column prop="productId" label="产品ID" width="120"/>
      <el-table-column prop="browserId" label="浏览器ID" min-width="180"/>
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="{row}">
          <el-tag :type="statusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="scheduleTime" label="计划时间" width="180">
        <template slot-scope="{row}">
          {{ formatTime(row.scheduleTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="retryCount" label="重试次数" width="100"/>
      <el-table-column prop="createTime" label="创建时间" width="180"/>
      <el-table-column prop="updateTime" label="更新时间" width="180"/>
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
</template>

<script>
import {getPutOnlineTasksPage} from '@/api/putOnlineTask'
import {formatTime} from '@/utils/timeUtils'

export default {
  name: 'PutOnlineTaskDialog',
  props: {
    productId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loading: false,
      taskList: [],
      pagination: {
        currPage: 1,
        pageSize: 10,
        totalCount: 0
      }
    }
  },
  computed: {},
  watch: {
    productId() {
      this.fetchTasks()
    }
  },
  mounted() {
    this.fetchTasks()
  },
  methods: {
    formatTime,
    // 状态标签样式
    statusTagType(status) {
      const map = {
        '完成': 'success',
        '失败': 'danger',
        '处理中': 'warning',
        '丢弃': 'info'
      }
      return map[status] || ''
    },
    // 获取任务数据
    async fetchTasks() {
      this.loading = true
      try {
        const {data} = await getPutOnlineTasksPage({
          page: this.pagination.currPage,
          size: this.pagination.pageSize,
          productId: this.productId
        })

        this.pagination = {
          currPage: data.currPage,
          pageSize: data.pageSize,
          totalCount: data.totalCount
        }

        this.taskList = data.list
      } catch (error) {
        this.$message.error('获取上线任务列表失败')
      } finally {
        this.loading = false
      }
    },
    // 分页处理
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currPage = 1
      this.fetchTasks()
    },

    handleCurrentChange(page) {
      this.pagination.currPage = page
      this.fetchTasks()
    }
  }
}
</script>

<style lang="scss" scoped>
.put-online-task-management {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .el-tag {
    margin: 2px;
  }
}
</style>
