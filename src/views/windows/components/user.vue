<!-- 用户信息 -->
<template>
  <div :class="`${prefixCls}content`">
    <a-form
      ref="formRef"
      :model="userData"
      :label-col="{ span: 10 }"
      :wrapper-col="{ span: 10 }"
      :style="{
        position: 'relative',
        width: '50%',
        overflow: 'hidden',
        float: 'left',
        paddingTop: '10px',
      }"
    >
      <a-form-item :wrapper-col="{ offset: 10 }">
        <a-upload
          :before-upload="beforeUpload"
          :maxCount="1"
          v-model:file-list="fileList"
          name="file"
          accept=".png,.jpg,.jpeg,.svg"
          @change="fileChange"
          :action="upUrl"
          :headers="{
            Authorization: token,
          }"
        >
          <a-avatar :size="90" alt="U" :src="userData.avatar || headerImg" />
        </a-upload>
      </a-form-item>
      <a-form-item
        label="用户名称"
        name="userName"
        :rules="[
          { required: true, message: '请输入用户名称' },
          { max: 40, message: '用户名称长度超限' },
          { min: 2, message: '用户名称最少2位' },
        ]"
      >
        <a-input v-model:value="userData.userName" autocomplete="off" />
      </a-form-item>
      <a-form-item
        label="登录名称"
        name="userAccount"
        :rules="[
          { required: true, message: '' },
          { max: 40, message: '登录名称长度超限' },
          { min: 2, message: '登录名称最少2位' },
          { validator: formValidator.empty, message: '请输入登录名称' },
        ]"
      >
        <a-input v-model:value="userData.userAccount" autocomplete="off" />
      </a-form-item>
      <a-form-item
        label="联系电话"
        name="mobile"
        :rules="[
          { required: true, message: '' },
          { max: 18, message: '联系电话过长' },
          { validator: formValidator.positiveInteger, message: '联系电话格式为自然数' },
          { validator: formValidator.empty, message: '请输入联系电话' },
        ]"
      >
        <a-input v-model:value="userData.mobile" autocomplete="off" />
      </a-form-item>
      <a-form-item
        label="联系邮箱"
        name="email"
        :rules="[
          { required: true, message: '请输入联系邮箱' },
          { type: 'email', message: '邮箱格式不正确' },
          { max: 64, message: '联系邮箱过长' },
        ]"
      >
        <a-input v-model:value="userData.email" autocomplete="off" />
      </a-form-item>
      <a-form-item label="用户部门" name="orgName">
        <a-input :disabled="true" v-model:value="userData.orgName" autocomplete="off" />
      </a-form-item>
      <a-form-item label="用户角色" name="roleName">
        <a-input :disabled="true" v-model:value="userData.roleName" autocomplete="off" />
      </a-form-item>
      <a-form-item label="用户类型" name="adminTypeName" style="margin-bottom: 0">
        <a-input :disabled="true" v-model:value="userData.adminTypeName" autocomplete="off" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 20, offset: 12 }" style="position: relative; height: 0">
        <IconFontClass
          name="icon-baseui-zhankai"
          :title="isShowPwd ? '不修改密码' : '修改密码'"
          @click="zhanKaiClick"
          style="position: absolute; top: -2px; left: 16%; cursor: pointer"
          :class="{
            fanZhun: isShowPwd,
          }"
        />
      </a-form-item>
      <template v-if="isShowPwd">
        <a-form-item
          label="旧密码"
          name="oldPwd"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: '密码长度超限' },
            { min: 5, message: '密码最少5位' },
            { validator: formValidator.empty, message: '请输入旧密码' },
          ]"
        >
          <a-input v-model:value="userData.oldPwd" type="password" autocomplete="off" />
        </a-form-item>
        <a-form-item
          label="新密码"
          name="userpwd"
          :rules="[
            { required: true, message: '请输入新密码' },
            { max: 40, message: '密码长度超限' },
            { min: 5, message: '密码最少5位' },
            { validator: validate_pwd },
          ]"
        >
          <a-input v-model:value="userData.userpwd" type="password" autocomplete="off" />
        </a-form-item>
        <a-form-item
          label="确认密码"
          name="checkPass"
          :rules="[
            { required: true, message: '请输入确认密码' },
            { validator: validate_checkPass },
          ]"
        >
          <a-input v-model:value="userData.checkPass" type="password" autocomplete="off" />
        </a-form-item>
      </template>
      <a-form-item :wrapper-col="{ span: 24, offset: 4 }" style="text-align: center">
        <a-spin tip="正在保存用户信息..." :spinning="isRunSave">
          <a-button @click="saveClick" type="primary">提交</a-button>
        </a-spin>
      </a-form-item>
    </a-form>
    <!-- <div
            :class="`${prefixCls}userLogo`">
            <img :src="userData.logo" />
        </div> -->
  </div>
