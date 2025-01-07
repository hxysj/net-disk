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
      <template v-if="pageTotal > countShow">
        <template v-if="pageNo >= countShow">
          <li class="page-item"><a class="page-link" href="#">...</a></li>
        </template>
        <template v-if="pageNo < countShow">
          <template v-for="index in countShow" :key="index">
            <li class="page-item" :class="[index == pageNo ? 'active' : '']">
              <a
                class="page-link"
                href="#"
                @click.prevent="changePageSize(index)"
                >{{ index }}</a
              >
            </li>
          </template>
        </template>
        <template v-else-if="pageNo > pageTotal - countShow">
          <template
            v-for="index in Array.from(
              { length: countShow },
              (_, i) => pageTotal - 4 + i
            )"
            :key="index"
          >
            <li class="page-item" :class="[index == pageNo ? 'active' : '']">
              <a
                class="page-link"
                href="#"
                @click.prevent="changePageSize(index)"
                >{{ index }}</a
              >
            </li>
          </template>
        </template>
        <template v-else>
          <template
            v-for="index in Array.from(
              { length: countShow },
              (_, i) => pageNo - 2 + i
            )"
            :key="index"
          >
            <li class="page-item" :class="[index == pageNo ? 'active' : '']">
              <a
                class="page-link"
                href="#"
                @click.prevent="changePageSize(index)"
                >{{ index }}</a
              >
            </li>
          </template>
        </template>
        <template v-if="pageTotal - pageNo >= countShow">
          <li class="page-item"><a class="page-link" href="#">...</a></li>
        </template>
      </template>
      <template v-else>
        <template v-for="index in pageTotal" :key="index">
          <li class="page-item" :class="[index == pageNo ? 'active' : '']">
            <a
              class="page-link"
              href="#"
              @click.prevent="changePageSize(index)"
              >{{ index }}</a
            >
          </li>
        </template>
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
defineProps({
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
// 页码发生改变，通知父组件值发生变化
const changePageSize = (num: number) => {
  emit("changeNum", num);
};
</script>

<style scoped lang="scss"></style>
