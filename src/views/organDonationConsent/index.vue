<!--  -->
<template>

  <section class="organ-donation-consent-section">
    <el-card class="organ-donation-consent-card">
      <h1>器捐同意書管理</h1>

      <!-- 如果要用兩種註冊方式再考慮使用這個 -->
      <div class="function-bar">
        <div class="display-count">
          <div class="total-count">總數量為： {{ organDonationConsentCount }} 篇</div>
          <div>當前查詢數量為： {{ organDonationConsentList.total }} 篇</div>
        </div>

        <div class="btn-box">

          <!-- <el-button type="primary" @click="toggleAddDialog">
            新增<el-icon class="el-icon--right">
              <Plus />
            </el-icon>
          </el-button> -->

          <el-button type="danger" @click="deleteList" :disabled="deleteSelectList.length > 0 ? false : true">
            刪除<el-icon class="el-icon--right">
              <Delete />
            </el-icon>
          </el-button>

          <el-button type="success" @click="downloadExcel">下載Excel</el-button>
        </div>
      </div>

      <div class="search-bar">
        <el-input v-model="input" style="width: 240px" placeholder="輸入內容,Enter查詢"
          @keydown.enter="getOrganDonationConsent(currentPage, 10)" />

        <el-select v-model="filterStatus" style="width: 240px;" class="filter-status" placeholder="請選擇">
          <el-option label="全選" value="">
            <span>全選</span>
          </el-option>
          <el-option label="未審核" value="0">
            <span>未審核</span>
          </el-option>
          <el-option label="審核通過" value="1">
            <span style="color:green;">審核通過</span>
          </el-option>
          <el-option label="撤銷簽署" value="-1">
            <span style="color:red;">撤銷簽署</span>
          </el-option>

          <template #label="{ label, value }">
            <span :style="{ color: value == '1' ? 'green' : value == '-1' ? 'red' : 'black' }">{{ label }}</span>
          </template>
        </el-select>

      </div>

      <el-table class="organ-donation-consent-table" :data="organDonationConsentList.records"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column fixed prop="name" label="簽署人" width="90" />
        <el-table-column prop="phoneNumber" label="手機" width="120" />
        <el-table-column prop="birthday" label="生日" width="120" />
        <el-table-column prop="idCard" label="身份證字號" width="110" />
        <!-- <el-table-column prop="legalRepresentativeName" label="法定代理人" width="100" />
        <el-table-column prop="legalRepresentativeIdCard" label="法定代理人身份證字號" min-width="90" /> -->
        <el-table-column prop="signatureDate" label="簽署日期" width="120" />
        <el-table-column prop="status" label="審核狀態" min-width="120">
          <template #default="scope">
            <span v-if="scope.row.status == '1'" style="color: green;">審核通過</span>
            <span v-else-if="scope.row.status == '-1'" style="color: red;">撤銷簽署</span>
            <span v-else>未審核</span>
          </template>
        </el-table-column>


        <el-table-column fixed="right" label="操作" width="120">
          <!-- 透過#default="scope" , 獲取到當前的對象值 , scope.row則是拿到當前那個row的數據  -->
          <template #default="scope">
            <el-button link type="primary" size="small" @click="editRow(scope.row)">
              Edit
            </el-button>
            <el-button link type="danger" size="small" @click="deleteRow(scope.row.organDonationConsentId)">
              Delete</el-button>

          </template>
        </el-table-column>
      </el-table>


      <!-- 
      分頁插件 total為總資料數(這邊設置20筆),  default-page-size代表每頁顯示資料(預設為10筆,這邊設置為5筆) 
      current-page當前頁數,官方建議使用v-model與current-page去與自己設定的變量做綁定,
    -->
      <div class="example-pagination-block member-pagination">
        <el-pagination layout="prev, pager, next" :page-count="Number(organDonationConsentList.pages)"
          :default-page-size="Number(organDonationConsentList.size)" v-model:current-page="currentPage"
          :hide-on-single-page="true" />
      </div>



      <!-- 新增對話框 -->
      <ElDialog v-model="dialogFormVisible" title="新增會員" width="500">

        <el-form :model="insertMemberFormData" ref="form" :rules="insertOrganDonationConsentRules">

          <el-form-item label="Email" :label-width="formLabelWidth" prop="email">
            <el-input v-model="insertMemberFormData.email" autocomplete="off" />
          </el-form-item>

          <el-form-item label="密碼" :label-width="formLabelWidth" prop="password">
            <el-input v-model="insertMemberFormData.password" autocomplete="off" />
          </el-form-item>

          <el-form-item label="姓名" :label-width="formLabelWidth" prop="name">
            <el-input v-model="insertMemberFormData.name" autocomplete="off" />
          </el-form-item>

          <el-form-item label="院所" :label-width="formLabelWidth" prop="department">
            <el-input v-model="insertMemberFormData.department" autocomplete="off" />
          </el-form-item>

          <el-form-item label="職稱" :label-width="formLabelWidth" prop="jobTitle">
            <el-input v-model="insertMemberFormData.jobTitle" autocomplete="off" />
          </el-form-item>

          <el-form-item label="聯絡電話" :label-width="formLabelWidth" prop="phone">
            <el-input v-model="insertMemberFormData.phone" autocomplete="off" />
          </el-form-item>

        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="dialogFormVisible = false">取消</ElButton>
            <ElButton type="primary" @click="submitInsertForm(form)">
              送出
            </ElButton>
          </div>
        </template>
      </ElDialog>



      <!-- 修改時的Drawer -->
      <el-drawer v-model="drawer" title="I am the title">

        <template #header>
          <h4>資料修改</h4>
        </template>

        <template #default>
          <el-form label-position="top" label-width="auto" :model="updateOrganDonationConsentForm"
            :rules="updateOrganDonationConsentFormRules" ref="updateOrganDonationConsentFormRef">

            <el-form-item label="姓名" prop="name">
              <el-input v-model="updateOrganDonationConsentForm.name" />
            </el-form-item>

            <el-form-item label="備註" prop="remark">
              <el-input v-model="updateOrganDonationConsentForm.remark" type="textarea" :rows="3" />
            </el-form-item>

            <el-form-item label="願意捐贈器官/組織項目(可複選)" prop="donateOrgans">

              <el-checkbox-group v-model="updateOrganDonationConsentForm.donateOrgans">
                <div class="checkbox-div">
                  <el-checkbox label="全部捐贈" value="all"></el-checkbox>
                  <el-checkbox label="肺臟" value="lung"></el-checkbox>
                  <el-checkbox label="胰臟" value="pancreas"></el-checkbox>
                  <el-checkbox label="小腸" value="smallIntestine"></el-checkbox>
                </div>
                <div class="checkbox-div">
                  <el-checkbox label="皮膚" value="skin"></el-checkbox>
                  <el-checkbox label="心瓣膜" value="heartValve"></el-checkbox>
                  <el-checkbox label="心臟" value="heart"></el-checkbox>
                  <el-checkbox label="肝臟" value="liver"></el-checkbox>
                </div>
                <div class="checkbox-div">
                  <el-checkbox label="腎臟" value="kidney"></el-checkbox>
                  <el-checkbox label="眼角膜" value="cornea"></el-checkbox>
                  <el-checkbox label="骨骼" value="bones"></el-checkbox>
                  <el-checkbox label="血管" value="bloodVessels"></el-checkbox>
                </div>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="健保卡註記" prop="healthInsuranceCardAnnotation">
              <el-input v-model="updateOrganDonationConsentForm.healthInsuranceCardAnnotation" />
            </el-form-item>

            <el-form-item label="健保卡註記日期" prop="healthInsuranceCardAnnotationDate">
              <el-date-picker v-model="updateOrganDonationConsentForm.healthInsuranceCardAnnotationDate" type="date"
                value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>

            <el-form-item label="身份證字號" prop="idCard">
              <el-input v-model="updateOrganDonationConsentForm.idCard" />
            </el-form-item>

            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker v-model="updateOrganDonationConsentForm.birthday" type="date"
                value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>

            <el-form-item label="性別" prop="gender">
              <el-radio-group v-model="updateOrganDonationConsentForm.gender">
                <el-radio value="1">男</el-radio>
                <el-radio value="2">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="連絡電話" prop="contactNumber">
              <el-input v-model="updateOrganDonationConsentForm.contactNumber" />
            </el-form-item>

            <el-form-item label="手機號碼" prop="phoneNumber">
              <el-input v-model="updateOrganDonationConsentForm.phoneNumber" />
            </el-form-item>

            <el-form-item label="地址" prop="address">
              <el-input v-model="updateOrganDonationConsentForm.address" />
            </el-form-item>

            <el-form-item label="E-Mail" prop="email">
              <el-input v-model="updateOrganDonationConsentForm.email" />
            </el-form-item>

            <el-form-item label="簽署日期" prop="signatureDate">
              <el-date-picker v-model="updateOrganDonationConsentForm.signatureDate" type="date"
                value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>

            <el-form-item label="法定代理人姓名" prop="legalRepresentativeName">
              <el-input v-model="updateOrganDonationConsentForm.legalRepresentativeName" />
            </el-form-item>

            <el-form-item label="法定代理人身份證" prop="legalRepresentativeIdCard">
              <el-input v-model="updateOrganDonationConsentForm.legalRepresentativeIdCard" />
            </el-form-item>

            <el-form-item label="捐贈理由" prop="reason">
              <el-input v-model="updateOrganDonationConsentForm.reason" type="textarea" :rows="4" />
            </el-form-item>

            <el-form-item label="對家人的話" prop="wordToFamily">
              <el-input v-model="updateOrganDonationConsentForm.wordToFamily" type="textarea" :rows="4" />
            </el-form-item>

            <el-form-item label="是否需要簽署同意卡" prop="consentCard">
              <el-radio-group v-model="updateOrganDonationConsentForm.consentCard">
                <el-radio value="-1">不需要</el-radio>
                <el-radio value="1">需要</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="updateOrganDonationConsentForm.consentCard == '1'" label="簽署同意卡-卡號"
              prop="consentCardNumber">
              <el-input v-model="updateOrganDonationConsentForm.consentCardNumber" />
            </el-form-item>

            <el-form-item label="審核狀態" prop="status">
              <el-select v-model="updateOrganDonationConsentForm.status" placeholder="Select" style="width: 240px;">
                <el-option label="未審核" value="0">
                  <span>未審核</span>
                </el-option>
                <el-option label="審核通過" value="1">
                  <span style="color:green;">審核通過</span>
                </el-option>
                <el-option label="撤銷簽署" value="-1">
                  <span style="color:red;">撤銷簽署</span>
                </el-option>

                <template #label="{ label, value }">
                  <span :style="{ color: value == '1' ? 'green' : value == '-1' ? 'red' : 'black' }">{{ label }}</span>
                </template>
              </el-select>

            </el-form-item>

          </el-form>
        </template>


        <template #footer>
          <div style="flex: auto">
            <el-button @click="cancelClick">取消</el-button>
            <el-button type="primary" @click="confirmClick()">送出</el-button>
          </div>
        </template>

      </el-drawer>
    </el-card>

  </section>

