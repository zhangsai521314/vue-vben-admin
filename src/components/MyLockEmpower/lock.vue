<template v-if="props.isShow">
  <div id="windowsSuoPin" :class="`${prefixCls}suoPin`" v-if="isShowSuoPin"> </div>
  <div :class="`${prefixCls}suoPin-content`" v-if="isShowSuoPin">
    <div>已锁屏，请勿非法操作！</div>
    <a-input-group compact>
      <a-input
        @press-enter="jieSuoClick"
        placeholder="输入登录密码,回车解锁"
        v-model:value="suoPinMiMa"
        type="password"
        style="width: 170px; text-align: left"
      />
      <a-button @click="jieSuoClick">解锁</a-button>
    </a-input-group>
    <a @click="goLogin" :class="`${prefixCls}goLogin`" href="javascript:void(0)">重新登录</a>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, createVNode, onBeforeMount } from 'vue';
import { useDesign } from '@/hooks/web/useDesign';
import userApi from '@/api/user';
import { useUserStore } from '@/store/modules/user';
import { createLocalStorage } from '@/utils/cache';
import { message, Modal } from 'ant-design-vue';
//定时器
import { useTimeFn } from '@/hooks/core/useTime_';

const props = defineProps({
  isShow: {
    type: Boolean,
    default() {
      return false;
    },
  },
  pDomId: {
    type: String,
    default() {
      return 'windowsContent';
    },
  },
  jieSuoClick: {
    type: Function,
    default() {
      return () => {};
    },
  },
  backgroundImg: {
    type: String,
    default() {
      return null;
    },
  },
});
const timeKey = `windows_lock_${myCommon.uniqueId()}`;
const ls = createLocalStorage();
const userStore = useUserStore();
const userData = ref(_.cloneDeep(userStore.getUserInfo));
const { prefixCls } = useDesign('windows-lock-');
const backgroundImg = ref(props.backgroundImg);
//是否锁屏
const isShowSuoPin = ref(false);
//解锁屏密码。登录密码
const suoPinMiMa = ref('');

//解锁
function jieSuoClick() {
  if (!myCommon.isnull(suoPinMiMa.value)) {
    userApi
      .VerifyNamePwd({
        UserName: userData.value.account,
        Pwd: suoPinMiMa.value,
      })
      .then((data) => {
        if (data) {
          message.success('解锁成功');
          props.jieSuoClick();
        } else {
          message.error('解锁失败');
        }
      });
  } else {
    message.warning('请输入密码');
  }
  event.stopPropagation();
}

function goLogin() {
  clearInterval(suoPinTimeId);
  ls.remove('feiFaGaiBian');
  ls.remove('suoPin');
  userStore.logout(true);
}

let suoPinTimeId = 0;
watch(
  () => isShowSuoPin.value,
  () => {
    //锁屏，监控是否被改变
    if (isShowSuoPin.value) {
      ls.set('suoPin', 1);
      suoPinTimeId = useTimeFn(
        setInterval(() => {
          if (
            $('#windowsSuoPin').length == 0 ||
            $('#windowsSuoPin').parent().attr('id') != props.pDomId ||
            $('#windowsSuoPin').height() != $(`#${props.pDomId}`).height() ||
            $('#windowsSuoPin').width() != $(`#${props.pDomId}`).width() ||
            $('#windowsSuoPin').css('position') != 'absolute' ||
            $('#windowsSuoPin').css('top') != '0px' ||
            $('#windowsSuoPin').css('left') != '0px' ||
            $('#windowsSuoPin').css('z-index') != '2147483646' ||
            $('#windowsSuoPin').css('display') != 'block'
          ) {
            props.jieSuoClick();
            //锁屏被改变后执行退出登录，非法改变后的登录需要刷新下登录页。不然登录后点击锁屏会有缓存样式，导致判断样式失败
            message.error('锁屏被非法改变,退出登录');
            ls.remove('suoPin');
            ls.set('feiFaGaiBian', 1);
            userStore.logout(true);
          }
        }, 0),
        timeKey,
        'watch',
      );
    } else {
      clearInterval(suoPinTimeId);
      ls.remove('suoPin');
      suoPinMiMa.value = '';
    }
  },
  { immediate: true },
);

watch(
  () => props.isShow,
  () => {
    isShowSuoPin.value = props.isShow;
  },
  { immediate: true },
);

watch(
  () => props.backgroundImg,
  () => {
    backgroundImg.value = props.backgroundImg;
    if (myCommon.isnull(backgroundImg.value)) {
      backgroundImg.value = JSON.parse(userStore.getUserInfo.systemCustom).backgroundImg;
    }
  },
  { immediate: true },
);
</script>
<style lang="less">
@prefixCls: ~'@{namespace}-windows-lock-';

//闪烁
@keyframes twinkle {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}

.@{prefixCls}suoPin {
  position: absolute;
  width: 100%;
  height: 100%;
  background: v-bind(backgroundImg);
  left: 0;
  top: 0;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 2147483646;
  display: block;
}

.@{prefixCls}suoPin-content {
  width: 250px;
  position: absolute;
  z-index: 2147483647;
  left: 42%;
  top: 37%;
  text-align: center;

  > div:first-child {
    color: red;
    font-size: 21px;
    font-weight: 600;
    animation: twinkle 600ms infinite;
    -webkit-animation: twinkle 600ms infinite;
  }
}

.@{prefixCls}goLogin {
  float: right;
  margin-right: 10px;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
}

.@{prefixCls}goLogin:hover {
  color: #fff;
}
</style>