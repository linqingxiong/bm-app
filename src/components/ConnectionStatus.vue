<template>
  <div class="connection-status" :class="statusClass">
    <i class="el-icon-loading" v-if="isConnecting"></i>
    {{ statusText }}
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {

  computed: {
    ...mapState({
      connection: state => state.app.connection
    }),
    isConnecting() {
      return this.connection.status === 'connecting' || this.connection.status === 'disconnected'
    },
    statusClass() {
      return {
        'connecting': this.connection.status === 'connecting',
        'unlogin': this.connection.status === 'unlogin',
        'disconnected': this.connection.status === 'disconnected'
      }
    },
    statusText() {
      const texts = {
        connected: '在线',
        unlogin: '未登录',
        connecting: `连接中`,
        disconnected: `离线（${this.connection.retries}次重试）`
      }
      return texts[this.connection.status]
    }
  }
}
</script>

<style scoped>
.connection-status {
  position: fixed;
  top: 10px;
  right: 80px;
  padding: 8px 15px;
  border-radius: 4px;
  background: #67C23A;
  color: white;
  z-index: 9999;
  &.connecting {
    background: #E6A23C;

    .el-icon-loading {
      margin-right: 5px;
    }
  }
  &.disconnected {
    background: #F56C6C;
  }
  &.unlogin {
    background: #c0bcbc;
  }
}
</style>
