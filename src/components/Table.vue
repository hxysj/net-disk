<template>
  <div class="table-body">
    <table
      class="table table-hover"
      v-if="(newList && newList.length > 0) || createNewFolder"
    >
      <thead>
        <tr>
          <th style="width: 15px">
            <input
              type="checkbox"
              :checked="allCheck"
              @click="changeCheckAll"
            />
          </th>
          <th
            v-for="(col, index) in columns"
            :key="index"
            :style="{ width: col.width ? col.width + 'px' : '' }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <slot name="tableBody"></slot>
      </tbody>
    </table>
    <slot name="notData" v-else> </slot>
    <div class="page-navigation" v-if="newList && newList.length > 0">
      <Pagination
        :pageTotal="tableData.pageTotal"
        :pageNo="tableData.pageNo"
        @changeNum="paginationChange"
        v-if="tableData?.pageTotal > 1"
      ></Pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, onMounted } from "vue";
import {
  dataListItem,
  mainResponseData,
  userItem,
  recycleItem,
  recycleResponseData,
  shareListItem,
  shareResponseData,
  userResponseData,
  fileListItem,
} from "../common/common";
import Pagination from "@/components/Pagination.vue";
interface columnItem {
  label: string;
  prop: string;
  scopedSlots?: string;
  width?: number;
}

const props = defineProps({
  columns: {
    type: Array as PropType<columnItem[]>,
    default: () => [],
  },
  tableData: {
    type: Object as PropType<
      | mainResponseData
      | recycleResponseData
      | shareResponseData
      | userResponseData
    >,
    default: () => {},
  },
  fetch: {
    type: Function as PropType<() => void>,
    default: () => () => {}, // 默认为空函数
  },
  initFecth: {
    type: Boolean,
    default: () => false,
  },
  createNewFolder: {
    type: Boolean,
    default: () => false, // 默认为 false
  },
  admin: {
    type: Boolean,
    default: () => false,
  },
  share: {
    type: Boolean,
    default: () => false,
  },
});

const newList = computed<
  dataListItem[] | shareListItem[] | recycleItem[] | fileListItem[] | userItem[]
>(() => props.tableData.list);

const emit = defineEmits(["selectDataList", "changePageSize"]);

// 全选或者全不选,将选中的数据回传给父组件
const allCheck = computed(() => {
  let selectList;
  if (props.admin) {
    selectList = newList.value
      .filter((item): item is fileListItem => item.isCheck as boolean)
      .map((item) => {
        return { file_id: item.fileId, user_id: item.userId };
      });
  } else if (props.share) {
    selectList = newList.value
      .filter((item): item is shareListItem => item.isCheck as boolean)
      .map((item) => item.shareId);
  } else {
    selectList = newList.value
      .filter(
        (
          item
        ): item is dataListItem | shareListItem | recycleItem | fileListItem =>
          item.isCheck as boolean
      )
      .map((item) => item.fileId);
  }
  emit("selectDataList", selectList);
  return (
    newList.value.every((item) => item.isCheck) && newList.value.length > 0
  );
});
const changeCheckAll: () => void = () => {
  if (allCheck.value) {
    newList.value.map((item) => (item.isCheck = false));
  } else {
    newList.value.map((item) => (item.isCheck = true));
  }
};

// 页码发生变化
const paginationChange = (num: number) => {
  emit("changePageSize", num);
};

onMounted(() => {
  if (props.initFecth) {
    props.fetch();
  }
});
</script>

<style scoped lang="scss">
.table-body {
  padding: 10px;
  font-size: 14px;
  height: 100%;
  width: 100%;
  td,
  th {
    // text-align: center;
    vertical-align: middle;
  }
  .page-navigation {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding: 0 20px;
  }
}
</style>
