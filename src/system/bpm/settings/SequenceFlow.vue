<template>
  <div class="bpm-element" v-if="visible" :style="dialogStyle">
    <div class="top-title">
      <span class="title">{{title}}</span>
    </div>
    <el-scrollbar class="small">
      <el-form size="small" label-position="left" label-width="70px" class="form">
        <span class="info-item" style="margin-top: 0;"><span>基础信息</span></span>
        <el-form-item label="连线">
          <el-input v-model="businessObject.id" readonly/>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="businessObject.name" clearable/>
        </el-form-item>

        <span class="info-item"><span>配置</span></span>
        <el-form-item label="默认路线">
          <el-switch
            v-model="properties.defaultFlow"
            active-color="#13ce66"
            inactive-color="#747474"
            active-value="true"
            inactive-value="false">
          </el-switch>
        </el-form-item>
        <div v-if="properties.defaultFlow == 'false'">
          <el-form-item label="方式">
            <el-select v-model="properties.useExprService" style="width: 100%;">
              <el-option key="false" label="定义" value="false"/>
              <el-option key="true" label="函数调用" value="true"/>
            </el-select>
          </el-form-item>
          <el-form-item label="调用" v-if="properties.useExprService == 'true'">
            <el-select size="small" style="width: 100%;" v-model="properties.expressionFn" filterable clearable
                       placeholder="请选择">
              <el-option v-for="item in expressListenerList" :key="item.beanName" :label="item.name"
                         :value="item.beanName"/>
            </el-select>
          </el-form-item>
          <el-form-item label="表达式" v-if="properties.useExprService == 'false'">
            <el-input type="textarea"
                      :autosize="{ minRows: 5, maxRows: 5}"
                      placeholder="请输入表达式"
                      v-model="properties.expression"></el-input>
          </el-form-item>
        </div>

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
        <el-form-item label="take" style="display: none;">
          <el-input clearable v-model="properties.takeExecutionListener"></el-input>
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
        visible: false,
        title: '路线',
        businessObject: {
          id: null,
          name: null
        },
        properties: {
          expression: null,
          defaultFlow: 'false',
          expressionFn: null,
          useExprService: 'true',
        },
        listenerList: [],
        expressListenerList: [],
      }
    },
    created() {
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomFlowExecutionListener').then(resp => {
        this.listenerList = resp.data
      })
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomSequenceFlowExpressionFunction').then(resp => {
        this.expressListenerList = resp.data
      })
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
          this.properties.useExprService = 'true'

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

</style>
