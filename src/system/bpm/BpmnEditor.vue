<template>
  <section class="bpmn-editor" v-loading="loading">
    <!--  侧边工具  -->
    <div class="bpmn-palette" :style="toolsHeight">
      <el-scrollbar class="hidden">
        <el-collapse v-model="activeNames">
          <!-- 工具 -->
          <el-collapse-item title="工具" name="tool">
            <span class="tool" @click="createTool($event, 'handTool')"><i class="bpmn-icon-hand-tool"></i>抓取工具</span>
            <span class="tool" @click="createTool($event, 'lassoTool')"><i
              class="bpmn-icon-lasso-tool"></i>套索工具</span>
            <span class="tool" @click="createTool($event, 'spaceTool')"><i
              class="bpmn-icon-space-tool"></i>空间工具</span>
            <span class="tool" @click="createTool($event, 'globalConnect')"><i class="bpmn-icon-connection-multi"></i>连线</span>
          </el-collapse-item>
          <!-- 流程元素 -->
          <el-collapse-item v-for="data in paletteElements" :title="data.label" :name="data.group">
            <span v-for="item in data.list" class="node" @click="createNode($event, item.meta)"
                  draggable="true" @dragstart="createNode($event, item.meta)">
                  <i :class="item.className"></i>
                  {{ item.label }}
            </span>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
    </div>

    <!-- 绘图区域 -->
    <div :style="{position: 'relative', height: mainHeight, width: '100%', zIndex: 0}">
      <!-- 绘制区域  -->
      <div id="canvas" :style="heightStyle"></div>
    </div>

    <div style="position: absolute; top: 2px; left: 148px;">
      <el-button size="small" @click="download('xml')" title="下载 BPMN2.0 XML" icon="el-icon-download"></el-button>
      <el-button size="small" @click="download('svg')" title="下载 SVG" icon="el-icon-picture-outline"></el-button>
      <el-button size="small" @click="deployment(false)" title="保存" icon="el-icon-check"></el-button>
      <el-button size="small" @click="deployment(true)" type="primary" title="保存并部署" icon="el-icon-upload"></el-button>
      <el-button size="small" @click="confirmBack" title="返回上一页" icon="el-icon-back"></el-button>
    </div>

    <div style="position: absolute; top: 2px; right: 2px; z-index: 200;">
      <el-button size="small" v-if="!collapse && currentPanel === 'element'"
                 @click="currentPanel = 'trigger'"
                 type="default" title="展开触发参数"
                 icon="el-icon-s-tools">
      </el-button>
      <el-button size="small" v-if="!collapse &&currentPanel === 'trigger'"
                 @click="currentPanel = 'element'"
                 type="default" title="展开配置面板"
                 icon="el-icon-s-flag"></el-button>
      <el-button size="small"
                 @click="collapse = !collapse"
                 :type="collapse ? 'primary' : 'default'"
                 :icon="collapse ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'">
      </el-button>
    </div>

    <!-- 流程元素设置 -->
    <div v-show="currentPanel === 'element'" class="bpmn-data" :style="bpmnDataStyle">
      <!-- 流传元素配置 -->
      <!-- 泳池 -->
      <participant-element :element="element" :store="store" :dialog-style="dialogStyle"
                           :update-label-name="updateLabelName"/>
      <!-- 流程 -->
      <process-element :element="element" :store="store" :dialog-style="dialogStyle"
                       :update-label-name="updateLabelName"/>
      <process-element v-show="processElementRef != null && !collapse"
                       :element="processElementRef" :store="store" :dialog-style="processDialogStyle"
                       :update-label-name="updateLabelName"/>

      <!-- 连线 -->
      <sequence-flow :element="element" :store="store" :dialog-style="dialogStyle"
                     :update-label-name="updateLabelName"
                     :set-default-flow="setDefaultFlow" :remove-default-flow="removeDefaultFlow"
                     :set-conditional-flow="setConditionalFlow" :remove-conditional-flow="removeConditionalFlow"/>

      <!-- 事件 -->
      <start-event :element="element" :triggers="triggers" :store="store" :dialog-style="dialogStyle"
                   :update-label-name="updateLabelName"
                   :bpmn-modeler="bpmnModeler"/>
      <boundary-event :element="element" :triggers="triggers" :store="store" :dialog-style="dialogStyle"
                      :update-label-name="updateLabelName"
                      :bpmn-modeler="bpmnModeler"/>
      <intermediate-catch-event :element="element" :triggers="triggers" :store="store" :dialog-style="dialogStyle"
                                :update-label-name="updateLabelName"
                                :bpmn-modeler="bpmnModeler"/>
      <intermediate-throw-event :element="element" :triggers="triggers" :store="store" :dialog-style="dialogStyle"
                                :update-label-name="updateLabelName"
                                :bpmn-modeler="bpmnModeler"/>
      <end-event :element="element" :store="store" :triggers="triggers" :dialog-style="dialogStyle"
                 :update-label-name="updateLabelName"
                 :bpmn-modeler="bpmnModeler"/>

      <!-- 各环节元素配置 -->
      <blank-element :element="element" :store="store" :dialog-style="dialogStyle"
                     :update-label-name="updateLabelName"/>
      <simple-element :element="element" :store="store" :dialog-style="dialogStyle" :bpmn-modeler="bpmnModeler"
                      :update-label-name="updateLabelName"/>

      <service-task :element="element" :store="store" :dialog-style="dialogStyle"
                    :update-label-name="updateLabelName"/>
      <send-task :element="element" :store="store" :dialog-style="dialogStyle"
                 :update-label-name="updateLabelName"/>
      <script-task :element="element" :store="store" :dialog-style="dialogStyle"
                   :update-label-name="updateLabelName"/>
      <user-task :element="element" :store="store" :dialog-style="dialogStyle"
                 :update-label-name="updateLabelName"
                 :assignee-strategy-list="assigneeStrategyList"
                 :multi-instance-strategy-list="multiInstanceStrategyList"
                 :set-multi-instance="setMultiInstance" :remove-multi-instance="removeMultiInstance"/>
      <call-activity :element="element" :store="store" :dialog-style="dialogStyle"
                     :update-label-name="updateLabelName"
                     :set-multi-instance="setMultiInstance" :remove-multi-instance="removeMultiInstance"/>
      <sub-process :element="element" :store="store" :dialog-style="dialogStyle"
                   :update-label-name="updateLabelName"
                   :set-multi-instance="setMultiInstance" :remove-multi-instance="removeMultiInstance"/>

      <!-- 网关 -->
      <exclusive-gateway :element="element" :store="store" :dialog-style="dialogStyle"
                         :update-label-name="updateLabelName"/>
      <parallel-gateway :element="element" :store="store" :dialog-style="dialogStyle"
                        :update-label-name="updateLabelName"/>
      <inclusive-gateway :element="element" :store="store" :dialog-style="dialogStyle"
                         :update-label-name="updateLabelName"/>
    </div>

    <!-- 消息、信号、错误配置 -->
    <div v-show="currentPanel === 'trigger'" class="bpmn-data" :style="bpmnDataStyle">
      <trigger ref="Trigger" :triggers="triggers" :dialog-style="dialogStyle"></trigger>
    </div>
  </section>
