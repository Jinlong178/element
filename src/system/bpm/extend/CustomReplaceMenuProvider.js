import PopupMenuProvider from 'diagram-js/lib/features/popup-menu/PopupMenuProvider';
import panelElements from './PanelElements'

import inherits from 'inherits';

function CustomReplaceMenuProvider(popupMenu, modeling, moddle, bpmnReplace, rules, translate) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;
  this._bpmnReplace = bpmnReplace;
  this._rules = rules;
  this._translate = translate;
  this.register();
}

inherits(CustomReplaceMenuProvider, PopupMenuProvider);

CustomReplaceMenuProvider.$inject = ['popupMenu', 'modeling', 'moddle', 'bpmnReplace', 'rules', 'translate'];

CustomReplaceMenuProvider.prototype.getEntries = function (element) {
  const entries = panelElements.getEntries(element)
  if (entries != null && entries.length > 0) {
    for (const item of entries) {
      item.action = () => {
        this._bpmnReplace.replaceElement(element,item.target)
      }
    }
  }
  return entries;
}

CustomReplaceMenuProvider.prototype.getHeaderEntries = function (element) {
  return [];
}

CustomReplaceMenuProvider.prototype.register = function () {
  this._popupMenu.registerProvider('bpmn-replace', this);
}

export default CustomReplaceMenuProvider


