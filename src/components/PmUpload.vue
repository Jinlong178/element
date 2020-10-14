<template>
  <section class="upload-component"
           v-loading="loading"
           element-loading-spinner="el-icon-loading"
           element-loading-background="transparent">
    <input :ref="fileControlName"
           type="file"
           :multiple="!single"
           :accept="accept"
           @change="fileChange"/>
    <!-- 自定义操作区域，写上传按钮，调用submit方法 -->
    <div style="margin-bottom: 5px;" v-if="!readonly && useCustomBtn">
      <slot></slot>
    </div>
    <section v-if="type == 'text' || type == 'picture'">
      <div style="margin-bottom: 5px;" v-if="!readonly && !useCustomBtn">
        <el-button @click="submit" style="width: 100%;">点击上传</el-button>
      </div>
      <div v-if="info != null && info.trim().length > 0" style="font-size: 12px;">{{ info }}</div>
      <div v-if="files.length > 0">
        <!-- 文本列表 -->
        <ul class="ul" v-if="type == 'text'">
          <li class="text" v-for="file in files">
            <span class="file-main">
              <div style="padding: 4px 10px 4px 0;">
                <img :src="getDefaultPicture(file, 'small')">
              </div>
              <a class="file-name" @click="previewFile(file)" title="点击预览">{{ file.name }}</a>
            </span>
            <span class="file-ops">
            <a class="preview" @click="previewFile(file)" title="预览"><i class="el-icon-view"></i></a>
            <a class="download" @click="download(file)" title="下载"><i class="el-icon-download"></i></a>
            <a class="remove" @click="remove(file)" title="删除"><i class="el-icon-delete"></i></a>
          </span>
          </li>
        </ul>
        <!-- picture列表 -->
        <ul class="ul" v-if="type == 'picture'">
          <li class="picture" v-for="file in files">
            <span class="file-picture">
                <img @click="previewFile(file)" :src="baseURL + file.path" title="点击预览" :onerror="errorPicturePath">
            </span>
            <span class="file-main">
              <a class="file-name" @click="previewFile(file)" title="点击预览">{{ file.name }}</a>
            </span>
            <span class="file-ops">
              <a class="preview" @click="previewFile(file)" title="预览"><i class="el-icon-view"></i></a>
              <a class="download" @click="download(file)" title="下载"><i class="el-icon-download"></i></a>
              <a class="remove" @click="remove(file)" title="删除"><i class="el-icon-delete"></i></a>
            </span>
          </li>
        </ul>
      </div>
    </section>
    <section v-else-if="type == 'card'">
      <div class="card">
        <!-- 文本列表 -->
        <ul class="card-ul">
          <template v-if="files.length > 0">
            <li style="margin-right: 3px" v-for="file in files">
              <span>
                <img width="120px" height="120px" @click="previewFile(file)" :src="baseURL + file.path">
              </span>
            </li>
          </template>
          <li v-if="!readonly">
            <el-button @click="submit" icon="el-icon-plus" class="card-plus"></el-button>
          </li>
        </ul>
      </div>
    </section>
    <!-- 只读并且空数据时展示 -->
    <div v-if="readonly && files.length == 0">
      <div>{{ emptyDataText }}</div>
    </div>
  </section>
</template>

