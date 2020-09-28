import JsEncrypt from 'jsencrypt'
import {Base64} from 'js-base64'
import MD5 from 'js-md5'

// 校验
const validate = {
  isNumber(value) {
    if ((typeof value == 'number') && value.constructor == Number) return true
    // 字符串类型，但是是数字
    //非负浮点数
    const regPos = /^\d+(\.\d+)?$/;
    //负浮点数
    const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;
    if (regPos.test(value) || regNeg.test(value)) {
      return true;
    }
    return false;
  },
  isPositiveNumber(value) {
    const regPos = /^\d+(\.\d+)?$/;
    if (regPos.test(value)) {
      return true;
    }
    return false;
  },
  isNegativeNumber(value) {
    const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;
    if (regNeg.test(value)) {
      return true;
    }
    return false;
  },
  /**
   * 值为空：null、 ''、length = 0
   * @param value
   * @returns {boolean}
   */
  isEmpty(value) {
    if (value == null) return true
    if ((typeof value == 'string') && value.constructor == String) {
      if (value.trim().length == 0) return true
    }
    if ((typeof value == 'object') && value.constructor == Array) {
      if (value.length == 0) return true
    }
    return false
  },
  /**
   * 字母、数字、下换线组成，首字符必须是字母
   * @param value
   * @returns {boolean}
   */
  isCommon(value) {
    const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
    if (reg.test(value)) {
      return true;
    }
    return false;
  }
}
const date = {
  /**
   * 日期转字符串，格式：yyyy-MM-dd
   */
  dateToString(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate()
    return date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day)
  }
}
const array = {
  /**
   * 移除数组元素
   * @param array 数组数据
   * @param fieldName 属性名称
   * @param value 属性值
   */
  removeItem(array = [], fieldName = null, value = null) {
    if (array == null) return
    let index = -1
    if (fieldName == null) {
      index = array.indexOf(value)
    } else {
      for (const i in array) {
        const item = array[i]
        if (item[fieldName] == value) {
          index = i
          break
        }
      }
    }
    if (index > -1) {
      array.splice(index, 1);
    }
  }
}
const map = {
  /**
   * 深度克隆
   * @param obj
   */
  clone(obj) {
    let newObj = {};
    if (obj instanceof Array) {
      newObj = [];
    }
    if (obj == null) {
      newObj = null
    } else {
      for (const key in obj) {
        const val = obj[key];
        newObj[key] = typeof val === 'object' ? this.clone(val) : val;
      }
    }
    return newObj;
  },
  /**
   * obj 转 Map
   * @param object
   * @returns {Map<any, any>}
   */
  objectToMap(object = {}) {
    const map = new Map()
    for (const item in object) {
      map.set(item, object[item] == undefined ? null : object[item])
    }
    return map
  },
  /**
   * 转Map
   * @param container
   * @param object
   * @returns {Map<any, any>}
   */
  toMap(container = new Map(), object = {}) {
    for (const item in object) {
      container.set(item, object[item])
    }
    return container
  },
  /**
   * Map转obj
   * @param map
   */
  mapToObject(map = new Map()) {
    const object = {}
    const keys = map.keys()
    if (keys == null || keys.length == 0) return object
    for (const key of keys) {
      object[key] = map.get(key)
    }
    return object
  },
  /**
   * 转obj
   * @param container
   * @param map
   */
  toObject(container = {}, map = new Map()) {
    const keys = map.keys()
    if (keys == null || keys.length == 0) return container
    for (const key of keys) {
      container[key] = map.get(key)
    }
    return container
  }
}

/**
 * 非对称加密算法 RSA 公钥加密
 * @param publicKey 公钥
 * @param value 字符串
 * @returns {PromiseLike<ArrayBuffer>}
 */
const encrypt = (publicKey, value) => {
  const en = new JSEncrypt();
  en.setPublicKey(publicKey);
  return en.encrypt(value)
}

/**
 * Base64 编码、解码
 */
const base64 = {
  /**
   * 编码
   * @param value
   */
  encode(value) {
    return Base64.encode(value)
  },
  /**
   * 解码
   * @param value
   */
  decode(value) {
    return Base64.decode(value)
  }
}

/**
 * 单向加密算法 MD5 加密
 * @param value
 */
const md5 = (value) => {
  return MD5(value)
}

/**
 * 获取UUID
 */
const uuid = () => {
  let d = new Date().getTime();
  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now(); //use high-precision timer if available
  }
  const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  })
  return uuid.toUpperCase();
}

export default {
  validate,
  date,
  array,
  map,
  encrypt,
  base64,
  md5,
  uuid,
}
