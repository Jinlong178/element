<template>
  <section class="upload-component"
           v-loading="loading"
           element-loading-spinner="el-icon-loading"
           element-loading-background="transparent">
    <input :ref="fileControlName"
           type="file"
           :multiple="multiple"
           :accept="accept"
           @change="fileChange"/>
    <!-- 自定义操作区域，写上传按钮，调用submit方法 -->
    <div style="margin-bottom: 5px;" v-if="!readonly && useCustomBtn">
      <slot></slot>
    </div>
    <div style="margin-bottom: 5px;" v-if="!readonly && !useCustomBtn">
      <el-button @click="submit" style="width: 100%;">点击上传</el-button>
    </div>

    <!-- 文件列表 -->
    <div v-if="selectedFileList.length > 0">
      <!-- 文本列表 -->
      <ul class="ul" v-if="!usePictureList">
        <li class="text" v-for="file in selectedFileList">
          <span class="file-main">
            <a class="file-name" @click="previewFile(file)" title="点击预览">{{ file.name }}</a>
          </span>
          <span class="file-ops">
            <a class="download" @click="download(file)" title="下载"><i class="el-icon-download"></i></a>
            <a class="remove" @click="remove(file)" title="删除"><i class="el-icon-delete"></i></a>
          </span>
        </li>
      </ul>
      <!-- picture列表 -->
      <ul class="ul" v-if="usePictureList">
        <li class="picture" v-for="file in selectedFileList">
          <span class="file-picture">
            <img @click="previewFile(file)" :src="baseURL + file.path" :onerror="errorPicture">
          </span>
          <span class="file-main">
            <a class="file-name" @click="previewFile(file)" title="点击预览">{{ file.name }}</a>
          </span>
          <span class="file-ops">
            <a class="download" @click="download(file)" title="下载"><i class="el-icon-download"></i></a>
            <a class="remove" @click="remove(file)" title="删除"><i class="el-icon-delete"></i></a>
          </span>
        </li>
      </ul>
    </div>
    <!-- 只读并且空数据时展示 -->
    <div v-if="readonly && selectedFileList.length == 0">
      <div>{{ emptyDataText }}</div>
    </div>
  </section>
</template>

