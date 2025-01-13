<!--  -->
<template>

  <section class="education-surgery-section">
    <el-card class="education-surgery-card">
      <h1>手術衛教文章管理</h1>


      <CategoryArticleTable :table="educationSurgeryTable" :categoryTable="categoryTable" :addApi="addEducationSurgery"
        :deleteApi="deleteEducationSurgery" :getApi="getEducationSurgery" :batchDeleteApi="batchDeleteEducationSurgery"
        :group="GROUP">
      </CategoryArticleTable>

    </el-card>

  </section>
</template>

<script setup lang='ts'>

import { ref, reactive } from 'vue'
import CategoryArticleTable from '@/components/CategoryArticleTable/index.vue'
import { getAllArticleCategoryByGroupApi } from '@/api/articleCategory'
import { getAllArticleByGroupByPaginationApi, addArticleApi, deleteArticleApi, batchDeleteArticleApi } from '@/api/article'

//獲取路由和路由器
const route = useRoute()
const router = useRouter()

//設定group_type
const GROUP = "educationSurgery"

/**
 * 一個轉換function , 因為後端已經定義好資料庫了這邊要進行轉換,放進element plus組件才比較好處理
 * 這邊將數組放入,將articleCatrgoryId(PMI key)取出,賦予別名為id; name取出,賦予別名label方便後面通用組件顯示
 * 
 * @param arr 
 */
const transformArray = (arr: Record<string, any>[], primaryKeyName: string): Record<string, any>[] => {
  //在遍歷的每個item直接進行解構賦值,提取articleCatrgoryId改名為id,以及其他屬性
  //因為我們是要直接返回對象,對象的寫法為{},這個跟箭頭函數後面方法體的符號衝突,所以用()括號起來,避免解析錯誤
  return arr.map(({ [primaryKeyName]: id, name: label, ...rest }) => ({
    id,
    label,
    ...rest,
    children: rest.children ? transformArray(rest.children, primaryKeyName) : null
  }));
}


/**
 * 用於轉換成子組件需要的分頁對象, 主要是後端的主鍵id 要轉成前端通用的id, 
 * @param response Java mybatis plus IPage對象的返回值
 * @param primaryKeyName 後端實際傳來的主鍵名
 */
function transFormPagination(response: any, primaryKeyName: string) {
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


/** ------------------------------------------------------ */

//手術衛教文章分頁列表
const educationSurgeryTable = reactive({})
//手術衛教文章類別
const categoryTable = reactive([])

//獲取所有手術衛教類別
const getAllEducationSurgeryCategory = async () => {
  let res = await getAllArticleCategoryByGroupApi(GROUP)
  //重置數組
  categoryTable.length = 0
  //從後端獲取嵌套table後,進行轉換後賦值
  let transformCategoryTable = transformArray(res.data, "articleCategoryId");
  Object.assign(categoryTable, transformCategoryTable)
  console.log('這是在手術衛教文章獲取的類別', categoryTable)
}

//獲取手術衛教文章(分頁)
const getEducationSurgery = async (page: number, size: number) => {
  let res = await getAllArticleByGroupByPaginationApi(GROUP, page, size)
  let transData = transFormPagination(res.data, "articleId")
  Object.assign(educationSurgeryTable, transData)
  console.log('獲取手術衛教文章', educationSurgeryTable)
}


//新增手術衛教文章
const addEducationSurgery = async (data: any) => {
  let res = await addArticleApi(data)
  getAllEducationSurgeryCategory()
  let currentPath = route.fullPath
  router.push(currentPath + '/' + res.data)
}

//刪除手術衛教文章
const deleteEducationSurgery = async (id: number) => {
  await deleteArticleApi(id)

}

//批量刪除手術衛教文章
const batchDeleteEducationSurgery = async (data: any) => {
  await batchDeleteArticleApi(data)
}

//頁面掛載時執行
onMounted(() => {
  getAllEducationSurgeryCategory()
  getEducationSurgery(1, 10)
})

</script>

<style scoped lang="scss">
//這個組件的setion
.education-surgery-section {
  width: 95%;
  margin: 0 auto;


  //這個組件的card
  .education-surgery-card {
    margin-top: 2%;
    margin-bottom: 2%;

    //這個組件的標題
    h1 {
      text-align: center;
      font-size: 2rem;
      margin: 1% 0;
    }

  }
}
</style>
