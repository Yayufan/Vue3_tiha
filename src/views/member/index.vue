<!--  -->
<template>

  <section class="member-section">
    <el-card class="member-card">
      <h1>會員管理</h1>

      <!-- 如果要用兩種註冊方式再考慮使用這個 -->
      <div class="function-bar">
        <div class="display-count">
          <div class="total-count">總數量為： {{ memberCount }} 人</div>
          <div>當前查詢數量為： {{ memberList.total }} 人</div>
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
          @keydown.enter="getMemberByPagination(currentPage, 10)" />

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
          <el-option label="駁回申請" value="2">
            <span style="color:red;">駁回申請</span>
          </el-option>

          <template #label="{ label, value }">
            <span :style="{ color: value == '1' ? 'green' : value == '-1' ? 'red' : 'black' }">{{ label }}</span>
          </template>
        </el-select>

      </div>

      <el-table class="member-table" :data="memberList.records" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column fixed prop="name" label="姓名" width="90" />
        <el-table-column prop="phone" label="手機" width="120" />
        <el-table-column prop="birthday" label="生日" width="120">
          <template #default="scope">
            <el-text>{{ formatToMinguo(scope.row.birthday) }}</el-text>
          </template>
        </el-table-column> <el-table-column prop="idCard" label="身份證字號" width="110" />
        <el-table-column prop="email" label="信箱" width="150" />
        <el-table-column prop="status" label="審核狀態" min-width="120">
          <template #default="scope">
            <span v-if="scope.row.status == '1'" style="color: green;">審核通過</span>
            <span v-else-if="scope.row.status == '2'" style="color: red;">駁回申請</span>
            <span v-else>未審核</span>
          </template>
        </el-table-column>


        <el-table-column fixed="right" label="操作" width="120">
          <!-- 透過#default="scope" , 獲取到當前的對象值 , scope.row則是拿到當前那個row的數據  -->
          <template #default="scope">
            <el-button link type="primary" size="small" @click="editRow(scope.row)">
              Edit
            </el-button>
            <el-button link type="danger" size="small" @click="deleteRow(scope.row.memberId)">
              Delete</el-button>

          </template>
        </el-table-column>
      </el-table>


      <!-- 
      分頁插件 total為總資料數(這邊設置20筆),  default-page-size代表每頁顯示資料(預設為10筆,這邊設置為5筆) 
      current-page當前頁數,官方建議使用v-model與current-page去與自己設定的變量做綁定,
    -->
      <div class="example-pagination-block member-pagination">
        <el-pagination layout="prev, pager, next" :page-count="Number(memberList.pages)"
          :default-page-size="Number(memberList.size)" v-model:current-page="currentPage" :hide-on-single-page="true" />
      </div>



      <!-- 新增對話框 -->
      <!-- <ElDialog v-model="dialogFormVisible" title="新增會員" width="500">

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
      </ElDialog> -->



      <!-- 修改時的Drawer -->
      <el-drawer v-model="drawer" title="I am the title">

        <template #header>
          <h4>資料修改</h4>
        </template>

        <template #default>
          <el-form label-position="top" label-width="auto" :model="updateMemberForm" :rules="updateMemberFormRules"
            ref="updateMemberFormRef">

            <el-form-item label="姓名" prop="name">
              <el-input v-model="updateMemberForm.name" />
            </el-form-item>

            <el-form-item label="身份證字號" prop="idCard">
              <el-input v-model="updateMemberForm.idCard" />
            </el-form-item>

            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker v-model="updateMemberForm.birthday" type="date" format="YYYY-MM-DD"
                @change="updateMemberForm.birthday = parseFromMinguo(updateMemberForm.birthday)" locale="zh-TW">
              </el-date-picker>
            </el-form-item>

            <RocDatePicker v-model="updateMemberForm.birthday" />

            <el-form-item label="性別" prop="gender">
              <el-radio-group v-model="updateMemberForm.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
                <el-radio value="其他">其他 :</el-radio>
              </el-radio-group>
              <el-input class="gender-other" v-if="updateMemberForm.gender === '其他'"
                v-model="updateMemberForm.genderOther">
              </el-input>
            </el-form-item>

            <el-form-item label="服務單位" prop="department">
              <el-input v-model="updateMemberForm.department" placeholder="服務單位">

              </el-input>
            </el-form-item>

            <el-form-item label="職稱" prop="jobTitle">
              <el-input v-model="updateMemberForm.jobTitle" />
            </el-form-item>

            <el-form-item label="連絡電話" prop="phone">
              <el-input v-model="updateMemberForm.phone" />
            </el-form-item>

            <el-form-item label="地址" prop="contactAddress">
              <el-input v-model="updateMemberForm.contactAddress" />
            </el-form-item>

            <el-form-item label="E-Mail" prop="email">
              <el-input v-model="updateMemberForm.email" />
            </el-form-item>

            <el-form-item label="審核狀態" prop="status">
              <el-select v-model="updateMemberForm.status" placeholder="Select" style="width: 240px;">
                <el-option label="未審核" value="0">
                  <span>未審核</span>
                </el-option>
                <el-option label="審核通過" value="1">
                  <span style="color:green;">審核通過</span>
                </el-option>
                <el-option label="駁回申請" value="2">
                  <span style="color:red;">駁回申請</span>
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

