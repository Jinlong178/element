<template>
  <el-dialog title="流程组" :visible.sync="visible" width="550px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :before-close="cancel">
    <el-form :model="form" size="small" label-position="right" label-width="80px" v-loading="loading">
      <el-form-item label="组名称">
        <el-input v-model="form.name"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取 消</el-button>
      <el-button type="primary" size="small" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    name: 'ProcessGroup',
    data () {
      return {
        visible: false,
        form: {
          name: null,
        },
        loading: false,
      }
    },
    watch: {
      visible(value) {
        this.form.name = null
      }
    },
    methods: {
      confirm () {
        this.loading = true
        this.$http.post('/api/bpm/group/save', this.form).then(resp => {
          if (resp.success) {
            this.visible = false
            this.$message.success('新建成功')
          } else {
            this.$message.error('新建失败，' + resp.message)
          }
          this.loading = false
        }).catch(reason => {
          this.loading = false
          this.$message.error("新建失败")
        })
      },
      cancel () {
        this.visible = false
      },
    },
  }
</script>

<style scoped>

</style>
