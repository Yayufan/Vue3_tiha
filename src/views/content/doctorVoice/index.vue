<!--  -->
<template>

  <section class="article-section">
    <el-card class="article-card">
      <h1>白袍心聲管理</h1>
      <OrganArticleTableNoImg :table="articleList" :getApi="getArticle" :addApi="addArticle" :deleteApi="deleteArticle"
        :batchDeleteApi="batchDeleteArticle" :group="GROUP" :typeOption="typeOption">
      </OrganArticleTableNoImg>
    </el-card>

  </section>

</template>

<script setup lang='ts'>

import { ref, reactive } from 'vue'
import OrganArticleTableNoImg from '@/components/OrganArticleTableNoImg/index.vue'
import { getAllArticleByGroupByPaginationApi, addArticleApi, deleteArticleApi, batchDeleteArticleApi } from '@/api/article'
import { transFormPaginationByArticle } from '@/utils/transFormData'

//獲取路由
const route = useRoute()
//獲取路由器
const router = useRouter()

//設定article_group 
const GROUP = "doctorVoice"

//子類別選項
let typeOption = reactive(["生命之樹", "心跳線", "拼圖塊"])


//後端獲取Page資料後要傳給子組件的數據
let articleList = reactive({})

//獲取最新消息
const getArticle = async (page: number, size: number) => {
  let res = await getAllArticleByGroupByPaginationApi(GROUP, page, size)
  let transData = transFormPaginationByArticle(res.data, "articleId")
  Object.assign(articleList, transData)
  console.log('這是轉換後的數據', articleList)
}

//新增最新消息
const addArticle = async (data: any) => {
  console.log('子組件傳來的data', data)
  let res = await addArticleApi(data)
  const currentPath = route.fullPath
  router.push(currentPath + '/' + res.data)
  getArticle(1, 10)
}

//刪除最新消息
const deleteArticle = async (id: number) => {
  await deleteArticleApi(id)
  getArticle(1, 10)
}

//批量刪除最新消息
const batchDeleteArticle = async (data: any) => {
  await batchDeleteArticleApi(data)
  getArticle(1, 10)
}

//頁面掛載時獲取數據
onMounted(() => {
  getArticle(1, 10)
})

</script>

<style scoped lang="scss">
.article-section {
  width: 95%;
  margin: 0 auto;

  .article-card {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin: 1% 0;
  }
}
</style>
