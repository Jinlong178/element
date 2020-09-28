<template>
  <el-dialog title="选择下一环节办理人" :visible.sync="visible" width="70%">
    <el-table height="50vh"
              :data="tableDataList"
              border
              stripe
              style="width: 100%;"
              @selection-change="selectionChange"
              v-loading="tableLoading">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="name" label="姓名"/>
      <el-table-column prop="id" label="用户名"/>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取 消</el-button>
      <el-button type="primary" size="small" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    name: "SelectCandidateDialog",
    data() {
      return {
        tableDataList: [],
        processInstanceId: null,
        processDefinitionId: null,
        meta: null,

        multipleSelection: [],

        tableLoading: false,
        visible: false,
        callback: null
      }
    },
    watch: {
      visible(value) {
        this.tableDataList = []
        if (value) this.loadList()
      }
    },
    methods: {
      loadList() {
        this.tableLoading = true
        this.$http.get('/api/bpm/query/getNextHandlerList/' + this.processDefinitionId + '/' + this.processInstanceId + '/' + this.meta.lineKey).then(resp => {
          const datas = resp.data
          if (datas == null || datas.length == 0) return

          for (const item of datas) {
            // item.nextNodeName
            for (const user of item.candidates) {
              this.tableDataList.push({
                id: user.id,
                name: user.name
              })
            }
          }

          this.tableLoading = false
        })
      },
      cancel() {
        this.visible = false
      },
      confirm() {
        if (this.multipleSelection.length == 0) {
          this.$confirm('尚未选择任何用户，是否继续提交任务?', '提示', {
            confirmButtonText: '提交',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            if (this.callback) this.callback(null)
            this.visible = false
          }, reason => {
          }).catch(reason => console.error(reason))
        } else {
          const nextHandlers = []
          for (const item of this.multipleSelection) {
            nextHandlers.push(item.id)
          }
          this.$confirm('即将提交该任务, 是否继续?', '提示', {
            confirmButtonText: '提交',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            if (this.callback) this.callback(nextHandlers)
            this.visible = false
          }, reason => {
          }).catch(reason => console.error(reason))
        }
      },
      selectionChange(value) {
        this.multipleSelection = value;
      }
    }
  }
</script>

<style scoped>

</style>
