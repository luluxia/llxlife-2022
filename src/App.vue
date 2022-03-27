<script>
import { ref } from 'vue'
import interact from 'interactjs'
import _ from 'lodash'
import axios from 'axios'
import CardContent from './components/CardContent.vue'
import EditorBtn from './components/EditorBtn.vue'
export default {
  data() {
    return {
      cardData: {}, // 已获取的卡片数据
      showCardList: [], // 当前显示的卡片列表
      selectCardList: [], // 当前选中的卡片列表
      onMove: false, // 是否正在移动
      onJump: false, // 是否开启跳转
      openEdit: false, // 是否开启编辑
      editKey: '', // 编辑密码
      editCheck: false, // 编辑密码是否正确
      jumpTarget: { x: null, y: null }, // 跳转目标点
      cardBlock: [], // 已加载的区块
      zIndexTemp: 0, // 临时卡片层级
      url: '//127.0.0.1:8080/api/rest/'
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
      this.updateSelectedCardPostion()
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
      this.updateSelectedCardPostion()
    },
    alignLeft() {
      const minX = _.min(this.selectCardList.map(id => {
        return +this.cardData[id].x - this.cardData[id].width / 2
      }))
      this.selectCardList.forEach(id => {
        this.cardData[id].x = minX + this.cardData[id].width / 2
      })
      this.updateSelectedCardPostion()
    },
    centerHorizontally() {
      this.selectCardList.forEach(id => {
        this.cardData[id].x = this.cardData[this.selectCardList[0]].x
      })
      this.updateSelectedCardPostion()
    },
    alignRight() {
      const maxX = _.max(this.selectCardList.map(id => {
        return +this.cardData[id].x + this.cardData[id].width / 2
      }))
      this.selectCardList.forEach(id => {
        this.cardData[id].x = maxX - this.cardData[id].width / 2
      })
      this.updateSelectedCardPostion()
    },
    alignTop() {
      const minY = _.min(this.selectCardList.map(id => {
        return +this.cardData[id].y - this.cardData[id].height / 2
      }))
      this.selectCardList.forEach(id => {
        this.cardData[id].y = minY + this.cardData[id].height / 2
      })
      this.updateSelectedCardPostion()
    },
    centerVerticaly() {
      this.selectCardList.forEach(id => {
        this.cardData[id].y = this.cardData[this.selectCardList[0]].y
      })
      this.updateSelectedCardPostion()
    },
    alignBottom() {
      const maxY = _.max(this.selectCardList.map(id => {
        return +this.cardData[id].y + this.cardData[id].height / 2
      }))
      this.selectCardList.forEach(id => {
        this.cardData[id].y = maxY - this.cardData[id].height / 2
      })
      this.updateSelectedCardPostion()
    },
    removeCard() {
      this.showCardList = this.showCardList.filter(id => {
        return !this.selectCardList.includes(id)
      })
      this.selectCardList.forEach(id => {
        delete this.cardData[id]
        axios.post(this.url + 'card/remove', {
          id: +id
        }, {
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-world': this.$route.params.world,
            'x-hasura-key': this.editKey
          }
        })
      })
      this.selectCardList = []
    },
    checkEdit() {
      axios.get(this.url + 'world/check', {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-world': this.$route.params.world,
          'x-hasura-key': this.editKey
        }
      }).then(res => {
        if (res.data.world.length) {
          this.editCheck = true
        }
      })
    },
    async getCards(x = 0, y = 0) {
      const blockX = parseInt(x / 5000)
      const blockY = parseInt(y / 5000)
      if (!this.cardBlock.includes(`${blockX},${blockY}`)) {
        this.cardBlock.push(`${blockX},${blockY}`)
        const { data: res } = await axios.post(this.url + 'card/get', {
          min_x: -5000 + blockX * 5000,
          max_x: 5000 + blockX * 5000,
          min_y: -5000 + blockY * 5000,
          max_y: 5000 + blockY * 5000,
        }, {
          headers: {
            'x-hasura-world': this.$route.params.world
          }
        })
        res.card.forEach(card => {
          if (!this.cardData[card.id]) {
            this.cardData[card.id] = card
          }
        })
      }
      return new Promise((resolve, reject) => {
        resolve(this)
      })
    },
    updateCardPosition(id, x, y) {
      axios.post(this.url + 'card/move', {
        id: +id,
        x: parseInt(x),
        y: parseInt(y)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-world': this.$route.params.world,
          'x-hasura-key': this.editKey
        }
      }).then(res => {
        const returnData = res.data.card
        const id = returnData.id
        const lastChangeTime = returnData.lastChangeTime
        this.cardData[id].lastChangeTime = lastChangeTime
      })
    },
    updateSelectedCardPostion() {
      this.selectCardList.forEach(cardId => {
        this.updateCardPosition(cardId, this.cardData[cardId].x, this.cardData[cardId].y)
      })
    },
    sortCard() {
      const sortedList = _.sortBy(this.showCardList, id => {
        return this.cardData[id].lastChangeTime
      })
      sortedList.forEach((id, index) => {
        this.cardData[id].zIndex = index
      })
    }
  },
  watch: {
    'showCardList.length'(length) {
      this.sortCard()
      this.zIndexTemp = length
    },
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
            // 更新URL
            const urlPosX = ((+lastPagePostion.value.x - moveDelta.value.x) / 100).toFixed(2)
            const urlPosY = ((+lastPagePostion.value.y - moveDelta.value.y) / 100).toFixed(2)
            _this.$router.replace({ params: { position: `${urlPosX},${urlPosY}` } });
            // 更新卡片
            _this.getCards(parseInt(pagePostion.value.x), parseInt(pagePostion.value.y)).then(() => {
              checkCards()
              let selectCardList = []
              Object.keys(_this.cardData).forEach(id => {
                const card = _this.cardData[id]
                if (card.onChoose) {
                  selectCardList.push(card.id)
                }
              })
              _this.selectCardList = selectCardList
              if (selectCardList.length) {
                _this.$refs.editor.style.transform = `translate3d(${event.page.x + 10}px, ${event.page.y + 10}px, 0)`
              }
            })
          }
        }
      })
      // 单击页面
      .on('tap', event => {
        // 清除选中状态
        if (event.target.id == 'view') {
          this.selectCardList.forEach(id => {
            const cardDom = document.querySelector(`[data-id="${id}"]`)
            this.cardData[id].onChoose = false
            this.cardData[id].width = cardDom.clientWidth
            this.cardData[id].height = cardDom.clientHeight
          })
          // 保存卡片数据
          if (this.selectCardList.length == 1) {
            const card = this.cardData[this.selectCardList[0]]
            const cardData = _.pick(card, ['id', 'world', 'x', 'y', 'width', 'height', 'class', 'content'])
            axios.post(this.url + 'card/update', cardData, {
              headers: {
                'Content-Type': 'application/json',
                'x-hasura-world': this.$route.params.world,
                'x-hasura-key': this.editKey
              }
            }).then(res => {
              const returnData = res.data.card
              const id = returnData.id
              const lastChangeTime = returnData.lastChangeTime
              this.cardData[id].lastChangeTime = lastChangeTime
            })
          }
          this.selectCardList = []
        }
      })
      // 双击页面插入卡片
      .on('doubletap', function (event) {
        if (_this.editCheck) {
          const newCardX = parseInt(event.x - document.body.clientWidth / 2 + +pagePostion.value.x)
          const newCardY = parseInt(event.y - document.body.clientHeight / 2 + +pagePostion.value.y)
          const card = {
            "world": _this.$route.params.world,
            "x": newCardX,
            "y": newCardY,
            "width": "110",
            "height": "44",
            "class": "theme-blue",
            "content": "你好，世界！"
          }
          axios.post(_this.url + 'card/add', {
            "object": card
          }, {
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-world': _this.$route.params.world,
              'x-hasura-key': _this.editKey
            }
          }).then(res => {
            const cardId = res.data.card.id
            if (cardId) {
              const newCardData = {
                id: cardId,
                ...card
              }
              _this.cardData[cardId] = newCardData
              _this.showCardList.push(cardId)
            }
          })
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

            // 更新卡片层级
            _this.zIndexTemp++
            _this.cardData[cardId].zIndex = _this.zIndexTemp
            _this.selectCardList.forEach(id => {
              _this.cardData[id].zIndex = _this.zIndexTemp
            })
          },
          move(event) {
            moveCardDelta.value.x = event.clientX - event.x0
            moveCardDelta.value.y = event.clientY - event.y0
          },
          end(event) {
            const dom = event.target
            const cardId = dom.dataset.id
            // 单选
            if (!_this.selectCardList.length) {
              _this.cardData[cardId].onChoose = false
              _this.updateCardPosition(cardId, dom.dataset.x, dom.dataset.y)
            }
            _this.$refs.cardRef.forEach(card => {
              const cardId = card.dataset.id
              _this.cardData[cardId].x = parseInt(card.dataset.x)
              _this.cardData[cardId].y = parseInt(card.dataset.y)
            })
            _this.updateSelectedCardPostion()
            _this.onMove = false
          }
        }
      })
      // 点击卡片弹出编辑框
      .on('tap', event => {
        Object.keys(this.cardData).forEach(id => {
          this.cardData[id].onChoose = false
        })
        if (event.target.parentNode.dataset.id && this.editCheck) {
          const cardId = event.target.parentNode.dataset.id
          this.cardData[cardId].onChoose = !this.cardData[cardId].onChoose
          if (this.cardData[cardId].onChoose) {
            this.selectCardList = [+cardId]
            this.$refs.editor.style.transform = `translate3d(${event.x + 10}px, ${event.y + 10}px, 0)`
            this.zIndexTemp++
            this.cardData[cardId].zIndex = this.zIndexTemp
          }
        }
      })

    interact('.btn-home').on('tap', event => {
      pageJump()
    })
    interact('.btn-jump').on('tap', event => {
      pageJump(this.jumpTarget.x * 100, this.jumpTarget.y * 100)
    })

    let halfClientWidth = document.body.clientWidth / 2
    let halfClientHeight = document.body.clientHeight / 2

    // 监听窗口变换
    window.addEventListener('resize', () => {
      halfClientWidth = document.body.clientWidth / 2
      halfClientHeight = document.body.clientHeight / 2
    })

    const render = () => {
      // 缓动
      pagePostion.value.x = (+pagePostion.value.x + ((lastPagePostion.value.x - moveDelta.value.x) - pagePostion.value.x) * 0.1).toFixed(3)
      pagePostion.value.y = (+pagePostion.value.y + ((lastPagePostion.value.y - moveDelta.value.y) - pagePostion.value.y) * 0.1).toFixed(3)
      // 卡片
      this.$refs.cardRef && this.$refs.cardRef.forEach((item, index) => {
        const cardId = item.dataset.id
        const x = -pagePostion.value.x + +item.dataset.x + halfClientWidth - item.clientWidth / 2 - 10
        const y = -pagePostion.value.y + +item.dataset.y + halfClientHeight - item.clientHeight / 2 - 10
        item.style.transform = `translate3D(${x}px, ${y}px, 0)`
        if (this.cardData[cardId]?.onChoose && this?.onMove) {
          this.$refs.cardRef[index].dataset.x = +this.cardData[cardId].x + moveCardDelta.value.x
          this.$refs.cardRef[index].dataset.y = +this.cardData[cardId].y + moveCardDelta.value.y
        }
      })
      document.body.style.backgroundPositionX = `${-pagePostion.value.x}px`
      document.body.style.backgroundPositionY = `${-pagePostion.value.y}px`
      // document.querySelector('.test').innerHTML = `
      //   <p>pagePostionX  ${pagePostion.value.x}</p>
      //   <p>pagePostionY  ${pagePostion.value.y}</p>
      //   <p>moveDeltaX  ${moveDelta.value.x}</p>
      //   <p>moveDeltaY  ${moveDelta.value.y}</p>
      //   <p>lastPagePostionX  ${lastPagePostion.value.x}</p>
      //   <p>lastPagePostionY  ${lastPagePostion.value.y}</p>
      //   <p>showCardList  ${this.showCardList}</p>
      //   <p>selectCardList ${this.selectCardList}</p>
      // `
      document.querySelector('.coordinate').innerHTML = `
        ${(pagePostion.value.x / 100).toFixed(2)} , ${(pagePostion.value.y / 100).toFixed(2)}
      `
      requestAnimationFrame(render)
    }

    render()

    // 滚动
    document.body.addEventListener('wheel', e => {
      if (e.deltaY > 0) {
        moveDelta.value.y -= 50
      } else {
        moveDelta.value.y += 50
      }
      const urlPosX = ((+lastPagePostion.value.x - moveDelta.value.x) / 100).toFixed(2)
      const urlPosY = ((+lastPagePostion.value.y - moveDelta.value.y) / 100).toFixed(2)
      this.$router.replace({ params: { position: `${urlPosX},${urlPosY}` } })
    })

    document.body.addEventListener('wheel', _.throttle(async () => {
      await this.getCards(parseInt(pagePostion.value.x), parseInt(pagePostion.value.y))
      checkCards()
    }, 2000, { 'trailing': false }))

    // 是否超出边界
    const checkCards = (pageX = pagePostion.value.x, pageY = pagePostion.value.y) => {
      let showCardList = []
      // const pageX = pagePostion.value.x
      // const pageY = pagePostion.value.y
      const halfScreenWidth = document.body.clientWidth / 2
      const halfScreenHeight = document.body.clientHeight / 2
      const padding = 500
      Object.keys(this.cardData).forEach(id => {
        const card = this.cardData[id]
        if (
          pageX < +card.x + padding + halfScreenWidth + card.width / 2 &&
          pageX > +card.x - padding - halfScreenWidth - card.width / 2 &&
          pageY < +card.y + padding + halfScreenHeight + card.height / 2 &&
          pageY > +card.y - padding - halfScreenHeight - card.height / 2
        ) {
          showCardList.push(card.id)
        }
      })
      this.showCardList = showCardList
    }

    // 页面跳转
    const pageJump = async (x = 0, y = 0) => {
      lastPagePostion.value.x = pagePostion.value.x
      lastPagePostion.value.y = pagePostion.value.y
      moveDelta.value.x = +lastPagePostion.value.x - x
      moveDelta.value.y = +lastPagePostion.value.y - y
      const urlPosX = ((+lastPagePostion.value.x - moveDelta.value.x) / 100).toFixed(2)
      const urlPosY = ((+lastPagePostion.value.y - moveDelta.value.y) / 100).toFixed(2)
      this.$router.replace({ params: { position: `${urlPosX},${urlPosY}` } })
      await this.getCards(x, y)
      checkCards(x, y)
    }

    // 初始化
    setTimeout(async () => {
      // URL跳转
      if (this.$route.params.position) {
        const position = this.$route.params.position.split(',')
        pagePostion.value.x = position[0] * 100
        pagePostion.value.y = position[1] * 100
        moveDelta.value.x = -position[0] * 100
        moveDelta.value.y = -position[1] * 100
        // lastPagePostion.value.x = pagePostion.value.x
        // lastPagePostion.value.y = pagePostion.value.y
        // moveDelta.value.x = +lastPagePostion.value.x - position[0] * 100
        // moveDelta.value.y = +lastPagePostion.value.y - position[1] * 100
      }
      // 获取卡片信息
      await this.getCards(pagePostion.value.x, pagePostion.value.y)
      checkCards()
    }, 0);
  }
};
</script>

