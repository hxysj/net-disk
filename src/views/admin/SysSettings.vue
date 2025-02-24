<template>
  <div class="group">
    <div class="group-item">
      <div class="item-left">初始化空间大小</div>
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          v-model="formData.useInitUseSpace"
        />
        <div class="input-group-text">MB</div>
      </div>
    </div>
    <div class="group-btn">
      <button class="btn btn-primary" @click="saveSettings">保存</button>
    </div>
    <MessageToast ref="messageToast"></MessageToast>
    <Loadding ref="loadding"></Loadding>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import MessageToast from "@/components/message/MessageToast.vue";
import request from "../../utils/request";
import Loadding from "@/components/Loadding.vue";
const formData = ref({
  useInitUseSpace: 0,
});

const api = {
  getSysSetting: "admin/getSysSettings",
  updateSetting: "admin/updateSetting",
};

const loadding = ref();
// 获取初始化空间的大小
const getSysSettings = async () => {
  let result;
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    result = await request({
      method: "GET",
      url: api.getSysSetting,
    });
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }
  if (!result) {
    return;
  }
  formData.value.useInitUseSpace = result.data.useInitUseSpace / 1024 / 1024;
};
getSysSettings();
const messageToast = ref();
const saveSettings = async () => {
  let params = {
    useInitUseSpace: formData.value.useInitUseSpace * 1024 * 1024,
  };
  let result = await request({
    method: "POST",
    url: api.updateSetting,
    data: params,
  });
  if (!result) {
    return;
  }
  messageToast.value.showToast({
    type: "success",
    message: "设置成功",
  });
  getSysSettings();
};
</script>

<style scoped lang="scss">
.group {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  .group-item {
    display: flex;
    align-items: center;
    gap: 20px;
    .item-left {
      width: 150px;
      text-align: center;
    }
    .input-group {
      width: 25%;
    }
  }
  .group-btn {
    /* margin-left: 20%; */
    margin-left: 20px;
  }
}
@media (max-width: 560px) {
  .input-group {
    width: 90% !important;
  }
}
</style>
