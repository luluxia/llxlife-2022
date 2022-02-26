<script>
// import Hammer from 'hammerjs'
import { ref } from 'vue';
import interact from 'interactjs'
export default {
  data() {
    return {
      cardData: {
        1: {
          id: 1,
          x: 100,
          y: 100,
          content: '这是一张卡片'
        },
        2: {
          id: 2,
          x: 200,
          y: 200,
          content: '这是第二张卡片'
        }
      },
    };
  },
  methods: {

  },
  mounted() {
    const pagePostion = ref({ x: 0, y: 0 })     // 当前页面的位置
    const lastPagePostion = ref({ x: 0, y: 0 }) // 上次页面的位置
    const moveDelta = ref({ x: 0, y: 0 })       // 每次移动时距离上次页面位置的偏移量

    const lastCardPostion = ref({ x: 0, y: 0 }) // 上次卡片的位置
    const moveCardDelta = ref({ x: 0, y: 0 })   // 卡片移动偏移量

    const firstSelectionPostion = ref({ x: 0, y: 0 }) // 选框初始位置

    let moveCardIndex = 0

    const selection = document.querySelector('.selection')
    let onSelection = false
    let haveMoved = false

    interact('body')
    .styleCursor(false)
    .draggable({
      listeners: {
        start (event) {
          firstSelectionPostion.value.x = event.clientX
          firstSelectionPostion.value.y = event.clientY
          lastPagePostion.value.x = pagePostion.value.x
          lastPagePostion.value.y = pagePostion.value.y
          moveDelta.value.x = 0
          moveDelta.value.y = 0
        },
        move (event) {
          if (!onSelection && !haveMoved && event.dt >= 200) {
            onSelection = true
            selection.style.opacity = 1
          }
          haveMoved = true
          if (!onSelection) {
            moveDelta.value.x = event.clientX - event.x0
            moveDelta.value.y = event.clientY - event.y0
          } else {
            const selectionLeft = event.clientX < firstSelectionPostion.value.x ? event.clientX : firstSelectionPostion.value.x
            const selectionTop = event.clientY < firstSelectionPostion.value.y ? event.clientY : firstSelectionPostion.value.y
            selection.style.left = selectionLeft + 'px'
            selection.style.top = selectionTop + 'px'
            selection.style.width = Math.abs(event.clientX - event.x0) + 'px'
            selection.style.height = Math.abs(event.clientY - event.y0) + 'px'
          }
        },
        end () {
          onSelection = false
          haveMoved = false
          selection.style.opacity = 0
        }
      }
    })

    interact('.card')
    .styleCursor(false)
    .draggable({
      hold: 200,
      listeners: {
        start (event) {
          const dom = event.target.parentNode
          moveCardIndex = dom.dataset.index
          lastCardPostion.value.x = dom.dataset.x
          lastCardPostion.value.y = dom.dataset.y
          moveCardDelta.value.x = event.clientX - event.x0
          moveCardDelta.value.y = event.clientY - event.y0
          event.target.classList.add('animate-shake')
        },
        move (event) {
          moveCardDelta.value.x = event.clientX - event.x0
          moveCardDelta.value.y = event.clientY - event.y0
        },
        end (event) {
          event.target.classList.remove('animate-shake')
        }
      }
    })
    const render = () => {
      // 缓动
      pagePostion.value.x = pagePostion.value.x + ((lastPagePostion.value.x - moveDelta.value.x) - pagePostion.value.x) * 0.1
      pagePostion.value.y = pagePostion.value.y + ((lastPagePostion.value.y - moveDelta.value.y) - pagePostion.value.y) * 0.1
      // 卡片
      this.$refs.cardRef.forEach((item, index) => {
        item.style.transform = `translate3D(${-pagePostion.value.x + +item.dataset.x}px, ${-pagePostion.value.y + +item.dataset.y}px, 0)`
      })
      if (moveCardIndex) {
        this.$refs.cardRef[moveCardIndex - 1].dataset.x = +lastCardPostion.value.x + moveCardDelta.value.x
        this.$refs.cardRef[moveCardIndex - 1].dataset.y = +lastCardPostion.value.y + moveCardDelta.value.y
      }
      document.querySelector('.test').innerHTML = `
        <p>pagePostionX  ${pagePostion.value.x}</p>
        <p>pagePostionY  ${pagePostion.value.y}</p>
        <p>moveDeltaX  ${moveDelta.value.x}</p>
        <p>moveDeltaY  ${moveDelta.value.y}</p>
        <p>lastPagePostionX  ${lastPagePostion.value.x}</p>
        <p>lastPagePostionY  ${lastPagePostion.value.y}</p>
        <p>lastCardPostionX  ${lastCardPostion.value.x}</p>
        <p>lastCardPostionY  ${lastCardPostion.value.y}</p>
      `
      requestAnimationFrame(render)
    }
    render()
  }
};
</script>
>

<template>
  <p class="test absolute z-1">123</p>
  <div class="w-screen h-screen text-sm text-dark-200">
    <div
      v-for="(item, index) in cardData"
      :style="{ transform: `translate(${item.x}px, ${item.y}px)` }"
      :key="item.id"
      :data-id="item.id"
      :data-index="index"
      :data-x="item.x"
      :data-y="item.y"
      ref="cardRef"
    >
      <div class="card absolute rounded p-2 bg-sky-100 border-transparent border-2 hover:(border-black/20)">{{ item.content }}</div>
    </div>
  </div>
  <div class="selection absolute pointer-events-none w-10 h-10 bg-teal-200/20 border-teal-200 border-1 top-0 left-0"></div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
body {
  background: #fffdf1;
}
@keyframes shake-bottom {
  0%,
  100% {
    transform: rotate(0deg);
    transform-origin: 50% 100%;
  }
  10% {
    transform: rotate(2deg);
  }
  20%,
  40%,
  60% {
    transform: rotate(-4deg);
  }
  30%,
  50%,
  70% {
    transform: rotate(4deg);
  }
  80% {
    transform: rotate(-2deg);
  }
  90% {
    transform: rotate(2deg);
  }
}
</style>
