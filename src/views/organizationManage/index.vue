<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="isRunLoading">
      <div style="width: 100%; height: 100%">
        <vxe-toolbar ref="toolbarRef" custom>
          <template #buttons>
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="organizationManage_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.departmentName') }}：</label>
                      <a-input
                        @press-enter="getOrganizations"
                        v-model:value="seacthContent.orgName"
                        :placeholder="t('view.enterDepartmentNameToSearch')"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="getOrganizations" type="primary">{{
                        t('view.query')
                      }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom v-if="userData.adminType < 3" auth="organizationManage_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom('add', null, null)">{{
                        t('view.addADepartment')
                      }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
            </a-space>
          </template>
        </vxe-toolbar>
        <div style="width: 100%; height: calc(100% - 62px)">
          <vxe-table
            :show-overflow="true"
            :show-header-overflow="true"
            id="organizationManage"
            :scroll-y="{ enabled: true }"
            :auto-resize="true"
            :border="true"
            height="100%"
            ref="tableRef"
            :loading="loading"
            :custom-config="{ storage: true }"
            :row-config="{ isHover: true, useKey: true, keyField: 'orgId' }"
            :column-config="{ resizable: true }"
            :tree-config="{ transform: true, rowField: 'orgId', parentField: 'parentId' }"
            :data="tableConfigData"
          >
            <vxe-column
              type="seq"
              :title="t('view.serialNumber')"
              :minWidth="locale == 'zh-CN' ? 70 : 160"
              fixed="left"
            />
            <vxe-column
              field="orgId"
              :title="t('view.recordId')"
              :visible="false"
              :minWidth="136"
              fixed="left"
            />
            <vxe-column
              field="orgName"
              :title="t('view.departmentName')"
              tree-node
              :minWidth="210"
              fixed="left"
            />
            <vxe-column field="orgNameCn" :title="t('view.departmentNameCn')" :minWidth="210" />
            <vxe-column field="orgNameEn" :title="t('view.departmentNameEn')" :minWidth="210" />
            <vxe-column field="orgNameFr" :title="t('view.departmentNameFr')" :minWidth="210" />
            <vxe-column
              field="typeLineOrStationId"
              :title="t('view.departmentManagesLinesOrStations')"
              width="200"
              :visible="false"
            >
              <template #default="{ row }">
                <span>
                  {{
                    _lintStationDats.find((m) => m.key == row.typeLineOrStationId)
                      ? _lintStationDats.find((m) => m.key == row.typeLineOrStationId).title
                      : ''
                  }}</span
                >
              </template>
            </vxe-column>
            <vxe-column
              field="orderIndex"
              :title="t('view.sorting')"
              :visible="false"
              :minWidth="100"
            />
            <vxe-column field="createTime" :title="t('view.creationTime')" :minWidth="150" />
            <vxe-column field="createUser" :title="t('view.creator')" :minWidth="130" />
            <vxe-column field="modifyTime" :title="t('view.modificationTime')" :minWidth="170" />
            <vxe-column field="modifyUser" :title="t('view.modifier')" :minWidth="130" />
            <vxe-column field="action_" :title="t('view.action')" :minWidth="140" fixed="right">
              <template #default="{ row }">
                <div :class="`tableStyle`">
                  <AuthDom auth="organizationManage_table_add">
                    <IconFontClass
                      name="icon-baseui-tianjiawukuang"
                      @click="showFrom('add', row, row.orgId)"
                      style="color: #0a61bd"
                      :title="t('view.addSubLevel')"
                    />
                  </AuthDom>
                  <AuthDom auth="organizationManage_table_edit">
                    <IconFontClass
                      name="icon-baseui-edit-fill"
                      @click="showFrom('edit', row, row.parentId)"
                      style="color: #0a61bd"
                      :title="t('view.edit')"
                    />
                  </AuthDom>
                  <AuthDom auth="organizationManage_table_delete">
                    <IconFontClass
                      name="icon-baseui-guanbicuowu"
                      @click="remove(row)"
                      style="color: red"
                      :title="t('view.delete')"
                    />
                  </AuthDom>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
    </a-spin>
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
        <a-form-item name="parentId" :label="t('view.superiorDepartment')">
          <a-tree-select
            v-model:value="formData.parentId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :placeholder="t('view.pleaseSelectTheSuperiorDepartment')"
            allow-clear
            show-arrow
            :filterTreeNode="AntVueCommon.filterTreeNode"
            :tree-data="organizationDatas"
          />
        </a-form-item>
        <a-form-item
          name="orgNameCn"
          :label="t('view.departmentNameCn')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.departmentNameTooLong') },
            { validator: formValidator.empty, message: t('view.pleaseEnterDepartmentName') },
          ]"
        >
          <a-input
            v-model:value="formData.orgNameCn"
            :placeholder="t('view.pleaseEnterDepartmentName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="orgNameEn"
          :label="t('view.departmentNameEn')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.departmentNameTooLong') },
            { validator: formValidator.empty, message: t('view.pleaseEnterDepartmentName') },
          ]"
        >
          <a-input
            v-model:value="formData.orgNameEn"
            :placeholder="t('view.pleaseEnterDepartmentName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="orgNameFr"
          :label="t('view.departmentNameFr')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.departmentNameTooLong') },
            { validator: formValidator.empty, message: t('view.pleaseEnterDepartmentName') },
          ]"
        >
          <a-input
            v-model:value="formData.orgNameFr"
            :placeholder="t('view.pleaseEnterDepartmentName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item :label="t('view.jurisdictionalLinesAndStations')" name="typeLineOrStationId">
          <a-tree-select
            v-model:value="formData.typeLineOrStationId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :placeholder="t('view.pleaseSelectDepartmentManagedLinesOrStations')"
            allow-clear
            show-arrow
            :filterTreeNode="AntVueCommon.filterTreeNode"
            :tree-data="lintStationDats"
          />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          :label="t('view.sorting')"
          :rules="[
            { required: true, message: t('view.pleaseEnterDepartmentSorting') },
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
            style="width: 300px"
            v-model:value="formData.orderIndex"
            :placeholder="t('view.pleaseInputSorting')"
            autocomplete="off"
            :precision="3"
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
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import organizationApi from '@/api/organization';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '@/store/modules/user';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;

  defineOptions({ name: 'OrganizationManage' });
  const userStore = useUserStore();
  const userData = ref(_.cloneDeep(userStore.getUserInfo));
  const { prefixCls } = useDesign('organizationManage-');
  const loading = ref(true);
  const isRunLoading = ref(false);
  const tableConfigData = ref([]);
  const defFromData = reactive({
    orgNameCn: null,
    orgNameEn: null,
    orgNameFr: null,
    orderIndex: null,
    parentId: null,
    typeLineOrStationId: null,
    idType: null,
    lineOrStationId: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref({});
  const tableRef = ref({});
  const toolbarRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const seacthContent = ref({
    orgName: null,
  });
  const lintStationDats = ref([]);
  const _lintStationDats = ref([]);
  const organizationDatas = ref([]);

  let saveType = 'add';

  getOrganizations();
  getLineStationTree();
  getLineStationSimple();

  function showFrom(type, row, pid) {
    getOrganizationTree();
    saveType = type;
    if (type == 'add') {
      isShowForm.value = true;
      formData.value.parentId = pid;
    } else {
      //编辑
      getByid(row.orgId);
    }
  }

  //删除部门信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: t('view.deletingThisSubsetDataWillAlsoDeleteItAreYouSure'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunLoading.value = true;
        organizationApi
          .DeleteOrganization(row.orgId)
          .then((data) => {
            isRunLoading.value = false;
            try {
              if (data) {
                tableConfigData.value = tableConfigData.value?.filter(
                  (m) => data.indexOf(m.orgId) == -1,
                );
              }
              message.success(t('view.deletionSuccessful'));
            } catch (error) {}
          })
          .catch(() => {
            isRunLoading.value = false;
          });
      },
      onCancel() {},
    });
  }

  //关闭表单
  function formClose() {
    formData.value = _.cloneDeep(defFromData);
    isShowForm.value = false;
    formRef.value.clearValidate();
  }

  //获取部门
  function getByid(id) {
    isRunLoading.value = true;
    organizationApi
      .GetOrganization(id.toString())
      .then((data) => {
        isRunLoading.value = false;
        if (data) {
          data.parentId = data.parentId == 0 ? null : data.parentId;
          formData.value = data;
          formData.value.idType = null;
          formData.value.lineOrStationId = null;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.failedToRetrieveDepartmentInformation'));
        }
      })
      .catch(() => {
        isRunLoading.value = false;
      });
  }

  //获取列表
  function getOrganizations() {
    loading.value = true;
    organizationApi
      .GetOrganizations({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfigData.value = data;
        nextTick(() => {
          tableRef.value.setAllTreeExpand(true);
        });
      })
      .catch(() => {
        tableConfigData.value = [];
      });
  }

  //获取调度服务数据的线路和车站的上下级列表
  function getLineStationTree() {
    organizationApi.GetLineStationTree().then((data) => {
      lintStationDats.value = data;
    });
  }
  function getLineStationSimple() {
    organizationApi.GetLineStationSimple().then((data) => {
      _lintStationDats.value = data;
    });
  }

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      formData.value.execompleteBefore = () => {
        fromSpinning.value = false;
      };
      if (formData.value.typeLineOrStationId != null) {
        formData.value.idType = parseInt(formData.value.typeLineOrStationId.split('_')[0]);
        formData.value.lineOrStationId = parseInt(formData.value.typeLineOrStationId.split('_')[1]);
      }
      const d = _.cloneDeep(formData.value);
      d.parentId = d.parentId == null ? 0 : d.parentId;
      if (saveType == 'add') {
        organizationApi.AddOrganization(d).then((data) => {
          tableConfigData.value.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
        });
      } else {
        organizationApi.UpdateOrganization(d).then((data) => {
          const oldData = tableConfigData.value.find((m) => m.orgId == data.orgId);
          if (oldData && oldData.parentId == data.parentId) {
            delete data.createtTime;
            delete data.createUser;
            myCommon.objectReplace(oldData, data);
          } else {
            getOrganizations();
          }
          formClose();
          message.success(t('view.updateSuccessful'));
        });
      }
    });
  }

  //获取部门
  function getOrganizationTree() {
    organizationApi.GetOrganizationTree({}).then((data) => {
      organizationDatas.value = data;
    });
  }

  watch(
    () => formData.value.parentId,
    () => {
      if (isShowForm.value && formData.value.parentId == formData.value.orgId) {
        formData.value.parentId = null;
        message.warning(t('view.parentCannotBeItself'));
      }
    },
  );

  onMounted(() => {
    // 将表格和工具栏进行关联
    const $table = tableRef.value;
    const $toolbar = toolbarRef.value;
    if ($table && $toolbar) {
      $table.connect($toolbar);
    }
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-organizationManage-';

  .@{prefixCls} {
    overflow-x: hidden;

    .@{prefixCls}tableBtn {
      width: 100%;
    }
  }
</style>
