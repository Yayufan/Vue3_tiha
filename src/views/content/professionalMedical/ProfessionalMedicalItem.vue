<!--  -->
<template>
  <section class="professional-medical-item-section">
    <el-card class="professional-medical-card-box">
      <el-form :model="professionalMedical" class="professional-medical-form" ref="professionalMedicalForm"
        :rules="professionalMedicalRules" label-position="top">

        <div class="outer-input-box">

          <div class="text-input-box">
            <el-form-item label="文章類別" prop="type">
              <el-tree-select v-model="professionalMedical.categoryId" value-key="id" :data="categoryOption"
                :render-after-expand="false" style="width: 240px" :empty-values="[null, undefined]"
                :value-on-clear=null>
              </el-tree-select>
            </el-form-item>
            <el-form-item label="文章標題" prop="title">
              <el-input v-model="professionalMedical.title" placeholder="消息標題" />
            </el-form-item>
            <el-form-item label="文章描述">
              <el-input type="textarea" v-model="professionalMedical.description" autocomplete="off" />
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
          <el-button type="primary" @click="submitProfessionalMedicalForm(professionalMedicalForm)">保存</el-button>
        </div>
      </el-form>

      <CustomCKEditor :scope="scope" :htmlContent="professionalMedical.content" :updateContent="updateContent">
      </CustomCKEditor>

    </el-card>

  </section>

</template>

<script setup lang='ts'>

import { ref, reactive } from 'vue'
import CustomCKEditor from '@/components/CustomCKEditor/index.vue'
import type { FormInstance, FormRules, UploadRawFile, UploadProps } from 'element-plus'
import { updateArticleApi, getArticleApi } from '@/api/article'
import { getAllArticleCategoryByGroupApi } from '@/api/articleCategory'

const props = defineProps(['id'])


const GROUP = "professionalMedical"


/**  使用CustomCKEditor組件的配置  */
//數據,父傳子
const scope = ref("professionalMedicalScope")


/** -------------------------- 文章類別 ------------------- */


/**
 * 一個轉換function , 因為後端已經定義好資料庫了這邊要進行轉換,放進element plus組件才比較好處理
 * 這邊將數組放入,將professionalMedicalCategoryId(PMI key)取出,賦予別名為id; name取出,賦予別名label方便後面通用組件顯示
 * 
 * @param arr 
 */
const transformArray = (arr: Record<string, any>[], primaryKeyName: string): Record<string, any>[] => {
  //在遍歷的每個item直接進行解構賦值,提取professionalMedicalCategoryId改名為id,以及其他屬性
  //因為我們是要直接返回對象,對象的寫法為{},這個跟箭頭函數後面方法體的符號衝突,所以用()括號起來,避免解析錯誤
  return arr.map(({ [primaryKeyName]: id, name: label, ...rest }) => ({
    id,
    label,
    ...rest,
    children: rest.children ? transformArray(rest.children, primaryKeyName) : null
  }));
}


//文章類別
let categoryOption = reactive([])

//獲取所有專業醫療類別
const getAllProfessionalMedicalCategory = async () => {
  let res = await getAllArticleCategoryByGroupApi(GROUP)
  //重置數組
  categoryOption.length = 0
  //從後端獲取嵌套table後,進行轉換後賦值
  let transformCategoryTable = transformArray(res.data, "articleCategoryId");
  Object.assign(categoryOption, transformCategoryTable)
}


/** --------------------------------------------------------------------- */

//文章表單內容
const professionalMedical = reactive<Record<string, any>>({
  articleId: '',
  catrgoryId: '',
  type: '',
  title: '',
  description: null,
  content: '',
  coverThumbnailUrl: ''

});

//方法,子傳父
const updateContent = (newValue: string) => {
  professionalMedical.content = newValue;
};

/** 當前組件的配置  */
const protocol = window.location.protocol; // 获取当前协议 (例如 "http:" 或 "https:")
const hostname = window.location.hostname; // 获取当前域名 (例如 "www.example.com")

const envAPI = import.meta.env.VITE_APP_BASE_API;
const imageUrl = ref()

//圖片數據
let imgFile = <UploadRawFile>{}

const route = useRoute()
//獲取路由器
const router = useRouter()
//獲取新增最新消息表單DOM
const professionalMedicalForm = ref()
//表單校驗規則
const professionalMedicalRules = reactive({
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
const getProfessionalMedical = async () => {
  let res = await getArticleApi(props.id)
  Object.assign(professionalMedical, res.data)
}

//返回列表
const back = () => {
  console.log(route)
  router.push("/content/professional-medical")
}


//送出表單
const submitProfessionalMedicalForm = (form: FormInstance) => {
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
      //賦予進professionalMedical響應式對象中
      professionalMedical.tempUploadUrl = tempUploadUrlList

      let formData = new FormData();
      // 將響應式對象轉換為普通對象，然後轉換為 JSON 字符串
      const jsonData = JSON.stringify(professionalMedical)
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
        router.push("/content/professional-medical")

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
  await getAllProfessionalMedicalCategory()
  await getProfessionalMedical()
  imageUrl.value = protocol + '//' + hostname + '/minio' + professionalMedical.coverThumbnailUrl
})


</script>

<style scoped lang="scss">
.professional-medical-item-section {
  width: 90%;
  margin: 1% auto;

  .professional-medical-card-box {
    min-height: 80vh;

    .professional-medical-form {
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
