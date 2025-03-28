<template>
  <MyContent>
    <a-spin :spinning="isRunLoading">
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="mqttService"
        :auto-resize="true"
        ref="tableRef"
        :loading="loading"
        :row-config="{ keyField: 'mqttId' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="mqttService_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="getMqtts" type="primary">{{ t('view.query') }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="mqttService_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">{{
                        t('view.newCommunication')
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
            <AuthDom auth="mqttService_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0a61bd"
                :title="t('view.edit')"
              />
            </AuthDom>
            <AuthDom auth="mqttService_table_delete">
              <IconFontClass
                name="icon-baseui-guanbicuowu"
                @click="remove(row)"
                style="color: red"
                :title="t('view.delete')"
              />
            </AuthDom>
          </div>
        </template>
        <template #ipport="{ row }">
          {{ row.mqttIp }}{{ row.mqttPort ? ':' + row.mqttPort : '' }}
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
            :label="t('view.serviceType')"
            name="serviceType"
            :rules="[{ required: true, message: t('view.pleaseSelectServiceType') }]"
          >
            <a-select
              :disabled="saveType != 'add'"
              show-search
              :filter-option="AntVueCommon.filterOption"
              :placeholder="t('view.pleaseSelectServiceType')"
              v-model:value="formData.serviceType"
              :options="dictionariesData"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.mailingAddress')"
            name="mqttIp"
            :rules="[
              { required: true, message: t('view.pleaseEnterCommunicationAddressIp') },
              { validator: formValidator.ip, message: t('view.communicationAddressIpIsIncorrect') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterCommunicationAddressIp')"
              v-model:value="formData.mqttIp"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.connectionPort')"
            name="mqttPort"
            :rules="[
              { required: true, message: t('view.pleaseEnterPortNumber') },
              {
                validator: formValidator.min,
                min: 1,
                message: t('view.portNumberMustBeBetweenAnd', [1, 65535]),
              },
              {
                validator: formValidator.max,
                max: 65535,
                message: t('view.portNumberMustBeBetweenAnd', [1, 65535]),
              },
            ]"
          >
            <a-input-number
              :placeholder="t('view.pleaseEnterPortNumber')"
              v-model:value="formData.mqttPort"
              style="width: 100px"
              :precision="0"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.connectionUserName')"
            name="mqttName"
            :rules="[{ required: true, message: t('view.pleaseEnterConnectionUserName') }]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterConnectionUserName')"
              v-model:value="formData.mqttName"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.connectionPassword')"
            name="mqttPwd"
            :rules="[{ required: true, message: t('view.pleaseEnterConnectionPassword') }]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterConnectionPassword')"
              v-model:value="formData.mqttPwd"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="orderIndex"
            :label="t('view.sorting')"
            :rules="[
              { required: true, message: t('view.pleaseInputSorting') },
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
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import mqttApi from '@/api/mqttService';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'MqttService' });
  const { prefixCls } = useDesign('mqttService-');
  const loading = ref(true);
  const isRunLoading = ref(false);
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
      },
      {
        field: 'mqttId',
        title: t('view.recordId'),
        sortable: true,
        visible: false,
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'serviceTypeName',
        title: t('view.serviceTypeName'),
        showOverflow: true,
        sortable: true,
        minWidth: 186,
        fixed: 'left',
      },
      {
        field: 'mqttIp',
        title: t('view.mailingAddress'),
        showOverflow: true,
        sortable: true,
        slots: {
          default: 'ipport',
        },
        minWidth: 200,
      },
      {
        field: 'mqttName',
        title: t('view.connectionUserName'),
        showOverflow: true,
        sortable: true,
        minWidth: 240,
      },
      {
        field: 'mqttPwd',
        title: t('view.connectionPassword'),
        showOverflow: true,
        minWidth: 240,
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
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyUser',
        title: t('view.modifier'),
        minWidth: 176,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'action_',
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
    serviceType: null,
    mqttIp: null,
    mqttPort: null,
    mqttName: null,
    mqttPwd: null,
    orderIndex: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const dictionariesData = ref([]);

  getMqtts();

  function showFrom(row) {
    if (myCommon.isnull(row)) {
      getServerTypes();
      saveType = 'add';
      isShowForm.value = true;
    } else {
      getServerTypes(row.serviceType);
      //编辑
      getByid(row.mqttId);
    }
  }

  //删除通信类型信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      okText: t('view.confirm'),
      cancelText: t('view.cancel'),
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunLoading.value = true;
        mqttApi
          .DeleteMqtt(row.mqttId)
          .then(() => {
            isRunLoading.value = false;
            tableConfig.data = tableConfig.data?.filter((m) => m.mqttId != row.mqttId);
            message.success(t('view.deletionSuccessful'));
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
    isShowForm.value = false;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //获取通信列表
  function getMqtts() {
    loading.value = true;
    mqttApi
      .GetMqtts({
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
        mqttApi.AddMqtt(formData.value).then((data) => {
          data.serviceTypeName = dictionariesData.value.find(
            (m) => m.key == data.serviceType,
          )?.label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
        });
      } else {
        mqttApi.UpdateMqtt(formData.value).then((data) => {
          const oldData = tableConfig.data.find((m) => m.mqttId == data.mqttId);
          if (oldData) {
            delete data.createtTime;
            delete data.createUser;
            myCommon.objectReplace(oldData, data);
            oldData.modifyTime = data.modifyTime;
            oldData.modifyUser = data.modifyUser;
            oldData.serviceTypeName = dictionariesData.value.find(
              (m) => m.key == data.serviceType,
            )?.label;
          }
          formClose();
          message.success(t('view.updateSuccessful'));
        });
      }
    });
  }

  //获取服务类型字典
  function getServerTypes(dictionariesId = null) {
    mqttApi
      .GetServerTypes(dictionariesId)
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
  }

  function getByid(id) {
    isRunLoading.value = true;
    mqttApi
      .GetMqtt(id)
      .then((data) => {
        isRunLoading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.failedToObtainCommunicationInformation'));
        }
      })
      .catch(() => {
        isRunLoading.value = false;
      });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-mqttService-';

  .tableBtn {
    width: 100%;
  }
</style>
