<template>
  <el-container style="height: 100%;">
    <el-aside width="25%" style="border-right: 1px solid #E6E6E6">
      <pm-layout :breadcrumbs="['权限信息', '授权管理']">
        <section slot="content" v-loading="roleTreeLoading">
          <el-tree ref="roleTree"
                   default-expand-all
                   highlight-current
                   :data="roleTreeData"
                   :expand-on-click-node="false"
                   node-key="id"
                   @node-click="roleNodeClick">
          </el-tree>
        </section>
      </pm-layout>
    </el-aside>
    <!-- 分配权限 -->
    <el-main style="padding: 0;">
      <pm-layout :breadcrumbs="breadcrumbs">
        <section slot="tools">
          <el-button v-if="showForm && !isDeptAdmin && activeName == 'user'" size="small" type="primary"
                     @click="allocationRoleUser">
            <i class="el-icon-plus"></i> 分配用户到角色
          </el-button>
          <el-button v-if="showForm && activeName == 'menu'" type="primary" size="small" @click="allocationRoleMenu">
            <i class="el-icon-check"></i> 保存菜单到角色
          </el-button>
          <el-button v-if="showForm && activeName == 'fn'" type="primary" size="small" @click="allocationRoleFn">
            <i class="el-icon-check"></i> 保存功能到角色
          </el-button>
        </section>
        <section slot="content" v-if="showForm">
          <template>
            <el-tabs v-model="activeName" type="card">
              <el-tab-pane label="分配用户" name="user" style="padding: 5px" v-loading="userTableLoading">
                <section class="table-condition">
                  <el-form :inline="true" size="small" label-position="right">
                    <el-form-item label="姓名">
                      <el-input v-model="condition.userName" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="账号">
                      <el-input v-model="condition.userId" clearable></el-input>
                    </el-form-item>
                  </el-form>
                  <el-button @click="loadUserTable" size="small" icon="el-icon-search"></el-button>
                </section>
                <el-table :data="tableData" border highlight-current-row style="width: 100%">
                  <el-table-column prop="name" label="姓名"/>
                  <el-table-column prop="id" label="账号"/>
                  <el-table-column label="操作" width="80">
                    <template slot-scope="scope">
                      <el-button type="text" v-if="!(isDeptAdmin || itsAdminUser(scope.row))" size="small"
                                 @click="removeRoleUser(scope.row)">解除关系
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-pagination
                  :pager-count="5"
                  background
                  @size-change="sizeChange"
                  @current-change="pageChange"
                  :current-page="currentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="pageSize"
                  layout="total, sizes, prev, pager, next"
                  :total="totalElements">
                </el-pagination>
              </el-tab-pane>
              <el-tab-pane label="分配菜单" name="menu" v-loading="menuTreeLoading">
                <el-tree ref="menuTree" node-key="id"
                         :data="menuTreeData"
                         show-checkbox></el-tree>
              </el-tab-pane>
              <el-tab-pane label="分配功能" name="fn" v-loading="fnTreeLoading">
                <el-tree ref="fnTree" node-key="id"
                         :data="fnTreeData"
                         show-checkbox></el-tree>
              </el-tab-pane>
            </el-tabs>
          </template>
        </section>
      </pm-layout>
    </el-main>
    <allocation-role-user ref="AllocationRoleUser" @on-success="loadUserTable"/>
  </el-container>
</template>