</template>

<script setup lang='ts'>

import { ref, reactive } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

import { getOrganDonationConsentCountApi, getOrganDonationConsentByPaginationApi, getOrganDonationConsentByPaginationByStatusApi, updateOrganDonationConsentApi, deleteOrganDonationConsentApi, batchDeleteOrganDonationConsentApi, downloadExcelOrganDonationConsentApi } from '@/api/organDonationConsent'

const downloadExcel = async () => {
  let res = await downloadExcelOrganDonationConsentApi()
  console.log(res)
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '簽署同意書列表.xlsx');
  document.body.appendChild(link);
  link.click();
}

//獲取路由
const route = useRoute()
//獲取路由器
const router = useRouter()
//formLabel 寬度
const formLabelWidth = '140px'

//查詢內容
let input = ref('')

//篩選審核狀態,預設找已經過審的
let filterStatus = ref('')

//獲取同意書總數
let organDonationConsentCount = ref(0)


/**--------------顯示數據相關---------------------------- */

const getOrganDonationConsentCount = async () => {
  let res = await getOrganDonationConsentCountApi()
  organDonationConsentCount.value = res.data
}


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

//設定分頁組件,currentPage當前頁數
let currentPage = ref(1)


const getOrganDonationConsent = async (page: number, size: number) => {

  let res = await getOrganDonationConsentByPaginationByStatusApi(page, size, filterStatus.value, input.value)
  console.log('當前篩選狀態', filterStatus.value)
  Object.assign(organDonationConsentList, res.data)
}


