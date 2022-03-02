<script>
import { ref } from 'vue';
import interact from 'interactjs'
import markdownit from 'markdown-it'
import cx from 'classnames'
export default {
  data() {
    return {
      cardData: {
        1: {
          id: 1,
          x: 0,
          y: 0,
          width: 590,
          height: 444.67,
          background: 'transparent',
          border: 'transparent',
          onChoose: false,
          content: '![logo](http://localhost:3000/logo.svg)'
        },
        2: {
          id: 2,
          x: 100,
          y: 100,
          width: 124,
          height: 60,
          background: 'transparent',
          border: 'transparent',
          content: '这是一张卡片'
        },
        3: {
          id: 3,
          x: 200,
          y: 200,
          width: 138,
          height: 60,
          background: 'transparent',
          border: 'transparent',
          content: '这是第二张卡片'
        }
      },
      showCardList: [1, 2, 3],
      selectCardList: [],
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

    const lastSelectionPostion = ref({ x: 0, y: 0 }) // 选框初始位置

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
            // 选框、页面、偏移量初始数据
            lastSelectionPostion.value.x = event.clientX
            lastSelectionPostion.value.y = event.clientY
            lastPagePostion.value.x = pagePostion.value.x
            lastPagePostion.value.y = pagePostion.value.y
            moveDelta.value.x = 0
            moveDelta.value.y = 0
          },
          move(event) {
            // 判断是否长按进入选框模式
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
              // 计算选框是否选中卡片
              const selectionLeft = event.clientX < lastSelectionPostion.value.x ? event.clientX : lastSelectionPostion.value.x
              const selectionTop = event.clientY < lastSelectionPostion.value.y ? event.clientY : lastSelectionPostion.value.y
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
                  _this.cardData[cardId].x = card.dataset.x
                  _this.cardData[cardId].y = card.dataset.y
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
            // 判断卡片是否选中 是否超出边界
            let showCardList = []
            let selectCardList = []
            const pageX = pagePostion.value.x
            const pageY = pagePostion.value.y
            const halfScreenWidth = document.body.clientWidth / 2
            const halfScreenHeight = document.body.clientHeight / 2
            const padding = 500
            Object.keys(_this.cardData).forEach(id => {
              const card = _this.cardData[id]
              if (
                pageX < +card.x + padding + halfScreenWidth + card.width / 2 &&
                pageX > +card.x - padding - halfScreenWidth - card.width / 2 &&
                pageY < +card.y + padding + halfScreenHeight + card.height / 2 &&
                pageY > +card.y - padding - halfScreenHeight - card.height / 2
              ) {
                showCardList.push(card.id)
              }
              if (card.onChoose) {
                selectCardList.push(card.id)
              }
            })
            _this.showCardList = showCardList
            _this.selectCardList = selectCardList
          }
        }
      })
      .on('tap', event => {
        // 清除选中状态
        if (event.target.id == 'view') {
          Object.keys(this.cardData).forEach(id => {
            this.cardData[id].onChoose = false
          })
          this.selectCardList = []
        }
      })
    // 卡片拖拽
    interact('.card')
      .draggable({
        allowFrom: '.move',
        listeners: {
          start(event) {
            const dom = event.target
            const cardId = dom.dataset.id
            _this.cardData[cardId].onChoose = true
            _this.cardData[cardId].x = dom.dataset.x
            _this.cardData[cardId].y = dom.dataset.y

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
              _this.cardData[cardId].x = card.dataset.x
              _this.cardData[cardId].y = card.dataset.y
            })
          }
        }
      })
      // 点击卡片弹出编辑框
      .on('tap', event => {
        Object.keys(this.cardData).forEach(id => {
          this.cardData[id].onChoose = false
        })
        if (event.target.parentNode.dataset.id) {
          const cardId = event.target.parentNode.dataset.id
          this.cardData[cardId].onChoose = !this.cardData[cardId].onChoose
          if (this.cardData[cardId].onChoose) {
            this.selectCardList = [cardId]
            this.$refs.editor.style.transform = `translate3d(${event.x + 10}px, ${event.y + 10}px, 0)`
          }
        }
      })
    interact('.test1').on('tap', event => {
      lastPagePostion.value.x = pagePostion.value.x
      lastPagePostion.value.y = pagePostion.value.y
      moveDelta.value.x = +lastPagePostion.value.x - 200
      moveDelta.value.y = +lastPagePostion.value.y - 200
    })
    const render = () => {
      // 缓动
      pagePostion.value.x = (+pagePostion.value.x + ((lastPagePostion.value.x - moveDelta.value.x) - pagePostion.value.x) * 0.1).toFixed(2)
      pagePostion.value.y = (+pagePostion.value.y + ((lastPagePostion.value.y - moveDelta.value.y) - pagePostion.value.y) * 0.1).toFixed(2)
      // 卡片
      this.$refs.cardRef.forEach((item, index) => {
        const cardId = item.dataset.id
        const x = -pagePostion.value.x + +item.dataset.x + document.body.clientWidth / 2 - item.clientWidth / 2 - 10
        const y = -pagePostion.value.y + +item.dataset.y + document.body.clientHeight / 2 - item.clientHeight / 2 - 10
        item.style.transform = `translate3D(${x}px, ${y}px, 0)`
        if (this.cardData[cardId].onChoose && this.onMove) {
          this.$refs.cardRef[index].dataset.x = +this.cardData[cardId].x + moveCardDelta.value.x
          this.$refs.cardRef[index].dataset.y = +this.cardData[cardId].y + moveCardDelta.value.y
        }
      })
      document.querySelector('.test').innerHTML = `
        <p>pagePostionX  ${pagePostion.value.x}</p>
        <p>pagePostionY  ${pagePostion.value.y}</p>
        <p>moveDeltaX  ${moveDelta.value.x}</p>
        <p>moveDeltaY  ${moveDelta.value.y}</p>
        <p>lastPagePostionX  ${lastPagePostion.value.x}</p>
        <p>lastPagePostionY  ${lastPagePostion.value.y}</p>
        <p>showCardList  ${this.showCardList}</p>
        <p>selectCardList ${this.selectCardList}</p>
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
  <p class="test1 absolute z-1 mt-50">转移测试</p>
  <div id="view" class="w-screen h-screen text-sm text-dark-200">
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
        class="rounded p-2 bg-sky-100 border-transparent border-2 bg-opacity-50 transition group-hover:(border-black/20)"
        :class="`${cardData[id].onChoose ? 'border-black/20' : ''} bg-${cardData[id].background} border-${cardData[id].border}`"

      ></div>
    </div>
  </div>
  <div
    class="selection absolute pointer-events-none w-10 h-10 bg-teal-200/20 border-teal-200 border-1 top-0 left-0"
  ></div>
  <!-- 编辑器 -->
  <div
    ref="editor"
    class="absolute top-0 bg-light-50 border-2 border-black/20 rounded p-2 transition w-50 text-sm"
    :class="selectCardList[0] ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
  >
    <p class="font-bold my-2 text-dark-50">坐标</p>
    <div v-if="selectCardList[0]" class="flex justify-between">
      <input v-model="cardData[selectCardList[0]].x" class="bg-gray-100 p-1 w-22 rounded" type="text">
      <input v-model="cardData[selectCardList[0]].y" class="bg-gray-100 p-1 w-22 rounded" type="text">
    </div>
    <p class="font-bold my-2 text-dark-50">外观</p>
    <div class="flex justify-between space-x-1">
      <div @click="cardData[selectCardList[0]].background = 'purple'" class="w-full h-5 rounded border-2 border-transparent bg-purple"></div>
      <div @click="cardData[selectCardList[0]].background = 'blue'" class="w-full h-5 rounded border-2 border-transparent bg-blue"></div>
      <div @click="cardData[selectCardList[0]].background = 'pink'" class="w-full h-5 rounded border-2 border-transparent bg-pink"></div>
      <div @click="cardData[selectCardList[0]].background = 'yellow'" class="w-full h-5 rounded border-2 border-transparent bg-yellow"></div>
      <div @click="cardData[selectCardList[0]].background = 'green'" class="w-full h-5 rounded border-2 border-transparent bg-green"></div>
      <div @click="cardData[selectCardList[0]].background = 'red'" class="w-full h-5 rounded border-2 border-transparent bg-red"></div>
      <div @click="cardData[selectCardList[0]].background = 'transparent'" class="w-full h-5 rounded border-2 border-transparent bg-gray-200"></div>
    </div>
    <div class="flex justify-between space-x-1 mt-1">
      <div @click="cardData[selectCardList[0]].border = 'purple'" class="w-full h-5 rounded border-2 border-purple"></div>
      <div @click="cardData[selectCardList[0]].border = 'blue'" class="w-full h-5 rounded border-2 border-blue"></div>
      <div @click="cardData[selectCardList[0]].border = 'pink'" class="w-full h-5 rounded border-2 border-pink"></div>
      <div @click="cardData[selectCardList[0]].border = 'yellow'" class="w-full h-5 rounded border-2 border-yellow"></div>
      <div @click="cardData[selectCardList[0]].border = 'green'" class="w-full h-5 rounded border-2 border-green"></div>
      <div @click="cardData[selectCardList[0]].border = 'red'" class="w-full h-5 rounded border-2 border-red"></div>
      <div @click="cardData[selectCardList[0]].border = 'transparent'" class="w-full h-5 rounded border-2"></div>
    </div>
    <p class="font-bold my-2 text-dark-50">内容</p>
    <textarea
      v-if="selectCardList[0]"
      v-model="cardData[selectCardList[0]].content"
      class="w-full h-30 bg-gray-100 p-1 resize-none"
    ></textarea>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
body {
  background: #FFFAF3;
}
</style>
