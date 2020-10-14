<template>
  <pm-layout :breadcrumbs="['工作流程', '模型列表']">
    <section slot="tools">
      <el-button size="small" @click="createGroup" icon="el-icon-plus">新建组</el-button>
      <el-button type="primary" size="small" @click="create" icon="el-icon-plus">新建模型</el-button>
      <process-group ref="ProcessGroup"></process-group>
    </section>
    <section slot="content" style="padding: 5px;" v-loading="tableLoading">
      <!-- 查询条件 -->
      <section class="table-condition">
        <el-form :inline="true" size="small" label-position="right">
          <el-form-item label="模型名称">
            <el-input clearable v-model="condition.modelName"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="loadModelList" size="small" icon="el-icon-search"></el-button>
      </section>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" width="50"/>
        <el-table-column prop="createTime" label="创建时间" width="150"/>
        <el-table-column prop="lastUpdateTime" label="最后更新时间" width="150"/>
        <el-table-column prop="groupName" label="组名称" width="150">
          <template slot-scope="scope">
            {{ scope.row.groupName == null ? '默认' : scope.row.groupName }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="模型名称"/>
        <el-table-column prop="key" label="流程KEY" width="200"/>
        <el-table-column label="操作" width="130">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="view(scope.row)">查看</el-button>
            <el-button type="text" size="small" @click="edit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="remove(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :pager-count="5"
        background
        @size-change="sizeChange"
        @current-change="pageChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="totalElements">
      </el-pagination>
    </section>
  </pm-layout>
</template>

<script>
  import ProcessGroup from "./ProcessGroup";

  export default {
    name: 'ModelList',
    components: {ProcessGroup},
    data() {
      return {
        tableData: null,

        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 10,
        tableLoading: false,

        condition: {
          modelName: null
        }
      }
    },
    mounted() {
      this.loadModelList()
    },
    methods: {
      loadModelList() {
        this.tableLoading = true
        this.$http.get('/api/bpm/def/getModelList', {
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          modelName: this.condition.modelName
        }).then(resp => {
          const pageResult = resp.data;
          this.tableData = pageResult.content
          this.totalElements = pageResult.totalElements
          this.tableLoading = false
        })
      },
      // 分页信息
      sizeChange(data) {
        this.pageSize = data
        this.loadModelList()
      },
      pageChange(data) {
        this.currentPage = data
        this.loadModelList()
      },
      create() {
        this.$router.push({
          name: 'BpmnEditor'
        })
      },
      createGroup() {
        this.$refs.ProcessGroup.visible = true
      },
      edit(data) {
        this.$router.push({
          name: 'BpmnEditor',
          query: {
            modelId: data.id,
            version: data.version
          }
        })
      },
      view(data) {
        this.$router.push({
          name: 'BpmnViewer',
          query: {
            modelId: data.id,
            version: data.version
          }
        })
      },
      remove(data) {
        this.$confirm('此操作将删除该模型，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/bpm/def/deleteModel/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('模型删除成功')
              this.loadModelList()
            } else {
              this.$message.error(resp.message)
            }
            this.tableLoading = false
          }).catch(() => {
            this.tableLoading = false
            this.$message.error('模型删除失败')
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
