<template>
  <pm-layout :breadcrumbs="['工作流程', '流程列表']">
    <section slot="tools">

    </section>
    <section slot="content" style="padding: 5px;"
             :element-loading-text="loadingMessage"
             v-loading="tableLoading">
      <!-- 查询条件 -->
      <section class="table-condition">
        <el-form :inline="true" size="small" label-position="right">
          <el-form-item label="流程名称">
            <el-input clearable v-model="condition.processDefinitionName"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="loadProcessList" size="small" icon="el-icon-search"></el-button>
      </section>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" width="50"/>
        <el-table-column prop="createTime" label="部署时间" width="150"/>
        <el-table-column prop="groupName" label="组名称" width="150">
          <template slot-scope="scope">
            {{ scope.row.groupName == null ? '默认' : scope.row.groupName }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="流程名称"/>
        <!--        <el-table-column prop="id" label="流程定义ID" width="200"/>-->
        <el-table-column prop="key" label="流程KEY" width="200"/>
        <el-table-column prop="version" label="版本" width="50"/>
        <el-table-column label="操作" width="170">
          <template slot-scope="scope">
            <template v-if="!scope.row.suspend">
              <el-button type="text" size="small" @click="start(scope.row)">启动</el-button>
            </template>
            <el-button type="text" size="small" @click="view(scope.row)">查看</el-button>
            <template v-if="scope.row.suspend">
              <el-button type="text" size="small" @click="activate(scope.row)">激活</el-button>
            </template>
            <template v-else>
              <el-button type="text" size="small" @click="suspend(scope.row)">挂起</el-button>
            </template>
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
      <!-- 查看流程 -->
      <diagram ref="Diagram"></diagram>
    </section>
  </pm-layout>
</template>

<script>
  import {mapState} from 'vuex'
  import Diagram from "./dialogs/Diagram";

  export default {
    name: 'ProcessList',
    components: {Diagram},
    data() {
      return {
        tableData: null,

        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 10,
        tableLoading: false,
        loadingMessage: null,

        condition: {
          processDefinitionName: null,
          maxVersion: true
        }
      }
    },
    computed: {
      ...mapState({
        user: state => state.userDetail,
      }),
    },
    mounted() {
      this.loadProcessList()
    },
    methods: {
      loadProcessList() {
        this.tableLoading = true
        this.$http.get('/api/bpm/def/getProcessList', {
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          processDefinitionName: this.condition.processDefinitionName,
          maxVersion: this.condition.maxVersion,
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
        this.loadProcessList()
      },
      pageChange(data) {
        this.currentPage = data
        this.loadProcessList()
      },
      start(data) {
        this.$confirm('确认启动流程?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.loadingMessage = '流程启动中'
          this.$http.postJson('/api/bpm/core/start', {
            processDefinitionId: data.id,
            starter: this.user.id,
            nextHandlers: null,
          }).then(resp => {
            if (resp.success) {
              this.$message.success('流程启动成功')
            } else {
              this.$message.error(resp.message)
            }
            this.tableLoading = false
            this.loadingMessage = null
          }).catch(() => {
            this.tableLoading = false
            this.loadingMessage = null
            this.$message.error('流程启动失败')
          })
        })
      },
      remove(data) {
        this.$confirm('此操作将删除该流程，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/bpm/def/deleteProcessDefinition/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('流程删除成功')
              this.loadProcessList()
            } else {
              this.$message.error(resp.message)
            }
            this.tableLoading = false
          }).catch(() => {
            this.tableLoading = false
            this.$message.error('流程删除失败')
          })
        })
      },
      view(data) {
        this.$http.get('/api/bpm/def/getByProcessDefinitionId/' + data.id).then(resp => {
          const d = resp.data
          this.$router.push({
            name: 'BpmnViewer',
            query: {
              modelId: d.modelId,
              version: d.version
            }
          })
        })
      },
      suspend(data) {
        this.$confirm('此操作将挂起流程，并锁定该流程及其流程实例下的所有任务，使其无法提交，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.$http.post('/api/bpm/core/suspendByProcessDefinitionId/' + data.id).then(resp => {
            this.tableLoading = true
            this.loadingMessage = '流程挂起中'
            this.loadingMessage = null
            if (resp.success) {
              this.$message.success("流程挂起成功")
              this.loadProcessList()
            } else {
              this.$message.error("流程挂起失败")
            }
            this.tableLoading = false
          })
        })
      },
      activate(data) {
        this.$http.post('/api/bpm/core/activateByProcessDefinitionId/' + data.id).then(resp => {
          this.tableLoading = true
          this.loadingMessage = '流程激活中'
          this.loadingMessage = null
          if (resp.success) {
            this.$message.success("流程激活成功")
            this.loadProcessList()
          } else {
            this.$message.error("流程激活失败")
          }
          this.tableLoading = false
        })
      },
    }
  }
</script>

<style scoped>

</style>
