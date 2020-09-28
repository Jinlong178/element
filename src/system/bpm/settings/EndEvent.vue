<template>
  <div v-if="visible" :style="dialogStyle">
    <el-tabs tab-position="top" type="border-card">
      <el-tab-pane label="基础">
        <el-form size="small" label-position="left" label-width="70px">
          <el-form-item label="环节">
            <el-input v-model="businessObject.id" readonly/>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="businessObject.name"/>
          </el-form-item>

          <!-- 信号开始事件 -->
          <template v-if="properties.eventDefinitionType === 'bpmn:SignalEventDefinition'">
            <el-form-item label="抛出信号">
              <el-select style="width: 100%" v-model="properties.signalName" clearable placeholder="必填">
                <el-option
                  v-for="item in triggers.signal"
                  :key="item.key"
                  :label="item.name"
                  :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>
          </template>

          <!-- 消息开始事件 -->
          <template v-if="properties.eventDefinitionType === 'bpmn:MessageEventDefinition'">
            <el-form-item label="抛出消息">
              <el-select style="width: 100%" v-model="properties.messageName" clearable placeholder="必填">
                <el-option
                  v-for="item in triggers.message"
                  :key="item.key"
                  :label="item.name"
                  :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>
          </template>

          <!-- 错误事件 -->
          <template v-if="properties.eventDefinitionType === 'bpmn:ErrorEventDefinition'">
            <el-form-item label="抛出错误">
              <el-select style="width: 100%" v-model="properties.errorCode" clearable placeholder="必填">
                <el-option
                  v-for="item in triggers.error"
                  :key="item.key"
                  :label="item.errorCode"
                  :value="item.errorCode">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="监听">
        <el-form size="small" label-position="left" label-width="50px">
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
  </div>
</template>

<script>
  export default {
    name: "EndEvent",
    props: {
      dialogStyle: {
        default: () => {
        }
      },

      bpmnModeler: {
        default: null
      },
      element: {
        default: null
      },
      store: {
        default: null
      },
      triggers: null,
      updateLabelName: null,
    },
    data() {
      return {
        startExecutionListenerVisible: false,
        endExecutionListenerVisible: false,

        visible: false,
        title: '结束事件属性',
        businessObject: {
          id: null,
          name: null
        },
        properties: {},

        matchElementArray: ['bpmn:EndEvent'],
        eventDefinitionArray: ['bpmn:ErrorEventDefinition'],
      }
    },
    watch: {
      element(value) {
        if (value == null) {
          this.visible = false
          return
        }
        if (this.matchElementArray.indexOf(value.type) < 0) {
          this.visible = false
          return
        }

        this.visible = true
        this.properties = this.store[value.id]
        this.businessObject = value.businessObject

        this.properties.eventDefinitionType = null
        const eventDefinition = this.element.businessObject.eventDefinitions && this.element.businessObject.eventDefinitions[0];
        if (eventDefinition != null) {
          this.properties.eventDefinitionType = eventDefinition.$type
        }
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
