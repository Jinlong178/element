<template>
  <el-container style="height: 100%;">
    <el-aside width="30%" style="border-right: 1px solid #E6E6E6">
      <pm-layout :breadcrumbs="['数据字典']">
        <section slot="content" v-loading="treeLoading">
          <el-tree class="dic-tree" highlight-current
                   :data="treeData"
                   node-key="id"
                   :default-expanded-keys="defaultExpandedKeys"
                   :expand-on-click-node="false"
                   @node-click="nodeClick"/>
        </section>
      </pm-layout>
    </el-aside>
    <el-main style="padding: 0;">
      <pm-layout>
        <section slot="tools">
          <template v-if="!formEdit">
            <el-button v-if="currentDic != null && currentDic.id != rootNodeId" type="default" size="small" @click="create">
              <i class="el-icon-plus"></i> 新建子级
            </el-button>
          </template>
          <el-button v-if="update && !isSystemData()" type="default" size="small" @click="remove"><i class="el-icon-delete"></i> 删除</el-button>
          <el-button v-if="showForm" type="primary" size="small" @click="save"><i class="el-icon-plus"></i> 保存</el-button>
        </section>
        <section slot="content" style="padding: 5px;">
          <el-form v-if="showForm" :model="form" size="small" label-position="right" label-width="70px"
                   style="width: 80%; margin: 30px auto;"
                   v-loading="formLoading">
            <el-form-item label="上级字典">
              <el-cascader style="width: 100%"
                           :options="treeData[0].children"
                           :props="{checkStrictly: true, value: 'id', label: 'label'}"
                           clearable
                           v-model="selection"
                           filterable></el-cascader>
            </el-form-item>
            <el-form-item label="显示名">
              <el-input v-model="form.name"/>
            </el-form-item>
            <el-form-item label="编码">
              <el-input v-model="form.key" :readonly="update"/>
            </el-form-item>
            <el-form-item label="值" v-show="false">
              <el-input v-model="form.value"/>
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number width="100%" v-model="form.sort" :min="1" :max="10000"></el-input-number>
            </el-form-item>
            <el-form-item label="描述">
              <el-input type="textarea"
                        :autosize="{ minRows: 4, maxRows: 4 }"
                        maxlength="100"
                        show-word-limit resize="none" v-model="form.description"/>
            </el-form-item>
          </el-form>
        </section>
      </pm-layout>
    </el-main>
  </el-container>
</template>

<script>
  const rootNodeId = '1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik,9ol.'
  export default {
    name: "Dictionary",
    components: {},
    data() {
      return {
        treeLoading: false,
        valueLoading: false,

        rootNodeId: rootNodeId, //
        defaultExpandedKeys: [rootNodeId],
        treeData: [{
          id: rootNodeId,
          name: '数据字典树',
          children: null
        }],
        currentDic: null,

        showForm: false,
        form: {
          key: null,
          parentKey: null,
          value: null,
          name: null,
          description: null,
          sort: 1
        },
        formLoading: false,
        formEdit: false,
        update: false,

        selection: [],

      }
    },
    mounted() {
      this.loadDicTree()
    },
    watch: {
      'form.parentKey'(value) {
        if (value != null && value != "") {
          this.$http.get('/api/dic/getCascadeParentList/' + value).then(resp => {
            this.selection = resp.data
          }).catch(() => {
            this.$message.error('字典数据获取失败')
          })
        } else {
          this.selection = [];
        }
      }
    },
    methods: {
      loadDicTree() {
        this.treeLoading = true
        this.$http.get('/api/dic/getTree').then(resp => {
          this.treeData = [{
            id: rootNodeId,
            label: '数据字典树',
            children: resp.data
          }]
          this.treeLoading = false
        }).catch(() => {
          this.treeLoading = false
          this.$message.error('删除失败')
        })
      },
      nodeClick(data) {
        this.showForm = true
        this.formEdit = false
        this.currentDic = data
        this.formLoading = true

        if (data.id == this.treeData[0].id) {
          this.update = false
          this.form = {
            key: null,
            parentKey: null,
            value: null,
            name: null,
            description: null,
            sort: 1,
          }
          this.formLoading = false
        } else {
          this.update = true
          this.$http.get('/api/dic/getById/' + data.id).then(resp => {
            const data = resp.data
            this.form = {
              key: data.key,
              parentKey: data.parentKey,
              value: data.value,
              name: data.name,
              description: data.description,
              sort: data.sort
            }
            this.formLoading = false
          }).catch(() => {
            this.formLoading = false
          })
        }
      },

      /**
       * 新建数据字典
       */
      create() {
        this.formEdit = true
        this.update = false
        this.form = {
          key: null,
          parentKey: this.currentDic.id,
          value: null,
          name: null,
          description: null,
          sort: 1,
        }
      },

      /**
       * 保存数据字典
       */
      save() {
        let url = '/api/dic/save'
        if (this.update) {
          url = '/api/dic/update'
        }
        if (this.selection != null && this.selection.length > 0) {
          this.form.parentKey = this.selection[this.selection.length - 1]
        }

        if (this.form.parentKey != null && this.form.parentKey.length > 0) {
          if (this.form.parentKey == this.form.key) {
            this.$message.error('上级字典不能是自身')
            return
          }
        }

        this.formLoading = true
        this.$http.post(url, this.form).then(resp => {
          if (resp.success) {
            this.showForm = false
            this.formEdit = false
            this.update = false
            this.selection = []
            this.formReset()
            this.loadDicTree()
            this.$message.success('操作成功')
          } else {
            this.$message.error(resp.message)
          }
          this.formLoading = false
        }).catch(() => {
          this.formLoading = false
          this.$message.error('操作失败')
        })
      },
      remove() {
        const dic = this.currentDic
        this.$confirm('此操作将删除数据字典 [ ' + dic.label + ' ] 及其子数据，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.treeLoading = true
          this.$http.post('/api/dic/remove/' + dic.id).then(resp => {
            if (resp.success) {
              this.$message.success('数据字典删除成功')
              this.loadDicTree()
            } else {
              this.$message.error(resp.message)
            }
            this.treeLoading = false
          }).catch(() => {
            this.treeLoading = false
            this.$message.error('数据字典删除失败')
          })
        })
      },
      formReset() {
        this.currentDic = null
        this.form = {
          key: null,
          parentKey: null,
          value: null,
          name: null,
          description: null,
        }
      },
      isSystemData() {
        const arr = ['DEPT_TYPE']
        return arr.indexOf(this.currentDic.id) != -1
      }
    }
  }
</script>

<style lang="less">
  .dic-tree.el-tree > .el-tree-node > .el-tree-node__content {
    background-color: #F5F5F5;
    font-style: italic;
  }
</style>
