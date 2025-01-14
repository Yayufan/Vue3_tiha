<!--  -->
<template>
  <section class="organ-donation-consent-section">
    <el-card class="organ-donation-consent-card">
      <h1>同意書申請審核</h1>

      <!-- 如果要用兩種註冊方式再考慮使用這個 -->
      <div class="function-bar">
        <div class="display-count">
          未審核篇數為： {{ organDonationConsentCount }} 篇
        </div>
        <div class="btn-box">
          <el-button type="primary" @click="approvalList" :disabled="selectList.length > 0 ? false : true">
            批量通過<el-icon class="el-icon--right">
              <Plus />
            </el-icon>
          </el-button>

          <el-button type="danger" @click="failedList" :disabled="selectList.length > 0 ? false : true">
            批量廢除<el-icon class="el-icon--right">
              <Delete />
            </el-icon>
          </el-button>
        </div>
      </div>

      <div class="search-bar">
        <el-input v-model="input" style="width: 240px" placeholder="輸入內容,Enter查詢"
          @keydown.enter="getOrganDonationConsent(currentPage, 10)" />
      </div>

      <el-table class="news-table" :data="organDonationConsentList.records" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column fixed prop="name" label="簽署人" width="90" />
        <el-table-column prop="phoneNumber" label="手機" width="120" />
        <el-table-column prop="birthday" label="生日" width="120" />
        <el-table-column prop="idCard" label="身份證字號" width="110" />
        <el-table-column prop="legalRepresentativeName" label="法定代理人" width="100" />
        <el-table-column prop="legalRepresentativeIdCard" label="法定代理人身份證字號" min-width="90" />
        <el-table-column prop="signatureDate" label="簽署日期" width="120" />

        <el-table-column fixed="right" label="操作" width="150">
          <!-- 透過#default="scope" , 獲取到當前的對象值 , scope.row則是拿到當前那個row的數據  -->
          <template #default="scope">
            <el-button type="primary" size="small" @click="approvalRow(scope.row)">
              通過
            </el-button>
            <el-button type="danger" size="small" @click="failedRow(scope.row)">
              不通過</el-button>
          </template>
        </el-table-column>
      </el-table>


      <!-- 
      分頁插件 total為總資料數(這邊設置20筆),  default-page-size代表每頁顯示資料(預設為10筆,這邊設置為5筆) 
      current-page當前頁數,官方建議使用v-model與current-page去與自己設定的變量做綁定,
    -->
      <div class="example-pagination-block news-pagination">
        <el-pagination layout="prev, pager, next" :page-count="Number(organDonationConsentList.pages)"
          :default-page-size="Number(organDonationConsentList.size)" v-model:current-page="currentPage"
          :hide-on-single-page="true" />
      </div>


    </el-card>
  </section>
</template>

<script setup lang='ts'>

import { ref, reactive } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getOrganDonationConsentCountByStatusApi, getOrganDonationConsentByPaginationByStatusApi, updateOrganDonationConsentApi, batchUpdateOrganDonationConsentApi } from '@/api/organDonationConsent'


//獲取路由
const route = useRoute()
//獲取路由器
const router = useRouter()
//formLabel 寬度
const formLabelWidth = '140px'


/**--------------顯示數據相關---------------------------- */

//設定分頁組件,currentPage當前頁數
let currentPage = ref(1)

//獲取未審核的同意書
let organDonationConsentCount = ref(0)

//查詢內容
let input = ref('')


//獲取未審核的同意書List
let organDonationConsentList = reactive<Record<string, any>>({
  records: [{
    name: '',
    phoneNumber: '',
    birthday: '',
    idCard: '',
    legalRepresentativeName: '',
    legalRepresentativeIdCard: '',
    signatureDate: ''

  }]
})

const getOrganDonationConsent = async (page: number, size: number) => {
  let res = await getOrganDonationConsentByPaginationByStatusApi(page, size, "0", input.value)
  Object.assign(organDonationConsentList, res.data)
}

const getOrganDonationConsentCount = async () => {
  let res = await getOrganDonationConsentCountByStatusApi("0")
  organDonationConsentCount.value = res.data
}


//監聽當前頁數的變化,如果有更動就call API 獲取數組數據
watch(currentPage, (value, oldValue) => {
  getOrganDonationConsent(value, 10)
})

/** --------- 審核通過/駁回 相關variable及function -------------- */

//勾選的對象列表
let selectList = reactive<Record<string, any>[]>([])

