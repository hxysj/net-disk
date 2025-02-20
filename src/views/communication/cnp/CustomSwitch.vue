<!-- src/components/CustomSwitch.vue -->
<template>
  <div class="custom-switch" @click="toggleSwitch">
    <div class="switch-input" :class="{ active: modelValue }">
      <span class="switch-label">{{
        modelValue ? activateText : disText
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  activateText: {
    type: String,
    default: "深度思考",
  },
  disText: {
    type: String,
    default: "快速回答",
  },
});

const emit = defineEmits(["update:modelValue"]);

const toggleSwitch = () => {
  emit("update:modelValue", !props.modelValue);
};
</script>

<style scoped lang="scss">
.custom-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.switch-input {
  width: 65px;
  height: 19px;
  background-color: #ccc;
  border-radius: 15px;
  position: relative;
  transition: background-color 0.4s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-input.active {
  background-color: #4caf50;
  .switch-label {
    left: 5px;
  }
}

.switch-input::after {
  content: "";
  width: 15px;
  height: 15px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.switch-input.active::after {
  transform: translateX(45px);
}

.switch-label {
  color: white;
  font-size: 10px;
  position: absolute;
  right: 5px;
}
</style>