</template>

<script>
  import $ from 'jquery'
  import {mapState} from 'vuex'
  import BpmnModeler from 'bpmn-js/lib/Modeler'
  import customModule from './extend/CustomModule'
  import customTranslateModule from './extend/CustomTranslateModule'

  import SimpleElement from "./settings/SimpleElement";
  import ServiceTask from "./settings/ServiceTask";
  import SendTask from "./settings/SendTask";
  import ProcessElement from "./settings/ProcessElement";
  import SequenceFlow from "./settings/SequenceFlow";
  import UserTask from "./settings/UserTask";
  import CallActivity from "./settings/CallActivtiy";
  import ExclusiveGateway from "./settings/ExclusiveGateway";
  import ParallelGateway from "./settings/ParallelGateway";
  import ScriptTask from "./settings/ScriptTask";
  import InclusiveGateway from "./settings/InclusiveGateway";
  import BlankElement from "./settings/BlankElement";

  import PaletteElements from './extend/PaletteElements'
  import StartEvent from "./settings/StartEvent";
  import BoundaryEvent from "./settings/BoundaryEvent";
  import EndEvent from "./settings/EndEvent";
  import IntermediateCatchEvent from "./settings/IntermediateCatchEvent";
  import IntermediateThrowEvent from "./settings/IntermediateThrowEvent";
  import SubProcess from "./settings/SubProcess";
  import ParticipantElement from "./settings/ParticipantElement";

  import Trigger from "./settings/Trigger";

  export default {
    name: 'BpmnEditor',
    components: {
      ParticipantElement,
      SubProcess,
      IntermediateThrowEvent,
      IntermediateCatchEvent,
      EndEvent,
      BoundaryEvent,
      StartEvent,
      BlankElement,
      InclusiveGateway,
      ServiceTask,
      SendTask,
      ScriptTask,
      ParallelGateway,
      ExclusiveGateway,
      CallActivity, UserTask, SequenceFlow, ProcessElement, SimpleElement,
      Trigger,
    },
    props: {
      collapsedAside: {
        type: Function,
        default: null
      },
      expandedAside: {
        type: Function,
        default: null
      },
    },
    data() {
      return {
        paletteElements: [],
        activeNames: ['activity', 'gateway'],

        loading: false,

        bpmnModeler: null,  // 编辑器对象
        modeling: null,
        moddle: null,
        elementFactory: null,
        create: null,

        bpmnXml: null,

        modelId: null,
        version: null,
        processDefinitionKey: null,
        processDefinitionName: null,
        groupId: null,

        id: null,

        modify: false,
        process: null,
        nodes: null,
        lines: null,
        triggers: {
          signal: [],
          message: [],
          error: [],
        },


        currentPanel: 'element',
        // 配置页面折叠展开
        collapse: false,

        element: null,
        processElementRef: null,
        store: {},


        // 这个值传递给UserTask，解决异步问题
        assigneeStrategyList: [],
        multiInstanceStrategyList: [],
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
      dialogStyle() {
        return {
          width: '280px',
          position: 'absolute',
          height: 'calc(' + this.mainHeight + ' - 40px)',
        }
      },
      processDialogStyle() {
        return {
          width: '280px',
          position: 'absolute',
          top: '164px',
          right: '2px',
          display: this.collapse ? 'none' : 'block'
        }
      },
      toolsHeight() {
        return {
          height: this.mainHeight,
        }
      },
      opBtnStyle() {
        return {
          position: 'absolute',
          top: '2px',
          right: this.collapse ? '2px' : '283px',
          zIndex: 100,
        }
      },
      bpmnDataStyle() {
        return {
          height: this.mainHeight,
          display: this.collapse ? 'none' : 'block',
        }
      },
    },
    created() {
      if (this.collapsedAside) {
        this.collapsedAside()
      }

      // 流程元素区域
      this.paletteElements = PaletteElements

      // 获取候选人策略
      this.$http.get('/api/bpm/def/getCandidateStrategyList').then(resp => {
        this.assigneeStrategyList = resp.data
      })
      // 获取多实例策略
      this.$http.get('/api/bpm/def/getMultiInstanceStrategyList').then(resp => {
        this.multiInstanceStrategyList = resp.data
      })
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
        this.bpmnModeler = new BpmnModeler({
          container: '#canvas',
          keyboard: {
            bindTo: window,
          },
          additionalModules: [
            customTranslateModule,
            customModule,
          ],
        })
        this.modeling = this.bpmnModeler.get('modeling')
        this.moddle = this.bpmnModeler.get('moddle')
        this.elementFactory = this.bpmnModeler.get('elementFactory')
        this.create = this.bpmnModeler.get('create')

        this.process = resp.data.process
        this.nodes = resp.data.nodes
        this.lines = resp.data.lines
        this.triggers = resp.data.triggers
        this.bpmnXml = this.process.bpmnXml
        this.processDefinitionKey = this.process.processDefinitionKey

        // 如果是新建，强制用户指定流程定义KEY和流程名称
        if (this.version == null) {
          this.processDefinitionKey = this.process.processDefinitionKey
        } else {
          this.modify = true
        }
        this.initXml()
        this.loading = false
      }).catch(reason => {
        console.error(reason)
        this.$message.error('流程初始化数据失败')
      })
    },
    methods: {
      initXml() {
        if (this.bpmnXml == null || this.bpmnXml === '') {
          this.bpmnXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">\n' +
            '  <bpmn2:process id="' + this.processDefinitionKey + '">\n' +
            '   <bpmn2:startEvent id="StartEvent_12beddu"></bpmn2:startEvent>' +
            '  </bpmn2:process>\n' +
            '  <bpmndi:BPMNDiagram id="BPMNDiagram_' + this.processDefinitionKey + '">\n' +
            '    <bpmndi:BPMNPlane id="BPMNPlane_' + this.processDefinitionKey + '" bpmnElement="' + this.processDefinitionKey + '">\n' +
            '    <bpmndi:BPMNShape id="StartEvent_12beddu_di" bpmnElement="StartEvent_12beddu">' +
            '     <dc:Bounds x="50" y="242" width="36" height="36" />' +
            '    </bpmndi:BPMNShape>' +
            '    </bpmndi:BPMNPlane>\n' +
            '  </bpmndi:BPMNDiagram>\n' +
            '</bpmn2:definitions>'
        }
        this.importDiagram()
      },
      //导入绘制
      importDiagram() {
        this.bpmnModeler.on('element.contextmenu', event => {
          event.preventDefault()
          event.stopPropagation();
        })
        this.bpmnModeler.on('shape.changed', ({element}) => {
          // 边界事件，附加环节设置
          if (element.type === 'bpmn:BoundaryEvent') {
            const attachedToRef = element.businessObject.attachedToRef
            if (attachedToRef != null) {
              this.store[element.id].attachedKey = attachedToRef.id
            }
          }
        })
        // 添加环节元素时，初始化配置信息，打开配置面板
        this.bpmnModeler.on('shape.added', ({element}) => {
          this.renderElementProperties(element)
          this.openSettingsPanel(element)
        })
        // 添加连线元素时，初始化配置信息
        this.bpmnModeler.on('connection.added', ({element}) => {
          this.renderElementProperties(element)
        })

        // 元素移除
        this.bpmnModeler.on('shape.remove', ({element}) => {
          if (this.element != null && this.element.id == element.id) {
            this.element = null
            this.openSettingsPanel(this.bpmnModeler.get('canvas').getRootElement())
          }
        })
        this.bpmnModeler.on('connection.remove', ({element}) => {
          if (this.element != null && this.element.id == element.id) {
            this.element = null
            this.openSettingsPanel(this.bpmnModeler.get('canvas').getRootElement())
          }
        })

        // 单击元素打开元素配置面板
        this.bpmnModeler.on('element.click', ({element}) => {
          this.openSettingsPanel(element)
        })

        // 双击
        this.bpmnModeler.on('element.dblclick', ({element}) => {
          // this.openSettingsPanel(element)
        })
        // 导入数据
        this.bpmnModeler.importXML(this.bpmnXml, err => {
          const canvas = this.bpmnModeler.get('canvas')
          canvas.zoom(.8);

          // 根元素：流程元素
          const processElement = canvas.getRootElement()
          // 渲染流程配置信息
          // this.renderElementProperties(processElement)
          // 初始化流程名称
          if (processElement.businessObject.name == null) {
            processElement.businessObject.name = this.processDefinitionName
          }
          // 初始化打开流程信息配置面板
          this.openSettingsPanel(processElement)
        })
      },
      // 渲染流程元素配置信息
      renderElementProperties(element) {
        const bo = element.businessObject
        // 流程元素直接赋值，数据已被初始化
        if (element.type === 'bpmn:Process') {
          bo.name = this.process.name
          this.store[element.id] = {
            processListener: this.process.processListener,
            formUrl: this.process.formUrl,
            groupId: this.process.groupId,
            documentation: this.process.documentation
          }
          return
        }

        if (!this.modify) {
          this.store[element.id] = this.initElement(element)
          return
        }

        // 其他元素
        let properties = null
        let contain = false
        if (this.isLine(bo)) {
          for (let i = 0; i < this.lines.length; i++) {
            if (this.lines[i].lineKey === element.id) {
              const line = this.lines[i];
              properties = {
                expression: line.expression,
                defaultFlow: line.defaultFlow + '',
                expressionFn: line.expressionFn,
                useExprService: line.useExprService == null ? 'true' : line.useExprService + '',
                startExecutionListener: line.startExecutionListener,
                endExecutionListener: line.endExecutionListener,
                takeExecutionListener: line.takeExecutionListener,
                documentation: line.documentation,
              }
              contain = true
              break
            }
          }
        }
        // 遍历连线
        else {
          // 遍历环节
          for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i]
            if (node.nodeKey === element.id) {
              bo.name = node.name
              properties = {
                taskType: node.taskType == null ? 'USER' : node.taskType,
                taskListener: node.taskListener,

                assignees: [],
                assigneeRule: [],

                multiInstance: node.multiInstance == null ? 'false' : node.multiInstance + '',
                sequential: node.sequential == null ? 'false' : node.sequential + '',
                multiStrategy: node.multiStrategy == null ? this.multiInstanceStrategyList[0].key : node.multiStrategy,
                decisionType: node.decisionType == null ? '1' : node.decisionType + '',
                votingType: node.votingType == null ? '1' : node.votingType + '',
                votes: node.votes == null ? '100' : node.votes + '',

                callActivityDefinitionKey: node.callActivityDefinitionKey,

                sendMail: node.sendMail == null ? 'false' : node.sendMail,
                formUrl: node.formUrl,

                useAssService: node.useAssService == null ? 'true' : node.useAssService + '',
                useMultiService: node.useMultiService == null ? 'true' : node.useMultiService + '',
                assigneeFn: node.assigneeFn,
                multiInstanceFn: node.multiInstanceFn,

                scriptCode: node.scriptCode,
                executionFn: node.executionFn,
                startExecutionListener: node.startExecutionListener,
                endExecutionListener: node.endExecutionListener,

                eventDefinitionType: node.eventDefinitionType,
                timerType: node.timerType == null ? 'date' : node.timerType,
                timer: node.timer,
                signalName: node.signalName,
                messageName: node.messageName,

                attachedKey: node.attachedKey,
                errorCode: node.errorCode,

                documentation: node.documentation,
              }

              // assignees
              let assignees = node.assignees;
              let assigneeRule = node.assigneeRule;
              if (assignees != null) {
                properties.assignees = eval('(' + assignees + ')');
              }
              if (assigneeRule != null) {
                properties.assigneeRule = eval('(' + assigneeRule + ')');
              }
              contain = true
              break
            }
          }
        }
        if (!contain) {
          properties = this.initElement(element)
        }
        this.store[element.id] = properties
      },
      // 初始化名称
      initElement(element) {
        const bo = element.businessObject
        let properties = this.getDefaultNodeProperties()
        switch (element.type) {
          case 'bpmn:StartEvent':
            break
          case 'bpmn:Task':
            bo.name = '任务'
            break
          case 'bpmn:UserTask':
            bo.name = '用户任务'
            break
          case 'bpmn:CallActivity':
            bo.name = '调用流程'
            break
          case 'bpmn:ServiceTask':
            bo.name = '服务任务'
            break
          case 'bpmn:SendTask':
            bo.name = '邮件任务'
            break
          case 'bpmn:ScriptTask':
            bo.name = '脚本任务'
            break
          case 'bpmn:SubProcess':
            bo.name = '子流程'
            break
          case 'bpmn:ManualTask':
            bo.name = '手工任务'
            break
          case 'bpmn:ReceiveTask':
            bo.name = '接收任务'
            break
          case 'bpmn:SequenceFlow':
            properties = this.getDefaultFlowProperties()
            break
          default:
            break
        }
        return properties
      },
      getDefaultNodeProperties() {
        return {
          taskType: 'USER',
          taskListener: null,
          startExecutionListener: null,
          endExecutionListener: null,

          assignees: [],
          assigneeRule: [],

          multiInstance: 'false',
          sequential: 'false',
          multiStrategy: this.multiInstanceStrategyList[0].key,
          decisionType: '1',
          votingType: '1',
          votes: '100',

          callActivityDefinitionKey: null,

          sendMail: 'false',
          formUrl: '',
          useAssService: 'true',
          useMultiService: 'true',
          assigneeFn: null,
          multiInstanceFn: null,

          executionFn: null,
          scriptCode: null,

          subProcessDefinitionKey: null,

          eventDefinitionType: null,
          timerType: 'date',
          timer: null,
          signalName: null,
          messageName: null,

          attachedKey: null,
          errorCode: null,

          documentation: null
        }
      },
      getDefaultFlowProperties() {
        return {
          expression: null,
          defaultFlow: 'false',
          expressionFn: null,
          useExprService: 'true',
          startExecutionListener: null,
          endExecutionListener: null,
          takeExecutionListener: null,
          documentation: null,
        }
      },
      // 打开指定的配置面板
      openSettingsPanel(element) {
        this.processElementRef = null

        const type = element.type
        if (element.type === 'label') {
          // label类型找到指向的元素
          for (const item of element.parent.children) {
            if (item.id === element.businessObject.id) {
              element = item
              break
            }
          }
        }
        const noneElements = ['bpmn:TextAnnotation', 'bpmn:Association',
          'bpmn:DataOutputAssociation', 'bpmn:DataInputAssociation', 'bpmn:Collaboration']
        if (noneElements.indexOf(type) > -1) {  // 满足该条件，表示不需要打开
          this.element = null
          this.collapse = false  // 折叠
        } else {
          // 如果没有初始化，初始化
          if (this.store[element.id] == null) {
            this.renderElementProperties(element)
          }

          if (type === 'bpmn:Participant') {
            this.processElementRef = element.businessObject.processRef
          }

          this.element = element
          if (this.dialogStyle.display === 'block') { // 值为block时，面板才可以打开
            this.collapse = false
          }
        }
      },
      setMultiInstance(element, isSequential) {
        const loopCharacteristics = this.moddle.create('bpmn:MultiInstanceLoopCharacteristics')
        loopCharacteristics.isSequential = isSequential
        this.modeling.updateProperties(element, {loopCharacteristics: loopCharacteristics});
      },
      removeMultiInstance(element) {
        this.modeling.updateProperties(element, {loopCharacteristics: null});
      },
      setDefaultFlow(element) {
        this.modeling.updateProperties(element.source, {default: element});
      },
      removeDefaultFlow(element) {
        this.modeling.updateProperties(element.source, {default: null});
      },
      setConditionalFlow(element) {
        var conditionExpression = this.moddle.create('bpmn:FormalExpression', {body: ''});
        this.modeling.updateProperties(element, {conditionExpression: conditionExpression})
      },
      removeConditionalFlow(element) {
        this.modeling.updateProperties(element, {conditionExpression: null});
      },
      updateLabelName(element) {
        const labelElementArray = ['bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:BoundaryEvent'
          , 'bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:SequenceFlow'
          , 'bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway', 'bpmn:ParallelGateway'
          , 'bpmn:DataObjectReference', 'bpmn:DataStoreReference']
        const type = element.type
        if (labelElementArray.indexOf(type) == -1) {
          this.modeling.updateProperties(element, {});
          return
        }

        // 满足以上类型都要有Label，创建Label
        const importer = this.bpmnModeler.get('bpmnImporter');
        if (element.label == null) {
          importer.addLabel(element.businessObject, element)
        }
        element.label.hidden = false

        // 如果值为空
        const name = element.businessObject.name
        if (name == null || name.trim().length == 0) {
          $('[data-element-id=' + element.id + '_label]').find('.djs-visual tspan').text('')
        }

        this.modeling.updateProperties(element, {});
      },
      // 操作
      // 部署
      deployment(isDeployment) {
        const deploymentData = {
          collaboration: null,
          participants: [],
          processes: [],
          triggers: this.triggers,
        }

        this.loading = true
        this.bpmnModeler.saveXML({format: true}, (err, xml) => {
          if (err) {
            this.loading = false
            return console.error('无法保存 BPMN 2.0 流程图', err)
          }
          const canvas = this.bpmnModeler.get('canvas')
          const rootElement = canvas.getRootElement()
          const rootType = rootElement.type

          // 使用了泳道，暂不支持泳道 TODO
          if (rootType === 'bpmn:Collaboration') {
            this.processingByCollaboration(rootElement, deploymentData)
          }
          // 单流程
          else if (rootType === 'bpmn:Process') {
            this.processing(rootElement, deploymentData)
          }

          // 流程信息
          this.bpmnModeler.saveSVG({format: true}, (err, svg) => {
            // 设置流程数据
            const param = {
              modelId: this.modelId,
              bpmnXml: xml,
              elements: deploymentData,
            }

            // 流程校验
            const processes = param.elements.processes
            for (const processItem of processes) {
              const process = processItem.process
              if (process.processDefinitionKey == null || process.processDefinitionKey.trim().length == 0) {
                this.loading = false
                this.$message.error('流程KEY不能为空')
                return
              }
              if (process.name == null || process.name.trim().length == 0) {
                this.loading = false
                this.$message.error('流程名称不能为空')
                return
              }
            }

            if (isDeployment) {
              for (const processItem of processes) {
                const lineArr = processItem.lines
                // 元素校验processItem.lines
                // 连线
                for (const l of lineArr) {
                  if (l.data.defaultFlow === 'true') {
                    l.expression = null
                    l.expressionFn = null
                    l.useExprService = 'true'
                    l.startExecutionListener = null
                    l.endExecutionListener = null
                    l.takeExecutionListener = null
                  }
                }
                // 元素
                const nodeArr = processItem.nodes
                for (const n of nodeArr) {
                  if (n.type === 'UserTask') {
                    if (n.name == null || n.name.trim().length == 0) {
                      this.loading = false
                      this.$message.error(n.key + ' 用户任务名称不能为空')
                      return
                    }
                    const d = n.data
                    if ((d.assigneeFn == null || d.assigneeFn.length == 0) && (d.assignees == null || d.assignees.length == 0)) {
                      this.loading = false
                      this.$message.error(n.name + ' 请设置候选人')
                      return
                    }
                    if (d.useAssService == 'true' && (d.assigneeFn == null || d.assigneeFn.length == 0)) {
                      this.loading = false
                      this.$message.error(n.name + ' 请设置候选人调用接口')
                      return
                    }
                    if (d.multiInstance == 'true') {
                      if (d.useMultiService == 'true' && (d.multiInstanceFn == null || d.multiInstanceFn.length == 0)) {
                        this.loading = false
                        this.$message.error(n.name + ' 请设置多实例决策调用接口')
                        return
                      }
                    }
                  } else if (n.type === 'ServiceTask') {
                    if (n.name == null || n.name.trim().length == 0) {
                      this.loading = false
                      this.$message.error(n.key + ' 服务任务名称不能为空')
                      return
                    }
                    const d = n.data
                    if (d.executionFn == null || d.executionFn.trim().length == 0) {
                      this.loading = false
                      this.$message.error(n.name + ' 服务任务执行接口不能为空')
                      return
                    }
                  } else if (n.type === 'SendTask') {
                    if (n.name == null || n.name.trim().length == 0) {
                      this.loading = false
                      this.$message.error(n.key + ' 发送任务名称不能为空')
                      return
                    }
                    const d = n.data
                    if (d.executionFn == null || d.executionFn.trim().length == 0) {
                      this.loading = false
                      this.$message.error(n.name + ' 发送任务执行接口不能为空')
                      return
                    }
                  }
                }
              }
              //部署流程
              this.$http.postJson('/api/bpm/def/deployment', param).then(resp => {
                if (resp.success) {
                  this.$message.success('部署成功')
                  this.back()
                } else {
                  this.$message.error('部署失败，' + resp.message)
                }
                this.loading = false
              }).catch((error) => {
                this.loading = false
                this.$message.error('部署失败')
              })
            } else {
              //保存流程
              this.$http.postJson('/api/bpm/def/save', param).then(resp => {
                if (resp.success) {
                  this.$message.success('保存成功')
                  this.back()
                } else {
                  this.$message.error('保存失败，' + resp.message)
                }
                this.loading = false
              }).catch((error) => {
                this.loading = false
                this.$message.error('保存失败')
              })
            }
          })
        })
      },
      processingByCollaboration(rootElement, deploymentData) {
        deploymentData.collaboration = rootElement.id
        const participants = rootElement.businessObject.participants
        for (const participant of participants) {
          deploymentData.participants.push({
            key: participant.id,
            name: participant.name,
            processDefinitionKey: participant.processRef.id
          })
          this.processing(participant.processRef, deploymentData)
        }
      },
      processing(rootElement, deploymentData) {
        let businessObject = rootElement
        if (rootElement.type != null) {
          businessObject = rootElement.businessObject
        }

        // 获取流程元素
        const flowElements = businessObject.flowElements
        if (typeof (flowElements) === 'undefined' || flowElements === null) {
          this.loading = false
          this.$message.error('至少含有一个流程元素，无法部署保存')
          return
        }

        const processData = this.store[rootElement.id]
        const data = {
          process: {
            processDefinitionKey: rootElement.id,
            name: businessObject.name,
            processListener: processData.processListener,
            formUrl: processData.formUrl,
            groupId: processData.groupId,
            documentation: processData.documentation,
          },
          nodes: [],
          lines: []
        }

        // 遍历流程元素，取值
        this.recursion(data, flowElements, null)

        deploymentData.processes.push(data)
      },
      recursion(data, flowElements, subProcessNodeKey = null) {
        for (const element of flowElements) {
          const node = {}
          node.subProcessNodeKey = subProcessNodeKey  // 所属的子流程环节KEY
          node.type = element.$type.replace('bpmn:', '')
          node.key = element.id
          node.name = element.name == null ? null : element.name
          node.data = this.store[node.key]

          if (this.isLine(element)) {
            node.sourceKey = element.sourceRef.id
            node.targetKey = element.targetRef.id
            data.lines.push(node)
          } else {
            data.nodes.push(node)
            // 判断是否子流程，如果是，遍历子流程中的元素
            if (this.isSubProcess(element)) {
              this.recursion(data, element.flowElements, element.id)
            }
          }
        }
      },
      // 下载流程图
      download(type) {
        if (type === 'svg') {
          this.bpmnModeler.saveSVG({format: true}, (err, svg) => {
            let canvas = this.bpmnModeler.get('canvas')
            let processEle = canvas.getRootElement()
            let data = new Blob([svg], {type: 'text/plain;charset=UTF-8'})
            let downloadUrl = window.URL.createObjectURL(data)
            let anchor = document.createElement('a')
            anchor.href = downloadUrl
            anchor.download = processEle.id + '.svg'
            anchor.click()
            window.URL.revokeObjectURL(data)
          })
        } else if (type === 'xml') {
          this.bpmnModeler.saveXML({format: true}, (err, xml) => {
            if (err) {
              this.loading = false
              return console.error('无法保存 BPMN 2.0 流程图', err)
            }
            let canvas = this.bpmnModeler.get('canvas')
            let processEle = canvas.getRootElement()
            let data = new Blob([xml], {type: 'text/plain;charset=UTF-8'})
            let downloadUrl = window.URL.createObjectURL(data)
            let anchor = document.createElement('a')
            anchor.href = downloadUrl
            anchor.download = processEle.id + '.bpmn'
            anchor.click()
            window.URL.revokeObjectURL(data)
          })
        }
      },

      isSubProcess(eleBusinessObj) {
        if (eleBusinessObj.$type === 'bpmn:SubProcess') {
          return true;
        }
        return false;
      },
      isLine(eleBusinessObj) {
        if (eleBusinessObj.$type === 'bpmn:SequenceFlow' || eleBusinessObj.$type === 'bpmn:Association') {
          return true;
        }
        return false;
      },

      createNode(event, meta) {
        if (meta.type === 'bpmn:Participant') {
          this.create.start(event, this.elementFactory.createParticipantShape({isExpanded: true}));
        } else if (meta.type === 'bpmn:SubProcess') {
          const subProcess = this.elementFactory.createShape({
            type: 'bpmn:SubProcess',
            x: 0,
            y: 0,
            isExpanded: true
          });
          const startEvent = this.elementFactory.createShape({
            type: 'bpmn:StartEvent',
            x: 40,
            y: 82,
            parent: subProcess
          });
          this.create.start(event, [subProcess, startEvent], {
            hints: {
              autoSelect: [startEvent]
            }
          });
        } else {
          this.create.start(event, this.elementFactory.createShape(meta));
        }
      },
      createTool(event, type) {
        const tool = this.bpmnModeler.get(type);
        switch (type) {
          case 'handTool':
            tool.activateHand(event);
            break
          case 'lassoTool':
            tool.activateSelection(event)
            break
          case 'spaceTool':
            tool.activateSelection(event)
            break
          case 'globalConnect':
            tool.toggle(event)
            break
        }
      },
      back() {
        // 展开侧边栏
        if (this.expandedAside) {
          this.expandedAside()
        }
        this.$router.go(-1)
      },
      confirmBack() {
        this.$confirm('可能存在尚未保存的修改， 是否离开此页面?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.back()
        }, reason => {
        }).catch(reason => {
          console.error(reason)
        })
      },
    }
  }
