<template>
  <LoginFormTitle v-show="getShow" class="enter-x" />
  <Form
    class="p-4 enter-x"
    :model="formData"
    :rules="getFormRules"
    ref="formRef"
    v-show="getShow"
    @keypress.enter="handleLogin"
  >
    <FormItem name="account" class="enter-x">
      <Input
        size="large"
        v-model:value="formData.account"
        :placeholder="t('sys.login.userName')"
        class="fix-auto-fill"
      />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword
        size="large"
        visibilityToggle
        v-model:value="formData.password"
        :placeholder="t('sys.login.password')"
      />
    </FormItem>
    <ARow class="enter-x">
      <!-- <ACol :span="12">
        <FormItem>
          <Checkbox v-model:checked="rememberMe" size="small">
            {{ t('sys.login.rememberMe') }}
          </Checkbox>
        </FormItem>
      </ACol> -->

      <!-- 忘记密码 No logic, you need to deal with it yourself
      <ACol :span="12">
        <FormItem :style="{ 'text-align': 'right' }">
          <Button type="link" size="small" @click="setLoginState(LoginStateEnum.RESET_PASSWORD)">
            {{ t('sys.login.forgetPassword') }}
          </Button>
        </FormItem>
      </ACol> -->
    </ARow>

    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </Button>
      <p v-if="feiFaGaiBianBack" class="feifa">非法操作导致退出，请刷新该页面后点击登录</p>

      <!-- 注册
      <Button size="large" class="mt-4 enter-x" block
      
       @click="handleRegister">
        {{ t('sys.login.registerButton') }}
      </Button> -->
    </FormItem>

    <!-- 手机登录、二维码登录、注册、
    <ARow class="enter-x">
      <ACol :md="8" :xs="24">
        <Button block @click="setLoginState(LoginStateEnum.MOBILE)">
          {{ t('sys.login.mobileSignInFormTitle') }}
        </Button>
      </ACol>
      <ACol :md="8" :xs="24" class="!my-2 !md:my-0 xs:mx-0 md:mx-2">
        <Button block @click="setLoginState(LoginStateEnum.QR_CODE)">
          {{ t('sys.login.qrSignInFormTitle') }}
        </Button>
      </ACol>
      <ACol :md="7" :xs="24">
        <Button block @click="setLoginState(LoginStateEnum.REGISTER)">
          {{ t('sys.login.registerButton') }}
        </Button>
      </ACol>
    </ARow> -->

    <!-- 其他登录方式
    <Divider class="enter-x">{{ t('sys.login.otherSignIn') }}</Divider>

    <div class="flex justify-evenly enter-x" :class="`${prefixCls}-sign-in-way`">
      <GithubFilled />
      <WechatFilled />
      <AlipayCircleFilled />
      <GoogleCircleFilled />
      <TwitterCircleFilled />
    </div> -->
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed, onMounted } from 'vue';
  import { Checkbox, Form, Input, Row, Col, Button, Divider, message } from 'ant-design-vue';
  import {
    GithubFilled,
    WechatFilled,
    AlipayCircleFilled,
    GoogleCircleFilled,
    TwitterCircleFilled,
  } from '@ant-design/icons-vue';
  import LoginFormTitle from './LoginFormTitle.vue';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useMessage } from '@/hooks/web/useMessage';

  import { useUserStore } from '@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useDesign } from '@/hooks/web/useDesign';
  //import { onKeyStroke } from '@vueuse/core';

  import authApi from '@/api/sys/auth';
  import auth from '@/api/sys/auth';
  import { createLocalStorage } from '@/utils/cache';
  import { tryOnUnmounted } from '@vueuse/core';
  import commonApi from '@/api/common';

  import { sm2 } from 'sm-crypto-v2';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { LoginParams } from '@/api/sys/model/userModel';

  const mqttStore = useMqttStoreWithOut();

  const ls = createLocalStorage();
  //是否是非法改变导致的返回登录
  const feiFaGaiBianBack = ref(ls.get('feiFaGaiBian') == 1);

  const ACol = Col;
  const ARow = Row;
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { notification, createErrorModal } = useMessage();
  const { prefixCls } = useDesign('login');
  const userStore = useUserStore();

  const { setLoginState, getLoginState } = useLoginState();
  const { getFormRules } = useFormRules();

  const formRef = ref();
  const loading = ref(false);
  const rememberMe = ref(false);

  const formData = reactive<LoginParams>({
    account: '',
    password: '',
    //不要默认的错误提示
    mode: 'none',
  });

  const { validForm } = useFormValid(formRef);

  //onKeyStroke('Enter', handleLogin);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  async function handleLogin() {
    mqttStore.msgAudioIsAlert = true;
    // zs更改;
    const data = await validForm();
    if (!data) return;
    // zs更改;
    try {
      loading.value = true;
      const p_data = _.cloneDeep(formData);
      p_data.password = sm2.doEncrypt(
        p_data.password,
        myCommon.getCryptogramKey().sm2.publicKey,
        1,
      );
      const userInfo = await userStore.login(p_data);
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.userName}`,
          duration: 2,
        });
      }
    } catch (error) {
      if (
        error
          .toString()
          .indexOf('连接数据库过程中发生错误，检查服务器是否正常连接字符串是否正确') != -1
      ) {
        message.error('数据库链接失败');
      } else {
        createErrorModal({
          title: t('sys.api.errorTip'),
          content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
          getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
        });
      }
    } finally {
      loading.value = false;
    }
  }

  //f5刷新
  function handleBeforeunload() {
    ls.remove('feiFaGaiBian');
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeunload);
  });
  tryOnUnmounted(() => {
    //组件卸载
    window.removeEventListener('beforeunload', handleBeforeunload);
  });
</script>
<style lang="less" scoped>
  //闪烁
  @keyframes twinkle {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.4;
    }

    100% {
      opacity: 1;
    }
  }

  .feifa {
    animation: twinkle 600ms infinite;
    color: red;
    text-align: center;
  }
</style>
