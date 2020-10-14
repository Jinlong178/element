<template>
  <div class="bpm-element trigger-style" :style="dialogStyle">
    <div class="top-title">
      <span class="title">{{title}}</span>
    </div>
    <el-scrollbar class="small">
      <div class="content">
        <span class="info-item" style="margin-top: 0;"><span>信号</span></span>
        <el-select size="small" style="width: 100%;" v-model="scope" placeholder="全局信号">
          <el-option key="global" label="全局信号" value="global"/>
          <el-option key="processInstance" label="当前实例信号" value="processInstance"/>
        </el-select>
        <el-input size="small" v-model="newSignalName">
          <el-button title="保存信号" slot="append" icon="el-icon-check" @click="saveItem('signal')"></el-button>
        </el-input>
        <ul>
          <li v-for="item in triggers.signal">
                          <span>
                            [ {{item.scope === 'global' ? '全局信号' : '当前实例'}} ]
                            <span class="item-name">{{ item.name }}</span>
                          </span>
            <el-button title="删除" type="text" size="small" icon="el-icon-error"
                       @click="deleteItem('signal', item.key)"></el-button>
          </li>
        </ul>

        <span class="info-item"><span>消息</span></span>
        <el-input size="small" v-model="newMessageName">
          <el-button title="保存消息" size="small" slot="append" icon="el-icon-check"
                     @click="saveItem('message')"></el-button>
        </el-input>
        <ul>
          <li v-for="(item, index) in triggers.message">
                    <span>
                      [ 消息 {{ index + 1 }} ] <span class="item-name">{{ item.name }}</span>
                    </span>
            <el-button title="删除" type="text" size="small" icon="el-icon-error"
                       @click="deleteItem('message', item.key)"></el-button>
          </li>
        </ul>

        <span class="info-item"><span>错误</span></span>
        <el-input size="small" v-model="newErrorCode">
          <el-button title="保存错误" size="small" slot="append" icon="el-icon-check"
                     @click="saveItem('error')"></el-button>
        </el-input>
        <ul>
          <li v-for="(item, index) in triggers.error">
                    <span>
                      [ 错误 {{ index + 1 }} ] <span class="item-name">{{ item.errorCode }}</span>
                    </span>
            <el-button title="删除" type="text" size="small" icon="el-icon-error"
                       @click="deleteItem('error', item.key)"></el-button>
          </li>
        </ul>

      </div>
    </el-scrollbar>
  </div>
</template>

<script>
  export default {
    name: "Trigger",
    props: {
      dialogStyle: {
        default: () => {
        }
      },
      triggers: {
        default: {
          signal: [],
          message: [],
          error: [],
        }
      }
    },
    data() {
      return {
        title: '触发参数',
        newSignalName: null,
        scope: 'processInstance',
        newMessageName: null,
        newErrorCode: null,
      }
    },
    methods: {
      saveItem(type) {
        switch (type) {
          case 'signal':
            if (this.newSignalName == null || this.newSignalName.trim().length == 0) return
            this.newSignalName = this.newSignalName.trim()
            for (const item of this.triggers.signal) {
              if (item.key === this.newSignalName) {
                this.newSignalName = null
                return
              }
            }
            this.triggers.signal.push({
              key: this.newSignalName,
              name: this.newSignalName,
              scope: this.scope
            })
            this.newSignalName = null
            this.scope = 'processInstance'
            break
          case 'message':
            if (this.newMessageName == null || this.newMessageName.trim().length == 0) return
            this.newMessageName = this.newMessageName.trim()
            for (const item of this.triggers.message) {
              if (item.key === this.newMessageName) {
                this.newMessageName = null
                return
              }
            }
            this.triggers.message.push({
              key: this.newMessageName,
              name: this.newMessageName
            })
            this.newMessageName = null
            break
          case 'error':
            if (this.newErrorCode == null || this.newErrorCode.trim().length == 0) return
            this.newErrorCode = this.newErrorCode.trim()
            for (const item of this.triggers.error) {
              if (item.key === this.newErrorCode) {
                this.newErrorCode = null
                return
              }
            }
            this.triggers.error.push({
              key: this.newErrorCode,
              errorCode: this.newErrorCode
            })
            this.newErrorCode = null
            break
          default:
            break
        }
      },
      deleteItem(type, key) {
        let idx = -1;
        switch (type) {
          case 'signal':
            for (let i = 0; i < this.triggers.signal.length; i++) {
              const item = this.triggers.signal[i]
              if (item.key == key) {
                idx = i
                break
              }
            }
            this.triggers.signal.splice(idx, 1)
            break
          case 'message':
            for (let i = 0; i < this.triggers.message.length; i++) {
              const item = this.triggers.message[i]
              if (item.key == key) {
                idx = i
                break
              }
            }
            this.triggers.message.splice(idx, 1)
            break
          case 'error':
            for (let i = 0; i < this.triggers.error.length; i++) {
              const item = this.triggers.error[i]
              if (item.key == key) {
                idx = i
                break
              }
            }
            this.triggers.error.splice(idx, 1)
            break
          default:
            break
        }
      }
    },
  }
</script>

<style scoped lang="less">
  .trigger-style {
    .close-def {
      padding: 10px;
    }

    .content {
      * {
        font-size: 12px;
      }

      padding: 5px;

      .info-item {
        display: block;
        margin-top: 10px;
        margin-bottom: 10px;
        color: #eb870c;

        span {
          border-bottom: 1px solid #eb870c;
        }
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 14px;
        font-family: '等线', 'Avenir', Helvetica, Arial, sans-serif !important;

        .item-name {
          padding-left: 10px;
          font-weight: bolder;
        }

        li {
          display: flex;
          justify-content: space-between;
          height: 28px;
          line-height: 28px;
          border: 1px solid #d2d2d2;
          border-radius: 1px;
          margin: 3px 0;
          padding: 0 5px;
          background-color: #F4F4F5;

          &:hover {
            background-color: #eeeeee;
            border: 1px solid #d2d2d2;
            cursor: default;
          }
        }
      }
    }
  }
</style>
