<template>
  <div v-if="hasError" class="error-fallback">
    <h2>页面加载失败</h2>
    <el-button @click="reload">重试</el-button>
  </div>
  <div v-else/>
</template>

<script>
export default {
  data: () => ({hasError: false}),
  errorCaptured(err) {
    this.hasError = true
    console.error('组件错误:', err)
    return false
  },
  methods: {
    reload() {
      window.location.reload()
    }
  }
}
</script>
