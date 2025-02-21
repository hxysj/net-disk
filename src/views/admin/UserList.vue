<template>
  <div class="top">
    <div class="input-group">
      <span class="input-group-text iconfont icon-search"></span>
      <input
        type="text"
        placeholder="支持模糊搜索"
        v-model="searchForm.value"
        class="form-control"
        @keyup.enter="search"
      />
    </div>
    <select
      class="form-select form-select-sm"
      aria-label=".form-select-lg example"
      v-model="searchForm.status"
    >
      <option value="not_search">全部</option>
      <option :value="true" selected>启用</option>
      <option :value="false">禁用</option>
    </select>
    <button class="btn btn-primary" type="button" @click="search">搜索</button>
    <div class="iconfont icon-refresh refresh" @click="loadDataList"></div>
  </div>
  <div class="user-list">
    <table class="table table-hover">
      <thead>
        <th v-for="col in columns">{{ col.label }}</th>
      </thead>

      <tbody>
        <tr v-for="row in tableData.list">
          <td><img :src="baseurl + row.avatar" alt="" /></td>
          <td>{{ row.nickName }}</td>
          <td>
            {{ formatFileSize(row.useSpace) }}/{{
              formatFileSize(row.totalSpace)
            }}
          </td>
          <td>{{ row.joinTime.split(".")[0].replace("T", " ") }}</td>
          <td>
            {{
              row.lastLoginTime &&
              row.lastLoginTime.split(".")[0].replace("T", " ")
            }}
          </td>
          <td class="changeStatus">
            <span v-if="row.status" style="color: #569261">启用</span>
            <span v-else class="text-danger">禁用</span>
          </td>
          <td>
            <div class="op">
              <span class="text-primary" @click="changeSpace(row)"
                >分配空间</span
              >
              <span
                v-if="row.status"
                class="text-primary"
                @click="changeStatus(row)"
                >禁用</span
              >
              <span style="color: #569261" v-else @click="changeStatus(row)"
                >启用</span
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination" v-if="tableData.pageTotal">
      <Pagination
        :pageTotal="tableData.pageTotal"
        :pageNo="tableData.pageNo"
        :countShow="tableData.pageSize"
        @changeNum="paginationChange"
      />
    </div>
    <MessageModal
      ref="messageModal"
      @submit="submitChangeStatus"
    ></MessageModal>
    <!-- 更改用户空间的模态框 -->
    <div
      class="modal"
      :style="{ display: showChangeSpace ? 'block' : '' }"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">分配空间</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="closeSpace"
            ></button>
          </div>
          <div class="modal-body">
            <div class="space-item">
              <div class="item-left">用户:</div>
              <div>{{ currentUser?.nickName }}</div>
            </div>
            <div class="space-item">
              <div class="item-left">空间大小:</div>
              <div class="input-group">
                <input type="text" class="form-control" v-model="newSpace" />
                <div class="input-group-text">MB</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="closeSpace"
            >
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :class="[newSpace ? '' : 'disabled']"
              @click="submitSpace"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
    <MessageToast ref="messageToast"></MessageToast>
    <Loadding ref="loadding"></Loadding>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, getCurrentInstance } from "vue";
import { formatFileSize } from "@/utils/utils";
import { userItem, userResponseData } from "../../common/common";
import MessageModal from "@/components/message/MessageModal.vue";
import MessageToast from "@/components/message/MessageToast.vue";
import Loadding from "@/components/Loadding.vue";
import request from "../../utils/request";
import Pagination from "@/components/Pagination.vue";
const emit = defineEmits(["addFile"]);
const baseurl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;
const api = {
  getUserList: "admin/getUserList",
  updateUserStatus: "admin/updateUserStatus",
  updateUserSpace: "admin/updateUserSpace",
};

const searchForm = ref<{ value: string; status: boolean | string }>({
  value: "",
  status: "not_search",
});
// --------------------------------------------------------------------------------

const columns = [
  {
    label: "头像",
    props: "avatar",
    width: 80,
  },
  {
    label: "昵称",
    prop: "nickName",
  },
  {
    label: "空间使用",
    prop: "space",
  },
  {
    label: "加入时间",
    prop: "joinTime",
  },
  {
    label: "最后登录时间",
    prop: "lastLoginTime",
  },
  {
    label: "状态",
    prop: "status",
    width: 80,
  },
  {
    label: "操作",
    prop: "op",
    width: 150,
  },
];
// --------------------------------------------------------------------------
const messageToast = ref();
const loadding = ref();
const tableData = ref<userResponseData>({
  pageNo: 1,
  pageSize: 9,
  pageTotal: 1,
  list: [],
});
// --------------------------------------------------------------------------