//監聽當前頁數的變化,如果有更動就call API 獲取數組數據
watch(currentPage, (value, oldValue) => {
  getOrganDonationConsent(value, 10)
})

watch(filterStatus, (value, oldValue) => {
  getOrganDonationConsent(currentPage.value, 10)
})

/** --------- 刪除相關variable及function -------------- */

//要刪除的對象列表
let deleteSelectList = reactive([])

//當checkbox狀態改變時的function,val是一個數組對象
const handleSelectionChange = (val: any) => {
  //重製deleteSelectList,移除所有屬性
  deleteSelectList.length = 0
  Object.assign(deleteSelectList, val)
}

//刪除同意書
const deleteRow = (id: number): void => {
  ElMessageBox.confirm(`確定要刪除此資料嗎？`, '確認刪除', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 用户選擇確認，繼續操作
    await deleteOrganDonationConsentApi(id)
    getOrganDonationConsent(currentPage.value, 10)

    ElMessage.success('刪除成功');
  }).catch((err) => {
    console.log(err)
  });
}

//批量刪除同意書的function
const deleteList = () => {
  if (deleteSelectList.length >= 1) {
    ElMessageBox.confirm(`確定要刪除這${deleteSelectList.length}個同意書嗎？`, '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      //確定刪除後使用父組件傳來的function
      //提取idList
      let deleteIdList = deleteSelectList.map((item: { organDonationConsentId: string }) => item.organDonationConsentId)
      await batchDeleteOrganDonationConsentApi(deleteIdList)
      getOrganDonationConsent(currentPage.value, 10)
      ElMessage.success('刪除成功');
    }).catch((err) => {
      console.log(err)
    })

  } else {
    ElMessage.error("請至少勾選一筆資料進行刪除")
  }
}

