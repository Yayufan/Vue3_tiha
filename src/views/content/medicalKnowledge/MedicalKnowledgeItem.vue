<!-- 每個最新消息內容的通用模板 -->
<template>
  <section class="medical-knowledge-item-section">
    <el-card class="medical-knowledge-card-box">


      <el-form :model="medicalKnowledge" class="medical-knowledge-form" ref="medicalKnowledgeForm"
        :rules="medicalKnowledgeRules" label-position="top">

        <div class="outer-input-box">

          <div class="text-input-box">
            <el-form-item label="文章類別" prop="type">
              <el-input v-model="medicalKnowledge.type" placeholder="消息類型" />
            </el-form-item>
            <el-form-item label="文章標題" prop="title">
              <el-input v-model="medicalKnowledge.title" placeholder="消息標題" />
            </el-form-item>
            <el-form-item label="文章描述">
              <el-input type="textarea" v-model="medicalKnowledge.description" autocomplete="off" />
            </el-form-item>
          </div>
          <div class="img-box">

            <el-form-item label="縮圖上傳" label-position="top">

              <el-upload class="thumbnail-uploader" :action="envAPI + '/upload/img'" :show-file-list="false"
                :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>

            </el-form-item>

          </div>
        </div>

        <div style="text-align: right;">
          <el-button type="info" @click="back">返回</el-button>
          <el-button type="primary" @click="submitMedicalKnowledgeForm(medicalKnowledgeForm)">保存</el-button>
        </div>
      </el-form>

      <CustomCKEditor :scope="scope" :htmlContent="medicalKnowledge.content" :updateContent="updateContent">
      </CustomCKEditor>

    </el-card>

  </section>


</template>

<script setup lang="ts">

import { ref, reactive } from 'vue'
import CustomCKEditor from '@/components/CustomCKEditor/index.vue'
import type { FormInstance, FormRules, UploadRawFile, UploadProps } from 'element-plus'
import { updateArticleApi, getArticleApi } from '@/api/article'
//路由參數,這邊注意解構賦值後,會失去響應式
let { id } = defineProps(['id'])

/**  使用CustomCKEditor組件的配置  */
//數據,父傳子
const scope = ref("medicalKnowledgeScope")

const medicalKnowledge = reactive<Record<string, any>>({
  medicalKnowledgeId: '',
  type: '',
  title: '',
  description: null,
  content: '',
  coverThumbnailUrl: ''

});

//方法,子傳父
const updateContent = (newValue: string) => {
  medicalKnowledge.content = newValue;
};

/** 當前組件的配置  */
const protocol = window.location.protocol; // 获取当前协议 (例如 "http:" 或 "https:")
const hostname = window.location.hostname; // 获取当前域名 (例如 "www.example.com")

const envAPI = import.meta.env.VITE_APP_BASE_API;
const imageUrl = ref()

//圖片數據
let imgFile = <UploadRawFile>{}

//獲取路由器
const router = useRouter()
//獲取新增最新消息表單DOM
const medicalKnowledgeForm = ref()
//表單校驗規則
const medicalKnowledgeRules = reactive({
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


//檔案上傳成功的回調
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  console.log(response)
  console.log(uploadFile)

  imageUrl.value = URL.createObjectURL(uploadFile.raw!)

  //將檔案傳給接收圖片的數據
  imgFile = uploadFile.raw!

}

//檔案上傳前的回調
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}

//獲取文章
const getMedicalKnowledge = async () => {
  let res = await getArticleApi(id)
  Object.assign(medicalKnowledge, res.data)
}

//返回列表
const back = () => {
  router.push("/content/medical-knowledge")
}


//送出表單
const submitMedicalKnowledgeForm = (form: FormInstance) => {
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
      //賦予進medicalKnowledge響應式對象中
      medicalKnowledge.tempUploadUrl = tempUploadUrlList

      let formData = new FormData();
      // 將響應式對象轉換為普通對象，然後轉換為 JSON 字符串
      const jsonData = JSON.stringify(medicalKnowledge)
      formData.append('data', new Blob([jsonData], { type: "application/json" }))
      formData.append('file', imgFile)


      try {
        //呼叫更新API
        await updateArticleApi(formData)
        //移除臨時上傳檔案URL
        localStorage.removeItem(scope.value)
        //重製上傳的檔案
        imgFile = <UploadRawFile>{}
        //保存後返回列表
        router.push("/content/medical-knowledge")

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
  await getMedicalKnowledge()
  imageUrl.value = protocol + '//' + hostname + '/minio' + medicalKnowledge.coverThumbnailUrl
})

</script>




<style scoped lang="scss">
.medical-knowledge-item-section {
  width: 90%;
  margin: 1% auto;

  .medical-knowledge-card-box {
    min-height: 80vh;

    .medical-knowledge-form {
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
