<template>
  <el-container style="height: 100%;">
    <pm-layout :breadcrumbs="['权限信息', '功能列表']">
      <section slot="tools">
        <el-button size="small" type="primary" @click="create('DIR', null)">
          <i class="el-icon-plus"></i> 新建目录
        </el-button>
        <el-button size="small" type="primary" @click="create('FN', null)">
          <i class="el-icon-plus"></i> 新建功能点
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
          <el-button @click="loadFnTable" size="small" icon="el-icon-search"></el-button>
        </section>
        <el-table
          :data="tableData"
          border
          highlight-current-row
          default-expand-all
          row-key="id">
          <el-table-column type="index" width="50"/>
          <el-table-column prop="name" label="名称">
            <template slot-scope="scope">
              <template v-if="scope.row.type == 'DIR'"><b>{{ scope.row.name }}</b></template>
              <template v-else>{{ scope.row.name }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="编码"/>
          <el-table-column prop="description" label="描述"/>
          <el-table-column label="操作" width="235">
            <template slot-scope="scope">
              <el-button v-if="scope.row.type == 'DIR'" type="text" size="small"
                         @click="create('DIR', scope.row)">新建子目录
              </el-button>
              <el-button v-if="scope.row.type == 'DIR'" type="text" size="small"
                         @click="create('FN', scope.row)">新建功能点
              </el-button>
              <el-button type="text" size="small" @click="edit(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="remove(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </pm-layout>
    <fn-form-dialog ref="FnFormDialog" @on-success="loadFnTable"/>
  </el-container>
</template>

<script>
  import FnFormDialog from './FnFormDialog'

  export default {
    name: 'Fn',
    components: {FnFormDialog},
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
      this.loadFnTable()
    },
    methods: {
      loadFnTable() {
        this.tableLoading = true
        this.$http.get('/api/fn/getList', {
          fnId: this.condition.id,
          name: this.condition.name
        }).then(resp => {
          this.tableData = resp.data
          this.tableLoading = false
        })
      },

      // 新建目录、功能点
      create(type = 'DIR', parent = null) {
        this.$refs.FnFormDialog.visible = true
        this.$refs.FnFormDialog.type = type
        this.$refs.FnFormDialog.parent = parent
      },
      // 编辑
      edit(data = null) {
        this.$refs.FnFormDialog.visible = true
        this.$refs.FnFormDialog.type = data.type
        this.$refs.FnFormDialog.fn = data
      },
      remove(data) {
        this.$confirm('此操作将删除功能 [ ' + data.name + ' ]，及其级联子功能, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/fn/deleteOfCascade/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('功能删除成功')
              this.loadFnTable()
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
