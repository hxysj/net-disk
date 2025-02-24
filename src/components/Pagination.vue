<template>
  <nav aria-label="pagination">
    <ul class="pagination">
      <!-- 上一页按钮 -->
      <li class="page-item">
        <a
          class="page-link"
          @click.prevent="handlePageChange(pageNo - 1)"
          :class="{ disabled: isFirstPage }"
          href="#"
          aria-label="Previous"
        >
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>

      <!-- 页码列表 -->
      <li
        v-for="index in pageList"
        :key="index"
        class="page-item"
        :class="{ active: index === pageNo }"
      >
        <a class="page-link" href="#" @click.prevent="handlePageClick(index)">
          {{ index }}
        </a>
      </li>

      <!-- 下一页按钮 -->
      <li class="page-item">
        <a
          class="page-link"
          href="#"
          @click.prevent="handlePageChange(pageNo + 1)"
          :class="{ disabled: isLastPage }"
          aria-label="Next"
        >
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  pageTotal: number;
  pageNo: number;
  countShow: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageTotal: 1,
  pageNo: 1,
  countShow: 5,
});

const emit = defineEmits<{
  (e: "changeNum", num: number): void;
}>();

// 计算属性
const isFirstPage = computed(() => props.pageNo === 1);
const isLastPage = computed(() => props.pageNo === props.pageTotal);

// 计算页码列表
const pageList = computed(() => {
  if (props.pageTotal <= props.countShow) {
    return Array.from({ length: props.pageTotal }, (_, i) => i + 1);
  }

  let result: (number | string)[] = [];
  const halfCount = Math.floor(props.countShow / 2);

  // 处理开始部分
  if (props.pageNo <= halfCount + 1) {
    result = Array.from({ length: props.countShow }, (_, i) => i + 1);
    if (props.pageTotal > props.countShow) {
      result.push("...");
    }
    return result;
  }

  // 处理结束部分
  if (props.pageNo >= props.pageTotal - halfCount) {
    result = Array.from(
      { length: props.countShow },
      (_, i) => props.pageTotal - props.countShow + i + 1
    );
    result.unshift("...");
    return result;
  }

  // 处理中间部分
  result = Array.from(
    { length: props.countShow },
    (_, i) => props.pageNo - halfCount + i
  );
  result.unshift("...");
  result.push("...");
  return result;
});

// 处理页码点击
const handlePageClick = (index: number | string) => {
  if (typeof index === "number") {
    handlePageChange(index);
  }
};

// 处理页码变化
const handlePageChange = (num: number) => {
  if (num < 1 || num > props.pageTotal) return;
  emit("changeNum", num);
};
</script>

<style scoped lang="scss"></style>
