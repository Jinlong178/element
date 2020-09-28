<template>
  <pm-bpm :on-settings="getSettings">
    <el-form :model="form"
             v-loading="loading"
             size="small"
             style="margin: 20px auto; padding: 0 30%;"
             label-position="right"
             label-width="80px">
      <el-form-item label="申请人">
        <el-input v-model="form.applyUserName"/>
      </el-form-item>
      <el-form-item label="权限用户">
        <el-input v-model="form.userList"/>
      </el-form-item>
    </el-form>
  </pm-bpm>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: "ExampleForm",
    data() {
      return {
        loading: false,
        form: {
          applyUserName: null,
          userList: null,
        },
      }
    },
    computed: {
      ...mapState({
        user: state => state.userDetail
      }),
    },
    methods: {
      getSettings() {
        return {
          complete: (t, p, f) => {
            p.persistentMap.form = this.form
            p.expressionMap.result = 1
            f()
          },
          operations: (t, p, s) => {
            const arr = [];
            if (t.key === 'UserTask_1nb7uiz') {
              arr.push({
                name: '执行用户任务1',
                before() {
                  p.comment = "哇哈哈哈"
                }
              }, {
                name: '执行服务任务'
              })
            }
            return arr;
          },
        }
      }
    }
  }
</script>

<style scoped>

</style>
