<!--  -->
<template>

  <section class="news-section">
    <el-card class="news-card">
      <h1>最新消息管理</h1>
      <ArticleTableNoImg :table="newsList" :getApi="getNews" :addApi="addNews" :deleteApi="deleteNews"
        :batchDeleteApi="batchDeleteNews" :group="GROUP">
      </ArticleTableNoImg>
    </el-card>

  </section>

</template>

<script setup lang='ts'>

import { ref, reactive } from 'vue'
import ArticleTableNoImg from '@/components/ArticleTableNoImg/index.vue'
import { getAllArticleByGroupByPaginationApi, addArticleApi, deleteArticleApi, batchDeleteArticleApi } from '@/api/article'

//獲取路由
const route = useRoute()
//獲取路由器
const router = useRouter()

//設定article_group 
const GROUP = "news"

/**
 * 用於轉換成子組件需要的分頁對象, 主要是後端的主鍵id 要轉成前端通用的id, 
 * @param response Java mybatis plus IPage對象的返回值
 * @param primaryKeyName 後端實際傳來的主鍵名
 */
function transFormPagination(response: any, primaryKeyName: any) {
  //傳入後端響應值,透過解構賦值,提取records(搜索資料) 和 其餘分頁資料
  const { records, ...paginationData } = response;
  //使用JS數組的map方法,她會開始遍歷數組,映射並重新組裝
  const transformedRecords = records.map((record: any) => {
    //每次拿到一筆資料,透過解構賦值,提取後端資料的newsId 和 其他數據資料; 
    // [primaryKeyName] 是使用計算屬性的方式,動態決定要解構的屬性,並重新賦予屬姓名,這邊直接取id
    const { [primaryKeyName]: id, ...rest } = record;
    //把主鍵名從newsId更換為id , 其餘數據資料不變動,組裝後返回 ; 
    //這邊注意一定要...rest返回其他key-value, 不然他會包裝成一個叫rest的key-value對象
    return {
      ...rest,
      id
    };
  });

  //這邊拿著重新組裝完原始資料的數據 和 其餘分頁資料,進行組裝後返回
  return {
    records: transformedRecords,
    ...paginationData
  };

}



//後端獲取Page資料後要傳給子組件的數據
let newsList = reactive({})

//獲取最新消息
const getNews = async (page: number, size: number) => {
  let res = await getAllArticleByGroupByPaginationApi(GROUP, page, size)
  let transData = transFormPagination(res.data, "articleId")
  Object.assign(newsList, transData)
  console.log('這是轉換後的數據', newsList)
}

//新增最新消息
const addNews = async (data: any) => {
  console.log('子組件傳來的data', data)
  let res = await addArticleApi(data)
  const currentPath = route.fullPath
  router.push(currentPath + '/' + res.data)
  getNews(1, 10)
}

//刪除最新消息
const deleteNews = async (id: number) => {
  await deleteArticleApi(id)
  getNews(1, 10)
}

//批量刪除最新消息
const batchDeleteNews = async (data: any) => {
  await batchDeleteArticleApi(data)
  getNews(1, 10)
}

//頁面掛載時獲取數據
onMounted(() => {
  getNews(1, 10)
})

</script>

<style scoped lang="scss">
.news-section {
  width: 95%;
  margin: 0 auto;

  .news-card {
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
