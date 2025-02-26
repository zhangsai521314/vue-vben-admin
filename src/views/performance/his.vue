<template>
  <MyContent :class="prefixCls">
    <a-space
      direction="horizontal"
      size="small"
      style="width: 100%; min-height: 34px; padding: 7px 0 7px 5px; background-color: #fff"
    >
      <AuthDom auth="performance_his_query">
        <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
          <div class="row-div">
            <a-space direction="horizontal" size="small" :wrap="true">
              <label>{{ t('view.dataTime') }}：</label>
              <a-config-provider :locale="zhCN">
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
              <label>{{ t('view.deviceName') }}：</label>
              <a-select
                :placeholder="t('view.pleaseSelectADeviceToQuery')"
                style="width: 170px"
                allow-clear
                show-search
                :filter-option="AntVueCommon.filterOption"
                v-model:value="seacthContent.equipmentId"
                :options="equipmentData"
              />
            </a-space>
          </div>
          <div class="row-div">
            <a-space direction="horizontal" size="small" :wrap="true">
              <a-button @click="initPage()" type="primary">{{ t('view.query') }}</a-button>
            </a-space>
          </div>
        </a-space>
      </AuthDom>
    </a-space>
    <a-spin :spinning="loading">
      <a-tabs
        v-model:activeKey="activeKey"
        type="card"
        style="height: calc(100% - 48px)"
        @change="tabsChange"
        :class="`${prefixCls}tabs-content-bar`"
      >
        <a-tab-pane key="table" :tab="t('view.tableQuery')">
          <vxe-grid
            :scroll-y="{ enabled: true }"
            :auto-resize="true"
            id="performance_his_table"
            v-bind="tableConfig"
            ref="tableRef"
            :seq-config="{ startIndex: (page.current - 1) * page.size }"
            :row-config="{ keyField: 'keyId' }"
            :column-config="{ resizable: true }"
            :custom-config="{ storage: true }"
            @sort-change="onSortChange"
          >
            <template #toolbar_buttons>
              <div :class="`tableBtn`"> </div>
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
        </a-tab-pane>
        <a-tab-pane key="echart" :tab="t('view.historicalCurve')">
          <div v-show="isDataSource" :class="prefixCls" ref="chartRef" style="height: 100%"></div>
          <div style="height: 100%" v-show="!isDataSource">
            <div style="height: 30px; padding-top: 20%; text-align: center">
              {{ t('view.noDataAvailable') }}
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import performanceApi from '@/api/performance';
  import equipmentApi from '@/api/equipment';
  import { message } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'PerformanceHis' });
  const { prefixCls } = useDesign('PerformanceHis-');
  const activeKey = ref('table');
  const loading = ref(false);
  const isDataSource = ref(false);
  const chartRef = ref();
  let baseColumns = [];
  let baseColumnsChart = [];
  const diskColor = [
    '#70FB09',
    '#5BCA09',
    '#429208',
    '#477A22',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
    '#2C6005',
  ];
  const { getInstance, resize, setOptions, echarts } = useECharts(chartRef);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [],
    // toolbarConfig: {
    //   custom: true,
    //   slots: {
    //     buttons: 'toolbar_buttons',
    //   },
    // },
    data: [],
  });
  const tableRef = ref({});
  const seacthContent = ref({
    equipmentId: null,
    startTime: null,
    endTime: null,
  });
  const timeValue = ref([
    dayjs(dayjs().add(0, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);
  const equipmentData = ref([]);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['dataTime desc'],
  });
  const diskNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'i', 'j'];
  getEquipments();

  /**
   * 排序条件改变
   */
  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getPerformances();
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getPerformances();
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
  function getPerformances() {
    if (seacthContent.value.equipmentId == null) {
      message.info(t('view.pleaseSelectADeviceToQuery'));
      return;
    }
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    performanceApi
      .GetPerformances({
        PageIndex: page.current,
        PageSize: activeKey.value == 'table' ? page.size : -1,
        ...seacthContent.value,
        fullSort: activeKey.value == 'table' ? getFullSort() : '',
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        assembylData(data);
      })
      .catch((e) => {
        assembylData({ source: [] });
      });
  }

  function assembylData(data) {
    if (data.source.length > 0) {
      baseColumns = [
        {
          type: 'seq',
          title: t('view.serialNumber'),
          minWidth: locale == 'zh-CN' ? 70 : 160,
          fixed: 'left',
        },
        {
          field: 'keyId',
          title: t('view.recordId'),
          sortable: true,
          visible: false,
          showOverflow: true,
          fixed: 'left',
          minWidth: locale == 'zh-CN' ? 130 : 150,
        },
        {
          field: 'cpuUsage',
          title: `${t('view.cpuUsageRate')}(%)`,
          showOverflow: true,
          sortable: false,
          minWidth: 110,
        },
        {
          field: 'memorySize',
          title: `${t('view.memorySize')}(G)`,
          showOverflow: false,
          sortable: false,
          minWidth: 110,
        },
        {
          field: 'memoryUsage',
          title: `${t('view.memoryUsageRate')}(%)`,
          showOverflow: false,
          sortable: false,
          minWidth: 110,
        },
      ];
      baseColumnsChart = [
        {
          name: `${t('view.cpuUsageRate')}(%)`,
          col: 'cpuUsage',
          color: '#84C8DD',
        },
        {
          name: `${t('view.memoryUsageRate')}(%)`,
          col: 'memoryUsage',
          color: '#CB88DE',
        },
      ];
      page.total = data.totalCount;
      page.current = data.pageIndex;
      diskNames.forEach((col) => {
        ['DiskSize', 'DiskUsage'].forEach((d) => {
          const name = col + d;
          if (data.source.filter((m) => m[col + d] != null).length > 0) {
            if (d == 'DiskSize') {
              baseColumns.push({
                field: name,
                title: `${col}${t('view.driveSize')}(G)`,
                showOverflow: true,
                sortable: false,
                minWidth: 110,
              });
            } else {
              baseColumns.push({
                field: name,
                title: `${col}${t('view.driveUsage')}(%)`,
                showOverflow: true,
                sortable: false,
                minWidth: 110,
              });
              baseColumnsChart.push({
                name: `${col}${t('view.driveUsage')}(%)`,
                col: name,
                color: diskColor[baseColumnsChart.length - 2],
              });
            }
          }
        });
      });
      if (activeKey.value == 'echart') {
        tableConfig.data = [];
        page.total = 0;
        handleEchar(data.source);
      } else {
        isDataSource.value = false;
        baseColumns.push({
          field: 'dataTime',
          title: t('view.dataTime'),
          minWidth: 170,
          showOverflow: true,

          sortable: true,
        });
        tableConfig.data = data.source;
        tableConfig.columns = baseColumns;
      }
    } else {
      isDataSource.value = false;
      tableConfig.data = [];
      page.total = 0;
    }
  }

  function handleEchar(dataSource) {
    isDataSource.value = true;
    // 想显示成几条那么就把6改成几就可以了，dataAxis是横坐标的长度(倒序排列)
    let start = 0;
    let end = 100;
    if (dataSource.length > 100) {
      start = dataSource.length - 100;
      end = dataSource.length - 1;
    }
    const option = {
      backgroundColor: '#fff',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      dataZoom: [
        {
          show: false,
          realtime: true,
          startValue: start,
          endValue: end,
        },
        {
          type: 'inside',
          startValue: start,
          endValue: end,
        },
        {
          type: 'slider',
          startValue: start,
          endValue: end,
        },
      ],
      legend: {
        data: [],
        icon: 'rectangle',
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          formatter: function (parm) {
            let time = dayjs(parm).format('YYYY-MM-DD HH:mm:ss');
            if (time.indexOf(' ' != -1)) {
              return time.substring(5, 10) + '\r\n' + time.substring(10, parm.length);
            }
            return time;
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          symbol: 'none',
          name: `${t('view.cpuUsageRate')}(%)`,
          field: 'cpuUsage',
          type: 'line',
          data: [],
          color: '#84C8DD',
          smooth: 0.2,
        },
        {
          name: `${t('view.memoryUsageRate')}(%)`,
          field: 'memoryUsage',
          type: 'line',
          data: [],
          symbol: 'none',
          color: '#CB88DE',
          smooth: 0.2,
        },
      ],
    };
    baseColumnsChart.forEach((m) => {
      option.legend.data.push(m.name);
      option.series.push({
        name: m.name,
        field: m.col,
        type: 'line',
        data: [],
        symbol: 'none',
        color: m.color,
        smooth: 0.2,
      });
    });
    baseColumnsChart.forEach((m) => {
      const data = option.series.find((n) => n.field == m.col);
      dataSource.forEach((d) => {
        data.data.push([d.dataTime, d[m.col]]);
      });
    });
    getInstance().setOption(option, true);
  }

  function handlePageChange() {
    getPerformances();
  }

  function tabsChange(key) {
    if (key != 'echart') {
      tableRef.value.reloadData(tableConfig.data);
    }
  }

  //获取设备
  function getEquipments() {
    equipmentApi
      .GetEquipmentSimple({})
      .then((data) => {
        equipmentData.value = data;
      })
      .catch(() => {
        equipmentData.value = [];
      });
  }
</script>
<style lang="less" scoped>
  .div-content-height-header {
    height: calc(100vh - 66px) !important;
  }
  @prefixCls: ~'@{namespace}-PerformanceHis-';

  .@{prefixCls} {
    .row-div {
      height: 30px;
    }

    :deep(.ant-spin-nested-loading) {
      height: calc(100% - 30px);
    }

    .@{prefixCls}tabs-content-bar {
      :deep(.ant-tabs-nav-wrap) {
        background: #f5f5f5;
      }

      :deep(.ant-tabs-content) {
        height: 100%;
      }

      :deep(.ant-tabs-tabpane) {
        height: 100%;
      }
    }

    .tableBtn {
      width: 100%;
    }

    :deep(.ant-tabs-nav) {
      margin-bottom: -1px !important;
    }

    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }
  .@{prefixCls}play {
    width: 100%;
    height: 370px;
  }
</style>
