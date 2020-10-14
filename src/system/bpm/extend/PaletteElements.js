/*元素面板数据*/
export default [
  {
    label: '事件',
    group: 'event',
    list: [
      {
        label: '开始事件',
        meta: {type: 'bpmn:StartEvent'},
        className: 'bpmn-icon-start-event-none',
      },
      {
        label: '结束事件',
        meta: {type: 'bpmn:EndEvent'},
        className: 'bpmn-icon-end-event-none',
      },
      {
        label: '中间/边界事件',
        meta: {type: 'bpmn:IntermediateThrowEvent'},
        className: 'bpmn-icon-intermediate-event-none',
      },
    ]
  },
  {
    label: '活动',
    group: 'activity',
    list: [
      {
        group: 'activity',
        label: '用户任务',
        meta: {type: 'bpmn:UserTask'},
        className: 'bpmn-icon-user-task',
      },
      {
        group: 'activity',
        label: '服务任务',
        meta: {type: 'bpmn:ServiceTask'},
        className: 'bpmn-icon-service-task',
      },
      {
        group: 'activity',
        label: '脚本任务',
        meta: {type: 'bpmn:ScriptTask'},
        className: 'bpmn-icon-script-task',
      },
      {
        group: 'activity',
        label: '子流程',
        meta: {type: 'bpmn:SubProcess'},
        className: 'bpmn-icon-subprocess-expanded',
      },
      {
        group: 'activity',
        label: '调用流程',
        meta: {type: 'bpmn:CallActivity'},
        className: 'bpmn-icon-call-activity',
      },
      {
        group: 'activity',
        label: '邮件任务',
        meta: {type: 'bpmn:SendTask'},
        className: 'bpmn-icon-send-task',
      },
      {
        group: 'activity',
        label: '接收任务',
        meta: {type: 'bpmn:ReceiveTask'},
        className: 'bpmn-icon-receive-task',
      },
      {
        group: 'activity',
        label: '手工任务',
        meta: {type: 'bpmn:ManualTask'},
        className: 'bpmn-icon-manual-task',
      },
    ]
  },
  {
    label: '网关',
    group: 'gateway',
    list: [
      {
        label: '排他网关',
        meta: {type: 'bpmn:ExclusiveGateway'},
        className: 'bpmn-icon-gateway-xor',
      },
      {
        label: '并行网关',
        meta: {type: 'bpmn:ParallelGateway'},
        className: 'bpmn-icon-gateway-parallel',
      },
      {
        label: '包容网关',
        meta: {type: 'bpmn:InclusiveGateway'},
        className: 'bpmn-icon-gateway-or',
      },
    ]
  },
  {
    label: '标注',
    group: 'annotation',
    list: [
      {
        label: '文本注释',
        meta: {type: 'bpmn:TextAnnotation'},
        className: 'bpmn-icon-text-annotation',
      },
      {
        label: '数据文件',
        meta: {type: 'bpmn:DataObjectReference'},
        className: 'bpmn-icon-data-object',
      },
      {
        label: '数据存储',
        meta: {type: 'bpmn:DataStoreReference'},
        className: 'bpmn-icon-data-store',
      },
    ]
  },
  // {
  //   label: '参与关系',
  //   group: 'pool',
  //   list: [
  //     {
  //       label: '泳池',
  //       meta: {type: 'bpmn:Participant'},
  //       className: 'bpmn-icon-participant',
  //     },
      // {
      //   label: '道',
      //   meta: {type: 'bpmn:Lane'},
      //   className: 'bpmn-icon-lane',
      // },
  //   ]
  // },
]
