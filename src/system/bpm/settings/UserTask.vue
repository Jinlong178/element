<template>
  <div class="bpm-element" v-if="visible" :style="dialogStyle">
    <div class="top-title">
      <span class="title">{{title}}</span>
    </div>
    <el-scrollbar class="small">
      <el-form size="small" label-position="left" label-width="70px" class="form">
        <span class="info-item" style="margin-top: 0;"><span>基础信息</span></span>
        <el-form-item label="环节">
          <el-input v-model="businessObject.id" readonly></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="businessObject.name" placeholder="必填" clearable></el-input>
        </el-form-item>
        <el-form-item label="表单地址">
          <el-input clearable v-model="properties.formUrl"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-switch v-model="properties.taskType"
                     active-value="USER"
                     inactive-value="GROUP"
                     active-color="#13ce66"
                     inactive-color="#409EFF"
                     :active-text="properties.taskType == 'USER' ? '个人任务' : '组任务'">
          </el-switch>
        </el-form-item>

        <span class="info-item"><span>候选人</span></span>
        <el-form-item label="方式">
          <el-select v-model="properties.useAssService" style="width: 100%;">
            <el-option key="false" label="定义" value="false"/>
            <el-option key="true" label="函数调用" value="true"/>
          </el-select>
        </el-form-item>
        <el-form-item label="调用" v-show="properties.useAssService == 'true'">
          <el-select size="small" style="width: 100%;" v-model="properties.assigneeFn" filterable clearable
                     placeholder="请选择">
            <el-option v-for="item in assigneeListenerList" :key="item.beanName" :label="item.name"
                       :value="item.beanName"/>
          </el-select>
        </el-form-item>
        <div v-show="properties.useAssService == 'false'">
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
        </div>

        <div v-show="properties.taskType === 'USER'">
          <span class="info-item"><span>多实例</span></span>
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
          <el-form-item label="方式" v-show="showMultiItem">
            <el-select v-model="properties.useMultiService" style="width: 100%;">
              <el-option key="false" label="定义" value="false"/>
              <el-option key="true" label="函数调用" value="true"/>
            </el-select>
          </el-form-item>

          <el-form-item label="调用" v-show="showMultiItem && properties.useMultiService == 'true'">
            <el-select size="small" style="width: 100%;" v-model="properties.multiInstanceFn" filterable clearable
                       placeholder="请选择">
              <el-option v-for="item in decisionListenerList" :key="item.beanName" :label="item.name"
                         :value="item.beanName"/>
            </el-select>
          </el-form-item>

          <div v-show="showMultiItem && properties.useMultiService == 'false'">
            <el-form-item label="策略">
              <el-radio-group v-model="properties.multiStrategy">
                <el-radio v-for="item in multiInstanceStrategyList" :label="item.key">{{item.name}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="决策方式">
              <el-radio v-model="properties.decisionType" label="1">通过</el-radio>
              <el-radio v-model="properties.decisionType" label="0">拒绝</el-radio>
            </el-form-item>
            <el-form-item label="投票类型">
              <el-radio v-model="properties.votingType" label="1">百分比</el-radio>
              <el-radio v-model="properties.votingType" label="0">绝对票数</el-radio>
            </el-form-item>
            <el-form-item label="票数或比率">
              <el-input v-model="properties.votes"></el-input>
            </el-form-item>
          </div>
        </div>

        <span class="info-item"><span>其他</span></span>
        <el-form-item label="任务事件">
          <el-select size="small" style="width: 100%;" v-model="properties.taskListener" filterable clearable
                     placeholder="请选择">
            <el-option v-for="item in taskListenerList" :key="item.beanName" :label="item.name"
                       :value="item.beanName"/>
          </el-select>
        </el-form-item>
        <el-form-item label="启动事件">
          <el-select size="small" style="width: 100%;" v-model="properties.startExecutionListener" filterable
                     clearable placeholder="请选择">
            <el-option v-for="item in listenerList" :key="item.beanName" :label="item.name" :value="item.beanName"/>
          </el-select>
        </el-form-item>
        <el-form-item label="结束事件">
          <el-select size="small" style="width: 100%;" v-model="properties.endExecutionListener" filterable clearable
                     placeholder="请选择">
            <el-option v-for="item in listenerList" :key="item.beanName" :label="item.name" :value="item.beanName"/>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 7}" v-model="properties.documentation"
                    maxlength="100" show-word-limit></el-input>
        </el-form-item>
      </el-form>
    </el-scrollbar>
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
          useAssService: 'true',
          useMultiService: 'true',
          multiInstanceFn: null,
        },

        showAssignees: null,
        showMulti: true,
        showMultiItem: false,

        listenerList: [],
        taskListenerList: [],
        assigneeListenerList: [],
        decisionListenerList: [],
      }
    },
    created() {
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomExecutionListener').then(resp => {
        this.listenerList = resp.data
      })
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomUserTaskListener').then(resp => {
        this.taskListenerList = resp.data
      })
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomUserTaskAssigneeExecuteFunction').then(resp => {
        this.assigneeListenerList = resp.data
      })
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomUserTaskMultiInstanceDecisionFunction').then(resp => {
        this.decisionListenerList = resp.data
      })
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

<style lang="less">
  .bpm-element {
    .top-title {
      width: 100%;
      height: 39px;
      background-color: #F5F7FA;
      border-bottom: 1px solid #E4E7ED;
      font-size: 14px;
      line-height: 39px;
      display: flex;
      justify-content: space-between;

      .title {
        display: inline-block;
        background: #FBFBFB;
        padding: 0 20px;
        height: 39px;
        color: #409EFF;
        border-right: 1px solid #E4E7ED;
        z-index: 200;
        border-bottom: 1px solid transparent !important;
      }
    }

    .form {
      * {
        font-size: 12px;
      }
      padding: 5px 12px 5px 5px;

      .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
        margin-bottom: 2px !important;
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

      .info-item {
        display: block;
        margin-top: 10px;
        margin-bottom: 10px;
        color: #eb870c;

        span {
          border-bottom: 1px solid #eb870c;
        }
      }

    }
  }
</style>
