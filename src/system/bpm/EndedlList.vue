<template>
  <pm-layout :breadcrumbs="['工作流程', '已办列表']">
    <section slot="tools">

    </section>
    <section slot="content" style="padding: 5px;" v-loading="tableLoading">
      <!-- 查询条件 -->
      <section class="table-condition">
        <el-form :inline="true" size="small" label-position="right">
          <el-form-item label="流程">
            <el-select v-model="condition.processDefinitionKey" clearable placeholder="">
              <el-option-group v-for="group in processList" :key="group.id" :label="group.name">
                <el-option v-for="item in group.list" :key="item.key" :label="item.name" :value="item.key">
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="流程名称">
            <el-input clearable v-model="condition.processDefinitionName"></el-input>
          </el-form-item>
        </el-form>
        <el-form :inline="true" size="small" label-position="right">
          <el-form-item label="状态">
            <el-select clearable v-model="condition.state" placeholder="所有">
              <el-option label="已办结" key="END" value="END"></el-option>
              <el-option label="进行中" key="RUN" value="RUN"></el-option>
              <!--              <el-option label="待办" key="RUN" value="ACTIVE"></el-option>-->
            </el-select>
          </el-form-item>
        </el-form>
        <el-button @click="loadModelList" size="small" icon="el-icon-search"></el-button>
      </section>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" width="50"/>
        <el-table-column prop="startTime" label="开始时间" width="150"/>
        <el-table-column prop="endTime" label="结束时间" width="150"/>
        <el-table-column prop="starterName" label="发起人" width="160"/>
        <el-table-column prop="processDefinitionName" label="流程名称"/>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <template v-if="scope.row.endTime != null">
              已办结
            </template>
            <template v-else>
              进行中
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="toForm(scope.row)">查看</el-button>
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
    name: 'EndedList',
    data() {
      return {
        tableData: null,

        processList: [],

        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 10,
        tableLoading: false,

        condition: {
          processDefinitionName: null,
          processDefinitionKey: null,
          state: null,
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
      this.loadModelList()
    },
    methods: {
      loadProcessList() {
        this.$http.get('/api/bpm/def/getProcessListByGroup').then(resp => {
          this.processList = resp.data
        })
      },
      loadModelList() {
        this.tableLoading = true
        this.$http.get('/api/bpm/query/getProcessListByAssignee/' + this.user.id, {
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          processDefinitionName: this.condition.processDefinitionName,
          processDefinitionKey: this.condition.processDefinitionKey,
          state: this.condition.state
        }).then(resp => {
          if (resp.success) {
            const pageResult = resp.data;
            this.tableData = pageResult.content
            this.totalElements = pageResult.totalElements
          } else {
            this.$message.error(resp.message)
          }
          this.tableLoading = false
        }).catch(response => {
          this.$message.error("流程历史查询失败")
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
      toForm(data) {
        alert("查看");
      },
    }
  }
</script>

<style scoped>

</style>
