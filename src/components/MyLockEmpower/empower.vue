<template>
  <div v-if="!userData.empower" :class="`${prefixCls}empower`" id="windowsEmpower">
    <p v-for="(val, key) in empower" :key="key">{{ val }}</p>
  </div>
</template>
<script setup>
  import { useUserStore } from '@/store/modules/user';
  import { ref, onMounted, watch, createVNode, onBeforeMount } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { message, Modal } from 'ant-design-vue';
  //加密缓存器使用
  import { createLocalStorage } from '@/utils/cache';
  //定时器
  import { useTimeFn } from '@/hooks/core/useTime_';
  const props = defineProps({
    pDomId: {
      type: String,
      default() {
        return 'windowsContent';
      },
    },
  });
  const ls = createLocalStorage();
  const timeKey = `windows_empower_${myCommon.uniqueId()}`;
  const { prefixCls } = useDesign('windows-empower-');
  const userStore = useUserStore();
  const userData = ref(_.cloneDeep(userStore.getUserInfo));
  const empower = {
    m_1: '无法识别授权文件或注册文件失效',
    m_2: '请及时联系管理员授权',
    m_3: `机器码：${userData.value.machinecode ? userData.value.machinecode : ''}`,
    m_4: '',
  };

  let shouQuanTimeId = 0;
  watch(
    () => userData.value.empower,
    () => {
      //授权
      if (!userData.value.empower) {
        shouQuanTimeId = useTimeFn(
          setInterval(() => {
            let isWidth = false;
            if ($('#windowsEmpower').find('p').length != 4) {
              isWidth = true;
            } else {
              $('#windowsEmpower')
                .find('p')
                .each((i, item) => {
                  if (
                    $(item).height() != 30 ||
                    $(item).css('display') != 'block' ||
                    $(item).css('font-size') != '19px' ||
                    $(item).css('line-height') != '30px' ||
                    $(item).css('color') != 'rgb(255, 0, 0)' ||
                    $(item).width() != $('#windowsEmpower').width() ||
                    (i == 0 && $(item).html() != '无法识别授权文件或注册文件失效') ||
                    (i == 1 && $(item).html() != '请及时联系管理员授权') ||
                    (i == 3 && $(item).html() != '')
                  ) {
                    isWidth = true;
                  }
                });
            }
            if (
              $('#windowsEmpower').length == 0 ||
              $('#windowsEmpower').parent().attr('id') != props.pDomId ||
              $('#windowsEmpower').height() < 90 ||
              $('#windowsEmpower').width() < 270 ||
              $('#windowsEmpower').css('position') != 'absolute' ||
              $('#windowsEmpower').css('bottom') != '40px' ||
              $('#windowsEmpower').css('right') != '25px' ||
              $('#windowsEmpower').css('z-index') != '2147483643' ||
              $('#windowsEmpower').css('display') != 'block' ||
              isWidth
            ) {
              userData.value.empower = true;
              //授权被改变后执行退出登录
              message.error('授权被非法改变,退出登录');
              ls.remove('suoPin');
              ls.set('feiFaGaiBian', 1);
              userStore.logout(true);
            }
          }, 0),
          timeKey,
          'watch',
        );
      } else {
        clearInterval(shouQuanTimeId);
      }
    },
    { immediate: true },
  );
</script>
<style lang="less">
  @prefixCls: ~'@{namespace}-windows-empower-';

  .@{prefixCls}empower {
    position: absolute;
    color: red;
    right: 25px;
    bottom: 40px;
    text-align: center;
    z-index: 2147483643;
    display: block;
    animation: twinkle 600ms infinite;
    -webkit-animation: twinkle 600ms infinite;
    font-weight: 800;
    pointer-events: none;

    > p {
      padding: 0;
      margin: 0;
      user-select: none;
      width: 100%;
      height: 30px;
      line-height: 30px;
      display: block;
      font-size: 19px;
    }

    > p:nth-child(3),
    > p:nth-child(4) {
      user-select: text;
    }
  }
</style>