/**-------------表單相關variable及function------------------------- */

//是否顯示表單dialog
const dialogFormVisible = ref(false)

//表單實例
const form = ref()

//表單數據
const insertMemberFormData = reactive({
  email: '',
  password: '',
  name: '',
  department: '',
  jobTitle: '',
  phone: '',
})

//表單校驗規則
const insertOrganDonationConsentRules = reactive<FormRules>({
  email: [
    {
      required: true,
      message: 'E-mail不能為空',
      trigger: 'blur',
    },
    {
      type: 'email',
      message: '請輸入正確的E-mail格式',
      trigger: 'blur'
    },
  ],
  password: [
    {
      required: true,
      message: '密碼不能為空',
      trigger: 'blur',
    },
  ],
  name: [
    {
      required: true,
      message: '姓名不能為空',
      trigger: 'blur',
    }
  ],
  department: [
    {
      required: true,
      message: '院所不能為空',
      trigger: 'blur',
    }
  ],
  jobTitle: [
    {
      required: true,
      message: '職稱不能為空',
      trigger: 'blur',
    }
  ],
  phone: [
    {
      required: true,
      message: '電話不能為空',
      trigger: 'blur',
    },
  ],

})

//顯示新增Dialog
const toggleAddDialog = () => {
  dialogFormVisible.value = true
}

//送出表單方法
const submitInsertForm = (form: FormInstance | undefined) => {
  //沒有抓到的這個Dom直接返回
  if (!form) return
  form.validate(async (valid) => {
    if (valid) {
      try {
        //呼叫父組件給的新增function API
        // await addMemberApi(insertMemberFormData)
        ElMessage.success('新增成功');
        getOrganDonationConsent(currentPage.value, 10)

      } catch (err: any) {
        console.log(err)
      }
      //最終都將這個dialog關掉
      dialogFormVisible.value = false

    } else {
      ElMessage.error("請完整填入資訊")
    }
  })
}


