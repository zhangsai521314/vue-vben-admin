<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      @sort-change="onSortChange"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="ddServcer_dcStatus_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <!-- <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>线路名称：</label>
                      <a-select
                        style="width: 170px"
                        allow-clear
                        show-search
                        :filter-option="AntVueCommon.filterOption"
                        v-model:value="seacthContent.lineCode"
                        :options="lineDatas"
                      />
                    </a-space>
                  </div> -->
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>登录时间：</label>
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
                    <label>车站名称：</label>
                    <a-select
                      placeholder="请选择车站名称"
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.stationCode"
                      :options="stationDatas"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>ISDN：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.isdn"
                      placeholder="输入ISDN号查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>类型：</label>
                    <a-select
                      placeholder="请选择类型"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent._type"
                    >
                      <a-select-option :value="1">调度台</a-select-option>
                      <a-select-option :value="2">车站值班台</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <!-- <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>注册状态：</label>
                    <a-select
                      placeholder="请选择注册状态"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.regStatus"
                    >
                      <a-select-option :value="1">注册</a-select-option>
                      <a-select-option :value="2">手动注销</a-select-option>
                      <a-select-option :value="3">超时注销</a-select-option>
                      <a-select-option :value="4">强制注销</a-select-option>
                    </a-select>
                  </a-space>
                </div> -->
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">查询</a-button>
                    <a-button @click="resetSeacth">重置表单</a-button>
                    <a-radio-group v-model:value="refresh" button-style="solid">
                      <a-radio-button value="yes">开启自动刷新</a-radio-button>
                      <a-radio-button value="no">关闭自动刷新</a-radio-button>
                      <a-radio-button value="time" disabled>{{ refreshTime }}秒</a-radio-button>
                    </a-radio-group>
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
      <template #ipport="{ row }"> {{ row.ip }}{{ row.port ? ':' + row.port : '' }} </template>
      <template #regStatusName="{ row }">
        <span :style="{ color: row.regStatusName == '启用' ? 'green' : 'red' }"
          >{{ row.regStatusName }}
        </span></template
      >
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { DCStatus as dcStatusApi, Line as lineApi, Station as stationApi } from '@/api/ddServcer';
  import { tryOnUnmounted } from '@vueuse/core';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import 'dayjs/locale/zh-cn';

  defineOptions({ name: 'DDServcerDCStatus' });
  const { prefixCls } = useDesign('DDServcerDCStatus-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'id',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'lineName',
        title: '线路名称',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'stationCode',
        title: '线路/车站代码',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'stationName',
        title: '所属线路/车站',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'isdn',
        title: 'ISDN',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'typeName',
        title: '类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        width: 120,
      },
      //20240603-郭彦军指示不显示
      // {
      //   field: 'regStatusName',
      //   title: '注册状态',
      //   showOverflow: true,
      //   showHeaderOverflow: true,
      //   sortable: true,
      //   // slots: {
      //   //   default: 'regStatusName',
      //   // },
      // },
      {
        field: 'ip',
        title: 'Ip+端口号',
        showOverflow: true,
        showHeaderOverflow: true,
        slots: {
          default: 'ipport',
        },
        sortable: true,
      },
      {
        field: 'loginTime',
        title: '登录时间',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'updateTime',
        title: '心跳时间',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      // {
      //   title: '操作',
      //   width: 140,
      //   slots: {
      //     default: 'default',
      //   },
      //   showOverflow: true,
      //   showHeaderOverflow: true,
      //   fixed: 'right',
      // },
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
  const myContentRef = ref({});
  const timeValue = ref(null);
  const seacthContent = ref({
    lineCode: null,
    stationCode: null,
    isdn: null,
    startTime: null,
    endTime: null,
    _type: null,
    regStatus: null,
  });
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['loginTime desc'],
  });
  const refresh = ref('yes');
  const refreshTime = ref(10);
  let refreshTimeId;
  const lineDatas = ref([]);
  const stationDatas = ref([]);

  getStatus(true);
  getDDServerStationCodeSimple();
  getDDServerLineCodeSimple();

  //获取列表
  function getStatus(isAuto = false) {
    if (!isAuto) {
      refresh.value = 'no';
    }
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    loading.value = true;
    dcStatusApi
      .GetDDCirStatus({
        PageIndex: page.current,
        PageSize: page.size,
        fullSort: getFullSort(),
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfig.data = data.source;
        page.total = data.totalCount;
        page.current = data.pageIndex;
        refreshData();
      })
      .catch(() => {
        tableConfig.data = [];
        page.total = 0;
        refreshData();
      });
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      lineCode: null,
      stationCode: null,
      isdn: null,
      startTime: null,
      endTime: null,
      _type: null,
      regStatus: null,
    };
    timeValue.value = null;
  }

  function handlePageChange() {
    getStatus();
  }

  /**
   * 排序条件改变
   */
  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getStatus(false);
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

  function refreshData() {
    if (refresh.value == 'yes') {
      refreshTimeId = setTimeout(() => {
        if (refreshTime.value <= 0) {
          refreshTime.value = 10;
          nextTick(() => {
            getStatus(true);
          });
        } else {
          refreshTime.value = refreshTime.value - 1;
          nextTick(() => {
            refreshData();
          });
        }
      }, 1000);
    }
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getStatus();
  }

  function stopRefresh() {
    clearTimeout(refreshTimeId);
    refresh.value = 'no';
    refreshTime.value = 10;
  }

  function getDDServerStationCodeSimple() {
    stationApi.GetDDServerStationCodeSimple().then((data) => {
      stationDatas.value = data;
    });
  }

  function getDDServerLineCodeSimple() {
    lineApi.GetDDServerLineCodeSimple().then((data) => {
      lineDatas.value = data;
    });
  }

  watch(
    () => refresh.value,
    () => {
      if (refresh.value == 'yes') {
        refreshData();
      } else {
        stopRefresh();
      }
    },
  );

  //页面卸载后
  tryOnUnmounted(() => {
    stopRefresh();
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerDCStatus-';

  .tableBtn {
    width: 100%;
  }
</style>
