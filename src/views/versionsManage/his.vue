<template>
  <div style="height: 100%">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="versionsManageHis"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'hisId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="versionsManage_his_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getVersionsHis" type="primary">{{
                      t('view.query')
                    }}</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="versionsManage_his_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">{{
                      t('view.addNewVersion')
                    }}</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #isSync="{ row }">
        <a-space v-if="row.isSync != null">
          <span :style="{ color: row.isSync ? 'green' : 'red' }">{{
            row.isSync ? t('view.yes') : t('view.no')
          }}</span>
          <AuthDom auth="versionsManage_his_table_sync">
            <a-button
              :title="t('view.setAsRunningVersion')"
              type="primary"
              size="small"
              @click="syncChange(row)"
              >{{ t('view.synchronizeVersion') }}</a-button
            >
          </AuthDom>
        </a-space>
      </template>
      <template #isForce="{ row }">
        <a-space v-if="row.isForce != null">
          <span :style="{ color: row.isForce ? 'green' : 'red' }">{{
            row.isForce ? t('view.yes') : t('view.no')
          }}</span>
          <AuthDom auth="versionsManage_his_table_force">
            <a-button type="primary" size="small" @click="upgradeChange(row)">{{
              t('view.forcedUpgrade')
            }}</a-button>
          </AuthDom>
        </a-space>
      </template>
      <template #vNumber="{ row }">
        <a
          v-if="row.vNumber !== null"
          :href="row.filePath"
          :download="row.filePath.split('/')[row.filePath.split('/').length - 1]"
          >{{ row.vNumber }}</a
        >
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="locale == 'zh-CN' ? 500 : 610"
      :visible="isShowForm"
      :title="t('view.uploadVersionFile')"
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
          name="filePath"
          :label="t('view.versionFile')"
          :rules="[{ required: true, message: t('view.pleaseUploadVersionFile') }]"
        >
          <a-upload
            :fileList="fileList"
            :maxCount="1"
            name="file"
            :multiple="false"
            accept=".zip,.rar,.apk"
            :before-upload="beforeUpload"
            @reject="fileReject"
          >
            <div v-if="!myCommon.isnull(formData.filePath)" style="position: relative">
              <a-input
                style="width: 300px; cursor: pointer"
                :value="formData.filePath.split('/')[formData.filePath.split('/').length - 1]"
              />
              <div
                style="
                  position: absolute;
                  z-index: 20;
                  top: 0;
                  left: 0;
                  width: 300px;
                  height: 32px;
                  cursor: pointer;
                "
              >
              </div>
            </div>
            <div v-else>
              <a-input
                style="width: 300px; cursor: pointer"
                :placeholder="t('view.clickToSelectVersionFile')"
              />
            </div>
          </a-upload>
          <IconFontClass
            v-if="formData.filePath"
            style="margin-left: 4px; font-size: 18px; cursor: pointer"
            name=" icon-baseui-delete"
            @click="
              () => {
                fileList = [];
                formData.filePath = null;
                formData.vNumber = null;
              }
            "
            :title="t('view.delete')"
          />
        </a-form-item>
        <a-form-item
          :label="t('view.versionNumber')"
          name="vNumber"
          :rules="[
            { required: true, message: '' },
            { validator: formValidator.empty, message: t('view.pleaseEnterVersionNumber') },
            { max: 20, message: t('view.versionNumberTooLong', [20]) },
          ]"
        >
          <a-input
            disabled
            :placeholder="t('view.versionFileNameShouldContainVersionNumber')"
            :value="formData.vNumber"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="isRun"
          :label="t('view.isTerminalVersion')"
          :rules="[{ required: true, message: t('view.pleaseSelectWhetherTerminalVersion') }]"
        >
          <a-switch v-model:checked="formData.isRun" />
        </a-form-item>
        <a-form-item
          name="isForce"
          :label="t('view.isMandatoryUpgrade')"
          :rules="[{ required: true, message: t('view.pleaseSelectWhetherMandatoryUpgrade') }]"
        >
          <a-switch v-model:checked="formData.isForce" />
        </a-form-item>
        <a-form-item
          name="remark"
          :label="t('view.remarks')"
          :rules="[{ max: 250, message: t('view.remarksTooLong', [250]) }]"
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
          <a-button type="primary" @click="saveFrom()">{{ t('view.save') }}</a-button>
          <a-button style="margin-left: 8px" @click="formClose">{{ t('view.close') }}</a-button>
        </a-spin>
      </template>
    </a-drawer>
  </div>
