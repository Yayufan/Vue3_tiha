<!-- 每個沒有縮圖的文章內容的通用模板 -->
<template>
  <section class="no-img-article-item-section">
    <el-card class="no-img-article-card-box">

      <el-form :model="noImgArticleData" class="no-img-article-form" ref="noImgArticleForm" :rules="noImgArticleRules">
        <el-form-item label="文章類別" prop="type">
          <el-input v-model="noImgArticleData.type" placeholder="文章類型" />
        </el-form-item>
        <el-form-item label="文章標題" prop="title">
          <el-input v-model="noImgArticleData.title" placeholder="文章標題" />
        </el-form-item>
        <el-form-item label="文章描述" prop="description">
          <el-input type="textarea" v-model="noImgArticleData.description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="公告日期" prop="announcementDate">
          <el-date-picker v-model="noImgArticleData.announcementDate" type="date" placeholder="Pick a Date"
            format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>

        <div style="text-align: right;">
          <el-button type="info" @click="back">返回</el-button>
          <el-button type="primary" @click="submitNoImgArticleForm(noImgArticleForm)">保存</el-button>
        </div>
      </el-form>

      <!-- CKEditor5 編輯器組件   -->
      <CustomCKEditor :scope="scope" :htmlContent="noImgArticleData.content" :updateContent="updateContent">
      </CustomCKEditor>

    </el-card>


    <!-- 頁面顯示 -->
    <!-- 顯示時要在父標籤上寫class= 'ck-content' -->
    <div v-html="noImgArticleData.content" class="ck-content"></div>

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
const scope = ref("socialWorkColumnScope")

let noImgArticleData = reactive({
  articleId: '',
  type: '',
  title: '',
  description: '',
  content: '',
  announcementDate: '',
  tempUploadUrl: <any[]>[]
})

//方法,子傳父
const updateContent = (newValue: string) => {
  noImgArticleData.content = newValue;
};


/**  當前組件的配置   */

//獲取路由器
const router = useRouter()
//獲取路由器
const route = useRoute()
//獲取新增最新文章表單DOM
const noImgArticleForm = ref()

//表單校驗規則
const noImgArticleRules = reactive({
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
    {
      max: 255,
      message: '內容長度不能超過 255 字符',
      trigger: 'blur'
    }
  ],
  announcementDate: [
    {
      required: true,
      message: '公告日期不能為空',
      trigger: 'blur',
    }
  ],
  description: [
    {
      required: true,
      message: '描述不能為空',
      trigger: 'blur',
    },
    {
      max: 255,
      message: '內容長度不能超過 255 字符',
      trigger: 'blur'
    }
  ]
})


//獲取文章
const getNoImgArticle = async () => {
  let res = await getArticleApi(id)
  Object.assign(noImgArticleData, res.data)



}

//返回列表
const back = () => {
  // 取得當前路徑並按 '/' 分割為陣列
  const pathSegments = route.path.split('/').filter(Boolean);

  // 確保有上層路徑可回
  if (pathSegments.length > 1) {
    // 移除最後一段路徑
    pathSegments.pop();

    // 組合回去並加上 `/`
    const parentPath = '/' + pathSegments.join('/');

    // 導航回上層路徑
    router.push(parentPath);

  } else {
    //沒有父路由,返回上一個歷史紀錄
    router.go(-1)
  }
}

//送出表單
const submitNoImgArticleForm = (form: FormInstance) => {
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
      noImgArticleData.tempUploadUrl = tempUploadUrlList

      let formData = new FormData()
      // 將響應式對象轉換為普通對象，然後轉換為 JSON 字符串
      const jsonData = JSON.stringify(noImgArticleData)
      formData.append('data', new Blob([jsonData], { type: "application/json" }))

      try {
        //呼叫更新API
        await updateArticleApi(formData)
        //移除臨時上傳檔案URL
        localStorage.removeItem(scope.value)
        //保存後返回列表
        back()

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
  getNoImgArticle()
})


</script>

<style scoped lang="scss">
.no-img-article-item-section {
  width: 90%;
  margin: 1% auto;

  .no-img-article-card-box {
    min-height: 80vh;

    .no-img-article-form {
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
