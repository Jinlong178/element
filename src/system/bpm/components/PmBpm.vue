<!--
@on-init    获取流程信息
参数：
  task：    任务信息，只读

:options    设置操作按钮，Array类型 或 Function类型

:complete   流程提交函数，Function类型
参数：
  task      任务信息，只读
  param     流程参数，读写
  option    当前正在执行的操作
  complete  流程组件提供的提交函数，手动调用该函数提交任务

:afterComplete    提交后执行回调，无论成功或失败，都会执行
参数：
  task      任务信息，只读
  param     提交参数，只读
  option    当前正在执行的操作
  response  提交后信息
-->
<template>
  <el-container style="height: 100%;"
                :element-loading-text="loadMessage"
                v-loading="loading">
    <!-- 信息操作区域 -->
    <el-header style="padding: 0; height: auto;">
      <section class="ops-parent">
        <!-- 流程标题、任务名称 -->
        <div class="title">{{ task.process.processDefinitionName}}：
          <small>
            {{ task.name }}
            <el-tag @click="openMigrateList" title="点击查看任务流转历史" v-if="task.proxy" size="mini">代理</el-tag>
            <el-tag @click="openMigrateList" title="点击查看任务流转历史" v-if="task.delegate" size="mini">委托</el-tag>
            <el-tag @click="openMigrateList" title="点击查看任务流转历史" v-if="task.transfer" size="mini">转办</el-tag>
            <el-tag @click="openForward" title="点击查看流程转发历史" v-if="task.forward" size="mini">转发</el-tag>
          </small>
        </div>

        <!-- 流程操作 -->
        <div class="ops">
          <template v-if="!readonly && buttons">
            <el-button size="small" v-for="item in buttons" @click="submit(item)">{{ item.name }}</el-button>
          </template>
          <el-button size="small" @click="openRuntimeDiagramDialog">流程图</el-button>
          <el-button size="small" @click="openHistory">流转历史</el-button>
          <el-dropdown trigger="click">
            <el-button size="small">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="!readonly" @click.native="selectExecuteUser('delegate')">委托
              </el-dropdown-item>
              <el-dropdown-item v-if="!readonly" @click.native="selectExecuteUser('transfer')">转办
              </el-dropdown-item>
              <el-dropdown-item @click.native="selectExecuteUser('forward')">转发</el-dropdown-item>
              <el-dropdown-item v-if="task.claimTime != null && !readonly" @click.native="sendBack">组任务退回
              </el-dropdown-item>
              <!--              <el-dropdown-item v-if="task.multiInstance === true && !readonly" @click.native="addMultiInstanceAssignee">加签-->
              <!--              </el-dropdown-item>-->
              <!--              <el-dropdown-item v-if="task.multiInstance === true && !readonly" @click.native="deleteMultiInstanceAssignee">减签-->
              <!--              </el-dropdown-item>-->
              <!--              <el-dropdown-item v-if="!readonly" @click.native="suspend">流程挂起</el-dropdown-item>-->
              <el-dropdown-item v-if="!readonly" @click.native="stop">
                <b style="color: #F56C6C;">中止流程</b>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 其他 -->
          <el-button size="small" @click="$router.go(-1)">返回</el-button>
        </div>
      </section>

      <!-- 调用的组件 -->
      <!-- 流程图 -->
      <!--      <runtime-diagram ref="RuntimeDiagram"></runtime-diagram>-->
      <!-- 流转历史 -->
      <history-list-dialog ref="HistoryListDialog"></history-list-dialog>
      <!-- 下一环节处理人列表 -->
      <select-candidate-dialog ref="SelectCandidateDialog"></select-candidate-dialog>
      <!-- 转办、转发用户选择 -->
      <select-execute-user ref="SelectExecuteUser" :multiple="multipleUser" :on-confirm="getUser"
                           :on-validate="validateSelectExecuteUser"
                           :on-cancel="selectExecuteUserCancel"></select-execute-user>
      <!-- 任务状态迁移列表 -->
      <task-migrate-list-dialog ref="TaskMigrateListDialog"></task-migrate-list-dialog>
      <!-- 转发历史列表 -->
      <forward-list-dialog ref="ForwardListDialog"></forward-list-dialog>
    </el-header>

    <!-- 主内容区域 -->
    <el-main style="padding: 0; position: relative;">
      <el-scrollbar class="small">
        <slot></slot>
      </el-scrollbar>
    </el-main>

    <!-- 批注 -->
    <el-footer v-if="!closeComment && !readonly" class="comment-area">
      <!-- 多行文本 -->
      <el-input type="textarea"
                :autosize="{ minRows: 2, maxRows: 5}"
                v-model="param.comment"
                :placeholder="commentPlaceholder"
                :maxlength="maxLength"
                show-word-limit></el-input>
    </el-footer>
  </el-container>