/**------------編輯內容相關操作---------------------- */

//drawer的開關
const drawer = ref(false)

//drawer內,取消按鈕
const cancelClick = () => {
  drawer.value = false
}

//編輯的表單元素本身
const updateOrganDonationConsentFormRef = ref()

//編輯的表單內容
let updateOrganDonationConsentForm = reactive({
  "name": "",
  "idCard": "",
  "birthday": "",
  "gender": "",
  "contactNumber": "",
  "phoneNumber": "",
  "email": "",
  "address": "",
  "legalRepresentativeName": "",
  "legalRepresentativeIdCard": "",
  "consentCard": "",
  "consentCardNumber": "",
  "reason": "",
  "wordToFamily": "",
  "donateOrgans": [] as string[],
  "remark": "",
  "healthInsuranceCardAnnotation": "",
  "healthInsuranceCardAnnotationDate": "",
  "signatureDate": "",
  "status": "",
})

//編輯表單的校驗規則
const updateOrganDonationConsentFormRules = reactive<FormRules>({
  name: [
    {
      required: true,
      message: '姓名不能為空',
      trigger: 'change',
    },
  ],
  idCard: [
    {
      required: true,
      message: '身份證字號不能為空',
      trigger: 'change',
    },
  ],
  birthday: [
    {
      required: true,
      message: '生日不能為空',
      trigger: 'change',
    },
    {
      type: "date",
      message: '必須為日期',
      trigger: 'change',
    }
  ],
  gender: [{
    required: true,
    message: '性別不能為空',
    trigger: 'change',
  },],
  contactNumber: [
    {
      required: true,
      message: '電話號碼不能為空',
      trigger: 'change',
    }
  ],
  phoneNumber: [
    {
      required: true,
      message: '手機號碼不能為空',
      trigger: 'change',
    }
  ],
  address: [
    {
      required: true,
      message: '地址不能為空',
      trigger: 'change',
    }
  ],

  legalRepresentativeName: [
    {
      required: true,
      message: '法定代理人姓名不能為空',
      trigger: 'change',
    },
  ],
  legalRepresentativeIdCard: [
    {
      required: true,
      message: '法定代理人身份證不能為空',
      trigger: 'change',
    },
  ],
  consentCard: [
    {
      required: true,
      message: '是選擇需要簽署同意卡',
      trigger: 'change',
    },
  ],
  donateOrgans: [
    {
      type: 'array',
      required: true,
      message: '請至少勾選一個捐贈項目',
      trigger: 'change',
    },
  ],
  signatureDate: [
    {
      required: true,
      message: '簽署日期不能為空',
      trigger: 'change',
    },
  ],
  status: [
    {
      required: true,
      message: '請選擇審核狀態',
      trigger: 'change',
    },
  ],

})

//drawer內,確認按鈕
const confirmClick = async () => {
  //沒有抓到的這個Dom直接返回
  updateOrganDonationConsentFormRef.value.validate(async (valid: boolean) => {
    if (valid) {

      await updateOrganDonationConsentApi(updateOrganDonationConsentForm)
      drawer.value = false
      ElMessage.success("修改完成")
      await getOrganDonationConsent(currentPage.value, 10)


    } else {
      ElMessage.error("請完整填入資訊")
    }
  })

}

//編輯資料按鈕
const editRow = (organDonationConsent: any): void => {
  Object.assign(updateOrganDonationConsentForm, organDonationConsent)
  if (typeof updateOrganDonationConsentForm.donateOrgans === "string") {
    updateOrganDonationConsentForm.donateOrgans = (updateOrganDonationConsentForm.donateOrgans as string).split(",")
  }
  console.log(updateOrganDonationConsentForm)
  drawer.value = true
}


/**-------------------掛載頁面時執行-------------------- */

onMounted(() => {
  getOrganDonationConsent(1, 10)
  getOrganDonationConsentCount()
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
  margin-bottom: 1%;

  .total-count {
    font-weight: 600;
  }

}

.filter-status {
  margin-left: 10px;
}


.organ-donation-consent-table {
  width: 100%;
  height: auto;
}


.member-pagination {
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
