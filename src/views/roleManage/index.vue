<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="roleManage"
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
                    <label>{{ t('view.roleName') }}：</label>
                    <a-input
                      @press-enter="getRoles"
                      v-model:value="seacthContent.name"
                      :placeholder="t('view.inputRoleNameQuery')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getRoles" type="primary"> {{ t('view.query') }}</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="roleManage_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">{{ t('view.addRole') }}</a-button>
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
              :title="t('view.assignPermissions')"
            />
          </AuthDom>
          <AuthDom auth="roleManage_table_edit">
            <IconFontClass
              name="icon-baseui-edit-fill"
              @click="showFrom(row)"
              style="color: #0a61bd"
              :title="t('view.edit')"
            />
          </AuthDom>
          <AuthDom auth="roleManage_table_delete">
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
      :width="500"
      :visible="isShowForm"
      :title="t('view.configuration')"
      :footer-style="{ textAlign: 'right' }"
      @close="formClose"
    >
      <a-form
        :label-col="{ span: 8 }"
        :style="{ paddingRight: '2px' }"
        autocomplete="off"
        ref="formRef"
        :model="formData"
      >
        <a-form-item
          name="nameCn"
          :label="t('view.roleName')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.roleNameTooLong') },
            { validator: formValidator.empty, message: t('view.pleaseEnterRoleName') },
          ]"
        >
          <a-input
            v-model:value="formData.nameCn"
            :placeholder="t('view.pleaseEnterRoleName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="nameEn"
          :label="t('view.roleName')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.roleNameTooLong') },
            { validator: formValidator.empty, message: t('view.pleaseEnterRoleName') },
          ]"
        >
          <a-input
            v-model:value="formData.nameEn"
            :placeholder="t('view.pleaseEnterRoleName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="nameFr"
          :label="t('view.roleName')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.roleNameTooLong') },
            { validator: formValidator.empty, message: t('view.pleaseEnterRoleName') },
          ]"
        >
          <a-input
            v-model:value="formData.nameFr"
            :placeholder="t('view.pleaseEnterRoleName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="isValid"
          :label="t('view.enableOrDisable')"
          :rules="[{ required: true, message: t('view.pleaseSelectEnableOrDisable') }]"
        >
          <a-switch v-model:checked="formData.isValid" />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          :label="t('view.roleSorting')"
          :rules="[
            { required: true, message: t('view.pleaseEnterRoleSorting') },
            {
              validator: formValidator.min,
              min: -9999,
              message: t('view.sortingValueMustBeBetween9999'),
            },
            {
              validator: formValidator.max,
              max: 9999,
              message: t('view.sortingValueMustBeBetween9999'),
            },
          ]"
        >
          <a-input-number
            :placeholder="t('view.pleaseInputSorting')"
            style="width: 300px"
            :precision="3"
            v-model:value="formData.orderIndex"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-spin :spinning="fromSpinning">
          <a-button type="primary" @click="saveFrom">{{ t('view.save') }}</a-button>
          <a-button style="margin-left: 8px" @click="formClose">{{ t('view.close') }}</a-button>
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
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;

  defineOptions({ name: 'RoleManage' });
  const { prefixCls } = useDesign('roleManage-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      {
        type: 'seq',
        title: t('view.serialNumber'),
        minWidth: locale == 'en-US' ? 110 : 70,
        fixed: 'left',
      },
      //基础
      {
        field: 'roleId',
        title: t('view.recordId'),
        visible: false,
        showOverflow: true,
        minWidth: 136,
        fixed: 'left',
      },
      {
        field: 'name',
        title: t('view.roleName'),
        showOverflow: true,
        sortable: true,
        minWidth: 174,
        fixed: 'left',
      },
      {
        field: 'nameCn',
        title: t('view.roleNameCn'),
        showOverflow: true,
        sortable: true,
        minWidth: 174,
        visible: false,
      },
      {
        field: 'nameEn',
        title: t('view.roleNameEn'),
        showOverflow: true,
        sortable: true,
        minWidth: 174,
        visible: false,
      },
      {
        field: 'nameFr',
        title: t('view.roleNameFr'),
        showOverflow: true,
        sortable: true,
        minWidth: 174,
        visible: false,
      },
      {
        field: 'isValid',
        title: t('view.enableOrDisable'),
        minWidth: 150,
        showOverflow: true,

        cellRender: { name: 'render_isno' },
      },
      {
        field: 'orderIndex',
        title: t('view.sorting'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'createTime',
        title: t('view.creationTime'),
        minWidth: 150,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'createUser',
        title: t('view.creator'),
        minWidth: 130,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'modifyTime',
        title: t('view.modificationTime'),
        minWidth: 170,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'modifyUser',
        title: t('view.modifier'),
        minWidth: 176,
        showOverflow: true,
        sortable: true,
      },
      {
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
  const defFromData = reactive({
    nameCn: null,
    nameEn: null,
    nameFr: null,
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
    name: null,
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
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        roleApi
          .DeleteRole(row.roleId)
          .then(() => {
            loading.value = false;
            tableConfig.data = tableConfig.data?.filter((m) => m.roleId != row.roleId);
            message.success(t('view.deletionSuccessful'));
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
          message.error(t('view.failedToRetrieveRoleInformation'));
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
          message.success(t('view.additionSuccessful'));
        });
      } else {
        roleApi.UpdateRole(formData.value).then((data) => {
          const oldData = tableConfig.data.find((m) => m.roleId == data.roleId);
          if (oldData) {
            myCommon.objectReplace(oldData, data);
          }
          formClose();
          message.success(t('view.updateSuccessful'));
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
