<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="equipmentManage"
      :auto-resize="true"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'equipmentId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      @sort-change="
        ({ sortList }) =>
          vxetableMyCommon.onSortChange({ sortList }, page, getEquipments, [
            'orgName',
            'equipmentTypeName',
            'equipmentName',
            'systemTypeName',
          ])
      "
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
    >
      <template #pager>
        <vxe-pager
          background
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="page.total"
          @page-change="getEquipments()"
        />
      </template>
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" align="start" style="margin: 0 5px">
            <AuthDom auth="equipmentManage_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.affiliatedDepartment') }}：</label>
                    <a-tree-select
                      v-model:value="seacthContent.orgId"
                      show-search
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
                    <label>{{ t('view.deviceName') }}：</label>
                    <a-input
                      :style="{
                        width: locale == 'zh-CN' ? '180px' : locale == 'en-US' ? '200px' : '350px',
                      }"
                      @press-enter="initPage"
                      v-model:value="seacthContent.equipmentName"
                      :placeholder="t('view.inputDeviceNameQuery')"
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
            <AuthDom auth="equipmentManage_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">{{
                      t('view.addDevice')
                    }}</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="equipmentManage_table_edit">
            <IconFontClass
              name="icon-baseui-edit-fill"
              @click="showFrom(row)"
              style="color: #0a61bd"
              :title="t('view.edit')"
            />
          </AuthDom>
          <AuthDom auth="equipmentManage_table_delete">
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
          name="equipmentNameCn"
          :label="t('view.deviceNameCn')"
          :rules="[
            { required: true, message: '' },
            { max: 64, message: t('view.deviceNameIsTooLong', [64]) },
            { validator: formValidator.empty, message: t('view.pleaseEnterDeviceName') },
          ]"
        >
          <a-input
            v-model:value="formData.equipmentNameCn"
            :placeholder="t('view.pleaseEnterDeviceName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="equipmentNameEn"
          :label="t('view.deviceNameEn')"
          :rules="[
            { required: true, message: '' },
            { max: 250, message: t('view.deviceNameIsTooLong', [250]) },
            { validator: formValidator.empty, message: t('view.pleaseEnterDeviceName') },
          ]"
        >
          <a-input
            v-model:value="formData.equipmentNameEn"
            :placeholder="t('view.pleaseEnterDeviceName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="equipmentNameFr"
          :label="t('view.deviceNameFr')"
          :rules="[
            { required: true, message: '' },
            { max: 250, message: t('view.deviceNameIsTooLong', [250]) },
            { validator: formValidator.empty, message: t('view.pleaseEnterDeviceName') },
          ]"
        >
          <a-input
            v-model:value="formData.equipmentNameFr"
            :placeholder="t('view.pleaseEnterDeviceName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          :label="t('view.deviceType')"
          name="equipmentType"
          :rules="[{ required: true, message: t('view.pleaseSelectDeviceType') }]"
        >
          <a-select
            :placeholder="t('view.pleaseSelectDeviceType')"
            show-search
            :filter-option="AntVueCommon.filterOption"
            v-model:value="formData.equipmentType"
            :options="dictionariesData.filter((m) => m.dictionariesClass == 'equipmentType')"
          />
        </a-form-item>
        <a-form-item
          :label="t('view.systemType')"
          name="systemType"
          :rules="[{ required: true, message: t('view.pleaseSelectSystemType') }]"
        >
          <a-select
            show-search
            :filter-option="AntVueCommon.filterOption"
            :placeholder="t('view.pleaseSelectSystemType')"
            v-model:value="formData.systemType"
            :options="dictionariesData.filter((m) => m.dictionariesClass == 'systemType')"
          />
        </a-form-item>
        <a-form-item
          name="address"
          :label="t('view.deviceAddress')"
          :rules="[
            { required: true, message: '' },
            { max: 50, message: t('view.deviceAddressIsTooLong') },
            { validator: formValidator.empty, message: t('view.pleaseEnterDeviceAddress') },
          ]"
        >
          <a-input
            v-model:value="formData.address"
            :placeholder="t('view.pleaseEnterDeviceAddress')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          :label="t('view.deviceSorting')"
          :rules="[
            { required: true, message: t('view.pleaseEnterDeviceSorting') },
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
            :placeholder="t('view.pleaseEnterDeviceSorting')"
            style="width: 300px"
            :precision="3"
            v-model:value="formData.orderIndex"
          />
        </a-form-item>
        <a-form-item
          name="remark"
          :label="t('view.remarks')"
          :rules="[{ max: 250, message: t('view.remarksTooLong') }]"
        >
          <a-textarea
            :placeholder="t('view.pleaseInputRemarkInformation')"
            :rows="3"
            v-model:value="formData.remark"
            autocomplete="off"
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
  import formValidator from '@/utils/MyCommon/formValidator';
  import vxetableMyCommon from '@/utils/MyCommon/VxetableMyCommon';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import equipmentApi from '@/api/equipment';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import dictionariesApi from '@/api/dictionaries';
  import organizationApi from '@/api/organization';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'EquipmentManage' });
  const { prefixCls } = useDesign('equipment-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      {
        type: 'seq',
        title: t('view.serialNumber'),
        minWidth: locale == 'zh-CN' ? 70 : 160,
        fixed: 'left',
      },
      {
        field: 'equipmentId',
        title: t('view.recordId'),
        visible: false,
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'orgName',
        title: t('view.departmentName'),
        showOverflow: true,
        sortable: true,
        minWidth: 176,
        fixed: 'left',
      },
      {
        field: 'equipmentTypeName',
        title: t('view.hardwareType'),
        showOverflow: true,
        sortable: true,
        minWidth: 146,
      },
      {
        field: 'equipmentName',
        title: t('view.deviceName'),
        showOverflow: true,
        sortable: true,
        minWidth: 176,
      },
      {
        field: 'equipmentNameCn',
        title: t('view.deviceNameCn'),
        showOverflow: true,
        sortable: true,
        minWidth: 226,
        visible: false,
      },
      {
        field: 'equipmentNameEn',
        title: t('view.deviceNameEn'),
        showOverflow: true,
        sortable: true,
        minWidth: 226,
        visible: false,
      },
      {
        field: 'equipmentNameFr',
        title: t('view.deviceNameFr'),
        showOverflow: true,
        sortable: true,
        minWidth: 236,
        visible: false,
      },
      {
        field: 'systemTypeName',
        title: t('view.systemType'),
        showOverflow: true,
        sortable: true,
        minWidth: 166,
      },
      {
        field: 'address',
        title: t('view.deviceAddress'),
        showOverflow: true,
        sortable: true,
        minWidth: 166,
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
        field: 'remark',
        title: t('view.remarks'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 120,
      },
      {
        field: 'createTime',
        title: t('view.creationTime'),
        minWidth: 150,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'createUserName',
        title: t('view.creator'),
        minWidth: 130,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyTime',
        title: t('view.modificationTime'),
        minWidth: 170,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyUserName',
        title: t('view.modifier'),
        minWidth: 176,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        title: t('view.action'),
        minWidth: 90,
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
    equipmentNameCn: null,
    equipmentNameEn: null,
    equipmentNameFr: null,
    projectid: 1,
    equipmentType: null,
    systemType: null,
    address: null,
    remark: null,
    orderIndex: null,
    orgId: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const dictionariesData = ref([]);
  const seacthContent = ref({
    orgId: null,
    equipmentName: '',
  });
  const organizationDatas = ref([]);
  let _organizationDatas = [];
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['orgOrderIndex asc', 'dicOrderIndex asc', 'orderIndex asc'],
  });

  getOrganization();
  getEquipments();

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      orgId: null,
      equipmentName: '',
    };
  }

  function showFrom(row) {
    getOrganization();
    getDictionaries();
    if (myCommon.isnull(row)) {
      saveType = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getByid(row.equipmentId);
    }
  }

  //删除设备信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        equipmentApi
          .DeleteEquipment(row.equipmentId)
          .then(() => {
            loading.value = false;
            message.success(t('view.deletionSuccessful'));
            getEquipments();
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

  function initPage() {
    page.current = 1;
    page.total = 0;
    getEquipments();
  }

  //获取设备列表
  function getByid(id) {
    loading.value = true;
    equipmentApi
      .GetEquipment(id)
      .then((data) => {
        loading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.failedToRetrieveDeviceInformation'));
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }

  //获取设备列表
  function getEquipments() {
    loading.value = true;
    equipmentApi
      .GetEquipments({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
        FullSort: page.sortlist.join(','),
        PageIndex: page.current,
        PageSize: page.size,
      })
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

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      const execompleteBefore = () => {
        fromSpinning.value = false;
      };
      formData.value['execompleteBefore'] = execompleteBefore;
      if (saveType == 'add') {
        equipmentApi.AddEquipment(formData.value).then((data) => {
          data.equipmentTypeName = dictionariesData.value.find(
            (m) => m.key == data.equipmentType,
          )?.label;
          data.systemTypeName = dictionariesData.value.find((m) => m.key == data.systemType)?.label;
          data.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
          page.total = page.total + 1;
        });
      } else {
        equipmentApi.UpdateEquipment(formData.value).then((data) => {
          const oldData = tableConfig.data.find((m) => m.equipmentId == data.equipmentId);
          if (oldData) {
            delete formData.value.createUserName;
            delete formData.value.createTime;
            myCommon.objectReplace(oldData, formData.value);
            oldData.modifyTime = data.modifyTime;
            oldData.modifyUserName = data.modifyUserName;
            oldData.equipmentTypeName = dictionariesData.value.find(
              (m) => m.key == data.equipmentType,
            )?.label;
            oldData.systemTypeName = dictionariesData.value.find(
              (m) => m.key == data.systemType,
            )?.label;
            oldData.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          }
          formClose();
          message.success('更新设备信息成功');
        });
      }
    });
  }

  function getDictionaries() {
    dictionariesApi
      .GetDictionariesSimple({
        execompleteBefore: () => {
          loading.value = false;
        },
        dictionariesClass: ['equipmentType', 'systemType'],
      })
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
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
  @prefixCls: ~'@{namespace}-equipment-';

  .tableBtn {
    width: 100%;
  }
</style>
