<!-- 左侧组件 -->
<template>
  <div :class="`${prefixCls}bottom-left`">
    <div :class="`${prefixCls}assembly`">
      <div v-for="(item, index) in assemblyAll" :key="index" :class="`${prefixCls}assembly-item`">
        <div :class="{ assemblySelected: item.isSelected }">
          <IconFontClass :style="item.style" :name="item.icon" />
        </div>
        <div>
          {{ item.name }}
        </div>
      </div>
    </div>
    <div :class="`${prefixCls}assembly-content`">
      <div
        :class="`${prefixCls}content-search`"
        v-show="assemblyAll.find((m) => m.isSelected).key == 'Sys'"
      >
        <a-input-search size="small" placeholder="搜索" enter-button @search="assemblySearch" />
      </div>
      <div :class="`${prefixCls}content-item`">
        <div
          :class="`${prefixCls}item-sys`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'Sys'
          "
        >
          <a-spin tip="加载中..." :spinning="isLoadSys">
            <div :class="`${prefixCls}sys-item`">
              <div v-for="(t, index) in userAssemblySys" :key="index">
                <div>
                  <IconFontClass
                    class="assembly-draggable sys-item"
                    :mid="t.elementId"
                    :pid="t.parentid"
                    :name="t.elementSrc"
                    :iconUnicode="t.iconUnicode"
                    @click="showPower(row, true)"
                  />
                </div>
                <div>
                  <!-- {{ item.name }} -->
                </div>
              </div>
            </div>
          </a-spin>
        </div>
      </div>
    </div>
    <div style="display: none" id="loadImgDiv">
      <img style="width: 95px; height: 95px" :src="loadImgDivImg" />
    </div>
  </div>
</template>
<script setup>
  import { message, Modal } from 'ant-design-vue';
  import { ref, onMounted, nextTick, watch, createVNode, reactive } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import gplotApi from '@/api/gplot';
  import { useGplotStoreWithOut } from '@/store/modules/gplot';

  const props = defineProps({
    //拓扑对象
    graphObRef: {
      type: Object,
      default() {
        return null;
      },
    },
  });

  const { prefixCls } = useDesign('GplotManage-');
  const gplotStore = useGplotStoreWithOut();

  //全部的assembly
  const assemblyAll = ref([
    {
      name: '素材',
      key: 'Sys',
      icon: 'icon-baseui-sucai',
      style: '',
      isSelected: true,
    },
  ]);
  const loadImgDivImg = ref('');
  const isLoadSys = ref(false);
  const userAssemblySys = ref([]);

  //获取用户系统分组
  getGplotelements();
  // getZuJian();
  // getGraphicSourceGroupTree();

  //组件搜索

  function assemblySearch(value) {
    if (value == '') {
      switch (assemblyAll.value.find((m) => m.isSelected).key) {
        case 'Sys':
          break;
      }
    } else {
      switch (assemblyAll.value.find((m) => m.isSelected).key) {
        case 'Sys':
          break;
      }
    }
  }

  //获取用户系统素材分级
  function getGplotelements() {
    isLoadSys.value = true;
    gplotApi
      .GetGplotelements()
      .then((data) => {
        isLoadSys.value = false;
        userAssemblySys.value = data;
        nextTick(() => {
          assemblyDrag($(`.sys-item`));
        });
      })
      .catch(() => {
        isLoadSys.value = false;
      });
  }

  //组件拖拽
  function assemblyDrag($dragadom) {
    $dragadom.draggable({
      helper: 'clone', //克隆拖动
      cursor: 'move',
      zIndex: 9999999,
      appendTo: $('body'),
      //强制draggable只允许在指定元素或区域的范围内移动
      containment: '.draggable-content',
      drag: function (e, ui) {
        // $(ui.helper).find('i').css('font-size', 49);
        $(ui.helper).css('font-size', 49);
      },
    });

    $(`.gplotDom`).droppable({
      accept: $('.assembly-draggable'), //容器允许拖入的dom
      drop: function (event, ui) {
        props.graphObRef.addGplot({
          domX: $(ui.helper[0]).offset().left,
          domY: $(ui.helper[0]).offset().top,
          iconUnicode: $(ui.helper).attr('iconUnicode'),
        });
      },
      tolerance: 'fit', //完全重叠才算
    });
  }

  onMounted(() => {});
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotManage-';

  .assemblySelected {
    color: #0960bd;
  }

  .@{prefixCls}assembly {
    display: flex;
    flex-direction: column;
    width: 45px;
    border-right: 1px solid #dfe3e8;

    .@{prefixCls}assembly-item {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 45px;
      text-align: center;
      cursor: pointer;

      > div:first-child {
        height: 25px;

        > i {
          font-size: 20px;
        }
      }

      > div:last-child {
        width: 100%;
        height: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .@{prefixCls}assembly-sys {
        > div {
          display: flex;
          flex-flow: row wrap;

          img {
            width: 59px;
            height: 58px;
          }
        }
      }
    }
  }

  .@{prefixCls}assembly-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow-x: hidden;

    .@{prefixCls}content-search {
      height: 30px;
      padding: 5px;
    }

    .@{prefixCls}content-item {
      //占满剩余空间
      flex: 1;
      //占满剩余空间
      flex-basis: 0;
      width: calc(100% + 3px);
      overflow: hidden;

      > div {
        height: 100%;
        overflow: auto;
      }

      .@{prefixCls}item-sys {
        padding: 0 8px 0 4px;
        overflow: auto;

        .@{prefixCls}sys-item {
          display: flex;
          flex-flow: row wrap;
          justify-content: space-between;
          padding-top: 3px;
          padding-left: 2px;

          > div {
            width: 105px;
            height: 76px;
            margin-bottom: 15px;
            background-color: #f3f3f3;
            line-height: 76px;
            text-align: center;
            cursor: move;

            > div:first-child {
              i {
                color: black;
                font-size: 49px;
              }
            }

            > div:last-child {
              width: 100%;
              height: 25px;
              overflow: hidden;
              font-weight: initial;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }

    .assembly-draggable {
      cursor: move;
    }
  }

  .@{prefixCls}CustomSys-content {
    display: flex;
    width: 100%;
    height: 600px;
    padding: 10px;

    .@{prefixCls}CustomSys-left {
      width: 450px;
    }

    .@{prefixCls}CustomSys-right {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-left: none;

      > div:first-child {
        height: 31px;
        padding-left: 25px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 18px;
        font-weight: 700;
        line-height: 31px;
      }

      > div:last-child {
        display: flex;
        flex-flow: row wrap;
        place-content: flex-start left;
        height: calc(100% - 32px);
        overflow-y: auto;

        > img {
          width: 50px;
          height: 50px;
          margin: 5px;
        }
      }
    }
  }
</style>
