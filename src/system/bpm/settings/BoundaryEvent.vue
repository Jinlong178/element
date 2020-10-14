<template>
  <div class="bpm-element" v-if="visible" :style="dialogStyle">
    <div class="top-title">
      <span class="title">{{title}}</span>
    </div>
    <el-scrollbar class="small">
      <el-form size="small" label-position="left" label-width="70px" class="form">
        <span class="info-item" style="margin-top: 0;"><span>基础信息</span></span>
        <el-form-item label="环节">
          <el-input v-model="businessObject.id" readonly/>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="businessObject.name" clearable/>
        </el-form-item>

        <span class="info-item"><span>配置</span></span>
        <!-- 定时边界事件 -->
        <template v-if="properties.eventDefinitionType === 'bpmn:TimerEventDefinition'">
          <el-form-item label="定时类型">
            <el-select v-model="properties.timerType" style="width: 100%;">
              <el-option key="date" label="定时" value="date"/>
              <el-option key="cycle" label="循环" value="cycle"/>
              <el-option key="duration" label="等待" value="duration"/>
            </el-select>
          </el-form-item>
          <el-form-item label="时间">
            <el-input v-model="properties.timer"/>
          </el-form-item>
        </template>

        <!-- 信号边界事件 -->
        <template v-if="properties.eventDefinitionType === 'bpmn:SignalEventDefinition'">
          <el-form-item label="捕获信号">
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

        <!-- 消息边界事件 -->
        <template v-if="properties.eventDefinitionType === 'bpmn:MessageEventDefinition'">
          <el-form-item label="捕获消息">
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

        <!-- 错误边界事件 -->
        <template v-if="properties.eventDefinitionType === 'bpmn:ErrorEventDefinition'">
          <el-form-item label="捕获错误">
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

        <span class="info-item"><span>其他</span></span>
        <el-form-item label="启动事件">
          <el-select size="small" style="width: 100%;" v-model="properties.startExecutionListener" filterable clearable
                     placeholder="请选择">
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
  </div>
</template>

<script>
  export default {
    name: "BoundaryEvent",
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
      triggers: null,
      updateLabelName: null,
    },
    data() {
      return {
        visible: false,
        title: '边界事件',
        businessObject: {
          id: null,
          name: null
        },
        properties: {},
        listenerList: [],

        signalNameVisible: false,

        matchElementArray: ['bpmn:BoundaryEvent'],
        eventDefinitionArray: ['bpmn:ErrorEventDefinition', 'bpmn:SignalEventDefinition', 'bpmn:MessageEventDefinition', 'bpmn:TimerEventDefinition'],
      }
    },
    created() {
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomExecutionListener').then(resp => {
        this.listenerList = resp.data
      })
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
        this.title = "边界事件"

        const eventDefinition = this.element.businessObject.eventDefinitions && this.element.businessObject.eventDefinitions[0];
        if (eventDefinition != null) {
          this.properties.eventDefinitionType = eventDefinition.$type
          switch (this.properties.eventDefinitionType) {
            case 'bpmn:ErrorEventDefinition':
              this.title = '错误边界事件'
              break
            case 'bpmn:SignalEventDefinition':
              this.title = '信号边界事件'
              break
            case 'bpmn:MessageEventDefinition':
              this.title = '消息边界事件'
              break
            case 'bpmn:TimerEventDefinition':
              this.title = '定时边界事件'
              break
            default:
              break
          }
        }
      },
      'businessObject.name'(n) {
        this.updateLabelName(this.element)
      }
    },
  }
</script>

<style scoped>

</style>
