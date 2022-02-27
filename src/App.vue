<script>
import { ref } from 'vue';
import interact from 'interactjs'
import markdownit from 'markdown-it'
export default {
  data() {
    return {
      cardData: {
        1: {
          id: 1,
          x: 0,
          y: 0,
          background: 'transparent',
          onChoose: false,
          content: '![logo](http://localhost:3000/logo.svg)'
        },
        2: {
          id: 2,
          x: 100,
          y: 100,
          content: '这是一张卡片'
        },
        3: {
          id: 3,
          x: 200,
          y: 200,
          content: '这是第二张卡片'
        }
      },
      showCardList: [1, 2, 3],
      onMove: false
    };
  },
  methods: {
    markdown(content) {
      const md = new markdownit();
      return md.render(content)
    }
  },
  mounted() {
    const pagePostion = ref({ x: 0, y: 0 })     // 当前页面的位置
    const lastPagePostion = ref({ x: 0, y: 0 }) // 上次页面的位置
    const moveDelta = ref({ x: 0, y: 0 })       // 每次移动时距离上次页面位置的偏移量

    const moveCardDelta = ref({ x: 0, y: 0 })   // 卡片移动偏移量

    const firstSelectionPostion = ref({ x: 0, y: 0 }) // 选框初始位置

    const selection = document.querySelector('.selection')
    let onSelection = false
    let haveMoved = false

    const _this = this
    let allCardDom = null

    interact('#app')
      .styleCursor(false)
      .draggable({
        listeners: {
          start(event) {
            firstSelectionPostion.value.x = event.clientX
            firstSelectionPostion.value.y = event.clientY
            lastPagePostion.value.x = pagePostion.value.x
            lastPagePostion.value.y = pagePostion.value.y
            moveDelta.value.x = 0
            moveDelta.value.y = 0
          },
          move(event) {
            if (!onSelection && !haveMoved && event.dt >= 200) {
              onSelection = true
              selection.style.opacity = 1
              allCardDom = document.querySelectorAll('.card')
            }
            haveMoved = true
            if (!onSelection) {
              moveDelta.value.x = event.clientX - event.x0
              moveDelta.value.y = event.clientY - event.y0
            } else {
              const selectionLeft = event.clientX < firstSelectionPostion.value.x ? event.clientX : firstSelectionPostion.value.x
              const selectionTop = event.clientY < firstSelectionPostion.value.y ? event.clientY : firstSelectionPostion.value.y
              const selectionWidth = Math.abs(event.clientX - event.x0)
              const selectionHeight = Math.abs(event.clientY - event.y0)
              const selectionRight = selectionLeft + selectionWidth
              const selectionBottom = selectionTop + selectionHeight
              selection.style.left = selectionLeft + 'px'
              selection.style.top = selectionTop + 'px'
              selection.style.width = selectionWidth + 'px'
              selection.style.height = selectionHeight + 'px'

              allCardDom.forEach(card => {
                const cardRect = card.getBoundingClientRect()
                const cardId = card.dataset.id
                if (cardRect.left > selectionLeft - cardRect.width && cardRect.right < selectionRight + cardRect.width && cardRect.top > selectionTop - cardRect.height && cardRect.bottom < selectionBottom + cardRect.height) {
                  _this.cardData[cardId].onChoose = true
                  _this.cardData[cardId].lastPositionX = card.dataset.x
                  _this.cardData[cardId].lastPositionY = card.dataset.y
                } else {
                  _this.cardData[cardId].onChoose = false
                }
              })
            }
          },
          end() {
            onSelection = false
            haveMoved = false
            selection.style.opacity = 0
          }
        }
      })
      .on('tap', () => {
        Object.keys(this.cardData).forEach(id => {
          this.cardData[id].onChoose = false
        })
      })

    interact('.card')
      .draggable({
        allowFrom: '.move',
        listeners: {
          start(event) {
            const dom = event.target
            const cardId = dom.dataset.id
            _this.cardData[cardId].onChoose = true
            _this.cardData[cardId].lastPositionX = dom.dataset.x
            _this.cardData[cardId].lastPositionY = dom.dataset.y

            moveCardDelta.value.x = event.clientX - event.x0
            moveCardDelta.value.y = event.clientY - event.y0

            _this.onMove = true
          },
          move(event) {
            moveCardDelta.value.x = event.clientX - event.x0
            moveCardDelta.value.y = event.clientY - event.y0
          },
          end(event) {
            const dom = event.target
            const cardId = dom.dataset.id
            _this.cardData[cardId].onChoose = false
            _this.onMove = false

            allCardDom = document.querySelectorAll('.card')
            allCardDom.forEach(card => {
              const cardId = card.dataset.id
              _this.cardData[cardId].lastPositionX = card.dataset.x
              _this.cardData[cardId].lastPositionY = card.dataset.y
            })
          }
        }
      })
    const render = () => {
      // 缓动
      pagePostion.value.x = pagePostion.value.x + ((lastPagePostion.value.x - moveDelta.value.x) - pagePostion.value.x) * 0.1
      pagePostion.value.y = pagePostion.value.y + ((lastPagePostion.value.y - moveDelta.value.y) - pagePostion.value.y) * 0.1
      // 卡片
      this.$refs.cardRef.forEach((item, index) => {
        const cardId = item.dataset.id
        const x = -pagePostion.value.x + +item.dataset.x + document.body.clientWidth / 2 - item.clientWidth / 2 - 10
        const y = -pagePostion.value.y + +item.dataset.y + document.body.clientHeight / 2 - item.clientHeight / 2 - 10
        item.style.transform = `translate3D(${x}px, ${y}px, 0)`
        if (this.cardData[cardId].onChoose && this.onMove) {
          this.$refs.cardRef[index].dataset.x = +this.cardData[cardId].lastPositionX + moveCardDelta.value.x
          this.$refs.cardRef[index].dataset.y = +this.cardData[cardId].lastPositionY + moveCardDelta.value.y
        }
      })
      document.querySelector('.test').innerHTML = `
        <p>pagePostionX  ${pagePostion.value.x}</p>
        <p>pagePostionY  ${pagePostion.value.y}</p>
        <p>moveDeltaX  ${moveDelta.value.x}</p>
        <p>moveDeltaY  ${moveDelta.value.y}</p>
        <p>lastPagePostionX  ${lastPagePostion.value.x}</p>
        <p>lastPagePostionY  ${lastPagePostion.value.y}</p>
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
      v-for="(id, index) in showCardList"
      :style="{ transform: `translate(${cardData[id].x}px, ${cardData[id].y}px)` }"
      :key="cardData[id].id"
      :data-id="cardData[id].id"
      :data-index="index"
      :data-x="cardData[id].x"
      :data-y="cardData[id].y"
      class="card absolute group border-10 border-transparent"
      ref="cardRef"
    >
      <p
        class="move absolute rounded-t bg-black/20 w-full h-2.5 transition opacity-0 group-hover:opacity-100"
      ></p>
      <div
        v-html="markdown(cardData[id].content)"
        class="rounded p-2 bg-sky-100 border-transparent border-2 transition group-hover:(border-black/20)"
        :class="cardData[id].onChoose ? 'border-black/30' : ''"
        :style="{ background: cardData[id].background }"
      ></div>
    </div>
  </div>
  <div
    class="selection absolute pointer-events-none w-10 h-10 bg-teal-200/20 border-teal-200 border-1 top-0 left-0"
  ></div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
body {
  background: #fffdf1;
}
</style>
