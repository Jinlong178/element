<template>
  <div v-if="visible" :style="dialogStyle">
    <el-tabs tab-position="top" type="border-card">
      <el-tab-pane label="基础">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="环节">
            <el-input v-model="businessObject.id" readonly/>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="businessObject.name"/>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="文档">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="文档">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 7}" v-model="properties.documentation"
                      maxlength="100" show-word-limit></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  export default {
    name: "ParticipantElement",
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
      updateLabelName: null,
    },
    data() {
      return {
        visible: false,
        title: '属性',
        businessObject: {
          id: null,
          name: null
        },
        properties: {},

        matchElementArray: ['bpmn:Participant'],
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
