<template>
  <el-dialog title="流程图" :visible.sync="visible" width="70%">
    <div style="height: 60vh;overflow: auto;">
      <el-scrollbar class="medium">
        <div v-html="svg"></div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'Diagram',
    data() {
      return {
        visible: false,
        svg: null,
      }
    },
  }
</script>

<style scoped>

</style>
