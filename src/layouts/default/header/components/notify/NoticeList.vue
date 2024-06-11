<template>
  <div
    class="account-list-outer"
    ref="outContainer"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
  >
    <div class="account-list-inner">
      <div class="account-box" v-for="(row, index) in viewData" :key="index">
        <!-- <div style="width: 94px"> -->
        <div style="width: 50px">
          <!-- <div style="display: flex; align-items: center; justify-content: space-between"> -->
          <div>
            <IconFontClass
              :title="
                row.msgStatus == 1
                  ? '告警'
                  : row.msgStatus == 2
                    ? '正常'
                    : row.msgStatus == 3
                      ? '未知 '
                      : ''
              "
              v-if="row.msgIcon"
              :name="row.msgIcon"
              style="font-size: 38px"
              :style="{
                color:
                  row.msgStatus == 1
                    ? 'red'
                    : row.msgStatus == 2
                      ? 'green'
                      : row.msgStatus == 3
                        ? '#0960bd '
                        : '',
              }"
            />
            <a-tag
              style="display: block; width: 38px; margin-left: 2px"
              :color="row.isRead ? '' : 'red'"
              >{{ row.isRead ? '已读' : '未读' }}</a-tag
            >
          </div>
          <!-- <a-select
            size="small"
            placeholder="提示设置"
            @change="(value) => changeStrongPrompting(value, row)"
            style="width: 100%; margin-left: 1px"
            v-if="
              mqttStore.msgStrongPromptingTime[
                `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
              ] != null &&
              mqttStore.msgStrongPromptingTime[
                `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
              ].time.isAfter(dayjs())
            "
            :value="
              mqttStore.msgStrongPromptingTime[
                `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
              ].timeFrequency
            "
          >
            <a-select-option value="">立即提示</a-select-option>
            <a-select-option :value="10">10分钟后提示</a-select-option>
            <a-select-option :value="30">30分钟后提示</a-select-option>
            <a-select-option :value="60">1小时后提示</a-select-option>
          </a-select>
          <a-select
            v-else
            size="small"
            placeholder="提示设置"
            style="width: 100%; margin-left: 1px"
            @change="(value) => changeStrongPrompting(value, row)"
          >
            <a-select-option value="">立即提示</a-select-option>
            <a-select-option :value="10">10分钟后提示</a-select-option>
            <a-select-option :value="30">30分钟后提示</a-select-option>
            <a-select-option :value="60">1小时后提示</a-select-option>
          </a-select> -->
        </div>
        <!-- @click="handleTitleClick(row)" title="点击查看详情" -->
        <div style="padding-left: 8px">
          <div
            style="
              display: -webkit-box;
              overflow: hidden;
              font-weight: normal;
              text-overflow: ellipsis;
              white-space: normal;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1; /* 限制为1行 */
              cursor: pointer;
            "
            v-if="row.serviceName"
          >
            {{ row.serviceName }}</div
          >
          <div
            style="
              display: -webkit-box;
              overflow: hidden;
              font-size: 15px;
              font-weight: normal;
              font-weight: 700;
              text-overflow: ellipsis;
              white-space: normal;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1; /* 限制为1行 */
              cursor: pointer;
            "
          >
            {{ row.msgTitle }}</div
          >
          <div
            style="
              display: -webkit-box;
              overflow: hidden;
              font-weight: normal;
              text-overflow: ellipsis;
              white-space: normal;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 3; /* 限制为3行 */
              cursor: pointer;
            "
            v-if="row.msgContent"
          >
            {{ row.msgContent }}
          </div>
          <div v-if="row.msgStartTime" style="color: rgb(0 0 0 / 45%)">
            {{ dayjs(row.msgStartTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, onMounted, computed, PropType, watch, nextTick } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { List, Avatar, Tag, Typography } from 'ant-design-vue';
  import { isNumber } from '@/utils/is';
  import type { MsgData } from '#/store';
  import dayjs from 'dayjs';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';

  const mqttStore = useMqttStoreWithOut();

  const props = defineProps({
    //原始数据
    list: {
      type: Array as PropType<MsgData[]>,
      default: () => [],
    },
    onTitleClick: {
      type: Function as PropType<(Recordable) => void>,
    },
  });

  // 最终展示数据
  const viewData: MsgData[] = reactive([]);
  // 外部容器dom元素
  const outContainer = ref();
  // 内部容器padding-top
  const paddingTop = ref('0px');
  // 内部容器padding-bottom
  const paddingBottom = ref('0px');
  //单行高度 可少不可多
  const itemHeight = 170;
  let startIndex = 0;
  let endIndex = 0;
  let isJinRu = false;

  //创建虚拟列表
  const createVirtualList = () => {
    //外部容器高度
    const outContainerHeight = outContainer.value.clientHeight;
    //滚动轴滚动长度
    const scrollTop = outContainer.value.scrollTop;
    startIndex = Math.floor(scrollTop / itemHeight);
    endIndex = startIndex + Math.floor(outContainerHeight / itemHeight);
    paddingTop.value = (startIndex * itemHeight).toString() + 'px';
    // accountData.length---总数据的长度
    paddingBottom.value = ((props.list.length - endIndex) * itemHeight).toString() + 'px';
    resetData();
  };

  function resetData() {
    // 清空viewData数据
    viewData.splice(0, viewData.length);
    // 添加可视片段上的数据
    viewData.push(...props.list.slice(startIndex, endIndex + 1));
  }

  function mouseover() {
    isJinRu = true;
  }

  function mouseleave() {
    isJinRu = false;
    // 清空viewData数据
    viewData.splice(0, viewData.length);
    // 添加可视片段上的数据
    viewData.push(...props.list.slice(startIndex, endIndex + 1));
  }

  //强提示频率改变
  function changeStrongPrompting(timeFrequency, row) {
    if (timeFrequency == '') {
      mqttStore.clearMsgStrongPromptingTime(row);
    } else {
      mqttStore.addMsgStrongPromptingTime(row, timeFrequency);
    }
  }

  function handleTitleClick(item: ListItem) {
    props.onTitleClick && props.onTitleClick(item);
  }

  // 需要获取dom元素 所以要在onMounted钩子中进行
  onMounted(() => {
    setTimeout(() => {
      // 初始化创建虚拟列表
      createVirtualList();
    }, 200);
    // 添加事件监听
    outContainer.value.addEventListener('scroll', createVirtualList);
  });

  watch(
    () => props.list,
    () => {
      if (
        !isJinRu ||
        //数据未填充满
        outContainer.value.scrollHeight <= outContainer.value.clientHeight
      ) {
        resetData();
      }
    },
  );
</script>
<style scoped lang="less">
  p {
    margin: 0;
    padding: 0;
  }

  #main-bg {
    width: 60%;
    margin: 0 auto;
    padding: 20px 10px 0;
  }

  .title {
    width: 100%;
    padding-bottom: 10px;
    border-bottom: 1px #eee solid;
    font-family: cursive;
    font-size: 24px;
    font-weight: 800;
    text-align: left;
  }

  .account-list-outer {
    height: 100%;
    overflow-y: scroll;

    .account-list-inner {
      margin-right: 14px;
      padding-top: v-bind('paddingTop');
      padding-bottom: v-bind('paddingBottom');

      .account-box {
        display: flex;
        margin: 10px 0;
        padding: 3px 0;
        border: 1px #eee solid;
        border-radius: 8px;
      }
    }
  }
</style>