<script>
  import AllocationRoleUser from "./AllocationRoleUser";

  export default {
    name: 'Auth',
    components: {AllocationRoleUser},
    data() {
      return {
        roleTreeData: null,
        roleTreeLoading: false,

        selectedRole: null,
        isDeptAdmin: false,
        isAdminUser: false,

        showForm: false,
        menuTreeData: null,
        menuTreeLoading: false,


        tableData: [],
        userTableLoading: false,
        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 10,

        condition: {
          userName: null,
          userId: null,
        },

        breadcrumbs: ['点击角色分配权限'],
        activeName: 'user',

        fnTreeData: null,
        fnTreeLoading: false,
      }
    },
    mounted() {
      this.loadRoleTree()
    },
    methods: {
      loadRoleTree() {
        this.roleTreeLoading = true
        this.$http.get('/api/role/getList').then(resp => {
          if (resp.data != null && resp.data.length > 0) {
            for (const d of resp.data) {
              d.label = d.name
            }
            this.roleTreeData = resp.data

            if (this.selectedRole != null) {
              for (const item of this.roleTreeData) {
                if (item.id == this.selectedRole.id) {
                  this.selectedRole = item
                  break
                }
              }
              this.roleNodeClick(this.selectedRole)
            }

          }
          this.roleTreeLoading = false
        })
      },
      roleNodeClick(data) {
        this.showForm = true
        this.selectedRole = data
        this.breadcrumbs = [this.selectedRole.name]
        this.activeName = 'user'
        this.isDeptAdmin = this.itsDeptAdmin(data)
        this.currentPage = 1
        this.loadMenuTree()
        this.loadUserTable()
        this.loadFnTree()
      },
      itsDeptAdmin(data) {
        return data.id === 'ROLE_DEPT_ADMIN'
      },
      itsAdminUser(data) {
        return data.id === 'admin'
      },
      isSystemData(data) {
        const arr = ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_DEPT_ADMIN']
        return arr.indexOf(data.id) < 0
      },
      isSystemRole() {
        return this.isSystemData(this.selectedRole)
      },

      // 分配资源
      loadMenuTree() {
        this.menuTreeLoading = true
        this.$http.get('/api/role/rel/menu/tree', {
          roleId: this.selectedRole.id,
        }).then(resp => {
          this.menuTreeData = this.translateDataToTree(resp.data, 2)
          const arr = []
          for (const t of resp.data) {
            if (t.checked) arr.push(t.id)
          }
          this.$refs.menuTree.setCheckedKeys(arr)
          this.menuTreeLoading = false
        })
      },
      allocationRoleMenu() {
        this.menuTreeLoading = true
        // 获取已勾选的菜单
        const menuIds = []
        const selectedNodes = this.$refs.menuTree.getCheckedNodes()
        if (selectedNodes != null && selectedNodes.length > 0) {
          for (const node of selectedNodes) {
            menuIds.push(node.id)
          }
        }

        this.$http.post('/api/role/rel/menu/save', {
          roleId: this.selectedRole.id,
          menuIds: menuIds,
        }).then(resp => {
          if (resp.success) {
            this.$message.success('操作成功')
          } else {
            this.$message.error(resp.message)
          }
          this.menuTreeLoading = false
        })
      },

      // 分配用户
      loadUserTable() {
        this.userTableLoading = true
        this.$http.get('/api/role/rel/user/getUserList/' + this.selectedRole.id, {
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          userName: this.condition.userName,
          userId: this.condition.userId,
        }).then(resp => {
          this.totalElements = resp.data.totalElements
          this.tableData = resp.data.content
          this.userTableLoading = false
        })
      },
      removeRoleUser(data) {
        this.$confirm('此操作将解除该用户与角色的关联，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.userTableLoading = true
          this.$http.post('/api/role/rel/user/remove/' + this.selectedRole.id + '/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('用户删除成功')
              this.loadUserTable()
            } else {
              this.$message.error(resp.message)
            }
            this.userTableLoading = false
          }).catch(() => {
            this.userTableLoading = false
            this.$message.error('删除失败')
          })
        })
      },
      allocationRoleUser() {
        if (this.selectedRole == null) {
          this.$message.error('请先选择一个角色')
          return
        }
        this.$refs.AllocationRoleUser.visible = true
        this.$refs.AllocationRoleUser.role = this.selectedRole
      },
      // 分页信息
      sizeChange(data) {
        this.pageSize = data
        this.loadUserTable()
      },
      pageChange(data) {
        this.currentPage = data
        this.loadUserTable()
      },

      // 功能点
      loadFnTree() {
        this.fnTreeLoading = true
        this.$http.get('/api/role/rel/fn/tree', {
          roleId: this.selectedRole.id,
        }).then(resp => {
          this.fnTreeData = this.translateDataToTree(resp.data, 1000000)
          const arr = []
          for (const t of resp.data) {
            if (t.checked) arr.push(t.id)
          }
          this.$refs.fnTree.setCheckedKeys(arr)
          this.fnTreeLoading = false
        })
      },
      allocationRoleFn() {
        this.fnTreeLoading = true
        // 获取已勾选的菜单
        const fnIds = []
        const selectedNodes = this.$refs.fnTree.getCheckedNodes()
        if (selectedNodes != null && selectedNodes.length > 0) {
          for (const node of selectedNodes) {
            fnIds.push(node.id)
          }
        }

        this.$http.post('/api/role/rel/fn/save', {
          roleId: this.selectedRole.id,
          fnIds: fnIds,
        }).then(resp => {
          if (resp.success) {
            this.$message.success('操作成功')
          } else {
            this.$message.error(resp.message)
          }
          this.fnTreeLoading = false
        })
      },

      translateDataToTree(datas = [], level = 1000000) {
        const results = []
        if (level == 0) return results;

        // 第一级
        for (let i = 0; i < datas.length; i++) {
          const data = datas[i]
          if (data.pid == '' || data.pid == null) {
            data.children = []
            results.push(data)
          }
        }
        if (level == 1) return results;

        let idx = 2;
        // 第二级
        for (let i = 0; i < results.length; i++) {
          const data = results[i]
          for (let j = 0; j < datas.length; j++) {
            const item = datas[j]
            if (data.id === item.pid) {
              data.children.push(item)
              if (idx < level) this.translateChildrenTree(idx, level, datas, item)
            }
          }
        }
        return results
      },
      translateChildrenTree(idx, level, datas, data) {
        idx += 1
        for (let j = 0; j < datas.length; j++) {
          const item = datas[j]
          if (data.id === item.pid) {
            if (data.children == null) data.children = []
            data.children.push(item)
            if (idx < level) this.translateChildrenTree(idx, level, datas, item)
          }
        }
      },
    },

  }
</script>

<style scoped>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