</template>

<script>
  import {mapState} from 'vuex'
  import RuntimeDiagram from "../dialogs/RuntimeDiagram"
  import HistoryListDialog from "../dialogs/HistoryListDialog"
  import SelectCandidateDialog from "../dialogs/SelectCandidateDialog"
  import SelectExecuteUser from "./SelectExecuteUser";
  import TaskMigrateListDialog from "../dialogs/TaskMigrateListDialog";
  import ForwardListDialog from "../dialogs/ForwardListDialog";

  export default {
    name: "PmBpm",
    components: {
      RuntimeDiagram,
      ForwardListDialog,
      TaskMigrateListDialog,
      SelectExecuteUser,
      SelectCandidateDialog,
      HistoryListDialog,
    },
    props: {
      /**
       * 挂载自定义操作<br>
       * <b>Array</b> 类型
       * <b>Function</b> 类型，返回值是Array类型（操作列表）<br>
       * 参数：
       * --- task，只读
       * --- param，读写
       * 返回值每个元素都是Object类型，属性如下：
       *  --- name  String类型，操作按钮名称
       * <br><br>
       * 注意：<br>
       *     这些按钮<b>无法调用下一环节处理人选择页面</b>
       */
      options: {
        type: Function | Array,
        default: null,
      },
      /**
       * 提交操作，如果没有实现该函数，执行默认提交<br>
       * 参数：<br>
       * - <b>task</b> 任务信息，只读
       * - <b>param</b> 提交参数，读写
       * --- lineKey    路线KEY
       * --- expressionMap  任务流程时使用的表达式参数，数据不存储，Object类型
       * --- data  流程数据存储，该数据会持久化，后续每个环节都可以修改、删除、添加，Object类型
       * --- nextHandlers   下一环节处理人列表
       * - <b>complete</b> 提交函数，手动调用该函数
       */
      complete: {
        type: Function,
        default: null,
      },

      /**
       * 提交后执行回调，无论成功或失败，都会执行<br>
       * 参数：<br>
       * - <b>task</b> 任务信息，只读
       * - <b>param</b> 提交参数，只读
       * - <b>option</b> 操作对象
       * - <b>response</b> 提交后信息
       */
      afterComplete: {
        type: Function,
        default: null,
      },

      /**
       * 只读，如果为true，流程相关的操作功能无法使用
       */
      readonly: {
        type: Boolean,
        default: false,
      },

      /* 批注相关 */
      /**
       * 是否关闭批注区域
       */
      closeComment: {
        type: Boolean,
        default: false,
      },
      /**
       * 批注的提示文字， String
       */
      commentPlaceholder: {
        type: String,
        default: '任务批注',
      },

      /**
       * 流程操作属性设置
       */
      settings: {
        type: Function | Object,
        default: null,
      },
    },
    data() {
      return {
        loading: false,
        loadMessage: null,
        maxLength: 500,

        // 任务信息
        taskId: null,
        task: {
          process: {
            processDefinitionName: null
          },
          name: null,
          claimTime: null,
          processInstanceId: null,
          migrates: null,
          migrateId: null,
          proxy: false,
          delegate: false,
          transfer: false,
        },

        // 任务操作按钮列表
        buttons: [],
        // 当前已激活的操作按钮
        activateOption: null,

        // 提交参数列表
        param: {
          lineKey: null,
          /**
           * 任务批注
           */
          comment: null,
          /**
           * 任务流转时使用的表达式参数
           */
          expressionMap: {},
          /**
           * 流程数据存储
           */
          data: {},
          /**
           * 下一环节处理人数组
           */
          nextHandlers: [],
        },

        properties: {
          // 操作窗口
          // 流转历史窗口
          openHistoryDialog: null,
          // 候选人窗口
          openCandidateDialog: null,
          // 任务状态迁移窗口
          openTaskMigrateDialog: null,
        },

        // 用户选择后的回调函数名称
        selectExecuteUserCallbackName: null,
        multipleUser: false,

        migrateArray: [],
      }
    },
    computed: {
      ...mapState({
        user: state => state.userDetail,
      }),
    },
    mounted() {
      this.taskId = this.$route.query.taskId
    },
    watch: {
      taskId(value) {
        this.loading = true
        this.$http.get('/api/bpm/query/getTaskDetailById/' + value).then(resp => {
          if (resp.success) {
            this.task = resp.data

            // 持久化数据需要查出
            this.param.data = this.task.data == null ? {} : this.task.data

            // 发布初始化事件
            this.$emit('on-init', this.$util.map.clone(this.task))

            // 自定义参数设置
            if (this.settings != null)  {
              if (this.settings.constructor == Object) {
                this.properties = Object.assign(this.properties, this.settings)
              } else if (this.settings.constructor == Function) {
                const customSettings = this.settings(this.$util.map.clone(this.task), this.$util.map.clone(this.param))
                if (customSettings != null) {
                  this.properties = Object.assign(this.properties, customSettings)
                }
              }
            }

            // 加载操作列表
            this.getOptionList()
          } else {
            this.$message.error(resp.message)
          }
          this.loading = false
        }, reason => {
        }).catch(reason => {
          console.error(reason)
          this.loading = false
          this.$message.error('任务信息获取失败')
        })
      },
    },
    methods: {
      submit(item) {
        this.loading = true

        this.activateOption = item

        // 选择下一环节处理人，然后回调设置下一环节处理人方法
        if (this.activateOption.type === 'CUSTOM' ||// 如果是自定义操作按钮不允许选择下一环节处理人，selectNextHandlers 无效
          (this.activateOption.type === 'SYSTEM' && this.activateOption.selectNextHandlers === false)) {  //默认按钮列表，显式的声明 selectNextHandlers == false，不选择下一环节处理人
          this.$confirm('即将提交该任务, 是否继续？', '提示', {
            confirmButtonText: '提交',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 不选择人员，直接提交
            this.setNextHandlers(this.param.nextHandlers)
          }, reason => {
          }).catch(reason => console.error(reason));
        }
        // 打开下一环节处理人选择列表
        else {
          if (this.properties.openCandidateDialog) {
            this.properties.openCandidateDialog(this.$util.map.clone(this.task), this.setNextHandlers)
          } else {
            this.$refs.SelectCandidateDialog.visible = true
            this.$refs.SelectCandidateDialog.meta = this.activateOption.meta
            this.$refs.SelectCandidateDialog.processInstanceId = this.task.processInstanceId
            this.$refs.SelectCandidateDialog.processDefinitionId = this.task.process.processDefinitionId
            // 选择人员后回调
            this.$refs.SelectCandidateDialog.callback = this.setNextHandlers
          }
        }
        this.loading = false
      },
      // 设置下一环节处理人
      setNextHandlers(nextHandlers) {
        this.param.nextHandlers = nextHandlers
        // 表单提交
        if (this.complete) {
          // 执行提交函数，在这里，可以进行其他一步操作，然后调用提交接口
          this.complete(this.$util.map.clone(this.task), this.param, this.activateOption, this.completeTask)
        } else {
          // 流程提交
          this.completeTask()
        }
      },
      // 提交任务
      completeTask() {
        this.loading = true
        this.loadMessage = '任务提交中'
        if (this.activateOption.type == 'SYSTEM') {
          this.activateOption.before(this.$util.map.clone(this.task), this.param)
        }

        // 校验数据类型
        if (this.param.expressionMap != null && !(this.param.expressionMap instanceof Object)) {
          this.$message.error("表达式数据只能是Object类型")
          this.loading = false
          this.loadMessage = null
          return;
        }
        if (this.param.data != null && !(this.param.data instanceof Object)) {
          this.$message.error("流程存储数据只能是Object类型")
          this.loading = false
          this.loadMessage = null
          return;
        }
        if (this.param.nextHandlers != null && !(this.param.nextHandlers instanceof Array)) {
          this.$message.error("下一环节处理人参数只能是数组类型")
          this.loading = false
          this.loadMessage = null
          return;
        }

        if (this.param.nextHandlers != null && !(this.param.nextHandlers instanceof Array)) {
          this.$message.error("下一环节处理人参数只能是数组类型")
          this.loading = false
          this.loadMessage = null
          return;
        }


        // 提交
        this.$http.postJson('/api/bpm/core/complete', {
          taskId: this.taskId,
          lineKey: this.param.lineKey,
          comment: this.param.comment == null ? null : this.param.comment.trim(),
          nextHandlers: this.param.nextHandlers,
          expressionMap: this.param.expressionMap,
          data: this.param.data,
        }).then(resp => {
          if (this.afterComplete) {
            this.afterComplete(this.$util.map.clone(this.task), this.$util.map.clone(this.param), this.activateOption, resp)
          } else {
            if (resp.success) {
              this.$message.success('任务提交成功')
              this.$router.go(-1)
            } else {
              this.$message.error(resp.message)
            }
          }

          this.loading = false
          this.loadMessage = null
        }).catch(response => {
          if (this.afterComplete) {
            this.afterComplete(this.$util.map.clone(this.task), this.$util.map.clone(this.param), this.activateOption, resp)
          } else {
            if (resp.success) {
              this.$message.success('任务提交成功')
              this.$router.go(-1)
            } else {
              this.$message.error(resp.message)
            }
          }

          this.loading = false
          this.loadMessage = null
        })
      },
      sendBack() {
        this.$confirm('该任务将重新回到组任务，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.loading = true
          this.$http.post('/api/bpm/core/sendBack/' + this.taskId).then(resp => {
            if (resp.success) {
              this.$message.success("组任务退回成功")
              this.$router.go(-1)
            } else {
              this.$message.error("组任务退回失败，" + resp.message)
            }
            this.loading = false
          }, reason => {
          }).catch(reason => {
            console.error(reason)
            this.loading = false
            this.$message.error("组任务退回失败")
          })
        }, reason => {
        }).catch(response => {
          this.$message.error("组任务退回失败")
        })
      },
      /**
       * 加签
       */
      addMultiInstanceAssignee() {
        this.$http.postJson('/api/bpm/core/addMultiInstanceAssignee/' + this.taskId, {
          userList: ['zhangsan']
        }).then(resp => {
          if (resp.success) {
            this.$message.success("加签成功")
          } else {
            this.$message.error("加签失败，" + resp.message)
          }
          this.loading = false
        }, reason => {
        }).catch(reason => {
          console.error(reason)
          this.$message.error("加签失败")
        })
      },
      /**
       * 减签
       */
      deleteMultiInstanceAssignee() {
        this.$http.postJson('/api/bpm/core/deleteMultiInstanceAssignee/' + this.taskId, {
          userList: ['zhangsan']
        }).then(resp => {
          if (resp.success) {
            this.$message.success("减签成功")
          } else {
            this.$message.error("减签失败，" + resp.message)
          }
          this.loading = false
        }, reason => {
        }).catch(reason => {
          console.error(reason)
          this.$message.error("减签失败")
        })
      },
      // suspend() {
      //   this.$confirm('此操作将挂起流程，并锁定该流程实例下的所有任务，使其无法提交，是否继续?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning',
      //   }).then(() => {
      //     this.loading = true
      //     this.$http.post('/api/bpm/core/suspend/' + this.task.processInstanceId).then(resp => {
      //         if (resp.success) {
      //           this.$message.success("流程挂起成功")
      //           this.$router.go(-1)
      //         } else {
      //           this.$message.error("流程挂起失败")
      //         }
      //         this.loading = false
      //     })
      //   })
      // },
      /**
       * 停止流程流转
       */
      stop() {
        this.$confirm('该流程将强行中止，进入办结状态，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.loading = true
          this.loadMessage = '流程中止中'
          this.$http.post('/api/bpm/core/stop/' + this.taskId).then(resp => {
            if (resp.success) {
              this.$message.success("流程中止成功")
              this.$router.go(-1)
            } else {
              this.$message.error("流程中止失败，" + resp.message)
            }
            this.loading = false
            this.loadMessage = null
          }, reason => {
          }).catch(reason => {
            console.error(reason)
            this.loadMessage = null
            this.$message.error("流程中止失败")
          })
        }, reason => {
        }).catch(reason => {
          this.$message.error("流程中止失败")
        })
      },

      selectExecuteUser(fnName) {
        this.selectExecuteUserCallbackName = fnName
        if (this.selectExecuteUserCallbackName === 'forward') {
          this.multipleUser = true
        }
        this.$refs.SelectExecuteUser.visible = true
      },
      getUser(users) {
        const userId = users[0].userId
        this[this.selectExecuteUserCallbackName](userId)
      },
      validateSelectExecuteUser(userList) {
        if (userList == null || userList.length == 0) {
          this.$message.error('请选择用户')
          return false
        }
        if (this.selectExecuteUserCallbackName !== 'forward') {
          if (userList.length > 1) {
            this.$message.error('只能选择一个用户')
            return false
          }
        }
      },
      selectExecuteUserCancel() {
        this.selectExecuteUserCallbackName = null
        this.multipleUser = false
      },
      forward(userId, description) {
        this.loading = true
        this.$http.postJson('/api/bpm/forward/' + this.task.processInstanceId + '/' + this.user.id + '/' + userId, {
          description: description
        }).then(resp => {
          if (resp.success) {
            this.$message.success("任务转发成功")
            this.selectExecuteUserCallbackName = null
          } else {
            this.$message.error("任务转发失败")
          }
          this.loading = false
        }, reason => {
        }).catch(response => {
          this.$message.error("任务转发失败")
        })
      },
      transfer(userId, description) {
        this.loading = true
        this.$http.post('/api/bpm/core/transfer/' + this.taskId + '/' + userId, {
          description: description
        }).then(resp => {
          if (resp.success) {
            this.$message.success("任务转办成功")
            this.$router.go(-1)
          } else {
            this.$message.error("任务转办失败")
          }
          this.loading = false
        }, reason => {
        }).catch(response => {
          this.$message.error("任务转办失败")
        })
      },
      delegate(userId, description) {
        this.loading = true
        this.$http.post('/api/bpm/core/delegate/' + this.taskId + '/' + userId, {
          description: description
        }).then(resp => {
          if (resp.success) {
            this.$message.success("任务委托成功")
            this.$router.go(-1)
          } else {
            this.$message.error("任务委托失败")
          }
          this.loading = false
        }, reason => {
        }).catch(response => {
          this.$message.error("任务委托失败")
        })
      },
      // 加载操作列表
      getOptionList() {
        if (this.readonly) return
        if (this.buttons.length > 0) return

        // 无论是否自定义，都要查找默认的操作列表
        this.$http.get('/api/bpm/query/getLineButtonListByTaskId/' + this.$route.query.taskId).then(resp => {
          if (resp.success) {
            let datas = resp.data;
            if (datas == null && datas.length == 0) return

            const ops = []
            for (const item of datas) {
              ops.push({
                name: item.name,
                selectNextHandlers: item.selectNextHandlers,
                meta: item,
                before: (task, param) => {
                  param.lineKey = item.lineKey
                },
                type: 'SYSTEM'
              })
            }

            // 如果当前是多实例环节
            if (this.task.multiInstance === true) {
              this.buttons = ops
              return
            }

            // 使用用户自定义的按钮列表
            if (this.options != null) {
              if (this.options.constructor == Array) {
                // 数组类型
                if (this.options.length > 0) {
                  const s = []
                  for (const item of this.options) {
                    const sitem = {}
                    if (item.constructor == String) {
                      sitem.name = item
                    } else {
                      sitem.name = item.name
                    }
                    sitem.type = 'CUSTOM'
                    sitem.meta = null
                    s.push(sitem)
                  }
                  this.buttons = s
                }
              } else {
                // 函数类型
                const arr = this.options(this.$util.map.clone(this.task), this.param, ops)
                if (arr != null) {
                  // 不是数组，或者长度等于0
                  if (!((typeof arr == 'object') && arr.constructor == Array)) {
                    const msg = '组件PmBpm的props属性options是一个Function类型或Array类型。如果是Function类型，返回值必须是Array类型，或者返回null（如果为null，使用默认操作列表）'
                    this.$message.error("出现了一个开发期异常，请联系系统管理员。错误信息：" + msg)
                    console.error(msg)
                    return
                  }
                  if (arr.length > 0) {
                    const s = []
                    for (const item of arr) {
                      const sitem = {}
                      if (item.constructor == String) {
                        sitem.name = item
                      } else {
                        sitem.name = item.name
                      }
                      sitem.type = 'CUSTOM'
                      sitem.meta = null
                      s.push(sitem)
                    }
                    this.buttons = s
                  }
                }
              }
            }
            // 如果当前没有挂载自定义操作按钮
            if (this.buttons.length == 0) {
              this.buttons = ops
            }
          } else {
            this.$message.error("任务操作列表查询失败")
          }
        }).catch(reason => console.error(reason))
      },
      openRuntimeDiagramDialog() {
        this.$layer.iframe({
          type: 2,
          content: {
            content: RuntimeDiagram,
            parent: this,//当前的vue对象
            data: {
              processInstanceId: this.task.processInstanceId
            }
          },
          area: ['70%', '90%'],
          title: '流程图'
        })
      },
      openHistory() {
        if (this.properties.openHistoryDialog) {
          this.properties.openHistoryDialog(this.$util.map.clone(this.task))
        } else {
          this.$refs.HistoryListDialog.visible = true
          this.$refs.HistoryListDialog.task = this.task
          this.$refs.HistoryListDialog.processInstanceId = this.task.processInstanceId
        }
      },
      openForward() {
        this.$refs.ForwardListDialog.visible = true
      },
      openMigrateList() {
        if (this.properties.openTaskMigrateDialog) this.properties.openTaskMigrateDialog(this.$util.map.clone(this.task))
        else {
          this.$refs.TaskMigrateListDialog.visible = true
          this.$refs.TaskMigrateListDialog.task = this.task
        }
      },

    }
  }
</script>

<style lang="less" scoped>
  .ops-parent {
    background-color: #efefef;
    display: flex;
    justify-content: space-between;
    height: 50px;
    line-height: 40px;

    .title {
      line-height: 50px;
      padding-left: 10px;
      font-weight: bold;

      small {
        font-weight: normal;

        .el-tag {
          margin: 0 1px;

          &:first-child {
            margin-left: 5px;
          }

          &:hover {
            cursor: pointer;
          }
        }
      }
    }

    .ops {
      padding: 5px;
      text-align: right;

      * {
        margin: 0 !important;
        margin-left: 5px !important;
      }

      .el-dropdown {
        margin: 0 !important;
      }
    }
  }

  .comment-area {
    height: auto !important;
    padding: 5px;
    border-top: 1px solid #E6E6E6;
    background-color: #efefef;
  }

</style>
