<template>
  <Layout.Header :class="getHeaderClass">
    <!-- left start -->
    <div :class="`${prefixCls}-left`">
      <!-- logo -->
      <AppLogo
        v-if="getShowHeaderLogo"
        :class="`${prefixCls}-logo`"
        :theme="getHeaderTheme"
        :style="getLogoWidth"
      />
      <LayoutTrigger
        v-if="
          (getShowContent && getShowHeaderTrigger && !getSplit && !getIsMixSidebar) || getIsMobile
        "
        :theme="getHeaderTheme"
        :sider="false"
      />
      <LayoutBreadcrumb v-if="getShowContent && getShowBread" :theme="getHeaderTheme" />
    </div>
    <!-- left end -->

    <div v-if="mqttStore.mqttStatus != '无需连接'" :class="`${prefixCls}-center`">
      <a-space style="padding-top: 6px">
        <div
          :style="{
            width: '26px',
            height: '26px',
            backgroundColor:
              mqttStore.mqttStatus == '未连接'
                ? 'yellow'
                : mqttStore.mqttStatus == '已连接'
                  ? '#05e705'
                  : mqttStore.mqttStatus == '连接中'
                    ? 'blue'
                    : mqttStore.mqttStatus == '连接失败'
                      ? 'red'
                      : mqttStore.mqttStatus == '连接断开'
                        ? 'red'
                        : 'yellow',
            borderRadius: '20px',
          }"
        ></div>
        <span style="color: black"
          >{{ t('view.communication') }}
          <span v-if="mqttStore.mqttStatus == '未连接'">{{ t('view.notConnected') }} </span>
          <span v-if="mqttStore.mqttStatus == '已连接'">{{ t('view.connected') }} </span>
          <span v-if="mqttStore.mqttStatus == '连接中'">{{ t('view.connecting') }} </span>
          <span v-if="mqttStore.mqttStatus == '连接失败'">{{ t('view.connectionFailed') }} </span>
          <span v-if="mqttStore.mqttStatus == '连接断开'">
            {{ t('view.connectionDisconnected') }}
          </span>
        </span>
      </a-space>
    </div>

    <!-- menu start -->
    <div v-if="getShowTopMenu && !getIsMobile" :class="`${prefixCls}-menu`">
      <LayoutMenu
        :isHorizontal="true"
        :theme="getHeaderTheme"
        :splitType="getSplitType"
        :menuMode="getMenuMode"
      />
    </div>
    <!-- menu-end -->

    <!-- action  -->
    <div :class="`${prefixCls}-action`">
      <!-- 消息通知 -->
      <Notify v-if="getShowNotice" :class="`${prefixCls}-action__item notify-item`" />

      <AppSearch v-if="getShowSearch" :class="`${prefixCls}-action__item `" />

      <ErrorAction v-if="getUseErrorHandle" :class="`${prefixCls}-action__item error-action`" />

      <FullScreen v-if="getShowFullScreen" :class="`${prefixCls}-action__item fullscreen-item`" />

      <AppLocalePicker
        v-if="getShowLocalePicker"
        :reload="true"
        :showText="false"
        :class="`${prefixCls}-action__item`"
      />

      <!-- 用户头像操作 -->
      <UserDropDown :theme="getHeaderTheme" />

      <!-- 设置 -->
      <SettingDrawer v-if="getShowSetting" :class="`${prefixCls}-action__item`" />
    </div>
  </Layout.Header>
</template>
<script lang="ts" setup>
  import { Layout } from 'ant-design-vue';
  import { computed, unref } from 'vue';

  import { AppLocalePicker, AppLogo, AppSearch } from '@/components/Application';
  import { SettingButtonPositionEnum } from '@/enums/appEnum';
  import { MenuModeEnum, MenuSplitTyeEnum } from '@/enums/menuEnum';
  import { useHeaderSetting } from '@/hooks/setting/useHeaderSetting';
  import { useMenuSetting } from '@/hooks/setting/useMenuSetting';
  import { useRootSetting } from '@/hooks/setting/useRootSetting';
  import { useAppInject } from '@/hooks/web/useAppInject';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useLocale } from '@/locales/useLocale';
  import { createAsyncComponent } from '@/utils/factory/createAsyncComponent';
  import { propTypes } from '@/utils/propTypes';

  import LayoutMenu from '../menu/index.vue';
  import LayoutTrigger from '../trigger/index.vue';
  import { ErrorAction, FullScreen, LayoutBreadcrumb, Notify, UserDropDown } from './components';

  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();
  const SettingDrawer = createAsyncComponent(() => import('@/layouts/default/setting/index.vue'), {
    loading: true,
  });
  defineOptions({ name: 'LayoutHeader' });

  const props = defineProps({
    fixed: propTypes.bool,
  });
  const { prefixCls } = useDesign('layout-header');
  const {
    getShowTopMenu,
    getShowHeaderTrigger,
    getSplit,
    getIsMixMode,
    getMenuWidth,
    getIsMixSidebar,
  } = useMenuSetting();
  const { getUseErrorHandle, getShowSettingButton, getSettingButtonPosition } = useRootSetting();

  const {
    getHeaderTheme,
    getShowFullScreen,
    getShowNotice,
    getShowContent,
    getShowBread,
    getShowHeaderLogo,
    getShowHeader,
    getShowSearch,
  } = useHeaderSetting();

  const mqttStore = useMqttStoreWithOut();

  const { getShowLocalePicker } = useLocale();

  const { getIsMobile } = useAppInject();

  const getHeaderClass = computed(() => {
    const theme = unref(getHeaderTheme);
    return [
      prefixCls,
      {
        [`${prefixCls}--fixed`]: props.fixed,
        [`${prefixCls}--mobile`]: unref(getIsMobile),
        [`${prefixCls}--${theme}`]: theme,
      },
    ];
  });

  const getShowSetting = computed(() => {
    if (!unref(getShowSettingButton)) {
      return false;
    }
    const settingButtonPosition = unref(getSettingButtonPosition);

    if (settingButtonPosition === SettingButtonPositionEnum.AUTO) {
      return unref(getShowHeader);
    }
    return settingButtonPosition === SettingButtonPositionEnum.HEADER;
  });

  const getLogoWidth = computed(() => {
    if (!unref(getIsMixMode) || unref(getIsMobile)) {
      return {};
    }
    const width = unref(getMenuWidth) < 180 ? 180 : unref(getMenuWidth);
    return { width: `${width}px` };
  });

  const getSplitType = computed(() => {
    return unref(getSplit) ? MenuSplitTyeEnum.TOP : MenuSplitTyeEnum.NONE;
  });

  const getMenuMode = computed(() => {
    return unref(getSplit) ? MenuModeEnum.HORIZONTAL : null;
  });
</script>
<style lang="less">
  @import url('./index.less');
</style>
