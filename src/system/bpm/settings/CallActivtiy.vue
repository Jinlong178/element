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
          <el-input v-model="businessObject.name" placeholder="必填" clearable/>
        </el-form-item>
        <el-form-item label="流程">
          <el-select style="width: 100%;" v-model="properties.callActivityDefinitionKey" filterable clearable
                     placeholder="必填">
            <el-option-group v-for="group in processList" :key="group.id" :label="group.name">
              <el-option v-for="item in group.list" :key="item.key" :label="item.name" :value="item.key">
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>

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
        <el-form-item label="执行顺序" v-if="properties.multiInstance == 'true'">
          <el-radio v-model="properties.sequential" label="false">并行</el-radio>
          <el-radio v-model="properties.sequential" label="true">串行</el-radio>
        </el-form-item>

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
    name: "CallActivity",
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

      // 设置多实例
      setMultiInstance: null,
      removeMultiInstance: null,
      updateLabelName: null,
    },
    data() {
      return {
        visible: false,
        title: '调用流程',
        businessObject: {
          id: null,
          name: null
        },
        properties: {
          multiInstance: 'false',
          sequential: 'false',
          subProcessDefinitionKey: null,
        },

        processList: [],
        listenerList: [],
      }
    },
    watch: {
      element(value) {
        if (value == null) {
          this.visible = false
          return
        }
        if (value.type !== 'bpmn:CallActivity') {
          this.visible = false
          return
        }

        this.visible = true
        this.properties = this.store[value.id]
        this.businessObject = value.businessObject
      },
      'properties.multiInstance'(n) {
        // 关闭多实例
        if (n === 'false' || n === false) {
          this.properties.sequential = 'false'
          if (this.removeMultiInstance) {
            this.removeMultiInstance(this.element)
          }
        }
        // 开启多实例
        else {
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
    created() {
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomExecutionListener').then(resp => {
        this.listenerList = resp.data
      })
    },
    mounted() {
      this.loadProcessList()
    },
    methods: {
      loadProcessList() {
        this.$http.get('/api/bpm/def/getProcessListByGroup').then(resp => {
          this.processList = resp.data
        })
      },
    }
  }
</script>

<style scoped>

</style>
