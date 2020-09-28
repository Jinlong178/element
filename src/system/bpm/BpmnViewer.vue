<template>
  <section class="section-height" style="position: relative;" v-loading="loading">
    <div ref="Canvas" id="canvas" :style="heightStyle"></div>
    <el-tooltip class="item" effect="dark" content="返回上一页" placement="bottom">
      <el-button size="medium"
                 @click="$router.go(-1)"
                 style="position: absolute; top: 2px; right: 2px; z-index: 1000;" icon="el-icon-back"></el-button>
    </el-tooltip>
  </section>
</template>

<script>
  import {mapState} from 'vuex'
  import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer'

  export default {
    name: 'BpmnViewer',
    data() {
      return {
        loading: false,

        bpmnModeler: null,
        bpmnXML: null,

        modelId: null,
        version: null,

        process: null,
        nodes: null,
        lines: null,
      }
    },
    computed: {
      ...mapState({
        mainHeight: state => state.mainHeight,
      }),
      heightStyle() {
        return {
          height: this.mainHeight
        }
      },
    },
    mounted() {
      this.loading = true
      this.modelId = this.$route.query.modelId
      this.version = this.$route.query.version

      // 获取模型数据
      this.$http.get('/api/bpm/def/getModelFullData', {
        modelId: this.modelId,
        version: this.version
      }).then(resp => {
        this.bpmnModeler = new NavigatedViewer({
          container: '#canvas',
        })
        this.process = resp.data.process
        this.nodes = resp.data.nodes
        this.lines = resp.data.lines
        this.bpmnXML = this.process.bpmnXml

        this.importDiagram()
        this.loading = false
      }).catch(reason => {
        console.error(reason)
        this.$message.error('流程初始化数据失败')
      })
    },
    methods: {
      //导入绘制
      importDiagram() {
        this.bpmnModeler.importXML(this.bpmnXML, err => {
          if (err) {
            return console.error('could not import BPMN 2.0 diagram', err)
          }

          // 绘图区域
          const canvas = this.bpmnModeler.get('canvas')
          canvas.zoom('fit-viewport')
        })
      },
    }
  }
</script>

<style scoped>
  .section-height {
    height: 100%;
  }

  @import '../../../node_modules/bpmn-js/dist/assets/diagram-js.css';
  @import '../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
  @import '../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
  @import '../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

  /deep/ .bjs-powered-by {
    display: none;
  }

  .canvas {
    background: #fff;
    overflow: hidden;
    height: 100%;
  }

  .wrap {
    height: 700px;
  }

  /deep/ .bpp-properties-panel {
    overflow: auto;
    height: 701px;
    border: 1px solid #dedede;
    background-color: #f8f8f8;
    position: relative;
  }
</style>
