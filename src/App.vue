<script>
import { ref } from "vue";
import interact from "interactjs";
import _ from "lodash";
import axios from "axios";
import CardContent from "./components/CardContent.vue";
import CardDragBar from "./components/CardDragBar.vue";
import EditorBtn from "./components/EditorBtn.vue";
import Selection from "./components/Selection.vue";
import EditorModeBox from "./components/EditorModeBox.vue";
import FooterItem from "./components/FooterItem.vue";
import JumpTargetBox from "./components/JumpTargetBox.vue";
import Coordinate from "./components/Coordinate.vue";
export default {
  data() {
    return {
      world: {}, // 世界信息
      cardData: {}, // 已获取的卡片数据
      showCardList: [], // 当前显示的卡片列表
      selectCardList: [], // 当前选中的卡片列表
      onMove: false, // 是否正在移动
      onJump: false, // 是否开启跳转
      openEdit: false, // 是否开启编辑
      editKey: "", // 编辑密码
      editCheck: false, // 编辑密码是否正确
      jumpTarget: { x: null, y: null }, // 跳转目标点
      cardBlock: [], // 已加载的区块
      zIndexTemp: 0, // 临时卡片层级,
      shiftKey: false, // shift键是否按下
      url: "//127.0.0.1:8080/api/rest/hanakoi/", // 接口地址
      pageJump: null,
    };
  },
  components: {
    CardContent, // 卡片内容
    EditorBtn, // 编辑按钮
    CardDragBar, // 卡片拖拽条
    Selection, // 选择框
    EditorModeBox, // 编辑模式框
    FooterItem, // 底部按钮
    JumpTargetBox, // 跳转目标框
    Coordinate, // 坐标
  },
  methods: {
    // 获取卡片指定锚点位置的坐标
    getCardCoord(id, anchor) {
      const card = this.cardData[id];
      const nowAnchor = card.anchor.split(" ");
      const [nowanchorX, nowanchorY] = [nowAnchor[0], nowAnchor[1]];
      const newAnchor = anchor.split(" ");
      const [newAnchorX, newAnchorY] = [newAnchor[0], newAnchor[1]];
      let [x, y] = [parseInt(card.x), parseInt(card.y)];
      if (nowanchorX == "center") {
        x -= card.width / 2;
      } else if (nowanchorX == "right") {
        x -= card.width;
      }
      if (nowanchorY == "center") {
        y -= card.height / 2;
      } else if (nowanchorY == "bottom") {
        y -= card.height;
      }
      if (newAnchorX == "center") {
        x += card.width / 2;
      } else if (newAnchorX == "right") {
        x += card.width;
      }
      if (newAnchorY == "center") {
        y += card.height / 2;
      } else if (newAnchorY == "bottom") {
        y += card.height;
      }
      return {
        x,
        y,
      };
    },
    // 垂直排列卡片
    verticalAlign() {
      // 按y轴顶部排序选中的卡片id
      const sortedList = _.sortBy(this.selectCardList, (id) => {
        return this.getCardCoord(id, "center top").y;
      });
      // 获取最顶部卡片的最左侧
      const firstCard = this.cardData[sortedList[0]];
      const firstCardCoord = this.getCardCoord(sortedList[0], "left top");
      const firstCardX = firstCardCoord.x;
      const firstCardY = firstCardCoord.y;
      // 按顺序垂直排列卡片
      let [tempX, tempY] = [firstCardX, firstCardY + firstCard.height + 10];
      sortedList.forEach((id, index) => {
        if (index) {
          const nowCard = this.cardData[id];
          nowCard.x = tempX;
          nowCard.y = tempY;
          const nowCardCoord = this.getCardCoord(id, nowCard.anchor);
          const newCardCoord = this.getCardCoord(id, "left top");
          nowCard.x += nowCardCoord.x - newCardCoord.x;
          nowCard.y += nowCardCoord.y - newCardCoord.y;
          tempY += nowCard.height + 10;
        }
      });
      this.updateSelectedCardPostion();
    },
    // 水平排列卡片
    horizontalAlign() {
      // 按x轴左侧排序选中的卡片id
      const sortedList = _.sortBy(this.selectCardList, (id) => {
        return this.getCardCoord(id, "left center").x;
      });
      // 获取最左侧卡片的最左侧
      const firstCard = this.cardData[sortedList[0]];
      const firstCardCoord = this.getCardCoord(sortedList[0], "left top");
      const firstCardX = firstCardCoord.x;
      const firstCardY = firstCardCoord.y;
      // 按顺序垂直排列卡片
      let [tempX, tempY] = [firstCardX + firstCard.width + 10, firstCardY];
      sortedList.forEach((id, index) => {
        if (index) {
          const nowCard = this.cardData[id];
          nowCard.x = tempX;
          nowCard.y = tempY;
          const nowCardCoord = this.getCardCoord(id, nowCard.anchor);
          const newCardCoord = this.getCardCoord(id, "left top");
          nowCard.x += nowCardCoord.x - newCardCoord.x;
          nowCard.y += nowCardCoord.y - newCardCoord.y;
          tempX += nowCard.width + 10;
        }
      });
      this.updateSelectedCardPostion();
    },
    // 垂直分布卡片
    verticalDistribute() {
      // 按x轴左侧排序选中的卡片id
      const sortedList = _.sortBy(this.selectCardList, (id) => {
        return this.getCardCoord(id, "center top").y;
      });
      const firstCard = this.cardData[sortedList[0]];
      const topCardY = this.getCardCoord(sortedList[0], "center top").y;
      const bottomCardY = this.getCardCoord(
        sortedList[sortedList.length - 1],
        "center bottom"
      ).y;
      const selectCardHeight = bottomCardY - topCardY;
      const allCardHeight = _.reduce(
        this.selectCardList,
        (sum, id) => {
          return sum + this.cardData[id].height;
        },
        0
      );
      const spaceBetween =
        (selectCardHeight - allCardHeight) / (sortedList.length - 1);
      let tempY = topCardY + firstCard.height + spaceBetween;
      sortedList.forEach((id, index) => {
        if (index) {
          const nowCard = this.cardData[id];
          nowCard.y = tempY;
          const nowCardCoord = this.getCardCoord(id, nowCard.anchor);
          const newCardCoord = this.getCardCoord(id, "center top");
          nowCard.y += nowCardCoord.y - newCardCoord.y;
          tempY += nowCard.height + spaceBetween;
        }
      });
      this.updateSelectedCardPostion();
    },
    // 水平分布卡片
    horizontalDistribute() {
      // 按x轴左侧排序选中的卡片id
      const sortedList = _.sortBy(this.selectCardList, (id) => {
        return this.getCardCoord(id, "left center").x;
      });
      const firstCard = this.cardData[sortedList[0]];
      const leftCardX = this.getCardCoord(sortedList[0], "left center").x;
      const rightCardX = this.getCardCoord(
        sortedList[sortedList.length - 1],
        "right center"
      ).x;
      const selectCardWidth = rightCardX - leftCardX;
      const allCardWidth = _.reduce(
        this.selectCardList,
        (sum, id) => {
          return sum + this.cardData[id].width;
        },
        0
      );
      const spaceBetween =
        (selectCardWidth - allCardWidth) / (sortedList.length - 1);
      let tempX = leftCardX + firstCard.width + spaceBetween;
      sortedList.forEach((id, index) => {
        if (index) {
          const nowCard = this.cardData[id];
          nowCard.x = tempX;
          const nowCardCoord = this.getCardCoord(id, nowCard.anchor);
          const newCardCoord = this.getCardCoord(id, "left center");
          nowCard.x += nowCardCoord.x - newCardCoord.x;
          tempX += nowCard.width + spaceBetween;
        }
      });
      this.updateSelectedCardPostion();
    },
    // 左对齐卡片
    alignLeft() {
      const minX = _.min(
        this.selectCardList.map((id) => {
          return this.getCardCoord(id, "left center").x;
        })
      );
      this.selectCardList.forEach((id) => {
        const card = this.cardData[id];
        card.x = minX;
        const nowCardCoordX = this.getCardCoord(id, card.anchor).x;
        const newCardCoordX = this.getCardCoord(id, "left center").x;
        card.x += nowCardCoordX - newCardCoordX;
      });
      this.updateSelectedCardPostion();
    },
    // 垂直居中卡片
    centerHorizontally() {
      const firstCardCoordX = this.getCardCoord(
        this.selectCardList[0],
        "center center"
      ).x;
      this.selectCardList.forEach((id) => {
        const card = this.cardData[id];
        card.x = firstCardCoordX;
        const nowCardCoordX = this.getCardCoord(id, card.anchor).x;
        const newCardCoordX = this.getCardCoord(id, "center center").x;
        card.x += nowCardCoordX - newCardCoordX;
      });
      this.updateSelectedCardPostion();
    },
    // 右对齐卡片
    alignRight() {
      const maxX = _.max(
        this.selectCardList.map((id) => {
          return this.getCardCoord(id, "right center").x;
        })
      );
      this.selectCardList.forEach((id) => {
        const card = this.cardData[id];
        card.x = maxX;
        const nowCardCoordX = this.getCardCoord(id, card.anchor).x;
        const newCardCoordX = this.getCardCoord(id, "right center").x;
        card.x += nowCardCoordX - newCardCoordX;
      });
      this.updateSelectedCardPostion();
    },
    // 顶部对齐卡片
    alignTop() {
      const minY = _.min(
        this.selectCardList.map((id) => {
          return this.getCardCoord(id, "center top").y;
        })
      );
      this.selectCardList.forEach((id) => {
        const card = this.cardData[id];
        card.y = minY;
        const nowCardCoordY = this.getCardCoord(id, card.anchor).y;
        const newCardCoordY = this.getCardCoord(id, "center top").y;
        card.y += nowCardCoordY - newCardCoordY;
      });
      this.updateSelectedCardPostion();
    },
    // 水平居中卡片
    centerVerticaly() {
      const firstCardCoordY = this.getCardCoord(
        this.selectCardList[0],
        "center center"
      ).y;
      this.selectCardList.forEach((id) => {
        const card = this.cardData[id];
        card.y = firstCardCoordY;
        const nowCardCoordY = this.getCardCoord(id, card.anchor).y;
        const newCardCoordY = this.getCardCoord(id, "center center").y;
        card.y += nowCardCoordY - newCardCoordY;
      });
      this.updateSelectedCardPostion();
    },
    // 底部对齐卡片
    alignBottom() {
      const maxY = _.max(
        this.selectCardList.map((id) => {
          return this.getCardCoord(id, "center bottom").y;
        })
      );
      this.selectCardList.forEach((id) => {
        const card = this.cardData[id];
        card.y = maxY;
        const nowCardCoordY = this.getCardCoord(id, card.anchor).y;
        const newCardCoordY = this.getCardCoord(id, "center bottom").y;
        card.y += nowCardCoordY - newCardCoordY;
      });
      this.updateSelectedCardPostion();
    },
    // 锁定/解锁卡片层级
    changeFixed() {
      const cardId = this.selectCardList[0];
      const card = this.cardData[cardId];
      if (card.fixed_at) {
        axios
          .post(
            this.url + "card/relieved",
            {
              id: cardId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-hasura-world": this.$route.params.world,
                "x-hasura-key": this.editKey,
              },
            }
          )
          .then(() => {
            card.fixed_at = "";
          });
      } else {
        axios
          .post(
            this.url + "card/fixed",
            {
              id: cardId,
              fixed_at: card.updated_at,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-hasura-world": this.$route.params.world,
                "x-hasura-key": this.editKey,
              },
            }
          )
          .then(() => {
            card.fixed_at = card.updated_at;
          });
      }
    },
    removeCard() {
      this.showCardList = this.showCardList.filter((id) => {
        return !this.selectCardList.includes(id);
      });
      this.selectCardList.forEach((id) => {
        delete this.cardData[id];
        axios.post(
          this.url + "card/remove",
          {
            id: +id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-hasura-world": this.$route.params.world,
              "x-hasura-key": this.editKey,
            },
          }
        );
      });
      this.selectCardList = [];
    },
    checkEdit(editKey) {
      this.editKey = editKey;
      axios
        .get(this.url + "world/check", {
          headers: {
            "Content-Type": "application/json",
            "x-hasura-world": this.$route.params.world,
            "x-hasura-key": editKey,
          },
        })
        .then((res) => {
          if (res.data.world.length) {
            this.editCheck = true;
          }
        });
    },
    async getCards(x = 0, y = 0) {
      const blockX = parseInt(x / 5000);
      const blockY = parseInt(y / 5000);
      if (!this.cardBlock.includes(`${blockX},${blockY}`)) {
        this.cardBlock.push(`${blockX},${blockY}`);
        const { data: res } = await axios.post(
          this.url + "card/get",
          {
            min_x: -5000 + blockX * 5000,
            max_x: 5000 + blockX * 5000,
            min_y: -5000 + blockY * 5000,
            max_y: 5000 + blockY * 5000,
          },
          {
            headers: {
              "x-hasura-world": this.world.name,
            },
          }
        );
        res.card.forEach((card) => {
          if (!this.cardData[card.id]) {
            this.cardData[card.id] = card;
          }
        });
      }
      return new Promise((resolve, reject) => {
        resolve(this);
      });
    },
    updateCardPosition(id, x, y) {
      axios
        .post(
          this.url + "card/move",
          {
            id: +id,
            x: parseInt(x),
            y: parseInt(y),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-hasura-world": this.$route.params.world,
              "x-hasura-key": this.editKey,
            },
          }
        )
        .then((res) => {
          const returnData = res.data.card;
          const id = returnData.id;
          const updated_at = returnData.updated_at;
          this.cardData[id].updated_at = updated_at;
        });
    },
    updateSelectedCardPostion() {
      this.selectCardList.forEach((cardId) => {
        this.updateCardPosition(
          cardId,
          this.cardData[cardId].x,
          this.cardData[cardId].y
        );
      });
    },
    sortCard() {
      const sortedList = _.sortBy(this.showCardList, (id) => {
        return this.cardData[id].fixed_at
          ? this.cardData[id].fixed_at
          : this.cardData[id].updated_at;
      });
      sortedList.forEach((id, index) => {
        this.cardData[id].zIndex = index;
      });
    },
  },
  watch: {
    "showCardList.length"(length) {
      this.sortCard();
      this.zIndexTemp = length;
    },
    // "$route.hash"(hash) {
    //   if (hash) {
    //     const hashData = hash.split("/");
    //     const world = hashData[0].slice(1);
    //     const position = hashData[1].split(",");
    //     if (world != this.$route.params.world) {
    //       this.world.name = world;
    //       this.cardBlock = [];
    //       this.editCheck = false;
    //       this.editKey = "";
    //     }
    //     this.pageJump(position[0] * 100, position[1] * 100);
    //     this.$router.replace(`/world/${hash.slice(1)}`);
    //   }
    // },
  },
  mounted() {
    const pagePostion = ref({ x: 0, y: 0 }); // 当前页面的位置
    const lastPagePostion = ref({ x: 0, y: 0 }); // 上次页面的位置
    const moveDelta = ref({ x: 0, y: 0 }); // 每次移动时距离上次页面位置的偏移量

    const moveCardDelta = ref({ x: 0, y: 0 }); // 卡片移动偏移量

    const lastSelectionPostion = ref({ x: 0, y: 0 }); // 选框初始位置

    const selection = document.querySelector(".selection");
    let onSelection = false;
    let haveMoved = false;

    const _this = this;
    let allCardDom = null;

    // 监听URL变化
    window.addEventListener("popstate", () => {
      if (this.$route.hash) {
        const hashData = this.$route.hash.split("/");
        const world = hashData[0].slice(1);
        let position = hashData[1].split(",");
        const mode = hashData[2];
        position[0] *= 100;
        position[1] *= 100;
        if (mode == "article") {
          position[1] += document.body.clientHeight / 2 - 30;
        }
        if (world != this.$route.params.world) {
          this.world.name = world;
          this.cardBlock = [];
          this.editCheck = false;
          this.editKey = "";
        }
        this.pageJump(position[0], position[1]);
        this.$router.replace(
          `/world/${world}/${(position[0] / 100).toFixed(2)},${(
            position[1] / 100
          ).toFixed(2)}`
        );
      } else {
        const position = this.$route.params.position.split(",");
        this.world.name = this.$route.params.world;
        this.cardBlock = [];
        this.editCheck = false;
        this.editKey = "";
        this.pageJump(position[0] * 100, position[1] * 100);
      }
    });

    interact("#view")
      .styleCursor(false)
      .draggable({
        listeners: {
          start(event) {
            // 选框、页面、偏移量初始数据
            lastSelectionPostion.value.x = event.clientX;
            lastSelectionPostion.value.y = event.clientY;
            lastPagePostion.value.x = pagePostion.value.x;
            lastPagePostion.value.y = pagePostion.value.y;
            moveDelta.value.x = 0;
            moveDelta.value.y = 0;
          },
          move(event) {
            // 判断是否长按进入选框模式
            if (!onSelection && !haveMoved && event.dt >= 200) {
              onSelection = true;
              selection.style.opacity = 1;
              allCardDom = document.querySelectorAll(".card");
            }
            haveMoved = true;
            if (!onSelection) {
              moveDelta.value.x = event.clientX - event.x0;
              moveDelta.value.y = event.clientY - event.y0;
            } else {
              // 计算选框是否选中卡片
              const selectionLeft =
                event.clientX < lastSelectionPostion.value.x
                  ? event.clientX
                  : lastSelectionPostion.value.x;
              const selectionTop =
                event.clientY < lastSelectionPostion.value.y
                  ? event.clientY
                  : lastSelectionPostion.value.y;
              const selectionWidth = Math.abs(event.clientX - event.x0);
              const selectionHeight = Math.abs(event.clientY - event.y0);
              const selectionRight = selectionLeft + selectionWidth;
              const selectionBottom = selectionTop + selectionHeight;
              selection.style.left = selectionLeft + "px";
              selection.style.top = selectionTop + "px";
              selection.style.width = selectionWidth + "px";
              selection.style.height = selectionHeight + "px";

              allCardDom.forEach((card) => {
                const cardRect = card.getBoundingClientRect();
                const cardId = card.dataset.id;
                if (
                  cardRect.left > selectionLeft - cardRect.width &&
                  cardRect.right < selectionRight + cardRect.width &&
                  cardRect.top > selectionTop - cardRect.height &&
                  cardRect.bottom < selectionBottom + cardRect.height
                ) {
                  _this.cardData[cardId].onChoose = true;
                  _this.cardData[cardId].x = card.dataset.x;
                  _this.cardData[cardId].y = card.dataset.y;
                } else {
                  _this.cardData[cardId].onChoose = false;
                }
              });
            }
          },
          end(event) {
            onSelection = false;
            haveMoved = false;
            selection.style.opacity = 0;
            // 更新URL
            const urlPosX = (
              (+lastPagePostion.value.x - moveDelta.value.x) /
              100
            ).toFixed(2);
            const urlPosY = (
              (+lastPagePostion.value.y - moveDelta.value.y) /
              100
            ).toFixed(2);
            _this.$router.replace({
              params: { position: `${urlPosX},${urlPosY}` },
            });
            // 更新卡片
            _this
              .getCards(
                parseInt(pagePostion.value.x),
                parseInt(pagePostion.value.y)
              )
              .then(() => {
                checkCards();
                let selectCardList = [];
                Object.keys(_this.cardData).forEach((id) => {
                  const card = _this.cardData[id];
                  if (card.onChoose) {
                    selectCardList.push(card.id);
                  }
                });
                _this.selectCardList = selectCardList;
                // if (selectCardList.length) {
                //   _this.$refs.editor.style.transform = `translate3d(${event.page.x + 10}px, ${event.page.y + 10}px, 0)`
                // }
              });
          },
        },
      })
      // 单击页面
      .on("tap", (event) => {
        // 清除选中状态
        if (event.target.id == "view") {
          this.selectCardList.forEach((id) => {
            const cardDom = document.querySelector(`[data-id="${id}"]`);
            this.cardData[id].onChoose = false;
            this.cardData[id].width = cardDom.clientWidth;
            this.cardData[id].height = cardDom.clientHeight;
          });
          // 保存卡片数据
          if (this.selectCardList.length == 1) {
            const card = this.cardData[this.selectCardList[0]];
            const cardData = _.pick(card, [
              "id",
              "x",
              "y",
              "anchor",
              "width",
              "height",
              "class",
              "content",
            ]);
            axios
              .post(this.url + "card/update", cardData, {
                headers: {
                  "Content-Type": "application/json",
                  "x-hasura-world": this.$route.params.world,
                  "x-hasura-key": this.editKey,
                },
              })
              .then((res) => {
                const returnData = res.data.card;
                const id = returnData.id;
                const updated_at = returnData.updated_at;
                this.cardData[id].updated_at = updated_at;
              });
          }
          this.selectCardList = [];
        }
      })
      // 双击页面插入卡片
      .on("doubletap", function (event) {
        if (_this.editCheck) {
          const newCardX = parseInt(
            event.x - document.body.clientWidth / 2 + +pagePostion.value.x
          );
          const newCardY = parseInt(
            event.y - document.body.clientHeight / 2 + +pagePostion.value.y
          );
          const card = {
            x: newCardX,
            y: newCardY,
            width: 110,
            height: 44,
            anchor: "center center",
            class: "blue",
            content: "你好，世界！",
          };
          axios
            .post(_this.url + "card/add", card, {
              headers: {
                "Content-Type": "application/json",
                "x-hasura-world": _this.$route.params.world,
                "x-hasura-key": _this.editKey,
              },
            })
            .then((res) => {
              const cardId = res.data.card.id;
              if (cardId) {
                const newCardData = {
                  ...res.data.card,
                  ...card,
                  world: _this.$route.params.world,
                };
                _this.cardData[cardId] = newCardData;
                _this.showCardList.push(cardId);
              }
            });
        }
      });

    // 卡片拖拽
    interact(".card")
      .draggable({
        allowFrom: ".move",
        listeners: {
          start(event) {
            const dom = event.target;
            const cardId = dom.dataset.id;
            _this.cardData[cardId].onChoose = true;
            _this.cardData[cardId].x = dom.dataset.x;
            _this.cardData[cardId].y = dom.dataset.y;

            moveCardDelta.value.x = event.clientX - event.x0;
            moveCardDelta.value.y = event.clientY - event.y0;

            _this.onMove = true;

            // 更新卡片层级
            if (!_this.cardData[cardId].fixed_at) {
              _this.zIndexTemp++;
              _this.cardData[cardId].zIndex = _this.zIndexTemp;
              _this.selectCardList.forEach((id) => {
                _this.cardData[id].zIndex = _this.zIndexTemp;
              });
            }
          },
          move(event) {
            moveCardDelta.value.x = event.clientX - event.x0;
            moveCardDelta.value.y = event.clientY - event.y0;
          },
          end(event) {
            const dom = event.target;
            const cardId = dom.dataset.id;
            // 单选
            if (!_this.selectCardList.length) {
              _this.cardData[cardId].onChoose = false;
              _this.updateCardPosition(cardId, dom.dataset.x, dom.dataset.y);
            }
            _this.$refs.cardRef.forEach((card) => {
              const cardId = card.dataset.id;
              _this.cardData[cardId].x = parseInt(card.dataset.x);
              _this.cardData[cardId].y = parseInt(card.dataset.y);
            });
            _this.updateSelectedCardPostion();
            _this.onMove = false;
          },
        },
      })
      // 点击卡片弹出编辑框
      .on("tap", (event) => {
        Object.keys(this.cardData).forEach((id) => {
          this.cardData[id].onChoose = false;
        });
        if (event.target.parentNode.dataset.id && this.editCheck) {
          const cardId = event.target.parentNode.dataset.id;
          this.cardData[cardId].onChoose = !this.cardData[cardId].onChoose;
          if (this.cardData[cardId].onChoose) {
            this.selectCardList = [+cardId];
            // this.$refs.editor.style.transform = `translate3d(${event.x + 10}px, ${event.y + 10}px, 0)`
            this.zIndexTemp++;
            if (!_this.cardData[cardId].fixed_at) {
              this.cardData[cardId].zIndex = this.zIndexTemp;
            }
          }
        }
      });

    interact(".btn-home").on("tap", (event) => {
      pageJump();
    });
    interact(".btn-jump").on("tap", (event) => {
      pageJump(this.jumpTarget.x * 100, this.jumpTarget.y * 100);
    });

    let halfClientWidth = document.body.clientWidth / 2;
    let halfClientHeight = document.body.clientHeight / 2;

    // 监听窗口变换
    window.addEventListener("resize", () => {
      halfClientWidth = document.body.clientWidth / 2;
      halfClientHeight = document.body.clientHeight / 2;
    });

    const render = () => {
      // 缓动
      pagePostion.value.x = (
        +pagePostion.value.x +
        (lastPagePostion.value.x - moveDelta.value.x - pagePostion.value.x) *
          0.1
      ).toFixed(3);
      pagePostion.value.y = (
        +pagePostion.value.y +
        (lastPagePostion.value.y - moveDelta.value.y - pagePostion.value.y) *
          0.1
      ).toFixed(3);
      // 卡片
      this.$refs.cardRef &&
        this.$refs.cardRef.forEach((item, index) => {
          const cardId = item.dataset.id;
          let x = -pagePostion.value.x + +item.dataset.x + halfClientWidth - 10;
          let y =
            -pagePostion.value.y + +item.dataset.y + halfClientHeight - 10;
          const [anchorX, anchorY] = this.cardData[cardId].anchor.split(" ");
          if (anchorX == "center") {
            x -= item.clientWidth / 2;
          } else if (anchorX == "right") {
            x -= item.clientWidth;
          }
          if (anchorY == "center") {
            y -= item.clientHeight / 2;
          } else if (anchorY == "bottom") {
            y -= item.clientHeight;
          }
          // if (anchorX == 'left') {
          //   x += item.clientWidth / 2
          // } else if (anchorX == 'right') {
          //   x -= item.clientWidth / 2
          // }
          // if (anchorY == 'top') {
          //   y += item.clientHeight / 2
          // } else if (anchorY == 'bottom') {
          //   y -= item.clientHeight / 2
          // }
          item.style.transform = `translate3D(${x}px, ${y}px, 0)`;
          if (this.cardData[cardId]?.onChoose && this?.onMove) {
            this.$refs.cardRef[index].dataset.x =
              +this.cardData[cardId].x + moveCardDelta.value.x;
            this.$refs.cardRef[index].dataset.y =
              +this.cardData[cardId].y + moveCardDelta.value.y;
          }
        });
      document.body.style.backgroundPositionX = `${-(
        pagePostion.value.x % 1920
      )}px`;
      document.body.style.backgroundPositionY = `${-(
        pagePostion.value.y % 809
      )}px`;
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
      document.querySelector(".coordinate").innerHTML = `
        ${(pagePostion.value.x / 100).toFixed(2)} , ${(
        pagePostion.value.y / 100
      ).toFixed(2)}
      `;
      requestAnimationFrame(render);
    };

    render();

    // 滚动
    document.body.addEventListener("wheel", (e) => {
      if (e.target.nodeName == "INPUT" || e.target.nodeName == "TEXTAREA")
        return;
      if (e.deltaY > 0) {
        if (this.shiftKey) {
          moveDelta.value.x -= 50;
        } else {
          moveDelta.value.y -= 50;
        }
      } else {
        if (this.shiftKey) {
          moveDelta.value.x += 50;
        } else {
          moveDelta.value.y += 50;
        }
      }
      const urlPosX = (
        (+lastPagePostion.value.x - moveDelta.value.x) /
        100
      ).toFixed(2);
      const urlPosY = (
        (+lastPagePostion.value.y - moveDelta.value.y) /
        100
      ).toFixed(2);
      this.$router.replace({ params: { position: `${urlPosX},${urlPosY}` } });
    });

    // 判断是否横向滚动
    document.body.addEventListener("keydown", (e) => {
      if (e.key == "Shift") {
        this.shiftKey = true;
      }
    });
    document.body.addEventListener("keyup", (e) => {
      if (e.key == "Shift") {
        this.shiftKey = false;
      }
    });

    // 滚动时判断卡片是否在视野内
    document.body.addEventListener(
      "wheel",
      _.throttle(
        async () => {
          await this.getCards(
            parseInt(pagePostion.value.x),
            parseInt(pagePostion.value.y)
          );
          checkCards();
        },
        1000,
        { trailing: false }
      )
    );

    // 是否超出边界
    const checkCards = (
      pageX = pagePostion.value.x,
      pageY = pagePostion.value.y
    ) => {
      let showCardList = [];
      const halfScreenWidth = document.body.clientWidth / 2;
      const halfScreenHeight = document.body.clientHeight / 2;
      const padding = 1000;
      Object.keys(this.cardData).forEach((id) => {
        const card = this.cardData[id];
        const cardTop = this.getCardCoord(id, "center top").y;
        const cardBottom = this.getCardCoord(id, "center bottom").y;
        const cardLeft = this.getCardCoord(id, "left center").x;
        const cardRight = this.getCardCoord(id, "right center").x;
        if (
          pageX < cardLeft + padding + halfScreenWidth &&
          pageX > cardRight - padding - halfScreenWidth &&
          pageY < cardBottom + padding + halfScreenHeight &&
          pageY > cardTop - padding - halfScreenHeight &&
          card.world == this.world.name
        ) {
          showCardList.push(card.id);
        }
        // if (
        //   pageX < +card.x + padding + halfScreenWidth + card.width / 2 &&
        //   pageX > +card.x - padding - halfScreenWidth - card.width / 2 &&
        //   pageY < +card.y + padding + halfScreenHeight + card.height / 2 &&
        //   pageY > +card.y - padding - halfScreenHeight - card.height / 2 &&
        //   card.world == this.world.name
        // ) {
        //   showCardList.push(card.id);
        // }
      });
      this.showCardList = showCardList;
    };

    // 页面跳转
    const pageJump = async (x = 0, y = 0) => {
      lastPagePostion.value.x = pagePostion.value.x;
      lastPagePostion.value.y = pagePostion.value.y;
      moveDelta.value.x = +lastPagePostion.value.x - x;
      moveDelta.value.y = +lastPagePostion.value.y - y;
      const urlPosX = (
        (+lastPagePostion.value.x - moveDelta.value.x) /
        100
      ).toFixed(2);
      const urlPosY = (
        (+lastPagePostion.value.y - moveDelta.value.y) /
        100
      ).toFixed(2);
      this.$router.replace({ params: { position: `${urlPosX},${urlPosY}` } });
      await this.getCards(x, y);
      checkCards(x, y);
    };
    this.pageJump = pageJump;

    // 初始化
    setTimeout(async () => {
      this.world.name = this.$route.params.world;
      // URL跳转
      if (this.$route.params.position) {
        const position = this.$route.params.position.split(",");
        pagePostion.value.x = position[0] * 100;
        pagePostion.value.y = position[1] * 100;
        moveDelta.value.x = -position[0] * 100;
        moveDelta.value.y = -position[1] * 100;
        // lastPagePostion.value.x = pagePostion.value.x
        // lastPagePostion.value.y = pagePostion.value.y
        // moveDelta.value.x = +lastPagePostion.value.x - position[0] * 100
        // moveDelta.value.y = +lastPagePostion.value.y - position[1] * 100
      }
      // 获取卡片信息
      await this.getCards(pagePostion.value.x, pagePostion.value.y);
      checkCards();
    }, 0);
  },
};
</script>

