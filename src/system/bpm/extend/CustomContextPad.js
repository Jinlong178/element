/* 自定义选择后续元素面板 */
export default class CustomContextPad {
  constructor(config, eventBus, contextPad, create, elementFactory, injector, translate) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    if (config.autoPlace !== false) {
      this.autoPlace = injector.get('autoPlace', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const {
      autoPlace,
      create,
      elementFactory,
      translate
    } = this;

    if (contained(element, ['bpmn:EndEvent', 'bpmn:TextAnnotation',
        'bpmn:DataStoreReference', 'bpmn:DataObjectReference', 'bpmn:Group',
        'bpmn:DataInputAssociation', 'bpmn:DataOutputAssociation', 'bpmn:Association',
        'bpmn:Participant', 'bpmn:Collaboration', 'bpmn:SequenceFlow', 'bpmn:MessageFlow', 'bpmn:Lane'])
      || hasContained(element, 'bpmn:IntermediateThrowEvent', 'bpmn:LinkEventDefinition')) {
      return []
    }

    // Label类型
    if (element.type === 'label') {
      return []
    }

    // 排他网关
    function appendExclusiveGateway(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:ExclusiveGateway'});
        autoPlace.append(element, shape);
      } else {
        appendExclusiveGatewayStart(event, element);
      }
    }

    function appendExclusiveGatewayStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ExclusiveGateway'});
      create.start(event, shape, element);
    }

    // 并行网关
    function appendParallelGateway(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:ParallelGateway'});
        autoPlace.append(element, shape);
      } else {
        appendParallelGatewayStart(event, element);
      }
    }

    function appendParallelGatewayStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ParallelGateway'});
      create.start(event, shape, element);
    }

    // 包容网关
    function appendInclusiveGateway(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:InclusiveGateway'});
        autoPlace.append(element, shape);
      } else {
        appendInclusiveGatewayStart(event, element);
      }
    }

    function appendInclusiveGatewayStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ParallelGateway'});
      create.start(event, shape, element);
    }

    // 服务任务
    function appendServiceTask(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:ServiceTask'});
        autoPlace.append(element, shape);
      } else {
        appendServiceTaskStart(event, element);
      }
    }

    function appendServiceTaskStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ServiceTask'});
      create.start(event, shape, element);
    }

    // 脚本任务
    function appendScriptTask(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:ScriptTask'});
        autoPlace.append(element, shape);
      } else {
        appendServiceTaskStart(event, element);
      }
    }

    function appendScriptTaskStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ScriptTask'});
      create.start(event, shape, element);
    }

    // 用户任务
    function appendUserTask(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:UserTask'});
        autoPlace.append(element, shape);
      } else {
        appendUserTaskStart(event, element);
      }
    }

    function appendUserTaskStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:UserTask'});
      create.start(event, shape, element);
    }

    // 调用流程
    function appendCallActivity(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:CallActivity'});
        autoPlace.append(element, shape);
      } else {
        appendCallActivityStart(event, element);
      }
    }

    function appendCallActivityStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:CallActivity'});
      create.start(event, shape, element);
    }

    // 文本注释
    function appendTextAnnotation(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:TextAnnotation'});
        autoPlace.append(element, shape);
      } else {
        appendTextAnnotationStart(event, element);
      }
    }

    function appendTextAnnotationStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:TextAnnotation'});
      create.start(event, shape, element);
    }

    // 扩展子流程
    function appendSubProcess(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:SubProcess', isExpanded: !0});
        autoPlace.append(element, shape);
      } else {
        appendSubProcessStart(event, element);
      }
    }

    function appendSubProcessStart(event) {
      const shape = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        isExpanded: !0,
      });
      create.start(event, shape, element);
    }

    // 手工任务
    function appendManualTask(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:ManualTask', isExpanded: !0});
        autoPlace.append(element, shape);
      } else {
        appendManualTaskStart(event, element);
      }
    }

    function appendManualTaskStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ManualTask', isExpanded: !0});
      create.start(event, shape, element);
    }

    // 文本注释
    function appendTextAnnotation(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({type: 'bpmn:TextAnnotation', isExpanded: !0});
        autoPlace.append(element, shape);
      } else {
        appendSubProcessStart(event, element);
      }
    }

    function appendTextAnnotationStart(event) {
      const shape = elementFactory.createShape({type: 'bpmn:TextAnnotation', isExpanded: !0});
      create.start(event, shape, element);
    }

    return {
      'append.gateway': {
        group: 'model',
        className: 'bpmn-icon-gateway-xor',
        title: translate('添加 排他网关'),
        action: {
          click: appendExclusiveGateway,
          dragstart: appendExclusiveGatewayStart
        }
      },
      'append.append-task': {
        group: 'model',
        className: 'bpmn-icon-gateway-parallel',
        title: translate('添加 并行网关'),
        action: {
          click: appendParallelGateway,
          dragstart: appendParallelGatewayStart
        }
      },
      'append.intermediate-event': {
        group: 'model',
        className: 'bpmn-icon-user-task',
        title: translate('添加 用户任务'),
        action: {
          click: appendUserTask,
          dragstart: appendUserTaskStart
        }
      },
      'append.text-annotation': {
        group: 'model',
        className: 'bpmn-icon-service-task',
        title: translate('添加 服务任务'),
        action: {
          click: appendServiceTask,
          dragstart: appendServiceTaskStart
        }
      },
      'append.script-task': {
        group: 'model',
        className: 'bpmn-icon-script-task',
        title: translate('添加 脚本任务'),
        action: {
          click: appendScriptTask,
          dragstart: appendScriptTaskStart
        },
      },
      // 子流程
      'append.subprocess-expanded': {
        group: 'model',
        className: 'bpmn-icon-subprocess-expanded',
        title: translate('添加 子流程'),
        action: {
          click: appendSubProcess,
          dragstart: appendSubProcessStart
        },
      },
      // 调用流程
      'append.call-activity': {
        group: 'model',
        className: 'bpmn-icon-call-activity',
        title: translate('添加 调用流程'),
        action: {
          click: appendCallActivity,
          dragstart: appendCallActivityStart
        }
      },
      'append.text-annotation-real': {
        group: 'model',
        className: 'bpmn-icon-text-annotation',
        title: translate('添加 文本注释'),
        action: {
          click: appendTextAnnotation,
          dragstart: appendTextAnnotationStart
        }
      },
    }
  }
}

function contained(element, types = []) {
  for (const type of types) {
    if (is$1(element, type)) return true
  }
  return false
}

function hasContained(element, parentType, currentType) {
  var bo = getBusinessObject(element)
  var eventDefinition = bo.eventDefinitions && bo.eventDefinitions[0];
  if (eventDefinition == null) return false
  return (bo.$type === parentType) && (eventDefinition.$type === currentType)
}


function is$1(element, type) {
  var bo = getBusinessObject(element);
  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}

function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

CustomContextPad.$inject = [
  'config',
  'eventBus',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate'
];
