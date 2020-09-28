<template>
  <el-container style="height: 100%;">
    <el-header v-if="!closeHeader" style="padding: 0; height: auto;">
      <section class="tools-bar">
        <el-breadcrumb :separator="separator">
          <!-- 面包屑 -->
          <el-breadcrumb-item v-for="item in breadcrumbs">{{ item }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="btns">
          <!-- 按钮插槽 -->
          <slot name="tools"></slot>
        </div>
      </section>
    </el-header>
    <el-main style="padding: 0;">
      <el-scrollbar class="small">
        <!-- 主体内容插槽 -->
        <slot name="content"></slot>
      </el-scrollbar>
    </el-main>
    <el-footer style="height: auto; border-top: 1px solid #e6e6e6;">
      <!-- 底部插槽 -->
      <slot name="footer"></slot>
    </el-footer>
  </el-container>
</template>

<script>
  export default {
    name: "PmLayout",
    props: {
      /**
       * 面包屑
       */
      breadcrumbs: {
        type: Array,
        default: null,
      },

      /**
       * 面包屑间隔符号
       */
      separator: {
        type: String,
        default: '/',
      },

      /**
       * 设置为 true，不加载顶部栏
       */
      closeHeader: {
        type: Boolean,
        default: false
      }
    },
  }
</script>

<style scoped>
  .tools-bar {
    height: 46px;
    padding: 0 10px;
    background: #eee;
    display: flex;
    justify-content: space-between;
  }

  .tools-bar .el-breadcrumb {
    line-height: 46px;
  }

  .tools-bar .btns {
    height: 46px;
    line-height: 46px
  }
</style>
