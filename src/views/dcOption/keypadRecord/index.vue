<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      :auto-resize="true"
      id="ddServcerKeypadRecord"
      ref="tableRef"
      :loading="loading"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
      :row-config="{ keyField: 'keyId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      @sort-change="onSortChange"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="dcOption_keypadRecord_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.keyPressTime') }}：</label>
                     <a-config-provider
                    :locale="locale == 'fr-FR' ? frFR : locale == 'en-US' ? enUS : zhCN"
                  >
                      <a-range-picker
                        :allowClear="false"
                        v-model:value="timeValue"
                        :showTime="true"
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </a-config-provider>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.softwareName') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectServiceName')"
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.serviceId"
                      :options="serviceData"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">{{ t('view.query') }}</a-button>
                    <a-spin :spinning="exportDataSpinning">
                      <a-button @click="exportData" type="primary">{{ t('view.export') }}</a-button>
                    </a-spin>
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
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="ts">
  import myCommon from '@/utils/MyCommon/common';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { KeypadRecord as keypadRecordApi } from '@/api/dcOption';
  import serviceApi from '@/api/software';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import enUS from 'ant-design-vue/es/locale/en_US';
  import frFR from 'ant-design-vue/es/locale/fr_FR';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DCOptionKeypadRecord' });
  const { prefixCls } = useDesign('keypadRecord-');
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
        fixed: 'left',
      },
      {
        field: 'keyId',
        title: t('view.recordId'),
        visible: false,
        sortable: true,
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'serviceCode',
        title: t('view.serviceNumber'),
        visible: false,
        showOverflow: true,
        sortable: true,
        minWidth: 160,
        fixed: 'left',
      },
      {
        field: 'serviceName',
        title: t('view.softwareName'),
        showOverflow: true,

        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'content',
        title: t('view.keyPressContent'),
        showOverflow: false,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 200 : 256,
      },
      {
        field: 'startTime',
        title: t('view.keyPressStartTime'),
        minWidth: locale == 'zh-CN' ? 150 : 220,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'endTime',
        title: t('view.keyPressEndTime'),
        minWidth: locale == 'zh-CN' ? 150 : 200,
        showOverflow: true,
        sortable: true,
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
  const tableRef = ref({});
  const seacthContent = ref({
    serviceId: null,
    startTime: null,
    endTime: null,
  });
  const timeValue = ref([
    dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);
  const serviceData = ref([]);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['endTime desc'],
  });
  const exportDataSpinning = ref(false);

  getDCOptionKeyRecords();
  getServices();

  /**
   * 排序条件改变
   */
  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getDCOptionKeyRecords();
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

  //获取列表
  function getDCOptionKeyRecords() {
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    keypadRecordApi
      .GetDCOptionKeypadRecords({
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
        page.total = 0;
      });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDCOptionKeyRecords();
  }

  function handlePageChange() {
    getDCOptionKeyRecords();
  }

  //获取服务列表
  function getServices() {
    serviceApi
      .GetServicesSimple({ serviceType: ['DCOption'] })
      .then((data) => {
        serviceData.value = data;
      })
      .catch(() => {
        serviceData.value = [];
      });
  }

  function exportData() {
    // exportDataSpinning.value = true;
    // seacthContent.value.startTime =
    //   timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    // seacthContent.value.endTime =
    //   timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    // keypadRecordApi
    //   .ExportData({
    //     PageIndex: page.current,
    //     PageSize: page.size,
    //     ...seacthContent.value,
    //     fullSort: getFullSort(),
    //     execompleteBefore: () => {
    //       exportDataSpinning.value = false;
    //     },
    //   })
    //   .then((data) => {
    //     myCommon.downLoadFile(data);
    //   });
    const $table = tableRef.value;
    if ($table) {
      $table.exportData({
        filename: `按键记录信息导出${dayjs().format('YYYYMMDDHHmmss')}`,
        type: 'xlsx',
        excludeFields: ['seq_', 'action_'],
      });
    }
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-keypadRecord-';

  .@{prefixCls} {
    .row-div {
      height: 30px;
    }

    .tableBtn {
      width: 100%;
    }
  }
  .@{prefixCls}play {
    width: 100%;
    height: 370px;
  }
</style>
