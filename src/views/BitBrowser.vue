<template>
  <div class="concise-container">
    <div v-if="hasData" class="data-container">
      <!-- 分组标签页 -->
      <el-tabs
          v-model="activeGroup"
          type="card"
          @tab-click="handleTabClick"
      >
        <el-tab-pane
            v-for="group in groupList"
            :key="group.id"
            :label="`${group.groupName} (${group.browserCount})`"
            :name="group.id"
        >
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
                v-model="searchKey"
                placeholder="输入序号搜索"                clearable
                @clear="handleSearch"
                @keyup.enter.native="handleSearch" style="width: 300px; margin-right: 15px"
            >
              <el-button slot="append" icon="el-icon-search" @click="handleSearch"/>
            </el-input>

            <el-tag type="info" style="margin-right: 15px">
              当前分组: {{ currentGroup?.groupName || '全部' }}
            </el-tag>
          </div>

          <!-- 数据表格 -->
          <el-table
              :data="currentTableData" style="width: 100%"
              stripe
              highlight-current-row
              @current-change="handleSelection"
              height="calc(100vh - 220px)"
          >
            <el-table-column prop="seq" label="序号" width="100" sortable>
              <template slot-scope="{ row }">
                <el-tag effect="dark" type="info">#{{ row.seq }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="name" label="名称" width="180">
              <template slot-scope="{ row }">
                <span class="name-text">{{ row.name }}</span>
                <el-tooltip :content="row.id" placement="top">
                  <i class="el-icon-info" style="margin-left: 5px"></i>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column prop="groupName" label="分组" width="120">
              <template slot-scope="{ row }">
                <el-tag effect="plain" type="warning">{{ row.groupName }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="remark" label="备注" min-width="200">
              <template slot-scope="{ row }">
                <div class="remark-content">
                  {{ row.remark || '-' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="代理信息" min-width="180">
              <template slot-scope="{row}">
                <div v-if="row.lastIp" class="proxy-info">
                  <el-tooltip :content="proxyTooltip(row)" placement="top">
                    <div class="geo-info">
                      <div class="ip-line">
                        <span class="ip">{{ row.lastIp }}</span>
                        <el-tag v-if="row.lastCountry" size="mini" type="info">
                          {{ row.lastCountry }}
                        </el-tag>
                      </div>
                      <div class="time">
                        <i class="el-icon-time"></i>
                        {{ formatTime(row.updateTime) }}
                      </div>
                    </div>
                  </el-tooltip>
                </div>
                <span v-else class="text-muted">未记录</span>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="120" align="center">
              <template slot-scope="{ row }">
                <el-tag :type="statusType[row.status]" effect="dark">
                  {{ statusMap[row.status] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="!selectionMode" label="操作" width="180" fixed="right">
              <template slot-scope="{ row }">
                <el-button
                    size="mini"
                    v-if="row.status !== 1"
                    type="success"
                    @click="handleOpen(row)"
                    :loading="row.loading"
                >
                  {{ row.status === 1 ? '已开启' : '启动' }}
                </el-button>
                <el-button
                    size="mini"
                    type="danger"
                    v-else
                    @click="handleClose(row)"
                    :loading="row.loading"
                >
                  关闭
                </el-button>
                <el-button
                    size="mini"
                    type="primary"
                    @click="handleSetProxy(row)"
                >
                  设置代理
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                layout="prev, pager, next, jumper"
                :total="totalNum"
                @current-change="handlePageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-dialog
          title="选择代理配置"
          :visible.sync="proxyDialogVisible"
          width="80%"
      >
        <proxy-config-management
            ref="proxyConfig"
            selection-mode
            @select="handleProxySelect"
        />
      </el-dialog>
    </div>
    <!-- 无服务状态 -->
    <div v-else class="no-service">
      <el-button
          type="primary"
          class="big-action-button"
          @click="handleStartService"
      >
        <div class="button-content">
          <i class="el-icon-video-play"></i>
          <span>启动比特浏览器服务</span>
        </div>
      </el-button>
    </div>
  </div>
</template>

<script>
import {batchUpdateProxy, closeBrowser, getBrowserList, getGroupList, openBrowser} from '@/api/bitBrowserRequest'
import {start} from "@/api/btBrowser";
import {formatTime} from "@/utils/timeUtils";
import {mapState} from 'vuex'
import ProxyConfigManagement from "@/views/ProxyConfigManagement.vue";

export default {
  data() {
    return {
      activeGroup: '',      // 当前激活的分组ID
      groupList: [],        // 分组列表数据
      currentGroup: null,   // 当前分组对象
      groupDataMap: new Map(), // 分组数据缓存 {groupId: {tableData, totalNum}}
      groupCache: null, // 缓存分组数据
      lastFetchTime: 0,  // 最后更新时间
      proxyDialogVisible: false,
      currentBrowser: null,
      selectedProxy: null,
      autoRefreshInterval: null, // 自动刷新定时器
      autoRefreshEnabled: true, // 自动刷新开关
      refreshInterval: 10000, // 默认5秒刷新间隔
      hasData: false,
      searchKey: '',
      tableData: [],
      currentPage: 1,
      pageSize: 50,
      // totalNum: 0,
      statusMap: {
        0: '离线',
        1: '运行中',
        2: '异常'
      },
      statusType: {
        0: 'info',
        1: 'success',
        2: 'danger'
      }
    }
  },
  components: {
    ProxyConfigManagement
  },
  computed: {
    ...mapState('app', ['settingsList']),
        // 当前展示的表格数据
    currentTableData() {
      return this.groupDataMap.get(this.activeGroup)?.tableData || []
    },
    // 当前分页总数
    totalNum() {
      return this.groupDataMap.get(this.activeGroup)?.totalNum || 0
    }
  },
  props: {
    visible: Boolean,
    selectionMode: {
      type: Boolean,
      default: false // 当用于选择模式时隐藏操作列
    }
  },
  emits: ['select', 'close'],
  mounted() {
    this.initGroupData() // 替代原来的fetchData
    this.startAutoRefresh();
    // 添加页面可见性监听
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },
  watch: {},
  beforeDestroy() {
    this.stopAutoRefresh();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  },
  methods: {
    formatTime,
    // 初始化分组数据
    async initGroupData() {
      try {
        const res = await getGroupList(0, 1000)
        if (res.success) {
          this.groupList = res.data.list
          this.activeGroup = this.groupList[0]?.id || ''
          this.fetchData() // 加载第一个分组数据
        }
      } catch (error) {
        console.error('分组加载失败:', error)
      }
    },
    proxyTooltip(row) {
      return `      类型: ${row.proxyType || 'HTTP'}      地址: ${row.host}:${row.port}      用户: ${row.proxyUserName || '无'}      最后IP: ${row.lastIp || '未记录'}      地区: ${row.lastCountry || '未知'}      更新时间: ${row.updateTime || '无'}    `
    },
    handleSetProxy(row) {
      this.currentBrowser = row
      this.proxyDialogVisible = true
    },

    async handleProxySelect(proxyConfig) {
      try {
        console.log('proxyConfig', proxyConfig)
        // 验证代理信息
        const requiredFields = ['host', 'port', 'proxyType']
        if (requiredFields.some(field => !proxyConfig[field])) {
          this.$message.error('代理配置不完整')
          return
        }

        if (!proxyConfig.proxyInfo?.ip) {
          this.$message.warning('请先进行代理检测')
          return
        }

        // 构造请求参数
        const params = {
          ids: [this.currentBrowser.id],
          proxyMethod: 2,
          proxyType: this.mapProxyType(proxyConfig.proxyType),
          host: proxyConfig.host,
          port: proxyConfig.port,
          proxyUserName: proxyConfig.proxyUserName,
          proxyPassword: proxyConfig.proxyPassword,
          ip: proxyConfig.proxyInfo.ip,
          city: proxyConfig.proxyInfo.city,
          province: proxyConfig.proxyInfo.region,
          country: proxyConfig.proxyInfo.countryCode
        }

        // 调用接口
        const {success} = await batchUpdateProxy(params)
        if (success) {
          this.$message.success('代理设置成功')
          this.fetchData() // 刷新浏览器列表
        }
      } catch (error) {
        this.$message.error('代理设置失败: ' + (error.message || '服务异常'))
      } finally {
        this.proxyDialogVisible = false
      }
    },

    mapProxyType(type) {
      const typeMap = {
        http: 'http',
        https: 'http', // 比特浏览器代理类型特殊处理
        socks5: 'socks5'
      }
      return typeMap[type.toLowerCase()] || 'noproxy'
    },
    handleSelection(currentRow) {
      this.$emit('select', currentRow)
    },
    // 启动自动刷新
    startAutoRefresh() {
      if (this.autoRefreshInterval) return;

      this.autoRefreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.smartFetchData();
        }
      }, this.refreshInterval);
    },
    // 智能数据获取
    async smartFetchData() {
      try {
        // 如果当前有正在进行的操作（如打开/关闭浏览器），则跳过本次刷新
        const hasLoading = this.tableData.some(item => item.loading);
        if (hasLoading) return;
        await this.fetchData()
      } catch (error) {
        console.error('自动刷新失败:', error);
      }
    },
    // 停止自动刷新
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },
    // 页面可见性变化处理
    handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        this.stopAutoRefresh();
      } else {
        this.startAutoRefresh();
      }
    },
    refresh() {
      this.fetchData()
    },
    async fetchData() {
      try {
        const params = {
          groupId: this.activeGroup,
          page: this.currentPage - 1,
          pageSize: this.pageSize,
          sortProperties: 'seq',
          sortDirection: 'asc',
          seq: Number.parseInt(this.searchKey)
        }

        const res = await getBrowserList(params)
        if (res.success) {

          const newMap = new Map(this.groupDataMap)
          newMap.set(this.activeGroup, {
            tableData: res.data.list,
            totalNum: res.data.totalNum,
            timestamp: Date.now()
          })
          // 辅助触发视图更新（可选）
          this.$set(this, 'groupDataMap', newMap)
          this.hasData = true
        }
      } catch (error) {
        console.error('数据获取失败:', error)
      }
    },
    // 标签切换处理
    handleTabClick(tab) {
      this.currentGroup = this.groupList.find(g => g.id === tab.name)
      if (!this.groupDataMap.has(tab.name)) {
        this.currentPage = 1
        this.fetchData()
      }
    },

    async handleStartService() {
      // 这里添加启动服务的逻辑
      console.log('执行启动服务操作')
      try {
        const {data} = await start();
        this.$message.success(data.message);
        this.fetchData(); // 刷新浏览器列表
      } catch (error) {
        // this.$message.error(error.message || '启动失败');
      }
    },
    async handleOpen(row) {
      try {
        this.$set(row, 'loading', true)
        await this.$confirm('确认开启该浏览器？', '提示', {type: 'info'})

        const res = await openBrowser({
          id: row.id,
          args: [],
          loadExtensions: true,
          extractIp: true
        })

        if (res.success) {
          this.$message.success('启动成功')
          await this.fetchData()
        }
      } catch (error) {
        // 用户取消操作不提示
        if (error !== 'cancel') {
          this.$message.error(error.message || '启动失败')
        }
      } finally {
        this.$set(row, 'loading', false)
      }
    },

    async handleClose(row) {
      try {
        this.$set(row, 'loading', true)
        await this.$confirm('确认关闭浏览器？关闭后所有标签页将丢失', '警告', {
          type: 'warning'
        })

        const res = await closeBrowser(row.id)
        if (res.success) {
          this.$message.success('关闭成功')
          await this.fetchData()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '关闭失败')
        }
      } finally {
        this.$set(row, 'loading', false)
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchData()
    },
    // 修改分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchData()
    },
  }
}
</script>

<style scoped>
.concise-container {
  padding: 20px;
  background: #f5f7fa;
  height: 100vh;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.el-switch {
  flex-shrink: 0;
}

.name-text {
  font-weight: 600;
  color: #409EFF;
}

.remark-content {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container {
  padding: 15px;
  background: #fff;
  margin-top: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
}

.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  border-radius: 4px;
  overflow: hidden;
}

::v-deep .el-table__body-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

/* 新增按钮间距 */
.el-table__body-wrapper .el-button + .el-button {
  margin-left: 8px;
}

/* 按钮状态优化 */
.el-button.is-disabled {
  opacity: 0.6;
}

.browser-selector {
  .operation-buttons {
    display: none; /* 隐藏原有操作按钮 */
  }

  .el-table {
    border: none;
    box-shadow: none;
  }
}

.proxy-info {
  line-height: 1.5;
}

.ip-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
ip {
  font-weight: 500;
  color: #409EFF;
}

.time {
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-icon-time {
  font-size: 14px;
}

.el-tabs__header {
  margin: 0 0 15px;
}

.el-tabs__nav-wrap {
  padding: 0 20px;
}

.el-tabs__item {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  transition: all 0.3s;
}

.el-tabs__item:hover {
  color: #409EFF;
}
</style>
