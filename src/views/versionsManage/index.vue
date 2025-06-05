<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="isRunLoading">
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="versionsManageIndex"
        ref="tableRef"
        :auto-resize="true"
        :loading="loading"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="versionsManage_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="getVersions" type="primary">{{ t('view.query') }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="versionsManage_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">{{
                        t('view.newlyAddedSoftwareVersionType')
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
            <AuthDom auth="versionsManage_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                :title="t('view.edit')"
              />
            </AuthDom>
            <AuthDom auth="versionsManage_table_version">
              <IconFontClass
                name="icon-baseui-jichushezhi"
                @click="showHis(row)"
                style="color: #0a61bd"
                :title="t('view.versionManagement')"
              />
            </AuthDom>
            <AuthDom auth="versionsManage_table_delete">
              <IconFontClass
                name="icon-baseui-guanbicuowu"
                @click="remove(row)"
                style="color: red"
                :title="t('view.delete')"
              />
            </AuthDom>
          </div>
        </template>
        <template #isSync="{ row }">
          <a-space v-if="row.isSync != null">
            <span :style="{ color: row.isSync ? 'green' : 'red' }">{{
              row.isSync ? t('view.yes') : t('view.no')
            }}</span>
            <AuthDom auth="versionsManage_table_sync">
              <a-spin v-if="row.isRunSync != undefined" :spinning="row.isRunSync">
                <a-button
                  :title="t('view.setAsRunningVersion')"
                  type="primary"
                  size="small"
                  @click="syncChange(row)"
                  >{{ t('view.synchronizeVersion') }}</a-button
                >
              </a-spin>
              <a-button
                :title="t('view.setAsRunningVersion')"
                v-else
                type="primary"
                size="small"
                @click="syncChange(row)"
                >{{ t('view.synchronizeVersion') }}</a-button
              >
            </AuthDom>
          </a-space>
        </template>
        <template #runNumber="{ row }">
          <a
            v-if="row.runNumber !== null"
            :href="row.filePath"
            :download="row.filePath.split('/')[row.filePath.split('/').length - 1]"
            >{{ row.runNumber }}</a
          >
        </template>
      </vxe-grid>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="locale == 'zh-CN' ? 500 : 610"
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
            v-show="saveType == 'add'"
            :label="t('view.serviceType')"
            name="serviceType"
            :rules="[{ required: true, message: t('view.pleaseSelectSoftwareServiceType') }]"
          >
            <a-select
              show-search
              :filter-option="AntVueCommon.filterOption"
              :placeholder="t('view.pleaseSelectSoftwareServiceType')"
              v-model:value="formData.serviceType"
              :options="dictionariesData_add"
            />
          </a-form-item>
          <a-form-item
            name="runPlatform"
            :label="t('view.runningPlatform')"
            :rules="[{ required: true, message: t('view.pleaseSelectRunningPlatform') }]"
          >
            <a-select v-model:value="formData.runPlatform">
              <a-select-option :value="1"> Windows</a-select-option>
              <a-select-option :value="2"> Android</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            name="isBrowserDown"
            :label="t('view.browserDownload')"
            :rules="[
              {
                required: true,
                message: t(
                  'view.pleaseSelectWhetherTheDownloadableInstallationPackageCanBeBrowsed',
                ),
              },
            ]"
          >
            <a-switch v-model:checked="formData.isBrowserDown" />
          </a-form-item>
          <a-form-item
            name="orderIndex"
            :label="t('view.versionTypeSorting')"
            :rules="[
              { required: true, message: t('view.pleaseEnterVersionTypeSorting') },
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
              :placeholder="t('view.versionTypeSorting')"
              style="width: 300px"
              :precision="3"
              v-model:value="formData.orderIndex"
            />
          </a-form-item>
          <a-form-item
            v-if="formData.isBrowserDown"
            name="iconBase64"
            :label="t('view.logo')"
            :rules="[{ required: true, message: t('view.logoMissing') }]"
          >
            <a-upload
              style="margin-bottom: 20px"
              v-show="formData.isBrowserDown"
              :fileList="fileList"
              :maxCount="1"
              name="file"
              :multiple="false"
              accept=".png,.jpg,.jpeg"
              :before-upload="beforeUpload"
              @reject="fileReject"
            >
              <div v-if="formData.iconBase64">
                <img class="image-container" :src="formData.iconBase64" alt="avatar" />
              </div>
              <div
                v-else
                style="
                  display: flex;
                  position: relative;
                  align-items: center;
                  justify-content: center;
                  width: 100px;
                  height: 100px;
                  border: 1px dotted #666;
                  cursor: pointer;
                "
              >
                <IconFontClass
                  style="font-size: 25px"
                  name=" icon-baseui-yunshangchuan"
                  :title="t('view.upload')"
                />
              </div>
            </a-upload>
            <IconFontClass
              v-if="formData.iconBase64"
              style="position: absolute; top: 38px; font-size: 18px; cursor: pointer"
              name=" icon-baseui-delete"
              @click="
                () => {
                  fileList = [];
                  formData.iconBase64 = null;
                }
              "
              :title="t('view.delete')"
            />
          </a-form-item>
          <a-form-item name="configFilePath" :label="t('view.configurationFile')">
            <a-upload
              :fileList="configFileList"
              :maxCount="1"
              name="file"
              :multiple="false"
              accept=".zip,.rar"
              :before-upload="configBeforeUpload"
              @reject="configFileReject"
            >
              <div v-if="!myCommon.isnull(formData.configFilePath)" style="position: relative">
                <a-input
                  style="width: 300px"
                  :value="
                    formData.configFilePath.split('/')[
                      formData.configFilePath.split('/').length - 1
                    ]
                  "
                />
              </div>
              <div v-else>
                <a-input
                  style="width: 300px; cursor: pointer"
                  :placeholder="t('view.clickToSelectConfigurationFile')"
                />
              </div>
            </a-upload>
            <IconFontClass
              v-if="formData.configFilePath"
              style="margin-left: 4px; font-size: 18px; cursor: pointer"
              name=" icon-baseui-delete"
              @click="
                () => {
                  configFileList = [];
                  formData.configFilePath = null;
                }
              "
              :title="t('view.delete')"
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
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="1000"
        :visible="isShowVis"
        :title="t('view.versionManagement')"
        :footer-style="{ textAlign: 'right' }"
        @close="formCloseHis"
      >
        <his :versionId="versionId" />
      </a-drawer>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import myCommon from '@/utils/MyCommon/common';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import versionsApi from '@/api/versions';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import his from './his.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'VersionsManage' });
  const { prefixCls } = useDesign('versionsManage-');
  const loading = ref(true);
  const isRunLoading = ref(false);
  const tableConfig = reactive<VxeGridProps>({
    showOverflow: true,
    showHeaderOverflow: true,
    height: 'auto',
    columns: [
      //基础
      {
        field: 'seq_',
        type: 'seq',
        title: t('view.serialNumber'),
        minWidth: locale == 'zh-CN' ? 70 : 160,
        fixed: 'left',
      },
      {
        field: 'versionId',
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
        field: 'runNumber',
        title: t('view.officialVersion'),
        showOverflow: true,
        sortable: true,
        slots: {
          default: 'runNumber',
        },
        minWidth: 150,
      },
      {
        field: 'isForce',
        title: t('view.isForcedUpgradeRequired'),
        minWidth: 200,
        showOverflow: true,
        // sortable: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'isSync',
        title: t('view.isSynchronized'),
        minWidth: 220,
        showOverflow: true,
        // sortable: true,
        slots: {
          default: 'isSync',
        },
      },
      {
        field: 'syncTime',
        title: t('view.synchronizationTime'),
        minWidth: 200,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'syncUserName',
        title: t('view.synchronizingPersonnel'),
        minWidth: 220,
        showOverflow: true,
        sortable: true,
        visible: false,
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
        visible: false,
      },
      {
        field: 'createUser',
        title: t('view.creator'),
        minWidth: 130,
        showOverflow: true,
        sortable: true,
        visible: false,
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
        field: 'modifyUser',
        title: t('view.modifyUser'),
        visible: false,
        showOverflow: true,
        sortable: true,
        minWidth: 176,
      },
      {
        field: 'action_',
        title: t('view.action'),
        minWidth: 110,
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
    orderIndex: null,
    runPlatform: null,
    isBrowserDown: true,
    iconBase64: null,
    configFilePath: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const saveType = ref('edit');
  const isShowVis = ref(false);
  const dictionariesData_add = ref([]);
  const versionId = ref('');
  const fileList = ref([]);
  const configFileList = ref([]);

  getVersions();

  function showHis(row) {
    versionId.value = row.versionId;
    isShowVis.value = true;
  }

  function showFrom(row) {
    getServerTypes();
    fileList.value = [];
    configFileList.value = [];
    formData.value.iconBase64 = null;
    saveType.value = 'add';
    isShowForm.value = true;
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getVersion(row.versionId);
    }
  }

  //获取
  function getVersion(versionId) {
    isRunLoading.value = true;
    versionsApi
      .GetVersion(versionId.toString())
      .then((data) => {
        isRunLoading.value = false;
        if (data) {
          delete data.createTime;
          delete data.createUser;
          delete data.modifyTime;
          delete data.modifyUser;
          formData.value = data;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.getVersionInfoFailure'));
        }
      })
      .catch(() => {
        isRunLoading.value = false;
      });
  }

  //上传之前
  function beforeUpload(file) {
    fileList.value = [];
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (
      file.name.indexOf('.') == -1 ||
      !['png', 'jpg', 'jpeg'].includes(file.name.split('.')[file.name.split('.').length - 1])
    ) {
      message.warning(t('view.selectedFileTypeMismatch'));
    } else if (!isLt5M) {
      file['remove'] = true;
      message.error(t('view.logoShouldNotExceed', [5]));
    } else {
      fileList.value.push(file);
      myCommon.imgBase64(file).then((base64) => {
        formData.value.iconBase64 = base64;
        formRef.value.validate(['iconBase64']);
      });
    }
    return false;
  }
  //拖拽文件不符合 accept 类型时的回调
  function fileReject() {
    message.warning(t('view.selectedFileTypeMismatch'));
  }

  //拖拽文件不符合 accept 类型时的回调
  function configFileReject() {
    message.warning(t('view.selectedFileTypeMismatch'));
  }
  //上传之前
  function configBeforeUpload(file) {
    configFileList.value = [];
    const isLt5M = file.size / 1024 / 1024 < 20;
    if (
      file.name.indexOf('.') == -1 ||
      !['zip', 'rar'].includes(file.name.split('.')[file.name.split('.').length - 1])
    ) {
      message.warning(t('view.selectedFileTypeMismatch'));
    } else if (!isLt5M) {
      file['remove'] = true;
      message.error(t('view.softwarePackageShouldNotExceed', [20]));
    } else {
      configFileList.value.push(file);
      formData.value.configFilePath = file.name;
    }
    return false;
  }

  //删除软件包信息
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
        versionsApi
          .DeleteVersions(row.versionId)
          .then(() => {
            isRunLoading.value = false;
            tableConfig.data = tableConfig.data?.filter((m) => m.versionId != row.versionId);
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

  //关闭his
  function formCloseHis() {
    isShowVis.value = false;
    tableConfig.data = [];
    getVersions();
  }

  //获取软件包列表
  function getVersions() {
    loading.value = true;
    versionsApi
      .GetVersions({
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
      let _formData = new FormData();
      if (configFileList.value.length > 0) {
        _formData.append('configFile', configFileList.value[0]);
      }
      for (const key in formData.value) {
        _formData.append(key, formData.value[key]);
      }
      if (saveType.value == 'add') {
        versionsApi
          .AddVersions(_formData)
          .then(() => {
            fromSpinning.value = false;
            fileList.value = [];
            configFileList.value = [];
            getVersions();
            formClose();
            message.success(t('view.additionSuccessful'));
          })
          .catch(() => {
            fromSpinning.value = false;
          });
      } else {
        versionsApi
          .UpdateVersion(_formData)
          .then((data) => {
            fromSpinning.value = false;
            if (data) {
              message.success(t('view.updateSuccessful'));
              fileList.value = [];
              configFileList.value = [];
              formClose();
              getVersions();
            } else {
              message.error(t('view.updateFailure'));
            }
          })
          .catch(() => {
            fromSpinning.value = false;
          });
      }
    });
  }

  //获取字典
  function getServerTypes() {
    versionsApi
      .GetServerTypes()
      .then((data) => {
        dictionariesData_add.value = data;
      })
      .catch(() => {
        dictionariesData_add.value = [];
      });
  }

  //同步
  function syncChange(row) {
    row.isRunSync = true;
    versionsApi
      .UpdateRunVersions(row.versionId.toString())
      .then(() => {
        row.isRunSync = false;
        message.success(t('view.updateTerminalVersionSuccessfully'));
        getVersions();
      })
      .catch(() => {
        row.isRunSync = false;
      });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-versionsManage-';

  .tableBtn {
    width: 100%;
  }

  :deep(.ant-upload-list) {
    display: none;
  }

  .image-container {
    width: 100px;
    height: 100px;
  }

  .image-container::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid rgb(214 214 214);
    background-color: inherit;
  }
</style>
