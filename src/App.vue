<template>
  <div id="app"
       @dragover.prevent="handleDragOver"
       @drop.prevent="handleDrop"
       @dragleave.prevent="handleDragLeave"
       :class="{ 'dragover': isDragging }"
  >
    <!-- 新增全屏朦层 -->
    <div v-if="isDragging" class="drag-overlay">
      <div class="drag-content">
        <div class="upload-icon">📤</div>
        <div class="upload-text">拖放文件到此新增</div>
      </div>
    </div>
    <NavBar v-if="showNavBar"/>
    <div class="main-content-container">
      <keep-alive :include="['Login', 'ProductSwitch','BitBrowser','PutOnlineTask']">
        <router-view/>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  data() {
    return {
      isDragging: false
    }
  },
  components: {NavBar},

  computed: {
    showNavBar() {
      // 当路由路径不是登录页时显示导航栏
      return this.$route.path !== '/login'
    }
  },
  async created() {
    await this.$store.dispatch('app/loadSettings')
  },
  methods: {
    handleDragLeave(e) {
      // 确保鼠标完全离开窗口
      if (
          e.clientX <= 0 ||
          e.clientY <= 0 ||
          e.clientX >= window.innerWidth ||
          e.clientY >= window.innerHeight
      ) {
        this.isDragging = false
      }
    },
    handleDragOver(e) {
      if (!this.isDragging) {
        this.isDragging = true
      }
      e.dataTransfer.dropEffect = 'copy'
    },

    async handleDrop(e) {
      this.isDragging = false
      const items = e.dataTransfer.items
      const data = {
        "files":[],
        "title":'',
        "descContent":''
      }
      // 处理文件和文件夹
      const traverseEntries = async (entries, path = '') => {
        for (const entry of entries) {
          if (entry.isFile) {
            const file = await new Promise(resolve => entry.file(resolve))
            if (file.type.startsWith('image/')) {
              data.files.push(file)
            }
            if (file.name.match(/\.(txt|bm)$/i)) {
              data.descContent = await this.readTextFile(file)
            }
          } else if (entry.isDirectory) {
            const reader = entry.createReader()
            data.title = entry.name
            const entries = await new Promise(resolve =>
                reader.readEntries(resolve)
            )
            await traverseEntries(entries, `${path}/${entry.name}`)
          }
        }
      }

      // 获取所有文件项
      const entries = Array.from(items)
          .map(item => item.webkitGetAsEntry())
          .filter(entry => entry)

      await traverseEntries(entries)

      if (data.files.length > 0) {
        if (this.$route.path !== '/product') {
          await this.$router.push('/product')
        }

        this.$nextTick(() => {
          this.$bus.$emit('handle-dropped-files', data)
        })
      }
    },
    // 新增文本文件读取方法
    readTextFile(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsText(file)
      })
    }
  }
}
</script>

<style scoped>/* 全屏朦层 */
.drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  /* 毛玻璃纹理 */
  background-image:
      linear-gradient(
          45deg,
          rgba(255,255,255,0.1) 25%,
          transparent 25%,
          transparent 75%,
          rgba(255,255,255,0.1) 75%,
          rgba(255,255,255,0.1)
      ),
      linear-gradient(
          45deg,
          rgba(255,255,255,0.1) 25%,
          transparent 25%,
          transparent 75%,
          rgba(255,255,255,0.1) 75%,
          rgba(255,255,255,0.1)
      );
  background-size: 30px 30px;
  background-position: 0 0, 15px 15px;
}

/* 内容居中 */
.drag-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.4);
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.upload-text {
  font-size: 28px;
  color: #2c3e50;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(255,255,255,0.5);
}

/* 添加入场动画 */
.drag-overlay {
  animation: overlayFadeIn 0.3s ease-out;
  animation-fill-mode: forwards;
}
.drag-overlay-leave {
  animation: overlayFadeOut 0.2s ease-in forwards;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(15px);
  }
}
@keyframes overlayFadeOut {
  from {
    opacity: 1;
    backdrop-filter: blur(15px);
  }
  to {
    opacity: 0;
    backdrop-filter: blur(0);
  }
}

/* 兼容处理 */
@supports not (backdrop-filter: blur(15px)) {
  .drag-overlay {
    background: rgba(255,255,255,0.95);
  }
  .drag-content {
    background: rgba(255,255,255,0.9);
  }
}
</style>