import { getMemberApi, getAllMemberApi, getMemberByPaginationApi, getMemberByPaginationByStatusApi, getMemberCountApi, getMemberCountByStatusApi, updateMemberApi, deleteMemberApi, batchDeleteMemberApi, downloadMemberExcelApi } from '@/api/member'




const downloadExcel = async () => {
  let res = await downloadMemberExcelApi()
  console.log(res)
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '會員列表.xlsx');
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
let memberCount = ref(0)



/**--------------顯示數據相關---------------------------- */


const getMemberCount = async () => {
  let res = await getMemberCountApi()
  memberCount.value = res.data
}


//獲取會員List

let memberList = reactive<Record<string, any>>({
  records: [{
    name: '',
    email: '',
    phone: '',
    department: '',
    contactAddress: '',
    jobTitle: '',
    gender: '',
    genderOther: '',
    idCard: '',
    birthday: '',
  }]
})

//設定分頁組件,currentPage當前頁數
let currentPage = ref(1)



const getMemberByPagination = async (page: number, size: number) => {
  let res = await getMemberByPaginationByStatusApi(page, size, filterStatus.value, input.value)
  Object.assign(memberList, res.data)
}


//監聽當前頁數的變化,如果有更動就call API 獲取數組數據
watch(currentPage, (value, oldValue) => {
  getMemberByPagination(value, 10)
})


watch(filterStatus, (value, oldValue) => {
  console.log('filterStatus', value)
  getMemberByPagination(currentPage.value, 10)
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
    await deleteMemberApi(id)
    getMemberByPagination(currentPage.value, 10)

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
      console.log(deleteSelectList)
      let deleteIdList = deleteSelectList.map((item: { memberId: string }) => item.memberId)
      await batchDeleteMemberApi(deleteIdList)
      getMemberByPagination(currentPage.value, 10)
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
        getMemberByPagination(currentPage.value, 10)

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

const updateMemberFormRef = ref()

let updateMemberForm = reactive({
  "name": "",
  "email": "",
  "phone": "",
  "department": "",
  "contactAddress": "",
  "jobTitle": "",
  "gender": "",
  "genderOther": "",
  "idCard": "",
  "birthday": "",
  "status": "",
})

// //編輯的表單內容
// let updateOrganDonationConsentForm = reactive({
//   "name": "",
//   "idCard": "",
//   "birthday": "",
//   "gender": "",
//   "contactNumber": "",
//   "phoneNumber": "",
//   "email": "",
//   "address": "",
//   "legalRepresentativeName": "",
//   "legalRepresentativeIdCard": "",
//   "consentCard": "",
//   "consentCardNumber": "",
//   "reason": "",
//   "wordToFamily": "",
//   "donateOrgans": [] as string[],
//   "remark": "",
//   "healthInsuranceCardAnnotation": "",
//   "healthInsuranceCardAnnotationDate": "",
//   "signatureDate": "",
//   "status": "",
// })

//編輯表單的校驗規則
const updateMemberFormRules = reactive<FormRules>({
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
    },
    {
      validator: (rule, value, callback) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 18) {
          callback(new Error('年齡不能低於18歲'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    }

  ],
  gender: [
    { required: true, message: '請選擇生理性別', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value === '其他' && !updateMemberForm.genderOther) {
          callback(new Error('請填寫其他性別說明'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
  phone: [
    {
      required: true,
      message: '手機號碼不能為空',
      trigger: 'change',
    }
  ],
  email: [
    {
      required: true,
      message: 'E-mail不能為空',
      trigger: 'change',
    },
    {
      type: 'email',
      message: '請輸入正確的E-mail格式',
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
  updateMemberFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      console.log(updateMemberForm)
      await updateMemberApi(updateMemberForm)
      drawer.value = false
      ElMessage.success("修改完成")
      await getMemberByPagination(currentPage.value, 10)


    } else {
      ElMessage.error("請完整填入資訊")
    }
  })

}

const editRow = (member: any): void => {
  Object.assign(updateMemberForm, member)
  console.log(updateMemberForm)
  drawer.value = true
}

const formatToMinguo = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  const minguoYear = (Number(year) - 1911).toString();
  console.log(minguoYear)
  return `${minguoYear}-${month}-${day}`;
};

const parseFromMinguo = (minguoString: string): string => {
  const [minguoYear, month, day] = minguoString.split('-');
  const year = (Number(minguoYear) + 1911).toString();
  return `${year}-${month}-${day}`;
};


/**-------------------掛載頁面時執行-------------------- */

onMounted(() => {
  getMemberByPagination(1, 10)
  getMemberCount()
})




</script>

<style scoped lang="scss">
.member-section {
  width: 95%;
  margin: 0 auto;

  .member-card {
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


.member-table {
  width: 100%;
  height: auto;
}


.member-pagination {
  margin-top: 1%;
  margin-bottom: 1%;
}

.gender-other {
  width: 100px;
  margin-left: 1rem;
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