<script>
  import app from '../app'
  import axios from 'axios'
  import defaultPicture from '../assets/icon/file-94.png'
  import imgSmallImgPath from '../assets/icon/img-small.png'
  import excelSmallImgPath from '../assets/icon/excel-small.png'
  import wordSmallImgPath from '../assets/icon/word-small.png'
  import txtSmallImgPath from '../assets/icon/txt-small.png'
  import fileSmallImgPath from '../assets/icon/file-small.png'

  export default {
    props: {
      // 数据列表
      value: {
        type: [Object, Array],
        default: () => []
      },
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
      // 存储目录
      dir: {
        type: String,
        default: null,
      },
      // 显示信息
      info: {
        type: String,
        default: null
      },
      // 展示类型
      type: {
        type: String,
        default: 'text' // picture card
      },
      // 只读
      readonly: {
        type: Boolean,
        default: false
      },
      // 是否单选，默认多选
      single: {
        type: Boolean,
        default: false
      },
      // 选择的文件类型
      accept: {
        type: String,
        default: null
      },
      // 空数据文本
      emptyDataText: {
        type: String,
        default: '无数据'
      },

      // 回调
      // 上传前执行，false：不上传
      onBeforeUpload: {
        type: Function,
        default: null
      },
    },
    data() {
      return {
        loading: false,
        baseURL: app.env.baseURL,
        action: '/api/attachment/upload' + (this.dir == null ? '' : '?catalog=' + this.dir),
        // 存储列表
        files: [],
        errorPicturePath: 'this.src=\'' + defaultPicture + '\''
      }
    },
    computed: {
      fileControlName() {
        return "FileCtrl" + parseInt(Math.random() * (100000000000 - 1 + 1) + 1)
      }
    },
    watch: {
      value(value) {
        this.files = value == null ? [] : (this.single ? [value] : value)
      },
      files(value) {
        let v = null;
        if (value.length == 0) v = null
        else {
          if (this.single) {
            v = value[0]
          } else {
            v = value
          }
        }
        this.$emit('input', v)  // 设置后，可以双向绑定数据
      }
    },
    methods: {
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

        // 文件大小校验

        axios.create({
          baseURL: app.env.baseURL,  // 请求地址前缀
          timeout: 60000, // 超时限制
        }).post(this.action, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(response => {
          const resp = response.data;
          if (resp.success) {
            // 单选，只能保存一个附件
            if (this.single) {
              this.files = [resp.data[0]]
            } else {
              for (const item of resp.data) {
                this.files.push(item)  // 存储
              }
            }
            this.$emit('on-success', resp)
          } else {
            this.$emit('on-fail', resp)
            this.$message.error("文件上传失败：" + resp.message)
          }
          this.loading = false
        }).catch(response => {
          this.$emit('on-error', response)
          this.loading = false
          this.$message.error("文件上传失败")
          console.error(response)
        })
      },
      // 预览
      previewFile(file) {
        window.open(app.env.baseURL + file.path, file.name, 'width=650,height=450,top=100px,left=200px')
      },
      // 下载
      download(file) {
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

          if (!!window.ActiveXObject || "ActiveXObject" in window) {
            window.navigator.msSaveOrOpenBlob(blob, file.name)
          } else {
            elink.click()
          }
          document.body.removeChild(elink);
        };
        xmlRequest.send();
      },
      // 移除
      remove(file) {
        let idx = -1;
        for (let i = 0; i < this.files.length; i++) {
          if (this.files[i].id === file.id) {
            idx = i
            break
          }
        }
        this.files.splice(idx, 1)
      },
      // 获取文件列表
      getFileList() {
        const list = []
        // 新上传的文件列表
        if (this.files.length > 0) {
          for (const file of this.files) {
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
      getDefaultPicture(file, size) {
        let defaultPath = '';
        switch (file.suffix) {
          case 'png':
          case 'jpg':
          case 'jpeg':
            defaultPath = imgSmallImgPath
            break
          case 'xls':
          case 'xlsx':
            defaultPath = excelSmallImgPath
            break
          case 'doc':
          case 'docx':
            defaultPath = wordSmallImgPath
            break
          case 'txt':
            defaultPath = txtSmallImgPath
            break
          default:
            defaultPath = fileSmallImgPath
            break
        }
        return defaultPath;
      }
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
          display: flex;

          .file-name {

            &:hover {
              cursor: pointer;
              color: #258CF7;
            }
          }
        }

        .file-ops {
          width: 99px;
          text-align: right;

          a {
            display: inline-block;
            text-align: center;
            width: 30px;
            height: 30px;
            font-size: 14px;

            &:hover {
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
            height: 33px;
            line-height: 33px;
            font-size: 18px;

            &:hover {
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

    .card {
      margin-bottom: 5px;
      display: flex;
      width: 100%;

      ul.card-ul {
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        padding: 0;
        margin: 0;

        .el-button.card-plus {
          width: 120px;
          height: 120px;
          font-size: 50px;
          color: #b6b3b3;
          border-style: dashed;

          &:hover{
            color: #7f7c7c;
          }
        }
      }
    }
  }
</style>