</script>

<style lang="less">
  .bpmn-editor {
    height: 100%;
    position: relative;

    .el-button + .el-button {
      margin-left: 2px;
    }

    .canvas {
      background: #fff;
      overflow: hidden;
      height: 100%;
    }

    .el-form-item__label {
      font-weight: bolder;
      padding: 0 5px;
    }

    .el-tabs--border-card {
      box-shadow: none;
    }

    .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
      background-color: #FBFBFB;
    }

    .el-tabs--border-card > .el-tabs__content {
      padding: 5px;
    }

    .bpmn-palette {
      * {
        font-size: 12px;
      }

      position: absolute;
      width: 145px;
      z-index: 100;
      border-right: 1px solid #E6E6E6;
      background-color: #fff;

      span.tool, span.node {
        height: 30px;
        line-height: 30px;
        padding-left: 15px;
        padding-right: 10px;
        display: block;

        &:hover {
          background-color: #D9ECFF;
        }

        &.tool:hover {
          cursor: pointer;
        }

        &.node:hover {
          cursor: move;
        }

        i {
          font-size: 20px;
          vertical-align: middle;
          padding-right: 10px;
        }
      }

      .el-collapse-item__header {
        padding-left: 10px;
      }

      .el-collapse-item__content {
        padding-bottom: 5px;
      }
    }

    .bpmn-data {
      position: absolute;
      right: 0;
      top: 0;
      width: 280px;
      border-left: 1px solid #E6E6E6;
      background-color: #fbfbfb;
    }
  }

  @import '../../../node_modules/bpmn-js/dist/assets/diagram-js.css';
  @import '../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
  @import '../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
  @import '../../../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';


  /deep/ .bjs-powered-by {
    display: none;
  }

  .properties-panel-parent {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 260px;
    z-index: 10;
    border-left: 1px solid #ccc;
    overflow: auto;

    &:empty {
      display: none;
    }

    > .djs-properties-panel {
      padding-bottom: 70px;
      min-height: 100%;
    }
  }
</style>
