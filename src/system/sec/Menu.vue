<template>
  <el-container style="height: 100%;">
    <pm-layout :breadcrumbs="['权限信息', '菜单列表']">
      <section slot="tools">
        <el-button size="small" type="primary" @click="openFormDialog(null)">
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
          <el-button @click="loadMenuTable" size="small" icon="el-icon-search"></el-button>
        </section>
        <el-table
          :data="tableData"
          border
          highlight-current-row
          default-expand-all
          row-key="id">
          <el-table-column type="index" width="50"/>
          <el-table-column prop="name" label="名称" width="200" />
          <el-table-column prop="id" label="编码"/>
          <el-table-column prop="path" label="访问路径"/>
          <el-table-column prop="description" label="描述"/>
          <el-table-column prop="sort" label="排序" width="60"/>
          <el-table-column label="操作" width="170">
            <template slot-scope="scope">
              <!-- 只支持到第二级菜单 -->
              <el-button v-if="scope.row.path == null || scope.row.path == ''" type="text" size="small"
                         @click="openFormDialog(null, scope.row)">新建子菜单
              </el-button>
              <el-button type="text" size="small" @click="openFormDialog(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="remove(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </pm-layout>
    <menu-form-dialog ref="MenuFormDialog" @on-success="loadMenuTable"/>
  </el-container>
</template>

<script>
  import MenuFormDialog from './MenuFormDialog'

  export default {
    name: 'Menu',
    components: {MenuFormDialog},
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
      this.loadMenuTable()
    },
    methods: {
      loadMenuTable() {
        this.tableLoading = true
        this.$http.get('/api/menu/getList', {
          menuId: this.condition.id,
          name: this.condition.name,
        }).then(resp => {
          this.tableData = resp.data
          this.tableLoading = false
        })
      },
      openFormDialog(data, parent) {
        this.$refs.MenuFormDialog.visible = true
        this.$refs.MenuFormDialog.menu = data
        this.$refs.MenuFormDialog.parent = parent
      },
      remove(data) {
        this.$confirm('此操作将删除菜单 [ ' + data.name + ' ]，及其级联子菜单, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/menu/remove/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('菜单删除成功')
              this.loadMenuTable()
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
