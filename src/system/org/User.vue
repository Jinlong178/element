<template>
  <el-container style="height: 100%;">
    <el-aside width="30%" style="border-right: 1px solid #E6E6E6">
      <pm-layout :breadcrumbs="['组织机构', '用户列表']">
        <section slot="content">
          <el-tree class="dept-tree" highlight-current
                   lazy
                   :load="lazyLoadDeptTree"
                   node-key="id"
                   :props="{label: 'name', isLeaf: 'leaf'}"
                   :default-expanded-keys="defaultExpandedKeys"
                   :expand-on-click-node="false"
                   @node-click="nodeClick"/>
        </section>
      </pm-layout>
    </el-aside>
    <el-main style="padding: 0;">
      <pm-layout>
        <section slot="tools">
          <el-button type="primary" size="small" @click="create">
            <i class="el-icon-plus"></i> 新建
          </el-button>
        </section>
        <section slot="content" style="padding: 5px;" v-loading="tableLoading">
          <!-- 查询条件 -->
          <section class="table-condition">
            <el-form :inline="true" size="small" label-position="right">
              <el-form-item label="姓名">
                <el-input v-model="condition.name" clearable/>
              </el-form-item>
              <el-form-item label="账号">
                <el-input v-model="condition.userId" clearable/>
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="condition.type" clearable filterable placeholder="所有类型" style="width: 100%;">
                  <el-option key="USER" label="个人账号" value="USER"/>
                  <el-option key="DEPT" label="组织机构账号" value="DEPT"/>
                </el-select>
              </el-form-item>
            </el-form>
            <el-button @click="loadUserTable" size="small" icon="el-icon-search"></el-button>
          </section>
          <el-table :data="tableData" border highlight-current-row style="width: 100%">
            <el-table-column type="index" width="50"/>
            <el-table-column prop="name" label="姓名"/>
            <el-table-column prop="id" label="账号"/>
            <el-table-column prop="type" label="类型" width="105">
              <template slot-scope="scope">
                <span v-if="scope.row.type == 'USER'">个人账号</span>
                <span v-if="scope.row.type == 'DEPT'">组织机构账号</span>
              </template>
            </el-table-column>
            <el-table-column label="标签" width="60">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.isDeptDirect" type="'success'" size="mini" disable-transitions>直属</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160">
              <template slot-scope="scope">
                <el-button v-if="scope.row.state == 'N'" type="text" size="small" @click="resetPassword(scope.row)">
                  重置密码
                </el-button>
                <el-button v-if="scope.row.state == 'N'" type="text" size="small" @click="update(scope.row)">编辑
                </el-button>
                <el-button v-if="scope.row.state == 'N' && scope.row.type != 'DEPT' && scope.row.id != 'admin'"
                           type="text" size="small" @click="remove(scope.row)">删除
                </el-button>
                <el-button v-if="scope.row.state == 'F'" type="text" size="small" @click="enable(scope.row)">启用
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
            :page-sizes="[50, 100, 300, 500]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next"
            :total="totalElements">
          </el-pagination>
        </section>
      </pm-layout>
    </el-main>
    <user-form-dialog ref="UserFormDialog" @on-success="loadUserTable"></user-form-dialog>
  </el-container>
</template>

<script>
  import UserFormDialog from './UserFormDialog'

  const rootNodeId = '-plmko09ijnbhu87ygvcft65rdx'
  export default {
    name: 'User',
    components: {UserFormDialog},
    data() {
      return {
        tableLoading: false,
        tableData: null,

        currentDept: null,

        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 50,

        condition: {
          name: null,
          userId: null,
          type: 'USER',
          state: 'N',
        },

        defaultExpandedKeys: [rootNodeId],  // 组织机构树这个节点的KEY
        expandedLevel: 1, //展开级别
      }
    },
    mounted() {
      this.loadUserTable()
    },
    methods: {
      lazyLoadDeptTree(node, resolve) {
        if (node.level === 0) {
          this.$http.get('/api/dept/getChildren', {
            parentId: null
          }).then(resp => {
            return resolve([{
              id: rootNodeId,
              name: '组织机构树',
              leaf: resp.data == null || resp.data.length == 0,
              children: resp.data
            }]);
          })
        } else {
          if (node.data.leaf) {
            return resolve([]);
          } else {
            this.$http.get('/api/dept/getChildren', {
              parentId: node.data.id == rootNodeId ? null: node.data.id
            }).then(resp => {
              if (node.level <= this.expandedLevel) {
                for (const item of resp.data) {
                  this.defaultExpandedKeys.push(item.id)
                }
              }
              return resolve(resp.data);
            })
          }
        }
      },
      nodeClick(data) {
        this.currentDept = data
        this.condition = {
          name: null,
          userId: null,
          type: 'USER',
          state: null,
        }
        this.currentPage = 1
        this.loadUserTable()
      },

      /**
       * 加载用户数据表格
       */
      loadUserTable() {
        this.tableLoading = true
        this.$http.get('/api/dept/rel/user/getUserList', {
          deptId: this.currentDept == null ? null : (this.currentDept.id == rootNodeId ? null : this.currentDept.id),
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          userName: this.condition.name,
          userId: this.condition.userId,
          type: this.condition.type,
          state: this.condition.state,
          directDeptId: this.currentDept == null ? null : this.currentDept.id,
        }).then(resp => {
          this.totalElements = resp.data.totalElements
          this.tableData = resp.data.content
          this.tableLoading = false
        })
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

      /**
       * 新增账号，打开用户信息窗口
       * @param data
       */
      create() {
        this.$refs.UserFormDialog.visible = true
        if (this.currentDept != null) {
          this.$refs.UserFormDialog.defaultDept = this.currentDept.id
        }
      },

      /**
       * 编辑账号，打开用户信息窗口
       * @param data
       */
      update(data) {
        this.$refs.UserFormDialog.visible = true
        this.$refs.UserFormDialog.userId = data.id
      },

      /**
       * 删除账号
       * @param data
       */
      remove(data) {
        this.$confirm('此操作将删除用户 [ ' + data.name + ' ]，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/user/remove/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('用户删除成功')
              this.loadUserTable()
            } else {
              this.$message.error(resp.message)
            }
            this.tableLoading = false
          }).catch(() => {
            this.tableLoading = false
            this.$message.error('删除失败')
          })
        })
      },

      /**
       * 启用账号
       * @param data
       */
      enable(data) {
        this.$confirm('此操作将启用用户 [ ' + data.name + ' ] ，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/user/enable/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('用户启用成功')
              this.loadUserTable()
            } else {
              this.$message.error(resp.message)
            }
            this.tableLoading = false
          }).catch(() => {
            this.tableLoading = false
            this.$message.error('启用失败')
          })
        })
      },

      /**
       * 重置密码
       * @param data
       */
      resetPassword(data) {
        this.$confirm('此操作将重置账号 [ ' + data.name + ' ] 的密码为初始密码，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.$http.post('/api/user/resetPassword/' + data.id).then(resp => {
            if (resp.success) {
              this.$message.success('密码重置成功')
            } else {
              this.$message.error(resp.message)
            }
          }).catch(() => {
            this.$message.error('密码重置失败')
          })
        })
      }
    },
  }
</script>

<style lang="less">
  .dept-tree.el-tree > .el-tree-node > .el-tree-node__content {
    background-color: #F5F5F5;
    font-style: italic;
  }
</style>
