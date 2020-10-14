<template>
  <el-drawer
    title="流程转发历史"
    size="500px"
    :modal-append-to-body="false"
    :visible.sync="visible"
    direction="rtl">
    <div style="height: calc(100vh - 76px); overflow-y: auto;">
      <el-scrollbar class="medium">
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script>
  export default {
    name: "ForwardListDialog",
    data() {
      return {
        visible: false
      }
    }
  }
</script>

<style scoped>

</style>
