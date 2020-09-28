<template>
  <section class="section-height" :style="{position: 'relative', width: '100%', height: 'auto'}" v-loading="loading">
    <div id="canvas" :style="heightStyle"></div>
  </section>
</template>

<script>
  import $ from 'jquery'
  import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer'

  export default {
    name: 'RuntimeDiagram',
    props: {
      processInstanceId: {
        type: String,
        default: null
      },
    },
    data() {
      return {
        loading: false,
        bpmnModeler: null,
        overlays: null,
        process: null,
        elements: null,
      }
    },
    computed: {
      heightStyle() {
        let h = '100px'
        const wh = window.innerHeight
        h = wh * 0.85 - 42
        return {
          height: h + 'px'
        }
      },
    },
    watch: {
      processInstanceId: {
        handler(value) {
          $('.vl-notify-content').css('height', this.heightStyle.height)
          this.loading = true

          // 获取模型数据
          this.$http.get('/api/bpm/query/getByProcessInstanceId/' + value).then(resp => {
            this.bpmnModeler = new NavigatedViewer({
              container: '#canvas',
              bpmnRenderer: {
                defaultFillColor: 'white',
                defaultStrokeColor: '#9e9e9e'
              },
            })

            this.overlays = this.bpmnModeler.get('overlays')

            this.process = resp.data

            // 获取需要标记的元素
            this.$http.get('/api/bpm/query/getHistoricalActivityList/' + value).then(resp => {
              this.elements = resp.data
            })

            // 导入流程图
            this.importDiagram()

            this.loading = false
          }).catch(reason => {
            console.error(reason)
            this.$message.error('流程初始化数据失败')
          })
        },
        immediate: true
      },
      elements(elements) {
        if (elements == null || elements.length === 0) return

        const canvas = this.bpmnModeler.get('canvas');
        const eleMap = new Map();
        for (let i = 0; i < elements.length; i++) {
          let ele = elements[i]
          switch (ele.elementType) {
            case 'UserTask':
            case 'CallActivity':
            case 'SubProcess':
            case 'ServiceTask':
            case 'ScriptTask':
            case 'ManualTask':
            case 'SendTask':
            case 'BoundaryEvent':
            case 'IntermediateCatchEvent':
            case 'IntermediateThrowEvent':
            case 'ReceiveTask':
              // 缓存一下状态
              // 需要去重，否则多实例时，会发生问题
              // 主要是一个环节有多个Task，active会覆盖，如果遇到active=true
              if (!eleMap.has(ele.key)) {
                eleMap.set(ele.key, ele.active)
              } else {
                if (ele.active) eleMap.set(ele.key, ele.active)
              }
              let ct = 'history'
              if (eleMap.get(ele.key)) {
                ct = 'active'
              }
              canvas.addMarker(ele.key, ct);
              break
            case 'SequenceFlow':
              canvas.addMarker(ele.key, 'history-connection');
              break
            case 'StartEvent':
            case 'EndEvent':
            case 'ExclusiveGateway':
            case 'ParallelGateway':
            case 'InclusiveGateway':
              canvas.addMarker(ele.key, 'history');
              break
            default:
              break
          }
        }
      }
    },
    methods: {
      getData(id) {
        if (this.elements == null || this.elements.length == 0) {
          return null
        }
        for (let i = 0; i < this.elements.length; i++) {
          let e = this.elements[i]
          if (e.key === id) {
            return e
          }
        }
      },
      close(id) {
        this.overlays.remove({element: id});
      },
      closeAll() {
        for (let i = 0; i < this.elements.length; i++) {
          this.close(this.elements[i].key)
        }
      },
      openPanel(element, html) {
        const id = element.key
        if (html == null || html.length == 0) {
          return
        }
        let h = ''
        h = '<div class="time-class ' + (element.endTime != null ? 'history' : 'active') + '">'
        h += '<p class="buttons">'
        h += '<a title="关闭" class="close">x</a>'
        h += '</p>'
        h += html
        h += '</div>'

        // 关闭其他
        this.closeAll()

        const hv = $(h)
        // 点击关闭
        hv.on('click', 'a.close', e => {
          this.close(id)
        });

        // 设置
        this.overlays.add(id, {
          position: {bottom: 20, right: 0},
          html: hv
        })

      },
      //导入绘制
      importDiagram() {
        // 设置任务执行情况
        this.bpmnModeler.on('element.hover', ele => {
          let element = this.getData(ele.element.id)
          if (element == null) {
            return
          }
          let html = ''
          switch (ele.element.type.replace('bpmn:', '')) {
            case 'UserTask':
              html += '<p>环节：' + element.name + '</p>'
              html += '<p>状态：' + (element.endTime != null ? '已完成' : '办理中') + '</p>'
              html += '<p>办理人：' + element.assigneeName + '</p>'
              html += '<p>开始时间：' + element.startTime + '</p>'
              if (element.endTime != null) {
                html += '<p>完成时间：' + element.endTime + '</p>'
              }
              if (element.comment != null) {
                html += '<p class="comment-class">批注：' + element.comment + '</p>'
              }
              break
            case 'StartEvent':
              html = '<p>启动时间：' + element.startTime + '</p>'
              break
            case 'EndEvent':
              html = '<p>结束时间：' + element.endTime + '</p>'
              break
            // 非用户任务，只显示完成时间
            case 'CallActivity':
            case 'SubProcess':
            case 'ServiceTask':
            case 'ScriptTask':
            case 'ManualTask':
            case 'SendTask':
              html += '<p>环节：' + element.name + '</p>'
              html += '<p>状态：' + (element.endTime != null ? '已执行' : '办理中') + '</p>'
              html += '<p>开始时间：' + element.startTime + '</p>'
              if (element.endTime != null) {
                html += '<p>完成时间：' + element.endTime + '</p>'
              }
              break
            // 接收任务，显示开始时间和完成时间
            case 'ReceiveTask':
              html += '<p>环节：' + element.name + '</p>'
              html += '<p>状态：' + (element.endTime != null ? '已完成' : '等待信号') + '</p>'
              html += '<p>开始时间：' + element.startTime + '</p>'
              if (element.endTime != null) {
                html += '<p>完成时间：' + element.endTime + '</p>'
              }
              break
            case 'SequenceFlow':
            case 'ExclusiveGateway':
            case 'ParallelGateway':
            case 'InclusiveGateway':
            default:
              break
          }
          this.openPanel(element, html)
        })

        this.bpmnModeler.on('element.click', ele => {
          if(ele.element.type === 'bpmn:Process') {
            this.closeAll()
          }
        })
        this.bpmnModeler.importXML(this.process.bpmnXml, err => {
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

<style lang="less">
  .section-height {
    height: 100%;
  }

  @import '../../../../node_modules/bpmn-js/dist/assets/diagram-js.css';
  @import '../../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
  @import '../../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
  @import '../../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

  div.entry.bpmn-icon-screw-wrench {
    /*display: none!important;*/
  }

  .bjs-powered-by {
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

  .history:not(.djs-connection) .djs-visual > :nth-child(1) {
    fill: #fbfdff !important;
    color: #67c23a !important;
    stroke: #67c23a !important;
  }

  .history path {
    fill: #e6ffec !important;
    color: #67c23a !important;
    stroke: #67c23a !important;
  }

  .history circle {
    fill: #e6ffec !important;
    color: #67c23a !important;
    stroke: #67c23a !important;
  }

  .history text tspan {
    /*fill: #67c23a !important;*/
  }

  .history-connection .djs-visual > :nth-child(1) {
    color: #67c23a !important;
    stroke: #67c23a !important;
  }

  .history-connection path {
    color: #67c23a !important;
    stroke: #67c23a !important;
  }

  .active:not(.djs-connection) .djs-visual > :nth-child(1) {
    fill: #fef9ff !important;
    color: #F56C6C !important;
    stroke: #F56C6C !important;
  }

  .active circle {
    fill: #fef9ff !important;
    color: #F56C6C !important;
    stroke: #F56C6C !important;
  }

  .active path {
    fill: #fef9ff !important;
    color: #F56C6C !important;
    stroke: #F56C6C !important;
  }

  .active text tspan {
    /*fill: #F56C6C !important;*/
  }


  .time-class {
    width: 220px;
    padding: 0 5px 3px 5px;
    border-radius: 3px;
    font-size: 14px;
    position: relative;
  }

  .time-class p {
    margin: 0 0 5px 0;
  }

  .time-class p.buttons {
    text-align: right;
    font-size: 16px;

    a:hover {
      cursor: pointer;
      color: #000000;
    }
  }

  .time-class p.comment-class {
    line-height: 20px;
  }

  .history.time-class {
    background-color: #e6ffec;
    border: 1px solid #67c23a;

    p {
      color: #67c23a;
    }
  }

  .active.time-class {
    background-color: #fff4f7;
    border: 1px solid #F56C6C;

    p {
      color: #F56C6C;
    }
  }
</style>