</template>
<script setup lang="ts">
  import myCommon from '@/utils/MyCommon/common';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import versionsApi from '@/api/versions';
  import { message } from 'ant-design-vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  //vue3使用defineProps接收传过来的参数
  const props = defineProps({
    //增加组件
    versionId: {
      type: String,
      default() {
        return null;
      },
    },
  });
  const { prefixCls } = useDesign('versionsManage-his');
  const loading = ref(true);
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
      },
      {
        field: 'hisId',
        title: t('view.recordId'),
        sortable: true,
        visible: false,
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'vNumber',
        title: t('view.versionNumber'),
        minWidth: locale == 'zh-CN' ? 100 : 150,
        showOverflow: true,
        slots: {
          default: 'vNumber',
        },
      },
      {
        field: 'isRun',
        title: t('view.isTerminalVersion'),
        minWidth: locale == 'zh-CN' ? 120 : 220,
        showOverflow: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'isForce',
        title: t('view.isForcedUpgradeRequired'),
        minWidth: locale == 'zh-CN' ? 120 : 220,
        showOverflow: true,
        slots: {
          default: 'isForce',
        },
      },
      {
        field: 'isSync',
        title: t('view.isSynchronized'),
        minWidth: 220,
        showOverflow: true,
        slots: {
          default: 'isSync',
        },
      },
      {
        field: 'syncTime',
        title: t('view.synchronizationTime'),
        minWidth: locale == 'zh-CN' ? 150 : 176,
        showOverflow: true,
      },
      {
        field: 'syncUserName',
        title: t('view.synchronizingPersonnel'),
        minWidth: locale == 'zh-CN' ? 100 : 220,
        showOverflow: true,
        visible: false,
      },
      {
        field: 'remark',
        title: t('view.remarks'),
        showOverflow: true,
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'createTime',
        title: t('view.creationTime'),
        minWidth: 150,
        showOverflow: true,
        visible: false,
      },
      {
        field: 'createUser',
        title: t('view.creator'),
        minWidth: 130,
        showOverflow: true,
        visible: false,
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
    vNumber: null,
    isRun: false,
    remark: '',
    versionId: null,
    isForce: false,
    filePath: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const fileList = ref([]);

  function showFrom() {
    formData.value.versionId = props.versionId;
    fileList.value = [];
    isShowForm.value = true;
  }

  //关闭表单
  function formClose() {
    isShowForm.value = false;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //获取软件包列表
  function getVersionsHis() {
    if (props.versionId) {
      loading.value = true;
      versionsApi
        .GetVersionsHis(props.versionId)
        .then((data) => {
          loading.value = false;
          tableConfig.data = data;
        })
        .catch(() => {
          loading.value = false;
          tableConfig.data = [];
        });
    }
  }

  //拖拽文件不符合 accept 类型时的回调
  function fileReject() {
    message.warning(t('view.selectedFileTypeMismatch'));
  }

  //上传之前
  function beforeUpload(file) {
    fileList.value = [];
    const isLt5M = file.size / 1024 / 1024 < 100;
    if (
      file.name.indexOf('.') == -1 ||
      !['zip', 'rar', 'apk'].includes(file.name.split('.')[file.name.split('.').length - 1])
    ) {
      message.warning(t('view.selectedFileTypeMismatch'));
    } else if (!isLt5M) {
      file['remove'] = true;
      message.error(t('view.softwarePackageShouldNotExceed', [100]));
    } else {
      fileList.value.push(file);
      formData.value.filePath = file.name;
      formData.value.vNumber = formData.value.filePath
        .split('_')
        [
          formData.value.filePath.split('_').length - 1
        ].substring(0, formData.value.filePath.split('_')[formData.value.filePath.split('_').length - 1].lastIndexOf('.'));
      formRef.value.validate();
    }
    return false;
  }

  //保存
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      let _formData = new FormData();
      _formData.append('file', fileList.value[0]);
      for (const key in formData.value) {
        _formData.append(key, formData.value[key]);
      }
      versionsApi
        .AddVersionsHis(_formData)
        .then((data) => {
          fileList.value = [];
          fromSpinning.value = false;
          formClose();
          message.success(t('view.additionSuccessful'));
          if (data.mqttMsg) {
            data.syncSuccess ? message.success(data.mqttMsg) : message.error(data.mqttMsg);
          }
          getVersionsHis();
        })
        .catch(() => {
          fromSpinning.value = false;
        });
    });
  }

  //同步
  function syncChange(row) {
    loading.value = true;
    versionsApi
      .UpdateRunVersionsHis(row.hisId.toString())
      .then(() => {
        loading.value = false;
        message.success(t('view.updateTerminalVersionSuccessfully'));
        getVersionsHis();
      })
      .catch(() => {
        loading.value = false;
      });
  }

  //强制升级
  function upgradeChange(row) {
    loading.value = true;
    versionsApi
      .UpdateForceHis({
        id: row.hisId,
        force: !row.isForce,
      })
      .then((data) => {
        loading.value = false;
        if (data) {
          row.isForce = !row.isForce;
          message.success(t('view.updateSuccessful'));
        } else {
          message.success(t('view.updateFailure'));
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }

  watch(
    () => props.versionId,
    () => {
      getVersionsHis();
    },
    { immediate: true },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-versionsManage-his-';

  .tableBtn {
    width: 100%;
  }

  :deep(.ant-upload-list) {
    display: none;
  }
</style>
