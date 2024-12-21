<template>
    <div class="s-canvas">
      <canvas id="s-canvas" :width="contentWidth" :height="contentHeight"></canvas>
    </div>
</template>
<script setup>
import { nextTick } from 'vue'
 
var identifyCode={
  type: String,
  default: '1234'
}
//props
const props = defineProps({
    identifyCode: {
        type: String,
        default: '1234'
      },
      fontSizeMin: {
        type: Number,
        default: 28
      },
      fontSizeMax: {
        type: Number,
        default: 40
      },
      backgroundColorMin: {
        type: Number,
        default: 180
      },
      backgroundColorMax: {
        type: Number,
        default: 240
      },
      colorMin: {
        type: Number,
        default: 50
      },
      colorMax: {
        type: Number,
        default: 160
      },
      lineColorMin: {
        type: Number,
        default: 40
      },
      lineColorMax: {
        type: Number,
        default: 180
      },
      dotColorMin: {
        type: Number,
        default: 0
      },
      dotColorMax: {
        type: Number,
        default: 255
      },
      contentWidth: {
        type: Number,
        default: 112
      },
      contentHeight: {
        type: Number,
        default: 40
      }
})
 
//子组件通过 defineExpose 暴露出自身属性供父组件修改
defineExpose({
  setIdentifyCode(res){
    identifyCode= res
    drawPic()
  },
  getIdentifyCode(res){
    return identifyCode
  }
})
 
// 生成一个随机数
function randomNum (min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}
// 生成一个随机的颜色
function randomColor (min, max) {
    var r = randomNum(min, max)
    var g = randomNum(min, max)
    var b = randomNum(min, max)
    return 'rgb(' + r + ',' + g + ',' + b + ')'
}
//等页面dom元素全都挂载后再执行后面的代码
async function drawPic () {
    await nextTick()
    var canvas = document.getElementById('s-canvas')
    var ctx = canvas.getContext('2d')
    ctx.textBaseline = 'bottom'
    // 绘制背景
    ctx.fillStyle = randomColor(
      props.backgroundColorMin,
      props.backgroundColorMax
    )
    ctx.fillRect(0, 0, props.contentWidth, props.contentHeight)
    // 绘制文字
    for (let i = 0; i < identifyCode.length; i++) {
      drawText(ctx, identifyCode[i], i)
    }
    drawLine(ctx)
    drawDot(ctx)
}
function drawText (ctx, txt, i) {
    ctx.fillStyle = randomColor(props.colorMin, props.colorMax)
    ctx.font = randomNum(props.fontSizeMin, props.fontSizeMax) + 'px SimHei'
    var x = (i + 1) * (props.contentWidth / (identifyCode.length + 1))
    var y = randomNum(props.fontSizeMax, props.contentHeight - 5)
    var deg = randomNum(-30, 30)
    // 修改坐标原点和旋转角度
    ctx.translate(x, y)
    ctx.rotate(deg * Math.PI / 270)
    ctx.fillText(txt, 0, 0)
    // 恢复坐标原点和旋转角度
    ctx.rotate(-deg * Math.PI / 270)
    ctx.translate(-x, -y)
 
}
function drawLine (ctx) {
    // 绘制干扰线
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = randomColor(
        props.lineColorMin,
        props.lineColorMax
      )
      ctx.beginPath()
      ctx.moveTo(
        randomNum(0, props.contentWidth),
        randomNum(0, props.contentHeight)
      )
      ctx.lineTo(
        randomNum(0, props.contentWidth),
        randomNum(0, props.contentHeight)
      )
      ctx.stroke()
    }
}
function drawDot (ctx) {
    // 绘制干扰点
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = randomColor(0, 255)
      ctx.beginPath()
      ctx.arc(
        randomNum(0, props.contentWidth),
        randomNum(0, props.contentHeight),
        1,
        0,
        2 * Math.PI
      )
      ctx.fill()
    }
}
</script>
<style scoped>
  .s-canvas {
      height: 38px;
      cursor: pointer;
  }
  /* .s-canvas canvas{ */
      /* margin-top: 1px; */
      /* margin-left: 8px; */
  /* } */
</style>