<template>
  <el-container style="height: 100%;">
    <pm-layout :breadcrumbs="['权限信息', '角色列表']">
      <section slot="tools">
        <el-button size="small" type="primary" @click="openFormDialog(null)">
          <i class="el-icon-plus"></i> 新建
        </el-button>
      </section>
      <section slot="content" style="padding: 5px;" v-loading="tableLoading">
        <!-- 查询条件 -->
        <section class="table-condition">
          <el-form :inline="true" size="small" label-position="right">
            <el-form-item label="名称">
              <el-input v-model="condition.name" clearable></el-input>
            </el-form-item>
            <el-form-item label="编码">
              <el-input v-model="condition.id" clearable></el-input>
            </el-form-item>
          </el-form>
          <el-button @click="loadRoleTable" size="small" icon="el-icon-search"></el-button>
        </section>
        <el-table :data="tableData" border highlight-current-row style="width: 100%">
          <el-table-column type="index" width="50"/>
          <el-table-column prop="createTime" label="创建时间" width="150"/>
          <el-table-column prop="name" label="名称"/>
          <el-table-column prop="id" label="编码"/>
          <el-table-column prop="description" label="描述"/>
          <el-table-column label="操作" width="90">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="openFormDialog(scope.row)">编辑</el-button>
              <el-button v-if="isSystemRole(scope.row)" type="text" size="small" @click="remove(scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          :pager-count="5"
          background
          @size-change="sizeChange"
          @current-change="pageChange"
          :current-page="currentPage"
          :page-sizes="[50, 100, 300, 500]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="totalElements">
        </el-pagination>
      </section>
    </pm-layout>
    <role-form-dialog ref="RoleFormDialog" @on-success="loadRoleTable"/>
  </el-container>
</template>

<script>
  import RoleFormDialog from './RoleFormDialog'

  export default {
    name: 'Role',
    components: {RoleFormDialog},
    data() {
      return {
        tableLoading: false,
        tableData: null,

        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 50,

        condition: {
          name: null,
          id: null,
        }
      }
    },
    mounted() {
      this.loadRoleTable()
    },
    methods: {
      loadRoleTable() {
        this.tableLoading = true
        this.$http.get('/api/role/getPageList', {
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          name: this.condition.name,
          id: this.condition.id,
        }).then(resp => {
          this.totalElements = resp.data.totalElements
          this.tableData = resp.data.content
          this.tableLoading = false
        })
      },
      // 分页信息
      sizeChange(data) {
        this.pageSize = data
        this.loadRoleTable()
      },
      pageChange(data) {
        this.currentPage = data
        this.loadRoleTable()
      },
      isSystemRole(data) {
        const arr = ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_DEPT_ADMIN']
        return arr.indexOf(data.id) < 0
      },
      openFormDialog(data) {
        this.$refs.RoleFormDialog.visible = true
        this.$refs.RoleFormDialog.role = data
      },
      remove(data) {
        this.$confirm('此操作将删除角色 [ ' + data.name + ' ]，并解除所有授权，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/role/remove/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('角色删除成功')
              this.loadRoleTable()
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
    }

  }
</script>

<style scoped>

</style>
