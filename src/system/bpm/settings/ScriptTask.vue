<template>
  <div v-if="visible" :style="dialogStyle">
    <el-tabs tab-position="top" type="border-card">
      <el-tab-pane label="基础">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="环节">
            <el-input v-model="businessObject.id" readonly/>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="businessObject.name" placeholder="必填"/>
          </el-form-item>
          <el-form-item label="脚本">
            <el-input readonly v-model="properties.scriptCode" placeholder="支持Groovy"
                      @click.native="scriptCodeVisible = true">
              <el-button slot="append" @click="scriptCodeVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="监听">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="start">
            <el-input readonly v-model="properties.startExecutionListener"
                      @click.native="startExecutionListenerVisible = true"
                      placeholder="BpmCustomExecutionListener">
              <el-button slot="append" @click="startExecutionListenerVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="end">
            <el-input readonly v-model="properties.endExecutionListener"
                      @click.native="endExecutionListenerVisible = true" placeholder="BpmCustomExecutionListener">
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
      title="脚本代码"
      :visible.sync="scriptCodeVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input type="textarea"
                :autosize="{ minRows: 15, maxRows: 15}"
                v-model="properties.scriptCode"
                placeholder="请输入groovy代码"
                show-word-limit></el-input>
      <span slot="footer" class="dialog-footer" style="display: flex; justify-content: space-between;">
        <el-popover
          placement="top-start"
          title="参数"
          width="400"
          trigger="hover">
          <p>1. execution：当前脚本任务环节的执行对象</p>
          <p>2. context：流程运行上下文对象</p>
          <ul>
            <li>data：上下文数据
              <ul>
                <li>processInstanceId：流程实例ID</li>
                <li>processDefinitionId：流程定义ID</li>
                <li>starter：流程发起人</li>
              </ul>
            </li>
            <li>expressionMap：表达式数据，参与计算后续路线</li>
            <li>persistentMap：持久化数据，参与计算后续路线</li>
            <li>nextHandlers：下一环节办理人列表，如果存在该值，使用该值作为下一环节的办理人</li>
            <li>decision：多实例决策结果，参与计算后续路线</li>
          </ul>
          <el-button slot="reference" type="text" icon="el-icon-info"></el-button>
        </el-popover>
        <el-button type="primary" size="small" @click="scriptCodeVisible = false">关闭</el-button>
      </span>
    </el-dialog>

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
  </div>
</template>

<script>
  export default {
    name: "ScriptTaskElement",
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
      updateLabelName: null,
    },
    data() {
      return {
        startExecutionListenerVisible: false,
        endExecutionListenerVisible: false,
        scriptCodeVisible: false,

        visible: false,
        title: '脚本任务',
        businessObject: {
          id: null,
          name: null
        },
        properties: {
          taskListener: null
        },

      }
    },
    watch: {
      element(value) {
        if (value == null) {
          this.visible = false
          return
        }
        if (value.type !== 'bpmn:ScriptTask') {
          this.visible = false
          return
        }

        this.visible = true
        this.properties = this.store[value.id]
        this.businessObject = value.businessObject
      },
      'businessObject.name'(n) {
        this.updateLabelName(this.element)
      }
    },
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

  .el-icon-info:hover {
    cursor: pointer;
  }
</style>
