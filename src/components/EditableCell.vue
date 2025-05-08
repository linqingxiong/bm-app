<template>
  <div class="editable-cell">
    <div v-if="!editing" @click="startEdit">
      {{ value }}
    </div>
    <el-input
        v-else
        v-model="tempValue"
        ref="input"
        @blur="finishEdit"
        @keyup.enter="finishEdit"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: String
  },
  data() {
    return {
      editing: false,
      tempValue: this.value
    }
  },
  watch: {
    value(val) {
      console.log('value changed', val)
    }
  },
  methods: {
    startEdit() {
      this.editing = true
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },
    finishEdit() {
      this.editing = false
      if (this.tempValue !== this.value) {
        this.$emit('update', this.tempValue)
      }
    }
  }
}
</script>

<style scoped>
.editable-cell {
  cursor: pointer;
}
.editable-cell:hover {
  background: #f5f7fa;
}
</style>
