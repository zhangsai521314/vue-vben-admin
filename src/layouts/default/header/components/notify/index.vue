<template>
  <div :class="prefixCls" id="zs_notify">
    <Popover title="" trigger="click" :overlayClassName="`${prefixCls}__overlay`">
      <Badge
        :count="mqttStore.getUnreadalarmData.length"
        :overflowCount="99"
        :numberStyle="{ top: '14px' }"
      >
        <IconFontClass
          :class="{ blinking: mqttStore.getUnreadalarmData.length > 0 }"
          v-if="mqttStore.msgIsMute"
          name="icon-baseui-xiaoxijinyin"
          style="font-size: 38px"
        />
        <IconFontClass
          v-else
          :class="{ blinking: mqttStore.getUnreadalarmData.length > 0 }"
          name="icon-baseui-xiaoxi"
          style="font-size: 38px"
        />
        <!-- <BellOutlined /> -->
      </Badge>
      <template #content>
        <Tabs style="width: 360px">
          <template v-for="item in tabsName" :key="item.key">
            <Tabs.TabPane style="width: 360px">
              <template #tab>
                {{ t('view.alarm') }}
                <span v-if="item == '告警'">({{ mqttStore.getAlarmData.length }})</span>
              </template>
              <!-- 绑定title-click事件的通知列表中标题是“可点击”的-->
              <a-space style="margin-bottom: 2px">
                <a-button @click="controlSound"
                  >{{ mqttStore.msgIsMute ? t('view.open') : t('view.close')
                  }}{{ t('view.soundPrompt') }}</a-button
                >
                <a-button @click="allRead">{{ t('view.allRead') }}</a-button>
              </a-space>
              <div style="height: 690px; overflow: hidden">
                <NoticeList :list="mqttStore.getAlarmData" @title-click="onNoticeClick" />
              </div>
            </Tabs.TabPane>
          </template>
        </Tabs>
      </template>
    </Popover>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { Popover, Tabs, Badge, notification } from 'ant-design-vue';
  import NoticeList from './NoticeList.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import type { MsgData } from '#/store';
  import { useGo } from '/@/hooks/web/usePage';
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();
  const mqttStore = useMqttStoreWithOut();
  mqttStore.msgAudioIsShow = true;
  const { prefixCls } = useDesign('header-notify');
  const tabsName = ['告警'];
  const go = useGo();
  function onNoticeClick(record: MsgData) {
    mqttStore.readMsg(record);
    go(`/message/index/${record.msgId}/${record.msgStartTime}`);
  }

  //控制声音
  function controlSound() {
    mqttStore.setMsgIsMute(!mqttStore.msgIsMute);
  }

  function openNotification() {
    notification.open({
      message: '',
      description: t('view.clickAnyAreaToInteractToEnableMessageSoundPrompt'),
      placement: 'top',
      style: {
        width: '320px',
        top: '20px',
        border: '1px solid red',
      },
      duration: 10,
      class: 'notification-custom-class',
    });
  }

  function allRead() {
    mqttStore.allRead();
  }

  onMounted(() => {
    if (!mqttStore.msgAudioIsAlert) {
      mqttStore.msgAudioIsAlert = false;
      openNotification();
    }
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-header-notify';

  @keyframes blink {
    0% {
      opacity: 1; /* 完全不透明 */
    }

    50% {
      opacity: 0; /* 完全透明 */
    }

    100% {
      opacity: 1; /* 再次不透明 */
    }
  }

  .@{prefix-cls} {
    padding-bottom: 1px;

    &__overlay {
      max-width: 380px;
    }

    .ant-tabs-content {
      width: 330px;
    }

    .ant-badge {
      display: flex;
      align-items: center;
      font-size: 40px;

      .ant-badge-multiple-words {
        padding: 0 4px;
      }

      svg {
        width: 0.9em;
      }
    }
  }

  .ant-tabs-nav {
    margin-bottom: 14px !important;
  }

  /* 应用动画到想要闪烁的元素 */
  .blinking {
    animation: blink 1s infinite; /* 每1秒闪烁一次，无限次数 */
    color: #ff0404;
  }
</style>
