<template>
  <el-drawer
    title="任务流转历史"
    size="500px"
    :modal-append-to-body="false"
    :visible.sync="visible"
    direction="rtl">
    <div style="height: calc(100vh - 76px); overflow-y: auto;">
      <el-scrollbar class="medium">
        <el-timeline style="padding: 0 20px;">
          <el-timeline-item
            v-for="item in migrates"
            :icon="getNodeIcon(item)"
            :type="getNodeType(item)"
            :timestamp="convertType(item) + ' ' + item.createTime" placement="top">
            <p v-if="item.ownerName !== item.assigneeName">拥有人：{{ item.ownerName }}</p>
            <p>受理人：{{ item.assigneeName }}</p>
            <div v-if="item.proxyUserList != null && item.proxyUserList.length > 0">
              <div>
                <p>代理设置：</p>
                <ul style="list-style: none;">
                  <li style="line-height: 26px">{{ (item.proxyUserList.length > 1 ? '1. ' : '') + item.assigneeName +
                    '（' + item.proxyUserList[0].name + '）' }}
                  </li>
                  <li style="line-height: 26px" v-if="index < item.proxyUserList.length - 1"
                      v-for="(user, index) in item.proxyUserList">{{ index + 2 + '. ' + user.name + ((index + 1 <
                    item.proxyUserList.length) ? '（' + item.proxyUserList[index + 1].name + '）' : '') }}
                  </li>
                </ul>
              </div>
              <p>办理人：{{ item.proxyUserList[item.proxyUserList.length - 1].name }}</p>
            </div>
            <p v-if="item.comment != null && item.comment.length > 0">批注：{{ item.comment }}</p>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: "TaskMigrateListDialog",
    data() {
      return {
        visible: false,
        migrates: [],
        migrateId: null,
        task: null,
      }
    },
    watch: {
      task(value) {
        if (value != null) {
          this.migrateId = value.migrateId
          const list = value.migrates;
          for (let i = list.length - 1; i >= 0; i--) {
            this.migrates.push(list[i])
          }
        }
      }
    },
    computed: {
      ...mapState({
        user: state => state.userDetail
      })
    },
    methods: {
      convertType(item) {
        if (item.type === 'PROXY') {
          return '代理'
        } else if (item.type === 'DELEGATE') {
          return '委托'
        } else if (item.type === 'TRANSFER') {
          return '转办'
        } else {
          return item.type
        }
      },
      getNodeIcon(item) {
        if (this.migrateId == item.id) {
          return 'el-icon-right'
        }
        if (item.state === 'DELETED') {
          return 'el-icon-sort'
        }
        return 'el-icon-check'
      },
      getNodeType(item) {
        if (this.migrateId == item.id) {
          return 'success'
        }
        if (item.state === 'DELETED') {
          return 'warning'
        }
        if (item.state != null) {
          return 'primary'
        }
        return 'default'
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-card {
    position: relative;

    p {
      margin: 0;
      height: 26px;
      line-height: 26px;
    }

    .type {
      position: absolute;
      padding: 20px 20px 0 0;
      top: 0;
      right: 0;
    }
  }
</style>
