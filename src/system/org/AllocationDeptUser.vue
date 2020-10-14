<template>
  <el-dialog :title="dept.name" :visible.sync="visible" width="80%" top="5vh"
             @open="openDialog"
             @close="confirm"
             :close-on-click-modal="false"
             :close-on-press-escape="false">
    <div style="height: 65vh;overflow: auto;">
      <el-container style="height: 100%;">
        <el-aside width="30%" style="border-right: 1px solid #E6E6E6">
          <pm-layout :breadcrumbs="['组织机构']">
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
          <pm-layout :breadcrumbs="['用户']">
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
                </el-form>
                <el-button @click="loadUserDialogTable" size="small" icon="el-icon-search"></el-button>
              </section>
              <el-table :data="tableData" border highlight-current-row style="width: 100%">
                <el-table-column type="index" width="50"/>
                <el-table-column prop="name" label="姓名"/>
                <el-table-column prop="id" label="账号"/>
                <el-table-column label="操作" width="130">
                  <template slot-scope="scope">
                    <el-button v-if="!scope.row.isDeptDirect" type="text" size="small" @click="allocation(scope.row)">
                      分配到组织机构
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
      </el-container>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="default" size="small" @click="confirm">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
  const rootNodeId = '-plmko09ijnbhu87ygvcft65rdx'
  export default {
    name: 'AllocationDeptUser',
    components: {},
    data() {
      return {
        visible: false,
        dept: {id: null, name: null},

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
      this.loadUserDialogTable()
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
      openDialog() {
        this.loadUserDialogTable()
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
        this.loadUserDialogTable()
      },

      /**
       * 加载用户数据表格
       */
      loadUserDialogTable() {
        this.tableLoading = true
        this.$http.get('/api/dept/rel/user/getUserList', {
          deptId: this.currentDept == null ? null : (this.currentDept.id == rootNodeId ? null : this.currentDept.id),
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          userName: this.condition.name,
          userId: this.condition.userId,
          type: this.condition.type,
          state: this.condition.state,
          cascade: true,
          directDeptId: this.dept.id
        }).then(resp => {
          this.totalElements = resp.data.totalElements
          this.tableData = resp.data.content
          this.tableLoading = false
        })
      },
      // 分页信息
      sizeChange(data) {
        this.pageSize = data
        this.loadUserDialogTable()
      },
      pageChange(data) {
        this.currentPage = data
        this.loadUserDialogTable()
      },

      /**
       * 分配到组织机构
       */
      allocation(user) {
        this.$http.post('/api/dept/rel/user/save/' + this.dept.id + '/' + user.id).then(resp => {
          if (resp.success) {
            this.$message.success('分配成功')
            this.loadUserDialogTable()
          } else {
            this.$message.error(resp.message)
          }
        }).catch(() => {
          this.$message.error('分配失败')
        })
      },
      confirm() {
        this.visible = false
        this.condition = {
          name: null,
          userId: null,
          type: 'USER',
          state: null,
        }
        this.$emit('on-success')
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
