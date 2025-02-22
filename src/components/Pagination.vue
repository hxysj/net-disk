<template>
  <nav aria-label="Page navigation example">
    <ul class="pagination">
      <li class="page-item">
        <a
          class="page-link"
          @click.prevent="changePageSize(pageNo - 1)"
          :class="[pageNo === 1 ? 'disabled' : '']"
          href="#"
          aria-label="Previous"
        >
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      <template v-for="index in page_list" :key="index">
        <li class="page-item" :class="[index == pageNo ? 'active' : '']">
          <a
            class="page-link"
            href="#"
            @click.prevent="index != '...' && changePageSize(index as number)"
            >{{ index }}</a
          >
        </li>
      </template>
      <li class="page-item">
        <a
          class="page-link"
          href="#"
          @click.prevent="changePageSize(pageNo + 1)"
          aria-label="Next"
          :class="[pageNo === pageTotal ? 'disabled' : '']"
        >
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  pageTotal: {
    default: 1,
  },
  pageNo: {
    default: 1,
  },
  countShow: {
    default: 5,
  },
});

const emit = defineEmits(["changeNum"]);
const page_list = computed(() => {
  if (props.pageTotal < props.countShow)
    return Array.from({ length: props.pageTotal }, (_, i) => i + 1);
  let result: (number | string)[] = [];
  if (props.pageNo >= props.countShow) {
    result = ["..."];
  }
  if (props.pageNo < props.countShow) {
    result = [
      ...result,
      ...Array.from({ length: props.countShow }, (_, i) => i + 1),
    ];
  } else if (props.pageNo > props.pageTotal - props.countShow) {
    console.log("pageNo > pageTotal - countShow", props);
    result = [
      ...result,
      ...Array.from(
        { length: props.countShow },
        (_, i) => props.pageTotal - 4 + i
      ),
    ];
  } else {
    result = [
      ...result,
      ...Array.from(
        { length: props.countShow },
        (_, i) => props.pageNo - 2 + i
      ),
    ];
  }
  if (props.pageTotal - props.pageNo >= props.countShow) {
    result.push("...");
  }
  return result;
});

// 页码发生改变，通知父组件值发生变化
const changePageSize = (num: number) => {
  emit("changeNum", num);
};
</script>

<style scoped lang="scss"></style>