<template>
  <!-- 卡片 -->
  <div id="view" class="w-screen h-screen">
    <div
      v-for="(id, index) in showCardList"
      :key="cardData[id].id"
      :data-id="cardData[id].id"
      :data-index="index"
      :data-x="cardData[id].x"
      :data-y="cardData[id].y"
      :style="{ zIndex: cardData[id].zIndex }"
      class="card fixed group border-10 border-transparent"
      ref="cardRef"
    >
      <p
        v-if="editCheck"
        class="move absolute rounded-t bg-black/20 w-full h-2.5 transition opacity-0 group-hover:opacity-100"
      ></p>
      <CardContent :cardData="cardData[id]" />
    </div>
  </div>
  <!-- 选框 -->
  <div
    class="selection absolute pointer-events-none bg-teal-200/20 border-teal-200 border-1 top-0 left-0"
  ></div>
  <!-- 编辑器 -->
  <div
    ref="editor"
    class="absolute top-0 bg-light-50 border-2 border-black/20 rounded p-2 transition min-w-50 text-sm space-y-2 z-9999"
    :class="[
      selectCardList[0] ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      !editCheck && '!opacity-0 !pointer-events-none'
    ]"
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
      <!-- <p class="font-bold text-dark-50">主题</p>
      <div class="flex justify-between space-x-1">
        <div class="w-full h-5 rounded border-2 border-transparent bg-purple"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-blue"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-pink"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-yellow"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-green"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-red"></div>
        <div class="w-full h-5 rounded border-2 border-transparent bg-gray-200"></div>
        <div class="w-full h-5 rounded border-2"></div>
      </div>-->
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
        <EditorBtn @click="verticalDistribute()" :icon="'icon-shuipingpailie'" />
        <EditorBtn @click="horizontalDistribute()" :icon="'icon-chuizhipailie'" />
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
  <!-- 控制台 -->
  <div class="fixed bottom-4 right-4 h-10 flex space-x-1 z-9999">
    <p class="text-center text-sm bg-white/90 border-black/50 border-2 rounded-sm p-2">
      主世界 (
      <span class="coordinate"></span>)
    </p>
    <p
      class="btn-home bg-white/90 border-black/50 border-2 rounded-sm w-10 flex justify-center items-center opacity-50 transition hover:(opacity-100)"
    >
      <i class="iconfont icon-yuandian text-xl"></i>
    </p>
    <p
      @click="onJump = !onJump"
      class="bg-white/90 border-black/50 border-2 rounded-sm w-10 flex justify-center items-center opacity-50 transition hover:(opacity-100)"
      :class="onJump ? '!opacity-100' : ''"
    >
      <i class="iconfont icon-huojian text-xl"></i>
    </p>
  </div>
  <div
    class="fixed bottom-16 right-4 bg-white/90 border-black/50 border-2 rounded-sm p-2 text-dark-50 text-sm transition opacity-0 pointer-events-none z-9999"
    :class="onJump ? 'opacity-100 pointer-events-auto' : ''"
  >
    <p>系统初始化已完成……</p>
    <p>燃料确认充足……</p>
    <p>跃迁引擎已启动……</p>
    <p>请指定跳跃坐标……</p>
    <input
      v-model="jumpTarget.x"
      class="bg-gray-100 p-1 w-22 rounded-sm border-black/20 border-2 mr-2"
      placeholder="x"
      type="text"
    />
    <input
      v-model="jumpTarget.y"
      class="bg-gray-100 p-1 w-22 rounded-sm border-black/20 border-2 mr-2"
      placeholder="y"
      type="text"
    />
    <p class="btn-jump text-blue-dark inline-block">启动跃迁引擎</p>
  </div>
  <!-- 编辑模式 -->
  <p
    @click="this.openEdit = !this.openEdit"
    class="fixed bottom-4 left-4 bg-white/90 border-black/50 border-2 rounded-sm w-10 h-10 flex justify-center items-center z-9999 opacity-0 transition hover:(opacity-100)"
    :class="this.openEdit ? '!opacity-100' : ''"
  >
    <i class="iconfont icon-bianji text-xl"></i>
  </p>
  <div
    class="fixed bottom-16 left-4 font-default bg-white/90 border-black/50 border-2 rounded-sm p-2 text-dark-50 text-sm z-9999 transition opacity-0 pointer-events-none"
    :class="openEdit ? 'opacity-100 pointer-events-auto' : ''"
  >
    <template v-if="editCheck">
      <p>当前正处于创造模式中</p>
      <p @click="editCheck = false" class="text-blue-dark inline-block">关闭创造模式</p>
    </template>
    <template v-else>
      <p>正在启动创造模式……</p>
      <p>验证用户身份中……</p>
      <p>请输入您的超级密钥……</p>
      <input
        class="bg-gray-100 p-1 w-22 rounded-sm border-black/20 border-2 mr-2"
        type="password"
        v-model="editKey"
      />
      <p @click="checkEdit()" class="text-blue-dark inline-block">确认密钥</p>
    </template>
  </div>
  <p class="theme-pink theme-yellow theme-green theme-red theme-purple"></p>
</template>

<style>
@import url(//at.alicdn.com/t/font_3228461_apeclwa2cej.css);
@import "lxgw-wenkai-screen-webfont/style.css";
* {
  margin: 0;
  padding: 0;
}
body {
  font-family: "LXGW WenKai Screen", sans-serif !important;
  background: #fffaf3;
  background-image: url("/bg.png");
  background-size: 80%;
}
</style>
