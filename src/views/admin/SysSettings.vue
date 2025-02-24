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
    <div class="space-chart">
      <div class="chart-title">系统空间使用情况</div>
      <div ref="chartRef" class="chart-container"></div>
    </div>
    <div class="group-btn">
      <button class="btn btn-primary" @click="saveSettings">保存</button>
    </div>
    <MessageToast ref="messageToast"></MessageToast>
    <Loadding ref="loadding"></Loadding>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import MessageToast from "@/components/message/MessageToast.vue";
import request from "../../utils/request";
import Loadding from "@/components/Loadding.vue";
import * as echarts from "echarts";

const formData = ref({
  useInitUseSpace: 0,
});

const api = {
  getSysSetting: "admin/getSysSettings",
  updateSetting: "admin/updateSetting",
};

const loadding = ref();

const systemSpace = ref({
  total: 0,
  used: 0,
  free: 0,
});

const chartRef = ref();
let chart: ReturnType<typeof echarts.init> | null = null;

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
  }
};

// 更新图表数据
const updateChart = () => {
  if (!chart) return;

  // 检查剩余空间比例
  const totalSpace = systemSpace.value.total;
  const freeSpace = systemSpace.value.free;
  const freePercentage = (freeSpace / totalSpace) * 100;

  if (freePercentage < 5) {
    messageToast.value.showToast({
      type: "error",
      message: "系统剩余空间不足5%，请及时处理！",
      duration: 0,
    });
  }

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}GB ({d}%)",
    },
    legend: {
      orient: "horizontal",
      bottom: "bottom",
    },
    series: [
      {
        name: "空间使用",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "20",
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: Number(
              (systemSpace.value.used / (1024 * 1024 * 1024)).toFixed(2)
            ),
            name: "已使用空间",
            itemStyle: { color: "#ff6b6b" },
          },
          {
            value: Number(
              (systemSpace.value.free / (1024 * 1024 * 1024)).toFixed(2)
            ),
            name: "剩余空间",
            itemStyle: { color: "#4ecb73" },
          },
        ],
      },
    ],
  };

  chart.setOption(option);
};

// 监听窗口大小变化
const handleResize = () => {
  chart?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
});

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
  systemSpace.value = {
    total: result.data.sys_total,
    used: result.data.sys_used,
    free: result.data.sys_free,
  };
  // 更新图表
  nextTick(() => {
    updateChart();
  });
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
    .system-info {
      font-size: 16px;
      color: #666;
    }
  }
  .group-btn {
    /* margin-left: 20%; */
    margin-left: 20px;
  }
  .space-chart {
    margin-top: 20px;
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .chart-title {
      font-size: 16px;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 500;
    }

    .chart-container {
      height: 300px;
      width: 100%;
    }
  }
}
@media (max-width: 560px) {
  .input-group {
    width: 90% !important;
  }
  .space-chart {
    .chart-container {
      height: 250px;
    }
  }
}
</style>
