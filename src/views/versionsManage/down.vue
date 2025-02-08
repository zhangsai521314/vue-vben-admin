<template>
  <div class="content">
    <div v-for="(item, i) in downData" :key="i">
      <IconFontClass
        :name="item.runPlatform == 1 ? 'icon-baseui-Windows101' : 'icon-baseui-anzhuo1'"
      />
      <img :src="item.icon" @click="downFile(item)" />
      <span class="title">{{ item.name }}</span>
      <span class="version" @click="remarksChange(item)">{{ item.versionNumber }}</span>
      <div
        class="remarks"
        @click="remarksChange(item)"
        :class="{
          remarksShow: item.isShowRemarks,
          remarksHide: !item.isShowRemarks,
        }"
      >
        <!-- <a-textarea disabled :rows="3" v-model:value="item.remark" /> -->
        {{ item.remark }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import commonApi from '@/api/common';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  const downData = ref([]);
  commonApi
    .GetDownVersion()
    .then((data) => {
      downData.value = data;
    })
    .catch(() => {});

  function remarksChange(item) {
    item.isShowRemarks = !item.isShowRemarks;
  }

  function downFile(item) {
    commonApi
      .GetServiceFile({
        ServiceType: item.serviceType,
        VNumber: item.versionNumber,
        execompleteBefore: () => {},
      })
      .then((data) => {
        myCommon.downLoadFile(data);
      });
  }
</script>
<style lang="less">
  body {
    width: 100%;
    height: 100vh; /* 设置容器高度以填满视口 */
    background-image: url('/resource/img/downVersion/downback.png');
    background-repeat: round;
    background-size: cover;
  }

  #app {
    display: flex; /* 启用 flexbox 布局 */
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
  }
</style>
<style lang="less" scoped>
  .content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-width: 210px;
    height: 100%;
    overflow-y: auto;
    font-family: cursive;

    > div {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      width: 200px;
      height: 200px;
      margin: 5px;
      border-radius: 16px;
      background-color: #8a57ea;

      img {
        position: absolute;
        top: 20px;
        left: 50px;
        width: 100px;
        height: 100px;
        cursor: pointer;
      }

      i {
        position: absolute;
        top: 8px;
        left: 10px;
        color: #fff;
        font-size: 14px;
      }

      .title {
        position: absolute;
        top: 134px;
        width: auto;
        color: #fff;
        font-size: 26px;
        font-variant: tabular-nums;
      }

      .version {
        position: absolute;
        top: 164px;
        width: auto;
        color: #fff;
        font-size: 24px;
        font-variant: tabular-nums;
        cursor: pointer;
      }

      .remarks {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        padding-left: 8px;
        overflow-y: auto;
        border-radius: 16px;
        background-color: #d8d8d8;
        line-height: 20px;
        text-align: left;
        text-wrap: wrap;
      }

      .remarksHide {
        z-index: 0;
        width: 0;
        transition:
          width 2s,
          opacity 2s,
          z-index 2s;
        opacity: 0;
      }

      .remarksShow {
        z-index: 4;
        width: 100%;
        transition:
          width 2s,
          opacity 2s,
          z-index 2s;
        opacity: 0.8;
      }
    }

    /* 整体滚动条 */
    ::-webkit-scrollbar {
      width: 10px;
      border-radius: 15px;
      background-color: rgb(255 0 0 / 0%);
    }

    /* 滚动条滑块 */
    ::-webkit-scrollbar-thumb {
      border: 2px solid #f1f1f1;
      border-radius: 10px;
      background-color: #888;
    }

    /* 滚动条滑块 - 悬停 */
    ::-webkit-scrollbar-thumb:hover {
      background-color: #555;
    }
  }
</style>
