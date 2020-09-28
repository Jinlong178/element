<template>
  <el-dialog title="流程信息"
             :show-close="false"
             :visible.sync="visible"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             top="25vh"
             width="500px">
    <el-form :model="form" size="small" label-position="right" label-width="100px" v-loading="loading">
      <el-form-item label="流程定义KEY">
        <el-input v-model="form.processDefinitionKey" placeholder="必填，流程的唯一标识"/>
      </el-form-item>
      <el-form-item label="流程名称">
        <el-input v-model="form.processDefinitionName" placeholder="必填"/>
      </el-form-item>
      <el-form-item label="所属组">
        <el-select v-model="form.groupId" clearable placeholder="" style="width: 100%;">
          <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="default" size="small" @click="cancel">离 开</el-button>
      <el-button type="primary" size="small" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'ProcessBaseDataDialog',
    data() {
      return {
        visible: false,
        loading: false,
        callback: null,
        form: {
          processDefinitionKey: null,
          processDefinitionName: null,
          groupId: null,
        },

        groupList: null
      }
    },
    mounted() {
      this.loadGroupList()
    },
    methods: {
      loadGroupList() {
        this.$http.get('/api/bpm/group/getList', {
          offset: 0,
          length: -1,
        }).then(resp => {
          this.groupList = resp.data
        })
      },
      cancel() {
        this.$confirm('确认离开流程图编辑器?', '提示', {
          confirmButtonText: '继续离开',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.visible = false
          this.$router.go(-1)
        }, reason => {}).catch(() => {

        });
      },
      confirm() {
        this.loading = true
        if (this.form.processDefinitionKey == null || this.form.processDefinitionKey.trim().length == 0) {
          this.$message.error('流程定义KEY不能为空')
          this.loading = false
          return
        }
        if (!this.$util.validate.isCommon(this.form.processDefinitionKey)) {
          this.$message.error('流程定义KEY只能由字母、数字、下划线组成，且首字符必须是字母')
          this.loading = false
          return
        }
        if (this.form.processDefinitionName == null || this.form.processDefinitionName.trim().length == 0) {
          this.$message.error('流程名称不能为空')
          this.loading = false
          return
        }
        // if (this.form.groupId == null || this.form.groupId.trim().length == 0) {
        //   this.$message.error('所属组不能为空')
        //   this.loading = false
        //   return
        // }
        this.$http.get('/api/bpm/def/containsProcessDefinitionKey/' + this.form.processDefinitionKey).then(resp => {
          if (resp.success) {
            if (resp.data === true) {
              this.$message.error('流程定义KEY已被使用，请重新输入')
            } else {
              // 回调
              this.form.processDefinitionKey = this.form.processDefinitionKey.trim()
              this.form.processDefinitionName = this.form.processDefinitionName.trim()
              this.callback(this.form.processDefinitionKey, this.form.processDefinitionName, this.form.groupId)
              this.visible = false
            }
          } else {
            this.$message.error('流程定义KEY校验失败：' + resp.message)
          }
          this.loading = false
        }).catch(reason => {
          console.error(reason)
          this.$message.error('流程定义KEY校验失败')
          this.loading = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
