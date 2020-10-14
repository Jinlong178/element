<template>
  <el-container class="container" v-loading="globalLoading"
                element-loading-text="正在加载中..."
                element-loading-background="rgba(0, 0, 0, 0.1)">
    <!-- 顶部导航栏 -->
    <el-header class="header-container" style="padding: 0;" v-if="showHeader">
      <div style="display: flex">
        <div class="header-logo">{{ applicationName }}</div>
      </div>
      <div class="header-ops">
        <div style="display: flex;">
          <!-- 主页 -->
          <a class="btn" title="主页" @click="toHomePage"><i class="el-icon-house"></i></a>
          <!-- 开发阶段API文档 -->
          <a v-if="dev" class="btn" title="查看接口文档" @click="openApiDocs"><i class="el-icon-document-copy"></i></a>
          <!-- 修改密码 -->
          <a class="btn" title="修改密码" @click="openUpdatePasswordDialog"><i class="el-icon-unlock"></i></a>
          <!-- 个人主页 -->
          <a class="btn" title="个人主页" @click="toUserProfilePage"><i class="el-icon-user"></i> {{ user.name }}</a>
          <!-- 焦点模式 -->
          <a class="btn" title="进入焦点模式" @click="enterFocusMode()"><i class="el-icon-full-screen"></i></a>
          <!-- 注销 -->
          <a class="btn" title="注销" @click="logout"><i class="el-icon-switch-button"></i></a>

        </div>
      </div>
      <edit-password-dialog ref="EditPasswordDialog"></edit-password-dialog>
    </el-header>

    <el-container>
      <!-- 侧边导航栏 -->
      <el-aside :width="asideWidth" :style="{height: this.mainHeight}" v-if="showAside">
        <el-container class="aside" v-loading="menuLoading">
          <el-main style="padding: 0; border-right: 1px solid #e6e6e6">
            <el-scrollbar style="height: 100%;">
              <transition name="el-zoom-in-center">
                <el-menu style="height: 100%;"
                         :default-active="$route.path"
                         router
                         :collapse="collapse"><!-- :unique-opened="true" -->
                  <template v-for="(item, key) in menuList">
                    <el-submenu v-if="item.children != null && item.children.length > 0" :index="key.toString()">
                      <template slot="title">
                        <i :class="item.icon" v-if="item.icon != null"></i>
                        <span slot="title">{{ item.name }}</span>
                      </template>
                      <el-menu-item v-for="menuItem in item.children" :index="menuItem.path">{{ menuItem.name }}
                      </el-menu-item>
                    </el-submenu>

                    <el-menu-item v-else :index="item.path">
                      <i :class="item.icon" v-if="item.icon != null"></i>
                      <span slot="title">{{ item.name }}</span>
                    </el-menu-item>
                  </template>
                </el-menu>
              </transition>
            </el-scrollbar>
          </el-main>
          <el-footer class="collapse-footer">
            <el-button class="btn" @click="collapseAside"><i :class="icon"></i></el-button>
          </el-footer>
        </el-container>
      </el-aside>
      <el-main ref="main" :style="mainStyle">
        <!-- 主内容区域 -->
        <router-view :collapsed-aside="collapsedAside" :expanded-aside="expandedAside"></router-view>
      </el-main>
    </el-container>

    <!-- 关闭焦点模式 -->
    <a class="focus-mode-close-button" title="退出焦点模式" v-if="!(showHeader && showAside)" @click="exitFocusMode">
      <i class="el-icon-error"></i>
    </a>
  </el-container>
</template>

