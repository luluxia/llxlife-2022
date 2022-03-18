<script>
import { ref } from 'vue'
import interact from 'interactjs'
import _ from 'lodash'
import CardContent from './components/CardContent.vue'
import EditorBtn from './components/EditorBtn.vue'
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
          lastChangeTime: 1,
          class: '',
          content: '![logo](http://localhost:3000/logo.svg)'
        },
        2: {
          id: 2,
          x: 100,
          y: 100,
          width: 124,
          height: 60,
          lastChangeTime: 1,
          class: 'theme-blue',
          content: '这是一张卡片1'
        },
        4: {
          id: 4,
          x: 100,
          y: 200,
          width: 124,
          height: 60,
          lastChangeTime: 1,
          class: 'theme-pink',
          content: '这是一张卡片22'
        },
        5: {
          id: 5,
          x: 100,
          y: 300,
          width: 124,
          height: 60,
          lastChangeTime: 1,
          class: 'theme-yellow',
          content: '这是一张卡片333'
        },
        6: {
          id: 6,
          x: 100,
          y: 400,
          width: 124,
          height: 60,
          lastChangeTime: 1,
          class: 'theme-green',
          content: '这是一张卡片4444'
        },
        7: {
          id: 7,
          x: 100,
          y: 500,
          width: 124,
          height: 60,
          lastChangeTime: 1,
          class: 'theme-red',
          content: '这是一张卡片55555'
        },
        3: {
          id: 3,
          x: 500,
          y: 200,
          width: 138,
          height: 60,
          lastChangeTime: 1,
          class: 'w-100 theme-purple',
          content: `
# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

---

**加粗文本**

*斜体文本*

~~删除文本~~

> 引用文本

- 列表
- 列表
  - 列表
  - 列表

1. 列表
2. 列表

\`代码\`

\`\`\`
代码块
\`\`\`

[链接](https://llx.life)

[链接(有alt)](https://llx.life "陆陆侠的生活")

https://llx.life

![图片](https://octodex.github.com/images/minion.png)

欢迎收看新闻 54 台。我是吉莉安·乔丹。

首先为各位观众带来的是本地新闻。

荒坂公司总部灾难 54 周年的纪念日很快就要到了。

2023 年，在荒坂夜之城总部所引爆的一颗战术原子弹，为整座城市带来了深入骨髓的末日灾难。

          `
        }
      },
      showCardList: [1, 2, 3, 4, 5, 6, 7],
      selectCardList: [],
      onMove: false
    };
  },
  components: {
    CardContent,
    EditorBtn
  },
  methods: {
    verticalDistribute() {
      const sortedList = _.sortBy(this.selectCardList, id => {
        return +this.cardData[id].y
      })
      sortedList.forEach((id, index) => {
        if (index) {
          const firstCard = this.cardData[sortedList[0]]
          const lastCard = this.cardData[sortedList[index - 1]]
          const selfCard = this.cardData[id]
          this.cardData[id].x = +firstCard.x - (firstCard.width - selfCard.width) / 2
          this.cardData[id].y = +lastCard.y + lastCard.height / 2 + selfCard.height / 2 + 10
        }
      })
    },
    horizontalDistribute() {
      const sortedList = _.sortBy(this.selectCardList, id => {
        return +this.cardData[id].x
      })
      sortedList.forEach((id, index) => {
        if (index) {
          const firstCard = this.cardData[sortedList[0]]
          const lastCard = this.cardData[sortedList[index - 1]]
          const selfCard = this.cardData[id]
          this.cardData[id].y = +firstCard.y - (firstCard.height - selfCard.height) / 2
          this.cardData[id].x = +lastCard.x + lastCard.width / 2 + this.cardData[id].width / 2 + 10
        }
      })
    },
    alignLeft() {
      const minX = _.min(this.selectCardList.map(id => {
        return +this.cardData[id].x - this.cardData[id].width / 2
      }))
      this.selectCardList.forEach(id => {
        this.cardData[id].x = minX + this.cardData[id].width / 2
      })
    },
    centerHorizontally() {
      this.selectCardList.forEach(id => {
        this.cardData[id].x = this.cardData[this.selectCardList[0]].x
      })
    },
    alignRight() {
      const maxX = _.max(this.selectCardList.map(id => {
        return +this.cardData[id].x + this.cardData[id].width / 2
      }))
      console.log(maxX)
      this.selectCardList.forEach(id => {
        this.cardData[id].x = maxX - this.cardData[id].width / 2
      })
    },
    alignTop() {
      const minY = _.min(this.selectCardList.map(id => {
        return +this.cardData[id].y - this.cardData[id].height / 2
      }))
      this.selectCardList.forEach(id => {
        this.cardData[id].y = minY + this.cardData[id].height / 2
      })
    },
    centerVerticaly() {
      this.selectCardList.forEach(id => {
        this.cardData[id].y = this.cardData[this.selectCardList[0]].y
      })
    },
    alignBottom() {
      const maxY = _.max(this.selectCardList.map(id => {
        return +this.cardData[id].y + this.cardData[id].height / 2
      }))
      this.selectCardList.forEach(id => {
        this.cardData[id].y = maxY - this.cardData[id].height / 2
      })
    },
    removeCard() {
      this.showCardList = this.showCardList.filter(id => {
        return !this.selectCardList.includes(id)
      })
      console.log(this.showCardList)
      this.selectCardList.forEach(id => {
        delete this.cardData[id]
      })
      this.selectCardList = []
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
          end(event) {
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
            // _this.showCardList = showCardList
            _this.selectCardList = selectCardList
            if (selectCardList.length) {
              console.log(event)
              _this.$refs.editor.style.transform = `translate3d(${event.page.x + 10}px, ${event.page.y + 10}px, 0)`
            }

          }
        }
      })
      // 单击页面
      .on('tap', event => {
        // 清除选中状态
        if (event.target.id == 'view') {
          // Object.keys(this.cardData).forEach(id => {
          //   this.cardData[id].onChoose = false
          // })
          this.selectCardList.forEach(id => {
            const cardDom = document.querySelector(`[data-id="${id}"]`)
            this.cardData[id].onChoose = false
            this.cardData[id].width = cardDom.clientWidth
            this.cardData[id].height = cardDom.clientHeight
          })
          this.selectCardList = []
        }
      })
      // 双击页面
      .on('doubletap', function (event) {
        const newCardX = event.x - document.body.clientWidth / 2 + +pagePostion.value.x
        const newCardY = event.y - document.body.clientHeight / 2 + +pagePostion.value.y
        const createTime = new Date().getTime()
        _this.cardData[createTime] = {
          id: createTime,
          x: newCardX,
          y: newCardY,
          class: 'theme-blue',
          content: '你好，世界！'
        }
        _this.showCardList.push(createTime)
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
            this.selectCardList = [+cardId]
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
      document.body.style.backgroundPositionX = `${-pagePostion.value.x}px`
      document.body.style.backgroundPositionY = `${-pagePostion.value.y}px`
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

    // 滚动
    document.body.addEventListener('wheel', e => {
      console.log(e)
      if (e.deltaY > 0) {
        moveDelta.value.y -= 50
      } else {
        moveDelta.value.y += 50
      }
    })

  }
};
</script>

