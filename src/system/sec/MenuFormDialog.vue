<template>
  <el-dialog title="菜单信息" :visible.sync="visible" width="550px"
             :close-on-click-modal="false" :close-on-press-escape="false"
             :before-close="cancel">
    <el-form ref="role-form" :model="form" size="small" label-position="right" label-width="80px"
             v-loading="formLoading">
      <el-form-item label="上级菜单">
        <el-cascader style="width: 100%"
                     placeholder="请选择上级菜单"
                     :options="options"
                     clearable
                     v-model="selectedMenu"
                     :props="{ checkStrictly: true }"
                     filterable></el-cascader>
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="编码">
        <el-input v-model="form.id" :readonly="menu != null"/>
      </el-form-item>
      <el-form-item label="访问路径">
        <el-input v-model="form.path"/>
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="form.icon"/>
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number width="100%" v-model="form.sort" :min="1" :max="10000"></el-input-number>
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
    name: 'MenuFormDialog',
    data() {
      return {
        visible: false,
        menu: null,
        parent: null,

        parentMenuId: null,
        selectedMenu: [],
        form: {
          id: null,
          name: null,
          path: null,
          icon: null,
          type: 'BUSINESS',
          description: null,
          parentId: null,
          sort: 1,
        },
        formLoading: false,

        options: [],
      }
    },
    mounted() {
      this.loadCascadeList()
    },
    watch: {
      menu(value) {
        if (value != null) {
          this.form.id = value.id
          this.form.name = value.name
          this.form.path = value.path
          this.form.icon = value.icon
          this.form.type = value.type
          this.form.description = value.description
          this.form.sort = value.sort

          this.parentMenuId = value.parentId
        }
      },
      parent(value) {
        if (value != null) {
          this.parentMenuId = value.id
        }
      },
      parentMenuId(value) {
        if (value != null && value.length > 0) {
          this.$http.get('/api/menu/getCascadeParentList/' + value).then(resp => {
            if (resp.success) {
              this.selectedMenu = resp.data
            } else {
              this.$message.error(resp.message)
            }
          }).catch(() => {
            this.$message.error('获取上级菜单数据失败')
          })
        }
      }
    },
    methods: {
      loadCascadeList() {
        this.$http.get('/api/menu/getTree').then(resp => {
          this.options = []
          this.resolve2treeData(this.options, resp.data)
        })
      },
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
        this.form.parentId = null
        if (this.selectedMenu != null && this.selectedMenu.length > 0) {
          this.form.parentId = this.selectedMenu[this.selectedMenu.length - 1]
        }

        // 上级不是是自身
        if (this.form.parentId != null && this.form.parentId.length > 0) {
          if (this.form.parentId == this.form.id) {
            this.$message.error('上级菜单不能是自身')
            return
          }
        }

        this.formLoading = true
        let url = '/api/menu/save'
        if (this.menu != null) {
          url = '/api/menu/update'
        }
        this.$http.post(url, this.form).then(resp => {
          if (resp.success) {
            this.loadCascadeList()
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
        this.menu = null
        this.parent = null
        this.parentMenuId = null
        this.selectedMenu = []
        this.form = {
          id: null,
          name: null,
          path: null,
          icon: null,
          type: 'BUSINESS',
          description: null,
          parentId: null,
          sort: 1,
        }
      }
    },
  }
</script>

<style scoped>

</style>
