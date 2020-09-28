<template>
  <div v-if="visible" :style="dialogStyle">
    <el-tabs tab-position="top" type="border-card">
      <el-tab-pane label="基础">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="连线">
            <el-input v-model="businessObject.id" readonly/>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="businessObject.name"/>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="配置">
        <el-form size="small" label-position="left" label-width="60px">
          <el-form-item label="默认">
            <el-switch
              v-model="properties.defaultFlow"
              active-color="#13ce66"
              inactive-color="#747474"
              active-value="true"
              inactive-value="false">
            </el-switch>
          </el-form-item>
          <el-form-item label="执行类" v-if="properties.defaultFlow == 'false'">
            <el-input readonly v-model="properties.expressionFn"
                      @click.native="expressionFnVisible = true" placeholder="BpmCustomSequenceFlowExpressionFunction">
              <el-button slot="append" @click="expressionFnVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="表达式" v-if="properties.defaultFlow == 'false'">
            <el-input readonly v-model="properties.expression"
                      @click.native="expressionVisible = true">
              <el-button slot="append" @click="expressionVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="监听">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="start">
            <el-input readonly v-model="properties.startExecutionListener"
                      @click.native="startExecutionListenerVisible = true" placeholder="BpmCustomFlowExecutionListener">
              <el-button slot="append" @click="startExecutionListenerVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="end">
            <el-input readonly v-model="properties.endExecutionListener"
                      @click.native="endExecutionListenerVisible = true" placeholder="BpmCustomFlowExecutionListener">
              <el-button slot="append" @click="endExecutionListenerVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="take">
            <el-input readonly v-model="properties.takeExecutionListener"
                      @click.native="takeExecutionListenerVisible = true" placeholder="BpmCustomFlowExecutionListener">
              <el-button slot="append" @click="takeExecutionListenerVisible = true" icon="el-icon-edit"></el-button>
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
      <p>* 实现接口：BpmCustomFlowExecutionListener</p>
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
      <p>* 实现接口：BpmCustomFlowExecutionListener</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="endExecutionListenerVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="执行监听类（take）"
      :visible.sync="takeExecutionListenerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.takeExecutionListener"></el-input>
      <p>* 实现接口：BpmCustomFlowExecutionListener</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="takeExecutionListenerVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="执行类"
      :visible.sync="expressionFnVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.expressionFn"></el-input>
      <p>* 实现接口：BpmCustomSequenceFlowExpressionFunction</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="expressionFnVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="表达式"
      :visible.sync="expressionVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input type="textarea"
                :autosize="{ minRows: 10, maxRows: 10}"
                placeholder="请输入表达式"
                v-model="properties.expression"></el-input>
      <span slot="footer" class="dialog-footer" style="display: flex; justify-content: space-between;">
        <el-popover
          placement="top-start"
          title="参数"
          width="400"
          trigger="hover">
          <p>multiInstanceDecision：多实例决策结果参数</p>
          <ul>
            <li>0：未通过</li>
            <li>1：已通过</li>
          </ul>
          <el-button slot="reference" type="text" icon="el-icon-info"></el-button>
        </el-popover>
        <el-button type="primary" size="small" @click="expressionVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "SequenceFlow",
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

      setDefaultFlow: null,
      removeDefaultFlow: null,
      setConditionalFlow: null,
      removeConditionalFlow: null,
      updateLabelName: null,
    },
    data() {
      return {
        startExecutionListenerVisible: false,
        endExecutionListenerVisible: false,
        takeExecutionListenerVisible: false,
        expressionFnVisible: false,
        expressionVisible: false,

        visible: false,
        title: '连线属性',
        businessObject: {
          id: null,
          name: null
        },
        properties: {
          expression: null,
          defaultFlow: 'false',
          expressionFn: null,
        },
      }
    },
    watch: {
      element(value) {
        if (value == null) {
          this.visible = false
          return
        }
        if (value.type !== 'bpmn:SequenceFlow') {
          this.visible = false
          return
        }
        this.visible = true
        this.properties = this.store[value.id]
        this.businessObject = value.businessObject
      },
      'properties.defaultFlow'(value) {
        if (value == 'true') {
          this.properties.expression = null
          this.properties.expressionFn = null

          if (this.setDefaultFlow) {
            this.setDefaultFlow(this.element)
          }
        } else {
          if (this.removeDefaultFlow) {
            this.removeDefaultFlow(this.element)
          }
        }
      },
      'properties.expression'(value) {
        if (value != null && value.trim() !== '') {
          if (this.setConditionalFlow) {
            this.setConditionalFlow(this.element)
          }
        } else {
          if (this.removeConditionalFlow) {
            this.removeConditionalFlow(this.element)
          }
        }
      },
      'properties.expressionFn'(value) {
        if (value != null && value.trim() !== '') {
          if (this.setConditionalFlow) {
            this.setConditionalFlow(this.element)
          }
        } else {
          if (this.removeConditionalFlow) {
            this.removeConditionalFlow(this.element)
          }
        }
      },
      'businessObject.name'(n) {
        this.updateLabelName(this.element)
      }
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

  .el-icon-info:hover {
    cursor: pointer;
  }
</style>
