<template>
  <el-dialog title="选择候选人角色" :visible.sync="visible" width="40%"
             :close-on-click-modal="false"
             :close-on-press-escape="false">
    <div style="height: 50vh; overflow: auto;">
      <el-container style="height: 100%;">
        <el-aside width="50%" style="border-right: 1px solid #eee;" v-loading="treeLoading">
          <el-scrollbar class="medium">
            <el-tree :data="treeData"
                     default-expand-all
                     :expand-on-click-node="false"
                     @node-click="nodeClick">
            </el-tree>
          </el-scrollbar>
        </el-aside>
        <el-main style="padding: 0 10px;">
          <el-scrollbar class="medium">
            <div class="role-list">
              <span class="role-item" v-for="item of selectedRoleList" :key="item.id">
                <a>{{ item.label }}</a>
                <a title="移除角色" @click="removeSelection(item)" class="remove-role"><i class="el-icon-close"></i></a>
              </span>
            </div>
          </el-scrollbar>
        </el-main>
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
    name: "SelectRole",
    data() {
      return {
        visible: false,
        rule: null,

        treeLoading: false,
        treeData: [],

        selectedRoleList: []
      }
    },
    watch: {
      rule(r) {
        this.selectedRoleList = []
        if (r == null) return
        if (r.value != null && r.value.length > 0) {
          for (const item of r.value) {
            this.selectedRoleList.push({
              id: item.id,
              label: item.label,
            })
          }
        }
      }
    },
    mounted() {
      this.treeLoading = true
      this.$http.get('/api/role/tree').then(resp => {
        this.treeData = resp.data
        this.treeLoading = false
      })
    },
    methods: {
      nodeClick(data) {
        if (!this.selectedData(data)) {
          this.selectedRoleList.push({
            id: data.id,
            label: data.label
          })
        }
      },
      selectedData(data) {
        for (const item of this.selectedRoleList) {
          if (item.id === data.id)
            return true
        }
        return false
      },
      removeSelection(data) {
        let index = -1;
        for (let i = 0; i < this.selectedRoleList.length; i++) {
          if (this.selectedRoleList[i].id === data.id) {
            index = i
            break
          }
        }
        if (index > -1) {
          this.selectedRoleList.splice(index, 1);
        }
      },
      cancel() {
        this.selectedRoleList = []
        this.visible = false
        this.rule = null
      },
      confirm() {
        this.rule.value = (this.selectedRoleList.length == 0) ? null : this.selectedRoleList
        this.visible = false
        this.rule = null
      }
    }
  }
</script>

<style scoped>
  .role-list .role-item {
    border: 1px solid #eee;
    /*height: 32px;*/
    line-height: 32px;
    margin-bottom: 3px;
    padding: 0 10px;
    display: flex;
    justify-content: space-between;
    background-color: #f7f7f7;
  }

  .role-list .role-item:hover {
    background-color: #eee;
  }

  .role-list .role-item a.remove-role {
    height: 32px;
    line-height: 32px;
  }

  .role-list .role-item a.remove-role:hover {
    cursor: pointer;
    color: #409EFF;
  }
</style>
