<template>
  <pm-layout :breadcrumbs="['工作流程', '待办列表']">
    <section slot="tools">

    </section>
    <section slot="content" style="padding: 5px;" v-loading="tableLoading">
      <!-- 查询条件 -->
      <section class="table-condition">
        <el-form :inline="true" size="small" label-position="right">
          <el-form-item label="流程">
            <el-select v-model="condition.processDefinitionKey" filterable clearable placeholder="">
              <el-option-group v-for="group in processList" :key="group.id" :label="group.name">
                <el-option v-for="item in group.list" :key="item.key" :label="item.name" :value="item.key">
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="流程名称">
            <el-input clearable v-model="condition.processDefinitionName"></el-input>
          </el-form-item>
          <el-form-item label="任务名称">
            <el-input clearable v-model="condition.taskName"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="loadTodoList" size="small" icon="el-icon-search"></el-button>
      </section>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" width="50"/>
        <el-table-column prop="startTime" label="创建时间" width="150"/>
        <el-table-column prop="process.starterName" label="发起人" width="150"/>
        <el-table-column prop="process.processDefinitionName" label="流程名称" width="250"/>
        <el-table-column prop="name" label="任务名称"/>
        <el-table-column label="操作" width="140">
          <template slot-scope="scope">
            <template v-if="scope.row.process.suspend">
<!--              <el-button type="text" size="small" @click="activate(scope.row)">激活</el-button>-->
              <el-tag size="small" type="warning">已挂起</el-tag>
            </template>
            <template v-else>
              <el-button v-if="scope.row.pending" type="text" size="small" @click="claim(scope.row)">组任务签收</el-button>
              <template v-else>
                <el-button type="text" size="small" @click="toForm(scope.row)">审批</el-button>
                <template v-if="scope.row.claimTime != null">
                  <el-button type="text" size="small" @click="sendBack(scope.row)">组任务退回</el-button>
                </template>
<!--                <el-button type="text" size="small" @click="suspend(scope.row)">挂起</el-button>-->
              </template>
            </template>
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
  import {mapState} from 'vuex'

  export default {
    name: 'TodoList',
    data() {
      return {
        tableData: null,
        processList: null,

        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 10,
        tableLoading: false,

        condition: {
          taskName: null,
          processDefinitionName: null,
          processDefinitionKey: null,
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
      this.loadTodoList()
    },
    methods: {
      loadProcessList() {
        this.$http.get('/api/bpm/def/getProcessListByGroup').then(resp => {
          this.processList = resp.data
        })
      },
      loadTodoList() {
        this.tableLoading = true
        this.$http.get('/api/bpm/query/getTodoTaskList/' + this.user.id, {
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          taskName: this.condition.taskName,
          processDefinitionName: this.condition.processDefinitionName,
          processDefinitionKey: this.condition.processDefinitionKey
        }).then(resp => {
          if (resp.success) {
            const pageResult = resp.data;
            this.tableData = pageResult.content
            this.totalElements = pageResult.totalElements
          } else {
            this.$message.error("待办任务数据加载失败")
          }
          this.tableLoading = false
        }).catch(response => {
          this.$message.error("待办任务数据加载失败")
          this.tableLoading = false
        })
      },
      // 分页信息
      sizeChange(data) {
        this.pageSize = data
        this.loadTodoList()
      },
      pageChange(data) {
        this.currentPage = data
        this.loadTodoList()
      },

      claim(data) {
        this.$http.post('/api/bpm/core/claim/' + data.taskId + '/' + this.user.id).then(resp => {
          if (resp.success) {
            this.$message.success("组任务签收成功")
            this.loadTodoList()
          } else {
            this.$message.error("组任务签收失败")
          }
        })
      },
      sendBack(data) {
        this.$confirm('该任务将重新回到组任务，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.$http.post('/api/bpm/core/sendBack/' + data.taskId).then(resp => {
            if (resp.success) {
              this.$message.success("组任务退回成功")
              this.loadTodoList()
            } else {
              this.$message.error("组任务退回失败")
            }
          })
        })
      },
      toForm(data) {
        const routeName = data.formUrl
        if (routeName == null || routeName == '') {
          this.$message.error('没有找到有效的路由地址')
        } else {
          this.$router.push({
            name: routeName,
            query: {
              taskId: data.taskId
            }
          })
        }
      },
      // suspend(data) {
      //   this.$confirm('此操作将挂起流程，并锁定该流程实例下的所有任务，使其无法提交，是否继续?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning',
      //   }).then(() => {
      //     this.$http.post('/api/bpm/core/suspend/' + data.processInstanceId).then(resp => {
      //       if (resp.success) {
      //         this.$message.success("流程挂起成功")
      //         this.loadTodoList()
      //       } else {
      //         this.$message.error("流程挂起失败")
      //       }
      //     })
      //   })
      // },
      // activate(data) {
      //   this.$http.post('/api/bpm/core/activate/' + data.processInstanceId).then(resp => {
      //     if (resp.success) {
      //       this.$message.success("流程激活成功")
      //       this.loadTodoList()
      //     } else {
      //       this.$message.error("流程激活失败")
      //     }
      //   })
      // },
    }
  }
</script>

<style scoped>

</style>
