<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="versionsManageIndex"
      ref="tableRef"
      :auto-resize="true"
      :loading="loading"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      :row-config="{ keyField: 'lincesId' }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="lincesInfoFile_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">{{
                      t('view.uploadAuthorizationFile')
                    }}</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #bindClientType="{ row }">
        {{ t('view.' + row.bindClientType) }}
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="locale == 'zh-CN' ? 500 : 580"
      :visible="isShowForm"
      :title="t('view.configuration')"
      :footer-style="{ textAlign: 'right' }"
      @close="formClose"
    >
      <a-form
        :label-col="{ span: locale == 'zh-CN' ? 8 : 10 }"
        :style="{ paddingRight: '2px' }"
        autocomplete="off"
        ref="formRef"
      >
        <a-form-item name="lincesFilePaths" :label="t('view.authorizationInformationFile')">
          <a-upload
            :fileList="configFileList"
            :maxCount="1"
            name="files"
            :multiple="false"
            accept=".linces"
            :before-upload="configBeforeUpload"
            @reject="configFileReject"
            @remove="fileRemove"
          >
            <div>
              <a-input
                style="width: 300px; cursor: pointer"
                :placeholder="t('view.clickToSelectTheAuthorizationInformationFile')"
              />
            </div>
          </a-upload>
          <IconFontClass
            v-if="configFileList.length > 0"
            style="position: absolute; top: 1px; left: 304px; font-size: 18px; cursor: pointer"
            name=" icon-baseui-delete"
            @click="
              () => {
                configFileList = [];
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
  </MyContent>
</template>
<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import lincesFileApi from '@/api/lincesFile';
  import { message } from 'ant-design-vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'LincesFile' });
  const { prefixCls } = useDesign('LincesFile-');
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
        width: 150,
        fixed: 'left',
      },
      {
        field: `${locale == 'zh-CN' ? 'nameCn' : locale == 'en-US' ? 'nameEn' : 'nameFr'}`,
        title: t('view.authorizationItemName'),
        showOverflow: true,
        width: locale == 'zh-CN' ? 340 : 400,
        fixed: 'left',
        sortable: true,
      },
      {
        field: 'value',
        title: t('view.authorizedQuantity'),
        showOverflow: true,
        sortable: true,
        minWidth: 186,
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
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const configFileList = ref([]);

  getLincesList();

  function showFrom() {
    configFileList.value = [];
    isShowForm.value = true;
  }

  //拖拽文件不符合 accept 类型时的回调
  function configFileReject() {
    message.warning(t('view.selectedFileTypeMismatch'));
  }
  //选择
  function configBeforeUpload(file) {
    const isLt5M = file.size / 1024 / 1024 < 1;
    if (
      file.name.indexOf('.') == -1 ||
      !['linces'].includes(file.name.split('.')[file.name.split('.').length - 1])
    ) {
      message.warning(t('view.selectedFileTypeMismatch'));
    } else if (!isLt5M) {
      message.error(t('view.softwarePackageShouldNotExceed', [1, file.name]));
    } else {
      if (
        !configFileList.value.find(
          (m) => m.name == file.name && m.size == file.size && m.type == file.type,
        )
      ) {
        configFileList.value = [file];
      } else {
        message.error(t('view.fileIsDuplicated', [file.name]));
      }
    }
    return false;
  }

  //删除
  function fileRemove(file) {
    configFileList.value = configFileList.value.filter((f) => f.uid != file.uid);
  }

  //关闭表单
  function formClose() {
    isShowForm.value = false;
  }

  //获取授权文件列表
  function getLincesList() {
    loading.value = true;
    lincesFileApi
      .GetLincesInfos()
      .then((data) => {
        loading.value = false;
        tableConfig.data = data;
      })
      .catch(() => {
        loading.value = false;
        tableConfig.data = [];
      });
  }

  //新增和编辑
  function saveFrom() {
    if (configFileList.value.length > 0) {
      fromSpinning.value = true;
      let _formData = new FormData();
      //多文件统一上传
      _formData.append('file', configFileList.value[0]);
      lincesFileApi
        .UpLoadLincesInfoFile(_formData)
        .then((data) => {
          fromSpinning.value = false;
          if (data) {
            configFileList.value = [];
            tableConfig.data = data;
            formClose();
            message.success(t('view.uploadAuthorizationFileSuccessfully'));
          } else {
            message.success(t('view.uploadAuthorizationFileFailed'));
          }
        })
        .catch(() => {
          fromSpinning.value = false;
        });
    } else {
      message.info(t('view.pleaseSelectAuthorizationFileBeforeUploading'));
    }
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-LincesFile-';

  .duration:deep(.ant-input-number-input) {
    width: 80px;
  }

  .tableBtn {
    width: 100%;
  }
</style>