<script>
  import {mapState} from 'vuex'
  import EditPasswordDialog from './EditPasswordDialog'
  import app from '../app'

  export default {
    name: 'Index',
    components: {EditPasswordDialog},
    data() {
      return {
        showHeader: true,
        showAside: true,

        globalLoading: false,

        asideWidth: '280px',

        applicationName: app.env.name,
        dev: process.env.NODE_ENV === 'production' ? false : true,

        defaultOpen: [],
        menuList: [],
        collapse: false,
        icon: 'el-icon-d-arrow-left',
        menuLoading: false,
      }
    },
    computed: {
      ...mapState({
        user: state => state.userDetail,
        mainHeight: state => state.mainHeight,
      }),
      mainStyle() {
        return {
          height: this.mainHeight,
          padding: 0,
        }
      }
    },
    mounted() {
      this.$store.dispatch('setMainHeight', 'calc(100vh - 60px)')
      // 获取菜单列表
      this.menuLoading = true
      this.$http.get('/api/user/getMenuList').then(resp => {
        this.menuList = resp.data
        this.menuLoading = false
      }).catch(() => {
        this.menuLoading = false
        this.$message.error('菜单获取失败')
      })
    },
    methods: {
      selectMenuItem(menu) {
        this.menuList = menu.children

        // 没有侧边菜单
        if (this.menuList == null) {
          this.asideWidth = 0
        } else {
          if (this.collapse) {
            this.asideWidth = "65px"
          } else {
            this.asideWidth = "280px"
          }
        }
        // 如果点击的当前菜单是一个可跳转的菜单，页面跳转
        if (menu.path != null && menu.path.length > 0) {
          this.$router.push(menu.path)
        }
      },

      openUpdatePasswordDialog() {
        this.$refs.EditPasswordDialog.visible = true
      },
      toUserProfilePage() {
        this.$router.push({
          name: 'UserProfile',
        })
      },
      toHomePage() {
        this.$router.push({
          name: 'Home',
        })
      },
      logout() {
        this.$confirm('确认注销？', {
          type: 'warning',
          title: '提示'
        }).then(() => {
          this.$store.dispatch('cleanUserDetail')
          this.$notify({
            title: '通知',
            message: '注销成功',
            type: 'success',
            duration: 1000
          });
          this.$router.push({
            path: '/',
          })
        }).catch(() => {

        })
      },

      collapseAside() {
        this.collapse = !this.collapse
        this.icon = this.collapse ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'
        if (this.collapse) {
          this.asideWidth = '65px'
        } else {
          this.asideWidth = '280px'
        }
      },
      // 折叠侧边栏
      collapsedAside() {
        this.collapse = true
        this.icon = 'el-icon-d-arrow-right'
        this.asideWidth = '65px'
      },
      // 展开侧边栏
      expandedAside() {
        this.collapse = false
        this.icon = 'el-icon-d-arrow-left'
        this.asideWidth = '280px'
      },

      enterFocusMode() {
        this.showHeader = false
        this.showAside = false
        this.$store.dispatch('setMainHeight', '100vh')
      },
      exitFocusMode() {
        this.showHeader = true
        this.showAside = true
        this.$store.dispatch('setMainHeight', 'calc(100vh - 60px)')
      },

      // 跳转API文档页面
      openApiDocs() {
        window.open(app.env.baseURL + '/api-docs.html')
      }
    }
  }
</script>

<style lang="less" scoped>
  .container {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    color: #666;

    /* header style */

    .header-container {
      height: 60px;
      color: #fff;
      display: flex;
      justify-content: space-between;
      background-color: #409EFF;

      .header-logo {
        font-size: 20px;
        line-height: 60px;
        min-width: 260px;
        text-align: center;
        padding: 0 10px;
        background-color: #258cf7;
      }

      .header-ops {
        display: flex;
        line-height: 60px;
        /*width: 100%;*/
        justify-content: space-between;
        background-color: #409EFF !important;
      }

      .el-menu--horizontal > .el-menu-item.is-active {
        color: #fff !important;
        border-bottom: 3px solid #2f88cd;
      }

      a.btn {
        height: 60px;
        line-height: 60px;
        display: inline-block;
        padding: 0 10px;
        font-size: 16px;

        &:hover {
          cursor: pointer;
          background-color: #2e79ff;
        }

        &:focus {
          outline: none !important;
        }
      }
    }

    .collapseBtn {
      position: absolute;
      top: 20px;
      left: 280px;
      border: none;
      font-size: 20px;
      background-color: #409EFF;
      color: #fff;
      display: inline-block;
      padding: 0 10px;

      &:hover, &:active, &:focus {
        /*border: 1px solid !important;*/
        opacity: 1;
        background-color: #409EFF;
        color: #fff;
        border: none
      }
    }

    /* aside style */

    .aside {
      height: 100%;
      position: relative;


      .el-menu {
        border-right: none;

        .el-menu-item.is-active {
          color: #409EFF;
          background-color: #d4e6f9;
        }

        .el-menu-item, .el-submenu__title {
          height: 46px !important;
          line-height: 46px !important;;
        }
      }

      .collapse-footer {
        padding: 0;
        height: 39px !important;
        line-height: 39px !important;;
        /*border-top: 1px solid #e6e6e6;*/
        border-right: 1px solid #e6e6e6;
        text-align: right;
        background-color: #f8f8f8;

        .btn {
          height: 100%;
          width: 63px;
          border: none;
          background-color: #e7e7e7;

          &:hover {
            background-color: #D4E6F9;
          }

          &:focus {
            color: #2c3e50;
          }
        }
      }
    }

    .focus-mode-close-button {
      font-size: 50px;
      position: absolute;
      right: 30px;
      bottom: 20px;
      z-index: 2000;

      &:hover {
        cursor: pointer;
        color: orange;
      }
    }
  }
</style>
