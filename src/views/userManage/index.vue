<template>
  <MyContent>
    <a-spin :spinning="isGetUser" title="正在执行...">
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="mytable"
        :auto-resize="true"
        ref="tableRef"
        :loading="loading"
        :seq-config="{ startIndex: (page.current - 1) * page.size }"
        :row-config="{ keyField: 'userId' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="onSortChange"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="userManage_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>用户名称：</label>
                      <a-input
                        @press-enter="getUsers"
                        v-model:value="seacthContent.userName"
                        placeholder="输入用户名称查询"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>所属部门：</label>
                      <a-tree-select
                        v-model:value="seacthContent.orgId"
                        show-search
                        style="width: 170px"
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                        placeholder="请选择所属部门"
                        allow-clear
                        show-arrow
                        :filterTreeNode="AntVueCommon.filterTreeNode"
                        :tree-data="organizationDatas"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>角色名称：</label>
                      <a-select
                        style="width: 170px"
                        v-model:value="seacthContent.roleId"
                        :options="roles"
                        :allowClear="true"
                        placeholder="请选择角色名称"
                        show-search
                        :filter-option="AntVueCommon.filterOption"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="initPage" type="primary">查询</a-button>
                      <a-button @click="resetSeacth">重置表单</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="userManage_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">新增用户</a-button>
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
            >{{ row.status == 1 ? '正常' : row.status == 2 ? '停用' : '删除' }}
          </span>
        </template>
        <template #default="{ row }">
          <div :class="`tableOption`">
            <AuthDom auth="userManage_table_showPower">
              <IconFontClass
                name="icon-baseui-show"
                @click="showPower(row, true)"
                style="color: #0fc10e"
                title="查看权限"
              />
            </AuthDom>
            <AuthDom auth="userManage_table_power">
              <IconFontClass
                name="icon-baseui-quanxianpeizhi"
                @click="showPower(row, false)"
                style="color: #0a61bd"
                title="分配权限"
              />
            </AuthDom>
            <AuthDom auth="userManage_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                title="编辑"
              />
            </AuthDom>
            <AuthDom auth="userManage_table_delete">
              <IconFontClass
                name="icon-baseui-guanbicuowu"
                @click="remove(row)"
                style="color: red"
                title="删除"
              />
            </AuthDom>
          </div>
        </template>
      </vxe-grid>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="500"
        :visible="isShowForm"
        title="配置"
        :footer-style="{ textAlign: 'right' }"
        @close="formClose"
      >
        <a-form
          :label-col="{ span: 6 }"
          :style="{ paddingRight: '2px' }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          ref="formRef"
          :model="formData"
        >
          <a-form-item
            label="用户姓名"
            name="userName"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: '用户姓名称长度超限' },
              { min: 2, message: '用户姓名最少2位' },
              { validator: formValidator.empty, message: '请输入用户姓名' },
            ]"
          >
            <a-input
              placeholder="请输入用户姓名"
              v-model:value="formData.userName"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="登录账号"
            name="userAccount"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: '登录账号称长度超限' },
              { min: 2, message: '登录账号称最少2位' },
              { validator: formValidator.empty, message: '请输入登录账号' },
            ]"
          >
            <a-input
              placeholder="请输入登录账号"
              v-model:value="formData.userAccount"
              autocomplete="off"
            />
          </a-form-item>
          <!-- <a-form-item
                        label="微信账户" name="wxnumber">
                        <a-input v-model:value="formData.wxnumber" autocomplete="off" />
                    </a-form-item> -->
          <template v-if="saveType == 'add'">
            <a-form-item
              label="登录密码"
              name="userpwd"
              :rules="[
                { required: true, message: '' },
                { max: 40, message: '密码长度超限' },
                { min: 5, message: '密码最少5位' },
                { validator: formValidator.empty, message: '请输入登录密码' },
              ]"
            >
              <a-input
                placeholder="请输入登录密码"
                v-model:value="formData.userpwd"
                type="password"
                autocomplete="off"
              />
            </a-form-item>
          </template>
          <a-form-item
            label="用户状态"
            name="status"
            :rules="[{ required: true, message: '请选择用户状态' }]"
          >
            <a-select
              placeholder="请选择用户状态"
              v-model:value="formData.status"
              :options="statusOptions"
              show-search
              :filter-option="AntVueCommon.filterOption"
            />
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: '请选择所属部门' }]"
            label="所属部门"
            name="orgId"
          >
            <a-tree-select
              v-model:value="formData.orgId"
              show-search
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择所属部门"
              allow-clear
              show-arrow
              :filterTreeNode="AntVueCommon.filterTreeNode"
              :tree-data="organizationDatas"
            />
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: '请选择用户角色' }]"
            label="用户角色"
            name="roleId"
          >
            <a-select
              v-model:value="formData.roleId"
              :options="roles"
              :allowClear="true"
              placeholder="请选择用户角色"
              show-search
              :filter-option="AntVueCommon.filterOption"
            />
          </a-form-item>
          <a-form-item
            label="用户类型"
            name="adminType"
            :rules="[{ required: true, message: '请选择用户类型' }]"
          >
            <a-select
              placeholder="请选择用户类型"
              v-model:value="formData.adminType"
              show-search
              :filter-option="AntVueCommon.filterOption"
            >
              <a-select-option :value="1" :disabled="userData.adminType > 1">
                超级管理员
              </a-select-option>
              <a-select-option :value="2" :disabled="userData.adminType > 2">
                管理员
              </a-select-option>
              <a-select-option :value="3" :disabled="userData.adminType > 3">
                普通用户
              </a-select-option>
            </a-select>
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
            <a-input
              placeholder="请输入联系电话"
              v-model:value="formData.mobile"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="联系邮箱"
            name="email"
            style="margin-bottom: 0"
            :rules="[
              { required: true, message: '请输入联系邮箱' },
              { type: 'email', message: '联系邮箱格式不正确' },
              { max: 64, message: '联系邮箱过长' },
            ]"
          >
            <a-input
              placeholder="请输入联系邮箱"
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
                label="新密码"
                name="userpwd"
                :rules="[
                  { required: true, message: '请输入新密码' },
                  { max: 30, message: '密码长度超限' },
                  { min: 5, message: '密码最少5位' },
                  { validator: validate_pwd },
                ]"
              >
                <a-input
                  placeholder="请输入新密码"
                  v-model:value="formData.userpwd"
                  type="password"
                  autocomplete="off"
                />
              </a-form-item>
              <a-form-item
                label="确认密码"
                name="checkpass"
                :rules="[
                  { required: true, message: '请输入确认密码' },
                  { validator: validate_checkPass },
                ]"
              >
                <a-input
                  placeholder="请输入确认密码"
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
            <a-button type="primary" @click="saveFrom">保存</a-button>
            <a-button style="margin-left: 8px" @click="formClose">关闭</a-button>
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

  defineOptions({ name: 'UserManage' });
  const { prefixCls } = useDesign('UserManage-');
  const isGetUser = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', minWidth: 70, fixed: 'left' },
      {
        field: 'userId',
        title: '记录ID',
        visible: false,
        showHeaderOverflow: true,
        fixed: 'left',
        minWidth: 130,
      },
      {
        field: 'userName',
        title: '用户姓名',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
        fixed: 'left',
      },
      {
        field: 'userAccount',
        title: '登录账号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        field: 'orgName',
        title: '部门名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        field: 'roleName',
        title: '角色名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        field: 'adminType',
        title: '用户类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: ({ row }) => {
            return row.adminType == 1 ? '超级管理员' : row.adminType == 2 ? '管理员' : '普通账号';
          },
        },
        minWidth: 100,
      },
      {
        field: 'status',
        title: '状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'status',
        },
        // slots: {
        //   default: ({ row }) => {
        //     return row.status == 1 ? '正常' : row.status == 2 ? '停用' : '删除';
        //   },
        // },
        minWidth: 100,
      },
      {
        field: 'mobile',
        title: '联系电话',
        minWidth: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'email',
        title: '联系邮箱',
        minWidth: 180,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'lastLoginTime',
        title: '最后登录时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      // {
      //   field: 'lastLoginIp',
      //   title: '最后登录IP',
      //   showOverflow: true,
      //   showHeaderOverflow: true,
      //   sortable: true,
      //   visible: false,
      // },
      // {
      //   field: 'lastLoginOs',
      //   title: '最后登录客户端',
      //   showOverflow: true,
      //   showHeaderOverflow: true,
      //   visible: false,
      //   sortable: true,
      // },
      {
        field: 'lastLoginBrowser',
        title: '最后登录浏览器',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'createTime',
        title: '创建时间',
        minWidth: 150,
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'createUserName',
        title: '创建用户',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        field: 'modifyTime',
        title: '修改时间',
        minWidth: 150,
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'modifyUserName',
        title: '修改用户',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        title: '操作',
        minWidth: 140,
        slots: {
          default: 'default',
        },
        showOverflow: true,
        showHeaderOverflow: true,
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
  const tenants = ref([]);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['modifyTime desc', 'createTime desc'],
  });
  const statusOptions = [
    {
      value: 1,
      label: '正常',
    },
    {
      value: 2,
      label: '停用',
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
      return Promise.reject('密码不能为空');
    } else {
      if (formData.value.checkPass !== '') {
        formRef.value.validateFields('checkPass');
      }
      return Promise.resolve();
    }
  };

  let validate_checkPass = async (_rule, value) => {
    if (myCommon.isnull(value)) {
      return Promise.reject('密码不能为空');
    } else if (value !== formData.value.userpwd) {
      return Promise.reject('两次新密码不一致');
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
      title: '是否删除?',
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
            message.success('删除用户信息成功');
            getUsers();
          });
      },
      onCancel() {},
    });
  }

  //关闭表单
  function formClose() {
    isShowForm.value = false;
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
          message.error('获取用户信息失败');
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
    getUsers_().then((data) => {
      tableConfig.data = data.source;
      page.total = data.totalCount;
      page.current = data.pageIndex;
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
  /**
   * 获取排序条件
   */
  function getFullSort() {
    let fullsort = '';
    page.sortlist.forEach((item) => {
      fullsort += item + ',';
    });
    return fullsort.substring(0, fullsort.length - 1);
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getUsers();
  }

  function getUsers_() {
    return userApi.GetUsers({
      ...seacthContent.value,
      FullSort: getFullSort(),
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
          message.success('新增用户成功');
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
          debugger;
          const oldData = tableRef.value.getRowById(data.userId);
          myCommon.objectReplace(oldData, formData.value);
          oldData.roleName = roles.value.find((m) => m.value == oldData.roleId)?.label;
          oldData.modifyTime = data.modifyTime;
          oldData.modifyUserName = data.modifyUserName;
          oldData.orgName = _organizationDatas.find((m) => m.key == oldData.orgId)?.label;
          formClose();
          message.success('更新用户信息成功');
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
