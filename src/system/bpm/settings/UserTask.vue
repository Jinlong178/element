<template>
  <div class="user-task-class" v-if="visible" :style="dialogStyle">
    <el-tabs tab-position="top" type="border-card">
      <el-tab-pane label="基础">
        <el-form size="small" label-position="left" label-width="70px">
          <el-form-item label="环节">
            <el-input v-model="businessObject.id" readonly></el-input>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="businessObject.name" placeholder="必填"></el-input>
          </el-form-item>
          <el-form-item label="任务类型">
            <el-radio v-model="properties.taskType" label="USER">个人任务</el-radio>
            <el-radio v-model="properties.taskType" label="GROUP">组任务</el-radio>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="候选人">
        <el-form size="small" label-position="left" label-width="70px">
          <el-form-item label="执行类">
            <el-input v-model="properties.assigneeFn" @click.native="assigneeFnVisible = true" placeholder="BpmCustomUserTaskAssigneeExecuteFunction">
              <el-button slot="append" @click="assigneeFnVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="策略">
            <el-checkbox-group v-model="properties.assignees">
              <el-checkbox style="display: block;" v-for="item in assigneeStrategyList" :label="item.key">
                {{item.name}}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="规则" v-show="showAssignees">
            <div class="assignees-rule-area">
              <el-button v-for="item in properties.assigneeRule"
                         :icon="(item.url == null || item.url.trim().length == 0 || item.value != null) ? 'el-icon-check' : ''"
                         @click="openAssigneeRule(item)">
                {{ item.name }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="多实例" :disabled="properties.taskType === 'GROUP'">
        <el-form size="small" label-position="left" label-width="90px">
          <el-form-item label="启用">
            <el-switch
              v-model="properties.multiInstance"
              active-color="#13ce66"
              inactive-color="#747474"
              active-value="true"
              inactive-value="false">
            </el-switch>
          </el-form-item>
          <el-form-item label="执行顺序" v-show="showMultiItem">
            <el-radio v-model="properties.sequential" label="false">并行</el-radio>
            <el-radio v-model="properties.sequential" label="true">串行</el-radio>
          </el-form-item>

          <el-form-item label="决策类" v-show="showMultiItem">
            <el-input v-model="properties.multiInstanceFn" @click.native="multiInstanceFnVisible = true" placeholder="BpmCustomUserTaskMultiInstanceDecisionFunction">
              <el-button slot="append" @click="multiInstanceFnVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="策略" v-show="showMultiItem">
            <el-radio-group v-model="properties.multiStrategy">
              <el-radio v-for="item in multiInstanceStrategyList" :label="item.key">{{item.name}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="决策方式" v-show="showMultiItem">
            <el-radio v-model="properties.decisionType" label="1">通过</el-radio>
            <el-radio v-model="properties.decisionType" label="0">拒绝</el-radio>
          </el-form-item>
          <el-form-item label="投票类型" v-show="showMultiItem">
            <el-radio v-model="properties.votingType" label="1">百分比</el-radio>
            <el-radio v-model="properties.votingType" label="0">绝对票数</el-radio>
          </el-form-item>
          <el-form-item label="票数或比率" v-show="showMultiItem">
            <el-input v-model="properties.votes"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="表单">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="表单">
            <el-input clearable v-model="properties.formUrl" placeholder="路由名称"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="监听">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="task">
            <el-input v-model="properties.taskListener" @click.native="taskListenerVisible = true"  placeholder="BpmCustomUserTaskListener">
              <el-button slot="append" @click="taskListenerVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="start">
            <el-input readonly v-model="properties.startExecutionListener" @click.native="startExecutionListenerVisible = true" placeholder="BpmCustomExecutionListener">
              <el-button slot="append" @click="startExecutionListenerVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="end">
            <el-input readonly v-model="properties.endExecutionListener" @click.native="endExecutionListenerVisible = true" placeholder="BpmCustomExecutionListener">
              <el-button slot="append" @click="endExecutionListenerVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="文档">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 7}" v-model="properties.documentation"
                      maxlength="100" show-word-limit></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      title="执行监听类（start）"
      :visible.sync="startExecutionListenerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.startExecutionListener"></el-input>
      <p>* 实现接口：BpmCustomExecutionListener</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="startExecutionListenerVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="执行监听类（end）"
      :visible.sync="endExecutionListenerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.endExecutionListener"></el-input>
      <p>* 实现接口：BpmCustomExecutionListener</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="endExecutionListenerVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="任务监听类"
      :visible.sync="taskListenerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.taskListener"></el-input>
      <p>* 实现接口：BpmCustomUserTaskListener</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="taskListenerVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="执行类"
      :visible.sync="assigneeFnVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.assigneeFn"></el-input>
      <p>* 实现接口：BpmCustomUserTaskAssigneeExecuteFunction</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="assigneeFnVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="决策类"
      :visible.sync="multiInstanceFnVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.multiInstanceFn"></el-input>
      <p>* 实现接口：BpmCustomUserTaskMultiInstanceDecisionFunction</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="multiInstanceFnVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 选择用户策略 -->
    <select-user ref="SelectUser"></select-user>
    <!-- 选择角色策略 -->
    <select-role ref="SelectRole"></select-role>
  </div>
</template>

<script>
  import SelectUser from "../candidates/SelectUser";
  import SelectRole from "../candidates/SelectRole";

  export default {
    name: "UserTask",
    components: {SelectRole, SelectUser},
    props: {
      dialogStyle: {
        default: () => {
        }
      },

      element: {
        default: null
      },
      store: {
        default: null
      },

      assigneeStrategyList: {
        default: []
      },
      multiInstanceStrategyList: {
        default: []
      },

      // 设置多实例
      setMultiInstance: null,
      removeMultiInstance: null,
      updateLabelName: null,
    },
    data() {
      return {
        startExecutionListenerVisible: false,
        endExecutionListenerVisible: false,
        taskListenerVisible: false,
        assigneeFnVisible: false,
        multiInstanceFnVisible: false,

        visible: false,
        title: '用户任务',
        businessObject: {
          id: null,
          name: null
        },
        properties: {
          taskType: null,
          taskListener: null,
          assignees: null,
          assigneeRule: null,

          multiInstance: null,
          sequential: null,
          multiStrategy: null,
          decisionType: null,
          votingType: null,
          votes: null,

          formUrl: null,
          assigneeFn: null,
          multiInstanceFn: null,
        },

        showAssignees: null,
        showMulti: true,
        showMultiItem: false,
      }
    },
    watch: {
      element(value) {
        if (value == null) {
          this.visible = false
          return
        }
        if (value.type !== 'bpmn:UserTask') {
          this.visible = false
          return
        }

        this.visible = true
        this.properties = this.store[value.id]
        this.businessObject = value.businessObject
      },
      'properties.taskType'(n) {
        if (n === 'GROUP') {
          this.showMulti = false
          this.properties.multiInstance = 'false'
          this.properties.multiStrategy = null
          this.properties.sequential = 'false'
          this.properties.decisionType = '1'
          this.properties.votingType = '1'
          this.properties.votes = '100'
        } else {
          this.showMulti = true
        }
      },
      'properties.assignees'(n) {
        if (n == null) return
        if (n.length === 0) {
          this.showAssignees = false
        } else {
          this.showAssignees = true
          // 设置规则项
          let ruleArray = []
          for (let i in n) {
            let assignee = this.getAssignee(n[i])
            let rule = this.getExistedRule(assignee)
            if (rule != null) {
              ruleArray.push(rule)
            } else {
              ruleArray.push(this.getBlankRule(assignee))
            }
          }
          this.properties.assigneeRule = ruleArray
        }
      },
      'properties.multiInstance'(n) {
        // 关闭多实例
        if (n === 'false' || n === false) {
          this.showMultiItem = false
          this.properties.multiStrategy = this.multiInstanceStrategyList[0].key
          this.properties.sequential = 'false'
          this.properties.decisionType = '1'
          this.properties.votingType = '1'
          this.properties.votes = '100'

          if (this.removeMultiInstance) {
            this.removeMultiInstance(this.element)
          }
        }
        // 开启多实例
        else {
          this.showMultiItem = true
          if (this.setMultiInstance) {
            this.setMultiInstance(this.element, this.properties.sequential == 'true' ? true : false)
          }
        }
      },
      'properties.sequential'(n) {
        if (this.properties.multiInstance == 'true' && this.setMultiInstance) {
          this.setMultiInstance(this.element, n === 'true' ? true : false)
        }
      },
      'businessObject.name'(n) {
        this.updateLabelName(this.element)
      }
    },
    methods: {
      getAssignee(key) {
        for (let i in this.assigneeStrategyList) {
          let item = this.assigneeStrategyList[i]
          if (item.key === key) {
            return item
          }
        }
        return null
      },
      getBlankRule(item) {
        return {
          key: item.key,
          name: item.name,
          url: item.url,
          value: null,
        }
      },
      getExistedRule(item) {
        if (item === null) return null
        if (this.properties.assigneeRule.length === 0) return null
        for (let i in this.properties.assigneeRule) {
          let rule = this.properties.assigneeRule[i]
          if (rule.key === item.key) {
            return rule
          }
        }
        return null
      },
      openAssigneeRule(rule) {
        if (rule.url != null && rule.url.trim().length > 0) {
          this.$refs[rule.url].visible = true
          this.$refs[rule.url].rule = rule
        }
      },
    }
  }
</script>

<style scoped>
  .title {
    margin: 0;
    height: 28px;
    line-height: 28px;
    background-color: #FAFAFA;
    text-align: right;

    padding: 0 40px 0 10px;
  }

  .el-checkbox-group [role='checkbox'] {
    display: block;
    margin-right: 0;
  }

  .el-radio-group [role='radio'] {
    display: block;
    margin-right: 0;
    height: 32px;
    line-height: 32px;
  }

  .assignees-rule-area button {
    margin-left: 0;
    margin-bottom: 2px;
    display: block;
  }

  .el-icon-info:hover {
    cursor: pointer;
  }

  .user-task-class {
    width: 410px !important;
  }
</style>
