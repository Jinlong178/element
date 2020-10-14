<template>
  <section style="width: 100%">
    <editor v-model="content" :init="init" :disabled="readonly"></editor>
  </section>
</template>

<script>
  import app from '../app'
  import axios from 'axios'

  import tinymce from 'tinymce/tinymce'
  import Editor from '@tinymce/tinymce-vue'
  import 'tinymce/themes/silver/theme'
  import 'tinymce/plugins/link'
  import 'tinymce/plugins/image'
  import 'tinymce/plugins/paste'

  export default {
    components: {Editor},
    props: {
      /**
       * 不使用toolbar
       */
      none: {
        type: Boolean,
        default: false
      },
      /**
       * 值
       */
      value: {
        type: String,
        default: null
      },
      /**
       * 是否只读
       */
      readonly: {
        type: Boolean,
        default: false
      },
      maxSize: {
        type: Number,
        default: 5 * 1048576 // 10MB
      },
      /**
       * 高度
       */
      height: {
        type: Number,
        default: 800
      }
    },
    data() {
      return {
        init: {
          language_url: '/tinymce/langs/zh_CN.js',
          language: 'zh_CN',
          skin_url: '/tinymce/skins/ui/oxide',
          branding: false,  //隐藏右下角技术支持
          elementpath: false, //隐藏底栏的元素路径
          statusbar: false, // 状态栏
          menubar: false,//隐藏菜单栏
          plugins: 'paste link image',
          toolbar: this.readonly || this.none ? null : 'undo redo | removeformat | formatselect | bold italic underline | alignleft aligncenter alignright | image | link unlink |',
          content_style: `
            p {margin: 5px;}
            * {font-family: '等线';}
            * * {font-size: 12px;}
          `,
          setup: editor => {  // 启动TAB按键
            editor.on('keydown', function (event) {
              if (event.keyCode == 9) {
                if (event.shiftKey) {
                  editor.execCommand('Outdent');
                } else {
                  editor.execCommand('Indent');
                }
                event.preventDefault();
                event.stopPropagation();
              }
            })
          },
          min_height: this.height,
          images_upload_handler: (blobInfo, success, failure) => {
            if (blobInfo.blob().size > this.maxSize) {
              failure('图片体积过大，最大只能为5MB')
              return
            }

            let formData = new FormData()
            formData.append('file', blobInfo.blob())
            axios.create({
              baseURL: app.env.baseURL,  // 请求地址前缀
              timeout: 60000, // 超时限制
            }).post(app.env.baseURL + '/api/attachment/uploadSingle', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }).then(response => {
              const resp = response.data;
              if (resp.success) {
                success(app.env.baseURL + resp.data.path)
              } else {
                this.$message.error("文件上传失败：" + resp.message)
              }
            }).catch(response => {
              if (this.onError) this.onError(response)
              this.$message.error("文件上传失败")
            })
          },
          paste_data_images: true,
          powerpaste_word_import: 'merge', // 是否保留word粘贴样式  clean | merge
        },
        content: this.value,
      }
    },
    mounted() {
      tinymce.init({})
    },
    watch: {
      value(value) {
        this.content = value
      },
      content(value) {
        this.$emit('input', value)  // 设置后，可以双向绑定数据
      }
    },
    methods: {
      /**
       * 获取值
       * @return 编辑器内容
       */
      getValue() {
        return this.content
      },
      /**
       * 设置值
       * @param value 编辑器内容
       */
      setValue(value) {
        this.content = value
      },
      /**
       * 清空编辑器
       */
      clear() {
        this.content = null
      }
    }
  }
</script>

<style scoped>

</style>
