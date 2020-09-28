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
          <el-form-item label="流程">
            <el-select style="width: 100%;" v-model="properties.callActivityDefinitionKey" filterable clearable
                       placeholder="必填">
              <el-option-group v-for="group in processList" :key="group.id" :label="group.name">
                <el-option v-for="item in group.list" :key="item.key" :label="item.name" :value="item.key">
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="多实例">
        <el-form size="small" label-position="left" label-width="70px">
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
        startExecutionListenerVisible: false,
        endExecutionListenerVisible: false,

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
