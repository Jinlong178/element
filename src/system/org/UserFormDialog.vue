<template>
  <el-dialog title="用户信息" :visible.sync="visible" width="550px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :before-close="cancel">
    <el-form ref="user-form" :model="form" size="small" label-position="right" label-width="70px"
             v-loading="formLoading">
      <el-form-item label="姓名">
        <el-input clearable v-model="form.name" placeholder="必填"/>
      </el-form-item>
      <el-form-item label="账号">
        <el-input clearable v-model="form.id" :readonly="userId != null" placeholder="只能由字母、数字、下划线组成"/>
      </el-form-item>
      <el-form-item label="手机号码">
        <el-input clearable v-model="form.phone"/>
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input clearable v-model="form.email"/>
      </el-form-item>
      <el-form-item label="密码" v-if="userId == null">
        <el-input clearable type="password" v-model="form.password" placeholder="非必填，默认密码123456，只能由字母、数字、下划线组成"/>
      </el-form-item>
      <el-form-item label="组织机构">
        <el-cascader style="width: 100%"
                     placeholder="请选择组织机构"
                     :options="deptList"
                     :props="{multiple: true, checkStrictly: true, value: 'id', label: 'label'}"
                     clearable
                     v-model="selection"
                     filterable></el-cascader>
      </el-form-item>
      <el-form-item label="角色">
        <el-select clearable v-model="form.roles" filterable multiple placeholder="请选择" style="width: 100%;">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
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
    name: 'UserFormDialog',
    data() {
      return {
        visible: false,
        userId: null,

        formLoading: false,
        form: {
          id: null,
          name: null,
          email: null,
          phone: null,
          password: null,
          roles: ["ROLE_USER"],
          depts: null,
        },

        deptList: null,
        defaultDept: null,

        selection: [],

        roleList: null,
      }
    },
    mounted() {
      this.$http.get('/api/dept/getTree').then(resp => {
        this.deptList = resp.data
      })
      this.$http.get('/api/role/getList').then(resp => {
        this.roleList = resp.data
      })
    },
    watch: {
      defaultDept(value) {
        this.selection = []
        this.$http.get('/api/dept/getCascadeParentList/' + value).then(resp => {
          this.selection = Array.of(resp.data)
        })
      },
      userId(value) {
        if (value != null) {
          this.$http.get('/api/user/getUserDetail/' + value).then(resp => {
            const userDetail = resp.data
            this.form = {
              id: userDetail.user.id,
              name: userDetail.user.name,
              password: null,
              email: userDetail.user.email,
              phone: userDetail.user.phone,
              roles: userDetail.roles,
              depts: [],
            }
            this.selection = userDetail.cascadeDeptList
          })
        }
      },
    },
    methods: {
      resolve2treeData(list, value) {
        if (value == null) return null
        for (const d of value) {
          list.push({
            value: d.id,
            label: d.label,
            children: this.resolve2treeData([], d.children)
          })
        }
        return list
      },
      confirm() {
        this.formLoading = true
        let url = '/api/user/save'
        if (this.userId != null) {
          url = '/api/user/update'
        }
        // 校验
        const name = this.form.name
        if (name == null || name.trim().length == 0) {
          this.formLoading = false
          this.$message.error('姓名不能为空')
          return
        }
        this.form.name = name.trim()

        const id = this.form.id
        if (id == null || id.trim().length == 0) {
          this.formLoading = false
          this.$message.error('账号不能为空')
          return
        }
        if (id.trim().length < 4) {
          this.formLoading = false
          this.$message.error('账号长度不能小于4位')
          return
        }
        const pattern = /^[a-zA-Z_0-9]+$/;
        if (!pattern.test(id.trim())) {
          this.formLoading = false
          this.$message.error('账号只能由字母、数字、下划线组成')
          return
        }
        this.form.id = id.trim()

        const password = this.form.password
        if (password != null && password.trim().length > 0) {
          if (password.trim().length < 6) {
            this.formLoading = false
            this.$message.error('密码长度不能小于6位')
            return
          }
          if (!pattern.test(password.trim())) {
            this.formLoading = false
            this.$message.error('密码只能由字母、数字、下划线组成')
            return
          }
          this.form.password = password.trim()
        }

        const phone = this.form.phone;
        if(phone != null && phone.trim().length > 0) {
            if(!(/^1[3456789]\d{9}$/.test(phone))) {
                this.formLoading = false
                this.$message.error('手机号码有误，请重填')
                return
            }
            this.form.phone = phone.trim()
        }

        const email = this.form.email;
        if(email != null && email.trim().length > 0) {
            if(!/^[A-Za-z\d]+[A-Za-z\d\-_\.]*@([A-Za-z\d]+[A-Za-z\d\-]*\.)+[A-Za-z]{2,4}$/.test(email) ) {
                this.formLoading = false
                this.$message.error('邮箱有误，请重填')
                return
            }
            this.form.email = email.trim()
        }

        if (this.selection != null && this.selection.length > 0) {
          this.form.depts = []
          for (const deptIds of this.selection) {
            this.form.depts.push(deptIds[deptIds.length - 1])
          }
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
        this.selection = []
        this.defaultDept = null
        this.visible = false
      },
      formReset() {
        this.userId = null
        this.selection = []
        this.defaultDept = null
        this.form = {
          id: null,
          name: null,
          email: null,
          phone: null,
          password: null,
          roles: ["ROLE_USER"],
          depts: null,
        }
      },
    },
  }
</script>

<style scoped>
  .input-area {
    border: 1px solid #DCDFE6;
    display: flex;
    padding: 2px;
    min-height: 26px;
  }

  .input-area .input-area-item {
    height: 18px;
    line-height: 18px;
    font-size: 12px;
    padding-left: 4px;
    margin: 2px 0 2px 6px;
    color: #909399;
    background-color: #FAFAFA;
    border: 1px solid #e9e9eb;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .input-area .input-area-item .input-area-item-icon {
    background-color: #C0C4CC;
    border-radius: 50%;
    font-size: 12px;
    color: #909399;
    margin-left: 5px;
  }

  .input-area .input-area-item .input-area-item-icon:hover {
    background-color: #909399;
    color: #ece4e4;
    cursor: pointer;
  }
</style>
