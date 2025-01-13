<!-- 每個最新消息內容的通用模板 -->
<template>
  <section class="news-item-section">
    <el-card class="news-card-box">

      <el-form :model="newsData" class="news-form" ref="newsForm" :rules="newsRules">
        <el-form-item label="消息類別" prop="type">
          <el-input v-model="newsData.type" placeholder="消息類型" />
        </el-form-item>
        <el-form-item label="消息標題" prop="title">
          <el-input v-model="newsData.title" placeholder="消息標題" />
        </el-form-item>
        <el-form-item label="公告日期" prop="announcementDate">
          <el-date-picker v-model="newsData.announcementDate" type="date" placeholder="Pick a Date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" />
        </el-form-item>

        <div style="text-align: right;">
          <el-button type="info" @click="back">返回</el-button>
          <el-button type="primary" @click="submitNewsForm(newsForm)">保存</el-button>
        </div>
      </el-form>

      <!-- CKEditor5 編輯器組件   -->
      <CustomCKEditor :scope="scope" :htmlContent="newsData.content" :updateContent="updateContent">
      </CustomCKEditor>

    </el-card>


    <!-- 頁面顯示 -->
    <!-- 顯示時要在父標籤上寫class= 'ck-content' -->
    <div v-html="newsData.content" class="ck-content"></div>

  </section>
</template>

<script setup lang="ts">

import { ref, reactive } from 'vue'
import { getArticleApi, updateArticleApi } from '@/api/article'
import { FormInstance, UploadRawFile } from 'element-plus'
import CustomCKEditor from '@/components/CustomCKEditor/index.vue'


//獲取動態路由參數
let { id } = defineProps(['id'])


/**  使用CustomCKEditor組件的配置  */
//數據,父傳子
const scope = ref("newsScope")

let newsData = reactive({
  articleId: '',
  type: '',
  title: '',
  content: '',
  announcementDate: '',
  tempUploadUrl: <any[]>[]
})

//方法,子傳父
const updateContent = (newValue: string) => {
  newsData.content = newValue;
};


/**  當前組件的配置   */

//獲取路由器
const router = useRouter()
//獲取新增最新消息表單DOM
const newsForm = ref()

//圖片實際數據
let imgFile = <UploadRawFile>{}

//表單校驗規則
const newsRules = reactive({
  type: [
    {
      required: true,
      message: '類型不能為空',
      trigger: 'blur',
    },
  ],
  title: [
    {
      required: true,
      message: '標題不能為空',
      trigger: 'blur',
    },
  ],
  announcementDate: [
    {
      required: true,
      message: '公告日期不能為空',
      trigger: 'blur',
    }
  ]
})


//獲取消息
const getNews = async () => {
  let res = await getArticleApi(id)
  Object.assign(newsData, res.data)
}

//返回列表
const back = () => {
  router.push("/content/news")
}

//送出表單
const submitNewsForm = (form: FormInstance) => {
  //沒有抓到的這個Dom直接返回
  if (!form) return
  form.validate(async (valid) => {
    if (valid) {
      //獲取儲存在localStorage的臨時上傳檔案URL路徑
      let tempUploadUrlStr = localStorage.getItem(scope.value)
      //定義變量預設為null
      let tempUploadUrlList: any[] = [];

      //如果上傳檔案URL路徑不為null,則根據逗號分隔
      if (tempUploadUrlStr !== null) {
        tempUploadUrlList = tempUploadUrlStr.split(",");
      }
      //賦予進newData響應式對象中
      newsData.tempUploadUrl = tempUploadUrlList
      console.log(newsData)

      let formData = new FormData()
      // 將響應式對象轉換為普通對象，然後轉換為 JSON 字符串
      const jsonData = JSON.stringify(newsData)
      formData.append('data', new Blob([jsonData], { type: "application/json" }))
      formData.append('file', imgFile)

      try {
        //呼叫更新API
        await updateArticleApi(formData)
        //移除臨時上傳檔案URL
        localStorage.removeItem(scope.value)
        //保存後返回列表
        router.push("/content/news")

        ElMessage.success("儲存成功")
      } catch (err) {
        console.log(err)
      }

    } else {
      ElMessage.error("請完整填入資訊")
    }
  })
}

//頁面掛載時執行
onMounted(() => {
  getNews()
})


</script>

<style scoped lang="scss">
.news-item-section {
  width: 90%;
  margin: 1% auto;

  .news-card-box {
    min-height: 80vh;

    .news-form {
      margin-bottom: 1%;
      // .el-input {
      //   --el-input-width: 150px;
      // }

      // .el-input__inner {
      //   --el-input-width: 150px;
      // }
    }
  }
}
</style>
