<template>
  <el-container style="height: 100%;">
    <pm-layout :breadcrumbs="['组织机构', '组织机构列表']">
      <section slot="tools">
        <el-button size="small" type="primary" @click="create(null, null)">
          <i class="el-icon-plus"></i> 新建
        </el-button>
      </section>
      <section slot="content" style="padding: 5px;" v-loading="tableLoading">
        <section class="table-condition">
          <el-form :inline="true" size="small" label-position="right">
            <el-form-item label="名称">
              <el-input v-model="condition.name" clearable/>
            </el-form-item>
            <el-form-item label="编码">
              <el-input v-model="condition.id" clearable/>
            </el-form-item>
          </el-form>
          <el-button @click="loadDeptTable" size="small" icon="el-icon-search"></el-button>
        </section>
        <el-table
          :data="tableData"
          border
          highlight-current-row
          default-expand-all
          lazy
          :load="lazyLoadDeptTable"
          row-key="id">
          <el-table-column type="index" width="50"/>
          <el-table-column prop="name" label="名称" width="300" />
          <el-table-column prop="id" label="编码"/>
          <el-table-column prop="typeName" label="类型"/>
          <el-table-column prop="sort" label="排序" width="60"/>
          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
            <!--  <el-button type="text" size="small" @click="allocation(scope.row)">直属用户列表</el-button>-->
              <el-button type="text" size="small" @click="create(null, scope.row)">新建子班级</el-button>
              <el-button type="text" size="small" @click="update(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="remove(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </pm-layout>
    <dept-form-dialog ref="DeptFormDialog" @on-success="loadDeptTable"/>
  </el-container>
</template>

<script>
  import DeptFormDialog from './DeptFormDialog'

  export default {
    name: 'Dept',
    components: {DeptFormDialog},
    data() {
      return {
        tableLoading: false,
        tableData: [],

        condition: {
          id: null,
          name: null,
        }
      }
    },
    mounted() {
      this.loadDeptTable()
    },
    methods: {
      loadDeptTable() {
        this.tableLoading = true
        this.$http.get('/api/dept/getList', {
          level: 2,
          deptId: this.condition.id,
          name: this.condition.name,
        }).then(resp => {
          const list = resp.data

          //* 如果level设置为1，需要注释掉该daunt代码，即移除hasChildren，才能正常展示下拉按钮 *//
          for (const item of list) {
            delete item.hasChildren
          }
          //**//

          this.tableData = list
          this.tableLoading = false
        })
      },
      lazyLoadDeptTable(data, treeNode, resolve) {
        this.$http.get('/api/dept/getList', {
          level: 1,
          parentId: data.id,
        }).then(resp => {
          resolve(resp.data)
          this.tableLoading = false
        })
      },
      create(data = null, parent = null) {
        this.$refs.DeptFormDialog.visible = true
        this.$refs.DeptFormDialog.dept = data
        this.$refs.DeptFormDialog.parent = parent
      },
      update(data) {
        this.$refs.DeptFormDialog.visible = true
        this.$refs.DeptFormDialog.dept = data
        this.$refs.DeptFormDialog.parent = null
      },
      remove(data) {
        this.$confirm('此操作将删除组织机构 [ ' + data.name + ' ]，及其子组织机构, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/dept/remove/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('组织机构删除成功')
              this.loadDeptTable()
            } else {
              this.$message.error(resp.message)
            }
            this.tableLoading = false
          }).catch(() => {
            this.tableLoading = false
            this.$message.error('删除失败')
          })
        })
      },
      allocation(data) {
        this.$router.push({
          name: 'DeptRelUser',
          query: {
            deptId: data.id
          }
        })
      }
    }

  }
</script>

<style scoped>

</style>
