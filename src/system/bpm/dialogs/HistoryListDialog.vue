<template>
  <el-drawer title="流转历史" :visible.sync="visible" size="500px" direction="rtl">
    <div style="height: calc(100vh - 76px); overflow-y: auto;" v-loading="loading">
      <el-scrollbar class="small">
        <el-timeline style="padding: 0 20px;">
          <el-timeline-item v-for="item in datas"
                            :icon="getNodeIcon(item)"
                            :type="getNodeType(item)"
                            :timestamp="item.startTime"
                            placement="top">
            <el-card class="box-card">
              <div style="display: flex; justify-content: space-between;">
                <p>
                  <i class="el-icon-collection-tag"></i><b>{{ item.name }}</b>
                </p>
                <p><b>{{ item.taskState }}</b></p>
              </div>
              <p v-if="item.comment != null"><i class="el-icon-chat-line-square"></i>{{ item.comment }}</p>
              <p class="assignee"><i class="el-icon-user"></i>{{ item.assigneeName }}</p>
              <p class="end-time" v-if="item.endTime != null">{{ item.endTime }}</p>
              <!--            <div class="migrates">-->
              <!--              <a @click="loadMigrates(item)">-->
              <!--                <i :class="item.openMigrates ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>-->
              <!--              </a>-->
              <!--            </div>-->
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script>
  export default {
    name: "HistoryListDialog",
    data() {
      return {
        visible: false,
        datas: null,
        loading: false,
        task: null,
        processInstanceId: null
      }
    },
    watch: {
      visible(value) {
        if (value && this.datas == null) this.loadList()
      },
      task(value) {
        this.processInstanceId = value.processInstanceId
      }
    },
    methods: {
      loadList() {
        this.loading = true
        this.$http.get('/api/bpm/query/getHistoryList/' + this.processInstanceId).then(resp => {
          if (resp.success) {
            const arr = resp.data.taskList
            for (const t of arr) {
              t.openMigrates = false
              // 如果有投票信息，优先使用投票信息
              if (t.multiInstanceDecision !== null) {
                if (t.multiInstanceDecision === '1') t.taskState = '通过'
                else if (t.multiInstanceDecision === '0') t.taskState = '拒绝'
                else t.taskState = '未知状态：' + t.multiInstanceDecision
              }
              else if (t.multiInstance === true && t.deleteReason === 'MI_END') {
                t.taskState = '未进行'
              }
              // 是否进行中
              else if (t.active) {
                t.taskState = "进行中"
              }
              // 默认提交
              else {
                t.taskState = '已提交'
              }
            }
            this.datas = arr
          } else {
            this.$message.error(resp.message)
          }
          this.loading = false
        }).catch(reason => {
          console.error(reason)
          this.$message.error("流程历史查询失败")
        })
      },
      getNodeIcon(task) {
        if (task.active) {
          return 'el-icon-right'
        }
        if (task.deleteReason === 'MI_END') {
          return 'el-icon-warning-outline'
        }
        if (task.deleteReason === 'Delete MI execution') {
          return 'el-icon-close'
        }
        return 'el-icon-check'
      },
      getNodeType(task) {
        if (task.active && task.taskId === this.task.taskId) {
          return 'success'
        } else if (task.active) {
          return 'default'
        } else if (task.deleteReason === 'MI_END') {
          return 'info'
        } else if (task.deleteReason === 'Delete MI execution') {
          return 'danger'
        } else {
          return 'primary'
        }
      },
      loadMigrates(task) {
        // task.openMigrates = !task.openMigrates
        // this.$http.get('/api/bpm/query/getTaskMigrateListByTaskId/' + task.taskId).then(resp => {
        //   console.log(resp)
        // }).catch(response => {
        //
        // })
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-timeline-item {
    p {
      margin: 5px 0;
      line-height: 22px;
    }

    i {
      margin-right: 5px;
    }

    .end-time, .assignee {
      line-height: 1;
      font-size: 13px;
      text-align: right;
    }

    .migrates {
      &:hover {
        cursor: pointer;
      }
    }
  }
</style>
