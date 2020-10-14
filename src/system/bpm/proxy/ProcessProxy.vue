<template>
  <pm-layout :breadcrumbs="['流程代理']">
    <section slot="tools">
      <el-button size="medium" @click="save">提交</el-button>
    </section>
    <section slot="content">
      <el-form :model="form"
               v-loading="loading"
               size="small"
               style="margin: 20px auto; padding: 0 30%;"
               label-position="right"
               label-width="80px">
        <el-form-item label="代理人">
          <el-input v-model="form.proxyUserId"/>
        </el-form-item>
      </el-form>
    </section>
  </pm-layout>
</template>

<script>
  export default {
    name: "ProcessProxy",
    data(){
      return {
        loading: false,
        form: {
          proxyUserId: null
        },
      }
    },
    methods: {
      save() {
        this.$http.post('/api/bpm/proxy/save', {
          proxyUserId: this.form.proxyUserId
        }).then(resp => {
          this.$message.success('提交成功')
        }).catch(response => {
          this.$message.error('提交失败')
        })
      }
    }
  }
</script>

<style scoped>

</style>