</template>
<script setup>
  import { UserOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { ref, onMounted, reactive, unref, h, watch } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  import userApi from '@/api/user';
  import { message } from 'ant-design-vue';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { getAppEnvConfig } from '@/utils/env';
  import { sm2 } from 'sm-crypto-v2';
  import commonApi from '@/api/common';
  import headerImg from '@/assets/images/header.jpg';

  const props = defineProps({
    backgroundColor: {
      type: String,
      default() {
        return '#196AA8';
      },
    },
  });
  const formRef = ref({});
  const backgroundColor = ref(props.backgroundColor);
  const isShowPwd = ref(false);
  const userStore = useUserStore();
  const token = 'Bearer ' + userStore.getToken;
  const userData = ref(_.cloneDeep(userStore.getUserInfo));
  userData.value['userpwd'] = '';
  userData.value['oldPwd'] = '';
  userData.value['checkPass'] = '';
  const { prefixCls } = useDesign('windows-user-');
  const isRunSave = ref(false);
  const fileList = ref([]);
  const { VITE_GLOB_API_URL, VITE_GLOB_API_URL_PREFIX } = getAppEnvConfig();
  const upUrl = `${VITE_GLOB_API_URL}${VITE_GLOB_API_URL_PREFIX}/User/UpdateUserAvatar`;

  let validate_pwd = async (_rule, value) => {
    if (myCommon.isnull(value)) {
      return Promise.reject('密码不能为空');
    } else {
      if (userData.value.checkPass !== '') {
        formRef.value.validateFields('checkPass');
      }
      return Promise.resolve();
    }
  };
  let validate_checkPass = async (_rule, value) => {
    if (myCommon.isnull(value)) {
      return Promise.reject('密码不能为空');
    } else if (value !== userData.value.userpwd) {
      return Promise.reject('两次新密码不一致');
    } else {
      return Promise.resolve();
    }
  };

  function zhanKaiClick() {
    isShowPwd.value = !isShowPwd.value;
  }

  //保存
  function saveClick() {
    isRunSave.value = true;
    //验证
    formRef.value
      .validate()
      .then(() => {
        userData.value.IsSinceUpdate = true;
        userData.value.IsUpdatePwd = isShowPwd.value;
        userData.value.execompleteBefore = () => {
          isRunSave.value = false;
        };
        const p_data = _.cloneDeep(userData.value);
        p_data.userpwd = sm2.doEncrypt(
          p_data.userpwd,
          myCommon.getCryptogramKey().sm2.publicKey,
          1,
        );
        p_data.oldPwd = sm2.doEncrypt(p_data.oldPwd, myCommon.getCryptogramKey().sm2.publicKey, 1);
        userApi.UpdateUser(p_data).then((data) => {
          if (data > 0) {
            message.success('保存信息成功');
            userData.value['userpwd'] = '';
            userData.value['oldPwd'] = '';
            userData.value['checkPass'] = '';
            //因为现在后台没用使用用户名称和用户账户的情况，如果有，此处需要强制用户重新登录
            userStore.setUserInfo(Object.assign(userStore.getUserInfo, userData.value));
          } else {
            message.warning('保存信息失败');
          }
        });
      })
      .catch(() => {
        isRunSave.value = false;
      });
  }

  //上传之前
  function beforeUpload(file) {
    const isLt5M = file.size / 1024 / 1024 < 1;
    if (!isLt5M) {
      file['remove'] = true;
      fileList.value = [];
      message.error('头像不可超过1MB');
      return false;
    }
    return true;
  }
  //上传文件改变时的状态
  function fileChange(fileInfo) {
    if (!fileInfo.file.hasOwnProperty('remove')) {
      if (fileInfo.file.status === 'done') {
        if (fileInfo.file.response.success) {
          userData.value.avatar = fileInfo.file.response.data;
          userStore.setAvatar(fileInfo.file.response.data);
          fileList.value = [];
        } else {
          fileList.value = [];
        }
      } else if (fileInfo.file.status === 'error') {
        fileList.value = [];
        message.warning('头像上传失败');
      }
    } else {
      fileList.value = [];
    }
  }

  // setInterval(() => {
  //   commonApi.text().then((data) => {
  //     // console.log(data.cpuRate);
  //     console.log(data);
  //   });
  // }, 500);

  watch(
    () => props.backgroundColor,
    () => {
      backgroundColor.value = props.backgroundColor;
    },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-windows-user-';

  .@{prefixCls}content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background-color: #fff;

    .fanZhun {
      display: inline-block;
      transform: rotateX(180deg);
    }

    .@{prefixCls}userLogo {
      width: 322px;
      height: 159px;
      margin-top: 115px;
      padding: 20px;
      float: left;
      border-radius: 2px;
      background-color: v-bind(backgroundcolor);
    }
  }
</style>
