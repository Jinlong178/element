<template>
  <el-dialog title="组织机构信息" :visible.sync="visible" width="550px"
             :close-on-click-modal="false" :close-on-press-escape="false"
             :before-close="cancel">
    <el-form ref="role-form" :model="form" size="small" label-position="right" label-width="80px"
             v-loading="formLoading">
      <el-form-item label="上级组织">
        <el-cascader style="width: 100%"
                     placeholder="请选择上级组织机构"
                     :options="options"
                     clearable
                     v-model="selectedDept"
                     :props="{ checkStrictly: true }"
                     filterable></el-cascader>
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="编码">
        <el-input v-model="form.id" :readonly="dept != null"/>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.type" clearable filterable style="width: 100%;">
          <el-option v-for="item in deptTypeList"
                     :key="item.key"
                     :label="item.name"
                     :value="item.key"/>
        </el-select>
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number width="100%" v-model="form.sort" :min="1" :max="10000"></el-input-number>
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
    name: 'DeptFormDialog',
    data() {
      return {
        visible: false,
        dept: null,
        parent: null,

        parentDeptId: null,
        selectedDept: [],
        form: {
          id: null,
          name: null,
          parentId: null,
          type: null,
          sort: 1,
        },
        formLoading: false,

        options: [],

        // 组织机构类型，数据字典数据
        deptTypeList: [],
      }
    },
    mounted() {
      this.$api.dictionary.getList('DEPT_TYPE', results => this.deptTypeList = results)
      this.loadCascadeList()
    },
    watch: {
      dept(value) {
        if (value != null) {
          this.form.id = value.id
          this.form.name = value.name
          this.form.sort = value.sort
          this.form.type = value.type

          this.parentDeptId = value.parentId
        }
      },
      parent(value) {
        if (value != null) {
          this.parentDeptId = value.id
        }
      },
      parentDeptId(value) {
        if (value != null && value.length > 0) {
          this.$http.get('/api/dept/getCascadeParentList/' + value).then(resp => {
            if (resp.success) {
              this.selectedDept = resp.data
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
        this.$http.get('/api/dept/getTree').then(resp => {
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
        if (this.selectedDept != null && this.selectedDept.length > 0) {
          this.form.parentId = this.selectedDept[this.selectedDept.length - 1]
        }

        // 上级不是是自身
        if (this.form.parentId != null && this.form.parentId.length > 0) {
          if (this.form.parentId == this.form.id) {
            this.$message.error('上级组织机构不能是自身')
            return
          }
        }

        this.formLoading = true
        let url = '/api/dept/save'
        if (this.dept != null) {
          url = '/api/dept/update'
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
        this.dept = null
        this.parent = null
        this.parentDeptId = null
        this.selectedDept = []
        this.form = {
          id: null,
          name: null,
          parentId: null,
          type: null,
          sort: 1,
        }
      }
    },
  }
</script>

<style scoped>

</style>
