<template>
  <div v-if="visible" :style="dialogStyle">
    <el-tabs tab-position="top" type="border-card">
      <el-tab-pane label="基础">
        <el-form size="small" label-position="left" label-width="60px">
          <el-form-item label="环节">
            <el-input v-model="businessObject.id" readonly/>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="businessObject.name" placeholder="必填"/>
          </el-form-item>
          <el-form-item label="执行类">
            <el-input readonly v-model="properties.executionFn"
                      @click.native="executionFnVisible = true" placeholder="BpmCustomServiceTaskExecuteFunction">
              <el-button slot="append" @click="executionFnVisible = true" icon="el-icon-edit"></el-button>
            </el-input>
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

    <el-dialog
      title="执行类"
      :visible.sync="executionFnVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.executionFn"></el-input>
      <p>* 实现接口：BpmCustomServiceTaskExecuteFunction</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="executionFnVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "ServiceTaskElement",
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
        executionFnVisible: false,

        visible: false,
        title: '服务任务',
        businessObject: {
          id: null,
          name: null
        },
        properties: {
          executionFn: false
        },
      }
    },
    watch: {
      element(value) {
        if (value == null) {
          this.visible = false
          return
        }
        if (value.type !== 'bpmn:ServiceTask') {
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
