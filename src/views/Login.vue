<template>
  <div class="login-container">
    <el-card class="login-card">
      <el-form :model="form" @submit.native.prevent="handleLogin">
        <el-form-item>
          <el-input
              v-model="form.usercode"
              placeholder="用户名"
              prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <!--        <el-form-item>-->
        <!--          <el-input-->
        <!--              v-model="form.password"-->
        <!--              type="password"-->
        <!--              placeholder="密码"-->
        <!--              prefix-icon="el-icon-lock"-->
        <!--          ></el-input>-->
        <!--        </el-form-item>-->
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
import {login} from '@/api'

export default {
  name: 'AppLogin', // 使用多单词名称
  data() {
    return {
      form: {
        usercode: ''
      }
    }
  },
  computed: {
  },
  methods: {
    handleLogin() {
      if (this.form.usercode) {
        this.handleSubmit()
      } else {
        this.$message.error('请输入用户名和密码')
      }
    },
    async handleSubmit() {
      try {
        await login(this.form)
        await this.$router.push('/product')
        return
      } catch (error) {
        console.error('登录失败:', error)
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

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
}
</style>
