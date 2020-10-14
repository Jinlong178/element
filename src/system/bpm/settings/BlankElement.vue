<template>
  <div class="bpm-element" v-if="visible" :style="dialogStyle">
    <div class="top-title">
      <span class="title">{{ title }}</span>
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
    name: "BlankElement",
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
        visible: false,
        title: '',
        businessObject: {
          id: null,
          name: null
        },
        properties: {},
        listenerList: [],

        matchElementArray: ['bpmn:ManualTask', 'bpmn:ReceiveTask']
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

        if (value.type === 'bpmn:ManualTask') {
          this.title = '手工任务'
        } else if (value.type === 'bpmn:ReceiveTask') {
          this.title = '接收任务'
        }

        this.visible = true
        this.properties = this.store[value.id]
        this.businessObject = value.businessObject
      },
      'businessObject.name'(n) {
        this.updateLabelName(this.element)
      }
    }
  }
</script>

<style scoped>

</style>
