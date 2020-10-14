<template>
  <div class="bpm-element" v-if="visible" :style="dialogStyle">
    <div class="top-title">
      <span class="title">{{title}}</span>
    </div>
    <el-scrollbar class="small">
      <el-form size="small" label-position="left" label-width="70px" class="form">
        <span class="info-item" style="margin-top: 0;"><span>基础信息</span></span>
        <el-form-item label="流程">
          <el-input v-model="businessObject.id" readonly/>
        </el-form-item>
        <el-form-item label="所属组">
          <el-select v-model="properties.groupId" clearable placeholder="请选择" style="width: 100%;">
            <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="businessObject.name" placeholder="必填" clearable/>
        </el-form-item>
        <el-form-item label="默认表单">
          <el-input v-model="properties.formUrl" clearable/>
        </el-form-item>

        <span class="info-item"><span>其他</span></span>
        <el-form-item label="执行事件">
          <el-select size="small" style="width: 100%;" v-model="properties.processListener" filterable clearable
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
    name: "ProcessElement",
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
        title: '流程',
        businessObject: {
          id: null,
          name: null
        },
        properties: {
          default: {
            processListener: null,
            groupId: null,
          }
        },

        groupList: [],
        listenerList: [],

        isModdleElement: false,
      }
    },
    created() {
      // 获取流程组
      this.$http.get('/api/bpm/group/getList').then(resp => {
        this.groupList = resp.data
      })
      this.$http.get('/api/bpm/def/getListenerList/BpmCustomProcessListener').then(resp => {
        this.listenerList = resp.data
      })
    },
    watch: {
      element(value) {
        if (value == null) {
          this.visible = false
          return
        }

        if (value.$type != null) this.isModdleElement = true

        if ((this.isModdleElement ? value.$type : value.type) !== 'bpmn:Process') {
          this.visible = false
          return
        }

        this.visible = true
        this.properties = this.store[value.id]
        this.businessObject = (this.isModdleElement ? value : value.businessObject)
      },
    },
  }
</script>

<style scoped>
</style>
