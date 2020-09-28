import customContextPad from './CustomContextPad'
// import customPalette from './CustomPalette'
import resizeAllRules from './ResizeAllRules'
import customReplaceMenuProvider from './CustomReplaceMenuProvider'

export default {
  __init__: ['customContextPad', 'resizeAllRules', 'customReplaceMenuProvider'],
  customContextPad: ['type', customContextPad], // 自定义上下文面板
  // customPalette: ['type', customPalette], // 自定义元素面板
  resizeAllRules: ['type', resizeAllRules], // 使元素可以调整大小
  customReplaceMenuProvider: ['type', customReplaceMenuProvider], // 自定义元素替换
}