// 点击进行搜索
const search = () => {
  tableData.value.pageNo = 1;
  loadDataList();
};

// 加载数据
const loadDataList = async () => {
  let params: {
    pageNo: number;
    pageSize: number;
    userNameFuzzy?: string;
    status?: boolean | string;
  } = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
  };

  params.userNameFuzzy = searchForm.value.value;
  params.status = searchForm.value.status;

  let result;
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    result = await request({
      method: "POST",
      url: api.getUserList,
      data: params,
    });
    // console.log(result)
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }
  if (!result) {
    return;
  }
  tableData.value = result.data;
};
loadDataList();
// ------------------------------------------------------------------------------
// 当前操作的用户
const currentUser = ref<userItem>({
  nickName: "你网页丢失了",
  userId: "不存在的数据",
  avatar: "",
  status: true,
  lastLoginTime: "",
  joinTime: "",
  useSpace: 0,
  totalSpace: 0,
});
const messageModal = ref();
const changeStatus = (data: userItem) => {
  currentUser.value = data;
  messageModal.value.openMessage({
    title: "温馨提示！",
    message: `你确定要${data.status ? "禁用" : "启用"} ${data.nickName} 吗？`,
  });
};
// 确定更改用户的状态
const submitChangeStatus = async () => {
  let result = await request({
    method: "POST",
    url: api.updateUserStatus,
    data: {
      userId: currentUser.value.userId,
      status: currentUser.value.status ? false : true,
    },
  });
  if (!result) {
    return;
  }
  loadDataList();
};
// -----------------------------------------------------------------------------------
// 是否显示更改用户空间大小的弹窗
const showChangeSpace = ref(false);
const changeSpace = (row: userItem) => {
  currentUser.value = row;
  showChangeSpace.value = true;
};

// 绑定更改用户大小
const newSpace = ref<number>(0);

// 确定修改用户空间大小
const submitSpace = async () => {
  let num = newSpace.value * 1024 * 1024;
  // console.log('修改用户空间大小',num)
  let result = await request({
    method: "POST",
    url: api.updateUserSpace,
    data: {
      space: num,
      userId: currentUser.value.userId,
    },
  });
  if (!result) {
    return;
  }
  messageToast.value.showToast({
    type: "success",
    message: "修改成功！",
  });
  closeSpace();
  loadDataList();
};

// 取消修改
const closeSpace = () => {
  newSpace.value = 0;
  showChangeSpace.value = false;
  currentUser.value = {
    nickName: "",
    userId: "",
    avatar: "",
    status: true,
    lastLoginTime: "",
    joinTime: "",
    useSpace: 0,
    totalSpace: 0,
  };
};
// ----------------------------------------------------------------------------------------
// 切换页码
const paginationChange = (num: number) => {
  tableData.value.pageNo = num;
  loadDataList();
};
</script>

<style scoped lang="scss">
.top {
  padding: 5px;
  width: 100%;
  display: flex;
  gap: 15px;
  // align-items: center;
  .input-group {
    width: 30%;
  }
  .form-select {
    width: 15%;
  }
  .refresh:hover {
    cursor: pointer;
  }
  .refresh {
    margin-left: 10px;
    line-height: 40px;
  }
}
.changeStatus :hover {
  cursor: pointer;
}
.user-list {
  padding: 10px 15px;
  td,
  th {
    // text-align: center;
    vertical-align: middle;
  }
  th {
    padding: 0.5rem 0.5rem;
  }
  img {
    width: 55px;
    height: 55px;
    border-radius: 50%;
  }
  .op {
    display: flex;
    gap: 10px;
    span:hover {
      cursor: pointer;
    }
  }
}
.pagination {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
@media (max-width: 930px) {
  .input-group {
    width: 40% !important;
  }
  .form-select {
    width: 20% !important;
  }
}
@media (max-width: 560px) {
  .input-group {
    width: 50% !important;
  }
}
.modal {
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .space-item {
      display: flex;
      gap: 20px;
      align-items: center;
      .item-left {
        width: 20%;
        text-align: right;
      }
    }
  }
}
</style>
