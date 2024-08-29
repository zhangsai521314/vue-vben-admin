<template>
  <MyContent>
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      :auto-resize="true"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'roleId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="roleManage_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>角色名称：</label>
                    <a-input
                      @press-enter="getRoles"
                      v-model:value="seacthContent.name"
                      placeholder="输入角色名称查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getRoles" type="primary">查询</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="roleManage_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">新增角色</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="roleManage_table_power">
            <IconFontClass
              name="icon-baseui-quanxianpeizhi"
              @click="showPower(row)"
              style="color: #0a61bd"
              title="分配权限"
            />
          </AuthDom>
          <AuthDom auth="roleManage_table_edit">
            <IconFontClass
              name="icon-baseui-edit-fill"
              @click="showFrom(row)"
              style="color: #0a61bd"
              title="编辑"
            />
          </AuthDom>
          <AuthDom auth="roleManage_table_delete">
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
          name="name"
          label="角色名称"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: '角色名称过长' },
            { validator: formValidator.empty, message: '请输入角色名称' },
          ]"
        >
          <a-input v-model:value="formData.name" placeholder="请输入角色名称" autocomplete="off" />
        </a-form-item>
        <a-form-item
          name="isValid"
          label="是否启用"
          :rules="[{ required: true, message: '请输入是否启用' }]"
        >
          <a-switch v-model:checked="formData.isValid" />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          label="角色排序"
          :rules="[
            { required: true, message: '请输入角色排序' },
            { validator: formValidator.min, min: -9999, message: '排序值-9999至9999' },
            { validator: formValidator.max, max: 9999, message: '排序值-9999至9999' },
          ]"
        >
          <a-input-number
            placeholder="请输入角色排序"
            style="width: 300px"
            :precision="3"
            v-model:value="formData.orderIndex"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-spin :spinning="fromSpinning">
          <a-button type="primary" @click="saveFrom">保存</a-button>
          <a-button style="margin-left: 8px" @click="formClose">关闭</a-button>
        </a-spin>
      </template>
    </a-drawer>
    <AssignPower v-if="isShowAssignPower" :isShow="isShowAssignPower" :roleId="assignPowerRoleId" />
  </MyContent>
</template>
<script setup lang="ts">
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import roleApi from '@/api/role';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import AssignPower from '@/components/MyAssignPower/index.vue';

  defineOptions({ name: 'RoleManage' });
  const { prefixCls } = useDesign('roleManage-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      { type: 'seq', title: '序号', minWidth: 70, fixed: 'left' },
      //基础
      {
        field: 'roleId',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        minWidth: 130,
        fixed: 'left',
      },
      {
        field: 'name',
        title: '角色名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
        fixed: 'left',
      },
      {
        field: 'isValid',
        title: '是否启用',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'orderIndex',
        title: '排序',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'createTime',
        title: '创建时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'createUser',
        title: '创建人',
        minWidth: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'modifyTime',
        title: '修改时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'modifyUser',
        title: '修改人',
        minWidth: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
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
  const defFromData = reactive({
    name: '',
    isValid: true,
    orderIndex: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const isShowAssignPower = ref(false);
  const assignPowerRoleId = ref(null);
  const seacthContent = ref({
    name: '',
  });
  getRoles();

  function showPower(row) {
    isShowAssignPower.value = false;
    nextTick(() => {
      assignPowerRoleId.value = row.roleId;
      isShowAssignPower.value = true;
    });
  }

  function showFrom(row) {
    if (myCommon.isnull(row)) {
      saveType = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getByid(row.roleId);
    }
  }

  //删除角色信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        roleApi
          .DeleteRole(row.roleId)
          .then(() => {
            loading.value = false;
            tableConfig.data = tableConfig.data?.filter((m) => m.roleId != row.roleId);
            message.success('删除角色信息成功');
          })
          .catch(() => {
            loading.value = false;
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

  //获取角色列表
  function getByid(id) {
    loading.value = true;
    roleApi
      .GetRole(id)
      .then((data) => {
        loading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取角色信息失败');
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }

  //获取角色列表
  function getRoles() {
    loading.value = true;
    roleApi
      .GetRoles({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfig.data = data;
      })
      .catch(() => {
        tableConfig.data = [];
      });
  }

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      const execompleteBefore = () => {
        fromSpinning.value = false;
      };
      formData.value['execompleteBefore'] = execompleteBefore;
      if (saveType == 'add') {
        roleApi.AddRole(formData.value).then((data) => {
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增角色成功');
        });
      } else {
        roleApi.UpdateRole(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.roleId);
          delete formData.value.createUser;
          myCommon.objectReplace(oldData, formData.value);
          oldData.modifyTime = data.modifyTime;
          oldData.modifyUser = data.modifyUser;
          formClose();
          message.success('更新角色信息成功');
        });
      }
    });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-roleManage-';

  .tableBtn {
    width: 100%;
  }
</style>
