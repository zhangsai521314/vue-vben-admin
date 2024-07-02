<template>
  <MyContent :class="prefixCls">
    <a-space
      direction="horizontal"
      size="small"
      style="width: 100%; height: 48px; padding-left: 5px; background-color: #fff"
    >
      <AuthDom auth="performance_his_query">
        <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
          <div class="row-div">
            <a-space direction="horizontal" size="small" :wrap="true">
              <label>按键时间：</label>
              <a-config-provider :locale="zhCN">
                <a-range-picker
                  allowClear
                  v-model:value="timeValue"
                  :showTime="true"
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </a-config-provider>
            </a-space>
          </div>
          <div class="row-div">
            <a-space direction="horizontal" size="small" :wrap="true">
              <label>设备名称：</label>
              <a-select
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
              <a-button @click="initPage()" type="primary">查询</a-button>
            </a-space>
          </div>
        </a-space>
      </AuthDom>
    </a-space>
    <a-spin tip="加载中..." :spinning="loading">
      <a-tabs
        v-model:activeKey="activeKey"
        type="card"
        style="height: calc(100% - 48px)"
        @change="tabsChange"
        :class="`${prefixCls}tabs-content-bar`"
      >
        <a-tab-pane key="table" tab="表格查询">
          <vxe-grid
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
        <a-tab-pane key="echart" tab="历史曲线">
          <div v-show="isDataSource" :class="prefixCls" ref="chartRef" style="height: 100%"></div>
          <div style="height: 100%">
            <div style="height: 30px; padding-top: 20%; text-align: center"> 暂无数据 </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import myCommon from '@/utils/MyCommon/common';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode, nextTick, onMounted, watch, unref } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import performanceApi from '@/api/performance';
  import equipmentApi from '@/api/equipment';
  import { message, Modal } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';

  defineOptions({ name: 'PerformanceHis' });
  const { prefixCls } = useDesign('PerformanceHis-');
  const activeKey = ref('table');
  const loading = ref(false);
  const isDataSource = ref(false);
  const chartRef = ref();
  let baseColumns = [];
  let baseColumnsChart = [];
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
  const timeValue = ref(null);
  //   [
  //   dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
  //   dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  // ]
  const equipmentData = ref([]);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['dataTime desc'],
  });

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
      message.info('请选择设备后查询');
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
        PageSize: page.size,
        ...seacthContent.value,
        fullSort: getFullSort(),
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        assembylData(data);
      })
      .catch((e) => {
        assembylData(null);
      });
  }

  function assembylData(data) {
    baseColumns = [
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'keyId',
        title: '主键ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'cpuUsage',
        title: 'CPU使用率(%)',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'memorySize',
        title: '内存大小(G)',
        showOverflow: false,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'memoryUsage',
        title: '内存使用率(%)',
        showOverflow: false,
        showHeaderOverflow: true,
        sortable: true,
      },
    ];
    baseColumnsChart = ['cpuUsage', 'memoryUsage'];
    if (data) {
      page.total = data.totalCount;
      data.source.forEach((m) => {
        m.diskList.forEach((d) => {
          const col_u = `disku_${d.diskName}`;
          const col_s = `disks_${d.diskName}`;
          m[col_u] = d.diskUsage;
          m[col_s] = d.diskSize;
          if (!baseColumns.find((c) => c.field == col_s)) {
            baseColumns.push({
              field: col_s,
              title: `${d.diskName}盘大小(G)`,
              showOverflow: true,
              showHeaderOverflow: true,
              sortable: true,
            });
          }
          if (!baseColumns.find((c) => c.field == col_u)) {
            baseColumns.push({
              field: col_u,
              title: `${d.diskName}盘使用率(%)`,
              showOverflow: true,
              showHeaderOverflow: true,
              sortable: true,
            });
            baseColumnsChart.push(col_u);
          }
        });
        delete m.diskList;
      });
      isDataSource.value = true;
      tableConfig.data = data.source;
      if (activeKey.value == 'echart') {
        handleEchar(data.source);
      }
    } else {
      isDataSource.value = false;
      tableConfig.data = [];
      page.total = 0;
    }
    baseColumns.push({
      field: 'dataTime',
      title: '数据时间',
      width: 150,
      showOverflow: true,
      showHeaderOverflow: true,
      sortable: true,
    });
    tableConfig.columns = baseColumns;
  }

  function handleEchar(dataSource) {
    if (dataSource.length > 0) {
      dataSource = _.sortBy(dataSource, (m) => m.dataTime);
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
            start: 0,
            end: 100,
          },
          {
            type: 'inside',
            realtime: true,
            start: 0,
            end: 100,
          },
        ],
        legend: {
          data: ['cpu使用率(%)', '内存使用率(%)'],
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
            name: 'cpu使用率(%)',
            field: 'cpuUsage',
            type: 'line',
            data: [],
            color: '#84C8DD',
            smooth: 0.2,
          },
          {
            name: '内存使用率(%)',
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
        const n = `磁盘${m.split('_')[1]}使用率(%)`;
        if (m.indexOf('disku_') != -1 && !option.legend.data.find((m) => m == n)) {
          option.legend.data.push(n);
          option.series.push({
            name: n,
            field: m,
            type: 'line',
            data: [],
            symbol: 'none',
            // color: '#9ADC69',
            smooth: 0.2,
          });
        }
      });

      baseColumnsChart.forEach((m) => {
        const data = option.series.find((n) => n.field == m);
        dataSource.forEach((d) => {
          data.data.push([d.dataTime, d[m]]);
        });
      });
      getInstance().setOption(option, true);
    }
  }

  function handlePageChange() {
    getPerformances();
  }

  function tabsChange(key) {
    if (key == 'echart') {
      nextTick(() => {
        handleEchar();
      });
    } else {
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
