<template>
  <el-dialog title="角色信息" :visible.sync="visible" width="550px"
             :close-on-click-modal="false" :close-on-press-escape="false"
             :before-close="cancel">
    <el-form ref="role-form" :model="form" size="small" label-position="right" label-width="40px"
             v-loading="formLoading">
      <el-form-item label="名称">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="编码">
        <el-input v-model="form.id" :readonly="role != null"/>
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea"
                  :autosize="{ minRows: 4, maxRows: 4 }"
                  maxlength="100"
                  show-word-limit resize="none" v-model="form.description"/>
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
    name: 'RoleFormDialog',
    data() {
      return {
        visible: false,
        role: null,
        form: {
          id: null,
          name: null,
          description: null,
        },
        formLoading: false,
      }
    },
    watch: {
      role(value) {
        if (value != null) {
          this.form.id = value.id
          this.form.name = value.name
          this.form.description = value.description
        }
      }
    },
    methods: {
      confirm() {
        this.formLoading = true
        let url = '/api/role/save'
        if (this.role != null) {
          url = '/api/role/update'
        }
        this.$http.post(url, this.form).then(resp => {
          if (resp.success) {
            this.formReset()
            this.visible = false
            this.$message.success('操作成功')
            this.$emit('on-success')
          } else {
            this.$message.error(resp.message)
          }
          this.formLoading = false
        })
      },
      cancel() {
        this.formReset()
        this.visible = false
      },
      formReset() {
        this.role = null
        this.form = {
          id: null,
          name: null,
          description: null,
        }
      }
    },
  }
</script>

<style scoped>

</style>