<template>
  <!-- 卡片 -->
  <div id="view" class="w-screen h-screen">
    <TransitionGroup name="card" tag="div">
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
      <CardDragBar v-if="editCheck" />
      <CardContent :cardData="cardData[id]" />
    </div>
    </TransitionGroup>
  </div>
  <!-- 选框 -->
  <Selection />
  <!-- 编辑器 -->
  <div
    ref="editor"
    class="fixed top-0 right-0 w-60 h-screen bg-light-50 border-l-2 border-black/20 p-2 transition transform text-sm space-y-2 z-9999"
    :class="[
      selectCardList[0]
        ? 'opacity-100 pointer-events-auto'
        : 'opacity-0 pointer-events-none translate-x-6',
      !editCheck && '!opacity-0 !pointer-events-none',
    ]"
  >
    <!-- 编辑器-单选 -->
    <template v-if="selectCardList.length == 1">
      <p class="text-cyan-600">坐标</p>
      <div v-if="selectCardList[0]" class="flex justify-between">
        <input
          v-model="cardData[selectCardList[0]].x"
          class="bg-gray-100 p-1 w-26 rounded"
          type="number"
        />
        <input
          v-model="cardData[selectCardList[0]].y"
          class="bg-gray-100 p-1 w-26 rounded"
          type="number"
        />
      </div>
      <p class="text-cyan-600">锚点</p>
      <input
        v-model="cardData[selectCardList[0]].anchor"
        class="bg-gray-100 p-1 rounded w-full"
        type="text"
      />
      <p class="text-cyan-600">内容</p>
      <textarea
        v-if="selectCardList[0]"
        v-model="cardData[selectCardList[0]].content"
        class="w-full h-30 bg-gray-100 p-1 resize-none block rounded"
      ></textarea>
      <p class="text-cyan-600">自定义样式</p>
      <textarea
        v-if="selectCardList[0]"
        v-model="cardData[selectCardList[0]].class"
        class="w-full h-20 bg-gray-100 p-1 resize-none block rounded"
      ></textarea>
      <p class="text-cyan-600">操作</p>
      <div class="flex space-x-1">
        <EditorBtn @click="removeCard()" :icon="'icon-shanchu'" />
        <EditorBtn
          @click="changeFixed()"
          :icon="
            cardData[selectCardList[0]].fixed_at
              ? 'icon-suoding'
              : 'icon-jiesuo'
          "
        />
      </div>
    </template>
    <!-- 编辑器-多选 -->
    <template v-if="selectCardList.length > 1">
      <p class="text-cyan-600">排列</p>
      <div class="flex space-x-1">
        <EditorBtn @click="verticalAlign()" :icon="'icon-shuipingpailie'" />
        <EditorBtn @click="horizontalAlign()" :icon="'icon-chuizhipailie'" />
        <EditorBtn @click="verticalDistribute()" :icon="'icon-shuxiangfenbu'" />
        <EditorBtn
          @click="horizontalDistribute()"
          :icon="'icon-hengxiangfenbu'"
        />
      </div>
      <p class="text-cyan-600">对齐</p>
      <div class="flex space-x-1">
        <EditorBtn @click="alignLeft()" :icon="'icon-zuoduiqi'" />
        <EditorBtn
          @click="centerHorizontally()"
          :icon="'icon-hengxiangjuzhongduiqi'"
        />
        <EditorBtn @click="alignRight()" :icon="'icon-youduiqi'" />
        <EditorBtn @click="alignBottom()" :icon="'icon-dibuduiqi'" />
        <EditorBtn
          @click="centerVerticaly()"
          :icon="'icon-shuxiangjuzhongduiqi'"
        />
        <EditorBtn @click="alignTop()" :icon="'icon-dingbuduiqi'" />
      </div>
      <p class="text-cyan-600">操作</p>
      <EditorBtn @click="removeCard()" :icon="'icon-shanchu'" />
    </template>
  </div>
  <!-- 控制台 -->
  <div class="fixed bottom-4 right-4 flex space-x-1 z-9999">
    <Coordinate />
    <FooterItem
      class="btn-home opacity-50 transition hover:(opacity-100)"
      icon="icon-yuandian"
    />
    <FooterItem
      @click="onJump = !onJump"
      :class="onJump ? '!opacity-100' : ''"
      class="opacity-50 transition hover:(opacity-100)"
      icon="icon-huojian"
    />
  </div>
  <JumpTargetBox :on-jump="onJump" v-model="jumpTarget" />
  <!-- 编辑模式 -->
  <div class="fixed bottom-4 left-4 flex space-x-1 z-9999">
    <FooterItem
      @click="this.openEdit = !this.openEdit"
      :class="this.openEdit ? '!opacity-100' : ''"
      class="opacity-0 transition hover:(opacity-100)"
      icon="icon-bianji"
    />
  </div>
  <EditorModeBox
    :open-edit="openEdit"
    :edit-check="editCheck"
    @check-edit="checkEdit"
    @close-edit="
      editCheck = false;
      editKey = '';
    "
  />
  <!-- 版权 -->
  <div class="fixed bottom-4 left-4 text-xs text-zinc-600 z-9999 <md:hidden">
    <p>
      © 2017-2022 陆陆侠.
      <a href="https://beian.miit.gov.cn" target="_blank"
        >苏ICP备2022014594号</a
      >
    </p>
  </div>
</template>

<style>
@import url(//at.alicdn.com/t/font_3228461_j3ffvg5h4gs.css);
@import "lxgw-wenkai-screen-webfont/style.css";

* {
  margin: 0;
  padding: 0;
}

body {
  font-family: "LXGW WenKai Screen", sans-serif !important;
  background: #fffaf3;
  background-image: url("/bg.png");
  background-size: 1920px 809px;
}
.card-enter-active,
.card-leave-active {
  transition: opacity 0.1s;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
}
</style>
