<template>
  <el-dialog title="功能信息" :visible.sync="visible" width="550px"
             :close-on-click-modal="false" :close-on-press-escape="false"
             :before-close="cancel">
    <el-form ref="role-form" :model="form" size="small" label-position="right" label-width="80px"
             v-loading="formLoading">
      <el-form-item label="所属目录">
        <el-cascader style="width: 100%"
                     placeholder="请选择所属目录"
                     :options="options"
                     clearable
                     v-model="selectedFn"
                     :props="{ checkStrictly: true }"
                     filterable></el-cascader>
      </el-form-item>
      <el-form-item label="名称">
        <el-input clearable v-model="form.name" placeholder="必填"/>
      </el-form-item>
      <el-form-item label="编码" v-if="form.type == 'FN'">
        <el-input v-model="form.id" :readonly="fn != null" placeholder="必填" />
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
    name: 'FnFormDialog',
    data() {
      return {
        visible: false,
        fn: null,
        type: null,
        parent: null,

        parentFnId: null,
        selectedFn: [],
        form: {
          id: null,
          name: null,
          type: 'FN',
          description: null,
          parentId: null,
        },
        formLoading: false,

        options: [],
      }
    },
    mounted() {
      this.loadCascadeList()
    },
    watch: {
      type(value) {
        if (value != null) {
          this.form.type = value
        }
      },
      fn(value) {
        if (value != null) {
          this.form.id = value.id
          this.form.name = value.name
          this.form.type = value.type
          this.form.description = value.description

          this.parentFnId = value.parentId
        }
      },
      parent(value) {
        if (value != null) {
          this.parentFnId = value.id
        }
      },
      parentFnId(value) {
        if (value != null && value.length > 0) {
          this.$http.get('/api/fn/getCascadeParentList/' + value).then(resp => {
            if (resp.success) {
              this.selectedFn = resp.data
            } else {
              this.$message.error(resp.message)
            }
          }).catch(() => {
            this.$message.error('获取上级功能数据失败')
          })
        }
      }
    },
    methods: {
      loadCascadeList() {
        this.$http.get('/api/fn/getDirTree').then(resp => {
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
        if (this.selectedFn != null && this.selectedFn.length > 0) {
          this.form.parentId = this.selectedFn[this.selectedFn.length - 1]
        }

        // 上级不是是自身
        if (this.form.parentId != null && this.form.parentId.length > 0) {
          if (this.form.parentId == this.form.id) {
            this.$message.error('所属目录不能是自身')
            return
          }
        }

        let url = null
        if (this.fn == null) {
          url = '/api/fn/save'
          if (this.form.type == 'DIR' && this.$util.validate.isEmpty(this.form.id)) {
            this.form.id = this.$util.uuid()
          }
        } else {
          url = '/api/fn/update'
        }

        if (this.$util.validate.isEmpty(this.form.name)) {
          this.$message.error('功能名称不能为空')
          return
        }

        if (this.$util.validate.isEmpty(this.form.id)) {
          this.$message.error('功能编码不能为空')
          return
        }

        this.formLoading = true
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
        this.type = null
        this.fn = null
        this.parent = null
        this.parentFnId = null
        this.selectedFn = []
        this.form = {
          id: null,
          name: null,
          type: 'FN',
          description: null,
          parentId: null,
        }
      }
    },
  }
</script>

<style scoped>

</style>