//當checkbox狀態改變時的function,val是一個數組對象
const handleSelectionChange = (val: any) => {
  //重製selectList,移除所有屬性
  selectList.length = 0
  Object.assign(selectList, val)
}

//駁回同意書申請
const failedRow = (organDonationConsent: any): void => {
  ElMessageBox.confirm(`確定要廢除此簽署申請嗎？`, '確認廢除', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {

    Object.assign(updateOrganDonationConsent, organDonationConsent)
    //將審核狀態更改為駁回
    updateOrganDonationConsent.status = "-1"
    updateOrganDonationConsent.donateOrgans = updateOrganDonationConsent.donateOrgans.split(",")

    // 用户選擇確認，繼續操作
    await updateOrganDonationConsentApi(updateOrganDonationConsent)
    ElMessage.success('廢除成功');

    getOrganDonationConsent(1, 10)

  }).catch((err) => {
    console.log(err)
  });
}

//批量駁回同意書申請的function
const failedList = () => {
  if (selectList.length >= 1) {
    ElMessageBox.confirm(`確定要廢除${selectList.length}個簽署申請嗎？`, '確認廢除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {

      //從List 中透過map方法映射資料, 修改status狀態 和 donateOrgans轉為array 並傳給後端
      let transData = selectList.map(item => {
        return {
          ...(item),
          status: "-1",
          donateOrgans: item.donateOrgans ? item.donateOrgans.split(",") : [] // 確保 donateOrgans 存在
        };
      })

      await batchUpdateOrganDonationConsentApi(transData)
      ElMessage.success("批量審核駁回")


      getOrganDonationConsent(1, 10)

    }).catch((err) => {
      console.log(err)
    })

  } else {
    ElMessage.error("請至少勾選一筆資料進行刪除")
  }
}


/**------------編輯內容相關操作---------------------- */

let updateOrganDonationConsent = reactive<Record<string, any>>({

})

//會員審核通過
const approvalRow = async (organDonationConsent: any) => {

  Object.assign(updateOrganDonationConsent, organDonationConsent)
  //將審核狀態更改為通過
  updateOrganDonationConsent.status = "1"
  updateOrganDonationConsent.donateOrgans = updateOrganDonationConsent.donateOrgans.split(",")

  try {
    await updateOrganDonationConsentApi(updateOrganDonationConsent)
    ElMessage.success("審核通過")
    getOrganDonationConsent(currentPage.value, 10)

  } catch (err) {
    console.log(err)
  }
}

const approvalList = async () => {
  if (selectList.length >= 1) {

    //從List 中透過map方法映射資料, 修改status狀態 和 donateOrgans轉為array 並傳給後端
    let transData = selectList.map(item => {
      return {
        ...(item),
        status: "1",
        donateOrgans: item.donateOrgans ? item.donateOrgans.split(",") : [] // 確保 donateOrgans 存在
      };
    })

    try {
      await batchUpdateOrganDonationConsentApi(transData)
      ElMessage.success("批量審核通過")
      getOrganDonationConsent(currentPage.value, 10)

    } catch (err) {
      console.log(err)
    }
  } else {
    ElMessage.error("請至少勾選一筆資料進行操作")
  }

}

/**-------------------掛載頁面時執行-------------------- */

onMounted(() => {
  getOrganDonationConsentCount()
  getOrganDonationConsent(1, 10)
})




</script>

<style scoped lang="scss">
.organ-donation-consent-section {
  width: 95%;
  margin: 0 auto;

  .organ-donation-consent-card {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin: 1% 0;
  }
}




.function-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  margin-bottom: 1%;


  .display-count {
    margin-left: 1%;
  }

}

.search-bar {
  margin-left: 1%;
}

.news-table {
  width: 100%;
  height: auto;
}


.news-pagination {
  margin-top: 1%;
  margin-bottom: 1%;
}

/**
  使用Vue3 element plus 專屬的改變UI組件CSS 寫法 '深層覆蓋'
  分頁組件引入盒子,重置分頁組件CSS */
:deep(.el-pagination) {

  justify-content: center;

  //重製將分頁組件背景色調為 '無'
  .el-pager li {
    background: none !important;
  }

  //按鈕背景色改成 '無'
  button {
    background: none !important;
  }

  &+& {
    margin-top: 10px;
  }

  .example-demonstration {
    margin-bottom: 16px;
  }

}
</style>
