<template>
  <div class="login-container">
    <el-card class="login-card">
      <el-form :model="form" @submit.native.prevent="handleLogin">
        <!-- 输入 licenseKey -->
        <el-form-item>
          <el-input
              v-model="form.licenseKey"
              placeholder="请输入 License Key"
              prefix-icon="el-icon-key"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              native-type="submit"
              style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import {bindDevice, getBoundDevices, getDeviceId, getLicense, setLicense} from '@/api/auth'

export default {
  name: 'AppLogin',
  data() {
    return {
      form: {
        licenseKey: '', // licenseKey 输入框
      },
      deviceId: ''          // 当前设备 ID
    }
  },
  async created() {
    // 获取当前设备 ID
    this.deviceId = await getDeviceId()

    // 获取 licenseKey
    try {
      const res = await getLicense()
      if (res.data) {
        this.form.licenseKey = res.data
        await this.checkDeviceBinding() // 检查设备是否已绑定
      }
    } catch (error) {
      console.error('获取 License Key 失败:', error)
    }
  },
  methods: {
    // 检查设备是否已绑定
    async checkDeviceBinding() {
      try {
        const res = await getBoundDevices()
        if (res.data && res.data.includes(this.deviceId)) {
          // 设备已绑定，直接跳转到 product 页面
          await this.$router.push('/product')
        }
      } catch (error) {
        console.error('检查设备绑定状态失败:', error)
      }
    },
    // 处理登录
    async handleLogin() {
      if (!this.form.licenseKey) {
        this.$message.error('请输入 License Key')
        return
      }

      try {
        // 保存 licenseKey
        await setLicense(this.form.licenseKey)
        // 绑定设备
        const bindRes = await bindDevice()
        if (bindRes.code === 200) {
          // 设备绑定成功，执行登录
          // await login(this.form)
          await this.$router.push('/product')
        } else {
          this.$message.error('设备绑定失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        // this.$message.error('登录失败: ' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}

.login-card {
  width: 400px;
  padding: 30px;
}
</style>
