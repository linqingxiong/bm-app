<template>
  <div class="proxy-config-management">
    <!-- 新建/编辑对话框 -->
    <el-dialog
        :title="dialogType === 'create' ? '新建代理' : '编辑代理'"
        :visible.sync="dialogVisible"
        append-to-body
        :close-on-click-modal="false"
    >
      <el-form
          :model="form"
          :rules="rules"
          ref="configForm"
          label-width="120px"
      >
        <!--        <el-form-item label="代理名称" prop="configName">-->
        <!--          <el-input v-model="form.configName" placeholder="请输入唯一代理名称"/>-->
        <!--        </el-form-item>-->

        <el-form-item label="代理类型" prop="proxyType">
          <el-select
              v-model="form.proxyType"
              placeholder="请选择代理类型"
              style="width: 100%"
          >
            <el-option
                v-for="item in proxyTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="批量导入">
          <el-input
              type="textarea"
              v-model="batchInput"
              :rows="5"
              placeholder="粘贴多行代理地址（每行一个）" style="margin-bottom: 10px"
          />
          <el-button
              type="primary"
              @click="handleBatchParse"
              :loading="batchParsing"
          >
            解析并导入
          </el-button>
        </el-form-item>
        <el-form-item label="代理地址" required>
          <el-input
              v-model="form.host"
              placeholder="主机地址"
              style="width: 60%"
              @blur="handleParseProxy()"
          />
          <el-input-number
              v-model="form.port"
              :min="1"
              :max="65535"
              placeholder="端口"
              controls-position="right"
              style="width: 35%; margin-left: 5%"
          />
        </el-form-item>

        <el-form-item label="认证信息">
          <el-input
              v-model="form.proxyUserName"
              placeholder="用户名（可选）"
              clearable
          />
          <el-input
              v-model="form.proxyPassword"
              placeholder="密码（可选）"
              clearable
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
              v-model="form.enabled"
              active-text="启用"
              inactive-text="禁用"
          />
        </el-form-item>

        <el-form-item label="备注说明">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="2"
              placeholder="请输入代理说明"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>

    <!-- 操作区 -->
    <div class="operation-bar">
      <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showCreateDialog"
      >
        新建代理
      </el-button>
      <el-button
          type="warning"
          icon="el-icon-refresh"
          @click="handleCheckAll"
          :loading="allChecking"
      >
        检测所有
      </el-button>
      <el-input
          v-model="searchKey"
          placeholder="搜索代理"
          clearable
          style="width: 300px; margin-left: 20px"
          @change="loadConfigs"
      >
        <el-button
            slot="append"
            icon="el-icon-search"
            @click="loadConfigs"
        />
      </el-input>
      <el-button
          type="text"
          icon="el-icon-refresh"
          @click="loadConfigs"
          style="float: right;"
      ></el-button>
    </div>

    <!-- 代理表格 -->
    <el-table
        :data="configList"
        v-loading="loading"
        border
        stripe
        highlight-current-row
        @current-change="handleSelectProxy"
        style="margin-top: 20px"
    >
      <!--      <el-table-column prop="configName" label="代理名称" width="180"/>-->
      <el-table-column label="类型" width="100">
        <template slot-scope="{row}">
          <el-tag>{{ row.proxyType.toUpperCase() }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="代理地址" width="220">
        <template slot-scope="{row}">
          {{ row.host }}:{{ row.port }}
          <!--          <el-tag-->
          <!--              v-if="row.proxyUserName"-->
          <!--              size="mini"-->
          <!--              type="info"-->
          <!--              style="margin-left: 5px"-->
          <!--          >-->
          <!--            需认证-->
          <!--          </el-tag>-->
        </template>
      </el-table-column>
      <el-table-column label="认证信息" min-width="200">
        <template slot-scope="{row}">
          <span v-if="row.proxyUserName">{{ row.proxyUserName }}:{{ row.proxyPassword }}</span>
          <span v-else class="text-muted">无需认证</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="150">
        <template slot-scope="{row}">
          <el-switch
              v-model="row.enabled"
              :active-value="true"
              active-text="启用"
              inactive-text="禁用"
              :inactive-value="false"
              @change="handleStatusChange(row)"
              style="margin-left: 10px"
          />

        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template slot-scope="{row}">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="代理信息" min-width="280">
        <template slot-scope="{row}">
          <div v-if="row.proxyInfo.ip">
            <el-tooltip :content="proxyInfoTooltip(row)">
              <div class="proxy-info">
                <!-- IP和国家代码 -->
                <div class="info-section">
                  <span class="ip">{{ row.proxyInfo.ip }}</span>
                  <el-divider direction="vertical"/>
                  <span class="country">{{ row.proxyInfo.countryCode }}</span>
                </div>

                <!-- 使用状态 -->
                <el-tag
                    :type="row.proxyInfo.used ? 'warning' : 'success'"
                    size="mini"
                    effect="dark"
                    class="usage-tag"
                >
                  {{ row.proxyInfo.used ? '已使用' : '未使用' }}
                </el-tag>

                <!-- 更新时间 -->
                <div class="time-section">
                  <span class="time">更新: {{ formatTime(row.proxyInfo.createTime) }}</span>
                  <el-divider direction="vertical"/>
                  <span v-if="row.proxyInfo.used" class="time">使用: {{ formatTime(row.proxyInfo.usedTime) }}</span>
                </div>
              </div>
            </el-tooltip>
          </div>
          <span v-else class="text-muted">未检测</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="{row, $index}">
          <el-button
              size="mini"
              type="text"
              @click.stop="handleEdit(row, $index)"
          >
            编辑
          </el-button>
          <el-button
              size="mini"
              type="text"
              class="text-danger"
              @click.stop="handleDelete(row.id)"
          >
            删除
          </el-button>

          <el-button
              size="mini"
              type="text"
              @click.stop="handleCheckProxy(row)"
              :loading="row.checking"
          >
            检测
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
        style="margin-top: 20px"
        :current-page="pagination.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import {createProxyConfig, deleteProxyConfig, getProxyConfigPage, updateProxyConfig} from '@/api/proxyConfig'
import {formatTime} from '@/utils/timeUtils'
import {checkagent} from '@/api/bitBrowserRequest'

export default {
  name: 'ProxyConfigManagement',
  data() {
    return {
      batchInput: '',
      batchParsing: false,
      allChecking: false, // 新增加载状态
      dialogType: 'create',
      dialogVisible: false,
      submitting: false,
      loading: false,
      searchKey: '',
      form: {
        enabled: true,
        proxyType: 'socks5'
      },
      proxyTypes: [
        {label: 'HTTP', value: 'http'},
        {label: 'HTTPS', value: 'https'},
        {label: 'SOCKS5', value: 'socks5'}
      ],
      rules: {
        // configName: [
        //   { required: true, message: '请输入代理名称', trigger: 'blur' },
        //   { max: 50, message: '长度不超过50个字符', trigger: 'blur' }
        // ],
        host: [
          {required: true, message: '请输入代理主机地址', trigger: 'blur'}
        ],
        port: [
          {required: true, message: '请输入代理端口', trigger: 'blur'}
        ],
        proxyType: [
          {required: true, message: '请选择代理类型', trigger: 'change'}
        ]
      },
      configList: [],
      pagination: {
        current: 1,
        size: 10,
        total: 0
      }
    }
  },
  props: {
    selectionMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select'],
  methods: {
    async handleBatchParse() {
      try {
        this.batchParsing = true
        const lines = this.batchInput.split('\n').filter(l => l.trim())
        const results = []
        let successCount = 0
        let errorLines = []

        console.log("lines", lines)
        // 解析每行数据
        for (const [index, line] of lines.entries()) {
          try {
            console.log("line", line)
            this.handleParseProxy(line)
            await this.handleSilenseCreate()
            successCount++
          } catch (error) {
            errorLines.push({line: index + 1, error: error.message})
          }
        }
        this.$message.success(`成功导入 ${successCount}/${lines.length} 个代理`)
        this.batchInput = ''
        this.loadConfigs()
        console.log("results", results)
        // 显示错误信息
        if (errorLines.length > 0) {
          this.$alert(`以下行解析失败：\n${errorLines.map(e => `第${e.line}行: ${e.error}`).join('\n')}`,
              '部分导入失败', {confirmButtonText: '确定'})
        }
      } finally {
        this.batchParsing = false
      }
    },
    handleParseProxy(line) {
      const patterns = [
        // 匹配格式：host:port:username:password
        /^([\w.-]+):(\d+):([^:]+):([^:]+)$/,
        // 匹配格式：host:port:username
        /^([\w.-]+):(\d+):([^:]+)$/,
        // 匹配格式：host:port
        /^([\w.-]+):(\d+)$/
      ]
      if (!line) {
        line = this.form.host
      }
      // 逐个匹配模式
      for (const pattern of patterns) {
        const match = line.match(pattern)
        if (match) {
          // 解构匹配结果
          const [full, host, port, username, password] = match

          full
          // 设置表单字段
          this.form.host = host
          this.form.port = parseInt(port)
          if (username) this.form.proxyUserName = username
          if (password) this.form.proxyPassword = password

          // 清理原始输入中的多余信息
          this.form.host = host
          return
        }
      }
    },
    async handleSelectProxy(row) {
      if (!this.selectionMode) {
        return
      }
      try {
        console.log("handleSelectProxy", row);
        // await this.handleSingleCheck(row)
        this.$emit('select', Object.assign({}, row.proxyInfo, row))
      } catch (error) {
        this.$message.error('代理检测失败：' + (error.message || '网络错误'))
      }
    },
    formatTime,
    proxyInfoTooltip(row) {
      let tooltip = `${JSON.stringify(row.proxyInfo, null, 2)}`;
      return tooltip;
    },
    async handleCheckAll() {
      try {
        this.allChecking = true
        const total = this.configList.length
        let processed = 0
        const successList = []
        const errorList = []

        // 创建任务队列
        const taskQueue = this.configList.map(config => ({
          config,
          task: () => this.handleSingleCheck(config)
        }))

        // 并发控制器
        const parallelPool = async (queue, concurrency = 3) => {
          const pool = new Set()

          for (const item of queue) {
            // 等待有空闲位置
            while (pool.size >= concurrency) {
              await Promise.race(pool)
            }

            const taskPromise = item.task()
                .then(() => successList.push(item.config))
                .catch(error => errorList.push({
                  config: item.config,
                  error: error.message || '检测失败'
                }))
                .finally(() => {
                  pool.delete(taskPromise)
                  processed++
                  this.$set(this.pagination, 'processed', processed)
                })

            pool.add(taskPromise)
          }

          // 等待所有剩余任务完成
          await Promise.allSettled(pool)
        }

        await parallelPool(taskQueue)

        this.$notify({
          title: '检测完成',
          message: `成功检测 ${successList.length}/${total} 个`,
          type: successList.length === total ? 'success' : 'warning'
        })

        if (errorList.length > 0) {
          this.$alert(`失败代理：${errorList.map(e => e.config.host).join(', ')}`,
              '检测错误', {
                confirmButtonText: '确定',
                showClose: false
              })
        }
      } finally {
        this.allChecking = false
      }
    },
    // 封装单个检测逻辑
    async handleSingleCheck(row) {
      try {
        this.$set(row, 'checking', true)
        const params = {
          host: row.host,
          port: row.port,
          proxyType: row.proxyType,
          proxyUserName: row.proxyUserName,
          proxyPassword: row.proxyPassword,
          id: row.id
        }

        const {data} = await checkagent(params)
        console.log('checkagent data', data)
        if (data?.success) {
          this.$set(row, 'proxyInfo', data.data)
          await updateProxyConfig({
            ...row,
            proxyInfo: data.data
          })

          return true // 返回成功结果
        }
        throw new Error(data.message)
      } catch (error) {
        console.error('代理检测失败:', error)
        throw error // 抛出错误供调用方处理
      } finally {
        this.$set(row, 'checking', false)
      }
    },
    // 修改原有的handleCheckProxy方法
    async handleCheckProxy(row) {
      try {
        await this.handleSingleCheck(row)
        this.$message.success('代理检测成功')
      } catch (error) {
        this.$message.error('代理检测失败：' + (error.message || '网络错误'))
      }
    },
    // 显示新建对话框
    showCreateDialog() {
      this.dialogType = 'create'
      this.form = {
        enabled: true,
        proxyType: 'socks5'
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.configForm?.clearValidate()
      })
    },

    // 显示编辑对话框
    handleEdit(row) {
      this.dialogType = 'edit'
      this.form = {...row}
      this.dialogVisible = true
    },

    // 提交表单
    async handleSubmit() {
      try {
        const valid = await this.$refs.configForm.validate()
        if (!valid) return

        this.submitting = true
        if (this.dialogType === 'create') {
          await createProxyConfig(this.form)
          this.$message.success('创建成功')
        } else {
          await updateProxyConfig(this.form)
          this.$message.success('更新成功')
        }
        this.dialogVisible = false
        this.loadConfigs()
      } catch (error) {
        this.$message.error(error.message || '操作失败')
      } finally {
        this.submitting = false
      }
    },
    async handleSilenseCreate() {
      try {
        const valid = await this.$refs.configForm.validate()
        if (!valid) return

        this.submitting = true
        await createProxyConfig(this.form)
      } catch (error) {
        this.$message.error(error.message || '操作失败')
      } finally {
        this.submitting = false
      }
    },

    // 删除代理
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该代理吗？', '提示', {
          type: 'warning'
        })
        await deleteProxyConfig(id)
        this.$message.success('删除成功')
        this.loadConfigs()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '删除失败')
        }
      }
    },

    // 状态变更处理
    async handleStatusChange(row) {
      try {
        await updateProxyConfig(row)
        this.$message.success('状态更新成功')
      } catch (error) {
        this.loadConfigs()
        this.$message.error('状态更新失败')
      }
    },

    // 加载代理列表
    async loadConfigs() {
      try {
        this.loading = true
        const params = {
          page: this.pagination.current,
          size: this.pagination.size,
          search: this.searchKey
        }
        const {data} = await getProxyConfigPage(params)
        console.log(data)
        this.configList = data.list
        this.pagination.total = data.totalCount
      } catch (error) {
        this.$message.error('加载代理失败')
      } finally {
        this.loading = false
      }
    },

    // 分页处理
    handleSizeChange(size) {
      this.pagination.size = size
      this.loadConfigs()
    },
    handleCurrentChange(current) {
      this.pagination.current = current
      this.loadConfigs()
    }
  },
  mounted() {
    this.loadConfigs()
  }
}
</script>

<style lang="scss" scoped>
.proxy-config-management {
  padding: 20px;
  background: #fff;
  border-radius: 4px;

  .operation-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .text-muted {
    color: #909399;
    font-style: italic;
  }

  .text-danger {
    color: #f56c6c;
  }
}

.proxy-info-container {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .main-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .ip {
      font-weight: 500;
      color: #409EFF;
      margin-right: 6px;
    }

    .country {
      color: #606266;
      margin: 0 6px;
    }

    .update-time {
      color: #909399;
      font-size: 12px;
      margin-left: 6px;
    }

    .el-divider {
      margin: 0 6px;
      background-color: #ebeef5;
    }
  }

  .usage-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;

    .status-tag {
      flex-shrink: 0;
    }

    .use-time {
      color: #e6a23c;
      font-size: 12px;
      line-height: 1.5;
      padding: 2px 6px;
      background: #fdf6ec;
      border-radius: 4px;
    }
  }
}

.text-muted {
  color: #909399;
  font-style: italic;
}

.proxy-config-management[selection-mode] .operation-bar > :not(.proxy-table) {
  display: none;
}
</style>