<template>
  <img class="absolute" src="flag-left.svg" alt />
  <img class="absolute right-0" src="flag-right.svg" alt />
  <p class="test absolute z-1">123</p>
  <p class="test1 absolute z-1 mt-50">转移测试</p>
  <!-- 卡片 -->
  <div id="view" class="w-screen h-screen text-sm text-dark-200 font-default">
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
      <CardContent :cardData="cardData[id]" />
    </div>
  </div>
  <!-- 选框 -->
  <div class="selection absolute pointer-events-none w-10 h-10 bg-teal-200/20 border-teal-200 border-1 top-0 left-0"></div>
  <!-- 编辑器 -->
  <div
    ref="editor"
    class="absolute top-0 bg-light-50 border-2 border-black/20 rounded p-2 transition min-w-50 text-sm space-y-2"
    :class="selectCardList[0] ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
  >
    <!-- 编辑器-单选 -->
    <template v-if="selectCardList.length == 1">
      <p class="font-bold text-dark-50">坐标</p>
      <div v-if="selectCardList[0]" class="flex justify-between">
        <input
          v-model="cardData[selectCardList[0]].x"
          class="bg-gray-100 p-1 w-22 rounded"
          type="text"
        />
        <input
          v-model="cardData[selectCardList[0]].y"
          class="bg-gray-100 p-1 w-22 rounded"
          type="text"
        />
      </div>
      <p class="font-bold text-dark-50">主题</p>
      <div class="flex justify-between space-x-1">
        <div class="w-full h-5 rounded border-2 border-transparent bg-purple"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-blue"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-pink"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-yellow"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-green"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-red"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-gray-200"></div>
        <div class="w-full h-5 rounded border-2"></div>
      </div>
      <p class="font-bold text-dark-50">内容</p>
      <textarea
        v-if="selectCardList[0]"
        v-model="cardData[selectCardList[0]].content"
        class="w-full h-30 bg-gray-100 p-1 resize-none block"
      ></textarea>
      <p class="font-bold text-dark-50">自定义样式</p>
      <textarea
        v-if="selectCardList[0]"
        v-model="cardData[selectCardList[0]].class"
        class="w-full h-20 bg-gray-100 p-1 resize-none block"
      ></textarea>
      <p class="font-bold text-dark-50">操作</p>
      <EditorBtn @click="removeCard()" :icon="'icon-shanchu'" />
    </template>
    <!-- 编辑器-多选 -->
    <template v-if="selectCardList.length > 1">
      <p class="font-bold text-dark-50">排列</p>
      <div class="flex space-x-1">
        <EditorBtn @click="verticalDistribute()" :icon="'icon-chuizhipailie'" />
        <EditorBtn @click="horizontalDistribute()" :icon="'icon-shuipingpailie'" />
      </div>
      <p class="font-bold text-dark-50">对齐</p>
      <div class="flex space-x-1">
        <EditorBtn @click="alignLeft()" :icon="'icon-zuoduiqi'" />
        <EditorBtn @click="centerHorizontally()" :icon="'icon-hengxiangjuzhongduiqi'" />
        <EditorBtn @click="alignRight()" :icon="'icon-youduiqi'" />
        <EditorBtn @click="alignBottom()" :icon="'icon-dibuduiqi'" />
        <EditorBtn @click="centerVerticaly()" :icon="'icon-shuxiangjuzhongduiqi'" />
        <EditorBtn @click="alignTop()" :icon="'icon-dingbuduiqi'" />
      </div>
      <p class="font-bold text-dark-50">操作</p>
      <EditorBtn @click="removeCard()" :icon="'icon-shanchu'" />
    </template>
  </div>
</template>

<style>
@import url(//at.alicdn.com/t/font_3228461_0s1hz2e5dm.css);
@font-face {
  font-family: SweiGothicCJKtc-Medium;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Medium.woff2)
      format("woff2"),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Medium.woff)
      format("woff");
}
* {
  margin: 0;
  padding: 0;
}
body {
  background: #fffaf3;
  background-image: url("./bg.png");
  background-size: 80%;
}
</style>
