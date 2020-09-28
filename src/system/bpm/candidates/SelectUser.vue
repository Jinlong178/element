<template>
  <el-dialog title="选择候选用户" :visible.sync="visible" width="80%" top="5vh"
             :close-on-click-modal="false"
             :close-on-press-escape="false">
    <div style="height: 65vh;overflow: auto;">
      <el-container style="height: 100%;">
        <el-aside width="25%" v-loading="treeLoading">
          <el-scrollbar class="medium">
            <el-tree :data="treeData" default-expand-all :expand-on-click-node="false" @node-click="nodeClick">
            </el-tree>
          </el-scrollbar>
        </el-aside>
        <el-main style="padding: 0 10px;" v-loading="tableLoading">
          <el-scrollbar class="medium">
            <!-- 查询条件 -->
            <section class="table-condition">
              <el-form :inline="true" size="small" label-position="right">
                <el-form-item label="部门">
                  <el-cascader :options="options" placeholder=""
                               :props="props"
                               clearable
                               v-model="selection"
                               filterable></el-cascader>
                </el-form-item>
                <el-form-item label="姓名">
                  <el-input clearable v-model="condition.name"></el-input>
                </el-form-item>
                <!--                <el-form-item label="用户名">-->
                <!--                  <el-input clearable v-model="condition.userId"></el-input>-->
                <!--                </el-form-item>-->
              </el-form>
              <el-button @click="loadUserTable" size="small" icon="el-icon-search"></el-button>
            </section>
            <el-table ref="multipleTable" :data="tableData" border stripe style="width: 100%"
                      @row-click="clickRow">
              <el-table-column type="index" width="55"></el-table-column>
              <el-table-column prop="name" label="姓名"/>
              <el-table-column prop="id" label="用户名"/>
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
          </el-scrollbar>
        </el-main>
        <el-aside width="20%">
          <el-scrollbar class="medium">
            <div class="user-list">
              <span class="user-item" v-for="item of selectedUserList" :key="item.userId">
                <a>{{ item.name }}</a>
                <a title="移除用户" @click="removeSelection(item)" class="remove-user"><i class="el-icon-close"></i></a>
              </span>
            </div>
          </el-scrollbar>
        </el-aside>
      </el-container>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取 消</el-button>
      <el-button type="primary" size="small" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    name: "SelectUser",
    data() {
      return {
        visible: false,
        rule: null,

        selectedUserList: [],

        treeData: null,
        tableData: null,

        treeLoading: false,
        tableLoading: false,

        currentDept: null,

        // 分页信息
        totalElements: 0,
        currentPage: 1,
        pageSize: 10,

        // 查询条件
        options: [],
        selection: [],
        props: {checkStrictly: true},
        condition: {
          name: null,
          userId: null,
        }
      }
    },
    watch: {
      treeData(value) {
        this.resolve2treeData(this.options, value)
      },
      selection(value) {
        if (value == null) this.currentDept = null
        else {
          this.currentDept = {
            id: value[value.length - 1]
          }
        }
      },
      rule(r) {
        this.condition.name = null
        this.condition.userId = null
        this.selectedUserList = []

        if (r == null) return
        if (r.value != null && r.value.length > 0) {
          for (const item of r.value) {
            this.selectedUserList.push({
              userId: item.userId,
              name: item.name
            })
          }
        }
      }
    },
    mounted() {
      this.treeLoading = true
      this.loadDeptTree()
      this.loadUserTable()
    },
    methods: {
      resolve2treeData(list, value) {
        if (value == null) return null
        for (const d of value) {
          const arr = []
          list.push({
            value: d.id,
            label: d.label,
            children: this.resolve2treeData(arr, d.children)
          })
        }
        return list
      },
      nodeClick(data) {
        this.currentDept = data
        this.$http.get('/api/dept/getCascadeParentList/' + data.id).then(resp => {
          this.selection = resp.data
        })
        this.condition.name = null
        this.condition.userId = null
        this.currentPage = 1
        this.loadUserTable()
      },
      loadDeptTree() {
        this.$http.get('/api/dept/getTree').then(resp => {
          this.treeData = resp.data
          this.treeLoading = false
        })
      },
      loadUserTable() {
        this.tableLoading = true
        this.$http.get('/api/dept/rel/user/getUserList', {
          deptId: this.currentDept == null ? null : this.currentDept.id,
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
          name: this.condition.name,
          userId: this.condition.userId,
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
      selectedData(row) {
        for (const item of this.selectedUserList) {
          if (item.userId === row.id)
            return true
        }
        return false
      },
      removeSelection(item) {
        let index = -1;
        for (let i = 0; i < this.selectedUserList.length; i++) {
          if (this.selectedUserList[i].userId === item.userId) {
            index = i
            break
          }
        }
        if (index > -1) {
          this.selectedUserList.splice(index, 1);
        }
      },
      clickRow(row, column, event) {
        if (!this.selectedData(row)) {
          this.selectedUserList.push({
            userId: row.id,
            name: row.name
          })
        }
      },
      cancel() {
        this.selectedUserList = []
        this.visible = false
        this.rule = null
      },
      confirm() {
        this.rule.value = (this.selectedUserList.length == 0) ? null : this.selectedUserList
        this.visible = false
        this.rule = null
      }
    }
  }
</script>

<style lang="less" scoped>
  .user-list {
    .user-item {
      border: 1px solid #eee;
      /*height: 32px;*/
      line-height: 24px;
      margin-bottom: 3px;
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      background-color: #f7f7f7;
      font-size: 12px;

      &:hover {
        background-color: #eee;
      }

      a.remove-user {
        height: 24px;
        line-height: 24px;

        &:hover {
          cursor: pointer;
          color: #409EFF;
        }
      }
    }
  }

  div.el-dialog__body {
    padding: 0 !important;
  }
</style>
