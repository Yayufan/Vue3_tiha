<!-- 每個最新消息內容的通用模板 -->
<template>
  <section class="single-page-article-item-section">
    <el-card class="single-page-article-item-card-box">
      <h1>組織架構頁面</h1>
      <el-form :model="singlePageArticle" class="single-page-article-form" ref="singlePageArticleForm"
        :rules="singlePageArticleRules" label-position="top">

        <div class="outer-input-box">

          <div class="text-input-box">
            <el-form-item label="頁面標題：" prop="title">
              <el-input v-model="singlePageArticle.title" />
            </el-form-item>

          </div>

        </div>

        <div style="text-align: right;">
          <el-button type="primary" @click="submitArticleForm(singlePageArticleForm)">保存</el-button>
        </div>
      </el-form>

      <!-- 文章附件上傳組件，這邊小更動，因為要先從後端拿到ID會有時間差，所以組件要等拿到ID才開始渲染 -->
      <AttachmentComponent
        v-if="singlePageArticle.singlePageArticleId !== undefined && singlePageArticle.singlePageArticleId !== ''"
        :singlePageArticleId="singlePageArticle.singlePageArticleId" :getApi="getAllSinglePageArticleAttachmentApi"
        :addApi="addSinglePageArticleAttachmentApi" :deleteApi="deleteSinglePageArticleAttachmentApi" />

      <!-- CKEditor5 編輯器組件   -->
      <CustomCKEditor :scope="scope" :htmlContent="singlePageArticle.content" :updateContent="updateContent">
      </CustomCKEditor>

    </el-card>

  </section>


</template>

<script setup lang="ts">

import { ref, reactive } from 'vue'
import CustomCKEditor from '@/components/CustomCKEditor/index.vue'
import type { FormInstance, FormRules, UploadRawFile, UploadProps } from 'element-plus'
import { updateSinglePageArticleApi, getSinglePageArticleApi } from '@/api/singlePageArticle'
import AttachmentComponent from '@/components/SinglePageArticleAttachment/index.vue'

import { getAllSinglePageArticleAttachmentApi, addSinglePageArticleAttachmentApi, deleteSinglePageArticleAttachmentApi } from '@/api/singlePageArticleAttachment'


/**  使用CustomCKEditor組件的配置  */
//數據,父傳子
const scope = ref("organizationScope")

const singlePagePath = ref("organization")

const singlePageArticle = reactive<Record<string, any>>({
  singlePageArticleId: '',
  title: '',
  content: '',
});

//方法,子傳父
const updateContent = (newValue: string) => {
  singlePageArticle.content = newValue;
};

/** 當前組件的配置  */
const protocol = window.location.protocol; // 获取当前协议 (例如 "http:" 或 "https:")
const hostname = window.location.hostname; // 获取当前域名 (例如 "www.example.com")
const envAPI = import.meta.env.VITE_APP_BASE_API;

//獲取路由器
const router = useRouter()
const route = useRoute()

//獲取新增最新消息表單DOM
const singlePageArticleForm = ref()
//表單校驗規則
const singlePageArticleRules = reactive({
  title: [
    {
      required: true,
      message: '標題不能為空',
      trigger: 'blur',
    },
  ],

})


//獲取文章
const getArticle = async () => {
  let res = await getSinglePageArticleApi(singlePagePath.value)
  Object.assign(singlePageArticle, res.data)
}



//送出表單
const submitArticleForm = (form: FormInstance) => {
  //沒有抓到的這個Dom直接返回
  if (!form) return
  form.validate(async (valid) => {
    if (valid) {
      //獲取儲存在localStorage的臨時上傳檔案URL路徑
      let tempUploadUrlStr = localStorage.getItem(scope.value)
      //定義變量預設為[]
      let tempUploadUrlList: any[] = [];

      //如果上傳檔案URL路徑不為null,則根據逗號分隔
      if (tempUploadUrlStr !== null) {
        tempUploadUrlList = tempUploadUrlStr.split(",");
      }
      //賦予進singlePageArticle響應式對象中
      singlePageArticle.tempUploadUrl = tempUploadUrlList

      try {
        //呼叫更新API
        await updateSinglePageArticleApi(singlePageArticle)
        //移除臨時上傳檔案URL
        localStorage.removeItem(scope.value)

        ElMessage.success("儲存成功")
      } catch (err) {
        console.log(err)
      }

    } else {
      ElMessage.error("請完整填入資訊")
    }
  })
}


onMounted(async () => {
  await getArticle()
})

</script>




<style scoped lang="scss">
.single-page-article-item-section {
  width: 90%;
  margin: 1% auto;

  .single-page-article-item-card-box {
    min-height: 80vh;

    h1 {
      text-align: center;
    }

    .single-page-article-form {
      margin-bottom: 1%;

      .outer-input-box {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .text-input-box {
          width: 60%;
        }

        .img-box {
          margin-left: -5%
        }
      }

      .el-icon.avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        text-align: center;
      }

      .thumbnail-uploader {
        .avatar {
          width: 100%;
          max-width: 178px;
          display: block;
        }

        :deep(.el-upload) {
          border: 1px dashed var(--el-border-color);
          border-radius: 6px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
          border-color: var(--el-color-primary);
        }

      }

    }
  }
}
</style>
