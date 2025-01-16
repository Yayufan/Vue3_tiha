<!--  -->
<template>
  <div class="mail-template-box">
    <h1>我是信件模板</h1>
    <div id="bar">
      <h1>Vue Email Editor (Demo)</h1>

      <button v-on:click="saveDesign">Save Design</button>
      <button v-on:click="exportHtml">Export HTML</button>
      <button v-on:click="exportPlainText">Export Text</button>
    </div>

    <EmailEditor :tools="tools" locale='zh-TW' class="vue-email-editor" ref="emailEditor"
      v-on:load="getDataAndEditorLoaded" :options="emailOptions" />


  </div>

</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue'
import { EmailEditor, } from 'vue-email-editor'
import { getEmailTemplateApi, updateEmailTemplateApi } from '@/api/emailTemplate'


let emailTemplate = reactive<Record<string, any>>({})


//獲取動態路由參數
let { id } = defineProps(['id'])

const getDataAndEditorLoaded = async () => {

  let res = await getEmailTemplateApi(id)
  Object.assign(emailTemplate, res.data)
  console.log("獲取模板數據 ", emailTemplate)

  console.log("這是emailEditor", emailEditor.value)

  if (emailTemplate.design == null) {
    console.log("沒有design數據")
  } else {
    console.log("有design數據,進行載入")
    emailEditor.value.editor.loadDesign(emailTemplate.design)
  }


  emailEditor.value.editor.setBodyValues({
    // 背景色改為透明
    backgroundColor: "TRANSPARENT",
    //容器寬度改為100%
    contentWidth: "100%"
  })


  // emailEditor.value.editor.registerCallback('image', function (file: any, done: any) {
  //   console.log('file為', file)
  //   console.log('done', done)
  //   done({ progress: 100, url: "https://png.pngtree.com/png-clipart/20230108/original/pngtree-super-cute-cartoon-vector-bear-png-image_8887896.png" })
  //   // Handle file upload here
  // })


}




/**----------------獲取Email Template資料------------------------------ */




/**------------------ */

const emailEditor = ref()

const emailOptions = {
  locale: 'zh-TW',
}


const tools = {
  form: {
    enabled: false
  }
}

const saveDesign = () => {
  emailEditor.value.editor.saveDesign(
    (design: any) => {
      console.log('saveDesign', design);
    }
  )
}

const exportHtml = () => {
  emailEditor.value.editor.exportHtml(
    (data: any) => {
      console.log('exportHtml', data);
    }, {
    //壓縮html大小
    minify: true
  })
}

const exportPlainText = () => {
  emailEditor.value.editor.exportPlainText((data: any) => {
    console.log('exportHtml', data);
  }, {
    //忽略各種連結和圖片
    ignoreLinks: true,
    ignoreImages: true,
    ignorePreheader: true,

    //合併標籤
    // mergeTags: {
    //   first_name: 'John',
    //   last_name: 'Doe'
    // }
  })
}



</script>

<style scoped lang="scss">
.mail-template-box {
  width: 90%;
  margin: 0 auto;


  .vue-email-editor {
    // min-height: 500px;
    height: 800px;
    margin: 3% auto;
  }

}
</style>
