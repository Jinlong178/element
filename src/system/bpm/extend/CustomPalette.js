/* 自定义在元素控制面板设置要显示的元素 */
export default class CustomPalette {
  constructor(create, elementFactory, palette, translate) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const {
      create,
      elementFactory,
      translate
    } = this;

    // 启动事件
    function createStartEvent(event) {
      const shape = elementFactory.createShape({type: 'bpmn:StartEvent'});
      create.start(event, shape);
    }

    // 边界事件
    function createBoundaryEvent(event, a, b) {
      // const shape = elementFactory.createShape({type: 'bpmn:IntermediateCatchEvent'});
      const shape = elementFactory.createShape({type: 'bpmn:BoundaryEvent'});
      create.start(event, shape);
    }

    // 结束事件
    function createEndEvent(event) {
      const shape = elementFactory.createShape({type: 'bpmn:EndEvent'});
      create.start(event, shape);
    }

    // 服务任务
    function createServiceTask(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ServiceTask'});
      create.start(event, shape);
    }

    // 用户任务
    function createUserTask(event) {
      const shape = elementFactory.createShape({type: 'bpmn:UserTask'});
      create.start(event, shape);
    }

    // 排他网关
    function createExclusiveGateway(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ExclusiveGateway'});
      create.start(event, shape);
    }

    // 并行网关
    function createParallelGateway(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ParallelGateway'});
      create.start(event, shape);
    }

    // 包容网关
    function createInclusiveGateway(event) {
      const shape = elementFactory.createShape({
        type: 'bpmn:InclusiveGateway',
      });
      create.start(event, shape);
    }

    // 子流程
    function createSubProcess(event) {
      const shape = elementFactory.createShape({type: 'bpmn:SubProcess', isExpanded: !0});
      create.start(event, shape);
    }

    // 调用流程
    function createCallActivity(event) {
      const shape = elementFactory.createShape({type: 'bpmn:CallActivity'});
      create.start(event, shape);
    }

    // 脚本任务
    function createScriptTask(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ScriptTask'});
      create.start(event, shape);
    }

    // 手工任务
    function createManualTask(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ManualTask'});
      create.start(event, shape);
    }

    // 邮件任务
    function createSendTask(event) {
      const shape = elementFactory.createShape({type: 'bpmn:SendTask'});
      create.start(event, shape);
    }

    // 接收任务
    function createReceiveTask(event) {
      const shape = elementFactory.createShape({type: 'bpmn:ReceiveTask'});
      create.start(event, shape);
    }

    // 文本注释
    function createTextAnnotation(event) {
      const shape = elementFactory.createShape({type: 'bpmn:TextAnnotation'});
      create.start(event, shape);
    }

    return {
      // 开始事件
      'create.start-event': {
        group: 'event',
        className: 'bpmn-icon-start-event-none',
        title: translate('创建 开始事件'),
        action: {
          dragstart: createStartEvent,
          click: createStartEvent
        }
      },
      // 边界事件
      'create.intermediate-event': {
        group: 'event',
        className: 'bpmn-icon-intermediate-event-none',
        title: translate('创建 边界事件'),
        action: {
          dragstart: createBoundaryEvent,
          click: createBoundaryEvent
        }
      },
      // 结束事件
      'create.end-event': {
        group: 'event',
        className: 'bpmn-icon-end-event-none',
        title: translate('创建 结束事件'),
        action: {
          dragstart: createEndEvent,
          click: createEndEvent
        }
      },
      // 用户任务
      'create.task': {
        group: 'activity',
        className: 'bpmn-icon-user-task',
        title: translate('创建 用户任务'),
        action: {
          dragstart: createUserTask,
          click: createUserTask
        }
      },
      // 服务任务
      'create.subprocess-expanded': {
        group: 'activity',
        className: 'bpmn-icon-service-task',
        title: translate('创建 服务任务'),
        action: {
          dragstart: createServiceTask,
          click: createServiceTask
        }
      },
      // 脚本任务
      'create.script-task': {
        group: 'activity',
        className: 'bpmn-icon-script-task',
        title: translate('创建 脚本任务'),
        action: {
          dragstart: createScriptTask,
          click: createScriptTask
        }
      },
      // 手工任务
      'create.manual-task': {
        group: 'activity',
        className: 'bpmn-icon-manual-task',
        title: translate('创建 手工任务'),
        action: {
          dragstart: createManualTask,
          click: createManualTask
        }
      },
      // 调用流程
      'create.call-activity': {
        group: 'activity',
        className: 'bpmn-icon-call-activity',
        title: translate('创建 调用流程'),
        action: {
          dragstart: createCallActivity,
          click: createCallActivity
        }
      },
      // 子流程
      'create.subprocess': {
        group: 'activity',
        className: 'bpmn-icon-subprocess-expanded',
        title: translate('创建 子流程'),
        action: {
          dragstart: createSubProcess,
          click: createSubProcess
        }
      },
      // 邮件任务
      'create.send-task': {
        group: 'activity',
        className: 'bpmn-icon-send-task',
        title: translate('创建 邮件任务'),
        action: {
          dragstart: createSendTask,
          click: createSendTask
        }
      },
      // 接收任务
      'create.receive-task': {
        group: 'activity',
        className: 'bpmn-icon-receive-task',
        title: translate('创建 接收任务'),
        action: {
          dragstart: createReceiveTask,
          click: createReceiveTask
        }
      },
      // 排他网关
      'create.exclusive-gateway-real': {
        group: 'activity',
        className: 'bpmn-icon-gateway-xor',
        title: translate('创建 排他网关'),
        action: {
          dragstart: createExclusiveGateway,
          click: createExclusiveGateway
        }
      },
      // 并行网关
      'create.parallel-gateway': {
        group: 'activity',
        className: 'bpmn-icon-gateway-parallel',
        title: translate('创建 并行网关'),
        action: {
          dragstart: createParallelGateway,
          click: createParallelGateway
        }
      },
      // 包容网关
      'create.inclusive-gateway': {
        group: 'activity',
        className: 'bpmn-icon-gateway-or',
        title: translate('创建 包容网关'),
        action: {
          dragstart: createInclusiveGateway,
          click: createInclusiveGateway
        }
      },
      // 文本注释
      'create.text-annotation': {
        group: 'artifacts',
        className: 'bpmn-icon-text-annotation',
        title: translate('创建 文本注释'),
        action: {
          dragstart: createTextAnnotation,
          click: createTextAnnotation
        }
      },
    }
  }
}

CustomPalette.$inject = [
  'create',
  'elementFactory',
  'palette',
  'translate'
]
