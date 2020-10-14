<template>
  <el-container style="height: 100%;">
    <el-main style="padding: 0;">
      <pm-layout :breadcrumbs="['组织机构', '直属用户列表', dept.name]">
        <section slot="tools">
          <el-button size="small" type="primary" @click="create">
            <i class="el-icon-plus"></i> 分配直属用户
          </el-button>
          <el-button size="small" type="default" @click="$router.go(-1)">
            <i class="el-icon-back"></i> 返回
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
              <el-form-item label="状态">
                <el-select v-model="condition.state" clearable filterable placeholder="所有状态" style="width: 100%;">
                  <el-option key="N" label="正常" value="N"/>
                  <el-option key="F" label="禁用" value="F"/>
                </el-select>
              </el-form-item>
            </el-form>
            <el-button @click="loadUserTable" size="small" icon="el-icon-search"></el-button>
          </section>
          <el-table :data="tableData" border highlight-current-row style="width: 100%">
            <el-table-column type="index" width="50"/>
            <el-table-column prop="createTime" label="创建时间" width="150"/>
            <el-table-column prop="name" label="姓名"/>
            <el-table-column prop="id" label="账号"/>
            <el-table-column prop="email" label="邮箱"/>
            <el-table-column prop="type" label="类型" width="105">
              <template slot-scope="scope">
                <span v-if="scope.row.type == 'USER'">个人账号</span>
                <span v-if="scope.row.type == 'DEPT'">组织机构账号</span>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="50">
              <template slot-scope="scope">
                <span v-if="scope.row.state == 'N'">正常</span>
                <span v-if="scope.row.state == 'F'" style="color: red">禁用</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="remove(scope.row)">解除关联</el-button>
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
      <allocation-dept-user ref="AllocationDeptUser" @on-success="loadUserTable"/>
    </el-main>
  </el-container>
</template>

<script>
  import AllocationDeptUser from "./AllocationDeptUser";

  export default {
    name: 'DeptRelUser',
    components: {AllocationDeptUser},
    data() {
      return {
        tableData: null,
        tableLoading: false,

        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 50,

        deptId: null,
        dept: {id: null, name: null},

        condition: {
          name: null,
          userId: null,
          type: 'USER',
          state: 'N',
        }
      }
    },
    mounted() {
      this.deptId = this.$route.query.deptId
      if (this.deptId == null || this.deptId.trim().length == 0) {
        this.$api.error(this)
        return
      }
      this.getDeptById()
      this.loadUserTable()
    },
    methods: {
      getDeptById() {
        this.$http.get('/api/dept/getById/' + this.deptId).then(resp => {
          this.dept = resp.data
          if (this.dept == null) {
            this.$api.error(this)
          }
        }).catch(() => {
          this.$message.error('组织机构信息获取失败')
        })
      },
      /**
       * 加载用户数据表格
       */
      loadUserTable() {
        this.tableLoading = true
        this.$http.get('/api/dept/rel/user/getUserList', {
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          deptId: this.deptId,
          userName: this.condition.name,
          userId: this.condition.userId,
          type: this.condition.type,
          state: this.condition.state,
          cascade: false,
        }).then(resp => {
          this.totalElements = resp.data.totalElements
          this.tableData = resp.data.content
          this.tableLoading = false
        }).catch(() => {
          this.tableLoading = false
          this.$message.error('用户数据加载失败')
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
       * 分配用户
       */
      create() {
        this.$refs.AllocationDeptUser.visible = true
        this.$refs.AllocationDeptUser.dept = this.dept
      },

      /**
       * 用户移出组织机构
       * @param user
       */
      remove(user) {
        this.$confirm('此操作将解除 [ ' + user.name + ' ] 与部门 [ ' + this.dept.name + ' ] 的关联, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.tableLoading = true
          this.$http.post('/api/dept/rel/user/remove/' + this.deptId + '/' + user.id).then(resp => {
            if (resp.success) {
              this.$message.success('用户移出成功')
              this.loadUserTable()
            } else {
              this.$message.error(resp.message)
            }
            this.tableLoading = false
          }).catch(() => {
            this.tableLoading = false
            this.$message.error('移出失败')
          })
        })
      }
    },
  }
</script>

<style lang="less" scoped>

</style>
