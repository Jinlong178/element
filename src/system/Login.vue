<template>
  <div class="gq-background login-page"
       v-loading="loading"
       element-loading-text="正在登录..."
       element-loading-background="rgba(0, 0, 0, 0.1)">
    <el-form :model="form" ref="ruleForm" label-position="left" label-width="0px" class="login-container">
      <p class="title">{{ applicationName }}</p>
      <el-form-item>
        <el-input type="text" clearable v-model="form.username" placeholder="账号"/>
      </el-form-item>
      <el-form-item>
        <el-input type="password" clearable v-model="form.password" placeholder="密码" @keyup.delete.native="form.password = null"/>
      </el-form-item>
      <el-form-item v-if="failNum >= validateNum" :key="failNum">
        <slider-verification-code v-model="validateCode" :is-lock="false">
          <template slot="content">
            请拖动滑块解锁
          </template>
          <template slot="icon">
            <i class="el-icon-d-arrow-right"/>
          </template>
        </slider-verification-code>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="remember">记住我</el-checkbox>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button :disabled="(failNum >= validateNum ? !validateCode : false) || !form.username || !form.password" type="primary"
                   style="width:100%;" @click="login">登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import app from '../app'

  export default {
    name: 'Login',
    data() {
      return {
        applicationName: app.env.name,
        loading: false,
        form: {
          username: null,
          password: null,
        },
        remember: false,

        validateCode: false,

        failNum: 0, // 登录失败次数
        validateNum: 3,   // 达到该值，需要验证滑块
      }
    },
    computed: {
      ...mapState({
        rememberPassword: state => state.rememberPassword,
      }),
    },
    created() {
      document.onkeydown = (e) => {
        let key = null
        if(window.event == undefined){
          key = e.keyCode;
        }else{
          key = window.event.keyCode;
        }
        if(key == 13){
          this.login()
        }
      }
    },
    mounted() {
      this.remember = this.rememberPassword.remember
      this.form.username = this.rememberPassword.username
      const pwd = this.rememberPassword.password
      this.form.password = pwd == null || pwd.length == 0 ? "" : this.$util.base64.decode(pwd)
    },
    methods: {
      login() {
        this.loading = true
        // 获取公钥
        this.$http.get('/api/security/getPublicKey').then(resp => {
          const keyMap = resp.data
          this.$http.post('/api/security/login', {
            username: this.form.username,
            password: this.$util.encrypt(keyMap.value, this.form.password), // 使用公钥加密密码
            keyPairId: keyMap.key,  // 指定密钥对的ID
          }).then(resp => {
            if (resp.success) {
              // 用户信息缓存
              this.$store.dispatch('setUserDetail', resp.data)

              // 记住密码
              this.$store.dispatch('setRememberPassword', {
                remember: this.remember,
                username: this.form.username,
                password: this.$util.base64.encode(this.form.password),
              })

              // 显示登录成功通知
              this.$notify({
                title: '通知',
                message: '登录成功',
                type: 'success',
                duration: 1000
              });

              // 跳转Index页面
              this.$router.push({
                name: 'Index',
              })
            } else {
              this.failNum++
              this.validateCode = false
              this.$message.warning(resp.message)
            }
            this.loading = false
          }).catch(resp => {
            console.error(resp)
            this.failNum++
            this.validateCode = false
            this.$message.warning('登录失败，请联系管理员')
            this.loading = false
          })
        })
      },
    },
  }
</script>

<style lang="less">
  .login-page {
    .login-container {
      background-clip: padding-box;
      width: 350px;
      padding: 25px 25px 10px 25px;
      background: #fff;
    }

    .login-container, .login-container * {
      font-family: '等线';
    }

    .title {
      margin: 0px auto 30px auto;
      text-align: center;
      color: #505458;
      font-size: 22px;
      font-weight: bold;
    }

    .el-form-item {
      margin-bottom: 6px;
    }

    .el-input-group__append {
      padding: 0;
    }

    .slider {
      border: 1px solid #DCDFE6;
    }
  }

  .gq-background {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-image: url("../assets/login-background.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
</style>
