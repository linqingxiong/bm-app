<template>
  <div class="product-management">
    <!-- 操作工具栏 -->
    <div class="operation-bar">
      <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showCreateDialog"
      >
        新建产品
      </el-button>
      <el-input
          v-model="searchName"
          placeholder="请输入产品名称搜索"
          style="width: 250px; margin-left: 20px;"
          clearable
          @input="handleSearch"
      />
      <el-button
          type="text"
          icon="el-icon-refresh"
          @click="fetchProducts"
          style="float: right;"
      ></el-button>
    </div>

    <!-- 产品表格 -->
    <el-table
        :data="products"
        v-loading="loading"
        border
        style="width: 100%"
        row-key="id"
    >
      <!-- 展开行显示详情 -->
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <el-descriptions title="详细">
            <el-descriptions-item label="姓">{{ row.lastName }}</el-descriptions-item>
            <el-descriptions-item label="名">{{ row.firstName }}</el-descriptions-item>
            <el-descriptions-item label="产品标题">{{ row.title1 }}</el-descriptions-item>
            <el-descriptions-item label="描述">
              <div>{{ row.desc2 }}</div>
              <div class="cn-translation" v-if="row.cnDesc">{{ row.cnDesc }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="备注">{{ row.remark }}</el-descriptions-item>
            <!--            <el-descriptions-item label="产品标题2">{{ row.title2 }}</el-descriptions-item>-->
            <!--            <el-descriptions-item label="描述1">{{ row.desc1 }}</el-descriptions-item>-->
            <!--            <el-descriptions-item label="产品标题3">{{ row.title3 }}</el-descriptions-item>-->
            <el-descriptions-item label="价格">{{ row.price }}</el-descriptions-item>
            <el-descriptions-item label="运费">{{ row.shippingCost }}</el-descriptions-item>
            <el-descriptions-item label="尺码">{{ row.size }}</el-descriptions-item>
            <!--            <el-descriptions-item label="类目">{{ row.category }}</el-descriptions-item>-->
            <el-descriptions-item label="地址关键词">{{ row.addrKeyword }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-table-column>

      <el-table-column prop="title1" label="产品标题" min-width="150">
        <template slot-scope="{row}">
          <div>{{ row.title1 }}</div>
          <div class="cn-translation" v-if="row.cnTitle">{{ row.cnTitle }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="shippingCost" label="运费" width="50"/>

      <el-table-column label="产品图片" min-width="200">
        <template slot-scope="{row}">
          <div class="image-preview">
            <el-image
                v-for="(img, index) in row.pics"
                :key="index"
                :src="getFullImageUrl(img)"
                :preview-src-list="row.pics.map(img => getFullImageUrl(img))"
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

      <el-table-column label="创建时间" prop="createTime" width="180"/>
      <el-table-column label="上架" width="80" fixed="right">
        <template slot-scope="{row}">
          <el-button
              type="primary"
              size="mini"
              @click="handlePutOnline(row)">
            上架
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row.id)" style="color: #F56C6C">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column label="数据统计" width="120" fixed="right">
        <template slot-scope="{row}">
          <el-descriptions title="" :column="1">
            <el-descriptions-item label="任务">
              <span
                  class="clickable-stat"
                  @click="handlePutOnlineTaskRowClick(row)"
              >{{ row.putOnlineTaskSuccessCount + ' / ' + row.putOnlineTaskTotalCount }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="结果">
              <span
                  class="clickable-stat"
                  @click="handleOperationLogClick(row)"
              >{{ row.browserSuccessCount + ' / ' + row.browserTotalCount }}</span>

            </el-descriptions-item>
          </el-descriptions>
        </template>
      </el-table-column>
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

    <!-- 产品编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        width="60%"
        @closed="resetForm"
    >
      <el-form
          ref="productForm"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="产品图片" prop="pics">
          <el-upload
              :action="uploadAction"
              ref="uploadRef"
              :headers="uploadHeaders"
              list-type="picture-card"
              multiple
              :file-list="fileList"
              :on-exceed="handleUploadExceed"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
          >
            <i slot="default" class="el-icon-plus"></i>
            <div slot="file" slot-scope="{file}">
              <img
                  class="el-upload-list__item-thumbnail"
                  :src="file.url" alt=""
              >
              <span class="el-upload-list__item-actions">
                <span
                    class="el-upload-list__item-2left"
                    @click="handlePicture2left(file)"
                >
                  <i class="el-icon-back"></i>
                </span>
                <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                >
                  <i class="el-icon-zoom-in"></i>
                </span>
                <span
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                >
                  <i class="el-icon-delete"></i>
                </span>
                <span
                    class="el-upload-list__item-2right"
                    @click="handlePicture2right(file)"
                >
                  <i class="el-icon-right"></i>
                </span>
              </span>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="产品标题" prop="title1">
          <el-input
              v-model="formData.title1"
              placeholder="请输入产品标题"
              :disabled="isAILoading"
              @change="formData.cnTitle = ''"
              clearable
          />
          <div v-if="formData.cnTitle" class="ai-generated-tip">
            {{ formData.cnTitle }}
          </div>
        </el-form-item>
        <el-form-item label="产品描述" prop="desc2">
          <div class="desc-input-wrapper">
            <el-input
                v-model="formData.desc2"
                type="textarea"
                :rows="4"
                placeholder="请输入产品详细描述"
                @change="formData.cnDesc = ''"
                clearable
                :disabled="isAILoading"
            />
            <el-button
                class="ai-optimize-btn"
                v-if="this.formData.desc2 || this.formData.title1"
                type="primary"
                size="mini"
                :loading="isAIOptimizing"
                @click="handleAIOptimize"
            >
              AI 优化
            </el-button>
          </div>
          <div v-if="formData.cnDesc" class="ai-generated-tip">
            {{ formData.cnDesc }}
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <div class="desc-input-wrapper">
            <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="4"
                placeholder="请输入备注"
                clearable
                :disabled="isAILoading"
            />
          </div>
        </el-form-item>
        <el-form-item label="地址关键词" prop="addrKeyword">
          <el-input
              v-model="formData.addrKeyword"
              clearable
              placeholder="请输入地址关键词"
          />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-row>
            <el-col :span="11">
              <el-input
                  v-model="formData.price"
                  placeholder="请输入产品价格"
                  clearable
              />
            </el-col>
            <el-col :span="2" style="text-align: center">运费:</el-col>
            <el-col :span="11">
              <el-input
                  v-model="formData.shippingCost"
                  placeholder="请输入运费价格"
                  clearable
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="尺码" prop="size">
          <el-row>
            <el-col :span="11">
              <el-input
                  v-model="formData.size"
                  clearable
                  placeholder="请输入尺码"
              />
            </el-col>
            <!--            <el-col :span="2" style="text-align: center">类目:</el-col>-->
            <!--            <el-col :span="11">-->
            <!--              <el-input-->
            <!--                  v-model="formData.category"-->
            <!--                  placeholder="请输入类目"-->
            <!--                  clearable-->
            <!--              />-->
            <!--            </el-col>-->
          </el-row>

        </el-form-item>
        <el-form-item label="姓" prop="lastName">
          <el-row>
            <el-col :span="11">
              <el-input
                  v-model="formData.lastName"
                  placeholder="请输入姓"
                  clearable
                  :disabled="isAILoading"
              />
            </el-col>
            <el-col :span="2" style="text-align: center">名:</el-col>
            <el-col :span="11">
              <el-input
                  v-model="formData.firstName"
                  placeholder="请输入名"
                  clearable
                  :disabled="isAILoading"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <!--        <el-form-item label="产品标题2" prop="title2">-->
        <!--          <el-input-->
        <!--              v-model="formData.title2"-->
        <!--              placeholder="请输入产品标题2"-->
        <!--              clearable-->
        <!--          />-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="产品描述1" prop="desc1">-->
        <!--          <el-input-->
        <!--              v-model="formData.desc1"-->
        <!--              type="textarea"-->
        <!--              :rows="4"-->
        <!--              placeholder="请输入产品详细描述1"-->
        <!--          />-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="产品标题3" prop="title3">-->
        <!--          <el-input-->
        <!--              v-model="formData.title3"-->
        <!--              placeholder="请输入产品标题3"-->
        <!--              clearable-->
        <!--          />-->
        <!--        </el-form-item>-->

      </el-form>

      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
            type="primary"
            :loading="submitting"
            :disabled="isAIOptimizing"
            @click="submitForm"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
    <operation-log-dialog :visible.sync="operationLogDialogVisible" :pd-id="pdId"/>
    <el-dialog
        title="选择浏览器实例"
        :visible.sync="showBrowserSelector"
        width="80%"
        @closed="showBrowserSelector = false"
    >
      <bit-browser
          @select="handleBrowserSelect"
          ref="bitBrowser"
          selection-mode
          @close="showBrowserSelector = false"
      />
    </el-dialog>

    <el-dialog
        title="上架设置"
        :visible.sync="showTimePicker"
        width="400px"
    >
      <el-form :model="putOnlineForm" label-width="100px">
        <div class="time-picker-container">
          <el-form-item label="自动选择代理">
            <el-switch
                v-model="putOnlineForm.autoSelectProxy"
                @change="handleProxySwitchChange">
            </el-switch>
          </el-form-item>

          <el-form-item v-if="putOnlineForm.autoSelectProxy" label="IP限制">
            <el-input
                v-model="putOnlineForm.putOnlineProxyIp"
                placeholder="输入多个IP用逗号分隔"
                @change="cacheProxyIps"
                @input="handleProxyIpInput"
            />
          </el-form-item>
          <el-date-picker
              v-model="putOnlineForm.selectedTime"
              type="datetime"
              placeholder="选择执行时间"
              value-format="timestamp"
              :default-value="new Date()"
          />
        </div>
      </el-form>
      <div slot="footer">
        <el-button @click="showTimePicker = false">取消</el-button>
        <el-button type="primary" @click="putOnline">上架</el-button>
      </div>

    </el-dialog>

    <el-dialog
        title="上架任务"
        :visible.sync="putOnlineTaskDialogVisible"
        width="80%"
    >
      <put-online-task ref="putOnlineTask" :product-id="pdId"/>
    </el-dialog>
    <el-dialog :visible.sync="dialogUploadVisible">
      <img width="100%" :src="dialogUploadImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import {createProduct, deleteProduct, getProductsPage, putProductsOnline, updateProduct} from '@/api/product'
import {img2detail, kw2detail} from '@/api/ai'
import {getFullImageUrl} from '@/utils/imageUtils'
import {debounce} from 'lodash' // 引入 debounce 方法
import OperationLogDialog from '@/views/OperationLogDialog.vue'
import BitBrowser from '@/views/BitBrowser.vue'
import PutOnlineTask from "@/views/PutOnlineTask.vue";

export default {
  name: 'AppProduct',
  data() {
    return {
      dialogUploadImageUrl: '',
      dialogUploadVisible: false,
      putOnlineForm: {
        putOnlineProxyIp: '',
        autoSelectProxy: true,
        selectedTime: Date.now(),
      },
      isAIOptimizing: false,
      showTimePicker: false,
      showAIPanel: false, // 新增面板显示状态
      isAILoading: false, // 新增加载状态
      currentProduct: null,
      showBrowserSelector: false,
      uploadAction: process.env.VUE_APP_API_BASE_URL + '/file/upload',
      uploadHeaders: {
        'Authorization': `Bearer ${localStorage.token}`
      },
      searchName: '',
      loading: false,
      submitting: false,
      dialogVisible: false,
      dialogType: 'create',
      products: [],
      formData: {
        id: null,
        firstName: '',
        lastName: '',
        title1: '',
        remark: '',
        title2: '',
        desc1: '',
        title3: '',
        price: '',
        shippingCost: 5,
        desc2: '',
        cnTitle: '',
        cnDesc: '',
        addrKeyword: this.generateProvinceCode(),
        size: '',
        category: '',
        pics: []
      },
      aiData: {
        descKws: "",
        titleKws: ""
      },
      pdId: 0,
      fileList: [],
      pagination: {
        currPage: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0
      },
      formRules: {
        pics: [
          {
            required: true,
            message: '请上传产品图片',
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (this.fileList.length === 0) {
                callback(new Error('请上传产品图片'));
              } else {
                callback();
              }
            }
          }
        ],
        firstName: [
          {required: false, message: '请输入名', trigger: 'blur'},
          {max: 50, message: '长度不能超过50个字符', trigger: 'blur'}
        ],
        lastName: [
          {required: false, message: '请输入姓', trigger: 'blur'},
          {max: 50, message: '长度不能超过50个字符', trigger: 'blur'}
        ],
        title1: [
          {required: true, message: '请输入产品标题1', trigger: 'blur'},
          {max: 1000, message: '长度不能超过1000个字符', trigger: 'blur'}
        ],
        remark: [
          {required: false, message: '请输入备注', trigger: 'blur'},
          {max: 1000, message: '长度不能超过1000个字符', trigger: 'blur'}
        ],
        // title2: [
        //   {required: false, message: '请输入产品标题2', trigger: 'blur'},
        //   {max: 1000, message: '长度不能超过1000个字符', trigger: 'blur'}
        // ],
        // desc1: [
        //   {required: false, message: '请输入产品详情1内容', trigger: 'blur'},
        //   {max: 2000, message: '长度不能超过2000个字符', trigger: 'blur'}
        // ],
        // title3: [
        //   {required: false, message: '请输入产品标题3', trigger: 'blur'},
        //   {max: 1000, message: '长度不能超过1000个字符', trigger: 'blur'}
        // ],
        price: [
          {required: true, message: '请输入产品价格', trigger: 'blur'},
          {max: 10, message: '长度不能超过10个字符', trigger: 'blur'}
        ],
        shippingCost: [
          {required: true, message: '请输入运费', trigger: 'blur'},
          {max: 10, message: '长度不能超过10个字符', trigger: 'blur'}
        ],
        desc2: [
          {required: true, message: '请输入产品详情2内容', trigger: 'blur'},
          {max: 2000, message: '长度不能超过2000个字符', trigger: 'blur'}
        ],
        addrKeyword: [
          {required: true, message: '请输入地址关键词', trigger: 'blur'},
          {max: 20, message: '长度不能超过20个字符', trigger: 'blur'}
        ],
        size: [
          {required: false, message: '请输入尺码', trigger: 'blur'},
          {max: 10, message: '长度不能超过10个字符', trigger: 'blur'}
        ],
        category: [
          {required: false, message: '请输入类目', trigger: 'blur'},
          {max: 50, message: '长度不能超过150个字符', trigger: 'blur'}
        ],
      },
      operationLogDialogVisible: false,
      putOnlineTaskDialogVisible: false
    }
  },
  components: {
    OperationLogDialog,
    BitBrowser,
    PutOnlineTask
  },
  computed: {
    dialogTitle() {
      return this.dialogType === 'create' ? '新建产品' : '编辑产品'
    }
  },

  mounted() {
    this.fetchProducts()
    const proxySetting = this.$store.getters['app/getSettingByKey']('put_online_proxy_ips')
    if (proxySetting) {
      this.putOnlineForm.putOnlineProxyIp = proxySetting.settingValue
    }
  },

  methods: {
    // 在methods中添加方法
    generateFrenchName() {
      const firstNames = ['Jean', 'Pierre', 'Louis', 'Jacques', 'Marie', 'Sophie', 'Camille', 'Émilie'];
      const lastNames = ['Dubois', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand'];

      return {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
      }
    },
    parseContent(content) {
      try {
        const jsonData = JSON.parse(content)
        return jsonData.detail || content
      } catch (e) {
        return content
      }
    },
    handlePicture2left(file) {
      const index = this.fileList.findIndex(f => f.uid === file.uid)
      if (index > 0) { // 确保不是第一个元素
        // 交换当前元素和前一个元素的位置
        const temp = this.fileList[index - 1]
        this.$set(this.fileList, index - 1, this.fileList[index])
        this.$set(this.fileList, index, temp)
      }
    },
    handlePicture2right(file) {
      const index = this.fileList.findIndex(f => f.uid === file.uid)
      if (index < this.fileList.length - 1) { // 确保不是最后一个元素
        // 交换当前元素和后一个元素的位置
        const temp = this.fileList[index + 1]
        this.$set(this.fileList, index + 1, this.fileList[index])
        this.$set(this.fileList, index, temp)
      }
    },
    handlePictureCardPreview(file) {
      this.dialogUploadImageUrl = file.url;
      this.dialogUploadVisible = true;
    },
    // 在Product.vue的methods中添加
    async handleFileDrop(data) {
      const files = data.files;
      // 设置表单数据
      this.formData.title1 = data.title
      this.formData.desc2 = this.parseContent(data.descContent)
      // 确保对话框打开以初始化上传组件
      if (!this.dialogVisible) {
        this.showCreateDialog()
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // 等待对话框渲染完成
      await this.$nextTick()
      // 过滤有效文件（复用原有校验逻辑）
      let counter = 0;
      const validFiles = files.map(file => {
        // 生成唯一 uid
        const uid = Date.now() + counter++;
        file.uid = uid
        return {
          name: file.name,
          size: file.size,
          raw: file, // 原始 File 对象
          uid: file.uid,
          url: '',
          status: 'ready' // 必须设置状态为 ready
        };
      });
      this.fileList = [...validFiles];
      console.log('Valid files:', validFiles)
      this.$nextTick(() => {
        this.$refs.uploadRef.submit();
      })
    },
    openDialogWithData(data) {
      this.showCreateDialog()
      this.formData = {
        ...this.formData,
        // pics: data.pics,
        title1: data.title1,
        desc2: data.desc2
      }
      let counter = 0;
      this.fileList = data.pics.map(url => (
          {
            url: this.getImageUrl(url),
            originUrl: url,
            uid: Date.now() + counter++
          }
      ))
      // this.handleAIOptimize()
    },
    // IP输入过滤处理
    handleProxyIpInput(value) {
      // 1. 替换非法字符为逗号
      let filtered = value.replace(/[^\d.]/g, ',')
      // 2. 合并连续逗号
      filtered = filtered.replace(/,+/g, ',')
      // 更新数据模型
      this.putOnlineForm.putOnlineProxyIp = filtered
      // this.cacheProxyIps() // 实时触发保存
    },
    cacheProxyIps() {
      // const proxySetting = this.$store.getters['app/getSettingByKey']('put_online_proxy_ips')
      this.$store.dispatch('app/updateSetting', {
        settingKey: 'put_online_proxy_ips',
        settingValue: this.putOnlineForm.putOnlineProxyIp,
        type: '隐藏'
      }).then(() => {
        this.$message.success('代理IP保存成功')
      })
    },
    // 开关变化处理
    handleProxySwitchChange(val) {
      val
    },
    // AI优化处理
    async handleAIOptimize() {
      try {
        if (!this.formData.desc2 && !this.formData.title1) {
          this.$message.error('请输入标题和描述')
          return
        }
        this.isAIOptimizing = true
        const {data} = await kw2detail({
          descKws: this.formData.desc2,
          titleKws: this.formData.title1 // 根据接口要求保留参数
        })

        this.formData = {
          ...this.formData,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          title1: data.frTitle || this.formData.title1,
          desc2: data.frDesc || this.formData.desc2,
          cnTitle: data.cnTitle || '',
          cnDesc: data.cnDesc || '',
          size: data.size || '',
          price: data.price || '',
        }
        this.$message.success('优化成功')
      } catch (error) {
        this.$message.error('优化失败: ' + (error.message || error))
      } finally {
        this.isAIOptimizing = false
      }
    },
    toggleAIPanel() {
      if (!this.showAIPanel) {
        // 第一次点击打开面板
        this.showAIPanel = true
      } else {
        // 第二次点击执行生成
        this.handleAIGenerateImg()
      }
    },
    // 获取产品数据
    async fetchProducts() {
      this.loading = true
      try {
        const {data} = await getProductsPage({
          page: this.pagination.currPage,
          size: this.pagination.pageSize,
          name: this.searchName // 将搜索条件传递给后端
        })

        this.pagination = {
          currPage: data.currPage,
          pageSize: data.pageSize,
          totalCount: data.totalCount,
          totalPage: data.totalPage
        }

        this.products = data.list.map(p => ({
          ...p,
          pics: p.pics || []
        }))
      } catch (error) {
        this.$message.error('获取产品列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch: debounce(function () { // 使用 debounce 包装 handleSearch 方法
      this.pagination.currPage = 1 // 搜索时重置到第一页
      this.fetchProducts()
    }, 1000),
    // 显示创建对话框
    showCreateDialog() {
      this.dialogType = 'create'
      this.dialogVisible = true
      // 自动生成法国名字
      const {firstName, lastName} = this.generateFrenchName()
      this.formData.firstName = firstName
      this.formData.lastName = lastName
    },

    // 处理编辑
    async handleEdit(product) {
      this.dialogType = 'edit'
      this.formData = {...product}
      this.fileList = product.pics.map(url => ({url: this.getFullImageUrl(url), originUrl: url}))
      this.dialogVisible = true
    },

    // 提交表单
    async submitForm() {
      try {
        await this.$refs.productForm.validate()

        this.submitting = true
        console.log('提交表单 this.fileList', this.fileList)
        const productData = {
          ...this.formData,
          pics: this.fileList.map(file => file.response ? file.response.data : (file.originUrl || file.url))
        }

        const api = this.dialogType === 'create' ? createProduct : updateProduct
        await api(productData)

        this.$message.success('操作成功')
        this.dialogVisible = false
        this.fetchProducts()
      } catch (error) {
        console.error(error)
        if (error !== 'validate') {
          this.$message.error(error.message || '操作失败')
        }
      } finally {
        this.submitting = false
      }
    },
    getImageUrl(filePath) {
      return process.env.VUE_APP_API_BASE_URL + '/file/localImg?filePath=' + encodeURIComponent(filePath)
    },
    // 处理删除
    async handleDelete(id) {
      try {
        await this.$confirm('确定要删除该产品吗？', '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })

        await deleteProduct(id)
        this.$message.success('删除成功')
        this.fetchProducts()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    // 修改后的上架方法
    async handlePutOnline(product) {
      this.currentProduct = product
      this.showBrowserSelector = true
    },
    async handleAIGenerateImg() {
      try {
        this.isAILoading = true // 开始加载
        // 获取最后上传的图片URL
        const images = this.formData.pics.map(file => file.response ? file.response.data : file.originUrl)

        if (!images) {
          this.$message.warning('请先上传产品图片')
          return
        }

        const {data} = await img2detail({
          images: images, // 传递图片地址
          descKws: this.aiData.descKws
              ? this.aiData.descKws.split('，').map(k => k.trim())
              : [], // 可选的描述关键词
          titleKws: this.aiData.titleKws
              ? this.aiData.titleKws.split('，').map(k => k.trim())
              : [] // 可选的标题关键词
        })

        // 自动填充表单字段
        this.formData = {
          ...this.formData,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          title1: data.frTitle || '',
          desc2: data.frDesc || '',
          cnTitle: data.cnTitle || '',
          cnDesc: data.cnDesc || '',
        }

        this.$message.success('AI生成成功')
        this.showAIPanel = false // 生成后自动收起面板
      } catch (error) {
        this.$message.error('生成失败: ' + (error.message || error))
      } finally {
        this.isAILoading = false // 结束加载
      }
    },
    // 处理选择结果
    handleBrowserSelect(selectedBrowser) {
      if (!selectedBrowser) {
        return
      }
      this.selectedBrowser = selectedBrowser
      this.showTimePicker = true
      // this.putOnline(selectedBrowser)
      this.showBrowserSelector = false
      this.$refs.bitBrowser.refresh()
    },
    async putOnline() {
      try {
        const browser = this.selectedBrowser;
        // const product = this.currentProduct
        // await this.$confirm(`确定要上架产品【${product.title1}】到【${browser.name}】吗？`, '上架确认', {
        //   type: 'warning'
        // })

        await putProductsOnline({
          id: this.currentProduct.id,
          browserId: browser.id,
          proxyIp: this.putOnlineForm.autoSelectProxy ? this.putOnlineForm.putOnlineProxyIp : '',
          delayMs: this.putOnlineForm.selectedTime ? this.putOnlineForm.selectedTime : Date.now() // 直接传递时间戳
          // 根据实际需要添加更多字段
        })
        this.selectedBrowser = null
        this.showTimePicker = false
        this.$message.success('上架计划已创建')
        this.fetchProducts()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('上架失败: ' + (error.message || error))
        }
      }
    },
    // 分页处理
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currPage = 1
      this.fetchProducts()
    },

    handleCurrentChange(page) {
      this.pagination.currPage = page
      this.fetchProducts()
    },
    getFullImageUrl,
    // 上传处理
    handleUploadSuccess(res, file, fileList) {
      this.fileList = [...fileList];
      const index = this.fileList.findIndex(f => f.uid === file.uid);
      if (index !== -1) {
        this.$set(this.fileList, index, {
          ...this.fileList[index],
          url: process.env.VUE_APP_API_BASE_URL + (res.data), // 从接口响应中提取 URL
          status: 'success'
        });
      }
      // this.formData.pics.push({url: res.data})
      // if (this.formData.pics.length === 1) {
      //   this.handleAIOptimize()
      // }
    },

    handleRemove(file) {
      // let index = this.formData.pics.findIndex(p => {
      //   return (p.url ? p.url : p) === (file.response ? file.response.data : file.originUrl)
      // });
      // if (index !== -1) {
      //   this.formData.pics.splice(index, 1);
      // }
      let index2 = this.fileList.findIndex(p => {
        return (p.uid) === (file.uid)
      });
      if (index2 !== -1) {
        this.fileList.splice(index2, 1);
      }
    },

    handleUploadExceed() {
      this.$message.warning('最多只能上传5张图片')
    },
    beforeUpload(file) {
      if (!file) {
        return
      }
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过5MB')
        return false
      }
      return true
    },

    generateProvinceCode() {
      const num = Math.floor(Math.random() * 95) + 1;
      return num.toString().padStart(2, '0');
    },
    resetForm() {
      this.$refs.productForm.resetFields()
      this.formData = {
        id: null,
        firstName: '',
        lastName: '',
        title1: '',
        remark: '',
        title2: '',
        desc1: '',
        title3: '',
        price: '',
        shippingCost: 5,
        desc2: '',
        cnTitle: '',
        cnDesc: '',
        addrKeyword: this.generateProvinceCode(),
        size: '',
        category: '',
        pics: []
      }
      this.aiData = {
        descKws: "",
        titleKws: "",
        cnTitle: "",
        cnDesc: ""
      }
      this.fileList = []
      const {firstName, lastName} = this.generateFrenchName()
      this.formData.firstName = firstName
      this.formData.lastName = lastName
    },
    handleOperationLogClick(row) {
      this.operationLogDialogVisible = true
      this.pdId = row.id
    },
    handlePutOnlineTaskRowClick(row) {
      this.putOnlineTaskDialogVisible = true
      this.pdId = row.id
    }
  }
}
</script>

<style lang="scss" scoped>
.product-management {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);

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

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  ::v-deep .el-upload--picture-card {
    width: 150px;
    height: 150px;
    line-height: 150px;
  }

  ::v-deep .el-upload-list--picture-card {
    // 首张图片特殊尺寸
    .el-upload-list__item:first-child {
      width: 150px !important;
      height: 150px !important;

      .el-upload-list__item-thumbnail {
        object-fit: contain;
      }
    }

    // 其他图片保持原尺寸
    .el-upload-list__item:not(:first-child) {
      width: 120px;
      height: 120px;
    }
  }
}

.ai-generated-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.time-picker-container {
  padding: 20px;
  text-align: center;

  ::v-deep .el-date-editor {
    width: 100%;
  }
}

desc-input-wrapper {
  position: relative;
}

.ai-optimize-btn {
  position: absolute;
  bottom: 8px;
  right: 12px;
  z-index: 2;
  padding: 5px 10px;
  transform: scale(0.9);
}

.el-form-item__error {
  position: static !important; /* 让错误提示显示在图片上传区域下方 */
  padding-top: 8px;
}

.cn-translation {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  line-height: 1.4;
  font-style: italic;
}

.url-upload {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;

  ::v-deep .el-input-group__append {
    padding: 0 8px;
    background-color: #409EFF;
    color: white;

    &:hover {
      opacity: 0.8;
    }
  }
}

::v-deep .el-upload-list__item-actions {
  i {
    font-size: 18px;
  }

  span + span {
    margin-left: 8px;
  }
}

</style>
