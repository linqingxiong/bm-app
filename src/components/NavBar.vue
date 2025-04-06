<template>
  <nav class="app-navbar">

    <div class="nav-links">
      <div class="nav-logo">
        <img
            src="@/assets/logo.png"
            alt="Logo"
            class="logo-image"
            @click="$router.push('/')"
        >
      </div>
      <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          @select="handleSelect"
      >
        <el-menu-item
            v-for="(item, index) in navItems"
            :key="index"
            :index="item.path"
            @click.native="$router.push(item.path)"
        >
          {{ item.title }}
        </el-menu-item>
        <el-menu-item
            index="product"
            @click.native.prevent="openSettingsDialog" style="float: right;"
        >
          <i class="el-icon-setting"></i>
        </el-menu-item>
      </el-menu>

      <el-dialog
          title="系统设置"
          :visible.sync="showSettingsDialog"
          width="50%"
          :before-close="handleBeforeClose"
      >
        <el-form v-loading="loading">
          <el-form-item
              v-for="item in settingsList"
              :key="item.settingKey"
              :label="item.description"
              :label-width="formLabelWidth"
          >
            <!-- 文件类型设置项 -->
            <!--            <div v-if="item.type === '文件'" class="file-selector">-->
            <!--              <el-input-->
            <!--                  v-model="item.settingValue"-->
            <!--                  readonly-->
            <!--                  placeholder="请选择.exe文件"-->
            <!--              >-->
            <!--                <el-button-->
            <!--                    slot="append"-->
            <!--                    icon="el-icon-folder-opened"-->
            <!--                    @click="handleFileSelect(item)"-->
            <!--                ></el-button>-->
            <!--              </el-input>-->
            <!--            </div>-->

            <div v-if="item.type === '布尔值'">
              <el-switch
                  v-model="item.settingValue"
                  :active-value="'true'"
                  :inactive-value="'false'"
                  active-text="开启"
                  inactive-text="关闭"
                  @change="handleSettingChange(item)"
              ></el-switch>
            </div>
            <!-- 其他类型设置项 -->
            <el-input
                v-else-if="item.type !== '隐藏'"
                v-model="item.settingValue"
                @change="handleSettingChange(item)"
                clearable
            >
              <template slot="suffix">
                <i v-if="submitting === item.settingKey" class="el-icon-loading"></i>
                <i v-else class="el-icon-check" style="color:#67C23A"></i>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      showSettingsDialog: false,
      navItems: [
        {title: '产品中心', path: '/product'},
        {title: '浏览器', path: '/bitBrowser'},
        // {title: '上架任务', path: '/putOnlineTask'},
        {title: '代理', path: '/proxyConfigManagement'}
      ],
      activeIndex: this.$route.path,
      formLabelWidth: '120px',
      loading: false,
      submitting: null
    }
  },
  computed: {
    settingsList() {
      var settingsList = this.$store.getters['app/getSettingsList'];
      console.log('computed settingsList',settingsList)
      return settingsList;
    }
  },
  async created() {
    const hasEmpty = this.settingsList.some(item => {
      console.log(item)
      return item.type !== '隐藏' && !item.settingValue
    });
    console.log(hasEmpty)
    if (hasEmpty) {
      this.showSettingsDialog = true;
    }
  },
  methods: {
    // 文件选择处理
    async handleFileSelect(item) {
      console.log(item)
    },
    handleBeforeClose(done) {
      const hasEmpty = this.settingsList.some(item => !item.settingValue);
      if (hasEmpty) {
        this.$message.warning('请填写所有设置项后才能关闭对话框');
        return; // 阻止关闭
      }
      done(); // 允许关闭
    },
    async handleSettingChange(item) {
      try {
        // 新增路径处理逻辑
        if (item.settingKey === 'bt_browser') {
          const value = item.settingValue.trim();

          // 当路径非空且不以.exe结尾时自动补全
          if (value && !value.endsWith('.exe')) {
            // 自动补全路径（处理可能的结尾斜杠）
            item.settingValue = value.replace(/[\\/]*$/, '') + '/比特浏览器.exe';
          }
        }
        this.submitting = item.settingKey;
        this.$store.dispatch("app/updateSetting", item)
        this.$message.success(`${item.description} 更新成功`);
        // await this.$store.dispatch("app/loadSettings");
        // 更新Vuex状态
        // await this.loadSettings();
      } catch (error) {
        const originItem = this.settingsList.find(i => i.settingKey === item.settingKey);
        if (originItem) item.settingValue = originItem.settingValue;
        this.$message.error('更新失败');
      } finally {
        this.submitting = null;
      }
    },
    handleSelect(key) {
      console.log('导航切换:', key)
    },
    openSettingsDialog() {
      this.showSettingsDialog = true;
    }
  },
  watch: {
    '$route'(to) {
      this.activeIndex = to.path
    }

  }
}
</script>

<style scoped>
.app-navbar {
  .nav-links {
    display: flex;
    align-items: center;
    background: #545c64;

    .nav-logo {
      padding: 0 20px;
      cursor: pointer;
      transition: opacity 0.3s;

      .logo-image {
        height: 36px;
        vertical-align: middle;
      }

      &:hover {
        opacity: 0.8;
      }
    }

    .el-menu {
      flex: 1;
    }
  }
}
</style>