<script>
  import app from '../app'
  import axios from 'axios'
  import defaultPicture from '../assets/user.jpeg'

  export default {
    name: "PmUpload",
    props: {
      // 控件操作名称
      useCustomBtn: {
        type: Boolean,
        default: false
      },
      // 宽度
      width: {
        type: String,
        default: '100%',
      },
      // 数据列表
      fileList: {
        type: Array,
        default: () => []
      },
      // 存储目录
      dir: {
        type: String,
        default: null,
      },
      // 列表类型
      usePictureList: {
        type: Boolean,
        default: false
      },
      // 只读
      readonly: {
        type: Boolean,
        default: false
      },
      // 是否多选
      multiple: {
        type: Boolean,
        default: true
      },
      // 选择的文件类型
      accept: {
        type: String,
        default: null
      },
      // 空数据文本
      emptyDataText: {
        type: String,
        default: '空数据'
      },

      // 回调
      // 上传前执行，false：不上传
      onBeforeUpload: {
        type: Function,
        default: null
      },
      // 上传成功
      onSuccess: {
        type: Function,
        default: null
      },
      // 上传失败
      onFail: {
        type: Function,
        default: null
      },
      // 上传错误
      onError: {
        type: Function,
        default: null
      },

      // 预览
      onPreview: {
        type: Function,
        default: null
      },
      // 下载
      onDownload: {
        type: Function,
        default: null
      },
    },
    data() {
      return {
        httpHelper: null,
        action: '/api/attachment/upload' + (this.dir == null ? '' : '?catalog=' + this.dir),
        // 存储列表
        selectedFileList: [],
        baseURL: app.env.baseURL,
        errorPicture: 'this.src="' + defaultPicture + '"',
        loading: false
      }
    },
    computed: {
      fileControlName() {
        return "FileCtrl" + parseInt(Math.random() * (100000000000 - 1 + 1) + 1)
      }
    },
    watch: {
      fileList(value) {
        this.selectedFileList = []
        if (value == null || value.length == 0) return
        for (const file of value) {
          this.selectedFileList.push(file)
        }
      }
    },
    mounted() {
      this.createHttpHelper();
    },
    methods: {
      createHttpHelper() {
        this.httpHelper = axios.create({
          baseURL: app.env.baseURL,  // 请求地址前缀
          timeout: 60000, // 超时限制
        })
      },
      // 触发文件上传控件
      submit() {
        this.$refs[this.fileControlName].click();
      },
      // 文件改变
      fileChange(event) {
        if (event.target.files.length == 0) return

        this.loading = true
        let upload = true;
        if (this.onBeforeUpload) {
          upload = this.onBeforeUpload(event)
        }
        if (upload !== true) {
          this.loading = false
          return
        }

        // 上传
        const formData = new FormData()
        for (const file of event.target.files) {
          formData.append('files', file)
        }
        this.httpHelper.post(this.action, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(response => {
          const resp = response.data;
          if (resp.success) {
            if (this.onSuccess) this.onSuccess(resp)
            for (const item of resp.data) {
              this.selectedFileList.push(item)  // 存储
            }
          } else {
            if (this.onFail) this.onFail(resp)
            this.$message.error("文件上传失败：" + resp.message)
          }
          this.loading = false
        }).catch(response => {
          if (this.onError) this.onError(response)
          this.loading = false
          this.$message.error("文件上传失败")
          console.error(response)
        })
      },
      // 预览
      previewFile(file) {
        if (this.onPreview) {
          this.onPreview(file)
        } else {
          window.open(app.env.baseURL + file.path, file.name, 'width=650,height=450,top=100px,left=200px')
        }
      },
      // 下载
      download(file) {
        if (this.onDownload) {
          this.onDownload(file)
        } else {
          let xmlRequest = new XMLHttpRequest();
          if (window.XMLHttpRequest) {
            xmlRequest = new XMLHttpRequest();
          } else {
            if (window.ActiveXObject) {//IE 浏览器
              try {
                xmlRequest = new ActiveXObject("Microsoft.XMLHTTP");
              } catch (e) {
                try {//IE 浏览器
                  xmlRequest = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                }
              }
            }
          }
          xmlRequest.open("GET", app.env.baseURL + '/api/attachment/download/' + file.id, true);
          xmlRequest.setRequestHeader("Content-type", "application/json");
          xmlRequest.responseType = "blob";
          xmlRequest.onload = function (oEvent) {
            const content = xmlRequest.response;
            const elink = document.createElement('a');
            elink.download = file.name;
            elink.style.display = 'none';
            const blob = new Blob([content]);
            elink.href = URL.createObjectURL(blob);
            document.body.appendChild(elink);

            if(!!window.ActiveXObject || "ActiveXObject" in window){
              window.navigator.msSaveOrOpenBlob(blob, file.name)
            }else {
              elink.click()
            }
            document.body.removeChild(elink);
          };
          xmlRequest.send();
        }
      },
      // 移除
      remove(file) {
        let idx = -1;
        for (let i = 0; i < this.selectedFileList.length; i++) {
          if (this.selectedFileList[i].id === file.id) {
            idx = i
            break
          }
        }
        this.selectedFileList.splice(idx, 1)
      },
      // 获取文件列表
      getFileList() {
        const list = []
        // 新上传的文件列表
        if (this.selectedFileList.length > 0) {
          for (const file of this.selectedFileList) {
            list.push(file)
          }
        }
        return list;
      },
      // 获取已上传的文件列表
      getList() {
        const idList = []
        const list = this.getFileList();
        for (const file of list) {
          idList.push(file.id)
        }
        return idList;
      },
      // 获取已上传文件列表字符串
      getString() {
        const list = this.getList()
        return list.length == 0 ? null : list.join(",")
      },
    }
  }
</script>

<style lang="less" scoped>
  .upload-component {
    [type='file'] {
      display: none;
    }

    .ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li.text { /* list type is text */
        margin: 0 0 2px 0;
        border: 1px solid #DCDFE6;
        padding-left: 10px;
        display: flex;
        justify-content: space-between;
        height: 30px;
        line-height: 30px;

        .file-main {
          width: 80%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          .file-name {

            &:hover {
              cursor: pointer;
              color: #258CF7;
            }
          }
        }

        .file-ops {
          width: 66px;
          text-align: right;

          a {
            display: inline-block;
            text-align: center;
            width: 30px;
            height: 30px;
            font-size: 14px;

            &.download:hover {
              cursor: pointer;
              color: #258CF7;
            }

            &.remove:hover {
              cursor: pointer;
              color: #F56C6C;
            }
          }
        }
      }

      li.picture { /* list type is picture */
        margin: 0 0 2px 0;
        border: 1px solid #DCDFE6;
        display: flex;
        justify-content: space-between;
        height: 100px;
        line-height: 100px;

        .file-picture {
          padding: 3px;

          img {
            width: 94px;
            height: 94px;
            border-radius: 3px;

            &:hover {
              cursor: pointer;
            }
          }
        }

        .file-main {
          width: 70%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          padding-left: 6px;

          .file-name {

            &:hover {
              cursor: pointer;
              color: #258CF7;
            }
          }
        }

        .file-ops {
          width: 66px;
          text-align: right;

          a {
            display: block;
            text-align: center;
            width: 100%;
            height: 50px;
            line-height: 50px;
            font-size: 18px;

            &.download:hover {
              cursor: pointer;
              color: #258CF7;
            }

            &.remove:hover {
              cursor: pointer;
              color: #F56C6C;
            }
          }
        }
      }
    }
  }
</style>
