/*设置元素可转换的后续元素列表*/
class PanelElements {
  // 获取集合
  getEntries(element) {
    let entries = []
    if (this.isStartEvent(element)) {
      entries = filter(STARTEVENT, isDifferentType(element))
    } else if (this.isEndEvent(element)) {
      entries = filter(ENDEVENT, isDifferentType(element))
    } else if (this.isIntermediateEvent(element)) {
      entries = filter(INTERMEDIATEEVENT, isDifferentType(element))
    } else if (this.isBoundaryEvent(element)) {
      entries = filter(BOUNDARYEVENT, isDifferentType(element))
    } else if (this.isGateway(element)) {
      entries = filter(GATEWAY, isDifferentType(element))
    } else if (this.isTask(element)) {
      // entries = filter(TASK, isDifferentType(element))
      entries = []
    } else if (this.isSubProcess(element)) {
      entries = filter(SUBPROCESS, isDifferentType(element))
    } else if (this.isParticipant(element)) {
      entries = filter(Participant, isDifferentType(element))
    }
    return entries
  }

  isStartEvent(element) {
    if (contained(element, ['bpmn:StartEvent'])) return true
  }
  isEndEvent(element) {
    if (contained(element, ['bpmn:EndEvent'])) return true
  }
  isIntermediateEvent(element) {
    if (contained(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent'])) return true
  }
  isBoundaryEvent(element) {
    if (contained(element, ['bpmn:BoundaryEvent'])) return true
  }
  isGateway(element) {
    if (contained(element, ['bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:InclusiveGateway'])) return true
  }
  isTask(element) {
    if (contained(element, ['bpmn:Task', 'bpmn:UserTask',
      'bpmn:ServiceTask', 'bpmn:ScriptTask', 'bpmn:ManualTask', 'bpmn:SendTask', 'bpmn:ReceiveTask',
      'bpmn:CallActivity'])) return true
  }
  isSubProcess(element) {
    if (contained(element, ['bpmn:SubProcess'])) return true
  }
  isParticipant(element) {
    if (contained(element, ['bpmn:Participant'])) return true
  }
}

function contained(element, types = []) {
  for (const type of types) {
    if (is$1(element, type)) return true
  }
  return false
}

function isDifferentType(element) {
  return function (entry) {
    var target = entry.target;
    var businessObject = getBusinessObject(element),
      eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0];
    var isTypeEqual = businessObject.$type === target.type;
    var isEventDefinitionEqual = ((eventDefinition && eventDefinition.$type) === target.eventDefinitionType);
    var isExpandedEqual = (target.isExpanded === undefined || target.isExpanded === isExpanded(businessObject));
    return !isTypeEqual || !isEventDefinitionEqual || !isExpandedEqual;
  };
}

function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

function is$1(element, type) {
  var bo = getBusinessObject(element);
  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}


function isExpanded(element) {
  if (is$1(element, 'bpmn:CallActivity')) {
    return false;
  }
  if (is$1(element, 'bpmn:SubProcess')) {
    return !!getBusinessObject(element).di.isExpanded;
  }
  if (is$1(element, 'bpmn:Participant')) {
    return !!getBusinessObject(element).processRef;
  }
  return true;
}

function filter(collection, matcher) {
  var result = [];
  forEach(collection, function (val, key) {
    if (matcher(val, key)) {
      result.push(val);
    }
  });
  return result;
}

function forEach(collection, iterator) {
  if (collection === undefined) {
    return;
  }
  var convertKey = isArray(collection) ? toNum : identity;
  for (var key in collection) {
    if (has(collection, key)) {
      var val = collection[key];
      var result = iterator(val, convertKey(key));
      if (result === false) {
        return;
      }
    }
  }
}

var nativeToString = Object.prototype.toString;
var nativeHasOwnProperty = Object.prototype.hasOwnProperty;

function isArray(obj) {
  return nativeToString.call(obj) === '[object Array]';
}

function has(target, key) {
  return nativeHasOwnProperty.call(target, key);
}

function identity(arg) {
  return arg;
}

function toNum(arg) {
  return Number(arg);
}

const STARTEVENT = [
  {
    id: 'start-event',
    label: '开始事件',
    className: 'bpmn-icon-start-event-none',
    target: {type: 'bpmn:StartEvent'}
  },
  {
    id: 'end-event',
    label: '结束事件',
    className: 'bpmn-icon-end-event-none',
    target: {type: 'bpmn:EndEvent'}
  },
  {
    id: 'intermediate-event',
    label: '中间事件',
    className: 'bpmn-icon-intermediate-event-none',
    target: {type: 'bpmn:IntermediateCatchEvent'}
  },
  {
    id: 'start-event-timer',
    label: '定时开始事件',
    className: 'bpmn-icon-start-event-timer',
    target: {type: 'bpmn:StartEvent', eventDefinitionType: 'bpmn:TimerEventDefinition'}
  },
  {
    id: 'start-event-message',
    label: '消息开始事件',
    className: 'bpmn-icon-start-event-message',
    target: {type: 'bpmn:StartEvent', eventDefinitionType: 'bpmn:MessageEventDefinition'}
  },
  {
    id: 'start-event-signal',
    label: '信号开始事件',
    className: 'bpmn-icon-start-event-signal',
    target: {type: 'bpmn:StartEvent', eventDefinitionType: 'bpmn:SignalEventDefinition'}
  },
  // {
  //   id: 'start-event-error',
  //   label: '错误开始事件',
  //   className: 'bpmn-icon-start-event-error',
  //   target: {type: 'bpmn:StartEvent', eventDefinitionType: 'bpmn:ErrorEventDefinition'}
  // },
  // {
  //   id: 'start-event-condition',
  //   label: '条件开始事件',
  //   className: 'bpmn-icon-start-event-condition',
  //   target: {type: 'bpmn:StartEvent', eventDefinitionType: 'bpmn:ConditionalEventDefinition'}
  // },
]
const ENDEVENT = [
  {
    id: 'start-event',
    label: '开始事件',
    className: 'bpmn-icon-start-event-none',
    target: {type: 'bpmn:StartEvent'}
  },
  {
    id: 'end-event',
    label: '结束事件',
    className: 'bpmn-icon-end-event-none',
    target: {type: 'bpmn:EndEvent'}
  },
  {
    id: 'intermediate-event',
    label: '中间事件',
    className: 'bpmn-icon-intermediate-event-none',
    target: {type: 'bpmn:IntermediateCatchEvent'}
  },
  {
    id: 'end-event-message',
    label: '消息结束事件',
    className: 'bpmn-icon-end-event-message',
    target: {type: 'bpmn:EndEvent', eventDefinitionType: 'bpmn:MessageEventDefinition'}
  },
  {
    id: 'end-event-signal',
    label: '信号结束事件',
    className: 'bpmn-icon-end-event-signal',
    target: {type: 'bpmn:EndEvent', eventDefinitionType: 'bpmn:SignalEventDefinition'}
  },
  {
    id: 'end-event-error',
    label: '错误结束事件',
    className: 'bpmn-icon-end-event-error',
    target: {type: 'bpmn:EndEvent', eventDefinitionType: 'bpmn:ErrorEventDefinition'}
  },
  // {
  //   id: 'end-event-escalation',
  //   label: '定时结束事件',
  //   className: 'bpmn-icon-end-event-escalation',
  //   target: {type: 'bpmn:EndEvent', eventDefinitionType: 'bpmn:EscalationEventDefinition'}
  // },
  // {
  //   id: 'end-event-compensation',
  //   label: '补偿结束事件',
  //   className: 'bpmn-icon-end-event-compensation',
  //   target: {type: 'bpmn:EndEvent', eventDefinitionType: 'bpmn:CompensateEventDefinition'}
  // },
  // {
  //   id: 'end-event-terminate',
  //   label: '终止结束事件',
  //   className: 'bpmn-icon-end-event-terminate',
  //   target: {type: 'bpmn:EndEvent', eventDefinitionType: 'bpmn:TerminateEventDefinition'}
  // },
]
const INTERMEDIATEEVENT = [
  {
    id: 'start-event',
    label: '开始事件',
    className: 'bpmn-icon-start-event-none',
    target: {type: 'bpmn:StartEvent'}
  },
  {
    id: 'end-event',
    label: '结束事件',
    className: 'bpmn-icon-end-event-none',
    target: {type: 'bpmn:EndEvent'}
  },
  {
    id: 'intermediate-event',
    label: '中间事件',
    className: 'bpmn-icon-intermediate-event-none',
    target: {type: 'bpmn:IntermediateCatchEvent'}
  },
  {
    id: 'intermediate-event-catch-message',
    label: '消息中间捕获事件',
    className: 'bpmn-icon-intermediate-event-catch-message',
    target: {type: 'bpmn:IntermediateCatchEvent', eventDefinitionType: 'bpmn:MessageEventDefinition'}
  },
  {
    id: 'intermediate-event-throw-message',
    label: '消息中间抛出事件',
    className: 'bpmn-icon-intermediate-event-throw-message',
    target: {type: 'bpmn:IntermediateThrowEvent', eventDefinitionType: 'bpmn:MessageEventDefinition'}
  },
  {
    id: 'intermediate-event-catch-signal',
    label: '信号中间捕获事件',
    className: 'bpmn-icon-intermediate-event-catch-signal',
    target: {type: 'bpmn:IntermediateCatchEvent', eventDefinitionType: 'bpmn:SignalEventDefinition'}
  },
  {
    id: 'intermediate-event-throw-signal',
    label: '信号中间抛出事件',
    className: 'bpmn-icon-intermediate-event-throw-signal',
    target: {type: 'bpmn:IntermediateThrowEvent', eventDefinitionType: 'bpmn:SignalEventDefinition'}
  },
  {
    id: 'intermediate-event-catch-timer',
    label: '定时中间捕获事件',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {type: 'bpmn:IntermediateCatchEvent', eventDefinitionType: 'bpmn:TimerEventDefinition'}
  },
  // {
  //   id: 'intermediate-event-catch-condition',
  //   label: '条件中间捕获事件',
  //   className: 'bpmn-icon-intermediate-event-catch-condition',
  //   target: {type: 'bpmn:IntermediateCatchEvent', eventDefinitionType: 'bpmn:ConditionalEventDefinition'}
  // },
  // {
  //   id: 'intermediate-event-catch-link',
  //   label: '链接中间捕获事件',
  //   className: 'bpmn-icon-intermediate-event-catch-link',
  //   target: {type: 'bpmn:IntermediateCatchEvent', eventDefinitionType: 'bpmn:LinkEventDefinition'}
  // },
  // {
  //   id: 'intermediate-event-throw-escalation',
  //   label: '升级中间抛出事件',
  //   className: 'bpmn-icon-intermediate-event-throw-escalation',
  //   target: {type: 'bpmn:IntermediateThrowEvent', eventDefinitionType: 'bpmn:EscalationEventDefinition'}
  // },
  // {
  //   id: 'intermediate-event-throw-link',
  //   label: '链接中间抛出事件',
  //   className: 'bpmn-icon-intermediate-event-throw-link',
  //   target: {type: 'bpmn:IntermediateThrowEvent', eventDefinitionType: 'bpmn:LinkEventDefinition'}
  // },
  // {
  //   id: 'intermediate-event-throw-compensation',
  //   label: '补偿中间抛出事件',
  //   className: 'bpmn-icon-intermediate-event-throw-compensation',
  //   target: {type: 'bpmn:IntermediateThrowEvent', eventDefinitionType: 'bpmn:CompensateEventDefinition'}
  // },
]
const BOUNDARYEVENT = [
  {
    id: 'boundary-event',
    label: '边界事件',
    className: 'bpmn-icon-intermediate-event-none',
    target: {type: 'bpmn:BoundaryEvent'}
  },
  {
    id: 'boundary-event-catch-timer',
    label: '定时边界事件',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {type: 'bpmn:BoundaryEvent', eventDefinitionType: 'bpmn:TimerEventDefinition'}
  },
  {
    id: 'boundary-event-catch-message',
    label: '消息边界事件',
    className: 'bpmn-icon-intermediate-event-catch-message',
    target: {type: 'bpmn:BoundaryEvent', eventDefinitionType: 'bpmn:MessageEventDefinition'}
  },
  {
    id: 'boundary-event-catch-signal',
    label: '信号边界事件',
    className: 'bpmn-icon-intermediate-event-catch-signal',
    target: {type: 'bpmn:BoundaryEvent', eventDefinitionType: 'bpmn:SignalEventDefinition'}
  },
  {
    id: 'boundary-event-catch-error',
    label: '错误边界事件',
    className: 'bpmn-icon-intermediate-event-catch-error',
    target: {type: 'bpmn:BoundaryEvent', eventDefinitionType: 'bpmn:ErrorEventDefinition'}
  },
 ]
const GATEWAY = [
  {
    id: 'exclusive-gateway',
    label: '排他网关',
    className: 'bpmn-icon-gateway-xor',
    target: {type: 'bpmn:ExclusiveGateway'}
  },
  {
    id: 'parallel-gateway',
    label: '并行网关',
    className: 'bpmn-icon-gateway-parallel',
    target: {type: 'bpmn:ParallelGateway'}
  },
  {
    id: 'inclusive-gateway',
    label: '包容网关',
    className: 'bpmn-icon-gateway-or',
    target: {type: 'bpmn:InclusiveGateway'}
  }
]
const TASK = [
  {
    id: 'user-task',
    label: '用户任务',
    className: 'bpmn-icon-user-task',
    target: {type: 'bpmn:UserTask'}
  },
  {
    id: 'service-task',
    label: '服务任务',
    className: 'bpmn-icon-service-task',
    target: {type: 'bpmn:ServiceTask'}
  },
  {
    id: 'script-task',
    label: '脚本任务',
    className: 'bpmn-icon-script-task',
    target: {type: 'bpmn:ScriptTask'}
  },
  {
    id: 'send-task',
    label: '邮件任务',
    className: 'bpmn-icon-send-task',
    target: {type: 'bpmn:SendTask'}
  },
  {
    id: 'receive-task',
    label: '接收任务',
    className: 'bpmn-icon-receive-task',
    target: {type: 'bpmn:ReceiveTask'}
  },
  {
    id: 'manual-task',
    label: '手工任务',
    className: 'bpmn-icon-manual-task',
    target: {type: 'bpmn:ManualTask'}
  },
  {
    id: 'call-activity',
    label: '调用流程',
    className: 'bpmn-icon-call-activity',
    target: {type: 'bpmn:CallActivity'}
  },
]
const SUBPROCESS = [
  {
    id: 'subprocess-collapsed',
    label: '子流程(展开)',
    className: 'bpmn-icon-subprocess-expanded',
    target: {type: 'bpmn:SubProcess', isExpanded: true}
  },
  {
    id: 'subprocess-expanded',
    label: '子流程(折叠)',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {type: 'bpmn:SubProcess', isExpanded: false}
  },
]
const Participant = [
  {
    id: 'participant-collapsed',
    label: '泳池(展开)',
    className: 'bpmn-icon-participant',
    target: {type: 'bpmn:Participant', isExpanded: true}
  },
  {
    id: 'participant-expanded',
    label: '泳池(折叠)',
    className: 'bpmn-icon-lane',
    target: {type: 'bpmn:Participant', isExpanded: false}
  },
]
export default new PanelElements()
