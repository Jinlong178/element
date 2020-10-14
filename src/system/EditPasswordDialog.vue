<template>
  <el-dialog title="修改密码" :visible.sync="visible" width="550px"
             :close-on-click-modal="false" :close-on-press-escape="false"
             :before-close="cancel">
    <el-form :model="form" size="small" label-position="right" label-width="80px" v-loading="formLoading">
      <el-form-item label="原密码">
        <el-input type="password" v-model="form.password"/>
      </el-form-item>
      <el-form-item label="新密码">
        <el-input type="password" v-model="form.newPassword"/>
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input type="password" v-model="form.confirmNewPassword"/>
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
    name: 'EditPasswordDialog',
    data() {
      return {
        visible: false,
        form: {
          password: null,
          newPassword: null,
          confirmNewPassword: null,
        },
        formLoading: false,
      }
    },
    methods: {
      confirm() {
        this.formLoading = true
        this.$http.post('/api/user/editPassword', this.form).then(resp => {
          if (resp.success) {
            this.formReset()
            this.visible = false
            this.$message.success('操作成功')
          } else {
            this.$message.error(resp.message)
          }
          this.formLoading = false
        }).catch(response => {
          this.formLoading = false
          this.$message.error("密码修改错误")
        })
      },
      cancel() {
        this.formReset()
        this.visible = false
      },
      formReset() {
        this.form = {
          password: null,
          newPassword: null,
          confirmNewPassword: null,
        }
      },
    },
  }
</script>

<style scoped>

</style>
