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
      @sort-change="onSortChange"
      :row-config="{ keyField: 'lincesId' }"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
    >
      <template #pager>
        <vxe-pager
          background
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="page.total"
          @page-change="getLincesList()"
        />
      </template>
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="lincesFile_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.equipmentNumber') }}：</label>
                    <a-input
                      @press-enter="initPage"
                      v-model:value="seacthContent.equipmentCode"
                      :placeholder="t('view.queryByInputtingEquipmentNumber')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-input-number
                      class="duration"
                      @press-enter="initPage()"
                      v-model:value="remainingDays"
                      :min="0"
                      :max="3000"
                      :placeholder="t('view.day')"
                    >
                      <template #addonBefore>
                        <a-select
                          v-model:value="durationQueryType"
                          :style="{ width: locale == 'zh-CN' ? '130px' : '160px' }"
                        >
                          <a-select-option :value="3"
                            >{{ t('view.remainingDays') }}{{ '>=' }}</a-select-option
                          >
                          <a-select-option :value="5"
                            >{{ t('view.remainingDays') }}{{ '<=' }}</a-select-option
                          >
                        </a-select>
                      </template>
                    </a-input-number>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getLincesList" type="primary">{{ t('view.query') }}</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="lincesFile_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">{{
                      t('view.addOrUpdateAuthorization')
                    }}</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="lincesFile_down">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-spin :spinning="downLinceSourceSpinning">
                      <a-button class="ant-btn" @click="downLinceSource" type="primary">{{
                        t('view.downloadDeviceInformation')
                      }}</a-button>
                    </a-spin>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #remainingDays="{ row }">
        <span
          :style="{
            fontSize: '20px',
            fontWeight: 500,
            color: row.remainingDays <= 0 ? 'red' : row.remainingDays <= 30 ? '#adad00' : 'green',
          }"
          >{{ row.remainingDays <= 0 ? t('view.hasExpired') : row.remainingDays }}</span
        >
      </template>
      <template #bindClientType="{ row }">
        {{ t('view.' + row.bindClientType) }}
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="locale == 'zh-CN' ? 500 : 540"
      :visible="isShowForm"
      :title="t('view.configuration')"
      :footer-style="{ textAlign: 'right' }"
      @close="formClose"
    >
      <a-form
        :label-col="{ span: locale == 'zh-CN' ? 6 : 8 }"
        :style="{ paddingRight: '2px' }"
        autocomplete="off"
        ref="formRef"
      >
        <a-form-item name="lincesFilePaths" :label="t('view.authorizationFile')">
          <a-upload
            :fileList="configFileList"
            :maxCount="100"
            name="files"
            :multiple="true"
            accept=".pem"
            :before-upload="configBeforeUpload"
            @reject="configFileReject"
            @remove="fileRemove"
          >
            <div>
              <a-input
                style="width: 300px; cursor: pointer"
                :placeholder="t('view.clickToSelectAuthorizationFile')"
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
        field: 'lincesId',
        title: t('view.recordId'),
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        visible: false,
        fixed: 'left',
        sortable: true,
      },
      {
        field: 'equipmentCode',
        title: t('view.equipmentNumber'),
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 136 : 180,
        fixed: 'left',
        sortable: true,
      },
      {
        field: 'fileName',
        title: t('view.fileName'),
        showOverflow: true,
        sortable: true,
        minWidth: 186,
      },
      {
        field: 'timeValid',
        title: t('view.validityPeriod'),
        showOverflow: true,
        sortable: true,
        minWidth: 160,
      },
      {
        field: 'remainingDays',
        title: t('view.remainingDays'),
        minWidth: 200,
        showOverflow: true,
        sortable: true,
        slots: {
          default: 'remainingDays',
        },
      },
      {
        field: 'lastGetTime',
        title: t('view.getTime'),
        minWidth: 210,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'getCount',
        title: t('view.acquisitionTimes'),
        minWidth: 220,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'createTime',
        title: t('view.creationTime'),
        minWidth: 150,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'createUserName',
        title: t('view.creator'),
        minWidth: 130,
        showOverflow: true,
        sortable: true,
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
        minWidth: 176,
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
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['equipmentCode asc'],
  });
  const seacthContent = ref({
    equipmentCode: null,
    SearchParameters: [],
  });
  const durationQueryType = ref(5);
  const remainingDays = ref(null);
  const downLinceSourceSpinning = ref(false);

  getLincesList();

  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getLincesList();
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getLincesList();
  }

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
    if (!isLt5M) {
      message.error(t('view.softwarePackageShouldNotExceed', [1, file.name]));
    } else {
      if (
        !configFileList.value.find(
          (m) => m.name == file.name && m.size == file.size && m.type == file.type,
        )
      ) {
        configFileList.value.push(file);
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

  function getFullSort() {
    let fullsort = '';
    page.sortlist.forEach((item) => {
      fullsort += item + ',';
    });
    return fullsort.substring(0, fullsort.length - 1);
  }

  //获取授权文件列表
  function getLincesList() {
    loading.value = true;
    if (!myCommon.isnull(remainingDays.value)) {
      seacthContent.value.SearchParameters = [
        {
          CSharpTypeName: 'int',
          FieldName: 'RemainingDays',
          ConditionalType: durationQueryType.value,
          FieldValue: remainingDays.value,
        },
      ];
    } else {
      seacthContent.value.SearchParameters = [];
    }
    lincesFileApi
      .GetLincesList({
        PageIndex: page.current,
        PageSize: page.size,
        ...seacthContent.value,
        fullSort: getFullSort(),
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfig.data = data.source;
        page.total = data.totalCount;
        page.current = data.pageIndex;
      })
      .catch(() => {
        tableConfig.data = [];
      });
  }

  //新增和编辑
  function saveFrom() {
    if (configFileList.value.length > 0) {
      fromSpinning.value = true;
      let _formData = new FormData();
      configFileList.value.forEach((file) => {
        //多文件统一上传
        _formData.append('files', file);
      });
      lincesFileApi
        .AddOrUpdateLinces(_formData)
        .then((data) => {
          fromSpinning.value = false;
          if (data) {
            configFileList.value = [];
            getLincesList();
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

  function downLinceSource() {
    downLinceSourceSpinning.value = true;
    lincesFileApi
      .DownLincesSourceFile({
        execompleteBefore: () => {
          downLinceSourceSpinning.value = false;
        },
      })
      .then((data) => {
        debugger;
        myCommon.downLoadFile(data);
      })
      .catch((e) => {
        debugger;
      });
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
