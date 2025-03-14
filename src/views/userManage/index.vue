<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="isGetUser">
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="versionsManage"
        :auto-resize="true"
        ref="tableRef"
        :loading="loading"
        :seq-config="{ startIndex: (page.current - 1) * page.size }"
        :row-config="{ keyField: 'userId' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="({ sortList }) => vxetableMyCommon.onSortChange({ sortList }, page, getUsers)"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" align="start" style="margin: 0 5px">
              <AuthDom auth="userManage_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.userName') }}:</label>
                      <a-input
                        @press-enter="getUsers"
                        v-model:value="seacthContent.userName"
                        :placeholder="t('view.enterUserNameToSearch')"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.affiliatedDepartment') }}:</label>
                      <a-tree-select
                        v-model:value="seacthContent.orgId"
                        show-search
                        style="width: 170px"
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                        :placeholder="t('view.pleaseSelectTheAffiliatedDepartment')"
                        allow-clear
                        show-arrow
                        :filterTreeNode="AntVueCommon.filterTreeNode"
                        :tree-data="organizationDatas"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.roleName') }}:</label>
                      <a-select
                        style="width: 170px"
                        v-model:value="seacthContent.roleId"
                        :options="roles"
                        :allowClear="true"
                        :placeholder="t('view.pleaseSelectRoleName')"
                        show-search
                        :filter-option="AntVueCommon.filterOption"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="initPage" type="primary">{{ t('view.query') }}</a-button>
                      <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="userManage_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">{{
                        t('view.addUser')
                      }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
            </a-space>
          </div>
        </template>
        <template #pager>
          <vxe-pager
            background
            v-model:current-page="page.current"
            v-model:page-size="page.size"
            :total="page.total"
            @page-change="handlePageChange"
          />
        </template>
        <template #status="{ row }">
          <span :style="{ color: row.status == 1 ? 'green' : row.status == 2 ? 'red' : 'red' }"
            >{{
              row.status == 1
                ? t('view.normal')
                : row.status == 2
                  ? t('view.disable')
                  : t('view.delete')
            }}
          </span>
        </template>
        <template #default="{ row }">
          <div :class="`tableOption`">
            <AuthDom auth="userManage_table_showPower">
              <IconFontClass
                name="icon-baseui-show"
                @click="showPower(row, true)"
                style="color: #0fc10e"
                :title="t('view.viewPermissions')"
              />
            </AuthDom>
            <AuthDom auth="userManage_table_power">
              <IconFontClass
                name="icon-baseui-quanxianpeizhi"
                @click="showPower(row, false)"
                style="color: #0a61bd"
                :title="t('view.assignPermissions')"
              />
            </AuthDom>
            <AuthDom auth="userManage_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                :title="t('view.edit')"
              />
            </AuthDom>
            <AuthDom auth="userManage_table_delete">
              <IconFontClass
                name="icon-baseui-guanbicuowu"
                @click="remove(row)"
                style="color: red"
                :title="t('view.delete')"
              />
            </AuthDom>
          </div>
        </template>
      </vxe-grid>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="locale == 'zh-CN' ? 500 : 600"
        :visible="isShowForm"
        :title="t('view.configuration')"
        :footer-style="{ textAlign: 'right' }"
        @close="formClose"
      >
        <a-form
          :label-col="{ span: locale == 'zh-CN' ? 6 : 10 }"
          :style="{ paddingRight: '2px' }"
          autocomplete="off"
          ref="formRef"
          :model="formData"
        >
          <a-form-item
            :label="t('view.userFullName')"
            name="userName"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.userFullNameLengthExceeded', [40]) },
              { min: 2, message: t('view.userFullNameMustBeAtLeast2Characters', [2]) },
              { validator: formValidator.empty, message: t('view.pleaseEnterUserFullName') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterUserFullName')"
              v-model:value="formData.userName"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.loginAccount')"
            name="userAccount"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.loginAccountLengthExceeded', [40]) },
              { min: 2, message: t('view.loginAccountMustBeAtLeast2Characters', [2]) },
              { validator: formValidator.empty, message: t('view.pleaseEnterLoginAccount') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterLoginAccount')"
              v-model:value="formData.userAccount"
              autocomplete="off"
            />
          </a-form-item>
          <!-- <a-form-item
                        :label="微信账户" name="wxnumber">
                        <a-input v-model:value="formData.wxnumber" autocomplete="off" />
                    </a-form-item> -->
          <template v-if="saveType == 'add'">
            <a-form-item
              :label="t('view.loginPassword')"
              name="userpwd"
              :rules="[
                { required: true, message: '' },
                { max: 40, message: t('view.passwordLengthExceeded', [40]) },
                { min: 5, message: t('view.passwordMustBeAtLeast5Characters', [5]) },
                { validator: formValidator.empty, message: t('view.pleaseEnterLoginPassword') },
              ]"
            >
              <a-input
                :placeholder="t('view.pleaseEnterLoginPassword')"
                v-model:value="formData.userpwd"
                type="password"
                autocomplete="off"
              />
            </a-form-item>
          </template>
          <a-form-item
            :label="t('view.userStatus')"
            name="status"
            :rules="[{ required: true, message: t('view.pleaseSelectUserStatus') }]"
          >
            <a-select
              :placeholder="t('view.pleaseSelectUserStatus')"
              v-model:value="formData.status"
              :options="statusOptions"
              show-search
              :filter-option="AntVueCommon.filterOption"
            />
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: t('view.pleaseSelectTheAffiliatedDepartment') }]"
            :label="t('view.affiliatedDepartment')"
            name="orgId"
          >
            <a-tree-select
              v-model:value="formData.orgId"
              show-search
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :placeholder="t('view.pleaseSelectTheAffiliatedDepartment')"
              allow-clear
              show-arrow
              :filterTreeNode="AntVueCommon.filterTreeNode"
              :tree-data="organizationDatas"
            />
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: t('view.pleaseSelectUserRole') }]"
            :label="t('view.userRole')"
            name="roleId"
          >
            <a-select
              v-model:value="formData.roleId"
              :options="roles"
              :allowClear="true"
              :placeholder="t('view.pleaseSelectUserRole')"
              show-search
              :filter-option="AntVueCommon.filterOption"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.userType')"
            name="adminType"
            :rules="[{ required: true, message: t('view.pleaseSelectUserType') }]"
          >
            <a-select
              :placeholder="t('view.pleaseSelectUserType')"
              v-model:value="formData.adminType"
              show-search
              :filter-option="AntVueCommon.filterOption"
            >
              <a-select-option :value="1" :disabled="userData.adminType > 1">
                {{ t('view.superAdministrator') }}
              </a-select-option>
              <a-select-option :value="2" :disabled="userData.adminType > 2">
                {{ t('view.administrator') }}
              </a-select-option>
              <a-select-option :value="3" :disabled="userData.adminType > 3">
                {{ t('view.regularUser') }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            :label="t('view.contactPhone')"
            name="mobile"
            :rules="[
              { max: 18, message: t('view.phoneNumberIsTooLong', [18]) },
              {
                validator: formValidator.positiveInteger,
                message: t('view.phoneNumberFormatMustBeANaturalNumber'),
              },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterThePhoneNumber')"
              v-model:value="formData.mobile"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.contactEmail')"
            name="email"
            style="margin-bottom: 0"
            :rules="[
              { type: 'email', message: t('view.contactEmailFormatIncorrect') },
              { max: 120, message: t('view.contactEmailTooLong', [120]) },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterContactEmail')"
              v-model:value="formData.email"
              autocomplete="off"
            />
          </a-form-item>
          <template v-if="saveType == 'edit'">
            <a-form-item
              :wrapper-col="{ span: 20, offset: 12 }"
              style="position: relative; height: 0"
            >
              <IconFontClass
                name="icon-baseui-zhankai"
                :title="isShowPwd ? t('view.doNotChangePassword') : t('view.changePassword')"
                @click="zhanKaiClick"
                style="position: absolute; top: -2px; left: 16%; cursor: pointer"
                :class="{
                  fanZhun: isShowPwd,
                }"
              />
            </a-form-item>
            <template v-if="isShowPwd">
              <a-form-item
                :label="t('view.newPassword')"
                name="userpwd"
                :rules="[
                  { required: true, message: t('view.pleaseEnterNewPassword') },
                  { max: 30, message: t('view.passwordTooLong', [30]) },
                  { min: 5, message: t('view.passwordAtLeastFiveDigits', [5]) },
                  { validator: validate_pwd },
                ]"
              >
                <a-input
                  :placeholder="t('view.pleaseEnterNewPassword')"
                  v-model:value="formData.userpwd"
                  type="password"
                  autocomplete="off"
                />
              </a-form-item>
              <a-form-item
                :label="t('view.confirmPassword')"
                name="checkpass"
                :rules="[
                  { required: true, message: t('view.pleaseEnterConfirmPassword') },
                  { validator: validate_checkPass },
                ]"
              >
                <a-input
                  :placeholder="t('view.pleaseEnterConfirmPassword')"
                  v-model:value="formData.checkpass"
                  type="password"
                  autocomplete="off"
                />
              </a-form-item>
            </template>
          </template>
        </a-form>
        <template #footer>
          <a-spin :spinning="fromSpinning">
            <a-button type="primary" @click="saveFrom">{{ t('view.save') }}</a-button>
            <a-button style="margin-left: 8px" @click="formClose">{{ t('view.close') }}</a-button>
          </a-spin>
        </template>
      </a-drawer>
      <AssignPower
        v-if="isShowAssignPower"
        :isShow="isShowAssignPower"
        :userId="assignPowerUserId"
        :isRead="isReadPower"
      />
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import vxetableMyCommon from '@/utils/MyCommon/VxetableMyCommon';
  import myCommon from '@/utils/MyCommon/common';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import roleApi from '@/api/role';
  import userApi from '@/api/user';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import AssignPower from '@/components/MyAssignPower/index.vue';
  import organizationApi from '@/api/organization';
  import { sm2 } from 'sm-crypto-v2';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useUserStore } from '@/store/modules/user';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'UserManage' });
  const { prefixCls } = useDesign('UserManage-');
  const isGetUser = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    showOverflow: true,
    showHeaderOverflow: true,
    height: 'auto',
    columns: [
      //基础
      {
        type: 'seq',
        title: t('view.serialNumber'),
        minWidth: locale == 'zh-CN' ? 70 : 160,
        fixed: 'left',
        showOverflow: true,
      },
      {
        field: 'userId',
        title: t('view.recordId'),
        sortable: true,
        visible: false,
        showOverflow: true,
        fixed: 'left',
        minWidth: locale == 'zh-CN' ? 130 : 150,
      },
      {
        field: 'userName',
        title: t('view.userFullName'),
        showOverflow: true,
        sortable: true,
        minWidth: 160,
        fixed: 'left',
      },
      {
        field: 'userAccount',
        title: t('view.loginAccount'),
        showOverflow: true,
        sortable: true,
        minWidth: 176,
      },
      {
        field: 'orgName',
        title: t('view.departmentName'),
        showOverflow: true,
        sortable: true,
        minWidth: 176,
      },
      {
        field: 'roleName',
        title: t('view.roleName'),
        showOverflow: true,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'adminType',
        title: t('view.userType'),
        showOverflow: true,
        sortable: true,
        slots: {
          default: ({ row }) => {
            return row.adminType == 1
              ? t('view.superAdministrator')
              : row.adminType == 2
                ? t('view.administrator')
                : t('view.regularUser');
          },
        },
        minWidth: 160,
      },
      {
        field: 'status',
        title: t('view.userStatus'),
        showOverflow: true,
        sortable: true,
        slots: {
          default: 'status',
        },
        // slots: {
        //   default: ({ row }) => {
        //     return row.status == 1 ? '正常' : row.status == 2 ? '停用' : '删除';
        //   },
        // },
        minWidth: locale == 'zh-CN' ? 100 : 150,
      },
      {
        field: 'mobile',
        title: t('view.contactPhone'),
        minWidth: 174,
        showOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'email',
        title: t('view.contactEmail'),
        minWidth: 180,
        showOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'lastLoginTime',
        title: t('view.lastLoginTime'),
        minWidth: 160,
        showOverflow: true,
        sortable: true,
      },
      // {
      //   field: 'lastLoginIp',
      //   title: '最后登录IP',
      //   showOverflow: true,
      //
      //   sortable: true,
      //   visible: false,
      // },
      // {
      //   field: 'lastLoginOs',
      //   title: '最后登录客户端',
      //   showOverflow: true,
      //
      //   visible: false,
      //   sortable: true,
      // },
      {
        field: 'lastLoginBrowser',
        title: t('view.lastLoginBrowser'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 156,
      },
      {
        field: 'createTime',
        title: t('view.creationTime'),
        minWidth: 150,
        visible: false,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'createUserName',
        title: t('view.createUser'),
        visible: false,
        showOverflow: true,
        sortable: true,
        minWidth: 156,
      },
      {
        field: 'modifyTime',
        title: t('view.modificationTime'),
        minWidth: 170,
        visible: false,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'modifyUserName',
        title: t('view.modifyUser'),
        visible: false,
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 130 : 180,
      },
      {
        field: 'action_',
        title: t('view.action'),
        minWidth: 140,
        slots: {
          default: 'default',
        },
        showOverflow: true,
        fixed: 'right',
      },
    ],
    toolbarConfig: {
      custom: true,
      slots: {
        buttons: 'toolbar_buttons',
      },
    },
    data: [],
  });
  const isShowPwd = ref(false);
  const defFromData = reactive({
    userName: '',
    userAccount: '',
    status: 1,
    mobile: '',
    email: '',
    adminType: 3,
    roleId: null,
    userpwd: '',
    checkpass: '',
    wxnumber: null,
    orgId: null,
    usersource: 1,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const saveType = ref('add');
  const isShowAssignPower = ref(false);
  const isReadPower = ref(false);
  const assignPowerUserId = ref(null);
  const roles = ref([]);
  const userStore = useUserStore();
  const userData = ref(_.cloneDeep(userStore.getUserInfo));
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['lastLoginTime desc'],
  });
  const statusOptions = [
    {
      value: 1,
      label: t('view.normal'),
    },
    {
      value: 2,
      label: t('view.disable'),
    },
  ];

  const seacthContent = ref({
    userName: '',
    usersource: '',
    orgId: null,
    roleId: null,
  });

  const organizationDatas = ref([]);
  let _organizationDatas = [];

  getRoles();
  getOrganization();
  getUsers();

  let validate_pwd = async (_rule, value) => {
    if (myCommon.isnull(value)) {
      return Promise.reject(t('view.passwordCannotBeEmpty'));
    } else {
      if (formData.value.checkPass !== '') {
        formRef.value.validateFields('checkPass');
      }
      return Promise.resolve();
    }
  };

  let validate_checkPass = async (_rule, value) => {
    if (myCommon.isnull(value)) {
      return Promise.reject(t('view.passwordCannotBeEmpty'));
    } else if (value !== formData.value.userpwd) {
      return Promise.reject(t('view.theTwoNewPasswordsDoNotMatch'));
    } else {
      return Promise.resolve();
    }
  };

  function zhanKaiClick() {
    isShowPwd.value = !isShowPwd.value;
  }

  function handlePageChange() {
    getUsers();
  }

  function showPower(row, isRead) {
    isReadPower.value = isRead;
    isShowAssignPower.value = false;
    nextTick(() => {
      assignPowerUserId.value = row.userId;
      isShowAssignPower.value = true;
    });
  }

  function showFrom(row) {
    getOrganization();
    getRoles();
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getUser(row.userId);
    }
  }

  //删除用户信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      okText: t('view.confirm'),
      cancelText: t('view.cancel'),
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isGetUser.value = true;
        userApi
          .DeleteUser({
            UserId: row.userId,
            execompleteBefore: () => {
              isGetUser.value = false;
            },
          })
          .then(() => {
            message.success(t('view.deletionSuccessful'));
            getUsers();
          });
      },
      onCancel() {},
    });
  }

  //关闭表单
  function formClose() {
    isShowForm.value = false;
    isShowPwd.value = false;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //获取用户
  function getUser(userId) {
    isGetUser.value = true;
    userApi
      .GetUser({
        UserId: userId,
        execompleteBefore: () => {
          isGetUser.value = false;
        },
      })
      .then((data) => {
        if (data) {
          delete data.createTime;
          delete data.createUser;
          delete data.modifyTime;
          delete data.modifyUser;
          formData.value = data;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.failedToRetrieveUserInformation'));
        }
      });
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      userName: '',
      usersource: '',
      orgId: null,
      roleId: null,
    };
  }

  //获取用户列表
  function getUsers() {
    loading.value = true;
    getUsers_()
      .then((data) => {
        tableConfig.data = data.source;
        page.total = data.totalCount;
        page.current = data.pageIndex;
      })
      .catch(() => {
        tableConfig.data = [];
        page.total = 0;
      });
  }
  /**
   * 排序条件改变
   */
  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getUsers();
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getUsers();
  }

  function getUsers_() {
    return userApi.GetUsers({
      ...seacthContent.value,
      FullSort: page.sortlist.join(','),
      execompleteBefore: () => {
        loading.value = false;
      },
      PageIndex: page.current,
      PageSize: page.size,
    });
  }

  //获取角色列表
  function getRoles() {
    roleApi.GetRoleSimple().then((data) => {
      roles.value = data;
    });
  }

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      formData.value.IsSinceUpdate = false;
      formData.value.execompleteBefore = () => {
        fromSpinning.value = false;
      };
      const p_data = _.cloneDeep(formData.value);
      if (saveType.value == 'add') {
        p_data.userpwd = sm2.doEncrypt(
          p_data.userpwd,
          myCommon.getCryptogramKey().sm2.publicKey,
          1,
        );
        userApi.AddUser(p_data).then((data) => {
          data.roleName = roles.value.find((m) => m.value == data.roleId)?.label;
          data.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
          page.total = page.total + 1;
        });
      } else {
        p_data.IsUpdatePwd = isShowPwd.value;
        if (p_data.IsUpdatePwd) {
          p_data.userpwd = sm2.doEncrypt(
            p_data.userpwd,
            myCommon.getCryptogramKey().sm2.publicKey,
            1,
          );
        }
        userApi.UpdateUser(p_data).then((data) => {
          const oldData = tableConfig.data.find((m) => m.userId == data.userId);
          if (oldData) {
            delete formData.value.createUser;
            delete formData.value.createTime;
            myCommon.objectReplace(oldData, formData.value);
            oldData.roleName = roles.value.find((m) => m.value == oldData.roleId)?.label;
            oldData.modifyTime = data.modifyTime;
            oldData.modifyUserName = data.modifyUserName;
            oldData.orgName = _organizationDatas.find((m) => m.key == oldData.orgId)?.label;
          }
          formClose();
          message.success(t('view.updateSuccessful'));
        });
      }
    });
  }

  //获取部门
  function getOrganization() {
    organizationApi
      .GetOrganizationTree({})
      .then((data) => {
        organizationDatas.value = data;
        myCommon.generateList(_organizationDatas, organizationDatas.value, 'children');
      })
      .catch(() => {
        loading.value = false;
        _organizationDatas = [];
      });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-userManage-';

  .fanZhun {
    display: inline-block;
    transform: rotateX(180deg);
  }
</style>
