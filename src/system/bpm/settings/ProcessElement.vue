<template>
  <div v-if="visible" :style="dialogStyle">
    <el-tabs tab-position="top" type="border-card">
      <el-tab-pane label="基础">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="流程">
            <el-input v-model="businessObject.id" readonly/>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="businessObject.name" placeholder="必填"/>
          </el-form-item>
          <el-form-item label="组">
            <el-select v-model="properties.groupId" clearable placeholder="" style="width: 100%;">
              <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="监听">
        <el-form size="small" label-position="left" label-width="50px">
          <el-form-item label="监听">
            <el-input readonly v-model="properties.processListener" @click.native="processListenerVisible = true"
                      placeholder="BpmCustomProcessListener（流程启动、流程结束）">
              <el-button slot="append" @click="processListenerVisible = true" icon="el-icon-edit"></el-button>
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
      title="流程监听"
      :visible.sync="processListenerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%">
      <el-input clearable v-model="properties.processListener"></el-input>
      <p>* 实现接口：BpmCustomProcessListener（流程启动、流程结束）</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="processListenerVisible = false">关闭</el-button>
      </span>
    </el-dialog>
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
        processListenerVisible: false,

        visible: false,
        title: '流程属性',
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

        isModdleElement: false,
      }
    },
    created() {
      // 获取流程组
      this.$http.get('/api/bpm/group/getList').then(resp => {
        this.groupList = resp.data
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
