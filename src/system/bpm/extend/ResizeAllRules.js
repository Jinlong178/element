import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import inherits from 'inherits';


function ResizeAllRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(ResizeAllRules, RuleProvider);

ResizeAllRules.$inject = ['eventBus'];


ResizeAllRules.prototype.init = function () {
  this.addRule('shape.resize', 1500, (e) => {
    // 连线不能resize
    const type = e.shape.type
    if (type == 'label' || type === 'bpmn:SequenceFlow' || type === 'bpmn:Association' || type === 'bpmn:DataInputAssociation'
      || type === 'bpmn:DataOutputAssociation' || type === 'bpmn:MessageFlow'
      || type === 'bpmn:BoundaryEvent' || type === 'bpmn:IntermediateCatchEvent' || type === 'bpmn:IntermediateThrowEvent'
      || type === 'bpmn:StartEvent' || type === 'bpmn:EndEvent'
      || type === 'bpmn:ExclusiveGateway' || type === 'bpmn:InclusiveGateway' || type === 'bpmn:ParallelGateway') {
      return false
    }
    return true;
  });
}

export default ResizeAllRules
